import { useState, useEffect, useRef } from "react";
import { Shield, Power, AlertTriangle, CheckCircle, Loader2, Radio, ChevronDown, ChevronUp, Building2, FileDown, Clock, ArrowLeft, Calendar } from "lucide-react";
import BriefOutput from "./components/BriefOutput.jsx";
import SettingsModal from "./components/SettingsModal.jsx";
import ArchiveSidebar from "./components/ArchiveSidebar.jsx";
import { useThreatStream } from "./hooks/useThreatStream.js";
import { fetchHealth, shutdownServer, saveBrief, loadBrief } from "./utils/api.js";
import { downloadPdf } from "./utils/export.js";

export default function App() {
  const { state, markdown, statusText, error, analyze, reset, setMarkdownDirect } = useThreatStream();
  const [hasKey, setHasKey] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [focus, setFocus] = useState("");
  const [context, setContext] = useState("");
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [viewingArchive, setViewingArchive] = useState(null);
  const briefRef = useRef(null);
  const autoSavedRef = useRef(false);

  useEffect(() => {
    fetchHealth()
      .then((data) => setHasKey(data.hasClaudeKey ?? null))
      .catch(() => setHasKey(null));
  }, []);

  // Auto-save when brief completes
  useEffect(() => {
    if (state === "COMPLETE" && markdown && !autoSavedRef.current && !viewingArchive) {
      autoSavedRef.current = true;
      saveBrief(markdown, focus || null, context || null)
        .then(() => setSaved(true))
        .catch((err) => console.error("Auto-save failed:", err));
    }
    if (state === "IDLE") {
      autoSavedRef.current = false;
      setSaved(false);
    }
  }, [state, markdown, focus, context, viewingArchive]);

  function handleGenerate(timeframe = null) {
    setViewingArchive(null);
    analyze(focus.trim() || null, context.trim() || null, timeframe);
  }

  async function handlePdf() {
    if (!briefRef.current || generatingPdf) return;
    setGeneratingPdf(true);
    try {
      await downloadPdf(briefRef.current);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGeneratingPdf(false);
    }
  }

  async function handleShutdown() {
    try {
      await shutdownServer();
    } catch { /* server killed itself */ }
    setTimeout(() => { try { window.close(); } catch {} }, 500);
  }

  async function handleSelectArchive(filename) {
    try {
      const data = await loadBrief(filename);
      setViewingArchive(filename);
      setMarkdownDirect(data.markdown);
    } catch (err) {
      console.error("Failed to load brief:", err);
    }
  }

  function handleBackToHome() {
    setViewingArchive(null);
    reset();
  }

  const isStreaming = state === "STREAMING";
  const isComplete = state === "COMPLETE";
  const hasOutput = markdown.length > 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield size={28} className="text-blue-500" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">Iran Conflict Intelligence Brief</h1>
              <p className="text-xs text-zinc-500">Iron Wolf Interactive</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowArchive(!showArchive)}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                showArchive ? "bg-blue-600 text-white" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              }`}
            >
              <Clock size={14} />
              Archive
            </button>
            <SettingsModal onKeyChange={() => {
              fetchHealth()
                .then((data) => setHasKey(data.hasClaudeKey ?? null))
                .catch(() => setHasKey(null));
            }} />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* API key warning */}
          {hasKey === false && (
            <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-yellow-950/50 border border-yellow-800 rounded-xl print:hidden">
              <AlertTriangle size={18} className="text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-sm text-yellow-300">
                No API key configured. Set <code className="bg-zinc-800 px-1 rounded text-xs">ANTHROPIC_API_KEY</code> in
                your <code className="bg-zinc-800 px-1 rounded text-xs">.env</code> file, or use Settings to add your key.
              </p>
            </div>
          )}

          {/* Viewing archive indicator */}
          {viewingArchive && (
            <div className="mb-4 flex items-center gap-3 px-4 py-2 bg-blue-950/30 border border-blue-800/50 rounded-lg print:hidden">
              <Clock size={14} className="text-blue-400 shrink-0" />
              <span className="text-xs text-blue-300 flex-1">Viewing archived brief: {viewingArchive.replace("brief_", "").replace(".md", "").replace(/_/g, " ")}</span>
              <button
                onClick={handleBackToHome}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <ArrowLeft size={12} /> Back
              </button>
            </div>
          )}

          {/* Generate section — shown when no output and not viewing archive */}
          {!hasOutput && !isStreaming && !viewingArchive && (
            <div className="print:hidden mb-8">
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-950/30 border border-red-800/50 rounded-2xl mb-6">
                  <Radio size={36} className="text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-100 mb-3">
                  Iran Conflict Executive Brief
                </h2>
                <p className="text-sm text-zinc-400 max-w-lg mx-auto mb-2">
                  Generate a comprehensive, AI-researched intelligence brief on the current Iran conflict
                  and its impact on U.S. sectors — energy, retail, healthcare, telecom, financial services, and more.
                </p>
                <p className="text-xs text-zinc-500 max-w-lg mx-auto mb-2">
                  Includes a sector-by-sector impact dashboard, cyber threat assessment with recent attack intelligence,
                  and actionable recommendations for executive leadership.
                </p>
                <p className="text-xs text-zinc-600 max-w-lg mx-auto mb-8">
                  Sourced from Reuters, AP, Bloomberg, CISA, and other authoritative outlets with inline links.
                </p>

                {/* Optional focus/context */}
                <div className="max-w-md mx-auto mb-6">
                  <button
                    type="button"
                    onClick={() => setShowOptions(!showOptions)}
                    className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-300 transition-colors mx-auto mb-3"
                  >
                    <Building2 size={14} />
                    Customize Brief
                    {showOptions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    <span className="text-xs text-zinc-600 ml-1">(optional)</span>
                  </button>

                  {showOptions && (
                    <div className="space-y-3 text-left">
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">Focus Area</label>
                        <input
                          type="text"
                          value={focus}
                          onChange={(e) => setFocus(e.target.value)}
                          placeholder="e.g., healthcare supply chain, telecom infrastructure, energy hedging"
                          maxLength={500}
                          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">Organization Context</label>
                        <textarea
                          value={context}
                          onChange={(e) => setContext(e.target.value)}
                          placeholder="Describe your organization, industry, and key concerns for tailored recommendations..."
                          rows={3}
                          maxLength={2000}
                          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-y text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleGenerate()}
                  disabled={isStreaming}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-red-700 hover:bg-red-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-red-900/30"
                >
                  <Radio size={22} />
                  Generate Full Brief
                </button>

                {/* Quick timeframe buttons */}
                <div className="mt-4 flex items-center justify-center gap-3">
                  <span className="text-xs text-zinc-500 mr-1"><Calendar size={12} className="inline mb-0.5" /> Quick update:</span>
                  {[
                    { key: "today", label: "Today" },
                    { key: "yesterday", label: "Yesterday" },
                    { key: "3days", label: "Last 3 Days" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => handleGenerate(key)}
                      disabled={isStreaming}
                      className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-300 rounded-lg transition-colors border border-zinc-700 hover:border-zinc-600"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Status indicator */}
          {statusText && (
            <div className="mb-6 flex items-center justify-center gap-3 px-4 py-3 bg-blue-950/30 border border-blue-800/50 rounded-xl print:hidden">
              <Loader2 size={16} className="text-blue-400 animate-spin" />
              <span className="text-sm text-blue-300">{statusText}</span>
            </div>
          )}

          {/* Error display with retry */}
          {error && (
            <div className="mb-6 flex flex-col items-center text-center px-4 py-6 bg-red-950/50 border border-red-800 rounded-xl print:hidden">
              <AlertTriangle size={24} className="text-red-400 mb-2" />
              <p className="text-sm text-red-300 mb-4">{error}</p>
              <button
                onClick={() => { reset(); setTimeout(() => handleGenerate(), 100); }}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm bg-red-700 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
              >
                <Radio size={14} /> Try Again
              </button>
            </div>
          )}

          {/* Auto-save indicator */}
          {saved && !viewingArchive && (
            <div className="mb-4 flex items-center justify-center gap-2 text-xs text-green-400 print:hidden">
              <CheckCircle size={12} /> Brief auto-saved to archive
            </div>
          )}

          {/* Brief output */}
          <div ref={briefRef}>
            <BriefOutput markdown={markdown} isStreaming={isStreaming} isComplete={isComplete} />
          </div>

          {/* Action bar */}
          {hasOutput && (
            <div className="print:hidden mt-6 flex items-center justify-center gap-3 flex-wrap">
              {(isComplete || viewingArchive) && (
                <button
                  onClick={viewingArchive ? handleBackToHome : reset}
                  className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                >
                  {viewingArchive ? "Back" : "New Brief"}
                </button>
              )}
              {(isComplete || viewingArchive) && (
                <button
                  onClick={handlePdf}
                  disabled={generatingPdf}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-red-700 hover:bg-red-600 disabled:bg-red-900 disabled:text-red-400 text-white rounded-lg transition-colors"
                >
                  {generatingPdf ? (
                    <><Loader2 size={14} className="animate-spin" /> Generating PDF...</>
                  ) : (
                    <><FileDown size={14} /> Download PDF</>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-4 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <p className="text-xs text-zinc-600">
            Iron Wolf Interactive &bull; AI Security Toolkit &bull; Powered by Claude
          </p>
          <button
            onClick={handleShutdown}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-700 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <Power size={16} /> Shutdown
          </button>
        </div>
      </footer>

      {/* Archive sidebar — slides in from right */}
      {showArchive && (
        <ArchiveSidebar
          onClose={() => setShowArchive(false)}
          onSelect={handleSelectArchive}
          activeFilename={viewingArchive}
        />
      )}
    </div>
  );
}
