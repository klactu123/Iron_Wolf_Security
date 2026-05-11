import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { PageHeader } from "@/components/ui/PageHeader";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { RegenerateButton } from "./RegenerateButton";
import { getStore } from "@/lib/storage";
import {
  calculateReadinessScore,
  snapshotToReadinessInput,
} from "@/lib/calculators";
import { generateRealityReport } from "@/lib/report/generator";
import { LOCAL_VERIFICATION_CHECKLIST } from "@/lib/report/local-verification";
import { getAIService } from "@/lib/ai";
import { getAIProviderStatus } from "@/lib/ai/status";
import { AIStatusBanner } from "@/components/ui/AIStatusBanner";
import type { RealityReport } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ReportPage() {
  const store = getStore();
  const snapshot = await store.getSnapshot();
  const readiness = calculateReadinessScore(snapshotToReadinessInput(snapshot));

  // If no report has been saved yet, generate one on-the-fly so the page is
  // useful immediately. Hitting "Regenerate" persists a fresh copy.
  const saved = await store.getReport();
  let report: RealityReport;
  if (saved) {
    report = saved;
  } else {
    let aiSummary: string | undefined;
    try {
      aiSummary = await getAIService().generateRealityReport({ snapshot, readiness });
    } catch {
      // mock or stub failure — fall back to deterministic summary inside the generator
    }
    report = generateRealityReport({ snapshot, aiSummary });
  }

  const aiStatus = getAIProviderStatus();

  return (
    <div className="space-y-6">
      <AIStatusBanner status={aiStatus} />
      <PageHeader
        title="Reality Report"
        blurb="Built from your saved planner data. Math comes from deterministic calculators; the summary is the AI service's interpretation of those numbers."
      >
        <RegenerateButton />
      </PageHeader>

      <Section number={1} title="Current Situation">
        {snapshot.profile ? (
          <p className="text-sm text-bark-800">
            Household of {snapshot.profile.householdSize} ({snapshot.profile.adults} adult
            {snapshot.profile.adults === 1 ? "" : "s"}, {snapshot.profile.children} child
            {snapshot.profile.children === 1 ? "" : "ren"}). Currently:{" "}
            {snapshot.profile.currentLivingSituation || "—"}. Targeting{" "}
            {snapshot.profile.targetCounty || "—"}, {snapshot.profile.targetState || "—"}.
            Land status: <em>{snapshot.profile.landStatus.replace(/_/g, " ")}</em>.
            Experience: <em>{snapshot.profile.experienceLevel.replace(/_/g, " ")}</em>.
          </p>
        ) : (
          <NoData href="/profile" label="profile" />
        )}
      </Section>

      <Section number={2} title="Homestead Goal">
        {snapshot.profile ? (
          <div className="text-sm text-bark-800 space-y-2">
            <p>
              Off-grid level target: <strong>{snapshot.profile.desiredOffGridLevel}</strong>.
              Timeline: <strong>{snapshot.profile.targetTimelineMonths} months</strong>.
              Estimated budget: <strong>${snapshot.profile.estimatedBudget.toLocaleString()}</strong>.
            </p>
            {snapshot.profile.primaryGoals.length > 0 && (
              <ul className="list-disc pl-5">
                {snapshot.profile.primaryGoals.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <NoData href="/profile" label="profile" />
        )}
      </Section>

      <Section number={3} title="Overall Readiness Score">
        <div className="flex items-baseline gap-3">
          <div className="text-4xl font-semibold text-moss-900">
            {report.overallReadinessScore}
            <span className="text-base text-bark-700">/100</span>
          </div>
        </div>
        <p className="text-sm text-bark-800 mt-3">{report.generatedSummary}</p>
      </Section>

      <Section number={4} title="Category Scores">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ScoreBar label="Water" score={report.waterReadinessScore} />
          <ScoreBar label="Power" score={report.powerReadinessScore} />
          <ScoreBar label="Food" score={report.foodReadinessScore} />
          <ScoreBar label="Shelter" score={report.shelterReadinessScore} />
          <ScoreBar label="Budget" score={report.budgetReadinessScore} />
          <ScoreBar label="Skills" score={report.skillsReadinessScore} />
          <ScoreBar label="Land" score={report.landReadinessScore} />
        </div>
      </Section>

      <Section number={5} title="Top Risks">
        {report.topRisks.length === 0 ? (
          <p className="text-sm text-bark-700">
            No specific risks surfaced yet — fill in more planner sections.
          </p>
        ) : (
          <ul className="space-y-2">
            {report.topRisks.map((r, i) => (
              <li
                key={i}
                className="text-sm text-bark-900 bg-amber-50 border border-amber-200 rounded-md px-3 py-2"
              >
                {r}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section number={6} title="Water Plan">
        {snapshot.water ? (
          <PlanSummary
            stats={[
              ["Daily total", `${snapshot.water.totalDailyGallons.toLocaleString()} gal`],
              ["Cistern", `${snapshot.water.recommendedCisternGallons.toLocaleString()} gal`],
              ["Reserve", `${snapshot.water.reserveDays} days`],
            ]}
            risk={snapshot.water.riskLevel}
            warnings={snapshot.water.warnings}
          />
        ) : (
          <NoData href="/water" label="water plan" />
        )}
      </Section>

      <Section number={7} title="Power Plan">
        {snapshot.solar ? (
          <PlanSummary
            stats={[
              ["Daily kWh", `${snapshot.solar.dailyKwhEstimate}`],
              ["Battery", `${snapshot.solar.recommendedBatteryKwh} kWh`],
              ["Array", `${snapshot.solar.recommendedSolarKw} kW`],
              ["Generator", snapshot.solar.generatorRecommended ? "Recommended" : "Optional"],
            ]}
            risk={snapshot.solar.riskLevel}
            warnings={snapshot.solar.warnings}
          />
        ) : (
          <NoData href="/solar" label="solar plan" />
        )}
      </Section>

      <Section number={8} title="Food Plan">
        {snapshot.food ? (
          <PlanSummary
            stats={[
              ["Garden", `${snapshot.food.gardenSquareFeet} sq ft`],
              ["Beds", `${snapshot.food.raisedBedsCount}`],
              ["Chickens", snapshot.food.wantsChickens ? "Yes" : "No"],
              ["Livestock", snapshot.food.wantsLivestock ? snapshot.food.livestockTypes.join(", ") || "Yes" : "No"],
            ]}
            risk={snapshot.food.riskLevel}
            warnings={snapshot.food.warnings}
          />
        ) : (
          <NoData href="/food" label="food plan" />
        )}
      </Section>

      <Section number={9} title="Waste & Sanitation Plan">
        {snapshot.waste ? (
          <PlanSummary
            stats={[
              ["Septic", snapshot.waste.hasSeptic ? "Yes" : "No"],
              ["Status known", snapshot.waste.septicStatusKnown ? "Yes" : "No"],
              ["Composting", snapshot.waste.wantsCompostingToilet ? "Yes" : "No"],
              ["Graywater plan", snapshot.waste.graywaterPlanKnown ? "Yes" : "No"],
            ]}
            risk={snapshot.waste.riskLevel}
            warnings={snapshot.waste.warnings}
          />
        ) : (
          <NoData href="/waste" label="waste & sanitation plan" />
        )}
      </Section>

      <Section number={10} title="Shelter & Heating Plan">
        {snapshot.shelter ? (
          <PlanSummary
            stats={[
              ["Type", snapshot.shelter.shelterType.replace(/_/g, " ")],
              ["Existing", snapshot.shelter.existingShelter ? "Yes" : "No"],
              ["Primary heat", snapshot.shelter.primaryHeatSource],
              ["Backup heat", snapshot.shelter.backupHeatSource],
            ]}
            risk={snapshot.shelter.riskLevel}
            warnings={snapshot.shelter.warnings}
          />
        ) : (
          <NoData href="/shelter" label="shelter plan" />
        )}
      </Section>

      <Section number={11} title="Budget Reality Check">
        {snapshot.budget ? (
          <PlanSummary
            stats={[
              ["Total", `$${snapshot.budget.totalBudget.toLocaleString()}`],
              ["Reserve", `$${snapshot.budget.emergencyReserve.toLocaleString()}`],
              ["Phase 1", `$${snapshot.budget.phaseOneEstimate.toLocaleString()}`],
              ["Phase 2", `$${snapshot.budget.phaseTwoEstimate.toLocaleString()}`],
              ["Phase 3", `$${snapshot.budget.phaseThreeEstimate.toLocaleString()}`],
              ["Phase 4", `$${snapshot.budget.phaseFourEstimate.toLocaleString()}`],
            ]}
            risk={snapshot.budget.riskLevel}
            warnings={snapshot.budget.warnings}
          />
        ) : (
          <NoData href="/budget" label="budget" />
        )}
      </Section>

      <Section number={12} title="Skills Gap">
        {snapshot.skills ? (
          <div className="space-y-3">
            <ScoreBar label="Overall skill" score={snapshot.skills.overallSkillScore} />
            <RiskBadge level={snapshot.skills.riskLevel} />
            {snapshot.skills.prioritySkillsToLearn.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-bark-900 mb-1">
                  Priority skills to learn
                </h3>
                <ol className="list-decimal pl-5 text-sm text-bark-800">
                  {snapshot.skills.prioritySkillsToLearn.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </div>
            )}
            {snapshot.skills.warnings.length > 0 && (
              <ul className="space-y-2 mt-3">
                {snapshot.skills.warnings.map((w, i) => (
                  <li
                    key={i}
                    className="text-sm text-bark-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2"
                  >
                    {w}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <NoData href="/skills" label="skills assessment" />
        )}
      </Section>

      <Section number={13} title="Recommended Build Order">
        <PhaseList n={1} title="Phase 1 — Stay alive, stay legal" items={report.recommendedBuildOrder.phaseOne} />
        <PhaseList n={2} title="Phase 2 — Stabilize and grow" items={report.recommendedBuildOrder.phaseTwo} />
        <PhaseList n={3} title="Phase 3 — Expand carefully" items={report.recommendedBuildOrder.phaseThree} />
        <PhaseList n={4} title="Phase 4 — Resilience and redundancy" items={report.recommendedBuildOrder.phaseFour} />
      </Section>

      <Section number={14} title="12-Month Action Plan">
        <ol className="space-y-2">
          {report.twelveMonthActionPlan.map((m, i) => (
            <li
              key={i}
              className="text-sm text-bark-800 border-l-2 border-moss-300 pl-3"
            >
              {m}
            </li>
          ))}
        </ol>
      </Section>

      <Section number={15} title="Local Verification Checklist">
        <p className="text-sm text-bark-700 mb-3">
          Nothing in this app substitutes for confirming these directly with local authorities.
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {LOCAL_VERIFICATION_CHECKLIST.map((item) => (
            <li key={item.item} className="border-l-2 border-moss-300 pl-3">
              <div className="font-medium text-bark-900">{item.item}</div>
              <div className="text-xs text-bark-700">{item.detail}</div>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card title={`${number}. ${title}`}>{children}</Card>
  );
}

function NoData({ href, label }: { href: Parameters<typeof Link>[0]["href"]; label: string }) {
  return (
    <p className="text-sm text-bark-700">
      No {label} saved yet.{" "}
      <Link href={href} className="text-moss-700 underline">
        Fill it in
      </Link>{" "}
      to populate this section.
    </p>
  );
}

function PlanSummary({
  stats,
  risk,
  warnings,
}: {
  stats: [string, string][];
  risk: "low" | "medium" | "high" | "critical";
  warnings: string[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {stats.map(([k, v]) => (
          <div
            key={k}
            className="rounded-md border border-bark-200 bg-bark-50 px-3 py-2"
          >
            <div className="text-xs text-bark-700">{k}</div>
            <div className="text-sm font-semibold text-bark-900">{v}</div>
          </div>
        ))}
      </div>
      <RiskBadge level={risk} />
      {warnings.length > 0 && (
        <ul className="space-y-2">
          {warnings.map((w, i) => (
            <li
              key={i}
              className="text-sm text-bark-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2"
            >
              {w}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PhaseList({
  n,
  title,
  items,
}: {
  n: number;
  title: string;
  items: string[];
}) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-bark-900 mb-2">
        {title}
      </h3>
      <ol className="list-decimal pl-5 text-sm text-bark-800 space-y-1">
        {items.map((it, i) => (
          <li key={`${n}-${i}`}>{it}</li>
        ))}
      </ol>
    </div>
  );
}
