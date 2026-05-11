import type { HomesteadSnapshot, ReadinessScore } from "@/lib/types";

export interface AIQuestion {
  id: string;
  text: string;
  /** Which planner section the question relates to. Used to route the answer. */
  section:
    | "profile"
    | "land"
    | "water"
    | "solar"
    | "food"
    | "waste"
    | "shelter"
    | "budget"
    | "skills";
}

export interface AIContext {
  snapshot: HomesteadSnapshot;
  readiness?: ReadinessScore;
}

// Service contract. Calculators are NEVER called through this interface.
// Implementations consume calculator outputs via the snapshot and produce
// natural-language explanations, follow-up questions, and risk callouts.
export interface HomesteadAIService {
  generateFollowUpQuestions(context: AIContext): Promise<AIQuestion[]>;
  explainCalculatorResults(context: AIContext): Promise<string>;
  generateRealityReport(context: AIContext): Promise<string>;
  generateRiskWarnings(context: AIContext): Promise<string[]>;
  generateTwelveMonthPlan(context: AIContext): Promise<string>;
}
