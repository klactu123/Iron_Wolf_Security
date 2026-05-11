// Shared domain types. Calculators, storage, API, and UI all import from here.

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type LandStatus =
  | "dreaming"
  | "researching"
  | "own_land"
  | "living_on_land";

export type OffGridLevel = "low" | "medium" | "high" | "full";

export type ExperienceLevel = "beginner" | "some_experience" | "experienced";

// ---------- Profile ----------

export interface UserHomesteadProfile {
  id: string;
  userId?: string;
  householdSize: number;
  adults: number;
  children: number;
  currentLivingSituation: string;
  targetState: string;
  targetCounty: string;
  ownsLand: boolean;
  landStatus: LandStatus;
  desiredOffGridLevel: OffGridLevel;
  targetTimelineMonths: number;
  estimatedBudget: number;
  experienceLevel: ExperienceLevel;
  physicalLimitationsNotes: string;
  primaryGoals: string[];
  createdAt: string;
  updatedAt: string;
}

// ---------- Land ----------

export interface LandAssessment {
  id: string;
  profileId: string;
  acreage: number;
  roadAccess: "paved" | "gravel" | "dirt" | "seasonal" | "none";
  legalAccess: boolean;
  zoningKnown: boolean;
  hoaRestrictions: boolean;
  terrainType: "flat" | "rolling" | "hilly" | "steep" | "mixed";
  woodedPercentage: number;
  clearedPercentage: number;
  soilKnown: boolean;
  hasExistingStructures: boolean;
  hasExistingPower: boolean;
  hasExistingWaterSource: boolean;
  hasSeptic: boolean;
  distanceToTownMiles: number;
  distanceToHospitalMiles: number;
  notes: string;
}

// ---------- Water ----------

export interface WaterPlanInput {
  peopleCount: number;
  gallonsPerPersonPerDay: number;
  reserveDays: number;
  livestockWaterGallonsPerDay: number;
  gardenWaterGallonsPerDay: number;
  hasWell: boolean;
  hasRainCatchment: boolean;
  hasPond: boolean;
  hasSpring: boolean;
  filtrationNeeded: boolean;
  freezeProtectionNeeded: boolean;
}

export interface WaterPlanOutput {
  householdDailyGallons: number;
  totalDailyGallons: number;
  recommendedCisternGallons: number;
  riskLevel: RiskLevel;
  warnings: string[];
}

export interface WaterPlan extends WaterPlanInput, WaterPlanOutput {
  id: string;
  profileId: string;
}

// ---------- Solar ----------

export interface SolarPlanInput {
  dailyKwhEstimate: number;
  batteryDays: number;
  essentialLoads: string[];
  comfortLoads: string[];
  heavyLoads: string[];
  /** Average usable sun hours/day. MVP default 4. Configurable per-location later. */
  sunHoursPerDay?: number;
}

export interface SolarPlanOutput {
  recommendedBatteryKwh: number;
  recommendedSolarKw: number;
  generatorRecommended: boolean;
  riskLevel: RiskLevel;
  warnings: string[];
}

export interface SolarPlan extends SolarPlanInput, SolarPlanOutput {
  id: string;
  profileId: string;
}

// ---------- Food ----------

export interface FoodPlanInput {
  gardeningExperience: ExperienceLevel;
  gardenSquareFeet: number;
  raisedBedsCount: number;
  wantsChickens: boolean;
  wantsLivestock: boolean;
  livestockTypes: string[];
  foodPreservationExperience: ExperienceLevel;
}

export interface FoodPlanOutput {
  recommendedYearOneCrops: string[];
  riskLevel: RiskLevel;
  warnings: string[];
}

export interface FoodPlan extends FoodPlanInput, FoodPlanOutput {
  id: string;
  profileId: string;
}

// ---------- Waste / sanitation ----------

export interface WasteSanitationPlanInput {
  hasSeptic: boolean;
  septicStatusKnown: boolean;
  wantsCompostingToilet: boolean;
  graywaterPlanKnown: boolean;
  trashDisposalPlan: string;
  animalWastePlan: string;
  legalConcerns: string;
}

export interface WasteSanitationPlanOutput {
  riskLevel: RiskLevel;
  warnings: string[];
}

export interface WasteSanitationPlan
  extends WasteSanitationPlanInput,
    WasteSanitationPlanOutput {
  id: string;
  profileId: string;
}

// ---------- Shelter ----------

export interface ShelterPlanInput {
  shelterType:
    | "existing_house"
    | "cabin"
    | "tiny_house"
    | "rv"
    | "yurt"
    | "to_be_built"
    | "other";
  existingShelter: boolean;
  primaryHeatSource: "wood" | "propane" | "electric" | "solar" | "none" | "other";
  backupHeatSource: "wood" | "propane" | "electric" | "solar" | "none" | "other";
  coolingPlan: string;
  winterizationNeeded: boolean;
}

export interface ShelterPlanOutput {
  riskLevel: RiskLevel;
  warnings: string[];
}

export interface ShelterPlan extends ShelterPlanInput, ShelterPlanOutput {
  id: string;
  profileId: string;
}

// ---------- Budget ----------

export interface BudgetPlanInput {
  totalBudget: number;
  landBudget: number;
  waterBudget: number;
  powerBudget: number;
  shelterBudget: number;
  foodBudget: number;
  toolsBudget: number;
  emergencyReserve: number;
}

export interface BudgetPlanOutput {
  phaseOneEstimate: number;
  phaseTwoEstimate: number;
  phaseThreeEstimate: number;
  phaseFourEstimate: number;
  riskLevel: RiskLevel;
  warnings: string[];
}

export interface BudgetPlan extends BudgetPlanInput, BudgetPlanOutput {
  id: string;
  profileId: string;
}

// ---------- Skills ----------

export interface SkillsAssessmentInput {
  gardeningScore: number;
  carpentryScore: number;
  plumbingScore: number;
  electricalScore: number;
  solarScore: number;
  animalCareScore: number;
  foodPreservationScore: number;
  firstAidScore: number;
  smallEngineRepairScore: number;
}

export interface SkillsAssessmentOutput {
  overallSkillScore: number;
  prioritySkillsToLearn: string[];
  riskLevel: RiskLevel;
  warnings: string[];
}

export interface SkillsAssessment
  extends SkillsAssessmentInput,
    SkillsAssessmentOutput {
  id: string;
  profileId: string;
}

// ---------- Readiness / report ----------

export interface CategoryScores {
  water: number;
  power: number;
  food: number;
  shelter: number;
  budget: number;
  skills: number;
  land: number;
}

export interface ReadinessScore {
  overall: number;
  categories: CategoryScores;
  topRisks: string[];
}

export interface BuildPhases {
  phaseOne: string[];
  phaseTwo: string[];
  phaseThree: string[];
  phaseFour: string[];
}

export interface RealityReport {
  id: string;
  profileId: string;
  overallReadinessScore: number;
  waterReadinessScore: number;
  powerReadinessScore: number;
  foodReadinessScore: number;
  shelterReadinessScore: number;
  budgetReadinessScore: number;
  skillsReadinessScore: number;
  landReadinessScore: number;
  topRisks: string[];
  recommendedBuildOrder: BuildPhases;
  twelveMonthActionPlan: string[];
  generatedSummary: string;
  createdAt: string;
}

// ---------- Combined snapshot for report + AI ----------

export interface HomesteadSnapshot {
  profile: UserHomesteadProfile | null;
  land: LandAssessment | null;
  water: WaterPlan | null;
  solar: SolarPlan | null;
  food: FoodPlan | null;
  waste: WasteSanitationPlan | null;
  shelter: ShelterPlan | null;
  budget: BudgetPlan | null;
  skills: SkillsAssessment | null;
}
