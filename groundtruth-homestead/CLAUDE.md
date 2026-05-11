# GroundTruth Homestead — Project Notes for Claude

## What this is

A practical homestead feasibility and transition planner. Helps city/suburban folks
build a realistic, phased plan for moving toward off-grid or semi-off-grid living.
Tone is **practical, honest, encouraging, reality-check focused** — never doom,
never fantasy. The app should help users avoid expensive mistakes.

## Stack

- **Next.js 15** (App Router, TypeScript, React 19)
- **Tailwind CSS v4** (CSS-based config via `@tailwindcss/postcss`)
- **Zod** for validation
- **Vitest** for unit tests (calculators)
- **JSON file storage** behind a repository interface (Drizzle/Postgres can drop in later)
- **Single-user mode** — no auth yet; all data belongs to one local profile (id `default`)

## Layout

```
src/
  app/                  # Next.js App Router pages + API routes
    api/<entity>/route.ts
    <page>/page.tsx
  components/           # UI primitives, no business logic
  lib/
    calculators/        # Deterministic math — NEVER calls an LLM
    storage/            # Repository interface + JSON impl
    ai/                 # HomesteadAIService interface + Mock + provider factory
    report/             # Reality Report assembler
    schemas.ts          # Zod schemas (validation at API boundary)
    types.ts            # Domain types
```

## Architectural rules

1. **Calculators are deterministic.** They take typed inputs and return typed outputs
   with `warnings: string[]` and `riskLevel`. They never call an LLM, network, or DB.
2. **AI never invents calculator values.** AI receives calculator outputs as context
   and explains them in plain language. All math is deterministic.
3. **Business logic stays out of React components.** Forms collect input, call the
   API, render results. Calculation lives in `lib/calculators`.
4. **Storage is abstracted.** Use `getStore()` from `@/lib/storage`. Don't import the
   JSON impl directly. When Postgres lands, only the impl changes.
5. **Single source of truth for risk language.** Warnings come from calculators or
   the report generator — components don't author them.

## Guardrails (must hold across the codebase)

The app must NOT:
- Give definitive legal, engineering, electrical, plumbing, septic, well, or medical advice
- Tell users to skip permits or inspections
- Recommend drinking untreated pond/creek/rain water
- Encourage illegal waste disposal
- Overpromise food self-sufficiency
- Treat livestock as beginner-friendly when water/fencing/shelter/feed planning is missing

The app SHOULD:
- Recommend professional help for electrical, septic, well, structural, and code-sensitive work
- Encourage water testing and filtration
- Encourage backup systems and reserves
- Warn about winter, drought, access, injury, illness, and budget overruns
- Recommend local verification for zoning, septic, wells, livestock, building codes, rainwater laws

## Conventions

- Path alias `@/*` → `src/*`
- API routes return `{ ok: true, data }` or `{ ok: false, error }`
- Profile id is currently always `"default"` (single-user MVP)
- `data/store.json` is gitignored; created on first write
- Don't add comments that just describe what the code does. Reserve comments for
  non-obvious *why* (constraints, invariants, surprising behavior)

## Adding a new calculator

1. Add input/output types in `src/lib/types.ts`
2. Add the function in `src/lib/calculators/<name>.ts`
3. Re-export from `src/lib/calculators/index.ts`
4. Add a Vitest spec in `src/lib/calculators/<name>.test.ts`
5. If user-facing: add a Zod schema in `src/lib/schemas.ts`, an API route, and a page

## Adding a new AI provider

1. Implement `HomesteadAIService` from `src/lib/ai/types.ts`
2. Add to the factory in `src/lib/ai/index.ts` keyed on `HOMESTEAD_AI_PROVIDER`
3. Provider must read its key from env; never hardcode
4. The mock provider stays the default and must always work without keys
