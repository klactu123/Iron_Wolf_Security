import { useMemo } from "react";
import {
  FileText,
  Link,
  Shield,
  AlertTriangle,
  Search,
  Eye,
  Flag,
  Mail,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const SECTION_META = {
  "Phishing Analysis Verdict": {
    icon: Shield,
    color: "border-blue-500",
    bg: "bg-blue-500/5",
  },
  "Red Flags Identified": {
    icon: Flag,
    color: "border-red-500",
    bg: "bg-red-500/5",
  },
  "Header Analysis": {
    icon: Mail,
    color: "border-purple-500",
    bg: "bg-purple-500/5",
  },
  "URL Analysis": {
    icon: Link,
    color: "border-orange-500",
    bg: "bg-orange-500/5",
  },
  "Social Engineering Tactics": {
    icon: Eye,
    color: "border-yellow-500",
    bg: "bg-yellow-500/5",
  },
  "Verdict & Recommended Actions": {
    icon: AlertTriangle,
    color: "border-cyan-500",
    bg: "bg-cyan-500/5",
  },
  "Recommended Actions": {
    icon: AlertTriangle,
    color: "border-cyan-500",
    bg: "bg-cyan-500/5",
  },
};

const markdownComponents = {
  p: ({ children }) => (
    <p className="text-base text-zinc-300 leading-relaxed mb-3">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="text-zinc-100 font-semibold">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="text-zinc-300 italic">{children}</em>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-zinc-200 mt-4 mb-2">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-base font-medium text-zinc-300 mt-3 mb-1">{children}</h4>
  ),
  ul: ({ children }) => (
    <ul className="space-y-1.5 mb-3 ml-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="space-y-1.5 mb-3 ml-1 list-decimal list-inside">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-base text-zinc-300 leading-relaxed flex items-start gap-2">
      <span className="text-zinc-600 mt-1.5 shrink-0">•</span>
      <span>{children}</span>
    </li>
  ),
  a: ({ href, children }) => {
    const safe = href && (href.startsWith("http://") || href.startsWith("https://"));
    if (!safe) return <span className="text-zinc-400">{children}</span>;
    // URLs in analysis output may be malicious (extracted from phishing emails).
    // Render as non-clickable text with a warning tooltip instead of live links.
    return (
      <span
        className="text-blue-400 underline underline-offset-2 cursor-help"
        title={`WARNING: This URL may be malicious — it was extracted from the analyzed email. URL: ${href}`}
      >
        {children}
      </span>
    );
  },
  code: ({ children, className }) => {
    if (className) {
      return (
        <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 mb-3 overflow-x-auto">
          <code className="text-xs text-zinc-300 font-mono">{children}</code>
        </pre>
      );
    }
    return (
      <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs text-zinc-200 font-mono">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <div className="mb-3">{children}</div>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-3 rounded-lg border border-zinc-700">
      <table className="w-full text-base">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-zinc-800/80">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 text-left text-xs font-semibold text-zinc-300 border-b border-zinc-700">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 text-xs text-zinc-400 border-b border-zinc-800">
      {children}
    </td>
  ),
  hr: () => <hr className="border-zinc-800 my-4" />,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-zinc-600 pl-3 my-3 text-zinc-400 italic">
      {children}
    </blockquote>
  ),
};

function parseSections(markdown) {
  const sections = [];
  const lines = markdown.split("\n");
  let currentTitle = null;
  let currentLevel = 0;
  let currentContent = [];

  for (const line of lines) {
    const headerMatch = line.match(/^(#{2,3})\s+(.+)$/);
    if (headerMatch) {
      if (currentTitle) {
        sections.push({
          title: currentTitle,
          level: currentLevel,
          content: currentContent.join("\n").trim(),
        });
      }
      currentLevel = headerMatch[1].length;
      currentTitle = headerMatch[2].trim();
      currentContent = [];
    } else if (currentTitle) {
      currentContent.push(line);
    }
  }

  if (currentTitle) {
    sections.push({
      title: currentTitle,
      level: currentLevel,
      content: currentContent.join("\n").trim(),
    });
  }

  return sections;
}

function getSectionMeta(title) {
  if (SECTION_META[title]) return SECTION_META[title];

  for (const [key, meta] of Object.entries(SECTION_META)) {
    if (title.includes(key) || key.includes(title)) return meta;
  }

  return { icon: FileText, color: "border-zinc-500", bg: "bg-zinc-500/5" };
}

export default function AnalysisResult({ markdown, isStreaming }) {
  const sections = useMemo(() => parseSections(markdown), [markdown]);

  if (sections.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <ReactMarkdown components={markdownComponents}>{markdown}</ReactMarkdown>
        {isStreaming && (
          <span className="inline-block w-0.5 h-4 bg-blue-400 animate-pulse ml-0.5 align-text-bottom" />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section, i) => {
        const meta = getSectionMeta(section.title);
        const Icon = meta.icon;
        const isLast = i === sections.length - 1;
        const isVerdict = section.title === "Phishing Analysis Verdict";

        if (isVerdict) {
          return (
            <div
              key={i}
              className="bg-gradient-to-br from-zinc-900 to-zinc-900/80 border border-zinc-800 rounded-xl p-6 print-section"
            >
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Shield size={22} />
                {section.title}
              </h2>
              <div>
                <ReactMarkdown components={markdownComponents}>
                  {section.content}
                </ReactMarkdown>
                {isStreaming && isLast && (
                  <span className="inline-block w-0.5 h-4 bg-blue-400 animate-pulse ml-0.5 align-text-bottom" />
                )}
              </div>
            </div>
          );
        }

        return (
          <div
            key={i}
            className={`border-l-4 ${meta.color} ${meta.bg} bg-zinc-900 border border-zinc-800 rounded-xl p-5 print-section`}
          >
            <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-100 mb-4">
              <Icon size={18} className="shrink-0" />
              {section.title}
            </h3>
            <div>
              <ReactMarkdown components={markdownComponents}>
                {section.content}
              </ReactMarkdown>
              {isStreaming && isLast && (
                <span className="inline-block w-0.5 h-4 bg-blue-400 animate-pulse ml-0.5 align-text-bottom" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
