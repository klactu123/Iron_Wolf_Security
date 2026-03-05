import { useState, useCallback, useRef } from "react";
import { generateStream, reviewStream } from "../utils/api";

const STATES = {
  IDLE: "IDLE",
  STREAMING: "STREAMING",
  COMPLETE: "COMPLETE",
};

export default function usePolicyStream() {
  const [stage, setStage] = useState(STATES.IDLE);
  const [error, setError] = useState(null);
  const [output, setOutput] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [statusText, setStatusText] = useState(null);
  const [mode, setMode] = useState(null); // "generate" or "review"

  const abortRef = useRef(false);

  const handleGenerate = useCallback(async (framework, policyType, orgContext) => {
    abortRef.current = false;
    setStage(STATES.STREAMING);
    setError(null);
    setOutput("");
    setIsStreaming(true);
    setStatusText(null);
    setMode("generate");

    await generateStream(framework, policyType, orgContext, {
      onChunk: (text) => {
        if (abortRef.current) return;
        setOutput((prev) => prev + text);
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

  const handleReview = useCallback(async (framework, policy) => {
    abortRef.current = false;
    setStage(STATES.STREAMING);
    setError(null);
    setOutput("");
    setIsStreaming(true);
    setStatusText(null);
    setMode("review");

    await reviewStream(framework, policy, {
      onChunk: (text) => {
        if (abortRef.current) return;
        setOutput((prev) => prev + text);
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
    setOutput(null);
    setIsStreaming(false);
    setStatusText(null);
    setMode(null);
  }, []);

  return {
    stage,
    error,
    output,
    isStreaming,
    statusText,
    mode,
    handleGenerate,
    handleReview,
    handleReset,
    STATES,
  };
}
