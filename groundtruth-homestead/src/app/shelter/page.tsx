"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { CheckboxField, SelectField, TextAreaField } from "@/components/ui/Field";
import { WarningList } from "@/components/ui/WarningList";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { apiGet, apiPost } from "@/lib/client/api";
import type { ShelterInput } from "@/lib/schemas";
import type { ShelterPlan } from "@/lib/types";

const EMPTY: ShelterInput = {
  shelterType: "to_be_built",
  existingShelter: false,
  primaryHeatSource: "wood",
  backupHeatSource: "propane",
  coolingPlan: "",
  winterizationNeeded: true,
};

const SHELTER_TYPES = [
  { value: "existing_house", label: "Existing house" },
  { value: "cabin", label: "Cabin" },
  { value: "tiny_house", label: "Tiny house" },
  { value: "rv", label: "RV / trailer" },
  { value: "yurt", label: "Yurt / dome" },
  { value: "to_be_built", label: "To be built" },
  { value: "other", label: "Other" },
];

const HEAT_SOURCES = [
  { value: "wood", label: "Wood" },
  { value: "propane", label: "Propane" },
  { value: "electric", label: "Electric" },
  { value: "solar", label: "Solar (passive / radiant)" },
  { value: "none", label: "None" },
  { value: "other", label: "Other" },
];

export default function ShelterPage() {
  const [form, setForm] = useState<ShelterInput>(EMPTY);
  const [result, setResult] = useState<ShelterPlan | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<ShelterPlan | null>("/api/shelter").then((res) => {
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
    const res = await apiPost<ShelterPlan>("/api/shelter", form);
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
        title="Shelter & Heating Planner"
        blurb="Surviving the first winter is the goal. Heat redundancy, insulation, and a real interim plan if you're building."
      />

      <form onSubmit={onSubmit} className="space-y-6">
        <Card title="Shelter">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Shelter type"
              value={form.shelterType}
              onChange={(e) =>
                setForm({ ...form, shelterType: e.target.value as ShelterInput["shelterType"] })
              }
              options={SHELTER_TYPES}
            />
            <CheckboxField
              label="There is an existing habitable shelter on site"
              checked={form.existingShelter}
              onChange={(e) =>
                setForm({ ...form, existingShelter: e.target.checked })
              }
            />
          </div>
        </Card>

        <Card title="Heat & winterization">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Primary heat source"
              value={form.primaryHeatSource}
              onChange={(e) =>
                setForm({
                  ...form,
                  primaryHeatSource: e.target.value as ShelterInput["primaryHeatSource"],
                })
              }
              options={HEAT_SOURCES}
            />
            <SelectField
              label="Backup heat source"
              value={form.backupHeatSource}
              onChange={(e) =>
                setForm({
                  ...form,
                  backupHeatSource: e.target.value as ShelterInput["backupHeatSource"],
                })
              }
              options={HEAT_SOURCES}
            />
          </div>
          <div className="mt-4">
            <TextAreaField
              label="Cooling plan"
              value={form.coolingPlan}
              onChange={(e) =>
                setForm({ ...form, coolingPlan: e.target.value })
              }
              help="Shade, ventilation, mini-split, swamp cooler, root cellar — whatever applies."
            />
          </div>
          <div className="mt-2">
            <CheckboxField
              label="Winterization work is needed (insulation, pipe protection, skirting)"
              checked={form.winterizationNeeded}
              onChange={(e) =>
                setForm({ ...form, winterizationNeeded: e.target.checked })
              }
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
