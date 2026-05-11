import type { NextRequest } from "next/server";
import { profileInputSchema } from "@/lib/schemas";
import { getStore, DEFAULT_PROFILE_ID } from "@/lib/storage";
import { ok, fail, parseJsonBody } from "@/lib/api/response";
import { nowIso } from "@/lib/api/ids";
import type { UserHomesteadProfile } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const profile = await getStore().getProfile();
  return ok(profile);
}

export async function POST(req: NextRequest) {
  const parsed = await parseJsonBody(req, profileInputSchema);
  if (!parsed.ok) return parsed.response;

  const existing = await getStore().getProfile();
  const now = nowIso();

  const profile: UserHomesteadProfile = {
    id: existing?.id ?? DEFAULT_PROFILE_ID,
    userId: existing?.userId,
    ...parsed.data,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  if (profile.adults + profile.children !== profile.householdSize) {
    return fail(
      "householdSize must equal adults + children",
      422,
    );
  }

  const saved = await getStore().saveProfile(profile);
  return ok(saved);
}
