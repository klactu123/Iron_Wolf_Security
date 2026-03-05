import { useMemo, useState } from "react";
import {
  FileText,
  Target,
  Users,
  Scale,
  BookOpen,
  ClipboardList,
  Shield,
  CheckSquare,
  AlertTriangle,
  BarChart3,
  ListChecks,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  List,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const SECTION_META = {
  "Purpose": { icon: Target, color: "border-blue-500", accent: "text-blue-400" },
  "Scope": { icon: Users, color: "border-cyan-500", accent: "text-cyan-400" },
  "Definitions": { icon: BookOpen, color: "border-indigo-500", accent: "text-indigo-400" },
  "Policy Statements": { icon: Scale, color: "border-green-500", accent: "text-green-400" },
  "Roles & Responsibilities": { icon: Users, color: "border-purple-500", accent: "text-purple-400" },
  "Compliance & Enforcement": { icon: Shield, color: "border-red-500", accent: "text-red-400" },
  "Related Policies & References": { icon: BookOpen, color: "border-orange-500", accent: "text-orange-400" },
  "Document Control": { icon: ClipboardList, color: "border-zinc-500", accent: "text-zinc-400" },
  // Review mode sections
  "Policy Review Summary": { icon: BarChart3, color: "border-blue-500", accent: "text-blue-400" },
  "Strengths": { icon: CheckSquare, color: "border-green-500", accent: "text-green-400" },
  "Gaps & Missing Requirements": { icon: AlertTriangle, color: "border-red-500", accent: "text-red-400" },
  "Language & Enforceability Issues": { icon: MessageSquare, color: "border-yellow-500", accent: "text-yellow-400" },
  "Framework Compliance Mapping": { icon: ListChecks, color: "border-purple-500", accent: "text-purple-400" },
  "Recommended Additions": { icon: Target, color: "border-cyan-500", accent: "text-cyan-400" },
  "Overall Assessment": { icon: BarChart3, color: "border-indigo-500", accent: "text-indigo-400" },
};

const markdownComponents = {
  p: ({ children }) => (
    <p className="text-sm text-zinc-300 leading-relaxed mb-3">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="text-zinc-100 font-semibold">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="text-zinc-300 italic">{children}</em>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-zinc-200 mt-5 mb-2 pb-1 border-b border-zinc-800">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-sm font-medium text-zinc-300 mt-4 mb-1.5">{children}</h4>
  ),
  ul: ({ children }) => (
    <ul className="space-y-1 mb-3 ml-4">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="space-y-1 mb-3 ml-4 list-decimal list-outside pl-1">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-sm text-zinc-300 leading-relaxed pl-1">{children}</li>
  ),
  a: ({ href, children }) => {
    const isAbsoluteSafe = href && (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:"));
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
        className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
      >
        {children}
      </a>
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
      <table className="w-full text-sm">{children}</table>
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
  let preambleContent = [];
  let hasPreamble = false;

  for (const line of lines) {
    const headerMatch = line.match(/^(#{2,3})\s+(.+)$/);
    if (headerMatch) {
      if (currentTitle) {
        sections.push({
          title: currentTitle,
          level: currentLevel,
          content: currentContent.join("\n").trim(),
        });
      } else if (preambleContent.length > 0) {
        hasPreamble = true;
        sections.push({
          title: "__preamble__",
          level: 2,
          content: preambleContent.join("\n").trim(),
        });
      }
      currentLevel = headerMatch[1].length;
      currentTitle = headerMatch[2].trim();
      currentContent = [];
    } else if (currentTitle) {
      currentContent.push(line);
    } else {
      preambleContent.push(line);
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

function extractDocMeta(sections) {
  // Try to extract policy name and metadata from the first section
  const first = sections[0];
  if (!first) return null;

  const title = first.title === "__preamble__" ? null : first.title;
  const content = first.content || "";

  // Extract metadata lines like **Version:** 1.0 | **Effective Date:** ...
  const metaLines = [];
  const contentLines = content.split("\n");
  for (const line of contentLines) {
    if (line.match(/\*\*(Version|Effective Date|Review Cycle|Framework|Classification|Overall Rating|Gaps Found).*?\*\*/)) {
      metaLines.push(line);
    }
  }

  return { title, metaLines };
}

function getSectionId(title, index) {
  return `section-${index}-${title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}`;
}

function getSectionMeta(title) {
  if (SECTION_META[title]) return SECTION_META[title];
  for (const [key, meta] of Object.entries(SECTION_META)) {
    if (title.includes(key) || key.includes(title)) return meta;
  }
  return { icon: FileText, color: "border-zinc-500", accent: "text-zinc-400" };
}

function TableOfContents({ sections, isReview }) {
  const [isOpen, setIsOpen] = useState(true);

  const tocSections = sections.filter(s => s.title !== "__preamble__");
  if (tocSections.length < 3) return null;

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl mb-6 overflow-hidden print-toc">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-5 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-800/50 transition-colors"
      >
        <List size={16} className="text-blue-400" />
        Table of Contents
        <span className="ml-auto text-zinc-500">
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>
      {isOpen && (
        <nav className="px-5 pb-4">
          <ol className="space-y-0.5">
            {tocSections.map((section, i) => {
              const meta = getSectionMeta(section.title);
              const sectionIndex = sections.indexOf(section);
              const isSubsection = section.level === 3;
              return (
                <li key={i}>
                  <a
                    href={`#${getSectionId(section.title, sectionIndex)}`}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-zinc-800/60 transition-colors ${
                      isSubsection ? "ml-6 text-zinc-500 hover:text-zinc-300" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(getSectionId(section.title, sectionIndex))?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    <span className={`${meta.accent} shrink-0`}>
                      {!isSubsection && <meta.icon size={14} />}
                    </span>
                    <span>{section.title}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
      )}
    </div>
  );
}

function DocumentHeader({ sections, mode }) {
  const meta = extractDocMeta(sections);
  if (!meta) return null;

  const isReview = mode === "review";

  return (
    <div className={`relative overflow-hidden rounded-xl mb-6 border print-section ${
      isReview
        ? "bg-gradient-to-br from-purple-950/40 via-zinc-900 to-zinc-900 border-purple-800/40"
        : "bg-gradient-to-br from-blue-950/40 via-zinc-900 to-zinc-900 border-blue-800/40"
    }`}>
      {/* Decorative accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${isReview ? "bg-purple-500" : "bg-blue-500"}`} />

      <div className="px-6 py-5">
        {/* Document title */}
        {meta.title && (
          <h2 className="text-xl font-bold text-white mb-3 tracking-tight">
            {meta.title}
          </h2>
        )}

        {/* Metadata badges */}
        {meta.metaLines.length > 0 && (
          <div className="space-y-1.5">
            {meta.metaLines.map((line, i) => (
              <div key={i} className="text-sm text-zinc-400">
                <ReactMarkdown components={{
                  p: ({ children }) => <p className="text-sm text-zinc-400 leading-relaxed flex flex-wrap gap-x-3">{children}</p>,
                  strong: ({ children }) => <strong className="text-zinc-300 font-medium">{children}</strong>,
                }} skipHtml>
                  {line}
                </ReactMarkdown>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PolicyOutput({ markdown, isStreaming, mode }) {
  const sections = useMemo(() => parseSections(markdown), [markdown]);

  if (sections.length === 0) {
    return (
      <div className="policy-document bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <ReactMarkdown components={markdownComponents} skipHtml>{markdown}</ReactMarkdown>
        {isStreaming && (
          <span className="inline-block w-0.5 h-4 bg-blue-400 animate-pulse ml-0.5 align-text-bottom" />
        )}
      </div>
    );
  }

  const isReview = mode === "review";
  const isComplete = !isStreaming;

  return (
    <div className="policy-document">
      {/* Document header */}
      <DocumentHeader sections={sections} mode={mode} />

      {/* Table of contents — only show when streaming is complete and we have enough sections */}
      {isComplete && sections.length >= 3 && (
        <TableOfContents sections={sections} isReview={isReview} />
      )}

      {/* Document body */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {sections.map((section, i) => {
          const isLast = i === sections.length - 1;

          // Preamble content (before first heading)
          if (section.title === "__preamble__") {
            if (!section.content) return null;
            return (
              <div key={i} className="px-6 py-4 border-b border-zinc-800/60">
                <ReactMarkdown components={markdownComponents} skipHtml>
                  {section.content}
                </ReactMarkdown>
              </div>
            );
          }

          // Skip the first h2 section title if it's already in the document header
          const isFirstH2 = section.level === 2 && i === (sections[0]?.title === "__preamble__" ? 1 : 0);
          const meta = getSectionMeta(section.title);
          const Icon = meta.icon;
          const sectionId = getSectionId(section.title, i);

          if (isFirstH2) {
            // First section — content only (title is in DocumentHeader)
            const contentWithoutMeta = section.content
              .split("\n")
              .filter(line => !line.match(/\*\*(Version|Effective Date|Review Cycle|Framework|Classification|Overall Rating|Gaps Found).*?\*\*/))
              .join("\n")
              .trim();

            if (!contentWithoutMeta) return null;

            return (
              <div key={i} id={sectionId} className="px-6 py-4 border-b border-zinc-800/60 print-section">
                <ReactMarkdown components={markdownComponents} skipHtml>
                  {contentWithoutMeta}
                </ReactMarkdown>
                {isStreaming && isLast && (
                  <span className="inline-block w-0.5 h-4 bg-blue-400 animate-pulse ml-0.5 align-text-bottom" />
                )}
              </div>
            );
          }

          // Regular sections
          return (
            <div
              key={i}
              id={sectionId}
              className={`px-6 py-5 print-section ${i < sections.length - 1 ? "border-b border-zinc-800/60" : ""}`}
            >
              {/* Section heading */}
              <div className={`flex items-center gap-2.5 mb-4 pb-2 border-b-2 ${meta.color}`}>
                <Icon size={18} className={`${meta.accent} shrink-0`} />
                <h3 className="text-base font-bold text-zinc-100 tracking-tight">
                  {section.title}
                </h3>
              </div>

              {/* Section content */}
              <div className="pl-1">
                <ReactMarkdown components={markdownComponents} skipHtml>
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
    </div>
  );
}
