const API_BASE = "/api";

// ---------------------------------------------------------------------------
// SSE streaming for threat intel analysis
// ---------------------------------------------------------------------------
export async function analyzeStream(iocs, context, onText, onStatus, onDone, onError) {
  const res = await fetch(`${API_BASE}/analyze/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ iocs, context }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Server error (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const event = JSON.parse(line.slice(6));
        if (event.type === "text") onText(event.text);
        else if (event.type === "status") onStatus(event.text);
        else if (event.type === "done") onDone();
        else if (event.type === "error") onError(event.error);
      } catch { /* skip malformed SSE */ }
    }
  }
}

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
export async function saveApiKey(key) {
  const res = await fetch(`${API_BASE}/settings/api-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save API key");
  return data;
}

export async function deleteApiKey() {
  const res = await fetch(`${API_BASE}/settings/api-key`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ confirm: true }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete API key");
  return data;
}

export async function shutdownServer() {
  const res = await fetch(`${API_BASE}/shutdown`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ confirm: true }),
  });
  return res.json();
}
