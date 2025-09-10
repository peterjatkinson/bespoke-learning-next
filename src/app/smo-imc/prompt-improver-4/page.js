// app/prompt-improver/page.js
"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Send as SendIcon,
  RotateCcw as StartOverIcon,
  Copy as CopyIcon,
  CheckCircle2,
  AlertTriangle as AlertIcon,
  Check as CheckIcon,
} from "lucide-react";

// Screen reader only styles
const srOnlyStyles = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0'
};

// NOTE: path uses "...-4/..."
const API_PATH = "/smo-imc/prompt-improver-4/api";

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const IMAGE_ELEMENTS = ["Subject", "Style", "Action", "Scene", "Ambiance", "Composition"];
const VIDEO_ELEMENTS = [
  "Subject",
  "Style",
  "Action",
  "Scene",
  "Ambiance",
  "Composition",
  "Camera Motion",
  "Shot Duration",
  "Pacing",
];

const placeholders = {
  Subject: "e.g., a weathered robot",
  Style: "e.g., cinematic noir / watercolor / realistic",
  Action: "e.g., trudging through a market",
  Scene: "e.g., narrow alley at night",
  Ambiance: "e.g., moody, rain-soaked streets",
  Composition: "e.g., close-up, rule of thirds",
  "Camera Motion": "e.g., slow dolly forward / handheld sway",
  "Shot Duration": "e.g., 5-second shot",
  Pacing: "e.g., brisk / lingering",
};

export default function PromptBuilder() {
  // stages: collect -> built -> firstReviewed -> finalReviewed
  const [stage, setStage] = useState("collect");
  const [promptType, setPromptType] = useState(null);
  const [elements, setElements] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Stage 1 output
  const [initialPrompt, setInitialPrompt] = useState("");
  const [firstSuggestions, setFirstSuggestions] = useState([]);

  // Stage 2 (first review) I/O
  const [firstRevision, setFirstRevision] = useState("");
  const [polishedDraft, setPolishedDraft] = useState("");
  const [elementReviews, setElementReviews] = useState([]); // NEW: all elements
  const [secondSuggestions, setSecondSuggestions] = useState([]);
  const [secondRevision, setSecondRevision] = useState("");

  // Stage 3 (final review)
  const [finalResult, setFinalResult] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");

  const chatRef = useRef(null);
  const liveRegionRef = useRef(null);
  const statusRegionRef = useRef(null);

  const activeElements = useMemo(
    () => (promptType === "video" ? VIDEO_ELEMENTS : IMAGE_ELEMENTS),
    [promptType]
  );

  const handleElementChange = (el, value) => setElements((prev) => ({ ...prev, [el]: value }));

  // Screen reader announcement helper
  const announce = (message, type = 'polite') => {
    const region = type === 'assertive' ? liveRegionRef : statusRegionRef;
    if (region.current) {
      region.current.textContent = message;
      // Clear after a delay to avoid repetitive announcements
      setTimeout(() => {
        if (region.current) region.current.textContent = '';
      }, 1000);
    }
  };

  const handleStartOver = () => {
    setStage("collect");
    setPromptType(null);
    setElements({});
    setIsLoading(false);

    setInitialPrompt("");
    setFirstSuggestions([]);

    setFirstRevision("");
    setPolishedDraft("");
    setElementReviews([]);
    setSecondSuggestions([]);
    setSecondRevision("");

    setFinalResult(null);
    setErrorMessage("");
  };

  /* ---------------- Stage 1: Build from elements ---------------- */
  const handleBuild = async (e) => {
    e.preventDefault();
    if (!promptType) return;
    setIsLoading(true);
    setErrorMessage("");
    setLoadingMessage("Building your initial prompt...");
    announce("Building your initial prompt, please wait.", "assertive");

    try {
      const res = await fetch(API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "build", promptType, elements }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.details || err.error || "Failed to build prompt.");
      }
      const data = await res.json();
      setInitialPrompt(data.initialPrompt);
      setFirstRevision(data.initialPrompt);
      setFirstSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      setStage("built");
      announce("Initial prompt created! Review the suggestions and make your edits.", "polite");
    } catch (err) {
      setErrorMessage(err.message);
      announce(`Error: ${err.message}`, "assertive");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  /* ---------------- Stage 2: First review of user's revision ---------------- */
  const handleFirstReview = async (e) => {
    e.preventDefault();
    if (!firstRevision.trim()) return;
    setIsLoading(true);
    setErrorMessage("");
    setLoadingMessage("Reviewing your prompt...");
    announce("Reviewing your prompt, please wait.", "assertive");

    try {
      const res = await fetch(API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "midReview", promptType, draftPrompt: firstRevision }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.details || err.error || "First review failed.");
      }
      const data = await res.json();

      setPolishedDraft(data.polishedDraft);
      setElementReviews(Array.isArray(data.elementReviews) ? data.elementReviews : []);
      setSecondSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      setSecondRevision(data.polishedDraft);

      // If there's nothing left to do (every element sufficient AND no suggestions),
      // skip the final submission entirely and finish now.
      const allSufficient = (data.elementReviews || []).every((r) => r.isSufficient);
      if (allSufficient && (!data.suggestions || data.suggestions.length === 0)) {
        setFinalResult({
          isReady: true,
          polishedPrompt: data.polishedDraft,
          finalNotes: "",
        });
        setStage("finalReviewed"); // read-only end state
        return;
      }

      setStage("firstReviewed");
      announce("First review complete! Check the element feedback and suggestions.", "polite");
    } catch (err) {
      setErrorMessage(err.message);
      announce(`Error: ${err.message}`, "assertive");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  /* ---------------- Stage 3: Final review (only shown if needed) ---------------- */
  const handleFinalReview = async (e) => {
    e.preventDefault();
    if (!secondRevision.trim()) return;
    setIsLoading(true);
    setErrorMessage("");
    setLoadingMessage("Performing final review...");
    announce("Performing final review of your prompt.", "assertive");

    try {
      const res = await fetch(API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "finalReview", revisedPrompt: secondRevision }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.details || err.error || "Final review failed.");
      }
      const data = await res.json();
      setFinalResult(data);
      setStage("finalReviewed");
      announce("Final review complete! Your prompt is ready with final recommendations.", "polite");
    } catch (err) {
      setErrorMessage(err.message);
      announce(`Error: ${err.message}`, "assertive");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback("Copied!");
      setTimeout(() => setCopyFeedback(""), 2000);
    } catch (error) {
      // Fallback for older browsers or when clipboard API fails
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        setCopyFeedback("Copied!");
        setTimeout(() => setCopyFeedback(""), 2000);
      } catch (fallbackError) {
        setCopyFeedback("Copy failed");
        setTimeout(() => setCopyFeedback(""), 2000);
      }
    }
  };

  /* =========================
     UI
     ========================= */
  return (
    <div className="min-h-full bg-slate-100 font-sans antialiased">
      <header className="bg-white border-b-4 border-black p-4 sm:p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 tracking-tight">Prompt builder</h1>
          <button
            onClick={handleStartOver}
            className="px-4 py-2 text-sm font-semibold bg-gray-200 hover:bg-gray-300 border-2 border-gray-400 rounded-lg flex items-center gap-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-offset-2 active:scale-95"
          >
            <StartOverIcon size={16} /> Start over
          </button>
        </div>
      </header>

      {/* Screen reader live regions */}
      <div 
        ref={liveRegionRef} 
        style={srOnlyStyles}
        role="alert" 
        aria-atomic="true"
        aria-live="assertive"
      />
      <div 
        ref={statusRegionRef} 
        style={srOnlyStyles}
        role="status" 
        aria-atomic="true" 
        aria-live="polite"
      />

      {/* Stage: Collect */}
      {stage === "collect" && (
        <main 
          className="max-w-5xl mx-auto p-4 sm:p-6 grid md:grid-cols-2 gap-6"
          role="main"
          aria-labelledby="collect-heading"
        >
          <h1 id="collect-heading" style={srOnlyStyles}>Set up your prompt</h1>
          <section className="bg-white border-4 border-black rounded-2xl shadow-lg p-6" aria-labelledby="setup-heading">
            <h2 id="setup-heading" className="text-xl font-semibold mb-3">1) Choose type</h2>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPromptType("image")}
                className={`px-4 py-3 rounded-lg flex items-center gap-2 border-2 font-semibold transition-all duration-200 active:scale-95 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                  promptType === "image" 
                    ? "border-[#0056B3] bg-[#0056B3] text-white focus:ring-[#0056B3]" 
                    : "border-black bg-white text-gray-800 hover:bg-gray-50 focus:ring-gray-400"
                }`}
                disabled={isLoading}
                aria-pressed={promptType === "image"}
              >
                <ImageIcon size={18} /> Image
              </button>
              <button
                type="button"
                onClick={() => setPromptType("video")}
                className={`px-4 py-3 rounded-lg flex items-center gap-2 border-2 font-semibold transition-all duration-200 active:scale-95 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                  promptType === "video" 
                    ? "border-[#0056B3] bg-[#0056B3] text-white focus:ring-[#0056B3]" 
                    : "border-black bg-white text-gray-800 hover:bg-gray-50 focus:ring-gray-400"
                }`}
                disabled={isLoading}
                aria-pressed={promptType === "video"}
              >
                <VideoIcon size={18} /> Video
              </button>
            </div>

            <h2 className="text-xl font-semibold mt-6 mb-3">2) Fill Elements</h2>
            {!promptType && <p className="text-sm text-gray-500">Pick image or video to see the relevant fields.</p>}
            {promptType && (
              <form onSubmit={handleBuild} className="space-y-3">
                {(promptType === "video" ? VIDEO_ELEMENTS : IMAGE_ELEMENTS).map((el) => (
                  <div key={el} className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">{el}</label>
                    <input
                      className="p-3 border-2 border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-[#0056B3] focus:ring-offset-2 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder={placeholders[el] || ""}
                      value={elements[el] || ""}
                      onChange={(e) => handleElementChange(el, e.target.value)}
                      disabled={isLoading}
                      aria-label={`Enter details for ${el}`}
                    />
                  </div>
                ))}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={!promptType || isLoading}
                    className="px-6 py-3 rounded-lg text-white font-bold bg-[#0056B3] hover:bg-[#0044A3] border-2 border-black disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#0056B3] focus:ring-offset-2 active:scale-95 shadow-md"
                    aria-label="Build initial prompt from your inputs"
                  >
                    {isLoading ? (
                      <>
                        <Spinner />
                        <span style={srOnlyStyles}>Building prompt, please wait...</span>
                      </>
                    ) : (
                      <SendIcon size={18} />
                    )} 
                    Build initial prompt
                  </button>
                </div>
                {errorMessage && <p className="text-red-500 text-sm text-center">{errorMessage}</p>}
              </form>
            )}
          </section>

          <aside className="bg-white border-4 border-black rounded-2xl shadow-lg p-6" aria-labelledby="tips-heading">
            <h2 id="tips-heading" className="text-xl font-semibold mb-3">Tips</h2>
            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
              <li>You can leave some fields blank — the composer only uses what you provide.</li>
              <li>Be concrete: places, lighting, mood, lens choices, etc.</li>
              <li>For video, include duration and motion if you know them.</li>
            </ul>
          </aside>
        </main>
      )}

      {/* Stage: Built (Initial Prompt + first suggestions + user's first revision) */}
      {stage === "built" && (
        <main 
          className="max-w-6xl mx-auto p-4 sm:p-6 grid md:grid-cols-2 gap-6"
          role="main"
          aria-labelledby="built-heading"
        >
          <h1 id="built-heading" style={srOnlyStyles}>Review and refine your prompt</h1>
          <section className="bg-white border-4 border-black rounded-2xl shadow-lg p-6 flex flex-col gap-4" aria-labelledby="initial-prompt-heading">
            <h2 id="initial-prompt-heading" className="text-xl font-semibold">Initial prompt suggestion</h2>
            <div className="relative">
              <p className="p-4 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800 whitespace-pre-wrap min-h-[120px]">
                {initialPrompt}
              </p>
              <div className="absolute top-2 right-2 flex items-center gap-2">
                <button
                  title="Copy to clipboard"
                  onClick={() => handleCopy(initialPrompt)}
                  className="p-1.5 bg-gray-200 hover:bg-gray-300 rounded text-gray-600 transition-colors"
                  aria-label="Copy prompt to clipboard"
                >
                  <CopyIcon size={16} />
                </button>
                {copyFeedback && (
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                    {copyFeedback}
                  </span>
                )}
              </div>
            </div>

            <h3 className="text-sm font-semibold text-gray-700">Your first revision</h3>
            <form onSubmit={handleFirstReview} className="space-y-3">
              <textarea
                value={firstRevision}
                onChange={(e) => setFirstRevision(e.target.value)}
                rows={6}
                className="w-full p-3 border-2 border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-[#0056B3] focus:ring-offset-2 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                placeholder="Make edits, add detail, then submit for a first review."
                disabled={isLoading}
                aria-label="Edit your prompt before first review"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!firstRevision.trim() || isLoading}
                  className="px-6 py-3 rounded-lg text-white font-bold bg-[#0056B3] hover:bg-[#0044A3] border-2 border-black disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#0056B3] focus:ring-offset-2 active:scale-95 shadow-md"
                  aria-label="Submit your revision for first AI review"
                >
                  {isLoading ? (
                    <>
                      <Spinner />
                      <span style={srOnlyStyles}>Reviewing prompt, please wait...</span>
                    </>
                  ) : (
                    <SendIcon size={18} />
                  )} 
                  Submit for first review
                </button>
              </div>
              {errorMessage && <p className="text-red-500 text-sm text-center">{errorMessage}</p>}
            </form>
          </section>

          <aside className="bg-white border-4 border-black rounded-2xl shadow-lg p-6 flex flex-col h-[calc(100vh-160px)]" aria-labelledby="suggestions-heading">
            <h2 id="suggestions-heading" className="text-xl font-semibold mb-3">Initial suggestions for further enhancements</h2>
            <div ref={chatRef} className="flex-grow overflow-y-auto space-y-3">
              {firstSuggestions.length ? (
                <>
                  <div className="bg-gray-100 rounded-xl p-3 text-gray-800 text-sm">
                    Optional ideas to add richer detail before your first review.
                  </div>
                  {firstSuggestions.map((s, i) => (
                    <div key={i} className="bg-gray-100 rounded-xl p-3 text-gray-800 text-sm">
                      <ReactMarkdown>{`**${s.element}**\n\n${s.suggestion}`}</ReactMarkdown>
                    </div>
                  ))}
                </>
              ) : (
                <div className="bg-gray-100 rounded-xl p-3 text-gray-800 text-sm">
                  Nice work — this already reads strong. Submit for first review when ready.
                </div>
              )}
            </div>
          </aside>
        </main>
      )}

      {/* Stage: First Reviewed (polished draft + all element reviews + optional second suggestions + user's final submission IF NEEDED) */}
      {stage === "firstReviewed" && (
        <main className="max-w-6xl mx-auto p-4 sm:p-6 grid md:grid-cols-2 gap-6">
          <div className="bg-white border-4 border-black rounded-2xl shadow-lg p-6 flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Polished Draft (after first review)</h2>
            <div className="relative">
              <p className="p-4 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800 whitespace-pre-wrap min-h-[120px]">
                {polishedDraft}
              </p>
              <div className="absolute top-2 right-2 flex items-center gap-2">
                <button
                  title="Copy to clipboard"
                  onClick={() => handleCopy(polishedDraft)}
                  className="p-1.5 bg-gray-200 hover:bg-gray-300 rounded text-gray-600 transition-colors"
                  aria-label="Copy polished prompt to clipboard"
                >
                  <CopyIcon size={16} />
                </button>
                {copyFeedback && (
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                    {copyFeedback}
                  </span>
                )}
              </div>
            </div>

            {/* Only show the final submission UI if there are still suggestions to act on */}
            {secondSuggestions.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-gray-700">Apply any final tweaks</h3>
                <form onSubmit={handleFinalReview} className="space-y-3">
                  <textarea
                    value={secondRevision}
                    onChange={(e) => setSecondRevision(e.target.value)}
                    rows={6}
                    className="w-full p-3 border-2 border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-[#0056B3] focus:ring-offset-2 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                    placeholder="Incorporate anything useful, then submit for final review."
                    disabled={isLoading}
                    aria-label="Make final edits before final review"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!secondRevision.trim() || isLoading}
                      className="px-6 py-3 rounded-lg text-white font-bold bg-[#0056B3] hover:bg-[#0044A3] border-2 border-black disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#0056B3] focus:ring-offset-2 active:scale-95 shadow-md"
                      aria-label="Submit your final edits for AI review"
                    >
                      {isLoading ? (
                        <>
                          <Spinner />
                          <span style={srOnlyStyles}>Performing final review, please wait...</span>
                        </>
                      ) : (
                        <SendIcon size={18} />
                      )} 
                      Submit for final review
                    </button>
                  </div>
                  {errorMessage && <p className="text-red-500 text-sm text-center">{errorMessage}</p>}
                </form>
              </>
            )}

            {secondSuggestions.length === 0 && (
              <p className="text-sm text-gray-600">
                Everything looks sufficiently detailed — no further submission needed.
              </p>
            )}
          </div>

          <div className="bg-white border-4 border-black rounded-2xl shadow-lg p-6 flex flex-col h-[calc(100vh-160px)]">
            <h2 className="text-xl font-semibold mb-3">Element reviews</h2>
            <div className="flex-grow overflow-y-auto space-y-2">
              {elementReviews.map((r, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border ${
                    r.isSufficient ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-gray-800">
                    {r.isSufficient ? (
                      <CheckIcon className="text-green-600" size={18} />
                    ) : (
                      <AlertIcon className="text-amber-500" size={18} />
                    )}
                    {r.element}
                  </div>
                  <p className="text-xs text-gray-700 mt-1 pl-7">{r.note}</p>
                </div>
              ))}

              <div className="mt-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Targeted Suggestions</h3>
                {secondSuggestions.length ? (
                  secondSuggestions.map((s, i) => (
                    <div key={i} className="bg-gray-100 rounded-xl p-3 text-gray-800 text-sm mb-2">
                      <ReactMarkdown>{`**${s.element}**\n\n${s.suggestion}`}</ReactMarkdown>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600">No additional suggestions — you’re good to go.</p>
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Stage: Final Reviewed (read-only) */}
      {stage === "finalReviewed" && (
        <main className="max-w-6xl mx-auto p-4 sm:p-6 grid md:grid-cols-2 gap-6">
          <div className="bg-white border-4 border-black rounded-2xl shadow-lg p-6 flex flex-col gap-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              Final Prompt {finalResult?.isReady && <CheckCircle2 className="text-green-600" size={20} />}
            </h2>
            <div className="relative">
              <p className="p-4 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800 whitespace-pre-wrap min-h-[120px]">
                {finalResult?.polishedPrompt || secondRevision || polishedDraft}
              </p>
              <div className="absolute top-2 right-2 flex items-center gap-2">
                <button
                  title="Copy to clipboard"
                  onClick={() => handleCopy(finalResult?.polishedPrompt || secondRevision || polishedDraft)}
                  className="p-1.5 bg-gray-200 hover:bg-gray-300 rounded text-gray-600 transition-colors"
                  aria-label="Copy final prompt to clipboard"
                >
                  <CopyIcon size={16} />
                </button>
                {copyFeedback && (
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                    {copyFeedback}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border-4 border-black rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-3">Final recommendations</h2>
            <div className="p-4 bg-blue-50 border-2 border-[#0056B3] rounded-lg mb-4">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {finalResult?.finalNotes || "Your prompt looks great! Here are some final tips: Try experimenting with different style keywords, adjust the level of detail based on your specific use case, and don't hesitate to iterate further if needed."}
              </p>
            </div>
            <p className="text-xs text-gray-500">
              This session is complete. Use "Start Over" to begin a new prompt.
            </p>
          </div>
        </main>
      )}
    </div>
  );
}
