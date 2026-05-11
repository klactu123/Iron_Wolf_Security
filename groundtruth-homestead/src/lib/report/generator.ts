import {
  calculateReadinessScore,
  generateBuildPhases,
  generateTwelveMonthActionPlan,
  snapshotToReadinessInput,
} from "@/lib/calculators";
import type {
  HomesteadSnapshot,
  RealityReport,
} from "@/lib/types";
import { generateId, nowIso } from "@/lib/api/ids";

export interface GenerateReportArgs {
  snapshot: HomesteadSnapshot;
  /** Optional AI-authored summary. Calculator math is never delegated. */
  aiSummary?: string;
}

export function generateRealityReport({
  snapshot,
  aiSummary,
}: GenerateReportArgs): RealityReport {
  const profileId = snapshot.profile?.id ?? "default";

  const readiness = calculateReadinessScore(snapshotToReadinessInput(snapshot));
  const buildOrder = generateBuildPhases(snapshot);
  const actionPlan = generateTwelveMonthActionPlan(snapshot);

  const summary = aiSummary && aiSummary.trim().length > 0
    ? aiSummary
    : buildDefaultSummary(snapshot, readiness.overall);

  return {
    id: generateId("report"),
    profileId,
    overallReadinessScore: readiness.overall,
    waterReadinessScore: readiness.categories.water,
    powerReadinessScore: readiness.categories.power,
    foodReadinessScore: readiness.categories.food,
    shelterReadinessScore: readiness.categories.shelter,
    budgetReadinessScore: readiness.categories.budget,
    skillsReadinessScore: readiness.categories.skills,
    landReadinessScore: readiness.categories.land,
    topRisks: readiness.topRisks,
    recommendedBuildOrder: buildOrder,
    twelveMonthActionPlan: actionPlan,
    generatedSummary: summary,
    createdAt: nowIso(),
  };
}

function buildDefaultSummary(
  snap: HomesteadSnapshot,
  overall: number,
): string {
  const stage =
    overall >= 75
      ? "Solid foundation. Focus on closing remaining gaps and building redundancy."
      : overall >= 50
        ? "Workable starting point. The plan needs hardening on the lowest-scoring categories before commitments are made."
        : overall >= 25
          ? "Significant gaps. Treat the next 6–12 months as research and de-risking, not building."
          : "Very early. The biggest wins right now come from answering basic questions (legal access, water, sanitation) before any construction.";

  const lacks: string[] = [];
  if (!snap.land) lacks.push("land assessment");
  if (!snap.water) lacks.push("water plan");
  if (!snap.solar) lacks.push("solar plan");
  if (!snap.shelter) lacks.push("shelter plan");
  if (!snap.budget) lacks.push("budget");
  if (!snap.skills) lacks.push("skills assessment");

  const missingLine =
    lacks.length === 0
      ? ""
      : ` Missing inputs that will sharpen this report: ${lacks.join(", ")}.`;

  return `${stage}${missingLine} This summary is a planning aid, not professional advice — confirm zoning, permits, and engineering decisions with local authorities and licensed pros before acting.`;
}
