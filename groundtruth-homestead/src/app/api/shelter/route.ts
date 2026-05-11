import type { NextRequest } from "next/server";
import { shelterInputSchema } from "@/lib/schemas";
import { getStore, DEFAULT_PROFILE_ID } from "@/lib/storage";
import { ok, parseJsonBody } from "@/lib/api/response";
import { generateId } from "@/lib/api/ids";
import { calculateShelterPlan } from "@/lib/calculators";
import type { ShelterPlan } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const shelter = await getStore().getShelter();
  return ok(shelter);
}

export async function POST(req: NextRequest) {
  const parsed = await parseJsonBody(req, shelterInputSchema);
  if (!parsed.ok) return parsed.response;

  const calc = calculateShelterPlan(parsed.data);
  const existing = await getStore().getShelter();

  const shelter: ShelterPlan = {
    id: existing?.id ?? generateId("shelter"),
    profileId: DEFAULT_PROFILE_ID,
    ...parsed.data,
    ...calc,
  };
  const saved = await getStore().saveShelter(shelter);
  return ok(saved);
}
