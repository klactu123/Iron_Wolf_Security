# GroundTruth Homestead

A practical homestead feasibility and transition planner. Calculators, readiness scoring,
risk warnings, and a phased plan for people moving from city/suburban life toward off-grid
or semi-off-grid living.

This is a planning tool, not a chatbot. The math is deterministic. AI explanations are
optional and abstracted behind a service interface so they can be swapped or disabled.

## Quick start

**Windows (easiest):** double-click `start.bat`. It installs dependencies on first
run, starts the dev server, and opens your browser at <http://localhost:3000>.
Close the terminal window or press Ctrl+C to stop.

**Any OS (manual):**

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # run calculator unit tests
npm run typecheck    # TypeScript check
```

Copy `.env.example` to `.env.local` if you want to wire up an AI provider. The mock
provider works with no keys.

## Bring your own Claude API key (optional)

Calculators and the Reality Report work without any AI. To enable Claude-authored
explanations and risk summaries:

1. Get a key at <https://console.anthropic.com/settings/keys>.
2. Copy `.env.example` to `.env.local` and fill in:
   ```ini
   HOMESTEAD_AI_PROVIDER=claude
   ANTHROPIC_API_KEY=sk-ant-...
   # Optional. Defaults to claude-opus-4-7.
   # ANTHROPIC_MODEL=claude-sonnet-4-6
   ```
3. Restart `npm run dev`.

Your key stays on your machine. It is read from `.env.local` at server startup and
used only to call `api.anthropic.com`. The project never ships your key anywhere.
A banner on the dashboard indicates whether Claude is configured.

## What's in the box (MVP)

- Homestead profile intake
- Land assessment
- Water + cistern planner
- Solar / power planner
- Food + farming starter planner
- Waste + sanitation planner
- Shelter + heating planner
- Budget + phasing planner
- Skills gap assessment
- Readiness scoring
- Reality Report (assembled from saved data + calculator outputs)
- AI planning service abstraction (mock implementation included)

## Architecture

See [`CLAUDE.md`](./CLAUDE.md) for the architectural rules and conventions.

Top-level layout:

```
src/app/             Next.js App Router pages + API routes
src/components/      UI primitives (no business logic)
src/lib/calculators/ Deterministic calculators (no LLM, no I/O)
src/lib/storage/     Repository interface + JSON file implementation
src/lib/ai/          HomesteadAIService + Mock + provider factory
src/lib/report/      Reality Report assembler
```

## Storage

The MVP persists to `data/store.json` (gitignored) via a repository interface. When you
want Postgres, swap the implementation in `src/lib/storage/index.ts` — the rest of the app
doesn't change.

## Filesystem note

`next dev` works on any drive. `next build` requires a filesystem with proper symlink
support (NTFS, ext4, APFS). On exFAT or FAT32 drives, the production build fails with
`EISDIR: illegal operation on a directory, readlink ...`. If you hit this, move the
project (or just `node_modules`) to an NTFS drive.

## Disclaimer

This software is a planning aid. It does not replace professional legal, engineering,
electrical, plumbing, septic, well, agricultural, medical, or financial advice. Always
verify zoning, permitting, septic, well, building, and rainwater catchment requirements
with local authorities before acting on any output.
