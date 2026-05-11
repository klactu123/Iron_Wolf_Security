import type { BuildPhases, HomesteadSnapshot } from "@/lib/types";

const PHASE_ONE_BASE = [
  "Confirm legal access (recorded easement, deeded access, or owned road frontage)",
  "Verify zoning, building permits, and septic/well rules with the county — in writing",
  "Establish basic shelter you can survive a winter in",
  "Establish a primary water source and at least 7–14 days of stored reserve",
  "Install a code-compliant sanitation solution (septic, vault, or permitted alternative)",
  "Install basic power: enough for fridge, lights, water pump, communication",
  "Install emergency comms (cell signal booster, satellite messenger, or landline)",
  "Stock 30–90 days of shelf-stable food and a way to cook without grid power",
];

const PHASE_TWO_BASE = [
  "Build small garden beds (200–600 sq ft) and learn what your soil and microclimate actually do",
  "Tool storage / shop space — out of the weather, organized, lockable",
  "Backup generator sized to recharge battery bank",
  "Better water filtration with lab-tested results",
  "Predator-proof chicken coop and small flock — only after water and shelter are stable",
  "Wood storage for one full heating season ahead",
];

const PHASE_THREE_BASE = [
  "Plant fruit/nut orchard — varieties chosen for your zone, not for catalog photos",
  "Greenhouse or hoop house for season extension",
  "Larger livestock (goats, sheep, or a single pig) with proper fencing, shelter, water, and a vet relationship",
  "Workshop with welding/woodworking capacity",
  "Drip irrigation for the larger garden",
  "Expanded solar array and battery bank to match real measured loads",
];

const PHASE_FOUR_BASE = [
  "Redundant water (well + cistern + catchment, sized to a 60+ day outage)",
  "Seed-saving practice and seed library",
  "Barter and skill-trade relationships with neighbors",
  "Advanced livestock (cattle, dairy, breeding stock) only after years of small-stock practice",
  "Root cellar or other long-term storage independent of refrigeration",
  "Long-term resilience: spare parts inventory, alternate access route, fire plan",
];

export function generateBuildPhases(snap: HomesteadSnapshot): BuildPhases {
  const phaseOne = [...PHASE_ONE_BASE];
  const phaseTwo = [...PHASE_TWO_BASE];
  const phaseThree = [...PHASE_THREE_BASE];
  const phaseFour = [...PHASE_FOUR_BASE];

  // Defer chickens if water/shelter aren't solid.
  const waterShelterStable =
    snap.water?.riskLevel &&
    ["low", "medium"].includes(snap.water.riskLevel) &&
    snap.shelter?.riskLevel &&
    ["low", "medium"].includes(snap.shelter.riskLevel);

  if (snap.food?.wantsChickens && !waterShelterStable) {
    const idx = phaseTwo.findIndex((line) => line.toLowerCase().includes("chicken"));
    if (idx >= 0) {
      phaseTwo[idx] =
        "Defer chickens. Water and shelter are not yet stable — animals can't be down for a day. Move to Phase 3 once they are.";
    }
  }

  // If livestock are wanted but skills are very low, push hard livestock to Phase 4.
  if (snap.food?.wantsLivestock && (snap.skills?.overallSkillScore ?? 0) < 40) {
    phaseThree.unshift(
      "Defer larger livestock until skill score climbs — small stock and gardening first.",
    );
  }

  // If shelter doesn't yet exist, raise it up Phase 1 explicitly.
  if (snap.shelter && !snap.shelter.existingShelter) {
    phaseOne.unshift(
      "Critical: secure habitable shelter (rental, RV with winter plan, or fast-build cabin) before anything else.",
    );
  }

  // If septic is unknown, surface it.
  if (snap.waste && !snap.waste.hasSeptic && !snap.waste.wantsCompostingToilet) {
    phaseOne.unshift(
      "Critical: define and permit a sanitation system. Nothing else gets occupancy without it.",
    );
  }

  return { phaseOne, phaseTwo, phaseThree, phaseFour };
}

export function generateTwelveMonthActionPlan(
  snap: HomesteadSnapshot,
): string[] {
  const plan: string[] = [];

  plan.push(
    "Month 1: Verify legal access and zoning in writing. Visit the county planning office. Pull and read the actual ordinances.",
  );
  plan.push(
    "Month 2: Get water tested (if any source on site) and request well-drilling and septic-install quotes from at least three local contractors.",
  );

  if (snap.shelter && !snap.shelter.existingShelter) {
    plan.push(
      "Month 3: Lock in habitable shelter for the first 12 months — rental, RV with winter plan, or a fast-build cabin under permit.",
    );
  } else {
    plan.push(
      "Month 3: Audit existing shelter for winter readiness — insulation, heat, pipe protection, roof.",
    );
  }

  plan.push(
    "Month 4: Install or upgrade water reserve to a 14-day minimum. Plan filtration based on actual lab results.",
  );
  plan.push(
    "Month 5: Get an electrician or solar installer to walk the site. Don't size your array off internet calculators — get a load audit.",
  );
  plan.push(
    "Month 6: Take a Wilderness First Aid (or equivalent) course. Stock a real medical kit, not a band-aid kit.",
  );
  plan.push(
    "Month 7: Build small garden beds. 200–600 sq ft. Plant beginner crops only.",
  );
  plan.push(
    "Month 8: Run a 72-hour blackout drill. What broke? What ran out? Fix that before winter.",
  );
  plan.push(
    "Month 9: Lay in firewood or propane for the full winter, plus 25% reserve.",
  );

  if (snap.food?.wantsChickens) {
    plan.push(
      "Month 10: Build predator-proof chicken coop. Chickens arrive only when water, shelter, and feed storage are stable.",
    );
  } else {
    plan.push(
      "Month 10: Tool and parts inventory. Spare belts, filters, fuses, plumbing fittings, fasteners, sealants.",
    );
  }

  plan.push(
    "Month 11: Tax, insurance, and emergency-fund check. Confirm a 3–6 month cash buffer separate from the build budget.",
  );
  plan.push(
    "Month 12: Year-one review. What worked, what didn't, what's the Year 2 priority list. Update the plan honestly.",
  );

  return plan;
}
