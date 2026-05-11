import type {
  FoodPlanInput,
  FoodPlanOutput,
  RiskLevel,
} from "@/lib/types";

const BEGINNER_CROPS = [
  "lettuce",
  "kale",
  "swiss chard",
  "green beans",
  "zucchini",
  "summer squash",
  "tomatoes",
  "cucumbers",
  "radishes",
  "garlic",
  "potatoes",
  "herbs (basil, parsley, dill)",
];

const INTERMEDIATE_ADDITIONS = [
  "onions from sets",
  "carrots",
  "winter squash",
  "peppers",
  "broccoli",
  "cabbage",
  "sweet corn",
  "dry beans",
];

export function calculateFoodPlan(input: FoodPlanInput): FoodPlanOutput {
  const warnings: string[] = [];

  let crops: string[];
  if (input.gardeningExperience === "beginner") {
    crops = BEGINNER_CROPS.slice(0, 8);
  } else if (input.gardeningExperience === "some_experience") {
    crops = [...BEGINNER_CROPS.slice(0, 8), ...INTERMEDIATE_ADDITIONS.slice(0, 4)];
  } else {
    crops = [...BEGINNER_CROPS, ...INTERMEDIATE_ADDITIONS];
  }

  if (input.gardeningExperience === "beginner" && input.gardenSquareFeet > 1500) {
    warnings.push(
      "Beginner gardener with a large planned garden. Year-one gardens routinely fail at this scale — start with 200–600 sq ft and expand only after a full season of yields.",
    );
  }

  if (input.raisedBedsCount > 12 && input.gardeningExperience === "beginner") {
    warnings.push(
      "Many raised beds planned with no experience. Soil, irrigation, pests, and timing all compound — fewer beds done well beats many beds done poorly.",
    );
  }

  if (input.wantsLivestock && input.gardeningExperience === "beginner") {
    warnings.push(
      "Livestock planned alongside a beginner garden. Animals need water, fencing, shelter, feed, and daily care every single day. Defer livestock until water and shelter are stable.",
    );
  }

  if (
    input.wantsLivestock &&
    input.livestockTypes.some((t) =>
      ["cow", "cattle", "goat", "sheep", "pig", "horse"].includes(t.toLowerCase()),
    )
  ) {
    warnings.push(
      "Large livestock planned. Each species has different fencing, water, mineral, parasite, and breeding requirements. Talk to your county extension office and a local large-animal vet before buying.",
    );
  }

  if (input.wantsChickens) {
    warnings.push(
      "Chickens are reasonable Phase 2 — only after water, shelter, and a predator-proof coop are in place. Verify your zoning allows poultry and check rooster restrictions.",
    );
  }

  if (
    input.foodPreservationExperience === "beginner" &&
    input.gardenSquareFeet > 800
  ) {
    warnings.push(
      "Large planned garden with no preservation experience. Without canning, freezing, drying, or root-cellaring skill, surplus rots. Learn one preservation method per major crop.",
    );
  }

  warnings.push(
    "Food self-sufficiency is a multi-year project. Year-one realistic target: replace 10–20% of household calories, learn what your land actually grows, build soil.",
  );

  const riskLevel = scoreFoodRisk(input);

  return {
    recommendedYearOneCrops: crops,
    riskLevel,
    warnings,
  };
}

function scoreFoodRisk(input: FoodPlanInput): RiskLevel {
  let score = 0;

  if (input.gardeningExperience === "beginner") score += 1;
  if (input.foodPreservationExperience === "beginner") score += 1;

  if (input.wantsLivestock && input.gardeningExperience === "beginner") {
    score += 3;
  }
  if (input.wantsLivestock) {
    const heavy = input.livestockTypes.some((t) =>
      ["cow", "cattle", "goat", "sheep", "pig", "horse"].includes(t.toLowerCase()),
    );
    if (heavy) score += 2;
  }

  if (input.gardeningExperience === "beginner" && input.gardenSquareFeet > 1500) {
    score += 2;
  }

  if (score >= 5) return "critical";
  if (score >= 3) return "high";
  if (score >= 1) return "medium";
  return "low";
}
