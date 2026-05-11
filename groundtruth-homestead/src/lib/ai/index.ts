import { MockHomesteadAIService } from "./mock";
import { OpenAIHomesteadAIService } from "./openai";
import { ClaudeHomesteadAIService } from "./claude";
import type { HomesteadAIService } from "./types";

export type { HomesteadAIService, AIContext, AIQuestion } from "./types";
export { SYSTEM_PROMPT } from "./system-prompt";
export { MockHomesteadAIService } from "./mock";

let instance: HomesteadAIService | null = null;

export function getAIService(): HomesteadAIService {
  if (!instance) {
    instance = createService();
  }
  return instance;
}

export function setAIServiceForTesting(svc: HomesteadAIService | null): void {
  instance = svc;
}

function createService(): HomesteadAIService {
  const provider = (process.env.HOMESTEAD_AI_PROVIDER ?? "mock").toLowerCase();

  if (provider === "openai") {
    const key = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
    if (!key) {
      console.warn(
        "[homestead-ai] HOMESTEAD_AI_PROVIDER=openai but OPENAI_API_KEY is not set. Falling back to mock provider.",
      );
      return new MockHomesteadAIService();
    }
    return new OpenAIHomesteadAIService(key, model);
  }

  if (provider === "claude" || provider === "anthropic") {
    const key = process.env.ANTHROPIC_API_KEY;
    const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
    if (!key) {
      console.warn(
        "[homestead-ai] HOMESTEAD_AI_PROVIDER=claude but ANTHROPIC_API_KEY is not set. Falling back to mock provider.",
      );
      return new MockHomesteadAIService();
    }
    return new ClaudeHomesteadAIService(key, model);
  }

  return new MockHomesteadAIService();
}
