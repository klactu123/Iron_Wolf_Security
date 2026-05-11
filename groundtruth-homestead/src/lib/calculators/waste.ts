import type {
  RiskLevel,
  WasteSanitationPlanInput,
  WasteSanitationPlanOutput,
} from "@/lib/types";

export function calculateWastePlan(
  input: WasteSanitationPlanInput,
): WasteSanitationPlanOutput {
  const warnings: string[] = [];

  if (input.hasSeptic && !input.septicStatusKnown) {
    warnings.push(
      "Septic on site but condition unknown. Pay for an inspection and pump-out before relying on it — replacement is $10k–$30k+ in many areas.",
    );
  }

  if (!input.hasSeptic) {
    warnings.push(
      "No septic system planned. A perc test, county permit, and licensed installer are typically required before any system is installed. Verify legality before assuming a composting toilet meets code in your county.",
    );
  }

  if (input.wantsCompostingToilet) {
    warnings.push(
      "Composting toilets are legal in some jurisdictions, regulated in others, and prohibited in some. Confirm with your county health department in writing before relying on one.",
    );
  }

  if (!input.graywaterPlanKnown) {
    warnings.push(
      "Graywater plan not defined. Direct discharge to ground is illegal in many states. A simple branched-drain system and mulch basin is usually allowed where graywater is legal.",
    );
  }

  if (!input.trashDisposalPlan || input.trashDisposalPlan.trim().length < 5) {
    warnings.push(
      "Trash plan not specified. Burning trash is illegal nearly everywhere. Plan for a haul-out service or transfer station trips.",
    );
  }

  if (
    input.animalWastePlan.trim().length === 0 &&
    input.legalConcerns.toLowerCase().includes("livestock")
  ) {
    warnings.push(
      "Livestock waste plan missing. Manure management is a permitting and watershed issue, not just a smell issue.",
    );
  }

  warnings.push(
    "Sanitation is one of the top three failure points for new homesteads. Get this right before livestock, before guests, and before winter.",
  );

  const riskLevel = scoreWasteRisk(input);

  return { riskLevel, warnings };
}

function scoreWasteRisk(input: WasteSanitationPlanInput): RiskLevel {
  let score = 0;
  if (!input.hasSeptic) score += 2;
  if (input.hasSeptic && !input.septicStatusKnown) score += 2;
  if (!input.graywaterPlanKnown) score += 1;
  if (input.wantsCompostingToilet) score += 1;
  if (!input.trashDisposalPlan || input.trashDisposalPlan.trim().length < 5) {
    score += 1;
  }

  if (score >= 5) return "critical";
  if (score >= 3) return "high";
  if (score >= 1) return "medium";
  return "low";
}
