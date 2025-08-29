// app/prompt-improver-2/page.js
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Copy as CopyIcon,
  RotateCcw as StartOverIcon,
  Check as CheckIcon,
  Circle as CircleIcon,
} from "lucide-react";

const Spinner = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const REQUIRED_ELEMENTS = {
  image: ["Subject", "Action", "Scene/Context", "Style", "Ambiance", "Composition"],
  video: [
    "Subject",
    "Action",
    "Scene/Context",
    "Style",
    "Ambiance",
    "Composition",
    "Camera Motion",
    "Shot Duration",
    "Pacing",
    "Transitions",
  ],
};

// Build a safe fallback prompt from accepted breakdown if API returns empty revisedFullPrompt
const buildFallbackPromptFromBreakdown = (analysisBreakdown = []) => {
  if (!Array.isArray(analysisBreakdown) || analysisBreakdown.length === 0) return "";
  const parts = analysisBreakdown
    .map((it) => (it?.revised || "").trim())
    .filter(Boolean);
  return parts.join(". ").replace(/\.\s*\./g, "."); // tidy double periods
};

const PromptImproverPage = () => {
  const [promptType, setPromptType] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [structuredAnalysis, setStructuredAnalysis] = useState(null);
  const [isRevisedPromptCopied, setIsRevisedPromptCopied] = useState(false);

  // NEW: persistent conversation id (Responses API)
  const [conversationId, setConversationId] = useState(null);

  // Track accepted elements & last accepted full prompt
  const [acceptedElements, setAcceptedElements] = useState([]);
  const [lastAcceptedRevisedPrompt, setLastAcceptedRevisedPrompt] = useState("");

  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const requiredElementsForType = useMemo(
    () => (promptType ? REQUIRED_ELEMENTS[promptType] : []),
    [promptType]
  );

  const scrollToBottomChat = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      const lastMessage = messages[messages.length - 1];
      if ((lastMessage && lastMessage.role === "assistant") || isNearBottom) {
        scrollToBottomChat();
      }
    }
  }, [messages]);

  useEffect(() => {
    if (promptType && inputRef.current) {
      inputRef.current.focus();
    }
  }, [promptType]);

  const startFlowMessage = (type) =>
    `Hello! I'm your AI Prompt Coach. Let's build a great prompt for a **${type}** together.

We'll go step-by-step. First up: **Subject** — the main focus. Please be **specific** (≥5 words) and add descriptors. 
Examples:
- "a weathered red lighthouse on a rocky cliff"
- "an elderly Japanese calligrapher with ink-stained hands"

What is your **Subject**?`;

  const handlePromptTypeSelect = (type) => {
    setPromptType(type);
    setMessages([{ role: "assistant", content: startFlowMessage(type) }]);
    setStructuredAnalysis(null);
    setError(null);
    setInputValue("");
    setIsRevisedPromptCopied(false);
    setAcceptedElements([]);
    setLastAcceptedRevisedPrompt("");
    setConversationId(null); // reset the Responses conversation
  };

  const handleStartOver = () => {
    setPromptType(null);
    setMessages([]);
    setStructuredAnalysis(null);
    setError(null);
    setInputValue("");
    setIsRevisedPromptCopied(false);
    setAcceptedElements([]);
    setLastAcceptedRevisedPrompt("");
    setConversationId(null);
  };

  const handleCopyRevisedPrompt = () => {
    const textToCopy =
      (structuredAnalysis && structuredAnalysis.revisedFullPrompt) ||
      lastAcceptedRevisedPrompt ||
      "";
    if (textToCopy) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          setIsRevisedPromptCopied(true);
          setTimeout(() => setIsRevisedPromptCopied(false), 2000);
        })
        .catch((err) => console.error("Failed to copy full prompt: ", err));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading || !promptType) return;

    const userChatMessage = { role: "user", content: inputValue.trim() };
    const conversationForUI = [...messages, userChatMessage];
    setMessages(conversationForUI);

    // Use last accepted prompt as base (if last turn wasn't accepted, nothing changes)
    const currentPromptToRefineForAPI = lastAcceptedRevisedPrompt || "";

    setInputValue("");
    setLoading(true);
    setError(null);
    setIsRevisedPromptCopied(false);
    setTimeout(() => scrollToBottomChat(), 0);

    const apiPayload = {
      promptType,
      currentPromptToRefine: currentPromptToRefineForAPI,
      userRequest: userChatMessage.content,
      acceptedElements,
      conversationId, // NEW: let the server continue this Responses conversation
    };

    try {
      const response = await fetch("/smo-imc/prompt-improver-2/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.details || "Failed to fetch response from AI.");
      }
      const data = await response.json();

      // Save conversation id returned from server (first turn or resets)
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      const fallbackFromBreakdown = buildFallbackPromptFromBreakdown(data.analysisBreakdown);
      const computedRevisedFullPrompt =
        (data.revisedFullPrompt && data.revisedFullPrompt.trim()) ||
        fallbackFromBreakdown ||
        currentPromptToRefineForAPI;

      if (Array.isArray(data.acceptedElements)) {
        setAcceptedElements(data.acceptedElements);
      }
      if (data.acceptedThisTurn === true) {
        setLastAcceptedRevisedPrompt(computedRevisedFullPrompt);
      }

      setStructuredAnalysis({
        originalFullPrompt: data.originalFullPrompt,
        revisedFullPrompt: computedRevisedFullPrompt,
        analysisBreakdown: Array.isArray(data.analysisBreakdown)
          ? data.analysisBreakdown
          : [],
        pendingElement: data.pendingElement || null,
        acceptedThisTurn: !!data.acceptedThisTurn,
        acceptedElement: data.acceptedElement || null,
        requiredElements: Array.isArray(data.requiredElements)
          ? data.requiredElements
          : requiredElementsForType,
        minDetailPolicy: data.minDetailPolicy || {},
      });

      if (data.chatResponse) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.chatResponse }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I processed your input. See the analysis panel for the current status and next step.",
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.message || "An error occurred. Please try again.";
      setError(errorMessage);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry, I encountered an error: ${errorMessage}.` },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
      setTimeout(() => scrollToBottomChat(), 0);
    }
  };

  const progressCount = acceptedElements.length;
  const progressTotal = requiredElementsForType.length;
  const percent = progressTotal ? Math.round((progressCount / progressTotal) * 100) : 0;

  return (
    <div
      className="min-h-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex flex-col p-4"
      style={{ minHeight: promptType ? "800px" : "auto" }}
    >
      <header className="w-full max-w-6xl mx-auto bg-indigo-600 text-white p-4 rounded-t-lg mb-4 flex-shrink-0 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-center flex-grow">AI Prompt Coach</h1>
        {promptType && (
          <button
            onClick={handleStartOver}
            className="ml-4 p-2 text-sm bg-indigo-500 hover:bg-indigo-400 rounded-md flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
            title="Start Over"
          >
            <StartOverIcon className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Start Over</span>
          </button>
        )}
      </header>

      {!promptType ? (
        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="bg-white p-8 sm:p-12 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 sm:mb-8 text-center">
              What are you creating a prompt for?
            </h2>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => handlePromptTypeSelect("image")}
                className="flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-base sm:text-lg transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 w-full"
              >
                <ImageIcon className="mr-2 h-5 w-5 sm:h-6 sm:w-6" /> Image
              </button>
              <button
                onClick={() => handlePromptTypeSelect("video")}
                className="flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-base sm:text-lg transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 w-full"
              >
                <VideoIcon className="mr-2 h-5 w-5 sm:h-6 sm:w-6" /> Video
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-grow w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
          {/* Left: Analysis / Progress */}
          {structuredAnalysis && (
            <div className="bg-white shadow-xl rounded-lg p-6 flex flex-col h-[650px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-indigo-700 py-2 flex-shrink-0">
                  Prompt Analysis <span className="text-sm font-normal text-gray-500">({promptType})</span>
                </h2>
              </div>

              <div className="mb-4">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-indigo-500 transition-all"
                    style={{ width: `${percent}%` }}
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {progressCount} / {progressTotal} elements added
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {requiredElementsForType.map((el) => {
                    const accepted = acceptedElements.includes(el);
                    return (
                      <span
                        key={el}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          accepted ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}
                        title={accepted ? "Accepted" : "Pending"}
                      >
                        {accepted ? <CheckIcon className="h-3 w-3 mr-1" /> : <CircleIcon className="h-3 w-3 mr-1" />}
                        {el}
                      </span>
                    );
                  })}
                </div>

                {structuredAnalysis.pendingElement && (
                  <div className="mt-3 text-sm">
                    <span className="font-semibold text-gray-700">Currently collecting:</span>{" "}
                    <span className="text-indigo-700">{structuredAnalysis.pendingElement}</span>
                  </div>
                )}
              </div>

              <div className="flex-grow overflow-y-auto">
                <div className="space-y-6">
                  <div className="relative">
                    <h3 className="text-lg font-medium text-green-700 mb-1">Full Prompt (so far):</h3>
                    <p className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-gray-800 whitespace-pre-wrap">
                      {structuredAnalysis.revisedFullPrompt || lastAcceptedRevisedPrompt || "N/A"}
                    </p>
                    {(structuredAnalysis.revisedFullPrompt || lastAcceptedRevisedPrompt) && (
                      <button
                        onClick={handleCopyRevisedPrompt}
                        title="Copy full prompt"
                        className="absolute top-0 right-0 mt-1 mr-1 p-1.5 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 transition-colors"
                        aria-label="Copy full prompt to clipboard"
                      >
                        {isRevisedPromptCopied ? <span className="text-xs px-1">Copied!</span> : <CopyIcon className="h-4 w-4" />}
                      </button>
                    )}
                  </div>

                  {structuredAnalysis.analysisBreakdown && structuredAnalysis.analysisBreakdown.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-700 mb-2 mt-4">Element Breakdown:</h3>
                      <div className="space-y-3">
                        {structuredAnalysis.analysisBreakdown.map((item, idx) => (
                          <div key={`${item.element}-${idx}`} className="p-3 border border-gray-200 rounded-md bg-gray-50">
                            <p className="font-semibold text-indigo-600">{item.element}</p>
                            <p className="text-xs text-green-600 mt-1">
                              <span className="font-medium">Details:</span> {item.revised}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Right: Chat */}
          <div className={`bg-white shadow-xl rounded-lg flex flex-col h-[650px] ${!structuredAnalysis ? "md:col-span-2" : ""}`}>
            <div ref={chatContainerRef} className="flex-grow p-6 space-y-4 overflow-y-auto">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] p-3 rounded-xl shadow ${
                      msg.role === "user" ? "bg-indigo-500 text-white" : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {error && !loading && (
                <div className="text-red-500 text-center p-2 bg-red-100 rounded" role="alert">
                  Error: {error}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white rounded-b-lg flex-shrink-0">
              <div className="flex items-center space-x-2">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    promptType
                      ? `Add details for ${structuredAnalysis?.pendingElement || "the next element"}...`
                      : "Select prompt type first"
                  }
                  rows={3}
                  className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  disabled={loading || !promptType}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !inputValue.trim() || !promptType}
                  className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors flex items-center justify-center ${
                    loading || !inputValue.trim() || !promptType
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  }`}
                >
                  {loading ? <Spinner /> : "Send"}
                </button>
              </div>
              {structuredAnalysis?.pendingElement && (
                <div className="text-xs text-gray-500 mt-2">
                  Tip: Provide concrete specifics (min words required for <span className="font-medium">{structuredAnalysis.pendingElement}</span>).
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptImproverPage;
