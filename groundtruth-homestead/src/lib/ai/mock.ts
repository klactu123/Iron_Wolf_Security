import type { AIContext, AIQuestion, HomesteadAIService } from "./types";
import { generateId } from "@/lib/api/ids";

// Deterministic mock. Returns useful, calculator-aware text without an LLM.
// All numeric claims come from the snapshot — the mock never invents values.
export class MockHomesteadAIService implements HomesteadAIService {
  async generateFollowUpQuestions(ctx: AIContext): Promise<AIQuestion[]> {
    const out: AIQuestion[] = [];
    const { snapshot } = ctx;

    if (!snapshot.profile) {
      out.push(q("profile", "What does the next 5 years look like for your household — same head count, kids leaving home, family joining you?"));
    }

    if (!snapshot.land) {
      out.push(q("land", "Do you have legal, recorded access to the property — deeded frontage or a written easement?"));
    } else {
      if (!snapshot.land.legalAccess) {
        out.push(q("land", "Legal access is missing. What is the path to securing a recorded easement before any infrastructure goes in?"));
      }
      if (!snapshot.land.zoningKnown) {
        out.push(q("land", "Have you confirmed permitted uses with the county planning office in writing?"));
      }
    }

    if (snapshot.water) {
      if (snapshot.water.reserveDays < 14) {
        out.push(q("water", `Your reserve sits at ${snapshot.water.reserveDays} days. What happens if your primary source is down for two weeks in winter?`));
      }
      if (!snapshot.water.hasWell && !snapshot.water.hasRainCatchment) {
        out.push(q("water", "There's no well and no rain catchment in the plan. Have you priced well drilling locally and confirmed catchment is legal in your county?"));
      }
    } else {
      out.push(q("water", "Where is your daily water coming from — well, hauled, rain catchment, surface water?"));
    }

    if (snapshot.solar) {
      if (snapshot.solar.batteryDays < 2) {
        out.push(q("solar", "Battery autonomy is under 2 days. How will you cover a multi-day cloudy stretch in your darkest month?"));
      }
      if (snapshot.solar.dailyKwhEstimate > 15) {
        out.push(q("solar", `Daily usage of ${snapshot.solar.dailyKwhEstimate} kWh is high for off-grid. What loads can move to propane or be eliminated?`));
      }
    }

    if (snapshot.shelter && !snapshot.shelter.existingShelter) {
      out.push(q("shelter", "No habitable shelter exists yet. Where will you live — through a winter — while construction happens?"));
    }

    if (snapshot.food?.wantsLivestock && (!snapshot.water || snapshot.water.riskLevel !== "low")) {
      out.push(q("food", "Livestock are planned but water isn't yet rock-solid. Can livestock decisions wait until water is in low-risk territory?"));
    }

    return out.slice(0, 3);
  }

  async explainCalculatorResults(ctx: AIContext): Promise<string> {
    const lines: string[] = [];
    const s = ctx.snapshot;

    if (s.water) {
      lines.push(
        `Water: ${s.water.totalDailyGallons} gal/day total, recommending a ${s.water.recommendedCisternGallons.toLocaleString()} gal cistern for a ${s.water.reserveDays}-day reserve. Risk: ${s.water.riskLevel}.`,
      );
    }
    if (s.solar) {
      lines.push(
        `Solar: ${s.solar.recommendedSolarKw} kW array and ${s.solar.recommendedBatteryKwh} kWh battery for ${s.solar.batteryDays}-day autonomy. Generator backup: ${s.solar.generatorRecommended ? "recommended" : "optional"}. Risk: ${s.solar.riskLevel}.`,
      );
    }
    if (s.budget) {
      lines.push(
        `Budget phasing: Phase 1 ~$${s.budget.phaseOneEstimate.toLocaleString()}, Phase 2 ~$${s.budget.phaseTwoEstimate.toLocaleString()}, Phase 3 ~$${s.budget.phaseThreeEstimate.toLocaleString()}, Phase 4 ~$${s.budget.phaseFourEstimate.toLocaleString()}. Risk: ${s.budget.riskLevel}.`,
      );
    }
    if (s.skills) {
      lines.push(
        `Skills: overall ${s.skills.overallSkillScore}/100. Priority learning: ${s.skills.prioritySkillsToLearn.join(", ") || "all areas adequate"}.`,
      );
    }

    if (lines.length === 0) {
      return "No calculator outputs are saved yet. Fill in the planner sections and we'll explain the numbers in plain language here.";
    }

    return lines.join("\n\n");
  }

  async generateRealityReport(ctx: AIContext): Promise<string> {
    const overall = ctx.readiness?.overall ?? 0;
    if (overall >= 75) {
      return "You're in solid shape. The remaining work is mostly redundancy and skill-building. Don't let momentum push you into livestock or scope expansion before Year 1 systems prove out through a full winter.";
    }
    if (overall >= 50) {
      return "You have a workable starting point but there are real gaps. Spend the next two quarters de-risking the lowest-scoring categories — water and shelter first — before any contractor signatures.";
    }
    if (overall >= 25) {
      return "Significant gaps. The most useful next 6 months are research and on-the-ground verification: legal access, zoning answers in writing, real water-source quotes, and a shelter plan you can survive a winter in.";
    }
    return "This is very early. The biggest wins right now are answering basic questions before any construction: where is the water, what does the county allow, where do you sleep this winter, and how do you handle waste legally.";
  }

  async generateRiskWarnings(ctx: AIContext): Promise<string[]> {
    return ctx.readiness?.topRisks ?? [];
  }

  async generateTwelveMonthPlan(): Promise<string> {
    return "See the deterministic 12-month action plan in the Reality Report. The mock AI service does not override calculator outputs.";
  }
}

function q(section: AIQuestion["section"], text: string): AIQuestion {
  return { id: generateId("q"), section, text };
}
