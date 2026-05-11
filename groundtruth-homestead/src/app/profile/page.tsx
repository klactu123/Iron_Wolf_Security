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
  TextField,
} from "@/components/ui/Field";
import { apiGet, apiPost } from "@/lib/client/api";
import type { ProfileInput } from "@/lib/schemas";
import type { UserHomesteadProfile } from "@/lib/types";

const EMPTY: ProfileInput = {
  householdSize: 1,
  adults: 1,
  children: 0,
  currentLivingSituation: "",
  targetState: "",
  targetCounty: "",
  ownsLand: false,
  landStatus: "dreaming",
  desiredOffGridLevel: "medium",
  targetTimelineMonths: 24,
  estimatedBudget: 0,
  experienceLevel: "beginner",
  physicalLimitationsNotes: "",
  primaryGoals: [],
};

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileInput>(EMPTY);
  const [goalsText, setGoalsText] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<UserHomesteadProfile | null>("/api/profile").then((res) => {
      if (res.ok && res.data) {
        const { id: _id, userId: _u, createdAt: _c, updatedAt: _up, ...rest } = res.data;
        void _id; void _u; void _c; void _up;
        setForm(rest);
        setGoalsText(rest.primaryGoals.join("\n"));
      }
      setLoading(false);
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Saving…");
    const goals = goalsText
      .split("\n")
      .map((g) => g.trim())
      .filter(Boolean);
    const res = await apiPost<UserHomesteadProfile>("/api/profile", {
      ...form,
      primaryGoals: goals,
    });
    setStatus(res.ok ? "Saved." : `Error: ${res.error}`);
  }

  if (loading) return <p className="text-sm text-bark-700">Loading…</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <PageHeader
        title="Homestead Profile"
        blurb="The starting point. Household, target location, budget, timeline, and what success looks like for you."
      />
      <Card title="Household">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NumberField
            label="Household size"
            value={form.householdSize}
            min={1}
            onChange={(e) => setForm({ ...form, householdSize: +e.target.value })}
          />
          <NumberField
            label="Adults"
            value={form.adults}
            min={0}
            onChange={(e) => setForm({ ...form, adults: +e.target.value })}
          />
          <NumberField
            label="Children"
            value={form.children}
            min={0}
            onChange={(e) => setForm({ ...form, children: +e.target.value })}
          />
        </div>
        <div className="mt-4">
          <TextField
            label="Current living situation"
            placeholder="Apartment in Denver, paying $2,400/mo, lease ends June"
            value={form.currentLivingSituation}
            onChange={(e) =>
              setForm({ ...form, currentLivingSituation: e.target.value })
            }
          />
        </div>
      </Card>

      <Card title="Where">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            label="Target state"
            value={form.targetState}
            onChange={(e) => setForm({ ...form, targetState: e.target.value })}
          />
          <TextField
            label="Target county"
            value={form.targetCounty}
            onChange={(e) => setForm({ ...form, targetCounty: e.target.value })}
            help="County is where zoning, septic, and well rules live. Be specific."
          />
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Land status"
            value={form.landStatus}
            onChange={(e) =>
              setForm({ ...form, landStatus: e.target.value as ProfileInput["landStatus"] })
            }
            options={[
              { value: "dreaming", label: "Dreaming" },
              { value: "researching", label: "Researching" },
              { value: "own_land", label: "Own land" },
              { value: "living_on_land", label: "Living on land" },
            ]}
          />
          <CheckboxField
            label="I currently own the land I plan to homestead"
            checked={form.ownsLand}
            onChange={(e) => setForm({ ...form, ownsLand: e.target.checked })}
          />
        </div>
      </Card>

      <Card title="Goals & timeline">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Desired off-grid level"
            value={form.desiredOffGridLevel}
            onChange={(e) =>
              setForm({
                ...form,
                desiredOffGridLevel: e.target.value as ProfileInput["desiredOffGridLevel"],
              })
            }
            options={[
              { value: "low", label: "Low (mostly grid-tied, some independence)" },
              { value: "medium", label: "Medium (hybrid)" },
              { value: "high", label: "High (mostly off-grid)" },
              { value: "full", label: "Full (no grid)" },
            ]}
          />
          <NumberField
            label="Target timeline (months)"
            value={form.targetTimelineMonths}
            min={0}
            max={600}
            onChange={(e) =>
              setForm({ ...form, targetTimelineMonths: +e.target.value })
            }
          />
          <NumberField
            label="Estimated budget ($)"
            value={form.estimatedBudget}
            min={0}
            onChange={(e) =>
              setForm({ ...form, estimatedBudget: +e.target.value })
            }
          />
          <SelectField
            label="Experience level"
            value={form.experienceLevel}
            onChange={(e) =>
              setForm({
                ...form,
                experienceLevel: e.target.value as ProfileInput["experienceLevel"],
              })
            }
            options={[
              { value: "beginner", label: "Beginner" },
              { value: "some_experience", label: "Some experience" },
              { value: "experienced", label: "Experienced" },
            ]}
          />
        </div>
        <div className="mt-4">
          <TextAreaField
            label="Physical limitations or relevant medical notes (optional)"
            value={form.physicalLimitationsNotes}
            onChange={(e) =>
              setForm({ ...form, physicalLimitationsNotes: e.target.value })
            }
            help="Affects shelter, water access, and skill priorities. Stays local; no external sharing."
          />
        </div>
        <div className="mt-4">
          <TextAreaField
            label="Primary goals (one per line)"
            value={goalsText}
            onChange={(e) => setGoalsText(e.target.value)}
            help="e.g. lower cost of living, food independence, raise kids in nature, work remote, escape HOA."
            rows={5}
          />
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit">Save profile</Button>
        {status && <span className="text-sm text-bark-700">{status}</span>}
      </div>
    </form>
  );
}
