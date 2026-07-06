# Interactive Python Trainer

A self-contained coding tutor that runs in your browser. Real Python executes locally
via Pyodide (WebAssembly), and an AI tutor answers questions by calling the Anthropic
API directly from the page.

Because it runs real CPython with scientific packages, it isn't limited to "plain"
Python. Pick a **Course** from the sidebar — **84 lessons, 21 in each**:

- **Core Python** — Beginner → Intermediate → Expert.
- **AI & Machine Learning** — NumPy foundations, modeling & metrics, applied ML (scikit-learn).
- **Data & Biomedical** — pandas, statistics (NumPy), bioinformatics.
- **Project Management** — scheduling & critical path, cost/earned value, risk & resources.

Lessons that need a library load it automatically on first Run. (In-browser Python can't
run things with native/GPU pieces like PyTorch/TensorFlow training or database drivers.)

**Internet is required** the first time either way: Pyodide (~10 MB), the editor, and
the tutor load from CDNs (Pyodide is then cached by the browser).

## Run it — two ways

**A. Quick (no install):** double-click **`python_trainer.html`**. Each student's work
is saved in the browser. Everything works, but Export/Import (below) is how work moves
to real files.

**B. With auto-save to student folders (recommended):** double-click
**`start_trainer.bat`** (or run `python server.py`). It opens the app in your browser
and **automatically saves each student's work into `students/<Name>/progress.json`** —
no Export/Import needed. Stop the server with `Ctrl+C` in its window.

In this mode the tutor's key is held **on the server, not in the browser**. Provide it
either way:

- **Easiest — enter it in the app:** open the app, click **🔑 API Key**, paste your key,
  and Apply. It's saved to a local **`.env` file** on this computer that the server reads;
  it is never stored in the browser. Click **Erase key** to remove it.
- **Or an environment variable:** `setx ANTHROPIC_API_KEY "sk-ant-..."` (then re-launch),
  or `set ANTHROPIC_API_KEY=sk-ant-...` for the current window only. A real env var takes
  precedence over the `.env` file.

The `.env` file is never served over HTTP and is excluded from backups.

**B-quiet — no console window:** double-click **`start_trainer_hidden.vbs`** instead.
It launches the same server with `pythonw.exe` (console-less), so **no `cmd` window
appears** — the browser just opens. Because there's no window to close, stop it later by
double-clicking **`stop_trainer.bat`**. (If the browser doesn't open, run
`start_trainer.bat` once to see any error message — e.g. port 8000 already in use.)

> The server is a tiny standard-library Python script (no packages to install). It only
> listens on `127.0.0.1` (your machine). Note: the browser treats the file and the
> server as different origins, so the API key and any browser-only progress from mode A
> won't carry over to mode B — re-enter the key once, and use one mode consistently.

## Students (profiles)

The first time the app opens with no profiles, it shows a **Welcome** screen asking the
student to enter their name. Entering a name creates their profile (and, in server mode,
their `students/<Name>/` folder) and drops them into the lessons.

After that, use the 👤 dropdown in the top bar to switch between students. Each student
has **completely separate** progress, saved code, and tutor chat.

- **＋** opens a text field — type the student's name and press **Enter**. In server
  mode this creates their folder (`students/<Name>/`); in file mode it creates the
  profile in the browser. **🗑** removes the active student (export first for a backup).
- **⭳ Export** downloads that student's work as a `.json` file; **⭱ Import** loads it back.

**In server mode (B):** the student list *is* the folders under `students/`, and work
saves to `students/<Name>/progress.json` automatically as they go. Adding a student
creates a new folder. This is the "one folder per student" setup.

**In file mode (A):** a page opened from a file can't write to disk folders directly
(browser security), so profiles live in browser storage and Export/Import bridges to
files you keep in each student's folder. See `students/README.md`.

## Using it

- **Left:** curriculum — Beginner → Intermediate → Expert. Progress is saved per
  student in your browser.
- **Center:** the lesson, a code editor, and an output console.
  - **Run** (or `Ctrl/Cmd+Enter`) executes your code.
  - **Check** (or `Shift+Enter`) grades the exercise. Passing marks the lesson complete.
  - **Reset** restores the starter code.
- **Right:** the Claude tutor. It can see the current lesson and your editor code. Pick
  the model (Opus / Sonnet / Haiku) from the dropdown in the tutor panel.

## The AI tutor & your API key

How the key is handled depends on how you launched:

- **Server mode (recommended)** — you enter the key with the **🔑 API Key** button (or
  set the `ANTHROPIC_API_KEY` env var). Browser entry is saved to a server-side **`.env`
  file**; the browser then calls the local server at `/api/tutor`, which adds the key and
  forwards to Anthropic. **The key never lives in the browser.**
- **File mode** (opening the HTML directly) — there's no server, so the tutor calls
  Anthropic directly from the browser using a key you paste via the **🔑 API Key** button,
  stored in this browser's `localStorage`.

**Security notes**
- Prefer server mode + the env var so the key stays off the browser and out of files.
- Use a personal key with spending limits.
- **Never** commit or save the key in a file in this folder, and don't host the app on a
  public server with a key configured.
- The CDN scripts (CodeMirror, marked, DOMPurify) are pinned to exact versions and
  integrity-checked with **SRI**, so a tampered CDN file is rejected. To update a
  library, bump its version in `tools/update_sri.py` and run
  `python tools/update_sri.py` to refresh the hashes. (Pyodide loads inside the Web
  Worker via `importScripts`, which has no SRI mechanism; its URL is version-pinned.)

## Adding courses & lessons

Edit **`curriculum.js`**. It exports `COURSES = [{ id, title, tracks: [{ title, lessons }] }]`.
Each lesson is a plain object:

```js
{
  id: "unique-id",            // unique across ALL courses
  title: "Lesson title",
  content: "<p>HTML lesson content…</p>",
  starter: "def solve():\n    pass\n",
  packages: ["numpy"],        // OPTIONAL: Pyodide packages to load first
                              //   e.g. ["numpy"], ["pandas"], ["scikit-learn"]
  exercise: {
    prompt: "What the learner must do (HTML allowed).",
    // grade one of these two ways:
    test: 'assert solve() == 42',     // Python assertions, run after the code
    // expectedOutput: "Hello, World!" // OR exact stdout match
  }
}
```

Add a whole new domain by appending another course object. Reload the page — no build
step. (Tip: ask the in-app tutor to draft new lessons for a topic.)

## Files

| File | Purpose |
|------|---------|
| `python_trainer.html` | App shell / entry point |
| `styles.css` | Styling (blue-and-white theme) |
| `curriculum.js` | Lessons + exercises + graders |
| `app.js` | Editor, Pyodide runner, grading, tutor chat, student profiles |
| `server.py` | Optional local server that auto-saves work into `students/` |
| `start_trainer.bat` | Launcher for the server, keeps a console window (Windows) |
| `start_trainer_hidden.vbs` | Launcher with **no** console window (Windows) |
| `stop_trainer.bat` | Stops the windowless server |
| `students/` | One folder per student (used for auto-save / exports) |
| `tools/update_sri.py` | Regenerates the CDN integrity (SRI) hashes in the HTML |
| `tools/backup.py` | Zips the whole project (incl. student work) to a timestamped archive |

## Stopping runaway code

Python runs inside a **Web Worker**, so an infinite loop (e.g. `while True:`) never
freezes the page. Press **■ Stop** to abort it, or just wait — a run is **auto-stopped
after 10 seconds** with a hint to check for an infinite loop.

Under `file://` the browser can't use the fine-grained `SharedArrayBuffer` interrupt
(it needs cross-origin isolation), so Stop works by terminating the worker and
reloading a fresh Python — the status shows "Restarting Python…" for a moment, then
"Python ready" again. Your editor code and progress are unaffected.
