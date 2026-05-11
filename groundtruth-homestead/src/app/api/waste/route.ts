import type { NextRequest } from "next/server";
import { wasteInputSchema } from "@/lib/schemas";
import { getStore, DEFAULT_PROFILE_ID } from "@/lib/storage";
import { ok, parseJsonBody } from "@/lib/api/response";
import { generateId } from "@/lib/api/ids";
import { calculateWastePlan } from "@/lib/calculators";
import type { WasteSanitationPlan } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const waste = await getStore().getWaste();
  return ok(waste);
}

export async function POST(req: NextRequest) {
  const parsed = await parseJsonBody(req, wasteInputSchema);
  if (!parsed.ok) return parsed.response;

  const calc = calculateWastePlan(parsed.data);
  const existing = await getStore().getWaste();

  const waste: WasteSanitationPlan = {
    id: existing?.id ?? generateId("waste"),
    profileId: DEFAULT_PROFILE_ID,
    ...parsed.data,
    ...calc,
  };
  const saved = await getStore().saveWaste(waste);
  return ok(saved);
}
