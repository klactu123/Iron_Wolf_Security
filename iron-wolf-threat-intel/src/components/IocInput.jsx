import { useState, useMemo } from "react";
import { Search, RotateCcw, ChevronDown, ChevronUp, Building2 } from "lucide-react";
import { parseIocs, getIocTypeColor } from "../utils/iocParser.js";

const SAMPLE_IOCS = `185.220.101.34
44.206.187.144
evil-login-portal.com
https://phishing-kit.example.com/harvest.php
e99a18c428cb38d5f260853678922e03
6a5c7a5b36e9f1d0f89ef7b1f1a9b2cde4567890
a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
bad-actor@malware-domain.ru
CVE-2024-3400`;

export default function IocInput({ onAnalyze, isStreaming }) {
  const [iocs, setIocs] = useState("");
  const [context, setContext] = useState("");
  const [showContext, setShowContext] = useState(false);
  const parsedIocs = useMemo(() => parseIocs(iocs), [iocs]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!iocs.trim() || isStreaming) return;
    onAnalyze(iocs.trim(), context.trim());
  }

  function loadSample() {
    setIocs(SAMPLE_IOCS);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* IOC textarea */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-zinc-300">
            Indicators of Compromise
          </label>
          <button
            type="button"
            onClick={loadSample}
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            Load sample IOCs
          </button>
        </div>
        <textarea
          value={iocs}
          onChange={(e) => setIocs(e.target.value)}
          placeholder={"Paste IOCs here — one per line or comma-separated.\n\nSupported types: IP addresses, domains, URLs, file hashes (MD5/SHA-1/SHA-256), email addresses, CVE IDs"}
          rows={8}
          maxLength={100000}
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-y font-mono text-sm leading-relaxed"
        />
      </div>

      {/* Parsed IOC preview */}
      {parsedIocs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-zinc-500 self-center">
            {parsedIocs.length} IOC{parsedIocs.length !== 1 ? "s" : ""} detected:
          </span>
          {parsedIocs.slice(0, 20).map((ioc, i) => (
            <span
              key={i}
              className={`text-xs px-2 py-0.5 rounded-full border ${getIocTypeColor(ioc.type)}`}
            >
              {ioc.type}
            </span>
          ))}
          {parsedIocs.length > 20 && (
            <span className="text-xs text-zinc-500 self-center">
              +{parsedIocs.length - 20} more
            </span>
          )}
        </div>
      )}

      {/* Optional org context */}
      <div>
        <button
          type="button"
          onClick={() => setShowContext(!showContext)}
          className="flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
        >
          <Building2 className="w-4 h-4" />
          Organization Context
          {showContext ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          <span className="text-xs text-zinc-600 ml-1">(optional)</span>
        </button>
        {showContext && (
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Describe your organization, industry, and environment to get tailored risk assessment and recommendations..."
            rows={3}
            maxLength={5000}
            className="mt-2 w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-y text-sm"
          />
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!iocs.trim() || isStreaming}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-xl font-semibold transition-colors"
        >
          <Search className="w-5 h-5" />
          {isStreaming ? "Analyzing..." : "Generate Intel Brief"}
        </button>
        {iocs.trim() && !isStreaming && (
          <button
            type="button"
            onClick={() => { setIocs(""); setContext(""); }}
            className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors"
            title="Clear"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
      </div>
    </form>
  );
}
