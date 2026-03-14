import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import {
  FileText, Shield, Flame, ShoppingCart, TrendingUp, Wifi, CheckSquare, Globe,
  LayoutGrid, BookOpen, AlertOctagon,
  ChevronDown, ChevronRight
} from "lucide-react";
import { useState } from "react";
import SectorGrid from "./SectorGrid.jsx";

// ---------------------------------------------------------------------------
// Section metadata — mapped to the 8-section executive brief format
// ---------------------------------------------------------------------------
const SECTION_META = {
  "executive summary": { icon: FileText, color: "border-l-red-500", css: "section-executive", accent: "text-red-400" },
  "situation update": { icon: Globe, color: "border-l-orange-500", css: "section-situation", accent: "text-orange-400" },
  "sector impact": { icon: LayoutGrid, color: "border-l-amber-500", css: "section-sectors", accent: "text-amber-400", isGrid: true },
  "energy deep": { icon: Flame, color: "border-l-amber-500", css: "section-energy", accent: "text-amber-400" },
  "energy": { icon: Flame, color: "border-l-amber-500", css: "section-energy", accent: "text-amber-400" },
  "gas": { icon: Flame, color: "border-l-amber-500", css: "section-energy", accent: "text-amber-400" },
  "retail": { icon: ShoppingCart, color: "border-l-purple-500", css: "section-retail", accent: "text-purple-400" },
  "consumer": { icon: ShoppingCart, color: "border-l-purple-500", css: "section-retail", accent: "text-purple-400" },
  "economic": { icon: TrendingUp, color: "border-l-blue-500", css: "section-economic", accent: "text-blue-400" },
  "market": { icon: TrendingUp, color: "border-l-blue-500", css: "section-economic", accent: "text-blue-400" },
  "cyber": { icon: Wifi, color: "border-l-cyan-500", css: "section-cyber", accent: "text-cyan-400" },
  "domestic": { icon: AlertOctagon, color: "border-l-red-600", css: "section-domestic", accent: "text-red-400" },
  "extremism": { icon: AlertOctagon, color: "border-l-red-600", css: "section-domestic", accent: "text-red-400" },
  "terror": { icon: AlertOctagon, color: "border-l-red-600", css: "section-domestic", accent: "text-red-400" },
  "recommended": { icon: CheckSquare, color: "border-l-green-500", css: "section-actions", accent: "text-green-400" },
  "actions": { icon: CheckSquare, color: "border-l-green-500", css: "section-actions", accent: "text-green-400" },
  "sources": { icon: BookOpen, color: "border-l-zinc-500", css: "section-sources", accent: "text-zinc-400" },
  "confidence": { icon: BookOpen, color: "border-l-zinc-500", css: "section-sources", accent: "text-zinc-400" },
};

function getSectionMeta(title) {
  const lower = title.toLowerCase();
  for (const [key, meta] of Object.entries(SECTION_META)) {
    if (lower.includes(key)) return meta;
  }
  return { icon: FileText, color: "border-l-zinc-500", css: "", accent: "text-zinc-400" };
}

function isSectorSection(title, content) {
  const lower = title.toLowerCase();
  // Match by title
  if (lower.includes("sector")) return true;
  // Fallback: detect sector grid content pattern (### heading + **Impact Level**)
  if (content && /^### .+\n.*\*\*Impact Level/m.test(content)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Safe link renderer — renders source links with visual treatment
// ---------------------------------------------------------------------------
function SafeLink({ href, children }) {
  const isAbsoluteSafe = href && (href.startsWith("http://") || href.startsWith("https://"));
  if (!isAbsoluteSafe) return <span className="text-zinc-400">{children}</span>;
  try {
    const parsed = new URL(href);
    if (parsed.username || parsed.password) return <span className="text-zinc-400">{children}</span>;
  } catch {
    return <span className="text-zinc-400">{children}</span>;
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-amber-400 hover:text-amber-300 underline underline-offset-2 decoration-amber-400/40 hover:decoration-amber-300/60 transition-colors"
    >
      {children}
    </a>
  );
}

// ---------------------------------------------------------------------------
// Markdown components
// ---------------------------------------------------------------------------
const mdComponents = {
  a: SafeLink,
  img: ({ alt }) => <span className="text-zinc-400">[Image: {alt || "removed"}]</span>,
  h3: ({ children }) => <h3 className="text-base font-semibold text-zinc-100 mt-4 mb-2">{children}</h3>,
  h4: ({ children }) => <h4 className="text-sm font-semibold text-zinc-200 mt-3 mb-1">{children}</h4>,
  p: ({ children }) => <p className="text-sm text-white mb-2 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="list-disc list-outside pl-5 text-sm text-white mb-2 space-y-1.5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-outside pl-5 text-sm text-white mb-2 space-y-1.5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,
  strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
  code: ({ children, className }) => {
    if (className) {
      return <pre className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-xs text-white overflow-x-auto my-2"><code>{children}</code></pre>;
    }
    return <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-amber-400 text-xs">{children}</code>;
  },
  pre: ({ children }) => <>{children}</>,
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="w-full text-sm border-collapse border border-zinc-700">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-left text-zinc-200 font-medium">{children}</th>,
  td: ({ children }) => <td className="border border-zinc-700 px-3 py-1.5 text-white">{children}</td>,
  blockquote: ({ children }) => <blockquote className="border-l-2 border-amber-500 pl-3 my-2 text-white/80 italic">{children}</blockquote>,
};

// ---------------------------------------------------------------------------
// Table of contents
// ---------------------------------------------------------------------------
function TableOfContents({ sections }) {
  const [open, setOpen] = useState(true);

  if (sections.length === 0) return null;

  return (
    <div className="mb-6 bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 print:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors w-full"
      >
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        Table of Contents
      </button>
      {open && (
        <nav className="mt-3 space-y-1">
          {sections.map((s, i) => {
            const meta = getSectionMeta(s.title);
            const Icon = meta.icon;
            return (
              <a
                key={i}
                href={`#section-${i}`}
                className={`flex items-center gap-2 text-sm ${meta.accent} hover:text-zinc-100 transition-colors py-0.5`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {s.title}
              </a>
            );
          })}
        </nav>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Document header
// ---------------------------------------------------------------------------
function DocumentHeader({ isComplete }) {
  return (
    <div className="doc-header mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-red-900/40 to-zinc-900 border border-red-600/20 p-6">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="w-8 h-8 text-red-400" />
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Iran Conflict Executive Intelligence Brief</h1>
          <p className="text-sm text-zinc-400">
            Iron Wolf Security | Generated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            {!isComplete && <span className="ml-2 text-red-400 animate-pulse">Generating...</span>}
          </p>
        </div>
      </div>
      <p className="text-xs text-zinc-500 mt-2">
        CLASSIFICATION: TLP:AMBER — Limited distribution. Recipients may share within their organization only.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main BriefOutput component
// ---------------------------------------------------------------------------
export default function BriefOutput({ markdown, isStreaming, isComplete }) {
  const sections = useMemo(() => {
    if (!markdown) return [];
    // Strip any preamble text before the first ## heading
    const firstH2 = markdown.indexOf("## ");
    const cleaned = firstH2 > 0 ? markdown.slice(firstH2) : markdown;
    const parts = cleaned.split(/^## /m).filter(Boolean);
    return parts.map((part) => {
      const newlineIdx = part.indexOf("\n");
      const title = newlineIdx > -1 ? part.slice(0, newlineIdx).trim() : part.trim();
      const content = newlineIdx > -1 ? part.slice(newlineIdx + 1).trim() : "";
      return { title: title.replace(/^\d+\.\s*/, ""), content };
    });
  }, [markdown]);

  if (!markdown) return null;

  return (
    <div className="brief-output space-y-4">
      <DocumentHeader isComplete={isComplete} />
      <TableOfContents sections={sections} />

      {sections.map((section, i) => {
        const meta = getSectionMeta(section.title);
        const Icon = meta.icon;
        const isSector = isSectorSection(section.title, section.content);

        return (
          <div
            key={i}
            id={`section-${i}`}
            className={`section-card ${meta.css} border-l-4 ${meta.color} bg-zinc-800/50 border border-zinc-700 rounded-r-xl p-5`}
          >
            <h2 className={`flex items-center gap-2 text-base font-bold ${meta.accent} mb-3`}>
              <Icon className="w-5 h-5" />
              {section.title.slice(0, 100)}
            </h2>

            {isSector ? (
              /* Render sector impact as visual grid */
              <SectorGrid content={section.content} isStreaming={isStreaming} />
            ) : (
              /* Render normal markdown */
              <div className="prose-sm">
                <ReactMarkdown components={mdComponents} skipHtml>
                  {section.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        );
      })}

      {/* Streaming cursor */}
      {isStreaming && (
        <div className="flex items-center gap-2 text-sm text-red-400 animate-pulse px-2">
          <div className="w-2 h-4 bg-red-400 rounded-sm animate-pulse" />
          Generating brief...
        </div>
      )}
    </div>
  );
}
