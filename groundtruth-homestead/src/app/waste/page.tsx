"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { CheckboxField, TextAreaField } from "@/components/ui/Field";
import { WarningList } from "@/components/ui/WarningList";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { apiGet, apiPost } from "@/lib/client/api";
import type { WasteInput } from "@/lib/schemas";
import type { WasteSanitationPlan } from "@/lib/types";

const EMPTY: WasteInput = {
  hasSeptic: false,
  septicStatusKnown: false,
  wantsCompostingToilet: false,
  graywaterPlanKnown: false,
  trashDisposalPlan: "",
  animalWastePlan: "",
  legalConcerns: "",
};

export default function WastePage() {
  const [form, setForm] = useState<WasteInput>(EMPTY);
  const [result, setResult] = useState<WasteSanitationPlan | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<WasteSanitationPlan | null>("/api/waste").then((res) => {
      if (res.ok && res.data) {
        const { id: _i, profileId: _p, riskLevel: _r, warnings: _w, ...rest } = res.data;
        void _i; void _p; void _r; void _w;
        setForm(rest);
        setResult(res.data);
      }
      setLoading(false);
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Calculating…");
    const res = await apiPost<WasteSanitationPlan>("/api/waste", form);
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
        title="Waste & Sanitation Planner"
        blurb="Sanitation legality and design is a top-three failure point. Resolve before livestock, before guests, before winter."
      />

      <form onSubmit={onSubmit} className="space-y-6">
        <Card title="System">
          <div className="space-y-1">
            <CheckboxField
              label="Property has a septic system"
              checked={form.hasSeptic}
              onChange={(e) => setForm({ ...form, hasSeptic: e.target.checked })}
            />
            <CheckboxField
              label="Septic condition is known (recent inspection / pump-out)"
              checked={form.septicStatusKnown}
              onChange={(e) =>
                setForm({ ...form, septicStatusKnown: e.target.checked })
              }
            />
            <CheckboxField
              label="Plan to use composting toilet (primary or supplemental)"
              help="Legality varies by county. Confirm in writing before relying on it."
              checked={form.wantsCompostingToilet}
              onChange={(e) =>
                setForm({ ...form, wantsCompostingToilet: e.target.checked })
              }
            />
            <CheckboxField
              label="Graywater plan is defined and legal"
              checked={form.graywaterPlanKnown}
              onChange={(e) =>
                setForm({ ...form, graywaterPlanKnown: e.target.checked })
              }
            />
          </div>
        </Card>

        <Card title="Operations">
          <TextAreaField
            label="Trash disposal plan"
            value={form.trashDisposalPlan}
            onChange={(e) =>
              setForm({ ...form, trashDisposalPlan: e.target.value })
            }
            help="Burning trash is illegal nearly everywhere. Transfer station / haul-out is typical."
          />
          <div className="mt-4">
            <TextAreaField
              label="Animal waste plan"
              value={form.animalWastePlan}
              onChange={(e) =>
                setForm({ ...form, animalWastePlan: e.target.value })
              }
              help="Manure, mortalities, bedding. Watershed and zoning issue, not just smell."
            />
          </div>
          <div className="mt-4">
            <TextAreaField
              label="Legal concerns / open questions"
              value={form.legalConcerns}
              onChange={(e) => setForm({ ...form, legalConcerns: e.target.value })}
            />
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit">Calculate & save</Button>
          {status && <span className="text-sm text-bark-700">{status}</span>}
        </div>
      </form>

      {result && (
        <Card title="Result">
          <RiskBadge level={result.riskLevel} />
          <WarningList warnings={result.warnings} />
        </Card>
      )}
    </div>
  );
}
