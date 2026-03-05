import { useState, useEffect } from "react";
import {
  FileText,
  Search,
  AlertTriangle,
  Loader2,
  Power,
  RotateCcw,
  Copy,
  Check,
  Printer,
} from "lucide-react";
import SettingsModal from "./components/SettingsModal";
import PolicyForm from "./components/PolicyForm";
import PolicyOutput from "./components/PolicyOutput";
import usePolicyStream from "./hooks/usePolicyStream";
import { healthCheck } from "./utils/api";

export default function App() {
  const [hasClaudeKey, setHasClaudeKey] = useState(undefined);
  const [isShutdown, setIsShutdown] = useState(false);
  const [activeMode, setActiveMode] = useState("generate");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    healthCheck().then((data) => {
      if (data) {
        setHasClaudeKey(data.hasClaudeKey);
      }
    });
  }, []);

  const {
    stage,
    error,
    output,
    isStreaming,
    statusText,
    mode,
    handleGenerate,
    handleReview,
    handleReset,
    STATES,
  } = usePolicyStream();

  const onNewTask = () => {
    handleReset();
    setCopied(false);
  };

  const onCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  const hasOutput = output !== null && output !== "";
  const isIdle = stage === STATES.IDLE;
  const isComplete = stage === STATES.COMPLETE;

  if (isShutdown) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-400 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-2">Policy Generator has been shut down.</p>
          <p className="text-sm">You can close this tab.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText size={28} className="text-blue-500" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Security Policy Generator
              </h1>
              <p className="text-xs text-zinc-500">
                Iron Wolf Interactive
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SettingsModal />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 w-full flex-1">
        {hasClaudeKey === false && (
          <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-yellow-950/50 border border-yellow-800 rounded-xl print:hidden">
            <AlertTriangle size={18} className="text-yellow-400 mt-0.5 shrink-0" />
            <p className="text-sm text-yellow-300">
              Claude API key not configured. Set <code className="bg-zinc-800 px-1 rounded text-xs">ANTHROPIC_API_KEY</code> in your <code className="bg-zinc-800 px-1 rounded text-xs">.env</code> file or use Settings to add your key.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-red-950/50 border border-red-800 rounded-xl print:hidden">
            <AlertTriangle size={18} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Mode Toggle & Form — show when idle */}
        {isIdle && (
          <div className="mb-6 print:hidden">
            {/* Mode tabs */}
            <div className="flex mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
              <button
                onClick={() => setActiveMode("generate")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeMode === "generate"
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <FileText size={16} />
                Generate Policy
              </button>
              <button
                onClick={() => setActiveMode("review")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeMode === "review"
                    ? "bg-purple-600 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Search size={16} />
                Review Policy
              </button>
            </div>

            <PolicyForm
              mode={activeMode}
              onGenerate={handleGenerate}
              onReview={handleReview}
              loading={false}
            />
          </div>
        )}

        {/* Action bar — show after streaming starts */}
        {!isIdle && (
          <div className="mb-6 flex items-center gap-2 print:hidden">
            <button
              onClick={onNewTask}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
            >
              <RotateCcw size={16} />
              Start Over
            </button>
            {hasOutput && (
              <>
                <button
                  onClick={onCopy}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                >
                  {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
                {isComplete && (
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                  >
                    <Printer size={16} />
                    Print
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Status indicator while researching */}
        {isStreaming && statusText && !hasOutput && (
          <div className="mb-6 flex items-center justify-center gap-3 px-4 py-3 bg-blue-950/30 border border-blue-800/50 rounded-xl">
            <Loader2 size={16} className="text-blue-400 animate-spin" />
            <p className="text-sm text-blue-300">{statusText}</p>
          </div>
        )}

        {/* Output */}
        {hasOutput && (
          <div className="mb-6">
            <div className="hidden print:block mb-4">
              <h1 className="text-2xl font-bold">
                {mode === "review" ? "Policy Review Report" : "Security Policy Document"}
              </h1>
              <p className="text-sm text-zinc-500">Generated by Iron Wolf Policy Generator</p>
            </div>
            <PolicyOutput markdown={output} isStreaming={isStreaming} mode={mode} />
          </div>
        )}

        {/* Idle state placeholder */}
        {isIdle && !error && (
          <div className="text-center py-16 text-zinc-600">
            <FileText size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">Security Policy Generator & Reviewer</p>
            <p className="text-sm mt-1">
              {activeMode === "generate"
                ? "Select a framework and policy type above to generate a professional, framework-aligned security policy"
                : "Paste an existing policy above to review it for gaps and compliance issues against your chosen framework"}
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-4 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-xs text-zinc-600">
            Iron Wolf Interactive &bull; AI Security Toolkit &bull; Powered by Claude
          </div>
          <button
            onClick={() => {
              if (!window.confirm("Are you sure you want to shut down the Policy Generator server?")) return;
              fetch("/api/shutdown", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ confirm: true }),
              })
                .then(() => {
                  document.title = "Policy Generator — Stopped";
                  setIsShutdown(true);
                })
                .catch(() => {});
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-700 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <Power size={16} />
            Shutdown
          </button>
        </div>
      </footer>
    </div>
  );
}
