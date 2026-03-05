# CLAUDE.md - Iron Wolf Threat Intel Brief Generator

## Project Context
Threat Intel Brief Generator takes IOCs (IPs, domains, hashes, URLs, emails, CVEs) and produces
structured threat intelligence briefs with attribution, MITRE ATT&CK mapping, risk assessment,
and recommended defensive actions. Uses live web search for real-time IOC research.
Part of the Iron Wolf AI Security Toolkit.

## Architecture
- **Frontend**: React 18 + Vite + Tailwind CSS 4 (SPA, no router needed)
- **Backend**: Express.js — proxies to Claude API
- **AI**: Claude API (claude-sonnet-4-6) with `web_search_20250305` tool for IOC research
- **API Key**: `ANTHROPIC_API_KEY` in server `.env` only — never exposed to browser
- **Ports**: Vite on 5176, Express on 3004

### Workflow
1. User pastes IOCs (one per line or comma-separated)
2. IOC parser auto-detects types and shows preview badges
3. Optional: user adds organizational context for tailored risk assessment
4. Claude researches each IOC via web search (VirusTotal, AbuseIPDB, CISA, etc.)
5. Streams structured 7-section intel brief via SSE

### Supported IOC Types
IPv4, IPv6, domains, URLs, file hashes (MD5/SHA-1/SHA-256), email addresses, CVE IDs

### Output Sections (7-section format)
1. Executive Summary — threat level, confidence, key finding
2. IOC Analysis — per-IOC reputation, associations, findings
3. Threat Actor Attribution — group, motivation, targeting
4. TTPs (MITRE ATT&CK) — mapped techniques and tactics
5. Campaign & Infrastructure Context — related campaigns, infrastructure
6. Risk Assessment — severity, likelihood, impact
7. Recommended Actions — immediate, short-term, long-term

## Key Files
- `src/prompts/system.js` — **CORE IP**. Senior threat intel analyst persona with web search methodology.
- `server/index.js` — Express server with endpoints:
  - `POST /api/analyze/stream` (SSE streaming intel brief)
  - `GET /api/health` (includes `hasClaudeKey`)
  - `POST /api/settings/api-key` + `DELETE` (localhost only)
  - `POST /api/shutdown` (localhost only)
- `server/providers.js` — Claude API with web_search, retry logic, 300KB stream limit
- `src/App.jsx` — Main component, IOC input to brief output flow
- `src/hooks/useThreatStream.js` — Streaming state machine (IDLE/STREAMING/COMPLETE/ERROR)
- `src/utils/api.js` — SSE stream parser, settings API calls
- `src/utils/iocParser.js` — IOC type detection (regex-based), color badges
- `src/components/IocInput.jsx` — Textarea with IOC preview badges, org context, sample loader
- `src/components/BriefOutput.jsx` — Section-based markdown renderer with TOC, document header, print styles
- `src/components/SettingsModal.jsx` — Claude API key management

## Security
- Helmet with full CSP, CORS restricted, rate limiting (120/min global, 15/min analyze)
- IOC input max 100KB, min 3 chars
- Org context max 5KB, wrapped in `<org_context>` XML tags
- IOCs wrapped in `<iocs>` XML tags with prompt injection defense
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
- Dark mode UI (zinc-950 bg, zinc-100 text, amber-500 accent)
- Iron Wolf branding in header/footer
- TLP:AMBER classification banner on generated briefs
- IOC type badges: IP=blue, domain=purple, URL=orange, hash=emerald, email=yellow, CVE=red
- Section colors: executive=red, ioc=orange, attribution=purple, ttps=blue, campaign=cyan, risk=yellow, actions=green
- Streaming uses SSE with X-Accel-Buffering: no
- Copy to clipboard + Print support for completed output
- `print-color-adjust: exact` for color PDF export
