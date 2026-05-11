import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SectionTile } from "@/components/ui/SectionTile";
import { getStore } from "@/lib/storage";
import {
  calculateReadinessScore,
  snapshotToReadinessInput,
} from "@/lib/calculators";
import { LOCAL_VERIFICATION_CHECKLIST } from "@/lib/report/local-verification";
import { AIStatusBanner } from "@/components/ui/AIStatusBanner";
import { getAIProviderStatus } from "@/lib/ai/status";

export const dynamic = "force-dynamic";

const PLANNERS = [
  { href: "/profile", icon: "user", key: "profile", label: "Profile", desc: "Household, location, goals" },
  { href: "/land", icon: "mountain", key: "land", label: "Land", desc: "Access, zoning, terrain" },
  { href: "/water", icon: "droplet", key: "water", label: "Water", desc: "Daily need, reserves, sources" },
  { href: "/solar", icon: "sun", key: "solar", label: "Solar", desc: "Loads, battery, array" },
  { href: "/food", icon: "leaf", key: "food", label: "Food", desc: "Garden, livestock, preservation" },
  { href: "/waste", icon: "recycle", key: "waste", label: "Waste", desc: "Septic, graywater, trash" },
  { href: "/shelter", icon: "tent", key: "shelter", label: "Shelter", desc: "Type, heat, winterization" },
  { href: "/budget", icon: "wallet", key: "budget", label: "Budget", desc: "Phasing, reserves" },
  { href: "/skills", icon: "wrench", key: "skills", label: "Skills", desc: "Self-rating, learning order" },
] as const;

export default async function DashboardPage() {
  const store = getStore();
  const snapshot = await store.getSnapshot();
  const readiness = calculateReadinessScore(snapshotToReadinessInput(snapshot));

  const profile = snapshot.profile;
  const sectionFilled = (key: string): boolean =>
    !!(snapshot as unknown as Record<string, unknown>)[key];

  const filledCount = PLANNERS.filter((p) => sectionFilled(p.key)).length;
  const aiStatus = getAIProviderStatus();

  return (
    <div className="space-y-6">
      <AIStatusBanner status={aiStatus} />

      {/* Hero */}
      <section className="rounded-2xl border border-bark-200 bg-gradient-to-br from-clay-50 via-bark-50 to-moss-50 shadow-sm overflow-hidden">
        <div className="px-6 py-7 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-clay-700 mb-2">
              <Icon name="sparkle" size={14} />
              {profile ? `Welcome back${profile.targetState ? `, eyes on ${profile.targetCounty || ""} ${profile.targetState}`.trimEnd() : ""}` : "Welcome"}
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-bark-900 leading-tight">
              {profile
                ? "Here's where your homestead plan stands today."
                : "Let's build a homestead plan you can actually live with."}
            </h1>
            <p className="mt-2 text-bark-700 max-w-2xl">
              {profile
                ? "Fill in any section to sharpen the readiness score and surface specific risks. The Reality Report assembles everything into one honest snapshot."
                : "Practical calculators for water, power, food, shelter, budget, and skills. No fantasy. Just the questions that keep new homesteaders out of trouble — starting with whether you've got water, sanitation, and a legal way onto the land."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile ? (
                <Link href="/report">
                  <Button>
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="clipboard" size={16} />
                      View Reality Report
                    </span>
                  </Button>
                </Link>
              ) : (
                <Link href="/profile">
                  <Button>
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="user" size={16} />
                      Start with the profile
                    </span>
                  </Button>
                </Link>
              )}
              {profile && (
                <Link href="/profile">
                  <Button variant="secondary">Edit profile</Button>
                </Link>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center">
            <ScoreRing score={readiness.overall} />
            <div className="mt-2 text-xs text-bark-700">
              {filledCount} of {PLANNERS.length} planner sections complete
            </div>
          </div>
        </div>
      </section>

      {/* Category scores + top risks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Category readiness" subtitle="Each category is scored from its own planner risk level.">
          <div className="space-y-2.5">
            <ScoreBar label="Water" score={readiness.categories.water} />
            <ScoreBar label="Power" score={readiness.categories.power} />
            <ScoreBar label="Shelter" score={readiness.categories.shelter} />
            <ScoreBar label="Land" score={readiness.categories.land} />
            <ScoreBar label="Budget" score={readiness.categories.budget} />
            <ScoreBar label="Food" score={readiness.categories.food} />
            <ScoreBar label="Skills" score={readiness.categories.skills} />
          </div>
        </Card>

        <Card title="Top risks" subtitle="Highest-impact issues surfaced by the calculators." tone="accent">
          {readiness.topRisks.length === 0 ? (
            <div className="text-sm text-bark-700">
              <p className="mb-2">
                Nothing surfaced yet. Fill in a few planner sections — start
                with <Link href="/water" className="text-moss-700 underline">water</Link>{" "}
                or <Link href="/land" className="text-moss-700 underline">land</Link> —
                and risks will appear here.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {readiness.topRisks.slice(0, 3).map((risk, i) => (
                <li
                  key={i}
                  className="text-sm text-bark-900 bg-white/80 border border-clay-200 rounded-md px-3 py-2 flex gap-2"
                >
                  <span className="text-clay-700 mt-0.5 shrink-0">
                    <Icon name="sparkle" size={14} />
                  </span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Planner section grid */}
      <Card
        title="Planner sections"
        subtitle="Click any section to fill in or update. Done sections show in green."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PLANNERS.map((p) => (
            <SectionTile
              key={p.href}
              href={p.href}
              icon={p.icon}
              label={p.label}
              description={p.desc}
              complete={sectionFilled(p.key)}
            />
          ))}
        </div>
      </Card>

      {/* Profile recap (only if profile exists) */}
      {profile && (
        <Card title="Your plan in one glance" tone="good">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <Stat label="Household" value={`${profile.householdSize}`} />
            <Stat label="Target" value={`${profile.targetCounty || "—"}, ${profile.targetState || "—"}`} />
            <Stat label="Off-grid level" value={profile.desiredOffGridLevel} />
            <Stat label="Timeline" value={`${profile.targetTimelineMonths} mo`} />
            <Stat label="Budget" value={`$${profile.estimatedBudget.toLocaleString()}`} />
            <Stat label="Experience" value={profile.experienceLevel.replace(/_/g, " ")} />
            <Stat
              label="Land status"
              value={profile.landStatus.replace(/_/g, " ")}
            />
            <Stat label="Sections done" value={`${filledCount}/${PLANNERS.length}`} />
          </dl>
        </Card>
      )}

      {/* Local verification */}
      <Card
        title="Before you commit money: verify locally"
        subtitle="Nothing in this app substitutes for confirming these directly with local authorities."
      >
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {LOCAL_VERIFICATION_CHECKLIST.map((item) => (
            <li key={item.item} className="border-l-2 border-clay-300 pl-3">
              <div className="font-medium text-bark-900">{item.item}</div>
              <div className="text-xs text-bark-700">{item.detail}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/70 border border-moss-100 px-3 py-2">
      <div className="text-[10px] font-medium uppercase tracking-wide text-moss-700">
        {label}
      </div>
      <div className="text-sm font-semibold text-bark-900 mt-0.5 truncate" title={value}>
        {value}
      </div>
    </div>
  );
}
