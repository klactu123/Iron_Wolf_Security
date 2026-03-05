const API_BASE = "/api";

/**
 * Stream phishing analysis from Claude via SSE.
 * @param {string} email - Full email content (headers + body)
 * @param {object} callbacks - { onChunk, onStatus, onDone, onError }
 */
export async function analyzeStream(email, { onChunk, onStatus, onDone, onError }) {
  try {
    const response = await fetch(`${API_BASE}/analyze/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Stream failed");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop();

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith("data: ")) continue;
        try {
          const data = JSON.parse(line.slice(6));
          if (data.type === "text") onChunk(data.text);
          else if (data.type === "status" && onStatus) onStatus(data.text);
          else if (data.type === "done") onDone(data.usage);
          else if (data.type === "error") onError(new Error(data.error));
        } catch {
          /* skip malformed SSE data */
        }
      }
    }
  } catch (err) {
    onError(err);
  }
}

/**
 * Save Anthropic API key via the settings endpoint (localhost only).
 */
export async function saveApiKey(key) {
  const response = await fetch(`${API_BASE}/settings/api-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to save API key");
  }

  return response.json();
}

/**
 * Delete Anthropic API key via the settings endpoint (localhost only).
 */
export async function deleteApiKey() {
  const response = await fetch(`${API_BASE}/settings/api-key`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ confirm: true }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to delete API key");
  }

  return response.json();
}

/**
 * Check if the API server is running.
 */
export async function healthCheck() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}
