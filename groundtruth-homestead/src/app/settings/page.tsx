"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/Field";
import { apiGet, apiPost } from "@/lib/client/api";

interface KeyStatus {
  provider: string;
  configured: boolean;
  hasKey: boolean;
  model: string;
}

const MODEL_OPTIONS = [
  { value: "claude-opus-4-7", label: "Claude Opus 4.7 (most capable, priciest)" },
  { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6 (fast, good balance) — recommended" },
  { value: "claude-haiku-4-5", label: "Claude Haiku 4.5 (cheapest, plenty for explanations)" },
];

export default function SettingsPage() {
  const [status, setStatus] = useState<KeyStatus | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("claude-sonnet-4-6");
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const res = await apiGet<KeyStatus>("/api/settings/ai-key");
    if (res.ok) {
      setStatus(res.data);
      if (res.data.model) setModel(res.data.model);
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const res = await apiPost<{ ok: true }>("/api/settings/ai-key", {
      apiKey: apiKey.trim(),
      model,
    });
    setBusy(false);
    if (res.ok) {
      setMessage({
        kind: "ok",
        text: "Saved to .env.local. Claude is active now — try regenerating the Reality Report.",
      });
      setApiKey("");
      refresh();
    } else {
      setMessage({ kind: "err", text: res.error });
    }
  }

  async function onClear() {
    if (!confirm("Remove the saved API key and switch back to the mock provider?")) return;
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/settings/ai-key", { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      setMessage({ kind: "ok", text: "Key cleared. App is now using the mock provider." });
      refresh();
    } else {
      setMessage({ kind: "err", text: "Failed to clear the key." });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        blurb="Bring your own Claude API key. It is written to .env.local on this machine and used only to call api.anthropic.com."
      />

      <Card title="Claude API key">
        {status && (
          <div className="mb-4 text-sm">
            <span className="text-bark-700">Status: </span>
            {status.hasKey ? (
              <span className="font-medium text-moss-900">
                Key is set ({status.model})
              </span>
            ) : (
              <span className="font-medium text-bark-900">
                No key — running on the mock provider
              </span>
            )}
          </div>
        )}

        <form onSubmit={onSave} className="space-y-4">
          <TextField
            label="Anthropic API key"
            type="password"
            placeholder="sk-ant-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            help={
              <>
                Get a key at{" "}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-moss-700 underline"
                >
                  console.anthropic.com/settings/keys
                </a>
                . Stored locally in .env.local; never sent anywhere except api.anthropic.com.
              </>
            }
            autoComplete="off"
            spellCheck={false}
          />

          <SelectField
            label="Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            options={MODEL_OPTIONS}
            help="You can change this any time. Cheaper models are fine for short explanations."
          />

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={busy || apiKey.trim().length === 0}>
              {busy ? "Saving…" : status?.hasKey ? "Replace key" : "Save key"}
            </Button>
            {status?.hasKey && (
              <Button
                type="button"
                variant="secondary"
                onClick={onClear}
                disabled={busy}
              >
                Remove key
              </Button>
            )}
            {message && (
              <span
                className={
                  message.kind === "ok"
                    ? "text-sm text-moss-900"
                    : "text-sm text-red-700"
                }
              >
                {message.text}
              </span>
            )}
          </div>
        </form>
      </Card>

      <Card title="How this works">
        <ul className="list-disc pl-5 space-y-1 text-sm text-bark-800">
          <li>
            Saving writes <code className="font-mono">HOMESTEAD_AI_PROVIDER</code>,{" "}
            <code className="font-mono">ANTHROPIC_API_KEY</code>, and{" "}
            <code className="font-mono">ANTHROPIC_MODEL</code> to{" "}
            <code className="font-mono">.env.local</code> in the project root.
          </li>
          <li>
            <code className="font-mono">.env.local</code> is gitignored — the key
            never leaves this machine unless you copy the file yourself.
          </li>
          <li>
            The running server picks up the new key immediately. No restart
            needed.
          </li>
          <li>
            Removing the key restores the offline mock provider. The app keeps
            working; only AI-authored explanations turn off.
          </li>
        </ul>
      </Card>
    </div>
  );
}
