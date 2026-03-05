/**
 * Claude API LLM Provider for Policy Generator
 *
 * Uses the Anthropic SDK with web_search tool for framework verification.
 * API key is server-side only (ANTHROPIC_API_KEY in .env).
 * Includes retry with exponential backoff for rate limit (429) errors.
 */

import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-6";
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 15_000;

let client = null;
let clientKey = null;

function getClient() {
  const currentKey = process.env.ANTHROPIC_API_KEY;
  if (!client || clientKey !== currentKey) {
    client = new Anthropic({ apiKey: currentKey });
    clientKey = currentKey;
  }
  return client;
}

export function hasApiKey() {
  return !!process.env.ANTHROPIC_API_KEY;
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

/**
 * Streaming generation/review via SSE.
 */
export async function stream(userMessage, systemPrompt, res) {
  const anthropic = getClient();

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const messageStream = anthropic.messages.stream({
        model: MODEL,
        max_tokens: 16000,
        system: systemPrompt,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: userMessage }],
      });

      let searchCount = 0;
      let totalBytes = 0;
      let abortedDueToSize = false;
      const MAX_STREAM_BYTES = 300_000; // policies can be long

      messageStream.on("contentBlockStart", (event) => {
        if (event.content_block?.type === "server_tool_use") {
          searchCount++;
          try {
            res.write(
              `data: ${JSON.stringify({ type: "status", text: `Researching framework requirements... (search ${searchCount})` })}\n\n`
            );
          } catch { /* socket closed */ }
        }
      });

      messageStream.on("text", (text) => {
        totalBytes += Buffer.byteLength(text, "utf8");
        if (totalBytes > MAX_STREAM_BYTES) {
          abortedDueToSize = true;
          try {
            res.write(`data: ${JSON.stringify({ type: "error", error: "Response exceeded maximum size." })}\n\n`);
          } catch { /* socket closed */ }
          messageStream.abort();
          return;
        }
        try {
          res.write(`data: ${JSON.stringify({ type: "text", text })}\n\n`);
        } catch { /* socket closed */ }
      });

      const finalMessage = await messageStream.finalMessage();

      if (abortedDueToSize) return;

      try {
        res.write(
          `data: ${JSON.stringify({
            type: "done",
            usage: {
              input_tokens: finalMessage.usage?.input_tokens || 0,
              output_tokens: finalMessage.usage?.output_tokens || 0,
            },
          })}\n\n`
        );
      } catch { /* socket closed */ }

      return;
    } catch (error) {
      if (error.status === 429 && attempt < MAX_RETRIES) {
        const delay = getRetryDelay(error, attempt);
        const waitSec = Math.round(delay / 1000);
        console.log(`Rate limited (attempt ${attempt + 1}/${MAX_RETRIES}). Retrying in ${waitSec}s...`);
        try {
          res.write(
            `data: ${JSON.stringify({ type: "status", text: `Rate limited — retrying in ${waitSec}s (attempt ${attempt + 1}/${MAX_RETRIES})...` })}\n\n`
          );
        } catch { /* socket closed */ }
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
}

export function resetClient() {
  client = null;
}

export { MODEL };
