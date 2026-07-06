/* ============================================================================
 * Interactive Python Trainer — app logic
 * Client-side app. Python via Pyodide (Web Worker); tutor via the Anthropic API.
 * Multiple student profiles. Persists to browser storage, OR — when launched via
 * server.py — auto-saves each student's work into students/<Name>/progress.json.
 * ==========================================================================*/

"use strict";

const TIMEOUT_MS = 10000;   // auto-stop a run after this long (infinite-loop guard)

// ---------- persistent state (localStorage; global/client-side prefs) ----------
const LS = {
  apiKey:   "ipt.apiKey",
  model:    "ipt.model",
  students: "ipt.students",       // file mode: JSON [{id,name}]
  current:  "ipt.currentStudent"  // last active student id (client pref)
};

function lsGet(k, fallback) {
  try { const v = localStorage.getItem(k); return v === null ? fallback : v; }
  catch (e) { return fallback; }
}
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
function lsJSON(k, fallback) { try { return JSON.parse(lsGet(k, "")) ?? fallback; } catch (e) { return fallback; } }

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function safeName(n) { return (n || "student").replace(/[^a-z0-9._-]+/gi, "_"); }

// ---------- app state ----------
let serverMode = false;         // true when launched via server.py (folder auto-save)
let serverHasKey = false;       // true when the server has ANTHROPIC_API_KEY set
let students = [];              // [{id, name}]
let currentStudentId = null;

let worker = null;              // Web Worker running Pyodide
let runSeq = 0;
let pendingRun = null;          // { id, resolve, reject }
let running = false;

let editor = null;
let currentLesson = null;
let currentCourseId = null;     // which course/domain is shown
let completed = new Set();      // lesson ids (current student)
let chatHistory = [];           // [{role, content}]
let codeMap = {};               // { lessonId: code } (current student, in memory)
let streaming = false;
let persistTimer = null;
let suppressChatClear = false;   // true while loading a profile, so resume doesn't wipe saved chat

// flat index of every lesson across all courses
const FLAT = [];
COURSES.forEach(course => course.tracks.forEach(track => track.lessons.forEach(l => FLAT.push({ course, track, lesson: l }))));
const COURSE_BY_ID = {};
COURSES.forEach(c => { COURSE_BY_ID[c.id] = c; });
function courseLessons(courseId) {
  const c = COURSE_BY_ID[courseId] || COURSES[0];
  const out = [];
  c.tracks.forEach(t => t.lessons.forEach(l => out.push(l)));
  return out;
}

// ---------- DOM ----------
const $ = sel => document.querySelector(sel);
const el = {
  sidebar:    $("#sidebar"),
  lessonPane: $("#lesson-pane"),
  output:     $("#output"),
  chat:       $("#chat"),
  quick:      $("#quick"),
  chatInput:  $("#chat-input"),
  pyDot:      $("#py-dot"),
  pyStatus:   $("#py-status"),
  modelSelect:$("#model-select"),
};

/* ============================================================================
 * Storage abstraction — server (folders) or browser (localStorage)
 * A "bundle" is the whole per-student payload: { done, lastLesson, chat, code }.
 * ==========================================================================*/
function normalizeBundle(b) {
  b = b || {};
  return {
    done: Array.isArray(b.done) ? b.done : [],
    lastLesson: b.lastLesson || null,
    chat: Array.isArray(b.chat) ? b.chat : [],
    code: (b.code && typeof b.code === "object") ? b.code : {}
  };
}

async function detectServer() {
  if (location.protocol === "file:") return false;
  try {
    const r = await fetch("/api/ping", { cache: "no-store" });
    if (!r.ok) return false;
    const j = await r.json().catch(() => ({}));
    serverHasKey = !!j.hasKey;
    return true;
  } catch (e) { return false; }
}

async function refreshServerKey() {   // re-check in case the env var was set after launch
  try {
    const r = await fetch("/api/ping", { cache: "no-store" });
    if (r.ok) { const j = await r.json(); serverHasKey = !!j.hasKey; }
  } catch (e) {}
}

async function storeListStudents() {
  if (serverMode) {
    try { const r = await fetch("/api/students", { cache: "no-store" }); const l = await r.json(); return Array.isArray(l) ? l : []; }
    catch (e) { return []; }
  }
  const l = lsJSON(LS.students, []);
  return Array.isArray(l) ? l : [];
}

async function storeCreateStudent(name) {
  if (serverMode) {
    try {
      const r = await fetch("/api/students", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ name })
      });
      return await r.json();   // {id, name}
    } catch (e) { return { id: name, name }; }
  }
  const s = { id: genId(), name };
  const l = lsJSON(LS.students, []);
  l.push(s);
  lsSet(LS.students, JSON.stringify(l));
  return s;
}

async function storeDeleteStudent(id) {
  if (serverMode) {
    try { await fetch("/api/students?student=" + encodeURIComponent(id), { method: "DELETE" }); } catch (e) {}
    return;
  }
  const prefix = "ipt.s." + id + ".";
  const toDel = [];
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(prefix)) toDel.push(k); }
  toDel.forEach(k => localStorage.removeItem(k));
  lsSet(LS.students, JSON.stringify(lsJSON(LS.students, []).filter(s => s.id !== id)));
}

async function storeLoadBundle(id) {
  if (serverMode) {
    try {
      const r = await fetch("/api/progress?student=" + encodeURIComponent(id), { cache: "no-store" });
      return normalizeBundle(await r.json());
    } catch (e) { return normalizeBundle({}); }
  }
  const pre = "ipt.s." + id + ".";
  const code = {};
  const cprefix = pre + "code.";
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(cprefix)) code[k.slice(cprefix.length)] = localStorage.getItem(k);
  }
  return normalizeBundle({
    done: lsJSON(pre + "done", []),
    lastLesson: lsGet(pre + "lastLesson", null),
    chat: lsJSON(pre + "chat", []),
    code
  });
}

async function storeSaveBundle(id, bundle) {
  bundle = normalizeBundle(bundle);
  if (serverMode) {
    try {
      await fetch("/api/progress?student=" + encodeURIComponent(id), {
        method: "PUT", headers: { "content-type": "application/json" },
        body: JSON.stringify(bundle)
      });
    } catch (e) {}
    return;
  }
  const pre = "ipt.s." + id + ".";
  lsSet(pre + "done", JSON.stringify(bundle.done));
  lsSet(pre + "chat", JSON.stringify(bundle.chat));
  if (bundle.lastLesson) lsSet(pre + "lastLesson", bundle.lastLesson);
  const cprefix = pre + "code.";
  const toDel = [];
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(cprefix)) toDel.push(k); }
  toDel.forEach(k => localStorage.removeItem(k));
  Object.keys(bundle.code).forEach(lid => lsSet(cprefix + lid, bundle.code[lid]));
}

function buildBundle() {
  return {
    done: [...completed],
    lastLesson: currentLesson ? currentLesson.id : null,
    chat: chatHistory.slice(-40),
    code: codeMap
  };
}

// Debounced save of the current student's whole bundle.
function persist() {
  if (!currentStudentId) return;
  if (persistTimer) clearTimeout(persistTimer);
  const id = currentStudentId;
  persistTimer = setTimeout(() => { storeSaveBundle(id, buildBundle()); }, 350);
}

// Save immediately (cancels any pending debounce) and wait for it.
async function flushPersist() {
  if (persistTimer) { clearTimeout(persistTimer); persistTimer = null; }
  if (currentStudentId) { try { await storeSaveBundle(currentStudentId, buildBundle()); } catch (e) {} }
}

// One-time migration of pre-profiles browser data into a student (file mode only).
function migrateLegacyInto(id) {
  const pre = "ipt.s." + id + ".";
  [["ipt.completed", "done"], ["ipt.lastLesson", "lastLesson"], ["ipt.chat", "chat"]]
    .forEach(([oldKey, suf]) => {
      const v = localStorage.getItem(oldKey);
      if (v !== null && localStorage.getItem(pre + suf) === null) localStorage.setItem(pre + suf, v);
    });
  const ck = [];
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith("ipt.code.")) ck.push(k); }
  ck.forEach(k => {
    const dest = pre + "code." + k.slice("ipt.code.".length);
    if (localStorage.getItem(dest) === null) localStorage.setItem(dest, localStorage.getItem(k));
  });
}

/* ============================================================================
 * Python execution — in a Web Worker so runaway code can be stopped
 * ==========================================================================*/
const WORKER_SRC = `
let pyodide = null;
let ready = false;
async function init() {
  importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js");
  pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/" });
  ready = true;
  postMessage({ type: "ready" });
}
const initPromise = init().catch(function (e) {
  postMessage({ type: "loaderror", message: String((e && e.message) || e) });
});
self.onmessage = async function (ev) {
  const msg = ev.data;
  if (msg.type !== "run") return;
  await initPromise;
  if (!ready) {
    postMessage({ type: "result", id: msg.id, stdout: "", stderr: "", error: "Python failed to load", phase: "run" });
    return;
  }
  if (Array.isArray(msg.packages) && msg.packages.length) {
    try {
      await pyodide.loadPackage(msg.packages);
    } catch (e) {
      postMessage({ type: "result", id: msg.id, stdout: "", stderr: "",
        error: "Could not load packages (" + msg.packages.join(", ") + "): " + String((e && e.message) || e), phase: "run" });
      return;
    }
  }
  const ns = pyodide.globals.get("dict")();
  pyodide.runPython("import sys, io; _o = io.StringIO(); _e = io.StringIO(); sys.stdout = _o; sys.stderr = _e");
  let error = null, phase = "run";
  try {
    pyodide.runPython(msg.userCode, { globals: ns });
    if (msg.testCode) { phase = "test"; pyodide.runPython(msg.testCode, { globals: ns }); }
  } catch (e) {
    error = String((e && e.message) || e);
  }
  const stdout = pyodide.runPython("_o.getvalue()");
  const stderr = pyodide.runPython("_e.getvalue()");
  pyodide.runPython("sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__");
  try { ns.destroy(); } catch (e) {}
  postMessage({ type: "result", id: msg.id, stdout: stdout, stderr: stderr, error: error, phase: phase });
};
`;

class StopError extends Error { constructor() { super("stopped"); this.stopped = true; } }
class TimeoutError extends Error { constructor(ms) { super("timeout"); this.timeout = true; this.ms = ms; } }

function createWorker() {
  if (typeof Worker === "undefined") {
    el.pyDot.classList.add("err"); el.pyStatus.textContent = "Web Workers unavailable"; return;
  }
  try {
    const blob = new Blob([WORKER_SRC], { type: "application/javascript" });
    worker = new Worker(URL.createObjectURL(blob));
  } catch (e) {
    el.pyDot.classList.add("err"); el.pyStatus.textContent = "Could not start Python worker"; worker = null; return;
  }
  el.pyDot.classList.remove("ready", "err");
  el.pyStatus.textContent = "Loading Python…";
  worker.onmessage = (ev) => {
    const msg = ev.data;
    if (msg.type === "ready") {
      el.pyDot.classList.remove("err"); el.pyDot.classList.add("ready"); el.pyStatus.textContent = "Python ready";
    } else if (msg.type === "loaderror") {
      el.pyDot.classList.add("err"); el.pyStatus.textContent = "Python failed to load (need internet)";
      if (pendingRun) { pendingRun.reject(new Error(msg.message)); pendingRun = null; }
    } else if (msg.type === "result") {
      if (pendingRun && pendingRun.id === msg.id) { const p = pendingRun; pendingRun = null; p.resolve(msg); }
    }
  };
  worker.onerror = () => { el.pyDot.classList.add("err"); el.pyStatus.textContent = "Worker error"; };
}

function execute(userCode, testCode, packages) {
  // Loading a package (numpy/pandas/sklearn) legitimately takes longer than the
  // infinite-loop guard, so extend the timeout when packages are requested.
  const tmo = (packages && packages.length) ? 60000 : TIMEOUT_MS;
  return new Promise((resolve, reject) => {
    if (!worker) createWorker();
    if (!worker) { reject(new Error("Python worker unavailable")); return; }
    const id = ++runSeq;
    const timer = setTimeout(() => {
      if (pendingRun && pendingRun.id === id) {
        pendingRun = null;
        if (worker) { worker.terminate(); worker = null; }
        createWorker();
        el.pyStatus.textContent = "Restarting Python…";
        reject(new TimeoutError(tmo));
      }
    }, tmo);
    pendingRun = {
      id,
      resolve: (v) => { clearTimeout(timer); resolve(v); },
      reject:  (e) => { clearTimeout(timer); reject(e); }
    };
    worker.postMessage({ type: "run", id, userCode, testCode: testCode || null, packages: packages || null });
  });
}

function stopExecution() {
  if (worker) { worker.terminate(); worker = null; }
  if (pendingRun) { const p = pendingRun; pendingRun = null; p.reject(new StopError()); }
  createWorker();
  el.pyStatus.textContent = "Restarting Python…";
}

function setRunning(on) {
  running = on;
  const stop = $("#btn-stop");
  $("#btn-run").disabled = on;
  $("#btn-check").disabled = on;
  $("#btn-reset").disabled = on;
  if (stop) stop.style.display = on ? "" : "none";
}

function reportRunFailure(e) {
  setRunning(false);
  clearOutput();
  if (e && e.timeout) {
    outBanner("⏱ Stopped after " + (e.ms / 1000) + "s", false);
    outLine("\nThat took too long. Check for an infinite loop — e.g. a while " +
            "loop whose condition never becomes False, or a missing update inside the loop.", "muted");
  } else if (e && e.stopped) {
    outBanner("■ Stopped", false);
  } else {
    outBanner("✗ Error", false);
    outLine("\n" + String((e && e.message) || e), "err");
  }
}

function cleanTraceback(tb) {
  if (!tb) return "";
  const lines = tb.split("\n");
  let start = 0;
  for (let i = lines.length - 1; i >= 0; i--) { if (lines[i].startsWith("Traceback")) { start = i; break; } }
  return lines.slice(start).filter(l =>
    !l.includes('File "<exec>"') && !l.includes("pyodide") && !l.includes("/lib/python")
  ).join("\n").trim() || tb.trim();
}

/* ============================================================================
 * Output console
 * ==========================================================================*/
function clearOutput() { el.output.innerHTML = ""; }
function outLine(text, cls) {
  const span = document.createElement("span");
  if (cls) span.className = cls;
  span.textContent = text;
  el.output.appendChild(span);
}
function outBanner(text, good) {
  const b = document.createElement("span");
  b.className = "banner " + (good ? "good" : "bad");
  b.textContent = text;
  el.output.appendChild(b);
}

function runningNote(pkgs) {
  return (pkgs && pkgs.length)
    ? "Loading " + pkgs.join(", ") + " (first run can take a bit)…"
    : "Running…";
}

async function runCode() {
  if (!currentLesson || running) return;
  const pkgs = currentLesson.packages;
  clearOutput(); outLine(runningNote(pkgs), "muted");
  setRunning(true);
  let res;
  try { res = await execute(editor.getValue(), null, pkgs); }
  catch (e) { reportRunFailure(e); return; }
  setRunning(false);
  const { stdout, stderr, error } = res;
  clearOutput();
  if (stdout) outLine(stdout);
  if (stderr) outLine(stderr, "err");
  if (error) { outBanner("✗ Error", false); outLine("\n" + cleanTraceback(error), "err"); }
  else if (!stdout && !stderr) outLine("(no output)", "muted");
  el.output.scrollTop = el.output.scrollHeight;
}

async function checkCode() {
  if (!currentLesson || running) return;
  const ex = currentLesson.exercise;
  const pkgs = currentLesson.packages;
  clearOutput(); outLine(pkgs && pkgs.length ? runningNote(pkgs) : "Checking…", "muted");
  setRunning(true);
  let res;
  try { res = await execute(editor.getValue(), ex.test, pkgs); }
  catch (e) { reportRunFailure(e); return; }
  setRunning(false);
  const { stdout, stderr, error, phase } = res;
  clearOutput();

  if (error && phase === "run") {
    outBanner("✗ Your code raised an error", false);
    outLine("\n" + cleanTraceback(error), "err");
    return;
  }

  if (ex.expectedOutput !== undefined) {
    const got = (stdout || "").replace(/\s+$/g, "");
    const want = ex.expectedOutput.replace(/\s+$/g, "");
    if (got === want) return markPass();
    outBanner("✗ Output does not match", false);
    outLine("\nExpected:\n" + JSON.stringify(ex.expectedOutput) + "\nGot:\n" + JSON.stringify(stdout), "err");
    return;
  }

  if (ex.test) {
    if (error && phase === "test") {
      outBanner("✗ Not quite — a test failed", false);
      outLine("\n" + extractAssert(error), "err");
      if (stdout) outLine("\n\nYour output was:\n" + stdout, "muted");
      return;
    }
    return markPass();
  }

  if (stdout) outLine(stdout);
  outBanner("✓ Ran successfully", true);

  function markPass() {
    outBanner("✓ Correct! Exercise passed.", true);
    if (stdout) outLine("\n" + stdout, "muted");
    if (!completed.has(currentLesson.id)) {
      completed.add(currentLesson.id);
      persist();
      renderSidebar();
    }
    offerNext();
  }
}

function extractAssert(tb) {
  const aLine = tb.split("\n").find(l => l.includes("AssertionError"));
  if (aLine) {
    const msg = aLine.split("AssertionError:")[1];
    return msg ? "AssertionError:" + msg.trimEnd() : "A check failed (no message).";
  }
  return cleanTraceback(tb);
}

function offerNext() {
  const order = courseLessons(currentCourseId);
  const idx = order.findIndex(l => l.id === currentLesson.id);
  if (idx >= 0 && idx < order.length - 1) {
    const nextBtn = document.createElement("button");
    nextBtn.className = "success";
    nextBtn.textContent = "Next lesson: " + order[idx + 1].title + " →";
    nextBtn.style.marginTop = "10px";
    nextBtn.style.display = "block";
    nextBtn.onclick = () => selectLesson(order[idx + 1].id);
    el.output.appendChild(document.createElement("br"));
    el.output.appendChild(nextBtn);
  }
}

/* ============================================================================
 * Sidebar + lessons
 * ==========================================================================*/
function switchCourse(id) {
  currentCourseId = id;
  const first = courseLessons(id)[0];
  if (first) selectLesson(first.id);
  else renderSidebar();
}

function renderSidebar() {
  el.sidebar.innerHTML = "";
  if (!currentCourseId) currentCourseId = COURSES[0].id;
  const course = COURSE_BY_ID[currentCourseId] || COURSES[0];

  // course / domain picker
  const pick = document.createElement("div");
  pick.className = "course-pick";
  const label = document.createElement("label");
  label.textContent = "Course";
  const sel = document.createElement("select");
  COURSES.forEach(c => {
    const o = document.createElement("option");
    o.value = c.id; o.textContent = c.title;
    if (c.id === course.id) o.selected = true;
    sel.appendChild(o);
  });
  sel.onchange = () => switchCourse(sel.value);
  pick.appendChild(label); pick.appendChild(sel);
  el.sidebar.appendChild(pick);

  const lessons = courseLessons(course.id);
  const total = lessons.length;
  const doneCount = lessons.filter(l => completed.has(l.id)).length;

  const pct = document.createElement("div");
  pct.className = "track-head";
  pct.textContent = `Progress — ${doneCount}/${total} complete`;
  el.sidebar.appendChild(pct);

  const bar = document.createElement("div");
  bar.className = "progress-bar";
  bar.innerHTML = `<div style="width:${total ? (doneCount / total * 100) : 0}%"></div>`;
  el.sidebar.appendChild(bar);

  course.tracks.forEach((track, ti) => {
    // tier-1/2/3 => calm pastel colour per difficulty level
    const wrap = document.createElement("div");
    wrap.className = "track tier-" + (ti + 1);

    const head = document.createElement("div");
    head.className = "track-head";
    head.textContent = track.title;
    wrap.appendChild(head);

    track.lessons.forEach(lesson => {
      const item = document.createElement("div");
      item.className = "lesson-item";
      if (completed.has(lesson.id)) item.classList.add("done");
      if (currentLesson && currentLesson.id === lesson.id) item.classList.add("active");
      item.innerHTML = `<span class="mark">✓</span><span class="t"></span>`;
      item.querySelector(".t").textContent = lesson.title;
      item.onclick = () => selectLesson(lesson.id);
      wrap.appendChild(item);
    });

    el.sidebar.appendChild(wrap);
  });

  refreshGreeting();
}

function selectLesson(id) {
  const found = FLAT.find(f => f.lesson.id === id);
  if (!found) return;
  const prevId = currentLesson ? currentLesson.id : null;
  currentLesson = found.lesson;
  currentCourseId = found.course.id;

  // Moving to a different exercise resets the tutor chat so explanations don't
  // pile up. (Suppressed while loading a profile, so resuming keeps saved chat.)
  if (!suppressChatClear && prevId && prevId !== found.lesson.id) {
    chatHistory = [];
    renderChat();
  }

  // colour the lesson content to match its difficulty tier in the sidebar
  const TIER_COLORS = ["#3f9468", "#4779c4", "#7a5fbd"];
  const ti = found.course.tracks.indexOf(found.track);
  document.documentElement.style.setProperty("--cur-tier", TIER_COLORS[((ti % 3) + 3) % 3]);

  const why = (typeof LESSON_WHY !== "undefined" && LESSON_WHY[currentLesson.id]) || "";
  const whyHtml = why
    ? `<div class="why"><span class="why-label">Why it matters</span>${escapeHtml(why)}</div>`
    : "";
  el.lessonPane.innerHTML =
    `<div class="crumb">${escapeHtml(found.course.title)} › ${escapeHtml(found.track.title)}</div>` +
    `<h2>${escapeHtml(currentLesson.title)}</h2>` +
    currentLesson.content +
    `<div class="exercise-box"><div class="label">Exercise</div>` +
    `<div>${currentLesson.exercise.prompt}</div>${whyHtml}</div>`;
  el.lessonPane.scrollTop = 0;

  const saved = codeMap[id];
  editor.setValue(saved !== undefined ? saved : currentLesson.starter);
  editor.clearHistory();

  clearOutput();
  outLine("Ready. Press Run to execute, or Check to grade.", "muted");
  renderSidebar();
  persist();   // remembers this as the last lesson
}

function resetCode() {
  if (!currentLesson) return;
  codeMap[currentLesson.id] = currentLesson.starter;
  editor.setValue(currentLesson.starter);
  persist();
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ============================================================================
 * Editor
 * ==========================================================================*/
function initEditor() {
  editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    mode: "python",
    theme: "default",
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    matchBrackets: true,
    extraKeys: {
      "Ctrl-Enter": runCode,
      "Cmd-Enter": runCode,
      "Shift-Enter": checkCode,
      Tab: cm => cm.replaceSelection("    ")
    }
  });
  editor.on("change", () => {
    if (currentLesson) { codeMap[currentLesson.id] = editor.getValue(); persist(); }
  });
}

/* ============================================================================
 * Student profiles
 * ==========================================================================*/
function currentStudentName() {
  const s = students.find(x => x.id === currentStudentId);
  return s ? s.name : "";
}

function refreshGreeting() {
  const g = $("#greeting");
  if (!g) return;
  const name = currentStudentName();
  if (!name) { g.textContent = ""; return; }
  const done = FLAT.filter(f => completed.has(f.lesson.id)).length;
  g.textContent = "Hi, " + name + " · " + done + "/" + FLAT.length + " done";
}

async function loadStudents() {
  students = await storeListStudents();
  if (students.length === 0) { currentStudentId = null; return; }   // -> welcome screen
  let cur = lsGet(LS.current, null);
  if (!students.some(s => s.id === cur)) cur = students[0].id;
  currentStudentId = cur;
  lsSet(LS.current, currentStudentId);
}

function renderStudentSelect() {
  const sel = $("#student-select");
  sel.innerHTML = "";
  students.forEach(s => {
    const o = document.createElement("option");
    o.value = s.id;
    o.textContent = s.name;
    if (s.id === currentStudentId) o.selected = true;
    sel.appendChild(o);
  });
}

async function loadStudentState(id) {
  const b = await storeLoadBundle(id);
  completed = new Set(b.done);
  chatHistory = b.chat;
  codeMap = b.code;
  renderChat();
  const startId = (b.lastLesson && FLAT.some(f => f.lesson.id === b.lastLesson)) ? b.lastLesson : FLAT[0].lesson.id;
  suppressChatClear = true;      // don't wipe the just-loaded chat when restoring the lesson
  selectLesson(startId);
  suppressChatClear = false;
  renderSidebar();
}

async function switchStudent(id) {
  if (id === currentStudentId) return;
  if (persistTimer) { clearTimeout(persistTimer); persistTimer = null; }
  await storeSaveBundle(currentStudentId, buildBundle());   // save the one we're leaving
  currentStudentId = id;
  lsSet(LS.current, id);
  renderStudentSelect();
  await loadStudentState(id);
}

function toggleNewStudent(show) {
  const inp = $("#new-student-input");
  if (show === undefined) show = inp.style.display === "none";
  inp.style.display = show ? "" : "none";
  if (show) { inp.value = ""; inp.focus(); }
}

function populateResume() {
  const box = $("#welcome-resume");
  if (!box) return;
  box.innerHTML = "";
  if (!students.length) return;
  const label = document.createElement("div");
  label.className = "welcome-resume-label";
  label.textContent = "Or continue where you left off:";
  const row = document.createElement("div");
  row.className = "welcome-resume-row";
  students.forEach(s => {
    const b = document.createElement("button");
    b.textContent = s.name;
    b.onclick = () => resumeStudent(s.id);
    row.appendChild(b);
  });
  box.appendChild(label);
  box.appendChild(row);
}

function showWelcome() {
  populateResume();
  const w = $("#welcome");
  w.style.display = "flex";
  const i = $("#welcome-name");
  i.value = "";
  i.focus();
  refreshGreeting();   // clears the header greeting when no one is active
}
function hideWelcome() { $("#welcome").style.display = "none"; }

async function resumeStudent(id) {   // pick up a saved profile from the Welcome screen
  currentStudentId = id;
  lsSet(LS.current, id);
  renderStudentSelect();
  hideWelcome();
  await loadStudentState(id);
}

async function exitToWelcome() {     // "Save & exit" — flush the save, then sign out
  await flushPersist();
  currentStudentId = null;
  lsSet(LS.current, "");
  showWelcome();
}

async function newStudent(name) {
  name = (name || "").trim();
  if (!name) return;
  const firstEver = students.length === 0;
  const s = await storeCreateStudent(name);   // in server mode this creates students/<name>/
  if (firstEver && !serverMode) migrateLegacyInto(s.id);  // keep any pre-profiles browser data
  students = await storeListStudents();
  if (!students.some(x => x.id === s.id)) students.push(s);
  currentStudentId = s.id;
  lsSet(LS.current, s.id);
  renderStudentSelect();
  hideWelcome();
  await loadStudentState(s.id);
}

async function deleteStudent() {
  if (!currentStudentId) return;
  const cur = students.find(s => s.id === currentStudentId);
  const name = cur ? cur.name : "";
  if (!confirm('Delete "' + name + '" and all of their saved work?\n' +
               'This cannot be undone. (Tip: Export first to keep a copy.)')) return;
  await storeDeleteStudent(currentStudentId);
  students = await storeListStudents();
  renderStudentSelect();
  if (students.length === 0) {          // no profiles left -> back to the welcome screen
    currentStudentId = null;
    lsSet(LS.current, "");
    showWelcome();
    return;
  }
  currentStudentId = students[0].id;
  lsSet(LS.current, currentStudentId);
  await loadStudentState(currentStudentId);
}

/* ---------- Export / Import to a file ---------- */
function exportStudent() {
  const student = students.find(s => s.id === currentStudentId);
  const payload = {
    app: "pytrainer", version: 1,
    student: student ? student.name : "Student",
    exportedAt: new Date().toISOString(),
    data: buildBundle()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pytrainer_" + safeName(payload.student) + ".json";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importStudentFile(file) {
  const reader = new FileReader();
  reader.onload = async () => {
    let payload;
    try { payload = JSON.parse(reader.result); }
    catch (e) { alert("That file isn't valid JSON."); return; }
    if (!payload || payload.app !== "pytrainer" || !payload.data) {
      alert("That doesn't look like a PyTrainer export file."); return;
    }
    const cur = students.find(s => s.id === currentStudentId);
    if (!confirm('Import "' + (payload.student || "?") + '" into the current profile "' +
                 (cur ? cur.name : "") + '"?\nThis replaces their current progress, code, and chat.')) return;
    const d = normalizeBundle(payload.data);
    completed = new Set(d.done);
    chatHistory = d.chat;
    codeMap = d.code;
    await storeSaveBundle(currentStudentId, { done: [...completed], lastLesson: d.lastLesson, chat: chatHistory, code: codeMap });
    await loadStudentState(currentStudentId);
    alert('Imported into "' + (cur ? cur.name : "") + '".');
  };
  reader.readAsText(file);
}

/* ============================================================================
 * API key dropdown
 * ==========================================================================*/
// Refresh the key panel's input + note to match the current key state.
function updateKeyPanelDisplay() {
  const inp = $("#api-key");
  if (serverMode) {
    inp.value = "";
    inp.placeholder = serverHasKey ? "•••••••• (a key is saved — type to replace)" : "sk-ant-...";
    $("#key-note").textContent = serverHasKey
      ? "A key is saved on the server (.env file). Type a new one to replace it, or click Erase key to remove it."
      : "Enter your key — it's saved to a .env file on this computer (the server reads it), never in the browser.";
  } else {
    inp.value = lsGet(LS.apiKey, "");
    inp.placeholder = "sk-ant-...";
    $("#key-note").textContent =
      "Stored only in this browser and sent only to api.anthropic.com. Use a personal key with spending limits.";
  }
}

function toggleKeyPanel(force) {
  const dd = $("#key-dropdown");
  const show = force !== undefined ? force : !dd.classList.contains("show");
  if (show) {
    updateKeyPanelDisplay();
    dd.classList.add("show");
    $("#api-key").focus();
  } else {
    dd.classList.remove("show");
  }
}

async function saveKey() {
  const val = $("#api-key").value.trim();
  if (serverMode) {
    let r;
    try {
      r = await fetch("/api/key", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: val })
      });
    } catch (e) { alert("Could not reach the server to save the key."); return; }
    if (!r.ok) {
      alert("The server couldn't save the key (HTTP " + r.status + ").\n\n" +
            "This usually means the server is running older code. Restart it — run " +
            "stop_trainer.bat, then start_trainer.bat (or start_trainer_hidden.vbs) again — " +
            "and try Apply once more.");
      return;
    }
    const j = await r.json().catch(() => ({}));
    serverHasKey = !!j.hasKey;
  } else {
    lsSet(LS.apiKey, val);
  }
  toggleKeyPanel(false);
  renderChat();
}

async function clearKey() {
  if (serverMode) {
    try {
      const r = await fetch("/api/key", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ key: "" })
      });
      const j = await r.json().catch(() => ({}));
      serverHasKey = !!j.hasKey;
    } catch (e) {}
  } else {
    try { localStorage.removeItem(LS.apiKey); } catch (e) {}
  }
  updateKeyPanelDisplay();   // refresh so it no longer says "a key is saved"
  renderChat();              // restores the "add your API key" hint
}

// Delete the current student, then go to the Welcome screen to make a new one.
// Keeps the API key and any other students.
async function deleteStudentStartOver() {
  toggleKeyPanel(false);
  if (!currentStudentId) { showWelcome(); return; }
  const cur = students.find(s => s.id === currentStudentId);
  const name = cur ? cur.name : "";
  if (!confirm('Delete "' + name + '" and their saved work, then start over with a new name?\n' +
               'Your API key is kept. (Tip: Export first to keep a copy.)')) return;
  try { await storeDeleteStudent(currentStudentId); } catch (e) {}
  students = await storeListStudents();
  currentStudentId = null;
  lsSet(LS.current, "");
  currentLesson = null;
  completed = new Set();
  chatHistory = [];
  codeMap = {};
  renderStudentSelect();
  renderChat();
  showWelcome();
}

// Full wipe: all profiles + their saved work, all progress/code/chat, layout, and the API key.
async function resetEverything() {
  if (!confirm("Reset EVERYTHING?\n\n" +
    "This permanently deletes all student profiles and their saved work, clears all " +
    "progress, code, and tutor chat, and erases the API key. This cannot be undone.")) return;

  // remove every student profile (deletes their folder in server mode)
  for (const s of students.slice()) {
    try { await storeDeleteStudent(s.id); } catch (e) {}
  }
  // clear all of this app's browser storage (keys are prefixed "ipt.")
  try {
    const toDel = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("ipt.")) toDel.push(k);
    }
    toDel.forEach(k => localStorage.removeItem(k));
  } catch (e) {}

  // reset in-memory state and layout
  students = [];
  currentStudentId = null;
  currentLesson = null;
  completed = new Set();
  chatHistory = [];
  codeMap = {};
  document.documentElement.style.removeProperty("--sidebar-w");
  document.documentElement.style.removeProperty("--tutor-w");
  $("#api-key").value = "";

  toggleKeyPanel(false);
  renderStudentSelect();
  renderChat();
  showWelcome();
}

/* ============================================================================
 * Tutor (Anthropic API, streamed, direct from browser)
 * ==========================================================================*/
const TUTOR_SYSTEM = `You are an expert, friendly Python tutor embedded in an interactive coding app for learners ranging from beginner to expert.

Guidelines:
- Be concise and encouraging. Use short code examples where helpful.
- When the learner is stuck on the current exercise, GUIDE them with hints and questions first. Only give the full solution if they explicitly ask for it or are clearly frustrated.
- Explain the "why", not just the "what".
- Reference the learner's current lesson and the code in their editor when relevant.
- Format responses in Markdown. Use fenced code blocks for code.`;

function tutorSystem() {
  const name = currentStudentName();
  return TUTOR_SYSTEM + (name
    ? `\n\nThe learner's name is ${name}. Greet and address them by name naturally and warmly — but don't overdo it (about once or twice per reply at most).`
    : "");
}

function contextBlock() {
  if (!currentLesson) return "";
  const code = editor ? editor.getValue() : "";
  return `\n\n[Current lesson: "${currentLesson.title}"]\n` +
         `[Exercise: ${currentLesson.exercise.prompt.replace(/<[^>]+>/g, "")}]\n` +
         `[Learner's current editor code:]\n\`\`\`python\n${code}\n\`\`\``;
}

function renderChat() {
  el.chat.innerHTML = "";
  if (chatHistory.length === 0) {
    const name = currentStudentName();
    const hi = name ? `Hi ${escapeHtml(name)}! ` : "";
    const hasKey = serverMode ? serverHasKey : !!lsGet(LS.apiKey, "");
    const hint = hasKey ? "" :
      `<br /><br />Add your Anthropic API key with the <b>🔑 API Key</b> button to begin.`;
    el.chat.innerHTML =
      `<div class="empty">${hi}Ask the tutor anything about Python or your current exercise.<br />` +
      `It can see the lesson and the code in your editor.` + hint + `</div>`;
    return;
  }
  chatHistory.forEach(m => addMsgEl(m.role, m.content));
  el.chat.scrollTop = el.chat.scrollHeight;
}

function addMsgEl(role, content) {
  const wrap = document.createElement("div");
  wrap.className = "msg " + role;
  const who = document.createElement("div");
  who.className = "who";
  who.textContent = role === "user" ? "You" : "Tutor";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (role === "assistant") bubble.innerHTML = renderMarkdown(content);
  else bubble.textContent = content;
  wrap.appendChild(who); wrap.appendChild(bubble);
  el.chat.appendChild(wrap);
  return bubble;
}

function renderMarkdown(text) {
  try {
    const html = marked.parse(text, { breaks: true });
    // Sanitize model output before inserting as HTML (defense against a
    // prompt-injected response emitting <script>/<img onerror> etc.).
    if (typeof DOMPurify !== "undefined") return DOMPurify.sanitize(html);
    return escapeHtml(text);   // sanitizer unavailable -> render as safe plain text
  } catch (e) { return escapeHtml(text); }
}

async function sendMessage(text) {
  // Server mode: the key lives in the server's ANTHROPIC_API_KEY env var (never in the browser).
  // File mode: fall back to a key pasted into the browser.
  if (serverMode) {
    if (!serverHasKey) { await refreshServerKey(); }
    if (!serverHasKey) { toggleKeyPanel(true); return; }   // prompt to enter a key
  } else {
    if (!lsGet(LS.apiKey, "")) { toggleKeyPanel(true); return; }
  }
  if (streaming) return;
  text = text.trim();
  if (!text) return;

  chatHistory.push({ role: "user", content: text });
  renderChat();
  el.chatInput.value = ""; autoGrow();

  streaming = true;
  const bubble = addMsgEl("assistant", "");
  bubble.innerHTML = '<span class="muted">…thinking…</span>';
  el.chat.scrollTop = el.chat.scrollHeight;

  const apiMessages = chatHistory.map((m, i) => {
    if (i === chatHistory.length - 1 && m.role === "user") return { role: "user", content: m.content + contextBlock() };
    return { role: m.role, content: m.content };
  });

  const model = el.modelSelect.value || lsGet(LS.model, "claude-opus-4-8");
  let acc = "";

  // Server mode -> local proxy (key stays in the server env var).
  // File mode   -> direct browser call with the pasted key.
  const url = serverMode ? "/api/tutor" : "https://api.anthropic.com/v1/messages";
  const headers = serverMode
    ? { "content-type": "application/json" }
    : {
        "content-type": "application/json",
        "x-api-key": lsGet(LS.apiKey, ""),
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      };

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ model, max_tokens: 1500, system: tutorSystem(), messages: apiMessages, stream: true })
    });

    if (!resp.ok) {
      let msg = "HTTP " + resp.status;
      try { const j = await resp.json(); if (j.error && j.error.message) msg = j.error.message; } catch (e) {}
      bubble.innerHTML = `<span class="err">API error: ${escapeHtml(msg)}</span>`;
      chatHistory.push({ role: "assistant", content: "_(error: " + msg + ")_" });
      streaming = false; persist(); return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let nl;
      while ((nl = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]" || !data) continue;
        try {
          const ev = JSON.parse(data);
          if (ev.type === "content_block_delta" && ev.delta && ev.delta.type === "text_delta") {
            acc += ev.delta.text;
            bubble.innerHTML = renderMarkdown(acc);
            el.chat.scrollTop = el.chat.scrollHeight;
          } else if (ev.type === "error" && ev.error) {
            acc += "\n\n_[stream error: " + ev.error.message + "]_";
            bubble.innerHTML = renderMarkdown(acc);
          }
        } catch (e) { /* ignore keep-alives / partial json */ }
      }
    }

    if (!acc) { acc = "_(no response)_"; bubble.innerHTML = renderMarkdown(acc); }
    chatHistory.push({ role: "assistant", content: acc });
  } catch (e) {
    const emsg = String(e.message || e);
    bubble.innerHTML =
      `<span class="err">Request failed: ${escapeHtml(emsg)}</span>` +
      `<br /><span class="muted">If this mentions CORS or network, check your internet connection and that the key is valid.</span>`;
    chatHistory.push({ role: "assistant", content: "_(request failed: " + emsg + ")_" });
  } finally {
    streaming = false;
    persist();
    el.chat.scrollTop = el.chat.scrollHeight;
  }
}

function autoGrow() {
  const ta = el.chatInput;
  ta.style.height = "auto";
  ta.style.height = Math.min(ta.scrollHeight, 300) + "px";
}

/* ============================================================================
 * Quick-action chips
 * ==========================================================================*/
const QUICK = [
  { label: "Give me a hint", text: "I'm stuck on this exercise. Give me a small hint without the full solution." },
  { label: "Explain my error", text: "Look at my code and the exercise. What's wrong and why?" },
  { label: "Review my code", text: "Review my current code for style and correctness. Keep it brief." },
  { label: "Show the solution", text: "Please show and explain a correct solution to this exercise." }
];
function renderQuick() {
  el.quick.innerHTML = "";
  QUICK.forEach(q => {
    const b = document.createElement("button");
    b.textContent = q.label;
    b.onclick = () => sendMessage(q.text);
    el.quick.appendChild(b);
  });
}

// Reset the tutor conversation so explanations don't pile up across exercises.
function clearChat() {
  if (streaming) return;
  if (chatHistory.length && !confirm("Clear this tutor conversation?\nYour lessons and code are not affected.")) return;
  chatHistory = [];
  renderChat();
  persist();
}

/* ============================================================================
 * Resizable panels — drag a divider; double-click it to reset to default
 * ==========================================================================*/
// opts: { el, varName, key, def, min, maxFn, widthFrom }
function makeSplitter(opts) {
  const sp = opts.el;
  if (!sp) return;

  const apply = (w) => {
    w = Math.max(opts.min, Math.min(opts.maxFn(), w));
    document.documentElement.style.setProperty(opts.varName, w + "px");
  };
  const saved = parseInt(lsGet(opts.key, ""), 10);
  if (saved) apply(saved);

  let dragging = false;
  const start = (e) => { dragging = true; sp.classList.add("dragging"); document.body.style.userSelect = "none"; e.preventDefault(); };
  const onMove = (e) => {
    if (!dragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    apply(opts.widthFrom(x));
  };
  const stop = () => {
    if (!dragging) return;
    dragging = false;
    sp.classList.remove("dragging");
    document.body.style.userSelect = "";
    const w = parseInt(getComputedStyle(document.documentElement).getPropertyValue(opts.varName), 10);
    if (w) lsSet(opts.key, String(w));
    if (editor) editor.refresh();   // realign CodeMirror after the code pane resized
  };

  sp.addEventListener("mousedown", start);
  sp.addEventListener("touchstart", start, { passive: false });
  window.addEventListener("mousemove", onMove);
  window.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("mouseup", stop);
  window.addEventListener("touchend", stop);

  sp.addEventListener("dblclick", () => {   // reset to default width
    document.documentElement.style.setProperty(opts.varName, opts.def + "px");
    lsSet(opts.key, String(opts.def));
    if (editor) editor.refresh();
  });
}

function initSplitters() {
  makeSplitter({
    el: $("#sidebar-splitter"),
    varName: "--sidebar-w", key: "ipt.sidebarWidth", def: 260, min: 180,
    maxFn: () => Math.max(180, Math.min(460, window.innerWidth - 620)),
    widthFrom: (x) => x                       // sidebar is the leftmost column
  });
  makeSplitter({
    el: $("#splitter"),
    varName: "--tutor-w", key: "ipt.tutorWidth", def: 380, min: 300,
    maxFn: () => Math.max(300, window.innerWidth - 480),
    widthFrom: (x) => window.innerWidth - x   // tutor is the rightmost column
  });
}

/* ============================================================================
 * Boot
 * ==========================================================================*/
async function boot() {
  initEditor();
  initSplitters();
  renderQuick();

  // model choice
  el.modelSelect.value = lsGet(LS.model, "claude-opus-4-8");
  el.modelSelect.onchange = () => lsSet(LS.model, el.modelSelect.value);

  // editor / grading buttons
  $("#btn-run").onclick    = runCode;
  $("#btn-check").onclick  = checkCode;
  $("#btn-stop").onclick   = stopExecution;
  $("#btn-reset").onclick  = resetCode;
  $("#btn-explain").onclick = () =>
    sendMessage("Explain the concept in this lesson simply, then walk me through what the exercise is asking.");

  // student controls
  $("#btn-exit").onclick = exitToWelcome;
  $("#student-select").onchange = e => switchStudent(e.target.value);
  $("#btn-new-student").onclick = () => toggleNewStudent();
  $("#btn-del-student").onclick = deleteStudent;
  const newInput = $("#new-student-input");
  newInput.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); const v = newInput.value; toggleNewStudent(false); newStudent(v); }
    else if (e.key === "Escape") { toggleNewStudent(false); }
  });
  newInput.addEventListener("blur", () => toggleNewStudent(false));
  $("#btn-export").onclick = exportStudent;
  $("#btn-import").onclick = () => $("#import-file").click();
  $("#import-file").onchange = e => {
    if (e.target.files && e.target.files[0]) importStudentFile(e.target.files[0]);
    e.target.value = "";
  };

  // API key dropdown
  $("#btn-key").onclick = () => toggleKeyPanel();
  $("#btn-apply-key").onclick = saveKey;
  $("#btn-clear-key").onclick = clearKey;
  $("#btn-del-student-2").onclick = deleteStudentStartOver;
  $("#btn-reset-all").onclick = resetEverything;
  $("#api-key").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); saveKey(); } });
  document.addEventListener("click", e => {
    const wrap = $("#key-wrap");
    if (wrap && !wrap.contains(e.target)) toggleKeyPanel(false);
  });

  // tutor composer
  $("#btn-send").onclick = () => sendMessage(el.chatInput.value);
  $("#btn-clear-chat").onclick = clearChat;
  el.chatInput.addEventListener("input", autoGrow);
  el.chatInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(el.chatInput.value); }
  });

  // welcome screen (first run, or after deleting every profile)
  $("#welcome-start").onclick = () => newStudent($("#welcome-name").value);
  $("#welcome-name").addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); newStudent($("#welcome-name").value); }
  });

  // make sure the latest work is saved even if the tab/window closes abruptly
  window.addEventListener("beforeunload", () => {
    if (persistTimer) { clearTimeout(persistTimer); persistTimer = null; }
    if (!currentStudentId) return;
    const bundle = buildBundle();
    if (serverMode && navigator.sendBeacon) {
      try {
        navigator.sendBeacon("/api/progress?student=" + encodeURIComponent(currentStudentId),
          new Blob([JSON.stringify(bundle)], { type: "application/json" }));
      } catch (e) {}
    } else {
      try { storeSaveBundle(currentStudentId, bundle); } catch (e) {}
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushPersist();
  });

  // start loading Python (worker) in the background
  createWorker();

  // detect server mode, load students + their work
  serverMode = await detectServer();
  if (serverMode) el.pyStatus.title = "Auto-saving to the students/ folder";
  await loadStudents();
  renderStudentSelect();
  if (currentStudentId) await loadStudentState(currentStudentId);
  else showWelcome();
}

window.addEventListener("DOMContentLoaded", boot);
