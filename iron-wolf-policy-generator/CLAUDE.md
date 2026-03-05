# CLAUDE.md - Iron Wolf Security Policy Generator & Reviewer

## Project Context
Security Policy Generator & Reviewer lets users generate framework-aligned security policy
documents or review existing policies for compliance gaps. Supports NIST 800-53, CIS Controls v8,
ISO 27001, and CMMC 2.0. Part of the Iron Wolf AI Security Toolkit.

## Architecture
- **Frontend**: React 18 + Vite + Tailwind CSS 4 (SPA, no router needed)
- **Backend**: Express.js — proxies to Claude API
- **AI**: Claude API (claude-sonnet-4-6) with `web_search_20250305` tool for framework verification
- **API Key**: `ANTHROPIC_API_KEY` in server `.env` only — never exposed to browser
- **Ports**: Vite on 5175, Express on 3003

### Dual Modes
1. **Generate**: Select framework + policy type → produces complete policy draft with 8 sections
2. **Review**: Select framework + paste existing policy → gap analysis with compliance mapping

### Supported Frameworks
- NIST SP 800-53 Rev. 5 (nist-800-53)
- CIS Controls v8 (cis-v8)
- ISO/IEC 27001:2022 (iso-27001)
- CMMC 2.0 (cmmc)

### 12 Policy Types
acceptable-use, incident-response, access-control, data-classification, password,
remote-work, encryption, vendor-management, change-management, backup-recovery,
network-security, mobile-device

## Key Files
- `src/prompts/system.js` — **CORE IP**. GRC expert persona with generate/review prompt templates.
- `server/index.js` — Express server with endpoints:
  - `POST /api/generate/stream` (SSE streaming policy generation)
  - `POST /api/review/stream` (SSE streaming policy review)
  - `GET /api/health` (includes `hasClaudeKey`)
  - `POST /api/settings/api-key` + `DELETE` (localhost only)
  - `POST /api/shutdown` (localhost only)
- `server/providers.js` — Claude API with web_search, retry logic, 300KB stream limit
- `src/App.jsx` — Main component with generate/review mode toggle
- `src/hooks/usePolicyStream.js` — Streaming state machine (IDLE/STREAMING/COMPLETE)
- `src/utils/api.js` — SSE stream parser, settings API calls
- `src/components/PolicyForm.jsx` — Framework/policy type selectors, org context input, review textarea
- `src/components/PolicyOutput.jsx` — Section-based markdown renderer with framework-aware icons
- `src/components/SettingsModal.jsx` — Claude API key management

## Security
- Helmet with full CSP, CORS restricted, rate limiting (120/min global, 15/min generate/review)
- Input validation: framework/policyType whitelists, review max 200KB, org context max 5KB
- API key server-side only, localhost-only settings/shutdown endpoints
- API key charset validation (alphanumeric + hyphen/underscore only)
- Server binds to 127.0.0.1 only (not exposed to network)
- `trust proxy` explicitly disabled
- CORS origins validated as well-formed URLs, wildcard `*` rejected
- Review mode wraps policy in `<policy>` XML tags for prompt injection defense
- SSE stream timeout (3 minutes max), stream size limit (300KB)
- Shutdown rate-limited (3/min) + browser confirmation dialog

## Development
1. `npm install` then `npm run dev` runs client (5175) + server (3003)
2. Vite proxies `/api` to Express
3. Set `ANTHROPIC_API_KEY` in `.env`

## Conventions
- Dark mode UI (zinc-950 bg, zinc-100 text, blue-500 accent for generate, purple-500 for review)
- Iron Wolf branding in header/footer
- Generate button: blue, Review button: purple
- Streaming uses SSE with X-Accel-Buffering: no
- Copy to clipboard + Print support for completed output
