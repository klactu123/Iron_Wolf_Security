import { describe, it, expect } from "vitest";
import { generateBuildPhases, generateTwelveMonthActionPlan } from "./phases";
import type {
  FoodPlan,
  HomesteadSnapshot,
  ShelterPlan,
  WasteSanitationPlan,
  WaterPlan,
} from "@/lib/types";

function makeWater(over: Partial<WaterPlan> = {}): WaterPlan {
  return {
    id: "w1",
    profileId: "p1",
    peopleCount: 2,
    gallonsPerPersonPerDay: 50,
    reserveDays: 14,
    livestockWaterGallonsPerDay: 0,
    gardenWaterGallonsPerDay: 0,
    hasWell: true,
    hasRainCatchment: false,
    hasPond: false,
    hasSpring: false,
    filtrationNeeded: false,
    freezeProtectionNeeded: false,
    householdDailyGallons: 100,
    totalDailyGallons: 100,
    recommendedCisternGallons: 1400,
    riskLevel: "low",
    warnings: [],
    ...over,
  };
}
function makeShelter(over: Partial<ShelterPlan> = {}): ShelterPlan {
  return {
    id: "s1",
    profileId: "p1",
    shelterType: "existing_house",
    existingShelter: true,
    primaryHeatSource: "wood",
    backupHeatSource: "propane",
    coolingPlan: "shade + fan",
    winterizationNeeded: false,
    riskLevel: "low",
    warnings: [],
    ...over,
  };
}
function makeFood(over: Partial<FoodPlan> = {}): FoodPlan {
  return {
    id: "f1",
    profileId: "p1",
    gardeningExperience: "beginner",
    gardenSquareFeet: 0,
    raisedBedsCount: 0,
    wantsChickens: false,
    wantsLivestock: false,
    livestockTypes: [],
    foodPreservationExperience: "beginner",
    recommendedYearOneCrops: [],
    riskLevel: "low",
    warnings: [],
    ...over,
  };
}
function makeWaste(over: Partial<WasteSanitationPlan> = {}): WasteSanitationPlan {
  return {
    id: "ws1",
    profileId: "p1",
    hasSeptic: true,
    septicStatusKnown: true,
    wantsCompostingToilet: false,
    graywaterPlanKnown: true,
    trashDisposalPlan: "transfer station",
    animalWastePlan: "",
    legalConcerns: "",
    riskLevel: "low",
    warnings: [],
    ...over,
  };
}

const emptySnapshot: HomesteadSnapshot = {
  profile: null,
  land: null,
  water: null,
  solar: null,
  food: null,
  waste: null,
  shelter: null,
  budget: null,
  skills: null,
};

describe("generateBuildPhases", () => {
  it("returns four ordered phases on an empty snapshot", () => {
    const phases = generateBuildPhases(emptySnapshot);
    expect(phases.phaseOne.length).toBeGreaterThan(0);
    expect(phases.phaseTwo.length).toBeGreaterThan(0);
    expect(phases.phaseThree.length).toBeGreaterThan(0);
    expect(phases.phaseFour.length).toBeGreaterThan(0);
  });

  it("defers chickens when water and shelter are not stable", () => {
    const phases = generateBuildPhases({
      ...emptySnapshot,
      water: makeWater({ riskLevel: "high" }),
      shelter: makeShelter({ riskLevel: "high" }),
      food: makeFood({ wantsChickens: true }),
    });
    const chickenLine = phases.phaseTwo.find((l) => l.toLowerCase().includes("chicken") || l.toLowerCase().includes("defer"));
    expect(chickenLine).toBeDefined();
  });

  it("inserts a sanitation-critical line when no septic and no composting toilet", () => {
    const phases = generateBuildPhases({
      ...emptySnapshot,
      waste: makeWaste({ hasSeptic: false, wantsCompostingToilet: false }),
    });
    expect(
      phases.phaseOne[0].toLowerCase().includes("sanitation"),
    ).toBe(true);
  });
});

describe("generateTwelveMonthActionPlan", () => {
  it("returns 12 monthly entries", () => {
    const plan = generateTwelveMonthActionPlan(emptySnapshot);
    expect(plan).toHaveLength(12);
    expect(plan[0]).toMatch(/^Month 1:/);
    expect(plan[11]).toMatch(/^Month 12:/);
  });
});
