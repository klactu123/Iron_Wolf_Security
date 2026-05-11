import type {
  BudgetPlanInput,
  BudgetPlanOutput,
  RiskLevel,
} from "@/lib/types";

// Phase weights are share-of-non-emergency spend. Tunable; not load-bearing precision.
const PHASE_WEIGHTS = {
  one: 0.45, // legal access, basic shelter, water, sanitation, basic power
  two: 0.25, // gardens, tools, generator, filtration, chickens
  three: 0.2, // orchard, greenhouse, larger livestock, workshop, expanded power
  four: 0.1, // redundancy, root cellar, advanced systems
} as const;

export function calculateBudgetPlan(
  input: BudgetPlanInput,
): BudgetPlanOutput {
  const warnings: string[] = [];

  const allocated =
    input.landBudget +
    input.waterBudget +
    input.powerBudget +
    input.shelterBudget +
    input.foodBudget +
    input.toolsBudget +
    input.emergencyReserve;

  const overAllocation = allocated - input.totalBudget;

  if (overAllocation > 0) {
    warnings.push(
      `Category budgets sum to $${allocated.toLocaleString()}, which is $${overAllocation.toLocaleString()} over the stated total. Reconcile before committing.`,
    );
  }

  const reserveRatio =
    input.totalBudget > 0 ? input.emergencyReserve / input.totalBudget : 0;

  if (reserveRatio < 0.1) {
    warnings.push(
      "Emergency reserve is under 10% of total budget. Plan on at least 15–20% — homestead estimates routinely run over because perc tests, well drilling, and code changes are not predictable.",
    );
  } else if (reserveRatio < 0.15) {
    warnings.push(
      "Emergency reserve under 15%. Tight but workable if no major unknowns. Bump it up if you don't yet have soils, perc, or zoning answers in hand.",
    );
  }

  if (input.waterBudget < 5000 && input.totalBudget > 30000) {
    warnings.push(
      "Water budget under $5k is unusually low. Well drilling alone runs $8k–$25k+ in many regions; cisterns and pumps add more. Verify with at least two local quotes.",
    );
  }

  if (input.shelterBudget < 0.2 * input.totalBudget && input.shelterBudget > 0) {
    warnings.push(
      "Shelter budget under 20% of total. Unless you already own a sound structure, shelter usually dominates Phase 1 spending.",
    );
  }

  if (input.powerBudget < 8000 && input.totalBudget > 40000) {
    warnings.push(
      "Power budget under $8k is tight for a real off-grid solar+battery+inverter system. Hybrid systems with grid-tie or generator can reduce this.",
    );
  }

  const investable = Math.max(input.totalBudget - input.emergencyReserve, 0);
  const phaseOneEstimate = round0(investable * PHASE_WEIGHTS.one);
  const phaseTwoEstimate = round0(investable * PHASE_WEIGHTS.two);
  const phaseThreeEstimate = round0(investable * PHASE_WEIGHTS.three);
  const phaseFourEstimate = round0(investable * PHASE_WEIGHTS.four);

  if (input.totalBudget === 0) {
    warnings.push(
      "No total budget entered. Every recommendation downstream assumes a number — even a rough one. Put in a placeholder and refine.",
    );
  } else if (input.totalBudget < 25000) {
    warnings.push(
      "Total budget under $25k is very tight for a from-scratch homestead. Realistic in some scenarios (existing structure, owned land, modest goals); unrealistic for raw land starts.",
    );
  }

  warnings.push(
    "Budget runs over. Plan for it. Get three quotes for any system over $5k and don't sign a build contract without a contingency line.",
  );

  const riskLevel = scoreBudgetRisk({
    overAllocation,
    reserveRatio,
    totalBudget: input.totalBudget,
  });

  return {
    phaseOneEstimate,
    phaseTwoEstimate,
    phaseThreeEstimate,
    phaseFourEstimate,
    riskLevel,
    warnings,
  };
}

function scoreBudgetRisk(args: {
  overAllocation: number;
  reserveRatio: number;
  totalBudget: number;
}): RiskLevel {
  let score = 0;
  if (args.overAllocation > 0) score += 2;
  if (args.reserveRatio < 0.05) score += 3;
  else if (args.reserveRatio < 0.1) score += 2;
  else if (args.reserveRatio < 0.15) score += 1;

  if (args.totalBudget === 0) score += 2;
  else if (args.totalBudget < 25000) score += 2;

  if (score >= 5) return "critical";
  if (score >= 3) return "high";
  if (score >= 1) return "medium";
  return "low";
}

function round0(n: number): number {
  return Math.round(n);
}
