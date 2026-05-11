import type { NextRequest } from "next/server";
import { foodInputSchema } from "@/lib/schemas";
import { getStore, DEFAULT_PROFILE_ID } from "@/lib/storage";
import { ok, parseJsonBody } from "@/lib/api/response";
import { generateId } from "@/lib/api/ids";
import { calculateFoodPlan } from "@/lib/calculators";
import type { FoodPlan } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const food = await getStore().getFood();
  return ok(food);
}

export async function POST(req: NextRequest) {
  const parsed = await parseJsonBody(req, foodInputSchema);
  if (!parsed.ok) return parsed.response;

  const calc = calculateFoodPlan(parsed.data);
  const existing = await getStore().getFood();

  const food: FoodPlan = {
    id: existing?.id ?? generateId("food"),
    profileId: DEFAULT_PROFILE_ID,
    ...parsed.data,
    ...calc,
  };
  const saved = await getStore().saveFood(food);
  return ok(saved);
}
