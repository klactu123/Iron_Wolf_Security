import type {
  BudgetPlan,
  FoodPlan,
  HomesteadSnapshot,
  LandAssessment,
  RealityReport,
  ShelterPlan,
  SkillsAssessment,
  SolarPlan,
  UserHomesteadProfile,
  WasteSanitationPlan,
  WaterPlan,
} from "@/lib/types";

// Repository interface — JSON impl ships in MVP. Postgres/Drizzle drops in here later.
// Single-user MVP: every getter returns "the" record for the active profile.
export interface HomesteadRepo {
  getProfile(profileId?: string): Promise<UserHomesteadProfile | null>;
  saveProfile(profile: UserHomesteadProfile): Promise<UserHomesteadProfile>;

  getLand(profileId?: string): Promise<LandAssessment | null>;
  saveLand(land: LandAssessment): Promise<LandAssessment>;

  getWater(profileId?: string): Promise<WaterPlan | null>;
  saveWater(water: WaterPlan): Promise<WaterPlan>;

  getSolar(profileId?: string): Promise<SolarPlan | null>;
  saveSolar(solar: SolarPlan): Promise<SolarPlan>;

  getFood(profileId?: string): Promise<FoodPlan | null>;
  saveFood(food: FoodPlan): Promise<FoodPlan>;

  getWaste(profileId?: string): Promise<WasteSanitationPlan | null>;
  saveWaste(waste: WasteSanitationPlan): Promise<WasteSanitationPlan>;

  getShelter(profileId?: string): Promise<ShelterPlan | null>;
  saveShelter(shelter: ShelterPlan): Promise<ShelterPlan>;

  getBudget(profileId?: string): Promise<BudgetPlan | null>;
  saveBudget(budget: BudgetPlan): Promise<BudgetPlan>;

  getSkills(profileId?: string): Promise<SkillsAssessment | null>;
  saveSkills(skills: SkillsAssessment): Promise<SkillsAssessment>;

  getReport(profileId?: string): Promise<RealityReport | null>;
  saveReport(report: RealityReport): Promise<RealityReport>;

  getSnapshot(profileId?: string): Promise<HomesteadSnapshot>;
}

export const DEFAULT_PROFILE_ID = "default";
