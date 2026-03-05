import { useState, useCallback, useRef } from "react";
import { analyzeStream } from "../utils/api.js";

/**
 * Streaming state machine for threat intel brief generation.
 * States: IDLE → STREAMING → COMPLETE (or ERROR)
 */
export function useThreatStream() {
  const [state, setState] = useState("IDLE"); // IDLE | STREAMING | COMPLETE | ERROR
  const [markdown, setMarkdown] = useState("");
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState(null);
  const abortRef = useRef(false);

  const analyze = useCallback(async (iocs, context) => {
    abortRef.current = false;
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
          if (abortRef.current) return;
          setStatusText("");
          setMarkdown((prev) => prev + text);
        },
        // onStatus
        (text) => {
          if (abortRef.current) return;
          setStatusText(text);
        },
        // onDone
        () => {
          if (abortRef.current) return;
          setStatusText("");
          setState("COMPLETE");
        },
        // onError
        (errMsg) => {
          setError(errMsg);
          setState("ERROR");
        }
      );

      // If stream ended without explicit done event
      setState((prev) => (prev === "STREAMING" ? "COMPLETE" : prev));
    } catch (err) {
      if (!abortRef.current) {
        setError(err.message || "Analysis failed. Please try again.");
        setState("ERROR");
      }
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current = true;
    setState("IDLE");
    setMarkdown("");
    setStatusText("");
    setError(null);
  }, []);

  return { state, markdown, statusText, error, analyze, reset };
}
