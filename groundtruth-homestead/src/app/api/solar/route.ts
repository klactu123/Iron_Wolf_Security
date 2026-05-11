import type { NextRequest } from "next/server";
import { solarInputSchema } from "@/lib/schemas";
import { getStore, DEFAULT_PROFILE_ID } from "@/lib/storage";
import { ok, parseJsonBody } from "@/lib/api/response";
import { generateId } from "@/lib/api/ids";
import { calculateSolarNeeds } from "@/lib/calculators";
import type { SolarPlan } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const solar = await getStore().getSolar();
  return ok(solar);
}

export async function POST(req: NextRequest) {
  const parsed = await parseJsonBody(req, solarInputSchema);
  if (!parsed.ok) return parsed.response;

  const calc = calculateSolarNeeds(parsed.data);
  const existing = await getStore().getSolar();

  const solar: SolarPlan = {
    id: existing?.id ?? generateId("solar"),
    profileId: DEFAULT_PROFILE_ID,
    ...parsed.data,
    ...calc,
  };
  const saved = await getStore().saveSolar(solar);
  return ok(saved);
}
