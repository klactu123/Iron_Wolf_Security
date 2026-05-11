import { describe, it, expect } from "vitest";
import { calculateSolarNeeds } from "./solar";
import type { SolarPlanInput } from "@/lib/types";

const base: SolarPlanInput = {
  dailyKwhEstimate: 8,
  batteryDays: 2,
  essentialLoads: ["fridge", "lights", "well pump", "router"],
  comfortLoads: ["laptops"],
  heavyLoads: [],
};

describe("calculateSolarNeeds", () => {
  it("uses dailyKwh * batteryDays for battery sizing", () => {
    const out = calculateSolarNeeds({ ...base, dailyKwhEstimate: 10, batteryDays: 3 });
    expect(out.recommendedBatteryKwh).toBe(30);
  });

  it("uses dailyKwh / sunHours (default 4) for array sizing", () => {
    const out = calculateSolarNeeds({ ...base, dailyKwhEstimate: 8 });
    expect(out.recommendedSolarKw).toBe(2);
  });

  it("respects sunHoursPerDay override", () => {
    const out = calculateSolarNeeds({
      ...base,
      dailyKwhEstimate: 12,
      sunHoursPerDay: 3,
    });
    expect(out.recommendedSolarKw).toBe(4);
  });

  it("flags heavy loads (electric heat / EV / electric water heater)", () => {
    const out = calculateSolarNeeds({
      ...base,
      heavyLoads: ["electric heat", "EV charging"],
    });
    expect(out.warnings.some((w) => w.toLowerCase().includes("heavy loads"))).toBe(
      true,
    );
    expect(["high", "critical"]).toContain(out.riskLevel);
  });

  it("flags battery autonomy under 2 days", () => {
    const out = calculateSolarNeeds({ ...base, batteryDays: 1 });
    expect(out.warnings.some((w) => w.toLowerCase().includes("autonomy"))).toBe(
      true,
    );
  });

  it("warns about suburban-lifestyle daily kWh estimate", () => {
    const out = calculateSolarNeeds({ ...base, dailyKwhEstimate: 35 });
    expect(out.warnings.some((w) => w.toLowerCase().includes("suburban"))).toBe(
      true,
    );
  });

  it("recommends generator when battery days are short", () => {
    const out = calculateSolarNeeds({ ...base, batteryDays: 1 });
    expect(out.generatorRecommended).toBe(true);
  });

  it("does not recommend generator for a comfortable system", () => {
    const out = calculateSolarNeeds({
      ...base,
      dailyKwhEstimate: 6,
      batteryDays: 4,
    });
    expect(out.generatorRecommended).toBe(false);
  });
});
