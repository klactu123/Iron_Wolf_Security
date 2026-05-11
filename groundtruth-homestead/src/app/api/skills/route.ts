import type { NextRequest } from "next/server";
import { skillsInputSchema } from "@/lib/schemas";
import { getStore, DEFAULT_PROFILE_ID } from "@/lib/storage";
import { ok, parseJsonBody } from "@/lib/api/response";
import { generateId } from "@/lib/api/ids";
import { calculateSkillsAssessment } from "@/lib/calculators";
import type { SkillsAssessment } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const skills = await getStore().getSkills();
  return ok(skills);
}

export async function POST(req: NextRequest) {
  const parsed = await parseJsonBody(req, skillsInputSchema);
  if (!parsed.ok) return parsed.response;

  const calc = calculateSkillsAssessment(parsed.data);
  const existing = await getStore().getSkills();

  const skills: SkillsAssessment = {
    id: existing?.id ?? generateId("skills"),
    profileId: DEFAULT_PROFILE_ID,
    ...parsed.data,
    ...calc,
  };
  const saved = await getStore().saveSkills(skills);
  return ok(saved);
}
