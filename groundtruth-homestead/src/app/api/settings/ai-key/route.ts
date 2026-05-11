import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, parseJsonBody } from "@/lib/api/response";
import { updateEnvFile } from "@/lib/server/env-file";
import { setAIServiceForTesting } from "@/lib/ai";
import { getAIProviderStatus } from "@/lib/ai/status";

export const runtime = "nodejs";

const KNOWN_MODELS = [
  "claude-opus-4-7",
  "claude-sonnet-4-6",
  "claude-haiku-4-5",
];

const saveSchema = z.object({
  apiKey: z
    .string()
    .min(20, "API key looks too short")
    .max(500, "API key looks too long")
    .refine((v) => v.startsWith("sk-ant-"), {
      message: 'Anthropic keys start with "sk-ant-"',
    }),
  model: z.string().refine((v) => KNOWN_MODELS.includes(v), {
    message: "Pick one of the known Claude models",
  }),
});

export async function GET() {
  // Never return the key itself — only whether one is configured.
  const status = getAIProviderStatus();
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  return ok({
    provider: status.provider,
    configured: status.configured,
    hasKey,
    model: status.model ?? "claude-opus-4-7",
  });
}

export async function POST(req: NextRequest) {
  const parsed = await parseJsonBody(req, saveSchema);
  if (!parsed.ok) return parsed.response;

  await updateEnvFile({
    HOMESTEAD_AI_PROVIDER: "claude",
    ANTHROPIC_API_KEY: parsed.data.apiKey,
    ANTHROPIC_MODEL: parsed.data.model,
  });

  // Force the singleton to rebuild from the updated env on next call.
  setAIServiceForTesting(null);

  return ok({ ok: true });
}

export async function DELETE() {
  await updateEnvFile({
    HOMESTEAD_AI_PROVIDER: "mock",
    ANTHROPIC_API_KEY: null,
  });
  setAIServiceForTesting(null);
  return ok({ ok: true });
}
