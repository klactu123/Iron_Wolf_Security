import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import { fileURLToPath } from "url";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { analyze, stream, hasApiKey, resetClient, MODEL } from "./providers.js";
import { preprocessEmail } from "./preprocessor.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3002;

// SECURITY: Do NOT enable trust proxy — it would allow X-Forwarded-For spoofing
// which would bypass the isLocalhost check for sensitive endpoints.
app.set("trust proxy", false);

// ---------------------------------------------------------------------------
// Security middleware
// ---------------------------------------------------------------------------
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || "http://localhost:5174,http://localhost:3002")
  .split(",")
  .map((o) => o.trim())
  .filter((o) => {
    if (o === "*") {
      console.warn("SECURITY WARNING: Wildcard CORS origin '*' rejected. Use specific origins.");
      return false;
    }
    try { new URL(o); return true; } catch { return false; }
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
  })
);

// Global rate limit: 120 requests per minute
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again in a moment." },
  })
);

// Stricter limits for expensive endpoints
const analyzeLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  message: { error: "Analysis rate limit reached. Please wait before trying again." },
});

app.use(express.json({ limit: "1mb" }));

// ---------------------------------------------------------------------------
// Claude API error message helper
// ---------------------------------------------------------------------------
function getClaudeErrorMessage(error) {
  const msg = error?.error?.error?.message || error?.message || "";
  if (msg.includes("credit balance is too low")) {
    return "Anthropic API credit balance is too low. Please add credits at console.anthropic.com/settings/billing.";
  }
  if (msg.includes("invalid x-api-key") || msg.includes("invalid api key")) {
    return "Anthropic API key is invalid. Please check your key in Settings.";
  }
  if (error.status === 429) {
    return "Claude API rate limit reached after multiple retries. Please wait 60 seconds before trying again.";
  }
  if (error.status === 401) {
    return "Anthropic API authentication failed. Please check your API key in Settings.";
  }
  return "Analysis service temporarily unavailable. Please try again.";
}

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------
const MAX_EMAIL_LENGTH = 500_000; // 500KB max email size

function validateEmailInput(req, res) {
  const { email } = req.body;
  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "Missing or invalid email content." });
    return false;
  }
  if (email.trim().length < 10) {
    res.status(400).json({ error: "Email content too short to analyze. Please paste the full email." });
    return false;
  }
  if (email.length > MAX_EMAIL_LENGTH) {
    res.status(400).json({ error: "Email content exceeds maximum size (500KB)." });
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
  res.json({
    status: "ok",
    tool: "phishing-analyzer",
    hasClaudeKey: hasApiKey(),
  });
});

// ---------------------------------------------------------------------------
// POST /api/analyze — Non-streaming phishing analysis
// ---------------------------------------------------------------------------
app.post("/api/analyze", analyzeLimiter, async (req, res) => {
  if (!validateEmailInput(req, res)) return;

  const { email } = req.body;
  const trimmedEmail = preprocessEmail(email);

  try {
    const { getSystemPrompt } = await import("../src/prompts/system.js");
    const systemPrompt = getSystemPrompt();

    const result = await analyze(trimmedEmail, systemPrompt);
    res.json(result);
  } catch (error) {
    console.error("Claude API error:", error.message?.substring(0, 500));
    const userMessage = getClaudeErrorMessage(error);
    res.status(error.status >= 400 && error.status < 600 ? error.status : 500).json({ error: userMessage });
  }
});

// ---------------------------------------------------------------------------
// POST /api/analyze/stream — Streaming phishing analysis via SSE
// ---------------------------------------------------------------------------
const STREAM_TIMEOUT_MS = 180_000; // 3 minutes max

app.post("/api/analyze/stream", analyzeLimiter, async (req, res) => {
  if (!validateEmailInput(req, res)) return;

  const { email } = req.body;
  const trimmedEmail = preprocessEmail(email);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  // SSE timeout — prevent connections from hanging indefinitely
  const streamTimeout = setTimeout(() => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: "error", error: "Analysis timed out. Please try again." })}\n\n`);
      res.end();
    }
  }, STREAM_TIMEOUT_MS);

  try {
    const { getSystemPrompt } = await import("../src/prompts/system.js");
    const systemPrompt = getSystemPrompt();

    let aborted = false;
    req.on("close", () => { aborted = true; clearTimeout(streamTimeout); });

    await stream(trimmedEmail, systemPrompt, res);
    clearTimeout(streamTimeout);
    if (!aborted) res.end();
  } catch (error) {
    clearTimeout(streamTimeout);
    console.error("Claude API streaming error:", error.message?.substring(0, 500));
    if (!res.writableEnded) {
      const userMessage = getClaudeErrorMessage(error);
      res.write(
        `data: ${JSON.stringify({ type: "error", error: userMessage })}\n\n`
      );
      res.end();
    }
  }
});

// ---------------------------------------------------------------------------
// Localhost check
// ---------------------------------------------------------------------------
function isLocalhost(req) {
  const ip = req.ip || req.connection?.remoteAddress || "";
  return ["127.0.0.1", "::1", "::ffff:127.0.0.1", "localhost"].includes(ip);
}

// ---------------------------------------------------------------------------
// POST /api/settings/api-key — Set Anthropic API key (localhost only)
// ---------------------------------------------------------------------------
const settingsLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  message: { error: "Settings rate limit reached. Please wait before trying again." },
});

app.post("/api/settings/api-key", settingsLimiter, (req, res) => {
  if (!isLocalhost(req)) {
    return res.status(403).json({ error: "This endpoint is only available from localhost." });
  }

  const { key } = req.body || {};
  if (!key || typeof key !== "string") {
    return res.status(400).json({ error: "Missing API key." });
  }

  if (!key.startsWith("sk-ant-") || key.length < 40 || key.length > 200) {
    return res.status(400).json({ error: "Invalid API key format. Key must start with 'sk-ant-' and be 40-200 characters." });
  }

  // Reject control characters and newlines to prevent .env injection
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

// DELETE /api/settings/api-key
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
const shutdownLimiter = rateLimit({
  windowMs: 60_000,
  max: 3,
  message: { error: "Shutdown rate limit reached." },
});

app.post("/api/shutdown", shutdownLimiter, (req, res) => {
  if (!isLocalhost(req)) {
    return res.status(403).json({ error: "Shutdown is only available from localhost." });
  }

  const { confirm } = req.body || {};
  if (confirm !== true) {
    return res.status(400).json({ error: "Missing confirmation." });
  }

  res.json({ status: "shutting down" });
  setTimeout(() => {
    // Kill the entire process tree (Express + Vite + concurrently + command window)
    try {
      execSync(`taskkill /F /T /PID ${process.ppid}`, { shell: "cmd.exe", stdio: "ignore" });
    } catch { /* fallback: kill Vite by port, then exit */ }
    try {
      execSync('for /f "tokens=5" %a in (\'netstat -ano ^| findstr ":5174 "\') do taskkill /F /PID %a', { shell: "cmd.exe", stdio: "ignore" });
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

// Bind to localhost only — not exposed to the network
const server = app.listen(PORT, "127.0.0.1", () => {
  console.log(`Iron Wolf Phishing Analyzer API running on http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n  [ERROR] Port ${PORT} is already in use.`);
    console.error(`  Another instance may be running. Close it and try again.\n`);
  } else {
    console.error(`\n  [ERROR] Server failed to start:`, err.message, "\n");
  }
  process.exit(1);
});
