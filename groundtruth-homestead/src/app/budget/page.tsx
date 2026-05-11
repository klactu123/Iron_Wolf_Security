"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { NumberField } from "@/components/ui/Field";
import { WarningList } from "@/components/ui/WarningList";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { apiGet, apiPost } from "@/lib/client/api";
import type { BudgetInput } from "@/lib/schemas";
import type { BudgetPlan } from "@/lib/types";

const EMPTY: BudgetInput = {
  totalBudget: 0,
  landBudget: 0,
  waterBudget: 0,
  powerBudget: 0,
  shelterBudget: 0,
  foodBudget: 0,
  toolsBudget: 0,
  emergencyReserve: 0,
};

export default function BudgetPage() {
  const [form, setForm] = useState<BudgetInput>(EMPTY);
  const [result, setResult] = useState<BudgetPlan | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<BudgetPlan | null>("/api/budget").then((res) => {
      if (res.ok && res.data) {
        const d = res.data;
        setForm({
          totalBudget: d.totalBudget,
          landBudget: d.landBudget,
          waterBudget: d.waterBudget,
          powerBudget: d.powerBudget,
          shelterBudget: d.shelterBudget,
          foodBudget: d.foodBudget,
          toolsBudget: d.toolsBudget,
          emergencyReserve: d.emergencyReserve,
        });
        setResult(d);
      }
      setLoading(false);
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Calculating…");
    const res = await apiPost<BudgetPlan>("/api/budget", form);
    if (res.ok) {
      setResult(res.data);
      setStatus("Saved.");
    } else {
      setStatus(`Error: ${res.error}`);
    }
  }

  if (loading) return <p className="text-sm text-bark-700">Loading…</p>;

  const allocated =
    form.landBudget +
    form.waterBudget +
    form.powerBudget +
    form.shelterBudget +
    form.foodBudget +
    form.toolsBudget +
    form.emergencyReserve;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget & Phasing Planner"
        blurb="Honest estimates with a real reserve. Most homestead projects run 20%+ over the first plan."
      />

      <form onSubmit={onSubmit} className="space-y-6">
        <Card title="Total + reserve">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NumberField
              label="Total budget ($)"
              value={form.totalBudget}
              min={0}
              onChange={(e) =>
                setForm({ ...form, totalBudget: +e.target.value })
              }
            />
            <NumberField
              label="Emergency reserve ($)"
              value={form.emergencyReserve}
              min={0}
              onChange={(e) =>
                setForm({ ...form, emergencyReserve: +e.target.value })
              }
              help="Aim for 15–20% of total. This is not the same as a contractor contingency."
            />
          </div>
        </Card>

        <Card title="Category allocations">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NumberField
              label="Land ($)"
              value={form.landBudget}
              min={0}
              onChange={(e) => setForm({ ...form, landBudget: +e.target.value })}
            />
            <NumberField
              label="Water ($)"
              value={form.waterBudget}
              min={0}
              onChange={(e) =>
                setForm({ ...form, waterBudget: +e.target.value })
              }
            />
            <NumberField
              label="Power ($)"
              value={form.powerBudget}
              min={0}
              onChange={(e) =>
                setForm({ ...form, powerBudget: +e.target.value })
              }
            />
            <NumberField
              label="Shelter ($)"
              value={form.shelterBudget}
              min={0}
              onChange={(e) =>
                setForm({ ...form, shelterBudget: +e.target.value })
              }
            />
            <NumberField
              label="Food / garden ($)"
              value={form.foodBudget}
              min={0}
              onChange={(e) =>
                setForm({ ...form, foodBudget: +e.target.value })
              }
            />
            <NumberField
              label="Tools ($)"
              value={form.toolsBudget}
              min={0}
              onChange={(e) =>
                setForm({ ...form, toolsBudget: +e.target.value })
              }
            />
          </div>
          <div className="mt-3 text-sm text-bark-700">
            Allocated: ${allocated.toLocaleString()} of ${form.totalBudget.toLocaleString()}
            {allocated > form.totalBudget && (
              <span className="text-red-700"> — over by ${(allocated - form.totalBudget).toLocaleString()}</span>
            )}
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit">Calculate & save</Button>
          {status && <span className="text-sm text-bark-700">{status}</span>}
        </div>
      </form>

      {result && (
        <Card title="Result">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Phase n={1} amount={result.phaseOneEstimate} />
            <Phase n={2} amount={result.phaseTwoEstimate} />
            <Phase n={3} amount={result.phaseThreeEstimate} />
            <Phase n={4} amount={result.phaseFourEstimate} />
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

function Phase({ n, amount }: { n: number; amount: number }) {
  return (
    <div className="rounded-md border border-bark-200 p-3 bg-bark-50">
      <div className="text-xs text-bark-700">Phase {n}</div>
      <div className="text-base font-semibold text-bark-900">
        ${amount.toLocaleString()}
      </div>
    </div>
  );
}
