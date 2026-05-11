import { describe, it, expect } from "vitest";
import { calculateWaterNeeds } from "./water";
import type { WaterPlanInput } from "@/lib/types";

const base: WaterPlanInput = {
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
};

describe("calculateWaterNeeds", () => {
  it("computes household, total, and cistern from formula", () => {
    const out = calculateWaterNeeds({
      ...base,
      peopleCount: 4,
      gallonsPerPersonPerDay: 40,
      reserveDays: 30,
      livestockWaterGallonsPerDay: 50,
      gardenWaterGallonsPerDay: 30,
    });
    expect(out.householdDailyGallons).toBe(160);
    expect(out.totalDailyGallons).toBe(240);
    expect(out.recommendedCisternGallons).toBe(7200);
  });

  it("flags reserve under 7 days as critical-tier risk", () => {
    const out = calculateWaterNeeds({ ...base, reserveDays: 3, hasWell: false });
    expect(out.warnings.some((w) => w.toLowerCase().includes("under 7 days"))).toBe(true);
    expect(["high", "critical"]).toContain(out.riskLevel);
  });

  it("warns when no on-site source identified", () => {
    const out = calculateWaterNeeds({
      ...base,
      hasWell: false,
      hasRainCatchment: false,
      hasPond: false,
      hasSpring: false,
    });
    expect(
      out.warnings.some((w) => w.toLowerCase().includes("no on-site water source")),
    ).toBe(true);
  });

  it("warns when reserve is short and only one source", () => {
    const out = calculateWaterNeeds({ ...base, reserveDays: 14, hasWell: true });
    expect(
      out.warnings.some((w) => w.toLowerCase().includes("backup source")),
    ).toBe(true);
  });

  it("warns when livestock water is planned with thin reserves", () => {
    const out = calculateWaterNeeds({
      ...base,
      livestockWaterGallonsPerDay: 30,
      reserveDays: 5,
    });
    expect(out.warnings.some((w) => w.toLowerCase().includes("livestock"))).toBe(
      true,
    );
  });

  it("flags suburban-level per-person consumption", () => {
    const out = calculateWaterNeeds({ ...base, gallonsPerPersonPerDay: 100 });
    expect(out.warnings.some((w) => w.toLowerCase().includes("suburban"))).toBe(
      true,
    );
  });

  it("returns low risk when reserves and sources are adequate", () => {
    const out = calculateWaterNeeds({
      ...base,
      reserveDays: 30,
      hasRainCatchment: true,
    });
    expect(out.riskLevel).toBe("low");
  });
});
