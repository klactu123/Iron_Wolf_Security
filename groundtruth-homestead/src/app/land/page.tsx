"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import {
  CheckboxField,
  NumberField,
  SelectField,
  TextAreaField,
} from "@/components/ui/Field";
import { apiGet, apiPost } from "@/lib/client/api";
import type { LandInput } from "@/lib/schemas";
import type { LandAssessment } from "@/lib/types";

const EMPTY: LandInput = {
  acreage: 0,
  roadAccess: "gravel",
  legalAccess: false,
  zoningKnown: false,
  hoaRestrictions: false,
  terrainType: "rolling",
  woodedPercentage: 0,
  clearedPercentage: 0,
  soilKnown: false,
  hasExistingStructures: false,
  hasExistingPower: false,
  hasExistingWaterSource: false,
  hasSeptic: false,
  distanceToTownMiles: 0,
  distanceToHospitalMiles: 0,
  notes: "",
};

export default function LandPage() {
  const [form, setForm] = useState<LandInput>(EMPTY);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<LandAssessment | null>("/api/land").then((res) => {
      if (res.ok && res.data) {
        const { id: _i, profileId: _p, ...rest } = res.data;
        void _i; void _p;
        setForm(rest);
      }
      setLoading(false);
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Saving…");
    const res = await apiPost<LandAssessment>("/api/land", form);
    setStatus(res.ok ? "Saved." : `Error: ${res.error}`);
  }

  if (loading) return <p className="text-sm text-bark-700">Loading…</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <PageHeader
        title="Land Assessment"
        blurb="Honest answers here are worth more than optimistic ones. Legal access, zoning, and water are the make-or-break inputs."
      />
      <Card title="Property basics">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NumberField
            label="Acreage"
            value={form.acreage}
            step={0.1}
            min={0}
            onChange={(e) => setForm({ ...form, acreage: +e.target.value })}
          />
          <SelectField
            label="Road access"
            value={form.roadAccess}
            onChange={(e) =>
              setForm({ ...form, roadAccess: e.target.value as LandInput["roadAccess"] })
            }
            options={[
              { value: "paved", label: "Paved" },
              { value: "gravel", label: "Gravel" },
              { value: "dirt", label: "Dirt" },
              { value: "seasonal", label: "Seasonal (impassable in winter)" },
              { value: "none", label: "None / cross other property" },
            ]}
          />
          <SelectField
            label="Terrain"
            value={form.terrainType}
            onChange={(e) =>
              setForm({ ...form, terrainType: e.target.value as LandInput["terrainType"] })
            }
            options={[
              { value: "flat", label: "Flat" },
              { value: "rolling", label: "Rolling" },
              { value: "hilly", label: "Hilly" },
              { value: "steep", label: "Steep" },
              { value: "mixed", label: "Mixed" },
            ]}
          />
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberField
            label="% wooded"
            value={form.woodedPercentage}
            min={0}
            max={100}
            onChange={(e) => setForm({ ...form, woodedPercentage: +e.target.value })}
          />
          <NumberField
            label="% cleared"
            value={form.clearedPercentage}
            min={0}
            max={100}
            onChange={(e) => setForm({ ...form, clearedPercentage: +e.target.value })}
          />
        </div>
      </Card>

      <Card title="Legal & permitting">
        <div className="space-y-1">
          <CheckboxField
            label="Legal access (recorded easement, deeded frontage, or owned road)"
            help="The most expensive mistake people make is assuming access. Confirm in writing."
            checked={form.legalAccess}
            onChange={(e) => setForm({ ...form, legalAccess: e.target.checked })}
          />
          <CheckboxField
            label="I know the zoning and permitted uses for this parcel"
            checked={form.zoningKnown}
            onChange={(e) => setForm({ ...form, zoningKnown: e.target.checked })}
          />
          <CheckboxField
            label="HOA / covenants apply to this property"
            checked={form.hoaRestrictions}
            onChange={(e) => setForm({ ...form, hoaRestrictions: e.target.checked })}
          />
          <CheckboxField
            label="Soil type and drainage are known (perc test, soil survey)"
            checked={form.soilKnown}
            onChange={(e) => setForm({ ...form, soilKnown: e.target.checked })}
          />
        </div>
      </Card>

      <Card title="Existing infrastructure">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          <CheckboxField
            label="Existing structures (house, barn, shed)"
            checked={form.hasExistingStructures}
            onChange={(e) => setForm({ ...form, hasExistingStructures: e.target.checked })}
          />
          <CheckboxField
            label="Existing grid power"
            checked={form.hasExistingPower}
            onChange={(e) => setForm({ ...form, hasExistingPower: e.target.checked })}
          />
          <CheckboxField
            label="Existing water source (well, spring, tap)"
            checked={form.hasExistingWaterSource}
            onChange={(e) => setForm({ ...form, hasExistingWaterSource: e.target.checked })}
          />
          <CheckboxField
            label="Existing septic system"
            checked={form.hasSeptic}
            onChange={(e) => setForm({ ...form, hasSeptic: e.target.checked })}
          />
        </div>
      </Card>

      <Card title="Distance to services">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NumberField
            label="Miles to town (groceries, hardware)"
            value={form.distanceToTownMiles}
            min={0}
            onChange={(e) =>
              setForm({ ...form, distanceToTownMiles: +e.target.value })
            }
          />
          <NumberField
            label="Miles to nearest hospital"
            value={form.distanceToHospitalMiles}
            min={0}
            onChange={(e) =>
              setForm({ ...form, distanceToHospitalMiles: +e.target.value })
            }
            help="Drives medical-skill priority and emergency planning."
          />
        </div>
        <div className="mt-4">
          <TextAreaField
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            help="Flood zone, wildfire history, prevailing wind, anything that bites later."
          />
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit">Save land assessment</Button>
        {status && <span className="text-sm text-bark-700">{status}</span>}
      </div>
    </form>
  );
}
