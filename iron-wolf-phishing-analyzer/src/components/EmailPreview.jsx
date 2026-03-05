import { useState } from "react";
import { ChevronDown, ChevronUp, Mail } from "lucide-react";
import { parseHeaders, extractUrls, extractSender, getEmailStats } from "../utils/parsers";

export default function EmailPreview({ email }) {
  const [expanded, setExpanded] = useState(false);

  if (!email) return null;

  const { headers, hasHeaders } = parseHeaders(email);
  const sender = hasHeaders ? extractSender(headers) : null;
  const urls = extractUrls(email);
  const stats = getEmailStats(email);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Mail size={16} className="text-zinc-400" />
          <span className="text-sm font-medium text-zinc-200">
            Submitted Email
          </span>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span>{stats.lines} lines</span>
            <span>{stats.words} words</span>
            {urls.length > 0 && (
              <span className="text-orange-400">{urls.length} URL{urls.length > 1 ? "s" : ""}</span>
            )}
            {hasHeaders && (
              <span className="text-blue-400">Headers included</span>
            )}
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
      </button>

      {expanded && (
        <div className="border-t border-zinc-800">
          {/* Quick metadata */}
          {sender && (
            <div className="px-5 py-3 border-b border-zinc-800 space-y-1">
              {sender.from && (
                <div className="text-xs">
                  <span className="text-zinc-500">From: </span>
                  <span className="text-zinc-300 font-mono">{sender.from}</span>
                </div>
              )}
              {headers.to && (
                <div className="text-xs">
                  <span className="text-zinc-500">To: </span>
                  <span className="text-zinc-300 font-mono">{headers.to}</span>
                </div>
              )}
              {headers.subject && (
                <div className="text-xs">
                  <span className="text-zinc-500">Subject: </span>
                  <span className="text-zinc-200 font-medium">{headers.subject}</span>
                </div>
              )}
              {sender.replyTo && sender.mismatch && (
                <div className="text-xs">
                  <span className="text-zinc-500">Reply-To: </span>
                  <span className="text-orange-400 font-mono">{sender.replyTo}</span>
                  <span className="text-red-400 ml-2">(mismatch!)</span>
                </div>
              )}
            </div>
          )}

          {/* Raw email */}
          <pre className="px-5 py-3 text-xs text-zinc-400 font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
            {email}
          </pre>
        </div>
      )}
    </div>
  );
}
