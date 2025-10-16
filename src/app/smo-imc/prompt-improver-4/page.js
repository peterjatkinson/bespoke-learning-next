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
  Info as InfoIcon,
  X as CloseIcon,
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
  "Camera motion",
  "Shot duration",
  "Pacing",
];

const placeholders = {
  Subject: "e.g. a sleek running shoe on a pedestal",
  Style: "e.g. cinematic noir / watercolor / realistic",
  Action: "e.g. splashing through water, being laced up",
  Scene: "e.g. urban rooftop at sunrise, studio with neon lights",
  Ambiance: "e.g. energetic, vibrant",
  Composition: "e.g. close-up with product centred, wide shot with logo",
  "Camera motion": "e.g. slow pan across product, quick zoom in",
  "Shot duration": "e.g. 3-second hero shot, 1-second cutaway",
  Pacing: "e.g. fast-paced for excitement, slow for luxury",
};


const elementExplanations = {
  Subject: "The main focus of your video or image (e.g. 'A golden retriever puppy,' 'A majestic Hawaiian waterfall,' 'An elderly Caucasian sailor').",
  Action: "What the subject is doing (e.g. 'swimming in the ocean,' 'running through a meadow,' 'rowing a wooden boat,' 'sitting upright in a 1980s kitchen').",
  Composition: "How the scene is framed (e.g. 'wide shot,' 'low-angle,' 'aerial view,' 'close-up,' 'medium shot,' 'tracking shot,' 'panning shot,' 'dolly in').",
  Scene: "The location or environment of the shot (e.g. 'busy street,' 'space,' 'beach,' 'lush tropical rainforest,' 'magical ice cave,' 'moonlit sky above a forest').",
  "Camera motion": "How the camera moves (e.g. 'panning,' 'zooming,' 'tracking,' 'gracefully moves,' 'floats gently').",
  Ambiance: "How color and light contribute to the scene's mood (e.g. 'blue tones,' 'night,' 'foggy,' 'golden hour light,' 'dramatic shadows,' 'soft diffused lighting,' 'eerie green neon glow').",
  Style: "The artistic style or vibe you want (e.g. 'cinematic,' 'retro,' 'cartoon,' 'photorealistic,' 'voxel art illustration,' 'minimalistic,' 'surreal,' 'vintage,' 'futuristic').",
  "Shot duration": "How long each individual shot lasts (e.g. '3-second quick cuts,' '10-second lingering shot,' 'brief 2-second glimpse,' 'extended 15-second take'). This helps control the pacing and rhythm of your video.",
  Pacing: "The overall rhythm and speed of your video (e.g. 'fast-paced with quick transitions,' 'slow and contemplative,' 'building momentum,' 'steady rhythm'). This affects how viewers experience the flow and energy of your content."
};

export default function PromptBuilder() {
  // stages: collect -> built -> firstReviewed -> finalReviewed
  const [stage, setStage] = useState("collect");
  const [promptType, setPromptType] = useState(null);
  const [elements, setElements] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Modal state
  const [activeModal, setActiveModal] = useState(null);
  const modalRef = useRef(null);
  const triggerRef = useRef(null);

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
  const loadingIntervalRef = useRef(null);
  const initialPromptHeadingRef = useRef(null);
  const polishedDraftHeadingRef = useRef(null);
  const finalPromptHeadingRef = useRef(null);

  const activeElements = useMemo(
    () => (promptType === "video" ? VIDEO_ELEMENTS : IMAGE_ELEMENTS),
    [promptType]
  );

  const handleElementChange = (el, value) => setElements((prev) => ({ ...prev, [el]: value }));

  // Helper: create new div each time to force VoiceOver to read it
  const announce = (message, type = 'polite', callback = null) => {
    const region = type === 'assertive' ? liveRegionRef : statusRegionRef;

    if (region.current) {
      const node = document.createElement('div');
      node.textContent = message;
      region.current.appendChild(node);

      // Clean up to avoid DOM clutter
      setTimeout(() => {
        if (region.current && node.parentNode) {
          region.current.removeChild(node);
        }
        if (callback) callback();
      }, 1000);
    }
  };

  // Repeating announcement for loading states
  const startLoadingAnnouncements = (message) => {
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
    }

    announce(message, "assertive");

    loadingIntervalRef.current = setInterval(() => {
      announce(message, "assertive");
    }, 5000);
  };

  const stopLoadingAnnouncements = () => {
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
  };

  const handleStartOver = () => {
    stopLoadingAnnouncements();
    setStage("collect");
    setPromptType(null);
    setElements({});
    setIsLoading(false);
    setActiveModal(null);

    setInitialPrompt("");
    setFirstSuggestions([]);

    setFirstRevision("");
    setPolishedDraft("");
    setElementReviews([]);
    setSecondSuggestions([]);
    setSecondRevision("");

    setFinalResult(null);
    setErrorMessage("");

    announce("Form reset", "assertive");
  };

  const openModal = (elementName) => {
    triggerRef.current = document.activeElement;
    setActiveModal(elementName);
  };

  const closeModal = () => {
    setActiveModal(null);
    if (triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && activeModal) {
        closeModal();
      }
    };

    if (activeModal) {
      document.addEventListener('keydown', handleEscape);
      // Focus the modal when it opens
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 0);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [activeModal]);

  // Cleanup loading announcements on unmount
  useEffect(() => {
    return () => {
      stopLoadingAnnouncements();
    };
  }, []);

  // Trap focus within modal
  const handleModalKeyDown = (e) => {
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0];
      const lastElement = focusableElements?.[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    }
  };

  /* ---------------- Stage 1: Build from elements ---------------- */
  // Check if at least one field has content
  const hasAnyContent = () => {
    return Object.values(elements).some(value => value && value.trim().length > 0);
  };

  const handleBuild = async (e) => {
    e.preventDefault();
    if (!promptType || !hasAnyContent()) return;
    setIsLoading(true);
    setErrorMessage("");
    setLoadingMessage("Building your initial prompt...");
    startLoadingAnnouncements("Building your initial prompt, please wait.");

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
      announce("Initial prompt created!", "polite", () => {
        // Focus the initial prompt heading after the announcement finishes
        if (initialPromptHeadingRef.current) {
          initialPromptHeadingRef.current.focus();
        }
      });
    } catch (err) {
      setErrorMessage(err.message);
      announce(`Error: ${err.message}`, "assertive");
    } finally {
      stopLoadingAnnouncements();
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
    startLoadingAnnouncements("Reviewing your prompt, please wait.");

    try {
      const res = await fetch(API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "midReview", promptType, draftPrompt: firstRevision }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.details || err.error || "Review failed.");
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
      announce("Review complete!", "polite", () => {
        // Focus the polished draft heading after the announcement finishes
        if (polishedDraftHeadingRef.current) {
          polishedDraftHeadingRef.current.focus();
        }
      });
    } catch (err) {
      setErrorMessage(err.message);
      announce(`Error: ${err.message}`, "assertive");
    } finally {
      stopLoadingAnnouncements();
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
    startLoadingAnnouncements("Performing final review of your prompt, please wait.");

    try {
      const res = await fetch(API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "finalReview", revisedPrompt: secondRevision, promptType }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.details || err.error || "Final review failed.");
      }
      const data = await res.json();
      setFinalResult(data);
      setStage("finalReviewed");
      announce("Final review complete!", "polite", () => {
        // Focus the final prompt heading after the announcement finishes
        if (finalPromptHeadingRef.current) {
          finalPromptHeadingRef.current.focus();
        }
      });
    } catch (err) {
      setErrorMessage(err.message);
      announce(`Error: ${err.message}`, "assertive");
    } finally {
      stopLoadingAnnouncements();
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback("Copied!");
      announce("Prompt copied to clipboard");
      setTimeout(() => setCopyFeedback(""), 2000);
    } catch (error) {
      // Fallback for older browsers or when clipboard API fails
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.style.opacity = '0';
        textArea.style.pointerEvents = 'none';
        textArea.setAttribute('readonly', '');
        textArea.setAttribute('tabindex', '-1');
        document.body.appendChild(textArea);
        
        // Prevent focus from changing scroll position
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
        
        textArea.select();
        document.execCommand('copy');
        
        // Restore scroll position if it changed
        if (document.documentElement.scrollTop !== scrollTop || document.body.scrollTop !== scrollTop) {
          window.scrollTo(scrollLeft, scrollTop);
        }
        
        textArea.remove();
        setCopyFeedback("Copied!");
        announce("Prompt copied to clipboard");
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
        aria-atomic="false"
        aria-live="assertive"
        aria-relevant="additions"
      >
        {/* announcements injected here */}
      </div>
      <div
        ref={statusRegionRef}
        style={srOnlyStyles}
        role="status"
        aria-atomic="true"
        aria-live="polite"
      >
        {/* polite updates */}
      </div>

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
            {!promptType && <p className="text-sm text-gray-600">Pick image or video to see the relevant fields.</p>}
            {promptType && (
              <form onSubmit={handleBuild} className="space-y-3">
                {(promptType === "video" ? VIDEO_ELEMENTS : IMAGE_ELEMENTS).map((el) => (
                  <div key={el} className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-sm font-medium text-gray-700">{el}</label>
                      <button
                        type="button"
                        onClick={() => openModal(el)}
                        className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0056B3] focus:ring-offset-1 transition-colors"
                        aria-label={`Learn more about ${el}`}
                        title={`Learn more about ${el}`}
                      >
                        <InfoIcon size={14} className="text-gray-500" />
                      </button>
                    </div>
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
                    disabled={!promptType || !hasAnyContent() || isLoading}
                    className="px-6 py-3 rounded-lg text-white font-bold bg-[#0056B3] border-2 border-black flex items-center gap-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#0056B3] focus:ring-offset-2 shadow-md enabled:hover:bg-[#0044A3] enabled:active:scale-95 disabled:bg-gray-400 disabled:cursor-default disabled:pointer-events-none disabled:transform-none disabled:shadow-none"
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
  <ul className="text-sm text-gray-600 list-disc pl-5 space-y-2">
    <li>
      This tool helps you build clear, detailed prompts for marketing images and videos. Just fill in the fields you want to include.
    </li>
    <li>
      In the <strong>Subject</strong> field, ensure you describe your product or the person/people/object you want to be depicted in the image. 
    </li>
    <li>For <strong>Style</strong>, you may wish to refer to your company/brand colours or other brand design features, as well as the artistic style you want for the image more generally.</li>
    <li>
      Use the <strong>Action</strong> and <strong>Scene</strong> fields to set the context and mood. Think about what’s happening and where.
    </li>
    <li>
      <strong>Ambiance</strong> and <strong>Composition</strong> help control lighting, atmosphere and how the product is framed.
    </li>
    <li>
      
      For video prompts, you can also add <strong>Camera motion</strong>, <strong>Shot duration</strong> and <strong>Pacing</strong> to guide the energy and flow.
    </li>
    <li>
      You can leave some fields blank, but you must fill in at least one field to build an initial prompt. The prompt builder will only use what you provide.
    </li>
    <li>
      Try different combinations and levels of detail to see what works best for your campaign.
    </li>
  </ul>
</aside>        </main>
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
            <h2
              id="initial-prompt-heading"
              ref={initialPromptHeadingRef}
              className="text-xl font-semibold"
              tabIndex={-1}
            >
              Initial prompt suggestion
            </h2>
            <div className="relative">
              <p className="p-4 pr-12 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800 whitespace-pre-wrap min-h-[120px]">
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

            <h3 className="text-sm font-semibold text-gray-700">Your revision</h3>
            <form onSubmit={handleFirstReview} className="space-y-3">
              <textarea
                value={firstRevision}
                onChange={(e) => setFirstRevision(e.target.value)}
                rows={6}
                className="w-full p-3 border-2 border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-[#0056B3] focus:ring-offset-2 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                placeholder="Make edits, add detail, then submit for review."
                disabled={isLoading}
                aria-label="Edit your prompt before review"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!firstRevision.trim() || isLoading}
                  className="px-6 py-3 rounded-lg text-white font-bold bg-[#0056B3] hover:bg-[#0044A3] border-2 border-black disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#0056B3] focus:ring-offset-2 active:scale-95 shadow-md"
                  aria-label="Submit your revision for review"
                >
                  {isLoading ? (
                    <>
                      <Spinner />
                      <span style={srOnlyStyles}>Reviewing prompt, please wait...</span>
                    </>
                  ) : (
                    <SendIcon size={18} />
                  )} 
                  Submit for review
                </button>
              </div>
              {errorMessage && <p className="text-red-500 text-sm text-center">{errorMessage}</p>}
            </form>
          </section>

          <aside className="bg-white border-4 border-black rounded-2xl shadow-lg p-6 flex flex-col h-[650px]" aria-labelledby="suggestions-heading">
            <h2 id="suggestions-heading" className="text-xl font-semibold mb-3">Initial suggestions for further enhancements</h2>
            <div ref={chatRef} className="flex-grow overflow-y-auto">
              {firstSuggestions.length ? (
                <>
                  <div className="bg-gray-100 rounded-xl p-3 text-gray-800 text-sm mb-3">
                    Optional ideas to add richer detail before your AI review.
                  </div>
                  <ul className="space-y-3" aria-label="Enhancement suggestions">
                    {firstSuggestions.map((s, i) => (
                      <li key={i} className="bg-gray-100 rounded-xl p-3 text-gray-800 text-sm">
                        <ReactMarkdown>{`**${s.element}**\n\n${s.suggestion}`}</ReactMarkdown>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="bg-gray-100 rounded-xl p-3 text-gray-800 text-sm">
                  Nice work — this already reads strong. Submit for review when ready.
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
            <h2
              ref={polishedDraftHeadingRef}
              className="text-xl font-semibold"
              tabIndex={-1}
            >
              Current draft (after review)
            </h2>
            <div className="relative">
              <p className="p-4 pr-12 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800 whitespace-pre-wrap min-h-[120px]">
                {polishedDraft}
              </p>
              <div className="absolute top-2 right-2 flex items-center gap-2">
                <button
                  title="Copy to clipboard"
                  onClick={() => handleCopy(polishedDraft)}
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
                      aria-label="Submit your final edits for review"
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

          <div className="bg-white border-4 border-black rounded-2xl shadow-lg p-6 flex flex-col h-[650px]">
            <h2 className="text-xl font-semibold mb-3">Element reviews</h2>
            <div className="flex-grow overflow-y-auto">
              <ul className="space-y-2" aria-label="Element review status">
                {elementReviews.map((r, i) => (
                  <li
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
                  </li>
                ))}
              </ul>

              <div className="mt-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Targeted Suggestions</h3>
                {secondSuggestions.length ? (
                  <ul className="space-y-2" aria-label="Targeted suggestions for improvement">
                    {secondSuggestions.map((s, i) => (
                      <li key={i} className="bg-gray-100 rounded-xl p-3 text-gray-800 text-sm">
                        <ReactMarkdown>{`**${s.element}**\n\n${s.suggestion}`}</ReactMarkdown>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">No additional suggestions — you're good to go.</p>
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
            <h2
              ref={finalPromptHeadingRef}
              className="text-xl font-semibold flex items-center gap-2"
              tabIndex={-1}
            >
              Final prompt {finalResult?.isReady && <CheckCircle2 className="text-green-600" size={20} />}
            </h2>
            <div className="relative">
              <p className="p-4 pr-12 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800 whitespace-pre-wrap min-h-[120px]">
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
            <div className={`p-4 rounded-lg mb-4 border-2 ${
              finalResult?.isReady
                ? "bg-green-50 border-green-300"
                : "bg-amber-50 border-amber-300"
            }`}>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {finalResult?.finalNotes || "Analysis in progress..."}
              </p>
            </div>
            <p className="text-xs text-gray-600">
              This session is complete. Click 'Start over' to begin a new prompt.
            </p>
          </div>
        </main>
      )}

      {/* Modal */}
      {activeModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 backdrop-blur-sm z-40"
            onClick={closeModal}
            aria-hidden="true"
          />
          
          {/* Modal */}
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            <div 
              ref={modalRef}
              className="bg-white border-4 border-black rounded-2xl shadow-xl max-w-md w-full p-6 pointer-events-auto"
              onKeyDown={handleModalKeyDown}
              tabIndex={-1}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 id="modal-title" className="text-lg font-semibold text-gray-800">
                  {activeModal}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0056B3] focus:ring-offset-1 transition-colors"
                  aria-label="Close dialog"
                >
                  <CloseIcon size={20} className="text-gray-500" />
                </button>
              </div>
              <p id="modal-description" className="text-sm text-gray-700 leading-relaxed">
                {elementExplanations[activeModal] || "No explanation available for this element."}
              </p>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-[#0056B3] hover:bg-[#0044A3] text-white font-semibold rounded-lg focus:outline-none focus:ring-4 focus:ring-[#0056B3] focus:ring-offset-2 transition-all duration-200 active:scale-95"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
