import type {
  RiskLevel,
  SkillsAssessmentInput,
  SkillsAssessmentOutput,
} from "@/lib/types";

interface SkillRow {
  key: keyof SkillsAssessmentInput;
  label: string;
  /** Higher weight = more critical to homestead survival year-one. */
  weight: number;
}

const SKILLS: SkillRow[] = [
  { key: "firstAidScore", label: "First aid / wilderness medicine", weight: 3 },
  { key: "carpentryScore", label: "Carpentry / framing / repair", weight: 3 },
  { key: "plumbingScore", label: "Plumbing", weight: 2 },
  { key: "electricalScore", label: "Electrical safety basics", weight: 2 },
  { key: "solarScore", label: "Solar / battery system literacy", weight: 2 },
  { key: "gardeningScore", label: "Vegetable gardening", weight: 2 },
  { key: "foodPreservationScore", label: "Food preservation", weight: 2 },
  { key: "smallEngineRepairScore", label: "Small engine repair", weight: 2 },
  { key: "animalCareScore", label: "Animal care", weight: 1 },
];

export function calculateSkillsAssessment(
  input: SkillsAssessmentInput,
): SkillsAssessmentOutput {
  const totalWeight = SKILLS.reduce((s, r) => s + r.weight, 0);
  const weightedSum = SKILLS.reduce(
    (s, r) => s + (input[r.key] as number) * r.weight,
    0,
  );
  // Scale to 0–100. 5 is max per skill.
  const overallSkillScore = Math.round((weightedSum / (totalWeight * 5)) * 100);

  const sorted = [...SKILLS].sort((a, b) => {
    const aGap = (5 - (input[a.key] as number)) * a.weight;
    const bGap = (5 - (input[b.key] as number)) * b.weight;
    return bGap - aGap;
  });
  const prioritySkillsToLearn = sorted
    .filter((row) => (input[row.key] as number) < 3)
    .slice(0, 5)
    .map((row) => row.label);

  const warnings: string[] = [];

  if (input.firstAidScore < 2) {
    warnings.push(
      "First-aid score is very low. Rural homesteads are far from emergency services — take a Wilderness First Aid or equivalent course before moving on the land.",
    );
  }
  if (input.carpentryScore < 2) {
    warnings.push(
      "Carpentry skills are minimal. You will repair something every week. Take a community-college framing or basic-repair course, or budget for paid labor.",
    );
  }
  if (input.electricalScore < 2 && input.solarScore < 2) {
    warnings.push(
      "Electrical and solar literacy both low. You don't need to be a licensed electrician, but you must be able to read a schematic, identify hazards, and not get yourself killed. Bring in a pro for the install.",
    );
  }
  if (input.smallEngineRepairScore < 2) {
    warnings.push(
      "Small engine repair score low. Generators, chainsaws, log splitters, and tractors break. Learn basic carb cleaning, oil changes, and starter diagnostics.",
    );
  }
  if (input.gardeningScore < 2 && input.foodPreservationScore < 2) {
    warnings.push(
      "Gardening and preservation both low. Realistic year-one food production goal: 10–20% replacement, not self-sufficiency.",
    );
  }
  if (overallSkillScore < 40) {
    warnings.push(
      "Overall skill score is low. This is normal for new homesteaders. Build a learning plan: one major skill per quarter, prioritize medical and shelter-repair skills first.",
    );
  }

  const riskLevel: RiskLevel =
    overallSkillScore < 25
      ? "critical"
      : overallSkillScore < 45
        ? "high"
        : overallSkillScore < 65
          ? "medium"
          : "low";

  return {
    overallSkillScore,
    prioritySkillsToLearn,
    riskLevel,
    warnings,
  };
}
