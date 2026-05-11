import type {
  RiskLevel,
  WaterPlanInput,
  WaterPlanOutput,
} from "@/lib/types";

export function calculateWaterNeeds(input: WaterPlanInput): WaterPlanOutput {
  const householdDailyGallons =
    input.peopleCount * input.gallonsPerPersonPerDay;
  const totalDailyGallons =
    householdDailyGallons +
    input.livestockWaterGallonsPerDay +
    input.gardenWaterGallonsPerDay;
  const recommendedCisternGallons = totalDailyGallons * input.reserveDays;

  const warnings: string[] = [];

  const hasAnyOnSiteSource =
    input.hasWell || input.hasRainCatchment || input.hasPond || input.hasSpring;
  const hasBackupSource =
    [input.hasWell, input.hasRainCatchment, input.hasPond, input.hasSpring]
      .filter(Boolean).length >= 2;

  if (input.reserveDays < 7) {
    warnings.push(
      "Reserve is under 7 days. A burst pipe, pump failure, or a single dry week can leave you without water. Aim for at least 7–14 days of stored reserve.",
    );
  } else if (input.reserveDays < 30 && !hasBackupSource) {
    warnings.push(
      "Less than 30 days of reserve and no backup source. Plan a second independent water source (well + rain catchment, or hauled-water option) before depending on one.",
    );
  }

  if (!hasAnyOnSiteSource) {
    warnings.push(
      "No on-site water source identified. Hauled water is workable short-term but expensive and fragile long-term — verify well drilling cost and rainwater catchment legality for your county.",
    );
  }

  if (
    input.livestockWaterGallonsPerDay > 0 &&
    recommendedCisternGallons < totalDailyGallons * 14
  ) {
    warnings.push(
      "Livestock water demand is included but reserve is short. Animals can't ration — a 2-week minimum is safer.",
    );
  }

  if (input.gallonsPerPersonPerDay < 20) {
    warnings.push(
      "Under 20 gal/person/day is very tight. Drinking, cooking, hygiene, dishes, and laundry add up — verify this is realistic for your household.",
    );
  } else if (input.gallonsPerPersonPerDay > 80) {
    warnings.push(
      "Over 80 gal/person/day is closer to suburban consumption. Off-grid systems usually target 30–50 gal/person/day.",
    );
  }

  if (input.filtrationNeeded) {
    warnings.push(
      "Filtration flagged. Have your water tested by a certified lab; do not drink untreated pond, creek, or rainwater. Match filtration to actual contaminants.",
    );
  }

  if (input.freezeProtectionNeeded) {
    warnings.push(
      "Freeze protection needed. Buried lines below frost depth, insulated cisterns, and heat-traced exposed runs are not optional in cold climates.",
    );
  }

  if (input.hasWell) {
    warnings.push(
      "Well planned. Plan for pump failure: keep a backup pump, hand-pump option, or stored water sized to a multi-day outage.",
    );
  }

  if (input.hasRainCatchment) {
    warnings.push(
      "Rainwater catchment planned. Verify your state and county rules — some jurisdictions restrict catchment volume or potable use.",
    );
  }

  const riskLevel = scoreWaterRisk({
    reserveDays: input.reserveDays,
    hasAnyOnSiteSource,
    hasBackupSource,
    filtrationNeeded: input.filtrationNeeded,
    freezeProtectionNeeded: input.freezeProtectionNeeded,
  });

  return {
    householdDailyGallons,
    totalDailyGallons,
    recommendedCisternGallons,
    riskLevel,
    warnings,
  };
}

function scoreWaterRisk(args: {
  reserveDays: number;
  hasAnyOnSiteSource: boolean;
  hasBackupSource: boolean;
  filtrationNeeded: boolean;
  freezeProtectionNeeded: boolean;
}): RiskLevel {
  let score = 0;
  if (args.reserveDays < 3) score += 4;
  else if (args.reserveDays < 7) score += 3;
  else if (args.reserveDays < 14) score += 2;
  else if (args.reserveDays < 30) score += 1;

  if (!args.hasAnyOnSiteSource) score += 3;
  else if (!args.hasBackupSource) score += 1;

  if (args.filtrationNeeded) score += 1;
  if (args.freezeProtectionNeeded) score += 1;

  if (score >= 6) return "critical";
  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}
