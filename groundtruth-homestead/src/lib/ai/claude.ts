import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./system-prompt";
import type { AIContext, AIQuestion, HomesteadAIService } from "./types";
import { generateId } from "@/lib/api/ids";

// Real Anthropic-backed provider. Used when HOMESTEAD_AI_PROVIDER=claude
// and ANTHROPIC_API_KEY is set. Falls back happens at the factory level;
// failures here propagate to callers, which have their own mock fallback.
export class ClaudeHomesteadAIService implements HomesteadAIService {
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(apiKey: string, model: string) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async generateFollowUpQuestions(ctx: AIContext): Promise<AIQuestion[]> {
    const schema = {
      type: "object",
      properties: {
        questions: {
          type: "array",
          maxItems: 3,
          items: {
            type: "object",
            properties: {
              section: {
                type: "string",
                enum: [
                  "profile",
                  "land",
                  "water",
                  "solar",
                  "food",
                  "waste",
                  "shelter",
                  "budget",
                  "skills",
                ],
              },
              text: { type: "string" },
            },
            required: ["section", "text"],
            additionalProperties: false,
          },
        },
      },
      required: ["questions"],
      additionalProperties: false,
    } as const;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: this.systemBlocks(),
      output_config: { format: { type: "json_schema", schema } },
      messages: [
        {
          role: "user",
          content: this.contextPreamble(ctx) +
            "\n\nAsk 1–3 focused follow-up questions that would most sharpen this user's homestead plan. Prioritize water, sanitation, shelter, power, and legal access before anything else. Reference specific gaps in the snapshot — do not ask generic questions. Output only the JSON object specified by the schema.",
        },
      ],
    });

    const text = extractText(response);
    const parsed = safeParseJson<{ questions: { section: AIQuestion["section"]; text: string }[] }>(text);
    if (!parsed) return [];
    return parsed.questions.map((q) => ({
      id: generateId("q"),
      section: q.section,
      text: q.text,
    }));
  }

  async explainCalculatorResults(ctx: AIContext): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1500,
      system: this.systemBlocks(),
      messages: [
        {
          role: "user",
          content: this.contextPreamble(ctx) +
            "\n\nExplain the calculator outputs above in plain language. Reference the exact numbers from the snapshot — do not invent or override them. Two short paragraphs. Be practical and honest; flag the biggest gap if there is one.",
        },
      ],
    });
    return extractText(response);
  }

  async generateRealityReport(ctx: AIContext): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1500,
      system: this.systemBlocks(),
      messages: [
        {
          role: "user",
          content: this.contextPreamble(ctx) +
            "\n\nWrite a 2–3 paragraph reality-check summary of where this user stands today. Reference specific numbers and risk levels from the snapshot. Be honest about gaps without being doom-and-gloom. Do not invent numbers. End with a one-sentence reminder to verify zoning/permits with local authorities and consult licensed pros for code-sensitive work.",
        },
      ],
    });
    return extractText(response);
  }

  async generateRiskWarnings(ctx: AIContext): Promise<string[]> {
    const schema = {
      type: "object",
      properties: {
        warnings: {
          type: "array",
          maxItems: 6,
          items: { type: "string" },
        },
      },
      required: ["warnings"],
      additionalProperties: false,
    } as const;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: this.systemBlocks(),
      output_config: { format: { type: "json_schema", schema } },
      messages: [
        {
          role: "user",
          content: this.contextPreamble(ctx) +
            "\n\nReturn the top 3–6 risks for this homestead plan, written as full sentences a user can act on. Reference specific numbers when they support the risk. Prioritize legal access, water, sanitation, shelter, and winter readiness over lifestyle concerns. Output only the JSON object specified by the schema.",
        },
      ],
    });
    const text = extractText(response);
    const parsed = safeParseJson<{ warnings: string[] }>(text);
    return parsed?.warnings ?? [];
  }

  async generateTwelveMonthPlan(ctx: AIContext): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1500,
      system: this.systemBlocks(),
      messages: [
        {
          role: "user",
          content: this.contextPreamble(ctx) +
            "\n\nWrite a 12-month action plan, one month per line, prefixed 'Month N:'. Start with legal/zoning verification and water/sanitation/shelter before anything else. Defer livestock to Phase 2+ unless water and shelter are confirmed stable. Each month should be a single concrete action.",
        },
      ],
    });
    return extractText(response);
  }

  // System prompt is stable across all calls — cache it. Saves ~90% on the
  // input tokens for the system prompt after the first call (5-min TTL).
  private systemBlocks(): Anthropic.TextBlockParam[] {
    return [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ];
  }

  // Deterministic, stable snapshot serialization. Sorted keys mean the same
  // snapshot produces identical bytes — important if we ever cache this too.
  private contextPreamble(ctx: AIContext): string {
    const payload = {
      readiness: ctx.readiness ?? null,
      snapshot: ctx.snapshot,
    };
    return (
      "User's current homestead snapshot (deterministic calculator outputs — do not override these numbers):\n\n```json\n" +
      stableStringify(payload) +
      "\n```"
    );
  }
}

function extractText(response: Anthropic.Message): string {
  const parts: string[] = [];
  for (const block of response.content) {
    if (block.type === "text") parts.push(block.text);
  }
  return parts.join("\n").trim();
}

function safeParseJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    // Some responses come wrapped in code fences when the schema isn't honored.
    const fenced = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
    if (fenced) {
      try {
        return JSON.parse(fenced[1]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function stableStringify(value: unknown): string {
  return JSON.stringify(value, sortedReplacer, 2);
}

function sortedReplacer(_key: string, value: unknown): unknown {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const k of Object.keys(obj).sort()) sorted[k] = obj[k];
    return sorted;
  }
  return value;
}
