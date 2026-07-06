#!/usr/bin/env python3
"""Refresh the Subresource Integrity (SRI) hashes in python_trainer.html.

The page loads CodeMirror, marked, and DOMPurify from CDNs with
`integrity="sha384-..."` attributes so the browser rejects tampered files.
Those hashes must match the exact bytes served, so whenever you change a pinned
version below, re-run this script to download the new files and rewrite the tags.

Usage:
    python tools/update_sri.py

Requires internet (fetches from cdnjs.cloudflare.com and cdn.jsdelivr.net).
Only edits the <script>/<link> tags for the libraries listed here; nothing else.

Note: pinned versions must be *exact* and *immutable*, and for marked the version
must still ship a browser build at `marked.min.js` exposing the `marked.parse`
global (the newest marked releases dropped that file — 12.x/13.x/14.x/15.x keep it).
"""

import base64
import hashlib
import os
import re
import sys
import urllib.request

# ---- pinned versions (bump these, then re-run) ----------------------------
CODEMIRROR_VER = "5.65.16"
MARKED_VER = "12.0.2"
DOMPURIFY_VER = "3.4.11"

CM = "https://cdnjs.cloudflare.com/ajax/libs/codemirror/%s/" % CODEMIRROR_VER

# Each resource: kind, the exact URL to hash+embed, and a regex that finds the
# existing tag (with or without current integrity attrs) so it can be replaced.
RESOURCES = [
    ("link",   CM + "codemirror.min.css",
     r'<link\b[^>]*codemirror\.min\.css[^>]*>'),
    ("script", CM + "codemirror.min.js",
     r'<script\b[^>]*codemirror\.min\.js[^>]*></script>'),
    ("script", CM + "mode/python/python.min.js",
     r'<script\b[^>]*python\.min\.js[^>]*></script>'),
    ("script", "https://cdn.jsdelivr.net/npm/marked@%s/marked.min.js" % MARKED_VER,
     r'<script\b[^>]*/marked(@[^/"]+)?/marked\.min\.js[^>]*></script>'),
    ("script", "https://cdn.jsdelivr.net/npm/dompurify@%s/dist/purify.min.js" % DOMPURIFY_VER,
     r'<script\b[^>]*/dompurify(@[^/"]+)?/dist/purify\.min\.js[^>]*></script>'),
]

HTML = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "python_trainer.html")


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "update_sri"})
    return urllib.request.urlopen(req, timeout=30).read()


def sri(data):
    return "sha384-" + base64.b64encode(hashlib.sha384(data).digest()).decode()


def build_tag(kind, url, integrity):
    if kind == "link":
        return ('<link rel="stylesheet" href="%s" integrity="%s" '
                'crossorigin="anonymous" />' % (url, integrity))
    return ('<script src="%s" integrity="%s" crossorigin="anonymous"></script>'
            % (url, integrity))


def main():
    # Download and hash everything first; if any fetch fails, don't touch the file.
    tags = []
    for kind, url, pattern in RESOURCES:
        try:
            data = fetch(url)
        except Exception as e:
            print("ERROR fetching %s\n  %s: %s" % (url, type(e).__name__, e))
            return 1
        integrity = sri(data)
        tags.append((pattern, build_tag(kind, url, integrity)))
        print("%9dB  %s  %s" % (len(data), integrity, url))

    with open(HTML, encoding="utf-8") as fh:
        html = fh.read()

    for pattern, new_tag in tags:
        html, n = re.subn(pattern, lambda m: new_tag, html, count=1)
        if n != 1:
            print("ERROR: expected exactly 1 tag for /%s/, found %d — not writing." % (pattern, n))
            return 1

    with open(HTML, "w", encoding="utf-8") as fh:
        fh.write(html)

    print("\nUpdated SRI in %s" % os.path.normpath(HTML))
    print("Pinned: codemirror %s, marked %s, dompurify %s" %
          (CODEMIRROR_VER, MARKED_VER, DOMPURIFY_VER))
    return 0


if __name__ == "__main__":
    sys.exit(main())
