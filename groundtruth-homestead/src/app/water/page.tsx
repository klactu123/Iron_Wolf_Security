"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { CheckboxField, NumberField } from "@/components/ui/Field";
import { WarningList } from "@/components/ui/WarningList";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { apiGet, apiPost } from "@/lib/client/api";
import type { WaterInput } from "@/lib/schemas";
import type { WaterPlan } from "@/lib/types";

const EMPTY: WaterInput = {
  peopleCount: 2,
  gallonsPerPersonPerDay: 35,
  reserveDays: 14,
  livestockWaterGallonsPerDay: 0,
  gardenWaterGallonsPerDay: 0,
  hasWell: false,
  hasRainCatchment: false,
  hasPond: false,
  hasSpring: false,
  filtrationNeeded: true,
  freezeProtectionNeeded: false,
};

export default function WaterPage() {
  const [form, setForm] = useState<WaterInput>(EMPTY);
  const [result, setResult] = useState<WaterPlan | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<WaterPlan | null>("/api/water").then((res) => {
      if (res.ok && res.data) {
        const { id: _i, profileId: _p, ...rest } = res.data;
        void _i; void _p;
        setForm({
          peopleCount: rest.peopleCount,
          gallonsPerPersonPerDay: rest.gallonsPerPersonPerDay,
          reserveDays: rest.reserveDays,
          livestockWaterGallonsPerDay: rest.livestockWaterGallonsPerDay,
          gardenWaterGallonsPerDay: rest.gardenWaterGallonsPerDay,
          hasWell: rest.hasWell,
          hasRainCatchment: rest.hasRainCatchment,
          hasPond: rest.hasPond,
          hasSpring: rest.hasSpring,
          filtrationNeeded: rest.filtrationNeeded,
          freezeProtectionNeeded: rest.freezeProtectionNeeded,
        });
        setResult(res.data);
      }
      setLoading(false);
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Calculating…");
    const res = await apiPost<WaterPlan>("/api/water", form);
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
        title="Water Planner"
        blurb="The single most important system. Daily need, reserve, sources, filtration. Get this wrong and nothing else matters."
      />

      <form onSubmit={onSubmit} className="space-y-6">
        <Card title="Daily demand">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <NumberField
              label="People in household"
              value={form.peopleCount}
              min={1}
              onChange={(e) => setForm({ ...form, peopleCount: +e.target.value })}
            />
            <NumberField
              label="Gallons / person / day"
              value={form.gallonsPerPersonPerDay}
              min={1}
              max={200}
              onChange={(e) =>
                setForm({ ...form, gallonsPerPersonPerDay: +e.target.value })
              }
              help="Off-grid households commonly target 30–50 gal/person/day."
            />
            <NumberField
              label="Reserve days"
              value={form.reserveDays}
              min={0}
              max={365}
              onChange={(e) => setForm({ ...form, reserveDays: +e.target.value })}
              help="Stored water = daily total × reserve days."
            />
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NumberField
              label="Livestock water (gal/day)"
              value={form.livestockWaterGallonsPerDay}
              min={0}
              onChange={(e) =>
                setForm({ ...form, livestockWaterGallonsPerDay: +e.target.value })
              }
            />
            <NumberField
              label="Garden water (gal/day, season avg)"
              value={form.gardenWaterGallonsPerDay}
              min={0}
              onChange={(e) =>
                setForm({ ...form, gardenWaterGallonsPerDay: +e.target.value })
              }
            />
          </div>
        </Card>

        <Card title="Sources & treatment">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            <CheckboxField
              label="Well"
              checked={form.hasWell}
              onChange={(e) => setForm({ ...form, hasWell: e.target.checked })}
            />
            <CheckboxField
              label="Rain catchment"
              checked={form.hasRainCatchment}
              onChange={(e) =>
                setForm({ ...form, hasRainCatchment: e.target.checked })
              }
            />
            <CheckboxField
              label="Pond / surface water"
              checked={form.hasPond}
              onChange={(e) => setForm({ ...form, hasPond: e.target.checked })}
            />
            <CheckboxField
              label="Spring"
              checked={form.hasSpring}
              onChange={(e) => setForm({ ...form, hasSpring: e.target.checked })}
            />
            <CheckboxField
              label="Filtration / treatment needed"
              help="Recommended for all surface water and most rainwater."
              checked={form.filtrationNeeded}
              onChange={(e) =>
                setForm({ ...form, filtrationNeeded: e.target.checked })
              }
            />
            <CheckboxField
              label="Freeze protection needed"
              checked={form.freezeProtectionNeeded}
              onChange={(e) =>
                setForm({ ...form, freezeProtectionNeeded: e.target.checked })
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
        <Card
          title="Result"
          subtitle="Calculated from your inputs. Math is deterministic; warnings are rule-based."
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Stat label="Household daily" value={`${result.householdDailyGallons.toLocaleString()} gal`} />
            <Stat label="Total daily" value={`${result.totalDailyGallons.toLocaleString()} gal`} />
            <Stat label="Recommended cistern" value={`${result.recommendedCisternGallons.toLocaleString()} gal`} />
          </div>
          <div className="mt-4">
            <RiskBadge level={result.riskLevel} />
          </div>
          <WarningList warnings={result.warnings} />
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-bark-200 p-3 bg-bark-50">
      <div className="text-xs text-bark-700">{label}</div>
      <div className="text-lg font-semibold text-bark-900">{value}</div>
    </div>
  );
}
