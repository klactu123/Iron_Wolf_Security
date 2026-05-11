import { promises as fs } from "node:fs";
import path from "node:path";
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
import { DEFAULT_PROFILE_ID, type HomesteadRepo } from "./types";

interface FileShape {
  profile: Record<string, UserHomesteadProfile>;
  land: Record<string, LandAssessment>;
  water: Record<string, WaterPlan>;
  solar: Record<string, SolarPlan>;
  food: Record<string, FoodPlan>;
  waste: Record<string, WasteSanitationPlan>;
  shelter: Record<string, ShelterPlan>;
  budget: Record<string, BudgetPlan>;
  skills: Record<string, SkillsAssessment>;
  report: Record<string, RealityReport>;
}

const EMPTY: FileShape = {
  profile: {},
  land: {},
  water: {},
  solar: {},
  food: {},
  waste: {},
  shelter: {},
  budget: {},
  skills: {},
  report: {},
};

export class JsonHomesteadRepo implements HomesteadRepo {
  private readonly filePath: string;
  // Serialize writes so concurrent saves don't clobber each other.
  private writeChain: Promise<void> = Promise.resolve();

  constructor(filePath?: string) {
    this.filePath =
      filePath ??
      process.env.HOMESTEAD_STORE_PATH ??
      path.join(process.cwd(), "data", "store.json");
  }

  private async read(): Promise<FileShape> {
    try {
      const buf = await fs.readFile(this.filePath, "utf8");
      const parsed = JSON.parse(buf) as Partial<FileShape>;
      return { ...EMPTY, ...parsed };
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        return { ...EMPTY };
      }
      throw err;
    }
  }

  private async write(data: FileShape): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const tmp = this.filePath + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
    await fs.rename(tmp, this.filePath);
  }

  private async mutate<T>(
    fn: (data: FileShape) => Promise<{ next: FileShape; result: T }>,
  ): Promise<T> {
    const queued = this.writeChain.then(async () => {
      const data = await this.read();
      const { next, result } = await fn(data);
      await this.write(next);
      return result;
    });
    this.writeChain = queued.then(
      () => undefined,
      () => undefined,
    );
    return queued;
  }

  // ---- generic helpers ----

  private async get<K extends keyof FileShape>(
    key: K,
    profileId: string,
  ): Promise<FileShape[K][string] | null> {
    const data = await this.read();
    const collection = data[key] as FileShape[K];
    return (collection[profileId] as FileShape[K][string]) ?? null;
  }

  private async save<K extends keyof FileShape>(
    key: K,
    profileId: string,
    value: FileShape[K][string],
  ): Promise<FileShape[K][string]> {
    return this.mutate<FileShape[K][string]>(async (data) => {
      const collection = { ...data[key], [profileId]: value } as FileShape[K];
      const next = { ...data, [key]: collection } as FileShape;
      return { next, result: value };
    });
  }

  // ---- profile ----
  getProfile(profileId = DEFAULT_PROFILE_ID) {
    return this.get("profile", profileId);
  }
  saveProfile(profile: UserHomesteadProfile) {
    return this.save("profile", profile.id, profile);
  }

  // ---- land ----
  getLand(profileId = DEFAULT_PROFILE_ID) {
    return this.get("land", profileId);
  }
  saveLand(land: LandAssessment) {
    return this.save("land", land.profileId, land);
  }

  // ---- water ----
  getWater(profileId = DEFAULT_PROFILE_ID) {
    return this.get("water", profileId);
  }
  saveWater(water: WaterPlan) {
    return this.save("water", water.profileId, water);
  }

  // ---- solar ----
  getSolar(profileId = DEFAULT_PROFILE_ID) {
    return this.get("solar", profileId);
  }
  saveSolar(solar: SolarPlan) {
    return this.save("solar", solar.profileId, solar);
  }

  // ---- food ----
  getFood(profileId = DEFAULT_PROFILE_ID) {
    return this.get("food", profileId);
  }
  saveFood(food: FoodPlan) {
    return this.save("food", food.profileId, food);
  }

  // ---- waste ----
  getWaste(profileId = DEFAULT_PROFILE_ID) {
    return this.get("waste", profileId);
  }
  saveWaste(waste: WasteSanitationPlan) {
    return this.save("waste", waste.profileId, waste);
  }

  // ---- shelter ----
  getShelter(profileId = DEFAULT_PROFILE_ID) {
    return this.get("shelter", profileId);
  }
  saveShelter(shelter: ShelterPlan) {
    return this.save("shelter", shelter.profileId, shelter);
  }

  // ---- budget ----
  getBudget(profileId = DEFAULT_PROFILE_ID) {
    return this.get("budget", profileId);
  }
  saveBudget(budget: BudgetPlan) {
    return this.save("budget", budget.profileId, budget);
  }

  // ---- skills ----
  getSkills(profileId = DEFAULT_PROFILE_ID) {
    return this.get("skills", profileId);
  }
  saveSkills(skills: SkillsAssessment) {
    return this.save("skills", skills.profileId, skills);
  }

  // ---- report ----
  getReport(profileId = DEFAULT_PROFILE_ID) {
    return this.get("report", profileId);
  }
  saveReport(report: RealityReport) {
    return this.save("report", report.profileId, report);
  }

  // ---- snapshot ----
  async getSnapshot(profileId = DEFAULT_PROFILE_ID): Promise<HomesteadSnapshot> {
    const data = await this.read();
    return {
      profile: data.profile[profileId] ?? null,
      land: data.land[profileId] ?? null,
      water: data.water[profileId] ?? null,
      solar: data.solar[profileId] ?? null,
      food: data.food[profileId] ?? null,
      waste: data.waste[profileId] ?? null,
      shelter: data.shelter[profileId] ?? null,
      budget: data.budget[profileId] ?? null,
      skills: data.skills[profileId] ?? null,
    };
  }
}
