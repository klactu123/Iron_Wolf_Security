import { useState, useEffect, useRef } from "react";
import {
  Shield,
  AlertTriangle,
  Loader2,
  Power,
  RotateCcw,
} from "lucide-react";
import SettingsModal from "./components/SettingsModal";
import EmailInput from "./components/EmailInput";
import EmailPreview from "./components/EmailPreview";
import ConfidenceBadge from "./components/ConfidenceBadge";
import AnalysisResult from "./components/AnalysisResult";
import usePhishingAnalysis from "./hooks/usePhishingAnalysis";
import { healthCheck } from "./utils/api";

export default function App() {
  const [hasClaudeKey, setHasClaudeKey] = useState(undefined);
  const [isShutdown, setIsShutdown] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState(null);

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
    analysis,
    isStreaming,
    statusText,
    handleAnalyze,
    handleReset,
    STATES,
  } = usePhishingAnalysis();

  const analysisRef = useRef(null);

  const onAnalyze = (emailContent) => {
    setSubmittedEmail(emailContent);
    handleAnalyze(emailContent);
  };

  const onNewAnalysis = () => {
    setSubmittedEmail(null);
    handleReset();
  };

  const isAnalyzing = stage === STATES.ANALYZING;
  const isComplete = stage === STATES.COMPLETE;
  const hasAnalysis = analysis !== null && analysis !== "";

  if (isShutdown) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-400 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-2">Phishing Analyzer has been shut down.</p>
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
            <Shield size={28} className="text-blue-500" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                AI Phishing Email Analyzer
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

        {/* Email Input — show when idle or on error */}
        {stage === STATES.IDLE && (
          <div className="mb-6 print:hidden">
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Paste a suspicious email below to analyze it for phishing indicators
            </label>
            <EmailInput onAnalyze={onAnalyze} loading={false} />
          </div>
        )}

        {/* New Analysis button — show after analysis starts */}
        {stage !== STATES.IDLE && (
          <div className="mb-6 print:hidden">
            <button
              onClick={onNewAnalysis}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
            >
              <RotateCcw size={16} />
              Analyze Another Email
            </button>
          </div>
        )}

        {/* Email Preview */}
        {submittedEmail && (
          <div className="mb-6">
            <EmailPreview email={submittedEmail} />
          </div>
        )}

        {/* Status indicator while researching */}
        {isStreaming && statusText && !hasAnalysis && (
          <div className="mb-6 flex items-center justify-center gap-3 px-4 py-3 bg-blue-950/30 border border-blue-800/50 rounded-xl">
            <Loader2 size={16} className="text-blue-400 animate-spin" />
            <p className="text-sm text-blue-300">{statusText}</p>
          </div>
        )}

        {/* Confidence badges */}
        {hasAnalysis && (
          <div className="mb-6">
            <ConfidenceBadge analysis={analysis} />
          </div>
        )}

        {/* Analysis Result */}
        {hasAnalysis && (
          <div className="mb-6" ref={analysisRef}>
            <div className="hidden print:block mb-4">
              <h1 className="text-2xl font-bold">Phishing Email Analysis</h1>
              <p className="text-sm text-zinc-500">Generated by Iron Wolf Phishing Analyzer</p>
            </div>
            <AnalysisResult markdown={analysis} isStreaming={isStreaming} />
          </div>
        )}

        {/* Idle state */}
        {stage === STATES.IDLE && !error && (
          <div className="text-center py-16 text-zinc-600">
            <Shield size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">AI Phishing Email Analyzer</p>
            <p className="text-sm mt-1">
              Paste a suspicious email above to get an AI-powered analysis
              with confidence scoring and red-flag identification
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
              if (!window.confirm("Are you sure you want to shut down the Phishing Analyzer server?")) return;
              fetch("/api/shutdown", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ confirm: true }),
              })
                .then(() => {
                  document.title = "Phishing Analyzer — Stopped";
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
