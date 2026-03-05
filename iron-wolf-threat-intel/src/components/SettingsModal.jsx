import { useState, useEffect, useRef } from "react";
import { X, Key, CheckCircle, AlertTriangle, Trash2 } from "lucide-react";
import { saveApiKey, deleteApiKey, fetchHealth } from "../utils/api.js";

export default function SettingsModal({ open, onClose }) {
  const [keyInput, setKeyInput] = useState("");
  const [status, setStatus] = useState("checking"); // checking | connected | no-key | error
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const busyRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    setKeyInput("");
    setMessage("");
    checkStatus();
  }, [open]);

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
    if (busyRef.current) return;
    busyRef.current = true;
    setSaving(true);
    setMessage("");
    try {
      await saveApiKey(keyInput.trim());
      setKeyInput("");
      setMessage("API key saved successfully.");
      setStatus("connected");
    } catch (err) {
      setMessage(err.message || "Failed to save.");
    } finally {
      setSaving(false);
      busyRef.current = false;
    }
  }

  async function handleDelete() {
    if (busyRef.current) return;
    if (!window.confirm("Remove your API key? Analysis will stop working until a new key is set.")) return;
    busyRef.current = true;
    setSaving(true);
    setMessage("");
    try {
      await deleteApiKey();
      setMessage("API key removed.");
      setStatus("no-key");
    } catch (err) {
      setMessage(err.message || "Failed to remove.");
    } finally {
      setSaving(false);
      busyRef.current = false;
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" /> Settings
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status indicator */}
        <div className="mb-4 p-3 rounded-lg bg-zinc-800 border border-zinc-700">
          <div className="flex items-center gap-2 text-sm">
            {status === "checking" && <span className="text-zinc-400">Checking API status...</span>}
            {status === "connected" && (
              <>
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400">API key configured</span>
              </>
            )}
            {status === "no-key" && (
              <>
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400">No API key configured</span>
              </>
            )}
            {status === "error" && (
              <>
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-red-400">Cannot reach server</span>
              </>
            )}
          </div>
        </div>

        {/* Key input */}
        <div className="mb-4">
          <label className="block text-sm text-zinc-400 mb-1">Anthropic API Key</label>
          <input
            type="password"
            autoComplete="off"
            spellCheck="false"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-sm"
          />
        </div>

        {message && (
          <p className={`text-sm mb-3 ${message.includes("success") || message.includes("saved") ? "text-green-400" : "text-red-400"}`}>
            {message}
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !keyInput.trim()}
            className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? "Saving..." : "Save Key"}
          </button>
          {status === "connected" && (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" /> Remove
            </button>
          )}
        </div>

        <p className="mt-4 text-xs text-zinc-500">
          Your key is stored in the server .env file and never sent to the browser.
          Get a key at console.anthropic.com.
        </p>
      </div>
    </div>
  );
}
