import type { NextRequest } from "next/server";
import { waterInputSchema } from "@/lib/schemas";
import { getStore, DEFAULT_PROFILE_ID } from "@/lib/storage";
import { ok, parseJsonBody } from "@/lib/api/response";
import { generateId } from "@/lib/api/ids";
import { calculateWaterNeeds } from "@/lib/calculators";
import type { WaterPlan } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const water = await getStore().getWater();
  return ok(water);
}

export async function POST(req: NextRequest) {
  const parsed = await parseJsonBody(req, waterInputSchema);
  if (!parsed.ok) return parsed.response;

  const calc = calculateWaterNeeds(parsed.data);
  const existing = await getStore().getWater();

  const water: WaterPlan = {
    id: existing?.id ?? generateId("water"),
    profileId: DEFAULT_PROFILE_ID,
    ...parsed.data,
    ...calc,
  };
  const saved = await getStore().saveWater(water);
  return ok(saved);
}
