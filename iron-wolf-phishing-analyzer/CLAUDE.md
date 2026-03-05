# CLAUDE.md - Iron Wolf AI Phishing Email Analyzer

## Project Context
AI Phishing Email Analyzer lets users paste suspicious emails (headers + body) and receive
structured analysis with red flags, social engineering tactic identification, URL risk scoring,
confidence-scored verdicts, and recommended actions. Part of the Iron Wolf AI Security Toolkit.

## Architecture
- **Frontend**: React 18 + Vite + Tailwind CSS 4 (SPA, no router needed)
- **Backend**: Express.js — proxies to Claude API
- **AI**: Claude API (claude-sonnet-4-6) with `web_search_20250305` tool for domain/URL verification
- **API Key**: `ANTHROPIC_API_KEY` in server `.env` only — never exposed to browser
- **Ports**: Vite on 5174, Express on 3002

### Workflow
1. User pastes email (headers + body) into textarea
2. Email sent to Claude with web_search tool for domain/URL verification
3. Claude streams structured analysis via SSE
4. UI renders section cards with confidence badge and red-flag highlighting

### Output Sections
1. Phishing Analysis Verdict (confidence %, threat level, category)
2. Red Flags Identified (bulleted, severity-tagged)
3. Header Analysis (SPF/DKIM/DMARC, sender legitimacy)
4. URL Analysis (extracted URLs with risk assessment)
5. Social Engineering Tactics (named tactics with quoted evidence)
6. Verdict & Recommended Actions (final verdict, IOCs, next steps)

## Key Files
- `src/prompts/system.js` — **CORE IP**. SOC analyst persona with email analysis methodology.
- `server/index.js` — Express server with endpoints:
  - `POST /api/analyze` (Claude non-streaming)
  - `POST /api/analyze/stream` (Claude SSE streaming)
  - `GET /api/health` (includes `hasClaudeKey`)
  - `POST /api/settings/api-key` + `DELETE` (localhost only)
  - `POST /api/shutdown` (localhost only)
- `server/providers.js` — Claude API with web_search, retry logic
- `src/App.jsx` — Main component, email input → analysis flow
- `src/hooks/usePhishingAnalysis.js` — Streaming state machine
- `src/utils/api.js` — SSE stream parser, settings API calls
- `src/utils/parsers.js` — Email header parser, URL extractor, attachment detector
- `src/components/EmailInput.jsx` — Textarea with paste/clear, sample email loader
- `src/components/EmailPreview.jsx` — Collapsible submitted email with parsed metadata
- `src/components/ConfidenceBadge.jsx` — Parses verdict/confidence from analysis markdown
- `src/components/AnalysisResult.jsx` — Section cards with streaming cursor
- `src/components/SettingsModal.jsx` — Claude API key management

## Security
- Helmet with full CSP, CORS restricted, rate limiting (120/min global, 20/min analyze)
- Email input max 500KB, min 10 chars (validated client + server)
- API key server-side only, localhost-only settings endpoints
- API key charset validation (alphanumeric + hyphen/underscore only, prevents .env injection)
- Server binds to 127.0.0.1 only (not exposed to network)
- `trust proxy` explicitly disabled to prevent X-Forwarded-For spoofing
- CORS origins validated as well-formed URLs, wildcard `*` rejected
- Prompt injection defense: XML delimiters + explicit anti-injection system prompt rule
- URLs in analysis output rendered as non-clickable text (prevents clicking malicious links)
- SSE stream timeout (3 minutes max)
- Shutdown rate-limited (3/min) + browser confirmation dialog
- .gitignore protects .env from accidental commits

## Development
1. `npm install` then `npm run dev` runs client (5174) + server (3002)
2. Vite proxies `/api` to Express
3. Set `ANTHROPIC_API_KEY` in `.env`

## Conventions
- Dark mode UI (zinc-950 bg, zinc-100 text, blue-500 accent)
- Iron Wolf branding in header/footer
- Confidence colors: Phishing=red, Suspicious=yellow, Legitimate=green
- Threat level: Critical=red, High=orange, Medium=yellow, Low=green
- Streaming uses SSE with X-Accel-Buffering: no
