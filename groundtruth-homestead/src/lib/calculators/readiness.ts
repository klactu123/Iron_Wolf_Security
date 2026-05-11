import type {
  BudgetPlanOutput,
  CategoryScores,
  FoodPlanOutput,
  HomesteadSnapshot,
  LandAssessment,
  ReadinessScore,
  RiskLevel,
  ShelterPlanOutput,
  SkillsAssessmentOutput,
  SolarPlanOutput,
  WasteSanitationPlanOutput,
  WaterPlanOutput,
} from "@/lib/types";

// Category weights drive the overall readiness score. Tunable; transparent on purpose.
const CATEGORY_WEIGHTS: Record<keyof CategoryScores, number> = {
  water: 0.2,
  power: 0.15,
  food: 0.1,
  shelter: 0.15,
  budget: 0.15,
  skills: 0.1,
  land: 0.15,
};

const RISK_TO_SCORE: Record<RiskLevel, number> = {
  low: 90,
  medium: 65,
  high: 35,
  critical: 10,
};

export interface ReadinessInput {
  land: LandAssessment | null;
  water: WaterPlanOutput | null;
  solar: SolarPlanOutput | null;
  food: FoodPlanOutput | null;
  waste: WasteSanitationPlanOutput | null;
  shelter: ShelterPlanOutput | null;
  budget: BudgetPlanOutput | null;
  skills: SkillsAssessmentOutput | null;
}

export function calculateReadinessScore(input: ReadinessInput): ReadinessScore {
  const categories: CategoryScores = {
    water: input.water ? RISK_TO_SCORE[input.water.riskLevel] : 0,
    power: input.solar ? RISK_TO_SCORE[input.solar.riskLevel] : 0,
    food: input.food ? RISK_TO_SCORE[input.food.riskLevel] : 0,
    shelter: input.shelter ? RISK_TO_SCORE[input.shelter.riskLevel] : 0,
    budget: input.budget ? RISK_TO_SCORE[input.budget.riskLevel] : 0,
    skills: input.skills ? input.skills.overallSkillScore : 0,
    land: scoreLand(input.land),
  };

  const overall = Math.round(
    (Object.keys(CATEGORY_WEIGHTS) as (keyof CategoryScores)[]).reduce(
      (sum, key) => sum + categories[key] * CATEGORY_WEIGHTS[key],
      0,
    ),
  );

  const topRisks = collectTopRisks(input);

  return {
    overall,
    categories,
    topRisks,
  };
}

export function snapshotToReadinessInput(
  snap: HomesteadSnapshot,
): ReadinessInput {
  return {
    land: snap.land,
    water: snap.water,
    solar: snap.solar,
    food: snap.food,
    waste: snap.waste,
    shelter: snap.shelter,
    budget: snap.budget,
    skills: snap.skills,
  };
}

function scoreLand(land: LandAssessment | null): number {
  if (!land) return 0;
  let score = 50;
  if (land.legalAccess) score += 15;
  else score -= 25;

  if (land.zoningKnown) score += 10;
  else score -= 10;

  if (!land.hoaRestrictions) score += 5;
  else score -= 5;

  if (land.hasExistingWaterSource) score += 8;
  if (land.hasSeptic) score += 5;
  if (land.hasExistingPower) score += 4;
  if (land.hasExistingStructures) score += 5;

  if (land.roadAccess === "paved") score += 5;
  else if (land.roadAccess === "gravel") score += 2;
  else if (land.roadAccess === "seasonal") score -= 5;
  else if (land.roadAccess === "none") score -= 15;

  if (land.distanceToHospitalMiles > 60) score -= 5;
  if (land.distanceToTownMiles > 40) score -= 3;

  return clamp(Math.round(score), 0, 100);
}

function collectTopRisks(input: ReadinessInput): string[] {
  const candidates: { weight: number; text: string }[] = [];

  pushRisks(candidates, input.water?.warnings, input.water?.riskLevel, 5);
  pushRisks(candidates, input.solar?.warnings, input.solar?.riskLevel, 4);
  pushRisks(candidates, input.shelter?.warnings, input.shelter?.riskLevel, 4);
  pushRisks(candidates, input.budget?.warnings, input.budget?.riskLevel, 3);
  pushRisks(candidates, input.waste?.warnings, input.waste?.riskLevel, 3);
  pushRisks(candidates, input.food?.warnings, input.food?.riskLevel, 2);
  pushRisks(candidates, input.skills?.warnings, input.skills?.riskLevel, 2);

  if (input.land && !input.land.legalAccess) {
    candidates.push({
      weight: 100,
      text: "No legal access to the land. This is a stop-everything issue — resolve before any further investment.",
    });
  }
  if (input.land && !input.land.zoningKnown) {
    candidates.push({
      weight: 50,
      text: "Zoning rules unknown. Confirm permitted uses with the county before building, drilling, or bringing livestock.",
    });
  }

  return candidates
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5)
    .map((c) => c.text);
}

function pushRisks(
  out: { weight: number; text: string }[],
  warnings: string[] | undefined,
  riskLevel: RiskLevel | undefined,
  base: number,
) {
  if (!warnings || !riskLevel) return;
  const mult = riskLevel === "critical" ? 4 : riskLevel === "high" ? 3 : riskLevel === "medium" ? 2 : 1;
  for (const w of warnings) {
    out.push({ weight: base * mult, text: w });
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
