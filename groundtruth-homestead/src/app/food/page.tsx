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
import { WarningList } from "@/components/ui/WarningList";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { apiGet, apiPost } from "@/lib/client/api";
import type { FoodInput } from "@/lib/schemas";
import type { FoodPlan } from "@/lib/types";

const EMPTY: FoodInput = {
  gardeningExperience: "beginner",
  gardenSquareFeet: 200,
  raisedBedsCount: 0,
  wantsChickens: false,
  wantsLivestock: false,
  livestockTypes: [],
  foodPreservationExperience: "beginner",
};

export default function FoodPage() {
  const [form, setForm] = useState<FoodInput>(EMPTY);
  const [livestockText, setLivestockText] = useState("");
  const [result, setResult] = useState<FoodPlan | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<FoodPlan | null>("/api/food").then((res) => {
      if (res.ok && res.data) {
        const { id: _i, profileId: _p, ...rest } = res.data;
        void _i; void _p;
        setForm({
          gardeningExperience: rest.gardeningExperience,
          gardenSquareFeet: rest.gardenSquareFeet,
          raisedBedsCount: rest.raisedBedsCount,
          wantsChickens: rest.wantsChickens,
          wantsLivestock: rest.wantsLivestock,
          livestockTypes: rest.livestockTypes,
          foodPreservationExperience: rest.foodPreservationExperience,
        });
        setLivestockText(rest.livestockTypes.join(", "));
        setResult(res.data);
      }
      setLoading(false);
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Calculating…");
    const livestockTypes = livestockText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const res = await apiPost<FoodPlan>("/api/food", { ...form, livestockTypes });
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
        title="Food & Farming Starter Planner"
        blurb="Year-one realistic target: replace 10–20% of household calories. Self-sufficiency takes years."
      />

      <form onSubmit={onSubmit} className="space-y-6">
        <Card title="Garden">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SelectField
              label="Gardening experience"
              value={form.gardeningExperience}
              onChange={(e) =>
                setForm({
                  ...form,
                  gardeningExperience: e.target.value as FoodInput["gardeningExperience"],
                })
              }
              options={[
                { value: "beginner", label: "Beginner" },
                { value: "some_experience", label: "Some experience" },
                { value: "experienced", label: "Experienced" },
              ]}
            />
            <NumberField
              label="Garden area (sq ft)"
              value={form.gardenSquareFeet}
              min={0}
              onChange={(e) =>
                setForm({ ...form, gardenSquareFeet: +e.target.value })
              }
              help="Beginners: start 200–600 sq ft."
            />
            <NumberField
              label="Raised beds (count)"
              value={form.raisedBedsCount}
              min={0}
              onChange={(e) =>
                setForm({ ...form, raisedBedsCount: +e.target.value })
              }
            />
          </div>
        </Card>

        <Card title="Animals">
          <div className="space-y-1">
            <CheckboxField
              label="Plan to keep chickens"
              help="Phase 2 candidate — only after water and shelter are stable."
              checked={form.wantsChickens}
              onChange={(e) => setForm({ ...form, wantsChickens: e.target.checked })}
            />
            <CheckboxField
              label="Plan to keep larger livestock"
              checked={form.wantsLivestock}
              onChange={(e) =>
                setForm({ ...form, wantsLivestock: e.target.checked })
              }
            />
          </div>
          {form.wantsLivestock && (
            <div className="mt-4">
              <TextAreaField
                label="Livestock types (comma separated)"
                value={livestockText}
                onChange={(e) => setLivestockText(e.target.value)}
                help="e.g. goats, sheep, pigs, cows. Each species has different fencing/water/feed/vet needs."
                rows={2}
              />
            </div>
          )}
        </Card>

        <Card title="Preservation">
          <SelectField
            label="Food preservation experience"
            value={form.foodPreservationExperience}
            onChange={(e) =>
              setForm({
                ...form,
                foodPreservationExperience: e.target
                  .value as FoodInput["foodPreservationExperience"],
              })
            }
            options={[
              { value: "beginner", label: "Beginner" },
              { value: "some_experience", label: "Some experience" },
              { value: "experienced", label: "Experienced" },
            ]}
            help="Canning, freezing, drying, fermenting, root cellaring. Without this, surplus rots."
          />
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit">Calculate & save</Button>
          {status && <span className="text-sm text-bark-700">{status}</span>}
        </div>
      </form>

      {result && (
        <Card title="Result">
          <h3 className="text-sm font-semibold text-bark-900 mb-2">
            Recommended year-one crops
          </h3>
          <ul className="flex flex-wrap gap-2 mb-4">
            {result.recommendedYearOneCrops.map((c) => (
              <li
                key={c}
                className="text-xs px-2 py-1 rounded-full bg-moss-100 text-moss-900 border border-moss-300"
              >
                {c}
              </li>
            ))}
          </ul>
          <RiskBadge level={result.riskLevel} />
          <WarningList warnings={result.warnings} />
        </Card>
      )}
    </div>
  );
}
