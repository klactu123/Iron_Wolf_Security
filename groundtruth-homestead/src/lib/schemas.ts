import { z } from "zod";

export const landStatusSchema = z.enum([
  "dreaming",
  "researching",
  "own_land",
  "living_on_land",
]);

export const offGridLevelSchema = z.enum(["low", "medium", "high", "full"]);

export const experienceLevelSchema = z.enum([
  "beginner",
  "some_experience",
  "experienced",
]);

export const profileInputSchema = z.object({
  householdSize: z.number().int().min(1).max(50),
  adults: z.number().int().min(0).max(50),
  children: z.number().int().min(0).max(50),
  currentLivingSituation: z.string().max(500),
  targetState: z.string().max(100),
  targetCounty: z.string().max(100),
  ownsLand: z.boolean(),
  landStatus: landStatusSchema,
  desiredOffGridLevel: offGridLevelSchema,
  targetTimelineMonths: z.number().int().min(0).max(600),
  estimatedBudget: z.number().min(0),
  experienceLevel: experienceLevelSchema,
  physicalLimitationsNotes: z.string().max(2000),
  primaryGoals: z.array(z.string().max(200)).max(20),
});
export type ProfileInput = z.infer<typeof profileInputSchema>;

export const landInputSchema = z.object({
  acreage: z.number().min(0).max(100000),
  roadAccess: z.enum(["paved", "gravel", "dirt", "seasonal", "none"]),
  legalAccess: z.boolean(),
  zoningKnown: z.boolean(),
  hoaRestrictions: z.boolean(),
  terrainType: z.enum(["flat", "rolling", "hilly", "steep", "mixed"]),
  woodedPercentage: z.number().min(0).max(100),
  clearedPercentage: z.number().min(0).max(100),
  soilKnown: z.boolean(),
  hasExistingStructures: z.boolean(),
  hasExistingPower: z.boolean(),
  hasExistingWaterSource: z.boolean(),
  hasSeptic: z.boolean(),
  distanceToTownMiles: z.number().min(0).max(1000),
  distanceToHospitalMiles: z.number().min(0).max(1000),
  notes: z.string().max(2000),
});
export type LandInput = z.infer<typeof landInputSchema>;

export const waterInputSchema = z.object({
  peopleCount: z.number().int().min(1).max(50),
  gallonsPerPersonPerDay: z.number().min(1).max(200),
  reserveDays: z.number().min(0).max(365),
  livestockWaterGallonsPerDay: z.number().min(0).max(10000),
  gardenWaterGallonsPerDay: z.number().min(0).max(10000),
  hasWell: z.boolean(),
  hasRainCatchment: z.boolean(),
  hasPond: z.boolean(),
  hasSpring: z.boolean(),
  filtrationNeeded: z.boolean(),
  freezeProtectionNeeded: z.boolean(),
});
export type WaterInput = z.infer<typeof waterInputSchema>;

export const solarInputSchema = z.object({
  dailyKwhEstimate: z.number().min(0).max(500),
  batteryDays: z.number().min(0).max(30),
  essentialLoads: z.array(z.string().max(100)).max(50),
  comfortLoads: z.array(z.string().max(100)).max(50),
  heavyLoads: z.array(z.string().max(100)).max(50),
  sunHoursPerDay: z.number().min(1).max(8).optional(),
});
export type SolarInput = z.infer<typeof solarInputSchema>;

export const foodInputSchema = z.object({
  gardeningExperience: experienceLevelSchema,
  gardenSquareFeet: z.number().min(0).max(1000000),
  raisedBedsCount: z.number().int().min(0).max(1000),
  wantsChickens: z.boolean(),
  wantsLivestock: z.boolean(),
  livestockTypes: z.array(z.string().max(50)).max(20),
  foodPreservationExperience: experienceLevelSchema,
});
export type FoodInput = z.infer<typeof foodInputSchema>;

export const wasteInputSchema = z.object({
  hasSeptic: z.boolean(),
  septicStatusKnown: z.boolean(),
  wantsCompostingToilet: z.boolean(),
  graywaterPlanKnown: z.boolean(),
  trashDisposalPlan: z.string().max(500),
  animalWastePlan: z.string().max(500),
  legalConcerns: z.string().max(1000),
});
export type WasteInput = z.infer<typeof wasteInputSchema>;

export const shelterInputSchema = z.object({
  shelterType: z.enum([
    "existing_house",
    "cabin",
    "tiny_house",
    "rv",
    "yurt",
    "to_be_built",
    "other",
  ]),
  existingShelter: z.boolean(),
  primaryHeatSource: z.enum([
    "wood",
    "propane",
    "electric",
    "solar",
    "none",
    "other",
  ]),
  backupHeatSource: z.enum([
    "wood",
    "propane",
    "electric",
    "solar",
    "none",
    "other",
  ]),
  coolingPlan: z.string().max(500),
  winterizationNeeded: z.boolean(),
});
export type ShelterInput = z.infer<typeof shelterInputSchema>;

export const budgetInputSchema = z.object({
  totalBudget: z.number().min(0),
  landBudget: z.number().min(0),
  waterBudget: z.number().min(0),
  powerBudget: z.number().min(0),
  shelterBudget: z.number().min(0),
  foodBudget: z.number().min(0),
  toolsBudget: z.number().min(0),
  emergencyReserve: z.number().min(0),
});
export type BudgetInput = z.infer<typeof budgetInputSchema>;

const skillScore = z.number().min(0).max(5);

export const skillsInputSchema = z.object({
  gardeningScore: skillScore,
  carpentryScore: skillScore,
  plumbingScore: skillScore,
  electricalScore: skillScore,
  solarScore: skillScore,
  animalCareScore: skillScore,
  foodPreservationScore: skillScore,
  firstAidScore: skillScore,
  smallEngineRepairScore: skillScore,
});
export type SkillsInput = z.infer<typeof skillsInputSchema>;
