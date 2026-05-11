import type {
  RiskLevel,
  SolarPlanInput,
  SolarPlanOutput,
} from "@/lib/types";

const DEFAULT_SUN_HOURS = 4;

// Loads that are a poor fit for off-grid solar at typical residential sizing.
// Well pump is intentionally NOT in this list — it's a normal essential off-grid load.
const HEAVY_LOAD_RED_FLAGS = [
  "electric heat",
  "electric water heater",
  "ev charging",
  "ev charger",
  "electric vehicle",
  "central ac",
  "central air",
  "large shop",
  "welder",
  "kiln",
  "electric dryer",
];

export function calculateSolarNeeds(input: SolarPlanInput): SolarPlanOutput {
  const sunHours = input.sunHoursPerDay ?? DEFAULT_SUN_HOURS;

  const recommendedBatteryKwh = round1(input.dailyKwhEstimate * input.batteryDays);
  const recommendedSolarKw = round1(input.dailyKwhEstimate / sunHours);

  const warnings: string[] = [];
  const allLoads = [
    ...input.essentialLoads,
    ...input.comfortLoads,
    ...input.heavyLoads,
  ].map((s) => s.toLowerCase());

  const flagged = HEAVY_LOAD_RED_FLAGS.filter((flag) =>
    allLoads.some((load) => load.includes(flag)),
  );

  if (flagged.length > 0) {
    warnings.push(
      `Heavy loads flagged (${flagged.join(", ")}). Off-grid solar usually can't carry these without dramatically larger arrays/batteries — consider propane heat, propane water heating, or a generator for these specific loads.`,
    );
  }

  if (input.batteryDays < 2) {
    warnings.push(
      "Under 2 days of battery autonomy is fragile. A single cloudy day or a generator failure can leave you cold. Aim for 2–3 days minimum.",
    );
  }

  if (input.dailyKwhEstimate > 30) {
    warnings.push(
      "Daily usage above 30 kWh is closer to a suburban household. Off-grid systems usually target 5–15 kWh/day after aggressive efficiency work.",
    );
  } else if (input.dailyKwhEstimate > 15) {
    warnings.push(
      "Daily usage 15–30 kWh is achievable off-grid but expensive. Audit phantom loads, swap to propane for heat/cooking/water, and replace resistive loads before sizing the array.",
    );
  }

  if (input.dailyKwhEstimate < 3 && input.essentialLoads.length === 0) {
    warnings.push(
      "Daily kWh estimate is very low. Make sure essentials (lights, fridge, water pump, comms) are included before sizing.",
    );
  }

  warnings.push(
    "Sun hours assumed at " +
      sunHours +
      " hr/day. Winter months in much of the US deliver 2–3 hr — size for the worst month or plan a generator for the dark season.",
  );

  warnings.push(
    "Have a licensed electrician sign off on the install. Off-grid wiring, grounding, and overcurrent protection are not safe DIY targets without training.",
  );

  const generatorRecommended =
    input.batteryDays < 3 ||
    input.dailyKwhEstimate > 15 ||
    flagged.length > 0;

  if (generatorRecommended) {
    warnings.push(
      "Generator backup recommended. Sized to recharge the battery bank in one run, not to power the house indefinitely.",
    );
  }

  const riskLevel = scoreSolarRisk({
    batteryDays: input.batteryDays,
    dailyKwhEstimate: input.dailyKwhEstimate,
    flaggedHeavyLoads: flagged.length,
  });

  return {
    recommendedBatteryKwh,
    recommendedSolarKw,
    generatorRecommended,
    riskLevel,
    warnings,
  };
}

function scoreSolarRisk(args: {
  batteryDays: number;
  dailyKwhEstimate: number;
  flaggedHeavyLoads: number;
}): RiskLevel {
  let score = 0;
  if (args.batteryDays < 1) score += 4;
  else if (args.batteryDays < 2) score += 2;
  else if (args.batteryDays < 3) score += 1;

  if (args.dailyKwhEstimate > 30) score += 3;
  else if (args.dailyKwhEstimate > 15) score += 1;

  // Each unsuitable load roughly doubles the case for resizing or alternate fuel.
  score += Math.min(args.flaggedHeavyLoads * 2, 4);

  if (score >= 6) return "critical";
  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
