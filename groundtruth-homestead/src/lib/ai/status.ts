// Server-only. Reports which AI provider is wired up so the UI can show a
// "set your API key" banner without ever leaking the key itself.
export interface AIProviderStatus {
  provider: "mock" | "claude" | "openai";
  configured: boolean;
  model?: string;
  reason?: string;
}

export function getAIProviderStatus(): AIProviderStatus {
  const raw = (process.env.HOMESTEAD_AI_PROVIDER ?? "mock").toLowerCase();

  if (raw === "claude" || raw === "anthropic") {
    const hasKey = !!process.env.ANTHROPIC_API_KEY;
    return {
      provider: "claude",
      configured: hasKey,
      model: process.env.ANTHROPIC_MODEL ?? "claude-opus-4-7",
      reason: hasKey ? undefined : "ANTHROPIC_API_KEY is not set — falling back to mock provider.",
    };
  }

  if (raw === "openai") {
    const hasKey = !!process.env.OPENAI_API_KEY;
    return {
      provider: "openai",
      configured: hasKey,
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      reason: hasKey
        ? "OpenAI provider is a stub in this build — it will throw on use."
        : "OPENAI_API_KEY is not set — falling back to mock provider.",
    };
  }

  return {
    provider: "mock",
    configured: true,
    reason: "Running on the mock AI provider. Set HOMESTEAD_AI_PROVIDER=claude and ANTHROPIC_API_KEY to use Claude.",
  };
}
