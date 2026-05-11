"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { WarningList } from "@/components/ui/WarningList";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { apiGet, apiPost } from "@/lib/client/api";
import type { SkillsInput } from "@/lib/schemas";
import type { SkillsAssessment } from "@/lib/types";

const SKILLS: { key: keyof SkillsInput; label: string; help?: string }[] = [
  { key: "firstAidScore", label: "First aid / wilderness medicine", help: "Critical when help is far away." },
  { key: "carpentryScore", label: "Carpentry / framing / repair" },
  { key: "plumbingScore", label: "Plumbing" },
  { key: "electricalScore", label: "Electrical safety basics", help: "Knowing what to NOT touch is more important than DIY install." },
  { key: "solarScore", label: "Solar / battery system literacy" },
  { key: "gardeningScore", label: "Vegetable gardening" },
  { key: "foodPreservationScore", label: "Food preservation" },
  { key: "smallEngineRepairScore", label: "Small engine repair", help: "Generators, chainsaws, log splitters all break." },
  { key: "animalCareScore", label: "Animal care" },
];

const EMPTY: SkillsInput = {
  gardeningScore: 0,
  carpentryScore: 0,
  plumbingScore: 0,
  electricalScore: 0,
  solarScore: 0,
  animalCareScore: 0,
  foodPreservationScore: 0,
  firstAidScore: 0,
  smallEngineRepairScore: 0,
};

export default function SkillsPage() {
  const [form, setForm] = useState<SkillsInput>(EMPTY);
  const [result, setResult] = useState<SkillsAssessment | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<SkillsAssessment | null>("/api/skills").then((res) => {
      if (res.ok && res.data) {
        const d = res.data;
        setForm({
          gardeningScore: d.gardeningScore,
          carpentryScore: d.carpentryScore,
          plumbingScore: d.plumbingScore,
          electricalScore: d.electricalScore,
          solarScore: d.solarScore,
          animalCareScore: d.animalCareScore,
          foodPreservationScore: d.foodPreservationScore,
          firstAidScore: d.firstAidScore,
          smallEngineRepairScore: d.smallEngineRepairScore,
        });
        setResult(d);
      }
      setLoading(false);
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Calculating…");
    const res = await apiPost<SkillsAssessment>("/api/skills", form);
    if (res.ok) {
      setResult(res.data);
      setStatus("Saved.");
    } else {
      setStatus(`Error: ${res.error}`);
    }
  }

  if (loading) return <p className="text-sm text-bark-700">Loading…</p>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skills Assessment"
        blurb="Rate yourself honestly 0–5. The point is to identify what to learn first, not to grade yourself."
      />

      <form onSubmit={onSubmit} className="space-y-6">
        <Card
          title="Self-rating"
          subtitle="0 = no experience, 3 = competent on basics, 5 = could teach a class."
        >
          <div className="space-y-4">
            {SKILLS.map((s) => (
              <SkillRow
                key={s.key}
                label={s.label}
                help={s.help}
                value={form[s.key]}
                onChange={(v) => setForm({ ...form, [s.key]: v })}
              />
            ))}
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit">Calculate & save</Button>
          {status && <span className="text-sm text-bark-700">{status}</span>}
        </div>
      </form>

      {result && (
        <Card title="Result">
          <ScoreBar label="Overall skill score" score={result.overallSkillScore} />
          <div className="mt-3">
            <RiskBadge level={result.riskLevel} />
          </div>
          {result.prioritySkillsToLearn.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-bark-900 mb-2">
                Learn first
              </h3>
              <ol className="list-decimal pl-5 text-sm text-bark-800 space-y-1">
                {result.prioritySkillsToLearn.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          )}
          <WarningList warnings={result.warnings} />
        </Card>
      )}
    </div>
  );
}

function SkillRow({
  label,
  help,
  value,
  onChange,
}: {
  label: string;
  help?: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-bark-800">{label}</span>
        <span className="text-sm text-bark-700">{value}/5</span>
      </div>
      {help && <p className="text-xs text-bark-700 mb-1">{help}</p>}
      <input
        type="range"
        min={0}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full accent-moss-700"
      />
    </div>
  );
}
