/**
 * Email parsing utilities for the Phishing Analyzer.
 * Extracts headers, URLs, and metadata from pasted email content.
 */

/**
 * Extract email headers from raw email text.
 * Returns an object with common header fields.
 */
export function parseHeaders(emailText) {
  const headers = {};
  const lines = emailText.split("\n");
  let currentKey = null;
  let headerEnd = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Empty line marks end of headers
    if (line.trim() === "" && currentKey) {
      headerEnd = i;
      break;
    }

    // Continuation of previous header (starts with whitespace)
    if (/^\s+/.test(line) && currentKey) {
      headers[currentKey] += " " + line.trim();
      continue;
    }

    // New header line
    const match = line.match(/^([A-Za-z][A-Za-z0-9-]*)\s*:\s*(.*)$/);
    if (match) {
      currentKey = match[1].toLowerCase();
      headers[currentKey] = match[2].trim();
    }
  }

  return {
    headers,
    hasHeaders: Object.keys(headers).length > 2,
    headerEnd,
  };
}

/**
 * Extract all URLs from email text.
 */
export function extractUrls(text) {
  const urlRegex = /https?:\/\/[^\s<>"')\]},]+/gi;
  const matches = text.match(urlRegex) || [];
  // Deduplicate
  return [...new Set(matches)];
}

/**
 * Extract sender information.
 */
export function extractSender(headers) {
  const from = headers.from || "";
  const replyTo = headers["reply-to"] || "";

  // Extract email address from "Name <email>" format
  const emailMatch = from.match(/<([^>]+)>/);
  const email = emailMatch ? emailMatch[1] : from;
  const domain = email.includes("@") ? email.split("@")[1] : null;

  return {
    from,
    email,
    domain,
    replyTo,
    mismatch: replyTo && replyTo !== from && !from.includes(replyTo),
  };
}

/**
 * Check for suspicious attachment indicators in email text.
 */
export function detectAttachmentIndicators(text) {
  const suspiciousExtensions = [
    ".exe", ".scr", ".js", ".vbs", ".bat", ".cmd", ".ps1",
    ".iso", ".img", ".zip", ".rar", ".7z", ".tar",
    ".html", ".htm", ".hta", ".msi", ".dll",
    ".doc", ".docm", ".xlsm", ".pptm",
  ];

  const found = [];
  const lowerText = text.toLowerCase();

  for (const ext of suspiciousExtensions) {
    // Look for filenames with these extensions
    const regex = new RegExp(`[\\w.-]+\\${ext}\\b`, "gi");
    const matches = text.match(regex);
    if (matches) {
      found.push(...matches);
    }
  }

  // Check for Content-Disposition: attachment headers
  if (lowerText.includes("content-disposition: attachment") || lowerText.includes("content-disposition:attachment")) {
    found.push("[attachment header detected]");
  }

  return [...new Set(found)];
}

/**
 * Count the approximate word count and character count of email body.
 */
export function getEmailStats(text) {
  const words = text.split(/\s+/).filter(Boolean).length;
  const chars = text.length;
  const lines = text.split("\n").length;
  const urls = extractUrls(text).length;

  return { words, chars, lines, urls };
}
