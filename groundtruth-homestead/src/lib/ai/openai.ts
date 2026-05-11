import type { AIContext, AIQuestion, HomesteadAIService } from "./types";

// Stub. Wired in Stage 5+ once an OPENAI_API_KEY is present and the
// official `openai` SDK is added as a dependency. Until then, the factory
// in ./index.ts will not select this provider.
export class OpenAIHomesteadAIService implements HomesteadAIService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(private readonly apiKey: string, private readonly model: string) {}

  async generateFollowUpQuestions(_ctx: AIContext): Promise<AIQuestion[]> {
    throw new Error("OpenAIHomesteadAIService is not implemented yet. Set HOMESTEAD_AI_PROVIDER=mock or implement this provider.");
  }
  async explainCalculatorResults(_ctx: AIContext): Promise<string> {
    throw new Error("OpenAIHomesteadAIService is not implemented yet.");
  }
  async generateRealityReport(_ctx: AIContext): Promise<string> {
    throw new Error("OpenAIHomesteadAIService is not implemented yet.");
  }
  async generateRiskWarnings(_ctx: AIContext): Promise<string[]> {
    throw new Error("OpenAIHomesteadAIService is not implemented yet.");
  }
  async generateTwelveMonthPlan(_ctx: AIContext): Promise<string> {
    throw new Error("OpenAIHomesteadAIService is not implemented yet.");
  }
}
