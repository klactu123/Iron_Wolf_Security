import Link from "next/link";
import type { AIProviderStatus } from "@/lib/ai/status";

export function AIStatusBanner({ status }: { status: AIProviderStatus }) {
  if (status.provider === "claude" && status.configured) return null;

  const isMock = status.provider === "mock" || !status.configured;

  return (
    <div
      className={`mb-6 rounded-md border px-4 py-3 text-sm ${
        isMock
          ? "bg-bark-100 border-bark-200 text-bark-800"
          : "bg-amber-50 border-amber-200 text-amber-900"
      }`}
    >
      <div className="font-medium text-bark-900 mb-1">
        AI: {isMock ? "Mock provider (no API key)" : `${status.provider} (not implemented)`}
      </div>
      <p className="text-xs text-bark-700">
        Calculators and the Reality Report work today without any AI. To enable
        Claude-authored explanations and risk summaries, paste your Anthropic
        API key on the{" "}
        <Link href="/settings" className="text-moss-700 underline font-medium">
          Settings
        </Link>{" "}
        page. The key is stored locally in <code className="font-mono">.env.local</code>{" "}
        and never sent anywhere except api.anthropic.com.
      </p>
    </div>
  );
}
