#!/usr/bin/env python3
"""Local server for the Interactive Python Trainer.

Serving the app this way (instead of double-clicking the HTML) lets each
student's work auto-save into their own folder: students/<Name>/progress.json.

Run:
    python server.py
  or double-click start_trainer.bat  (Windows)

Then open the printed URL (it also opens automatically). Stop with Ctrl+C.
Uses only the Python standard library — no packages to install.
"""

import atexit
import json
import os
import re
import shutil
import urllib.error
import urllib.request
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"

BASE = os.path.dirname(os.path.abspath(__file__))
STUDENTS = os.path.join(BASE, "students")
HOST = "127.0.0.1"
PORT = 8000
MAX_BODY = 5 * 1024 * 1024   # reject request bodies larger than 5 MB (local DoS guard)

# Defense-in-depth headers. The CSP allows only our own files, the pinned CDNs
# (CodeMirror, marked, DOMPurify, Pyodide), the Blob-based Web Worker, and WASM.
CSP = (
    "default-src 'self'; "
    "script-src 'self' 'wasm-unsafe-eval' blob: https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; "
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; "
    "img-src 'self' data:; font-src 'self'; "
    "connect-src 'self' https://cdn.jsdelivr.net; "
    "worker-src blob:; object-src 'none'; base-uri 'self'; "
    "form-action 'self'; frame-ancestors 'none'"
)

_UNSAFE = re.compile(r"[^A-Za-z0-9 ._-]+")


def safe_name(name):
    """Sanitize a student name into a safe single folder name (no traversal)."""
    name = _UNSAFE.sub("", (name or "").strip()).strip(". ")
    if not name or name in (".", ".."):
        return None
    return name


def student_dir(name):
    s = safe_name(name)
    return os.path.join(STUDENTS, s) if s else None


def list_students():
    out = []
    if os.path.isdir(STUDENTS):
        for entry in sorted(os.listdir(STUDENTS)):
            if os.path.isdir(os.path.join(STUDENTS, entry)):
                out.append({"id": entry, "name": entry})
    return out


# ---- API key: from the ANTHROPIC_API_KEY env var, or a local .env file --------
ENV_FILE = os.path.join(BASE, ".env")


def _read_env_file():
    vals = {}
    try:
        with open(ENV_FILE, encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                vals[k.strip()] = v.strip().strip('"').strip("'")
    except OSError:
        pass
    return vals


def get_api_key():
    # A real environment variable wins; otherwise use the browser-saved .env file.
    return (os.environ.get("ANTHROPIC_API_KEY", "").strip()
            or _read_env_file().get("ANTHROPIC_API_KEY", "").strip())


def write_env_key(value):
    """Set/replace (or, if value is empty, remove) ANTHROPIC_API_KEY in .env,
    preserving any other lines."""
    try:
        with open(ENV_FILE, encoding="utf-8") as fh:
            lines = fh.read().splitlines()
    except OSError:
        lines = []
    out, found = [], False
    for line in lines:
        if line.strip().replace(" ", "").startswith("ANTHROPIC_API_KEY="):
            found = True
            if value:
                out.append("ANTHROPIC_API_KEY=" + value)
            # empty value -> drop the line
        else:
            out.append(line)
    if value and not found:
        out.append("ANTHROPIC_API_KEY=" + value)
    with open(ENV_FILE, "w", encoding="utf-8") as fh:
        fh.write(("\n".join(out) + "\n") if out else "")


CTYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".ico": "image/x-icon",
}

# Only these files are served over HTTP. Source code, student data (students/,
# progress.json), and the .server.pid file are never exposed — all student data
# is read/written through the /api endpoints instead.
STATIC_FILES = {"python_trainer.html", "app.js", "curriculum.js", "styles.css"}


class Handler(BaseHTTPRequestHandler):
    # -- helpers --------------------------------------------------------------
    def _json(self, obj, code=200):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def end_headers(self):
        # Security headers on every response (static, JSON, and the tutor stream).
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Content-Security-Policy", CSP)
        super().end_headers()

    def _too_big(self):
        length = int(self.headers.get("Content-Length", 0) or 0)
        if length > MAX_BODY:
            self._json({"error": "request too large"}, 413)
            return True
        return False

    def _guard(self):
        # Block cross-origin (CSRF) and DNS-rebinding requests: only our own
        # localhost origin/host may reach the server. Same-origin app requests
        # (and curl, which sends no Origin) pass; a page on another site does not.
        ok_hosts = ("127.0.0.1:%d" % PORT, "localhost:%d" % PORT)
        ok_origins = ("http://127.0.0.1:%d" % PORT, "http://localhost:%d" % PORT)
        host = (self.headers.get("Host") or "").lower()
        if host and host not in ok_hosts:
            self._json({"error": "forbidden host"}, 403)
            return False
        origin = self.headers.get("Origin")
        if origin and origin.lower() not in ok_origins:
            self._json({"error": "cross-origin request blocked"}, 403)
            return False
        return True

    def _read_body(self):
        length = int(self.headers.get("Content-Length", 0) or 0)
        if length <= 0:
            return {}
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except Exception:
            return {}

    def _query_student(self):
        qs = parse_qs(urlparse(self.path).query)
        return (qs.get("student") or [""])[0]

    # -- routes ---------------------------------------------------------------
    def do_GET(self):
        if not self._guard():
            return
        path = urlparse(self.path).path
        if path == "/api/ping":
            # hasKey tells the browser whether a key is configured (env var or .env)
            return self._json({"ok": True, "hasKey": bool(get_api_key())})
        if path == "/api/students":
            return self._json(list_students())
        if path == "/api/progress":
            d = student_dir(self._query_student())
            if not d:
                return self._json({"error": "bad student"}, 400)
            f = os.path.join(d, "progress.json")
            if os.path.isfile(f):
                try:
                    with open(f, "r", encoding="utf-8") as fh:
                        return self._json(json.load(fh))
                except Exception:
                    return self._json({})
            return self._json({})
        return self._serve_static(path)

    def _save_progress(self):
        d = student_dir(self._query_student())
        if not d:
            return self._json({"error": "bad student"}, 400)
        os.makedirs(d, exist_ok=True)
        with open(os.path.join(d, "progress.json"), "w", encoding="utf-8") as fh:
            json.dump(self._read_body(), fh, indent=2)
        return self._json({"ok": True})

    def _set_key(self):
        key = (self._read_body().get("key") or "").strip()
        try:
            write_env_key(key)
        except OSError as e:
            return self._json({"error": {"message": "Could not write .env: " + str(e)}}, 500)
        return self._json({"ok": True, "hasKey": bool(get_api_key())})

    def do_POST(self):
        if not self._guard():
            return
        if self._too_big():
            return
        path = urlparse(self.path).path
        if path == "/api/key":          # browser saves the key into .env (server-side)
            return self._set_key()
        if path == "/api/tutor":
            return self._proxy_tutor()
        if path == "/api/progress":     # navigator.sendBeacon uses POST for the final save
            return self._save_progress()
        if path == "/api/students":
            d = student_dir(self._read_body().get("name"))
            if not d:
                return self._json({"error": "bad name"}, 400)
            os.makedirs(d, exist_ok=True)
            name = os.path.basename(d)
            return self._json({"id": name, "name": name})
        return self._json({"error": "not found"}, 404)

    def do_PUT(self):
        if not self._guard():
            return
        if self._too_big():
            return
        if urlparse(self.path).path == "/api/progress":
            return self._save_progress()
        return self._json({"error": "not found"}, 404)

    def do_DELETE(self):
        if not self._guard():
            return
        if urlparse(self.path).path == "/api/students":
            d = student_dir(self._query_student())
            if not d or not os.path.isdir(d):
                return self._json({"error": "not found"}, 404)
            shutil.rmtree(d, ignore_errors=True)
            return self._json({"ok": True})
        return self._json({"error": "not found"}, 404)

    # -- tutor proxy (keeps the API key server-side, in an env var) -----------
    def _proxy_tutor(self):
        key = get_api_key()
        length = int(self.headers.get("Content-Length", 0) or 0)
        raw = self.rfile.read(length) if length > 0 else b"{}"
        if not key:
            return self._json({"error": {"message":
                "No API key is configured on the server. Enter one with the "
                "API Key button, or set the ANTHROPIC_API_KEY environment variable."}}, 400)
        req = urllib.request.Request(
            ANTHROPIC_URL, data=raw, method="POST",
            headers={
                "content-type": "application/json",
                "x-api-key": key,
                "anthropic-version": "2023-06-01",
            },
        )
        try:
            upstream = urllib.request.urlopen(req, timeout=120)
        except urllib.error.HTTPError as e:          # forward Anthropic's error body
            body = e.read()
            self.send_response(e.code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
            return
        except Exception as e:
            return self._json({"error": {"message": "Could not reach api.anthropic.com: " + str(e)}}, 502)
        # stream the SSE response straight through to the browser
        self.send_response(200)
        self.send_header("Content-Type", upstream.headers.get("Content-Type", "text/event-stream"))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        try:
            while True:
                chunk = upstream.read(2048)
                if not chunk:
                    break
                self.wfile.write(chunk)
                self.wfile.flush()
        except Exception:
            pass
        finally:
            upstream.close()

    # -- static files ---------------------------------------------------------
    def _serve_static(self, path):
        if path in ("/", ""):
            path = "/python_trainer.html"
        name = path.lstrip("/")
        if name not in STATIC_FILES:      # whitelist — nothing else is exposed
            return self._json({"error": "not found"}, 404)
        full = os.path.join(BASE, name)
        if not os.path.isfile(full):
            return self._json({"error": "not found"}, 404)
        ctype = CTYPES.get(os.path.splitext(full)[1].lower(), "application/octet-stream")
        try:
            with open(full, "rb") as fh:
                data = fh.read()
        except Exception:
            return self._json({"error": "read error"}, 500)
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, *args):
        pass  # keep the console quiet


def _write_pid_file():
    # Lets stop_trainer.bat find and stop a windowless (pythonw) server.
    pid_path = os.path.join(BASE, ".server.pid")
    try:
        with open(pid_path, "w") as fh:
            fh.write(str(os.getpid()))
        atexit.register(lambda: os.path.exists(pid_path) and os.remove(pid_path))
    except OSError:
        pass


class Server(ThreadingHTTPServer):
    # Disabled so a second launch fails loudly instead of stacking another server
    # on the same port (Windows SO_REUSEADDR otherwise allows multiple binds).
    allow_reuse_address = False


def main():
    os.makedirs(STUDENTS, exist_ok=True)
    try:
        httpd = Server((HOST, PORT), Handler)
    except OSError as e:
        print("Could not start on %s:%d — the trainer is probably already running." % (HOST, PORT))
        print("  (%s)" % e)
        print("  Open http://127.0.0.1:%d/python_trainer.html, or run stop_trainer.bat first." % PORT)
        return
    _write_pid_file()
    url = "http://%s:%d/python_trainer.html" % (HOST, PORT)
    print("Interactive Python Trainer")
    print("  Open:  " + url)
    print("  Student work auto-saves into the students/ folder.")
    print("  Press Ctrl+C to stop.\n")
    try:
        webbrowser.open(url)
    except Exception:
        pass
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
