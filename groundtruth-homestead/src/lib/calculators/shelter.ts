import type {
  RiskLevel,
  ShelterPlanInput,
  ShelterPlanOutput,
} from "@/lib/types";

export function calculateShelterPlan(
  input: ShelterPlanInput,
): ShelterPlanOutput {
  const warnings: string[] = [];

  if (input.shelterType === "rv") {
    warnings.push(
      "RV-as-primary-shelter is workable short-term but tough through real winters. Pipes freeze, holding tanks fail, and many counties prohibit RV residency. Verify legality and have a winter exit plan.",
    );
  }

  if (input.shelterType === "tiny_house" || input.shelterType === "yurt") {
    warnings.push(
      "Compact shelter chosen. Confirm it meets local minimum dwelling code or qualifies as ag/accessory — code enforcement is the #1 cause of forced removal.",
    );
  }

  if (input.shelterType === "to_be_built" && !input.existingShelter) {
    warnings.push(
      "No existing shelter and a build planned. Have a written, permitted plan for where you will live during construction — building from a tent through a winter is how people quit homesteading.",
    );
  }

  if (input.primaryHeatSource === "electric") {
    warnings.push(
      "Electric resistive heat is the most expensive heat source off-grid and the first thing to fail in an outage. Plan a non-electric backup (wood, propane).",
    );
  }

  if (input.primaryHeatSource === "wood") {
    warnings.push(
      "Wood heat is reliable but labor-intensive. Verify chimney clearance, install a UL-listed stove, get a CO detector, and have the install inspected for insurance.",
    );
  }

  if (input.backupHeatSource === "none" || !input.backupHeatSource) {
    warnings.push(
      "No backup heat source. A failed primary heat in winter is a life-safety problem. Even a small kerosene heater in reserve changes the risk profile.",
    );
  }

  if (
    input.primaryHeatSource === input.backupHeatSource &&
    input.primaryHeatSource !== "none"
  ) {
    warnings.push(
      "Primary and backup heat use the same fuel/source. A single supply-chain or system failure takes both out — diversify.",
    );
  }

  if (input.winterizationNeeded) {
    warnings.push(
      "Winterization flagged. Insulate pipes, skirt the foundation/RV, plan snow access to the woodshed, and have stored water in case lines freeze.",
    );
  }

  if (!input.coolingPlan || input.coolingPlan.trim().length < 3) {
    warnings.push(
      "No cooling plan defined. In hot/humid climates, this is a heat-illness risk. Shade, ventilation, and a small DC fan often suffice without burning AC loads.",
    );
  }

  const riskLevel = scoreShelterRisk(input);

  return { riskLevel, warnings };
}

function scoreShelterRisk(input: ShelterPlanInput): RiskLevel {
  let score = 0;

  if (input.shelterType === "rv") score += 2;
  if (input.shelterType === "to_be_built" && !input.existingShelter) score += 3;
  if (input.shelterType === "tiny_house" || input.shelterType === "yurt") score += 1;

  if (input.primaryHeatSource === "electric") score += 2;
  if (input.backupHeatSource === "none") score += 2;
  if (
    input.primaryHeatSource === input.backupHeatSource &&
    input.primaryHeatSource !== "none"
  ) {
    score += 1;
  }

  if (input.winterizationNeeded) score += 1;

  if (score >= 6) return "critical";
  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}
