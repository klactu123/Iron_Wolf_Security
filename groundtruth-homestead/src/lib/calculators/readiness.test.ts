import { describe, it, expect } from "vitest";
import { calculateReadinessScore } from "./readiness";
import type {
  BudgetPlanOutput,
  FoodPlanOutput,
  LandAssessment,
  ShelterPlanOutput,
  SkillsAssessmentOutput,
  SolarPlanOutput,
  WasteSanitationPlanOutput,
  WaterPlanOutput,
} from "@/lib/types";

const land: LandAssessment = {
  id: "l1",
  profileId: "p1",
  acreage: 5,
  roadAccess: "gravel",
  legalAccess: true,
  zoningKnown: true,
  hoaRestrictions: false,
  terrainType: "rolling",
  woodedPercentage: 50,
  clearedPercentage: 30,
  soilKnown: true,
  hasExistingStructures: true,
  hasExistingPower: true,
  hasExistingWaterSource: true,
  hasSeptic: true,
  distanceToTownMiles: 12,
  distanceToHospitalMiles: 30,
  notes: "",
};

const water: WaterPlanOutput = {
  householdDailyGallons: 100,
  totalDailyGallons: 130,
  recommendedCisternGallons: 1820,
  riskLevel: "low",
  warnings: [],
};
const solar: SolarPlanOutput = {
  recommendedBatteryKwh: 24,
  recommendedSolarKw: 2,
  generatorRecommended: false,
  riskLevel: "low",
  warnings: [],
};
const food: FoodPlanOutput = {
  recommendedYearOneCrops: ["lettuce"],
  riskLevel: "low",
  warnings: [],
};
const waste: WasteSanitationPlanOutput = {
  riskLevel: "low",
  warnings: [],
};
const shelter: ShelterPlanOutput = {
  riskLevel: "low",
  warnings: [],
};
const budget: BudgetPlanOutput = {
  phaseOneEstimate: 0,
  phaseTwoEstimate: 0,
  phaseThreeEstimate: 0,
  phaseFourEstimate: 0,
  riskLevel: "low",
  warnings: [],
};
const skills: SkillsAssessmentOutput = {
  overallSkillScore: 80,
  prioritySkillsToLearn: [],
  riskLevel: "low",
  warnings: [],
};

describe("calculateReadinessScore", () => {
  it("scores high when every category is healthy", () => {
    const out = calculateReadinessScore({
      land,
      water,
      solar,
      food,
      waste,
      shelter,
      budget,
      skills,
    });
    expect(out.overall).toBeGreaterThanOrEqual(80);
    expect(out.categories.water).toBeGreaterThan(80);
  });

  it("scores zero on null categories rather than throwing", () => {
    const out = calculateReadinessScore({
      land: null,
      water: null,
      solar: null,
      food: null,
      waste: null,
      shelter: null,
      budget: null,
      skills: null,
    });
    expect(out.overall).toBe(0);
  });

  it("surfaces no-legal-access as a top risk", () => {
    const out = calculateReadinessScore({
      land: { ...land, legalAccess: false },
      water,
      solar,
      food,
      waste,
      shelter,
      budget,
      skills,
    });
    expect(out.topRisks[0].toLowerCase()).toContain("legal access");
  });

  it("category weights produce expected aggregate when one category is null", () => {
    const out = calculateReadinessScore({
      land: null,
      water: { ...water, riskLevel: "high" },
      solar: { ...solar, riskLevel: "high" },
      food: { ...food, riskLevel: "high" },
      waste: { ...waste, riskLevel: "high" },
      shelter: { ...shelter, riskLevel: "high" },
      budget: { ...budget, riskLevel: "high" },
      skills: { ...skills, overallSkillScore: 35 },
    });
    // Every present category scores 35; land=0 (null). Overall must be < 35.
    expect(out.overall).toBeLessThanOrEqual(35);
  });
});
