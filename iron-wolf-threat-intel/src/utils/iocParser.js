/**
 * IOC type detection and parsing utilities.
 */

const IOC_PATTERNS = {
  ipv4: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/,
  ipv6: /\b(?:[0-9a-fA-F]{1,4}:){2,7}[0-9a-fA-F]{1,4}\b/,
  md5: /\b[a-fA-F0-9]{32}\b/,
  sha1: /\b[a-fA-F0-9]{40}\b/,
  sha256: /\b[a-fA-F0-9]{64}\b/,
  domain: /\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(?:com|net|org|io|info|biz|co|us|uk|de|ru|cn|xyz|top|site|online|club|icu|cc|tk|ml|ga|cf|gq|pw|buzz|live|shop|app|dev|gov|edu|mil)\b/i,
  url: /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi,
  email: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/,
  cve: /\bCVE-\d{4}-\d{4,}\b/i,
};

/**
 * Detect IOC type for a single value.
 */
export function detectIocType(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Order matters — check most specific first
  if (IOC_PATTERNS.sha256.test(trimmed) && trimmed.length === 64) return "SHA-256";
  if (IOC_PATTERNS.sha1.test(trimmed) && trimmed.length === 40) return "SHA-1";
  if (IOC_PATTERNS.md5.test(trimmed) && trimmed.length === 32) return "MD5";
  if (IOC_PATTERNS.cve.test(trimmed)) return "CVE";
  if (IOC_PATTERNS.url.test(trimmed)) return "URL";
  if (IOC_PATTERNS.email.test(trimmed)) return "Email";
  if (IOC_PATTERNS.ipv4.test(trimmed)) return "IPv4";
  if (IOC_PATTERNS.ipv6.test(trimmed)) return "IPv6";
  if (IOC_PATTERNS.domain.test(trimmed)) return "Domain";

  return "Unknown";
}

/**
 * Parse multi-line IOC input into structured list with type detection.
 * Splits on newlines, commas, and whitespace.
 */
export function parseIocs(input) {
  if (!input || typeof input !== "string") return [];

  const tokens = input
    .split(/[\n,]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3);

  const seen = new Set();
  const results = [];

  for (const token of tokens) {
    const normalized = token.toLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);

    results.push({
      value: token,
      type: detectIocType(token),
    });
  }

  return results;
}

/**
 * Get a color class for an IOC type badge.
 */
export function getIocTypeColor(type) {
  switch (type) {
    case "IPv4":
    case "IPv6":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "Domain":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "URL":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "MD5":
    case "SHA-1":
    case "SHA-256":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "Email":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "CVE":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  }
}
