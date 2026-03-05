/**
 * Email Preprocessor for Phishing Analyzer
 *
 * Strips noise from raw emails before sending to Claude to reduce token usage.
 * Keeps security-relevant headers, body text, and URLs.
 * Strips HTML tags, base64 blobs, CSS, quoted replies, disclaimers, and redundant whitespace.
 */

// Headers that matter for phishing analysis
const SECURITY_HEADERS = new Set([
  "from",
  "to",
  "cc",
  "reply-to",
  "return-path",
  "subject",
  "date",
  "message-id",
  "x-mailer",
  "x-originating-ip",
  "x-sender",
  "x-forefront-antispam-report",
  "authentication-results",
  "arc-authentication-results",
  "received-spf",
  "dkim-signature",
  "x-ms-exchange-authentication-results",
  "x-spam-status",
  "x-spam-score",
  "x-virus-scanned",
  "content-type",
  "mime-version",
]);

// Keep first N received headers (routing hops)
const MAX_RECEIVED_HEADERS = 5;

/**
 * Parse raw email into headers + body.
 */
function splitHeadersBody(raw) {
  // Headers end at first blank line
  const idx = raw.search(/\r?\n\r?\n/);
  if (idx === -1) {
    return { headerBlock: "", body: raw };
  }
  return {
    headerBlock: raw.slice(0, idx),
    body: raw.slice(idx).replace(/^\r?\n\r?\n/, ""),
  };
}

/**
 * Parse header block into array of { key, value } objects.
 * Handles multi-line folded headers.
 */
function parseHeaderEntries(headerBlock) {
  const entries = [];
  const lines = headerBlock.split(/\r?\n/);

  for (const line of lines) {
    // Continuation line (starts with whitespace)
    if (/^\s+/.test(line) && entries.length > 0) {
      entries[entries.length - 1].value += " " + line.trim();
      continue;
    }
    const match = line.match(/^([A-Za-z][A-Za-z0-9-]*)\s*:\s*(.*)$/);
    if (match) {
      entries.push({ key: match[1].toLowerCase(), raw: match[1], value: match[2].trim() });
    }
  }

  return entries;
}

/**
 * Filter headers to only security-relevant ones.
 */
function filterHeaders(entries) {
  const result = [];
  let receivedCount = 0;

  for (const entry of entries) {
    if (entry.key === "received") {
      receivedCount++;
      if (receivedCount <= MAX_RECEIVED_HEADERS) {
        result.push(entry);
      }
      continue;
    }
    if (SECURITY_HEADERS.has(entry.key)) {
      result.push(entry);
    }
  }

  return result;
}

/**
 * Strip HTML tags but preserve text content and link hrefs.
 * Converts <a href="URL">text</a> to text (URL)
 */
function stripHtml(html) {
  let text = html;

  // Extract href from anchor tags before stripping
  text = text.replace(/<a\s[^>]*href\s*=\s*["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, (_, href, linkText) => {
    const cleanText = linkText.replace(/<[^>]+>/g, "").trim();
    if (cleanText && cleanText !== href) {
      return `${cleanText} (${href})`;
    }
    return href;
  });

  // Remove style and script blocks entirely
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");

  // Replace block elements with newlines
  text = text.replace(/<\/(p|div|tr|li|h[1-6]|blockquote|br\s*\/?)>/gi, "\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/(td|th)>/gi, " | ");

  // Strip remaining tags
  text = text.replace(/<[^>]+>/g, "");

  // Decode common HTML entities
  text = text.replace(/&nbsp;/gi, " ");
  text = text.replace(/&amp;/gi, "&");
  text = text.replace(/&lt;/gi, "<");
  text = text.replace(/&gt;/gi, ">");
  text = text.replace(/&quot;/gi, '"');
  text = text.replace(/&#39;/gi, "'");
  text = text.replace(/&#x27;/gi, "'");
  text = text.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));

  return text;
}

/**
 * Remove base64-encoded content blocks, replacing with a note.
 */
function stripBase64(text) {
  // Match base64 content blocks (long lines of base64 chars)
  // Typical in MIME attachments and inline images
  return text.replace(
    /^[A-Za-z0-9+/=]{76,}\s*(\r?\n[A-Za-z0-9+/=]{4,}\s*){2,}/gm,
    "[base64-encoded content removed — attachment or embedded image detected]"
  );
}

/**
 * Remove quoted reply chains (lines starting with >).
 * Keeps a note that quoted content was removed.
 */
function stripQuotedReplies(text) {
  const lines = text.split("\n");
  const result = [];
  let inQuotedBlock = false;
  let quotedLineCount = 0;

  for (const line of lines) {
    if (/^>/.test(line.trim())) {
      if (!inQuotedBlock) {
        inQuotedBlock = true;
        quotedLineCount = 0;
      }
      quotedLineCount++;
      continue;
    }

    if (inQuotedBlock) {
      result.push(`[${quotedLineCount} lines of quoted reply removed]`);
      inQuotedBlock = false;
      quotedLineCount = 0;
    }

    result.push(line);
  }

  if (inQuotedBlock) {
    result.push(`[${quotedLineCount} lines of quoted reply removed]`);
  }

  return result.join("\n");
}

/**
 * Collapse excessive whitespace and blank lines.
 */
function collapseWhitespace(text) {
  // Collapse 3+ consecutive blank lines to 2
  text = text.replace(/(\r?\n\s*){3,}/g, "\n\n");
  // Collapse long runs of spaces/tabs within lines
  text = text.replace(/[ \t]{4,}/g, "  ");
  return text.trim();
}

/**
 * Strip MIME boundary markers and content-type headers from body.
 */
function stripMimeBoundaries(text) {
  // Remove MIME boundary lines
  text = text.replace(/^--[a-zA-Z0-9_=.+-]{20,}--?\s*$/gm, "");
  // Remove inline content-type declarations in body
  text = text.replace(/^Content-(?:Type|Transfer-Encoding|Disposition):\s*.+(?:\r?\n\s+.+)*/gmi, "");
  return text;
}

/**
 * Detect and summarize attachments from MIME parts.
 */
function extractAttachmentInfo(body) {
  const attachments = [];
  const regex = /Content-Disposition:\s*attachment[\s\S]{0,500}?filename\s*=\s*"?([^";\r\n]+)"?/gi;
  let match;
  while ((match = regex.exec(body)) !== null) {
    attachments.push(match[1].trim());
  }

  // Also check Content-Type for name= parameter
  const nameRegex = /Content-Type:[\s\S]{0,500}?name\s*=\s*"?([^";\r\n]+)"?/gi;
  while ((match = nameRegex.exec(body)) !== null) {
    const name = match[1].trim();
    if (!attachments.includes(name)) {
      attachments.push(name);
    }
  }

  return attachments;
}

/**
 * Main preprocessor: takes raw email text and returns a trimmed version
 * optimized for Claude analysis.
 */
export function preprocessEmail(raw) {
  const { headerBlock, body } = splitHeadersBody(raw);

  // --- Headers ---
  let headerSection = "";
  if (headerBlock) {
    const allHeaders = parseHeaderEntries(headerBlock);
    const filtered = filterHeaders(allHeaders);

    if (filtered.length > 0) {
      headerSection = filtered
        .map((h) => `${h.raw}: ${h.value}`)
        .join("\n");
    }
  }

  // --- Attachments (extract before stripping MIME) ---
  const attachments = extractAttachmentInfo(body);

  // --- Body ---
  let cleanBody = body;

  // Strip MIME boundaries
  cleanBody = stripMimeBoundaries(cleanBody);

  // Strip base64 blobs
  cleanBody = stripBase64(cleanBody);

  // Strip HTML (preserving text + link URLs)
  cleanBody = stripHtml(cleanBody);

  // Strip quoted replies
  cleanBody = stripQuotedReplies(cleanBody);

  // Collapse whitespace
  cleanBody = collapseWhitespace(cleanBody);

  // --- Assemble ---
  let result = "";

  if (headerSection) {
    result += "=== EMAIL HEADERS ===\n" + headerSection + "\n\n";
  }

  if (attachments.length > 0) {
    result += "=== ATTACHMENTS ===\n" + attachments.map((a) => `- ${a}`).join("\n") + "\n\n";
  }

  result += "=== EMAIL BODY ===\n" + cleanBody;

  // --- Stats ---
  const originalLength = raw.length;
  const trimmedLength = result.length;
  const reduction = Math.round((1 - trimmedLength / originalLength) * 100);

  if (reduction > 5) {
    console.log(`Email preprocessed: ${originalLength.toLocaleString()} → ${trimmedLength.toLocaleString()} chars (${reduction}% reduction)`);
  }

  return result;
}
