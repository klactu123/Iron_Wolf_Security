import { useState, useEffect } from "react";
import { Shield, Settings, Cpu, Copy, Printer, Power, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import IocInput from "./components/IocInput.jsx";
import BriefOutput from "./components/BriefOutput.jsx";
import SettingsModal from "./components/SettingsModal.jsx";
import { useThreatStream } from "./hooks/useThreatStream.js";
import { fetchHealth, shutdownServer } from "./utils/api.js";

export default function App() {
  const { state, markdown, statusText, error, analyze, reset } = useThreatStream();
  const [hasKey, setHasKey] = useState(null);
  const [copied, setCopied] = useState(false);

  // Check API key status on mount
  useEffect(() => {
    fetchHealth()
      .then((data) => setHasKey(data.hasClaudeKey ?? null))
      .catch(() => setHasKey(null));
  }, []);

  function handleAnalyze(iocs, context) {
    analyze(iocs, context);
  }

  async function handleCopy() {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  }

  function handlePrint() {
    window.print();
  }

  async function handleShutdown() {
    try {
      await shutdownServer();
    } catch { /* server killed itself */ }
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
              <h1 className="text-xl font-bold tracking-tight">Iron Wolf Threat Intel Brief</h1>
              <p className="text-xs text-zinc-500">IOC-to-Intelligence Brief Generator</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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

          {/* Input section — hide when streaming/complete */}
          {!hasOutput && (
            <div className="print:hidden mb-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-zinc-100 mb-1">Generate Threat Intelligence Brief</h2>
                <p className="text-sm text-zinc-400">
                  Paste indicators of compromise below. The AI analyst will research each IOC using live threat intelligence
                  sources and generate a structured brief with attribution, TTPs, risk assessment, and recommended actions.
                </p>
              </div>
              <IocInput onAnalyze={handleAnalyze} isStreaming={isStreaming} />
            </div>
          )}

          {/* Status indicator */}
          {statusText && (
            <div className="mb-6 flex items-center justify-center gap-3 px-4 py-3 bg-blue-950/30 border border-blue-800/50 rounded-xl print:hidden">
              <Loader2 size={16} className="text-blue-400 animate-spin" />
              <span className="text-sm text-blue-300">{statusText}</span>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-red-950/50 border border-red-800 rounded-xl print:hidden">
              <AlertTriangle size={18} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Brief output */}
          <BriefOutput markdown={markdown} isStreaming={isStreaming} isComplete={isComplete} />

          {/* Action bar */}
          {hasOutput && (
            <div className="print:hidden mt-6 flex items-center justify-center gap-3">
              {isComplete && (
                <button
                  onClick={reset}
                  className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                >
                  Start Over
                </button>
              )}
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
              >
                {copied ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
              >
                <Printer size={14} /> Print
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-4 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} Iron Wolf Interactive &middot; AI Security Toolkit
          </p>
          <button
            onClick={handleShutdown}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-green-900/30 hover:bg-red-900/50 text-green-500 hover:text-red-400 border border-green-800/50 hover:border-red-800/50 transition-colors"
          >
            <Power size={16} /> Shutdown
          </button>
        </div>
      </footer>
    </div>
  );
}
