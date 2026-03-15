/**
 * Claude API LLM Provider
 *
 * Uses the Anthropic SDK with web_search tool for real-time intelligence research.
 * API key is server-side only (ANTHROPIC_API_KEY in .env).
 * Includes retry with exponential backoff for rate limit (429) errors.
 */

import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 16000;
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 15_000;
const MAX_STREAM_BYTES = 300_000; // 300KB safety limit

let client = null;
let clientKey = null;

function getClient() {
  const currentKey = process.env.ANTHROPIC_API_KEY;
  if (!client || clientKey !== currentKey) {
    if (!currentKey) return null;
    client = new Anthropic({ apiKey: currentKey });
    clientKey = currentKey;
  }
  return client;
}

export function resetClient() {
  client = null;
  clientKey = null;
}

export function hasApiKey() {
  return !!(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.startsWith("sk-ant-"));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryDelay(error, attempt) {
  const retryAfter = error?.headers?.["retry-after"];
  if (retryAfter) {
    const seconds = parseFloat(retryAfter);
    if (!isNaN(seconds)) return seconds * 1000;
  }
  return BASE_DELAY_MS * Math.pow(2, attempt);
}

// ---------------------------------------------------------------------------
// Streaming analysis with web search + retry
// ---------------------------------------------------------------------------
export async function stream(userMessage, systemPrompt, res) {
  const api = getClient();
  if (!api) throw Object.assign(new Error("No API key configured"), { status: 401 });

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const messageStream = api.messages.stream({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
        tools: [{ type: "web_search_20250305", name: "web_search" }],
      });

      let searchCount = 0;
      let totalBytes = 0;

      messageStream.on("contentBlockStart", (event) => {
        if (event.content_block?.type === "server_tool_use") {
          searchCount++;
          if (!res.writableEnded) {
            try {
              res.write(`data: ${JSON.stringify({ type: "status", text: `Researching intelligence sources... (search ${searchCount})` })}\n\n`);
            } catch (writeErr) {
              console.error("SSE write error (status):", writeErr.message);
              messageStream.abort();
            }
          }
        }
      });

      messageStream.on("text", (text) => {
        totalBytes += Buffer.byteLength(text, "utf8");
        if (totalBytes > MAX_STREAM_BYTES) {
          if (!res.writableEnded) {
            try {
              res.write(`data: ${JSON.stringify({ type: "error", error: "Response exceeded maximum size." })}\n\n`);
            } catch (writeErr) {
              console.error("SSE write error (size limit):", writeErr.message);
            }
          }
          messageStream.abort();
          return;
        }
        if (!res.writableEnded) {
          try {
            res.write(`data: ${JSON.stringify({ type: "text", text })}\n\n`);
          } catch (writeErr) {
            console.error("SSE write error (text):", writeErr.message);
            messageStream.abort();
          }
        }
      });

      const finalMessage = await messageStream.finalMessage();

      if (!res.writableEnded) {
        res.write(
          `data: ${JSON.stringify({
            type: "done",
            usage: {
              input_tokens: finalMessage.usage?.input_tokens || 0,
              output_tokens: finalMessage.usage?.output_tokens || 0,
            },
          })}\n\n`
        );
      }

      return; // Success — exit retry loop
    } catch (error) {
      if (error.status === 429 && attempt < MAX_RETRIES) {
        const delay = getRetryDelay(error, attempt);
        const waitSec = Math.round(delay / 1000);
        console.log(`Rate limited (attempt ${attempt + 1}/${MAX_RETRIES}). Retrying in ${waitSec}s...`);
        if (!res.writableEnded) {
          try {
            res.write(`data: ${JSON.stringify({ type: "status", text: `Rate limited — retrying in ${waitSec}s (attempt ${attempt + 1}/${MAX_RETRIES})...` })}\n\n`);
          } catch (writeErr) {
            console.error("SSE write error (retry status):", writeErr.message);
          }
        }
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
}

export { MODEL };
