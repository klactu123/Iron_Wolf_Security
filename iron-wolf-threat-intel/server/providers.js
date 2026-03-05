import Anthropic from "@anthropic-ai/sdk";

let client = null;
export const MODEL = "claude-sonnet-4-6-20250514";
const MAX_TOKENS = 16000;
const MAX_STREAM_BYTES = 300_000; // 300KB safety limit

function getClient() {
  if (!client && process.env.ANTHROPIC_API_KEY) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export function resetClient() {
  client = null;
}

export function hasApiKey() {
  return !!(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.startsWith("sk-ant-"));
}

// ---------------------------------------------------------------------------
// Streaming analysis with web search + retry
// ---------------------------------------------------------------------------
export async function stream(userMessage, systemPrompt, res) {
  const api = getClient();
  if (!api) throw Object.assign(new Error("No API key configured"), { status: 401 });

  const attempt = async (retries = 2) => {
    try {
      const response = await api.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 10 }],
        stream: true,
      });

      let totalBytes = 0;

      for await (const event of response) {
        if (event.type === "content_block_delta") {
          if (event.delta.type === "text_delta") {
            const chunk = event.delta.text;
            totalBytes += Buffer.byteLength(chunk, "utf-8");
            if (totalBytes > MAX_STREAM_BYTES) {
              try { res.write(`data: ${JSON.stringify({ type: "error", error: "Response exceeded maximum size. Please try a more focused query." })}\n\n`); } catch {}
              return;
            }
            try { res.write(`data: ${JSON.stringify({ type: "text", text: chunk })}\n\n`); } catch {}
          }
        } else if (event.type === "content_block_start") {
          if (event.content_block?.type === "web_search_tool_use") {
            try { res.write(`data: ${JSON.stringify({ type: "status", text: "Researching threat intelligence..." })}\n\n`); } catch {}
          }
          if (event.content_block?.type === "web_search_tool_result") {
            try { res.write(`data: ${JSON.stringify({ type: "status", text: "Processing intelligence data..." })}\n\n`); } catch {}
          }
        } else if (event.type === "message_stop") {
          try { res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`); } catch {}
        }
      }
    } catch (err) {
      if (err.status === 429 && retries > 0) {
        const wait = retries === 2 ? 15000 : 30000;
        try { res.write(`data: ${JSON.stringify({ type: "status", text: `Rate limited — retrying in ${wait / 1000}s...` })}\n\n`); } catch {}
        await new Promise((r) => setTimeout(r, wait));
        return attempt(retries - 1);
      }
      throw err;
    }
  };

  return attempt();
}
