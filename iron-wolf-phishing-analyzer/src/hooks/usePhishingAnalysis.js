import { useState, useCallback, useRef } from "react";
import { analyzeStream } from "../utils/api";

const STATES = {
  IDLE: "IDLE",
  ANALYZING: "ANALYZING",
  COMPLETE: "COMPLETE",
};

export default function usePhishingAnalysis() {
  const [stage, setStage] = useState(STATES.IDLE);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [statusText, setStatusText] = useState(null);

  const abortRef = useRef(false);

  const MAX_EMAIL_LENGTH = 500_000; // 500KB — matches server limit

  const handleAnalyze = useCallback(async (emailContent) => {
    if (!emailContent || emailContent.trim().length < 10) {
      setError("Please paste a complete email to analyze.");
      return;
    }
    if (emailContent.length > MAX_EMAIL_LENGTH) {
      setError("Email content exceeds maximum size (500KB). Try trimming unnecessary content.");
      return;
    }

    abortRef.current = false;
    setStage(STATES.ANALYZING);
    setError(null);
    setAnalysis("");
    setIsStreaming(true);
    setStatusText(null);

    const fullTextRef = { value: "" };

    await analyzeStream(emailContent, {
      onChunk: (text) => {
        if (abortRef.current) return;
        fullTextRef.value += text;
        setAnalysis((prev) => prev + text);
        setStatusText(null);
      },
      onStatus: (text) => {
        if (abortRef.current) return;
        setStatusText(text);
      },
      onDone: () => {
        setIsStreaming(false);
        setStatusText(null);
        setStage(STATES.COMPLETE);
      },
      onError: (err) => {
        setError(err.message);
        setIsStreaming(false);
        setStatusText(null);
        setStage(STATES.IDLE);
      },
    });
  }, []);

  const handleReset = useCallback(() => {
    abortRef.current = true;
    setStage(STATES.IDLE);
    setError(null);
    setAnalysis(null);
    setIsStreaming(false);
    setStatusText(null);
  }, []);

  return {
    stage,
    error,
    analysis,
    isStreaming,
    statusText,
    handleAnalyze,
    handleReset,
    STATES,
  };
}
