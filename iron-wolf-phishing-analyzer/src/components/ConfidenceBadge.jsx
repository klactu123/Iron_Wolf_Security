import { ShieldAlert, ShieldCheck, ShieldQuestion, AlertTriangle } from "lucide-react";

/**
 * Parse verdict and threat confidence from the analysis markdown.
 * Matches new format: **Verdict:** Malicious | **Threat Confidence:** 95%
 * Also matches legacy: **Confidence:** 85% Malicious
 */
export function parseConfidence(markdown) {
  if (!markdown) return null;

  // New format: **Verdict:** Malicious | **Threat Confidence:** 95%
  const newMatch = markdown.match(/\*\*Verdict:\*\*\s*(Malicious|Phishing|Suspicious|Likely Legitimate)\s*\|\s*\*\*Threat Confidence:\*\*\s*(\d+)%/i);
  if (newMatch) {
    return {
      score: parseInt(newMatch[2], 10),
      verdict: newMatch[1],
    };
  }

  // Legacy format: **Confidence:** 85% Malicious
  const legacyMatch = markdown.match(/\*\*Confidence:\*\*\s*(\d+)%\s*(Malicious|Phishing|Suspicious|Likely Legitimate)/i);
  if (legacyMatch) {
    return {
      score: parseInt(legacyMatch[1], 10),
      verdict: legacyMatch[2],
    };
  }

  return null;
}

/**
 * Parse threat level from the analysis markdown.
 * Looks for: **Threat Level:** Critical | **Category:** Credential Harvesting
 */
export function parseThreatInfo(markdown) {
  if (!markdown) return null;

  const levelMatch = markdown.match(/\*\*Threat Level:\*\*\s*(Critical|High|Medium|Low)/i);
  const categoryMatch = markdown.match(/\*\*Category:\*\*\s*([^|*\n]+)/i);

  if (!levelMatch) return null;

  return {
    level: levelMatch[1],
    category: categoryMatch ? categoryMatch[1].trim() : null,
  };
}

const VERDICT_CONFIG = {
  Malicious: {
    icon: ShieldAlert,
    bg: "bg-red-950/50",
    border: "border-red-700",
    text: "text-red-400",
    label: "Malicious Email",
  },
  Phishing: {
    icon: ShieldAlert,
    bg: "bg-red-950/50",
    border: "border-red-700",
    text: "text-red-400",
    label: "Phishing Detected",
  },
  Suspicious: {
    icon: AlertTriangle,
    bg: "bg-yellow-950/50",
    border: "border-yellow-700",
    text: "text-yellow-400",
    label: "Suspicious",
  },
  "Likely Legitimate": {
    icon: ShieldCheck,
    bg: "bg-green-950/50",
    border: "border-green-700",
    text: "text-green-400",
    label: "Likely Legitimate",
  },
};

const LEVEL_COLORS = {
  Critical: "bg-red-600",
  High: "bg-orange-600",
  Medium: "bg-yellow-600",
  Low: "bg-green-600",
};

/**
 * Get a human-friendly confidence description based on the verdict and score.
 */
function getConfidenceLabel(score, verdict) {
  if (verdict === "Likely Legitimate") {
    // For legitimate emails, flip the framing — low malicious confidence = high safety confidence
    const safetyScore = 100 - score;
    return `${safetyScore}% safe`;
  }
  return `${score}% threat confidence`;
}

export default function ConfidenceBadge({ analysis }) {
  const confidence = parseConfidence(analysis);
  const threatInfo = parseThreatInfo(analysis);

  if (!confidence) return null;

  const config = VERDICT_CONFIG[confidence.verdict] || VERDICT_CONFIG.Suspicious;
  const Icon = config.icon;
  const confidenceLabel = getConfidenceLabel(confidence.score, confidence.verdict);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {/* Verdict Badge */}
      <div className={`flex items-center gap-2 px-4 py-2 ${config.bg} border ${config.border} rounded-xl`}>
        <Icon size={20} className={config.text} />
        <div>
          <span className={`text-sm font-semibold ${config.text}`}>{config.label}</span>
          <span className="text-xs text-zinc-400 ml-2">{confidenceLabel}</span>
        </div>
      </div>

      {/* Threat Level */}
      {threatInfo && (
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-xl">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${LEVEL_COLORS[threatInfo.level] || "bg-zinc-500"}`} />
          <span className="text-sm text-zinc-300">{threatInfo.level} Threat</span>
        </div>
      )}

      {/* Category */}
      {threatInfo?.category && (
        <div className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl">
          <span className="text-xs text-zinc-400">Category: </span>
          <span className="text-sm text-zinc-200">{threatInfo.category}</span>
        </div>
      )}
    </div>
  );
}
