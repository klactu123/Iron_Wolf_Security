import { getStore } from "@/lib/storage";
import { ok } from "@/lib/api/response";
import { generateRealityReport } from "@/lib/report/generator";
import { calculateReadinessScore, snapshotToReadinessInput } from "@/lib/calculators";
import { getAIService } from "@/lib/ai";

export const runtime = "nodejs";

export async function GET() {
  const existing = await getStore().getReport();
  return ok(existing);
}

export async function POST() {
  const store = getStore();
  const snapshot = await store.getSnapshot();
  const readiness = calculateReadinessScore(snapshotToReadinessInput(snapshot));

  let aiSummary: string | undefined;
  try {
    aiSummary = await getAIService().generateRealityReport({
      snapshot,
      readiness,
    });
  } catch (err) {
    console.warn("[report] AI summary failed, falling back to deterministic summary", err);
  }

  const report = generateRealityReport({ snapshot, aiSummary });
  const saved = await store.saveReport(report);
  return ok(saved);
}
