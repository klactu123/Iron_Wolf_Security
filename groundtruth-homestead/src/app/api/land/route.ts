import type { NextRequest } from "next/server";
import { landInputSchema } from "@/lib/schemas";
import { getStore, DEFAULT_PROFILE_ID } from "@/lib/storage";
import { ok, parseJsonBody } from "@/lib/api/response";
import { generateId } from "@/lib/api/ids";
import type { LandAssessment } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const land = await getStore().getLand();
  return ok(land);
}

export async function POST(req: NextRequest) {
  const parsed = await parseJsonBody(req, landInputSchema);
  if (!parsed.ok) return parsed.response;

  const existing = await getStore().getLand();
  const land: LandAssessment = {
    id: existing?.id ?? generateId("land"),
    profileId: DEFAULT_PROFILE_ID,
    ...parsed.data,
  };
  const saved = await getStore().saveLand(land);
  return ok(saved);
}
