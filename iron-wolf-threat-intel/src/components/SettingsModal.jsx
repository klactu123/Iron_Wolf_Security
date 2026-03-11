import { useState, useEffect, useRef } from "react";
import { X, Settings, Cpu, CheckCircle, AlertTriangle, Trash2 } from "lucide-react";
import { saveApiKey, deleteApiKey, fetchHealth } from "../utils/api.js";

export default function SettingsModal({ onKeyChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [status, setStatus] = useState("checking"); // checking | connected | no-key | error
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [keyMessage, setKeyMessage] = useState(null); // { type, text }
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    setKeyInput("");
    setKeyMessage(null);
    setShowKeyInput(false);
    setConfirmDelete(false);
    checkStatus();
  }, [isOpen]);

  async function checkStatus() {
    setStatus("checking");
    try {
      const data = await fetchHealth();
      setStatus(data.hasClaudeKey ? "connected" : "no-key");
    } catch {
      setStatus("error");
    }
  }

  async function handleSave() {
    if (inFlightRef.current) return;
    const trimmed = keyInput.trim();
    if (!trimmed.startsWith("sk-ant-") || trimmed.length < 40 || !/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setKeyMessage({ type: "error", text: "Invalid key format. Must start with 'sk-ant-' and be at least 40 characters." });
      return;
    }
    inFlightRef.current = true;
    setKeyMessage(null);
    try {
      await saveApiKey(trimmed);
      setKeyInput("");
      setShowKeyInput(false);
      setKeyMessage({ type: "success", text: "API key saved successfully." });
      setStatus("connected");
      onKeyChange?.();
    } catch (err) {
      setKeyMessage({ type: "error", text: err.message || "Failed to save." });
    } finally {
      inFlightRef.current = false;
    }
  }

  async function handleDelete() {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setKeyMessage(null);
    try {
      await deleteApiKey();
      setKeyMessage({ type: "success", text: "API key removed." });
      setStatus("no-key");
      setConfirmDelete(false);
      onKeyChange?.();
    } catch (err) {
      setKeyMessage({ type: "error", text: err.message || "Failed to remove." });
    } finally {
      inFlightRef.current = false;
    }
  }

  return (
    <>
      {/* Settings trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
      >
        <Settings size={16} />
        <Cpu size={14} />
        Claude
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                <Cpu size={20} /> Claude API Status
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-200 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Status indicator */}
            <div className={`mb-5 p-3 border rounded-lg ${
              status === "connected" ? "bg-green-950/30 border-green-800" :
              status === "checking" ? "bg-zinc-800 border-zinc-700" :
              "bg-red-950/30 border-red-800"
            }`}>
              {status === "checking" && (
                <p className="text-sm text-zinc-400">Checking API status...</p>
              )}
              {status === "connected" && (
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-400" />
                  <span className="text-sm text-green-400">Claude API connected</span>
                </div>
              )}
              {status === "no-key" && (
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-400" />
                  <span className="text-sm text-red-400">No API key configured</span>
                </div>
              )}
              {status === "error" && (
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-400" />
                  <span className="text-sm text-red-400">Cannot reach server</span>
                </div>
              )}
            </div>

            {/* Message display */}
            {keyMessage && (
              <p className={`mb-4 text-xs ${keyMessage.type === "success" ? "text-green-400" : "text-red-400"}`}>
                {keyMessage.text}
              </p>
            )}

            {/* Key input (shown when no key or user clicks Change) */}
            {(status === "no-key" || showKeyInput) && (
              <div className="mb-5 p-3 bg-zinc-800 border border-zinc-700 rounded-lg">
                <label className="block text-sm text-zinc-400 mb-2">Anthropic API Key</label>
                <input
                  type="password"
                  autoComplete="off"
                  spellCheck="false"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 text-sm"
                />
                <button
                  onClick={handleSave}
                  disabled={!keyInput.trim()}
                  className="mt-3 w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Save
                </button>
              </div>
            )}

            {/* Connected state actions */}
            {status === "connected" && !showKeyInput && !confirmDelete && (
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setShowKeyInput(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  Change API Key
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-xs text-red-500 hover:text-red-400 underline flex items-center gap-1"
                >
                  <Trash2 size={12} /> Delete API Key
                </button>
              </div>
            )}

            {/* Delete confirmation */}
            {confirmDelete && (
              <div className="mb-4 p-3 bg-red-950/30 border border-red-800 rounded-lg">
                <p className="text-sm text-red-300 mb-3">
                  Remove your API key? Analysis will stop working until a new key is set.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 text-sm bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Footer info */}
            <p className="text-xs text-zinc-500">
              Your key is stored in the server .env file and never sent to the browser.
              Get a key at console.anthropic.com.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
