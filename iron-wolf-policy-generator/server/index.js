import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import { fileURLToPath } from "url";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { stream, hasApiKey, resetClient } from "./providers.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3003;

// SECURITY: Do NOT enable trust proxy — it would allow X-Forwarded-For spoofing
app.set("trust proxy", false);

// ---------------------------------------------------------------------------
// Security middleware
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || "http://localhost:5175,http://localhost:3003")
  .split(",")
  .map((o) => o.trim())
  .filter((o) => {
    if (o === "*") {
      console.warn("SECURITY WARNING: Wildcard CORS origin '*' rejected.");
      return false;
    }
    try {
      const parsed = new URL(o);
      if (!["http:", "https:"].includes(parsed.protocol)) return false;
      if (parsed.username || parsed.password) return false;
      return true;
    } catch { return false; }
  });

app.use(cors({ origin: ALLOWED_ORIGINS }));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    referrerPolicy: { policy: "no-referrer" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
  })
);

app.use(
  rateLimit({
    windowMs: 60_000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again in a moment." },
  })
);

const analyzeLimiter = rateLimit({
  windowMs: 60_000,
  max: 15,
  message: { error: "Generation rate limit reached. Please wait before trying again." },
});

app.use(express.json({ limit: "1mb" }));

// ---------------------------------------------------------------------------
// Claude API error message helper
// ---------------------------------------------------------------------------
function getClaudeErrorMessage(error) {
  const msg = error?.error?.error?.message || error?.message || "";
  if (msg.includes("credit balance is too low")) {
    return "API credit balance is too low. Please check your billing settings.";
  }
  if (msg.includes("invalid x-api-key") || msg.includes("invalid api key")) {
    return "API key is invalid. Please check your key in Settings.";
  }
  if (error.status === 429) {
    return "Rate limit reached. Please wait 60 seconds before trying again.";
  }
  if (error.status === 401) {
    return "API authentication failed. Please check your API key in Settings.";
  }
  return "Service temporarily unavailable. Please try again.";
}

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------
const VALID_FRAMEWORKS = ["nist-800-53", "cis-v8", "iso-27001", "cmmc"];
const VALID_POLICY_TYPES = [
  "acceptable-use", "incident-response", "access-control", "data-classification",
  "password", "remote-work", "encryption", "vendor-management",
  "change-management", "backup-recovery", "network-security", "mobile-device",
];
const MAX_POLICY_LENGTH = 200_000; // 200KB for review mode
const MAX_CONTEXT_LENGTH = 5_000;  // 5KB for org context

function validateGenerateInput(req, res) {
  const { framework, policyType, orgContext } = req.body;
  if (!framework || !VALID_FRAMEWORKS.includes(framework)) {
    res.status(400).json({ error: "Invalid framework. Choose from: " + VALID_FRAMEWORKS.join(", ") });
    return false;
  }
  if (!policyType || !VALID_POLICY_TYPES.includes(policyType)) {
    res.status(400).json({ error: "Invalid policy type." });
    return false;
  }
  if (orgContext && (typeof orgContext !== "string" || orgContext.length > MAX_CONTEXT_LENGTH)) {
    res.status(400).json({ error: "Organization context exceeds maximum size (5KB)." });
    return false;
  }
  return true;
}

function validateReviewInput(req, res) {
  const { framework, policy } = req.body;
  if (!framework || !VALID_FRAMEWORKS.includes(framework)) {
    res.status(400).json({ error: "Invalid framework. Choose from: " + VALID_FRAMEWORKS.join(", ") });
    return false;
  }
  if (!policy || typeof policy !== "string") {
    res.status(400).json({ error: "Missing policy content." });
    return false;
  }
  if (policy.trim().length < 50) {
    res.status(400).json({ error: "Policy content too short. Please paste the full policy." });
    return false;
  }
  if (policy.length > MAX_POLICY_LENGTH) {
    res.status(400).json({ error: "Policy content exceeds maximum size (200KB)." });
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
const healthLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  message: { error: "Health check rate limit reached." },
});

app.get("/api/health", healthLimiter, (req, res) => {
  const body = { status: "ok", tool: "policy-generator" };
  if (isLocalhost(req)) {
    body.hasClaudeKey = hasApiKey();
  }
  res.json(body);
});

// ---------------------------------------------------------------------------
// POST /api/generate/stream — Generate a policy via SSE
// ---------------------------------------------------------------------------
const STREAM_TIMEOUT_MS = 180_000;

app.post("/api/generate/stream", analyzeLimiter, async (req, res) => {
  if (!validateGenerateInput(req, res)) return;

  const { framework, policyType, orgContext } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("X-Content-Type-Options", "nosniff");

  const streamTimeout = setTimeout(() => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: "error", error: "Generation timed out. Please try again." })}\n\n`);
      res.end();
    }
  }, STREAM_TIMEOUT_MS);

  try {
    const { getGeneratePrompt, POLICY_TYPES } = await import("../src/prompts/system.js");
    const systemPrompt = getGeneratePrompt(framework, policyType, orgContext);
    const policyDesc = POLICY_TYPES[policyType] || policyType;
    const userMessage = `Generate a complete ${policyDesc} aligned to the ${framework} framework. Include all required sections with specific, auditable policy statements and framework control references.`;

    let aborted = false;
    req.on("close", () => { aborted = true; clearTimeout(streamTimeout); });

    await stream(userMessage, systemPrompt, res);
    clearTimeout(streamTimeout);
    if (!aborted) res.end();
  } catch (error) {
    clearTimeout(streamTimeout);
    console.error("Claude API error:", (error.message || "unknown").substring(0, 200).replace(/sk-ant-[a-zA-Z0-9_-]+/g, "[REDACTED]"));
    if (!res.writableEnded) {
      const userMessage = getClaudeErrorMessage(error);
      res.write(`data: ${JSON.stringify({ type: "error", error: userMessage })}\n\n`);
      res.end();
    }
  }
});

// ---------------------------------------------------------------------------
// POST /api/review/stream — Review a policy via SSE
// ---------------------------------------------------------------------------
app.post("/api/review/stream", analyzeLimiter, async (req, res) => {
  if (!validateReviewInput(req, res)) return;

  const { framework, policy } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("X-Content-Type-Options", "nosniff");

  const streamTimeout = setTimeout(() => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: "error", error: "Review timed out. Please try again." })}\n\n`);
      res.end();
    }
  }, STREAM_TIMEOUT_MS);

  try {
    const { getReviewPrompt } = await import("../src/prompts/system.js");
    const systemPrompt = getReviewPrompt(framework);
    const userMessage = `Review the following security policy for compliance against the ${framework} framework. Identify all gaps, weaknesses, and areas for improvement.\n\n<policy>\n${policy}\n</policy>`;

    let aborted = false;
    req.on("close", () => { aborted = true; clearTimeout(streamTimeout); });

    await stream(userMessage, systemPrompt, res);
    clearTimeout(streamTimeout);
    if (!aborted) res.end();
  } catch (error) {
    clearTimeout(streamTimeout);
    console.error("Claude API error:", (error.message || "unknown").substring(0, 200).replace(/sk-ant-[a-zA-Z0-9_-]+/g, "[REDACTED]"));
    if (!res.writableEnded) {
      const userMessage = getClaudeErrorMessage(error);
      res.write(`data: ${JSON.stringify({ type: "error", error: userMessage })}\n\n`);
      res.end();
    }
  }
});

// ---------------------------------------------------------------------------
// Localhost check
// ---------------------------------------------------------------------------
function isLocalhost(req) {
  const remoteAddress = req.socket?.remoteAddress || "";
  return ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(remoteAddress);
}

// ---------------------------------------------------------------------------
// Settings — API key management (localhost only)
// ---------------------------------------------------------------------------
const settingsLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  message: { error: "Settings rate limit reached." },
});

app.post("/api/settings/api-key", settingsLimiter, (req, res) => {
  if (!isLocalhost(req)) {
    return res.status(403).json({ error: "This endpoint is only available from localhost." });
  }
  const { key } = req.body || {};
  if (!key || typeof key !== "string") {
    return res.status(400).json({ error: "Missing API key." });
  }
  if (!key.startsWith("sk-ant-") || key.length < 40 || key.length > 120) {
    return res.status(400).json({ error: "Invalid API key format." });
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
    return res.status(400).json({ error: "API key contains invalid characters." });
  }

  try {
    const envPath = path.join(__dirname, "..", ".env");
    let envContent = "";
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8");
    }
    if (/^ANTHROPIC_API_KEY=.*/m.test(envContent)) {
      envContent = envContent.replace(/^ANTHROPIC_API_KEY=.*/m, `ANTHROPIC_API_KEY=${key}`);
    } else {
      envContent = envContent.trimEnd() + (envContent.length ? "\n" : "") + `ANTHROPIC_API_KEY=${key}\n`;
    }
    fs.writeFileSync(envPath, envContent, "utf-8");
    process.env.ANTHROPIC_API_KEY = key;
    resetClient();
    console.log("Anthropic API key updated via settings.");
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to save API key:", err.message);
    res.status(500).json({ error: "Failed to save API key." });
  }
});

app.delete("/api/settings/api-key", settingsLimiter, (req, res) => {
  if (!isLocalhost(req)) {
    return res.status(403).json({ error: "This endpoint is only available from localhost." });
  }
  const { confirm } = req.body || {};
  if (confirm !== true) {
    return res.status(400).json({ error: "Missing confirmation." });
  }
  try {
    const envPath = path.join(__dirname, "..", ".env");
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, "utf-8");
      envContent = envContent.replace(/^ANTHROPIC_API_KEY=.*\n?/m, "");
      fs.writeFileSync(envPath, envContent, "utf-8");
    }
    delete process.env.ANTHROPIC_API_KEY;
    resetClient();
    console.log("Anthropic API key removed via settings.");
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete API key:", err.message);
    res.status(500).json({ error: "Failed to delete API key." });
  }
});

// ---------------------------------------------------------------------------
// Shutdown (rate-limited, localhost-only)
// ---------------------------------------------------------------------------
const shutdownLimiter = rateLimit({ windowMs: 60_000, max: 3, message: { error: "Shutdown rate limit reached." } });
let shuttingDown = false;

app.post("/api/shutdown", shutdownLimiter, (req, res) => {
  if (!isLocalhost(req)) {
    return res.status(403).json({ error: "Shutdown is only available from localhost." });
  }
  if (shuttingDown) {
    return res.status(423).json({ error: "Shutdown already in progress." });
  }
  const { confirm } = req.body || {};
  if (confirm !== true) {
    return res.status(400).json({ error: "Missing confirmation." });
  }
  shuttingDown = true;
  res.json({ status: "shutting down" });
  setTimeout(() => {
    // Kill the entire process tree (Express + Vite + concurrently + command window)
    try {
      execSync(`taskkill /F /T /PID ${process.ppid}`, { shell: "cmd.exe", stdio: "ignore" });
    } catch { /* fallback: kill Vite by port, then exit */ }
    try {
      execSync('for /f "tokens=5" %a in (\'netstat -ano ^| findstr ":5175 "\') do taskkill /F /PID %a', { shell: "cmd.exe", stdio: "ignore" });
    } catch { /* may not be running */ }
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 2000);
  }, 500);
});

// ---------------------------------------------------------------------------
// SPA fallback
// ---------------------------------------------------------------------------
const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});

const server = app.listen(PORT, "127.0.0.1", () => {
  console.log(`Iron Wolf Policy Generator API running on http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n  [ERROR] Port ${PORT} is already in use.\n`);
  } else {
    console.error(`\n  [ERROR] Server failed to start:`, err.message, "\n");
  }
  process.exit(1);
});
