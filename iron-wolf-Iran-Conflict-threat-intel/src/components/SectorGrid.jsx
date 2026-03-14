import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import {
  Flame, ShoppingCart, Heart, Radio, Landmark, Shield, Truck, Wheat, Factory, ShieldAlert,
  TrendingUp, TrendingDown, Minus, AlertTriangle
} from "lucide-react";

// ---------------------------------------------------------------------------
// Sector icon + color mapping
// ---------------------------------------------------------------------------
const SECTOR_CONFIG = {
  "energy":         { icon: Flame,       bg: "bg-amber-950/40",  border: "border-amber-700/50",  accent: "text-amber-400" },
  "gas":            { icon: Flame,       bg: "bg-amber-950/40",  border: "border-amber-700/50",  accent: "text-amber-400" },
  "retail":         { icon: ShoppingCart, bg: "bg-purple-950/40", border: "border-purple-700/50", accent: "text-purple-400" },
  "consumer":       { icon: ShoppingCart, bg: "bg-purple-950/40", border: "border-purple-700/50", accent: "text-purple-400" },
  "healthcare":     { icon: Heart,       bg: "bg-pink-950/40",   border: "border-pink-700/50",   accent: "text-pink-400" },
  "pharma":         { icon: Heart,       bg: "bg-pink-950/40",   border: "border-pink-700/50",   accent: "text-pink-400" },
  "telecom":        { icon: Radio,       bg: "bg-indigo-950/40", border: "border-indigo-700/50", accent: "text-indigo-400" },
  "technology":     { icon: Radio,       bg: "bg-indigo-950/40", border: "border-indigo-700/50", accent: "text-indigo-400" },
  "financial":      { icon: Landmark,    bg: "bg-blue-950/40",   border: "border-blue-700/50",   accent: "text-blue-400" },
  "defense":        { icon: Shield,      bg: "bg-slate-800/40",  border: "border-slate-600/50",  accent: "text-slate-300" },
  "aerospace":      { icon: Shield,      bg: "bg-slate-800/40",  border: "border-slate-600/50",  accent: "text-slate-300" },
  "transport":      { icon: Truck,       bg: "bg-orange-950/40", border: "border-orange-700/50", accent: "text-orange-400" },
  "logistics":      { icon: Truck,       bg: "bg-orange-950/40", border: "border-orange-700/50", accent: "text-orange-400" },
  "agriculture":    { icon: Wheat,       bg: "bg-green-950/40",  border: "border-green-700/50",  accent: "text-green-400" },
  "food":           { icon: Wheat,       bg: "bg-green-950/40",  border: "border-green-700/50",  accent: "text-green-400" },
  "manufacturing":  { icon: Factory,     bg: "bg-teal-950/40",   border: "border-teal-700/50",   accent: "text-teal-400" },
  "insurance":      { icon: ShieldAlert, bg: "bg-rose-950/40",   border: "border-rose-700/50",   accent: "text-rose-400" },
  "risk":           { icon: ShieldAlert, bg: "bg-rose-950/40",   border: "border-rose-700/50",   accent: "text-rose-400" },
};

function getSectorConfig(title) {
  const lower = title.toLowerCase();
  for (const [key, config] of Object.entries(SECTOR_CONFIG)) {
    if (lower.includes(key)) return config;
  }
  return { icon: AlertTriangle, bg: "bg-zinc-800/40", border: "border-zinc-700/50", accent: "text-zinc-400" };
}

// ---------------------------------------------------------------------------
// Impact level badge colors
// ---------------------------------------------------------------------------
const IMPACT_COLORS = {
  "severe":   "bg-red-600 text-white",
  "high":     "bg-orange-600 text-white",
  "moderate": "bg-yellow-600 text-white",
  "low":      "bg-green-600 text-white",
  "minimal":  "bg-emerald-700 text-white",
};

function getImpactColor(level) {
  const lower = (level || "").toLowerCase().trim();
  for (const [key, cls] of Object.entries(IMPACT_COLORS)) {
    if (lower.includes(key)) return cls;
  }
  return "bg-zinc-600 text-white";
}

// ---------------------------------------------------------------------------
// Trend indicator
// ---------------------------------------------------------------------------
function TrendBadge({ trend }) {
  const lower = (trend || "").toLowerCase().trim();
  if (lower.includes("worsening")) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400">
        <TrendingUp className="w-3 h-3 rotate-12" /> Worsening
      </span>
    );
  }
  if (lower.includes("improving")) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-400">
        <TrendingDown className="w-3 h-3 -rotate-12" /> Improving
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400">
      <Minus className="w-3 h-3" /> Stable
    </span>
  );
}

// ---------------------------------------------------------------------------
// Parse sector markdown into structured data
// ---------------------------------------------------------------------------
function parseSectors(content) {
  if (!content) return [];

  const sectors = [];
  const parts = content.split(/^### /m).filter(Boolean);

  for (const part of parts) {
    const lines = part.split("\n");
    const name = lines[0]?.trim() || "Unknown";

    const fields = {};
    for (const line of lines.slice(1)) {
      const match = line.match(/^-\s*\*\*(.+?)(?::\s*\*\*|\*\*:)\s*(.+)/);
      if (match) {
        fields[match[1].toLowerCase().trim()] = match[2].trim();
      }
    }

    if (Object.keys(fields).length > 0) {
      // Normalize impact level to just the keyword (SEVERE/HIGH/MODERATE/LOW/MINIMAL)
      const rawImpact = fields["impact level"] || "Unknown";
      const impactMatch = rawImpact.match(/\b(SEVERE|HIGH|MODERATE|LOW|MINIMAL)\b/i);
      const impactLevel = impactMatch ? impactMatch[1].toUpperCase() : rawImpact.split(/[\s(;,]/)[0] || "Unknown";

      sectors.push({
        name,
        impactLevel,
        disruption: fields["disruption"] || "",
        keyMetric: fields["key metric"] || "",
        trend: fields["trend"] || "Stable",
        details: fields["details"] || "",
      });
    }
  }

  return sectors;
}

// ---------------------------------------------------------------------------
// Inline markdown components for Details field (supports source links)
// ---------------------------------------------------------------------------
function DetailLink({ href, children }) {
  if (!href || !(href.startsWith("http://") || href.startsWith("https://"))) {
    return <span className="text-white/80">{children}</span>;
  }
  try {
    const parsed = new URL(href);
    if (parsed.username || parsed.password) return <span className="text-white/80">{children}</span>;
  } catch {
    return <span className="text-white/80">{children}</span>;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 underline underline-offset-2 text-[11px]">
      {children}
    </a>
  );
}

const detailMdComponents = {
  a: DetailLink,
  p: ({ children }) => <span>{children}</span>,
  strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
  img: () => null,
};

// ---------------------------------------------------------------------------
// SectorGrid component
// ---------------------------------------------------------------------------
export default function SectorGrid({ content, isStreaming }) {
  const sectors = useMemo(() => parseSectors(content), [content]);

  if (sectors.length === 0 && !isStreaming) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {sectors.map((sector, i) => {
        const config = getSectorConfig(sector.name);
        const Icon = config.icon;

        return (
          <div
            key={i}
            className={`${config.bg} ${config.border} border rounded-xl p-4 transition-all hover:border-zinc-500 overflow-hidden flex flex-col`}
            data-pdf-sector-card
          >
            {/* Header row: icon + name + impact badge */}
            <div className="flex items-start justify-between gap-2 mb-2 shrink-0" data-pdf-sector-header>
              <div className="flex items-center gap-2 min-w-0">
                <Icon className={`w-5 h-5 ${config.accent} shrink-0`} />
                <h3 className="text-sm font-bold text-zinc-100 truncate">{sector.name}</h3>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${getImpactColor(sector.impactLevel)}`}>
                {sector.impactLevel}
              </span>
            </div>

            {/* Body content — vertically centered in available space */}
            <div className="flex-1 flex flex-col justify-center" data-pdf-sector-body>
              {/* Disruption line */}
              {sector.disruption && (
                <p className="text-xs text-white mb-2 leading-relaxed">{sector.disruption}</p>
              )}

              {/* Key metric */}
              {sector.keyMetric && (
                <div className="mb-2 px-2 py-1.5 bg-zinc-900/60 border border-zinc-700/50 rounded-lg">
                  <p className="text-xs">
                    <span className="font-medium text-white">{sector.keyMetric}</span>
                  </p>
                </div>
              )}

              {/* Details — rendered as markdown to support source links */}
              {sector.details && (
                <div className="text-[11px] text-white/80 leading-relaxed mb-2 overflow-hidden">
                  <ReactMarkdown components={detailMdComponents} skipHtml>
                    {sector.details}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {/* Trend — pushed to bottom */}
            <div className="flex items-center justify-end shrink-0 pt-1" data-pdf-sector-footer>
              <TrendBadge trend={sector.trend} />
            </div>
          </div>
        );
      })}

      {/* Streaming placeholder */}
      {isStreaming && sectors.length > 0 && sectors.length < 10 && (
        <div className="border border-dashed border-zinc-700 rounded-xl p-4 flex items-center justify-center">
          <span className="text-xs text-zinc-500 animate-pulse">Loading more sectors...</span>
        </div>
      )}
    </div>
  );
}
