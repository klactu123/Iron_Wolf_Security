import type { NextRequest } from "next/server";
import { budgetInputSchema } from "@/lib/schemas";
import { getStore, DEFAULT_PROFILE_ID } from "@/lib/storage";
import { ok, parseJsonBody } from "@/lib/api/response";
import { generateId } from "@/lib/api/ids";
import { calculateBudgetPlan } from "@/lib/calculators";
import type { BudgetPlan } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const budget = await getStore().getBudget();
  return ok(budget);
}

export async function POST(req: NextRequest) {
  const parsed = await parseJsonBody(req, budgetInputSchema);
  if (!parsed.ok) return parsed.response;

  const calc = calculateBudgetPlan(parsed.data);
  const existing = await getStore().getBudget();

  const budget: BudgetPlan = {
    id: existing?.id ?? generateId("budget"),
    profileId: DEFAULT_PROFILE_ID,
    ...parsed.data,
    ...calc,
  };
  const saved = await getStore().saveBudget(budget);
  return ok(saved);
}
