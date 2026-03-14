import { useState, useEffect } from "react";
import { X, Trash2, Clock, Loader2, FileText } from "lucide-react";
import { listBriefs, deleteBrief } from "../utils/api.js";

export default function ArchiveSidebar({ onClose, onSelect, activeFilename }) {
  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listBriefs()
      .then((data) => setBriefs(data.briefs || []))
      .catch(() => setBriefs([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(filename) {
    try {
      await deleteBrief(filename);
      setBriefs((prev) => prev.filter((b) => b.filename !== filename));
    } catch (err) {
      console.error("Failed to delete brief:", err);
    }
  }

  // Format filename into readable date
  function formatDate(brief) {
    if (brief.generated) return brief.generated;
    // Parse from filename: brief_YYYY-MM-DD_HH-MM.md
    const m = brief.filename.match(/brief_(\d{4}-\d{2}-\d{2})_(\d{2})-(\d{2})/);
    if (m) return `${m[1]} ${m[2]}:${m[3]}`;
    return brief.filename;
  }

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-zinc-900 border-l border-zinc-700 shadow-2xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
        <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
          <Clock size={16} /> Brief Archive
        </h2>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Count */}
      <div className="px-4 py-2 border-b border-zinc-800">
        <span className="text-xs text-zinc-500">
          {briefs.length} saved brief{briefs.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-zinc-400">
            <Loader2 size={14} className="animate-spin" /> Loading...
          </div>
        ) : briefs.length === 0 ? (
          <div className="text-center py-12 text-zinc-600 text-sm">
            No saved briefs yet.<br />
            <span className="text-zinc-700 text-xs">Briefs are auto-saved when generation completes.</span>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {briefs.map((brief) => {
              const isActive = activeFilename === brief.filename;
              return (
                <div
                  key={brief.filename}
                  className={`px-4 py-3 group transition-colors ${
                    isActive ? "bg-blue-950/40" : "hover:bg-zinc-800/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      onClick={() => onSelect(brief.filename)}
                      className="text-left flex-1 min-w-0"
                    >
                      <div className="flex items-center gap-2">
                        <FileText size={14} className={isActive ? "text-blue-400" : "text-zinc-500"} />
                        <span className={`text-sm font-medium truncate ${isActive ? "text-blue-300" : "text-zinc-200"}`}>
                          {formatDate(brief)}
                        </span>
                      </div>
                      {brief.focus && (
                        <div className="text-xs text-zinc-500 truncate mt-1 ml-6">
                          Focus: {brief.focus}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1 ml-6">
                        <span className="text-[10px] text-zinc-600">{brief.sizeKb}KB</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDelete(brief.filename)}
                      className="p-1 rounded text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                      title="Delete brief"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
