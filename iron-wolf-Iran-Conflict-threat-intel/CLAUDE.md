# CLAUDE.md - Iron Wolf Threat Intel Brief Generator

## Project Context
Iran Conflict Executive Intelligence Brief Generator — a one-button tool that produces
comprehensive, AI-researched executive briefings on the current Iran conflict and its impact
on energy/gas prices, retail supply chains, the U.S. economy, cyber threats, and recommended
actions for leadership. Uses live web search for real-time intelligence from authoritative sources.
Part of the Iron Wolf AI Security Toolkit.

## Architecture
- **Frontend**: React 18 + Vite + Tailwind CSS 4 (SPA, no router needed)
- **Backend**: Express.js — proxies to Claude API
- **AI**: Claude API (claude-sonnet-4-6) with `web_search_20250305` tool for live intelligence research
- **API Key**: `ANTHROPIC_API_KEY` in server `.env` only — never exposed to browser
- **Ports**: Vite on 5176, Express on 3004

### Workflow
1. User clicks "Generate Intelligence Brief" button
2. Optional: user can add focus area or organizational context for tailored recommendations
3. Claude researches all aspects via web search (Reuters, AP, Bloomberg, CISA, etc.)
4. Streams structured 7-section executive brief via SSE

### Output Sections (7-section format)
1. Executive Summary — bottom-line assessment, threat level, confidence
2. Situation Update — military operations, diplomatic status, escalation indicators
3. Energy & Gas Impact — oil prices, Strait of Hormuz, gas prices, OPEC+ response
4. Retail & Consumer Impact — supply chain, shipping routes, product categories, consumer confidence
5. Economic & Market Impact — stock indices, currency, bonds, GDP, inflation
6. Cyber Threat Landscape — Iranian APTs, CISA advisories, targeted sectors
7. Recommended Actions for Leadership — immediate, short-term, strategic

## Key Files
- `src/prompts/system.js` — **CORE IP**. Senior geopolitical threat analyst persona with web search methodology.
- `server/index.js` — Express server with endpoints:
  - `POST /api/analyze/stream` (SSE streaming executive brief)
  - `GET /api/health` (includes `hasClaudeKey`)
  - `POST /api/settings/api-key` + `DELETE` (localhost only)
  - `POST /api/shutdown` (localhost only)
- `server/providers.js` — Claude API with web_search, retry logic, 300KB stream limit
- `src/App.jsx` — Main component, single-button brief generation
- `src/hooks/useThreatStream.js` — Streaming state machine (IDLE/STREAMING/COMPLETE/ERROR)
- `src/utils/api.js` — SSE stream parser, settings API calls
- `src/components/BriefOutput.jsx` — Section-based markdown renderer with TOC, document header, print styles
- `src/components/SettingsModal.jsx` — Claude API key management

## Security
- Helmet with full CSP, CORS restricted, rate limiting (120/min global, 10/min analyze)
- Optional focus field max 500 chars, context max 2KB
- Context wrapped in `<org_context>` XML tags
- API key server-side only, localhost-only settings/shutdown endpoints
- API key charset validation, format validation (sk-ant- prefix, 40-120 chars)
- Server binds to 127.0.0.1 only
- `trust proxy` explicitly disabled
- CORS origins validated, wildcard rejected
- SSE stream timeout (3 minutes), stream size limit (300KB)
- Shutdown with process tree kill + re-entry guard
- Link validation blocks javascript:/data: schemes and embedded credentials

## Development
1. `npm install` then `npm run dev` runs client (5176) + server (3004)
2. Vite proxies `/api` to Express
3. Set `ANTHROPIC_API_KEY` in `.env`

## Conventions
- Dark mode UI (zinc-950 bg, zinc-100 text, red-700 primary action)
- Iron Wolf branding in header/footer
- TLP:AMBER classification banner on generated briefs
- Section colors: executive=red, situation=orange, energy=amber, retail=purple, economic=blue, cyber=cyan, actions=green
- Streaming uses SSE with X-Accel-Buffering: no
- Copy to clipboard + Print/PDF support for completed output
- `print-color-adjust: exact` for color PDF export
- Shutdown button matches toolkit pattern (green, localhost-only)
