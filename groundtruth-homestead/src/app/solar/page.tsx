"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { NumberField, TextAreaField } from "@/components/ui/Field";
import { WarningList } from "@/components/ui/WarningList";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { apiGet, apiPost } from "@/lib/client/api";
import type { SolarInput } from "@/lib/schemas";
import type { SolarPlan } from "@/lib/types";

const EMPTY_TEXT = {
  essential: "fridge\nlights\nwell pump\nrouter / comms",
  comfort: "laptops\nphone charging\nkitchen small appliances",
  heavy: "",
};

export default function SolarPage() {
  const [dailyKwhEstimate, setDailyKwhEstimate] = useState(8);
  const [batteryDays, setBatteryDays] = useState(2);
  const [sunHoursPerDay, setSunHoursPerDay] = useState<number | "">(4);
  const [essential, setEssential] = useState(EMPTY_TEXT.essential);
  const [comfort, setComfort] = useState(EMPTY_TEXT.comfort);
  const [heavy, setHeavy] = useState(EMPTY_TEXT.heavy);

  const [result, setResult] = useState<SolarPlan | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<SolarPlan | null>("/api/solar").then((res) => {
      if (res.ok && res.data) {
        setDailyKwhEstimate(res.data.dailyKwhEstimate);
        setBatteryDays(res.data.batteryDays);
        setSunHoursPerDay(res.data.sunHoursPerDay ?? 4);
        setEssential(res.data.essentialLoads.join("\n"));
        setComfort(res.data.comfortLoads.join("\n"));
        setHeavy(res.data.heavyLoads.join("\n"));
        setResult(res.data);
      }
      setLoading(false);
    });
  }, []);

  function lines(s: string): string[] {
    return s
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Calculating…");
    const body: SolarInput = {
      dailyKwhEstimate,
      batteryDays,
      essentialLoads: lines(essential),
      comfortLoads: lines(comfort),
      heavyLoads: lines(heavy),
      sunHoursPerDay: sunHoursPerDay === "" ? undefined : Number(sunHoursPerDay),
    };
    const res = await apiPost<SolarPlan>("/api/solar", body);
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
        title="Solar & Power Planner"
        blurb="Right-size the system to real loads, not catalog numbers. Plan for the worst month, not the average month."
      />

      <form onSubmit={onSubmit} className="space-y-6">
        <Card title="Demand">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <NumberField
              label="Daily kWh estimate"
              value={dailyKwhEstimate}
              step={0.5}
              min={0}
              onChange={(e) => setDailyKwhEstimate(+e.target.value)}
              help="Off-grid targets: 5–15 kWh/day after efficiency work."
            />
            <NumberField
              label="Battery autonomy (days)"
              value={batteryDays}
              step={0.5}
              min={0}
              max={30}
              onChange={(e) => setBatteryDays(+e.target.value)}
              help="2–3 days minimum is the usual recommendation."
            />
            <NumberField
              label="Avg usable sun hrs/day"
              value={sunHoursPerDay}
              step={0.5}
              min={1}
              max={8}
              onChange={(e) =>
                setSunHoursPerDay(e.target.value === "" ? "" : +e.target.value)
              }
              help="Default 4. Winter low for much of the US is 2–3."
            />
          </div>
        </Card>

        <Card
          title="Loads"
          subtitle="One load per line. Heavy loads (electric heat, EV charging, electric water heater, large shop tools) are flagged."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextAreaField
              label="Essential"
              value={essential}
              onChange={(e) => setEssential(e.target.value)}
              rows={6}
            />
            <TextAreaField
              label="Comfort"
              value={comfort}
              onChange={(e) => setComfort(e.target.value)}
              rows={6}
            />
            <TextAreaField
              label="Heavy"
              value={heavy}
              onChange={(e) => setHeavy(e.target.value)}
              rows={6}
              help="Be honest. Anything you'd hate to give up."
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Stat
              label="Battery (kWh)"
              value={`${result.recommendedBatteryKwh}`}
            />
            <Stat
              label="Solar array (kW)"
              value={`${result.recommendedSolarKw}`}
            />
            <Stat
              label="Generator backup"
              value={result.generatorRecommended ? "Recommended" : "Optional"}
            />
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
