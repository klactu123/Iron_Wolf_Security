import { useState, useCallback, useRef } from "react";
import { analyzeStream } from "../utils/api.js";

/**
 * Streaming state machine for threat intel brief generation.
 * States: IDLE -> STREAMING -> COMPLETE (or ERROR)
 */
export function useThreatStream() {
  const [state, setState] = useState("IDLE"); // IDLE | STREAMING | COMPLETE | ERROR
  const [markdown, setMarkdown] = useState("");
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState(null);
  const abortRef = useRef(null); // AbortController

  const analyze = useCallback(async (iocs, context) => {
    // Abort any previous request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setMarkdown("");
    setError(null);
    setStatusText("Initializing analysis...");
    setState("STREAMING");

    try {
      await analyzeStream(
        iocs,
        context,
        // onText
        (text) => {
          if (controller.signal.aborted) return;
          setStatusText("");
          setMarkdown((prev) => prev + text);
        },
        // onStatus
        (text) => {
          if (controller.signal.aborted) return;
          setStatusText(text);
        },
        // onDone
        () => {
          if (controller.signal.aborted) return;
          setStatusText("");
          setState("COMPLETE");
        },
        // onError
        (errMsg) => {
          setError(errMsg);
          setState("ERROR");
        },
        controller.signal
      );

      // If stream ended without explicit done event
      setState((prev) => (prev === "STREAMING" ? "COMPLETE" : prev));
    } catch (err) {
      if (err.name === "AbortError") return; // user cancelled
      if (!controller.signal.aborted) {
        setError(err.message || "Analysis failed. Please try again.");
        setState("ERROR");
      }
    }
  }, []);

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = null;
    setState("IDLE");
    setMarkdown("");
    setStatusText("");
    setError(null);
  }, []);

  return { state, markdown, statusText, error, analyze, reset };
}
