import { useState, useEffect } from "react";
import { Shield, Settings, Copy, Printer, Power, AlertTriangle, CheckCircle } from "lucide-react";
import IocInput from "./components/IocInput.jsx";
import BriefOutput from "./components/BriefOutput.jsx";
import SettingsModal from "./components/SettingsModal.jsx";
import { useThreatStream } from "./hooks/useThreatStream.js";
import { fetchHealth, shutdownServer } from "./utils/api.js";

export default function App() {
  const { state, markdown, statusText, error, analyze, reset } = useThreatStream();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hasKey, setHasKey] = useState(null);
  const [copied, setCopied] = useState(false);

  // Check API key status on mount
  useEffect(() => {
    fetchHealth()
      .then((data) => setHasKey(data.hasClaudeKey ?? null))
      .catch(() => setHasKey(null));
  }, [settingsOpen]);

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
    if (!window.confirm("Shut down the Threat Intel Brief server? This will close all connections.")) return;
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
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-amber-400" />
            <div>
              <h1 className="text-lg font-bold tracking-tight">Iron Wolf Threat Intel Brief</h1>
              <p className="text-xs text-zinc-500">IOC-to-Intelligence Brief Generator</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasOutput && (
              <>
                <button
                  onClick={handleCopy}
                  className="no-print flex items-center gap-1 px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                >
                  {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handlePrint}
                  className="no-print flex items-center gap-1 px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
              </>
            )}
            <button
              onClick={() => setSettingsOpen(true)}
              className="no-print flex items-center gap-1 px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
            >
              <Settings className="w-3.5 h-3.5" /> Settings
            </button>
            <button
              onClick={handleShutdown}
              className="no-print flex items-center gap-1 px-3 py-1.5 text-xs bg-zinc-800 hover:bg-red-900/50 text-zinc-400 hover:text-red-400 rounded-lg transition-colors"
              title="Shutdown server"
            >
              <Power className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* API key warning */}
      {hasKey === false && (
        <div className="bg-yellow-900/30 border-b border-yellow-700/30 px-6 py-2">
          <div className="max-w-5xl mx-auto flex items-center gap-2 text-sm text-yellow-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            No API key configured.
            <button onClick={() => setSettingsOpen(true)} className="underline hover:text-yellow-300">
              Add one in Settings
            </button>
            to enable analysis.
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Input section — hide when streaming/complete */}
          {!hasOutput && (
            <div className="no-print mb-8">
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
            <div className="no-print flex items-center gap-2 mb-4 text-sm text-amber-400">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              {statusText}
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-700/30 rounded-xl text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Brief output */}
          <BriefOutput markdown={markdown} isStreaming={isStreaming} isComplete={isComplete} />

          {/* New analysis button */}
          {isComplete && (
            <div className="no-print mt-6 flex justify-center">
              <button
                onClick={reset}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition-colors"
              >
                New Analysis
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="no-print bg-zinc-900 border-t border-zinc-800 px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-zinc-500">
          <span>Iron Wolf Interactive | AI Security Toolkit</span>
          <span>Threat Intel Brief Generator v1.0</span>
        </div>
      </footer>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
