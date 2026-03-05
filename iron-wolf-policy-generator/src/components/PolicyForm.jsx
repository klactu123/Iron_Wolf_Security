import { useState } from "react";
import { FileText, Search, ChevronDown, Loader2, Building2 } from "lucide-react";

const FRAMEWORKS = [
  { value: "nist-800-53", label: "NIST SP 800-53 Rev. 5" },
  { value: "cis-v8", label: "CIS Controls v8" },
  { value: "iso-27001", label: "ISO/IEC 27001:2022" },
  { value: "cmmc", label: "CMMC 2.0" },
];

const POLICY_TYPES = [
  { value: "acceptable-use", label: "Acceptable Use" },
  { value: "incident-response", label: "Incident Response" },
  { value: "access-control", label: "Access Control" },
  { value: "data-classification", label: "Data Classification" },
  { value: "password", label: "Password & Authentication" },
  { value: "remote-work", label: "Remote Work / Telework" },
  { value: "encryption", label: "Encryption & Cryptographic Controls" },
  { value: "vendor-management", label: "Third-Party / Vendor Management" },
  { value: "change-management", label: "Change Management" },
  { value: "backup-recovery", label: "Backup & Disaster Recovery" },
  { value: "network-security", label: "Network Security" },
  { value: "mobile-device", label: "Mobile Device Management" },
];

export default function PolicyForm({ mode, onGenerate, onReview, loading, reviewPolicy }) {
  const [framework, setFramework] = useState("nist-800-53");
  const [policyType, setPolicyType] = useState("acceptable-use");
  const [orgContext, setOrgContext] = useState("");
  const [policy, setPolicy] = useState("");

  const handleGenerate = () => {
    if (loading) return;
    onGenerate(framework, policyType, orgContext.trim() || undefined);
  };

  const handleReview = () => {
    if (loading || policy.trim().length < 50) return;
    onReview(framework, policy);
  };

  if (mode === "review") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Review Against Framework
          </label>
          <div className="relative">
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              className="w-full appearance-none px-4 py-3 pr-10 text-sm bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              {FRAMEWORKS.map((fw) => (
                <option key={fw.value} value={fw.value}>{fw.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Paste Your Policy
          </label>
          <textarea
            value={policy}
            onChange={(e) => setPolicy(e.target.value)}
            placeholder="Paste the full text of the security policy you want reviewed..."
            rows={12}
            maxLength={200000}
            className="w-full px-4 py-3 text-sm bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors resize-y font-mono leading-relaxed"
          />
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-zinc-600">
              {policy.length > 0 ? `${policy.length.toLocaleString()} characters` : "Minimum 50 characters"}
            </p>
            {policy.length > 200_000 && (
              <p className="text-xs text-red-400">Exceeds 200KB limit</p>
            )}
          </div>
        </div>

        <button
          onClick={handleReview}
          disabled={loading || policy.trim().length < 50 || policy.length > 200_000}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl transition-colors"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Reviewing Policy...
            </>
          ) : (
            <>
              <Search size={18} />
              Review Policy
            </>
          )}
        </button>
      </div>
    );
  }

  // Generate mode
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Framework
          </label>
          <div className="relative">
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              className="w-full appearance-none px-4 py-3 pr-10 text-sm bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              {FRAMEWORKS.map((fw) => (
                <option key={fw.value} value={fw.value}>{fw.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Policy Type
          </label>
          <div className="relative">
            <select
              value={policyType}
              onChange={(e) => setPolicyType(e.target.value)}
              className="w-full appearance-none px-4 py-3 pr-10 text-sm bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors"
            >
              {POLICY_TYPES.map((pt) => (
                <option key={pt.value} value={pt.value}>{pt.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
          <Building2 size={14} />
          Organization Context
          <span className="text-zinc-600 font-normal">(optional)</span>
        </label>
        <textarea
          value={orgContext}
          onChange={(e) => setOrgContext(e.target.value)}
          placeholder="E.g., healthcare company with 500 employees, HIPAA regulated, hybrid workforce..."
          rows={3}
          maxLength={5000}
          className="w-full px-4 py-3 text-sm bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors resize-y"
        />
        <p className="text-xs text-zinc-600 mt-1">
          {orgContext.length > 0 ? `${orgContext.length.toLocaleString()} / 5,000 characters` : "Helps tailor the policy to your organization"}
        </p>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl transition-colors"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Generating Policy...
          </>
        ) : (
          <>
            <FileText size={18} />
            Generate Policy
          </>
        )}
      </button>
    </div>
  );
}
