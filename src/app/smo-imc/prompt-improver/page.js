// app/prompt-improver/page.js
"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Simple SVG Spinner component
const Spinner = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const PromptImproverPage = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI Prompt Engineering Assistant. Paste your initial prompt for image or video generation below, and I'll help you refine it.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [structuredAnalysis, setStructuredAnalysis] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null); // Ref for the scrollable chat message area

  const scrollToBottomChat = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Scroll to bottom only if the user is already near the bottom
    // This prevents snapping if the user has scrolled up to read previous messages
    if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        // The '50' is a threshold in pixels. Adjust as needed.
        if (scrollHeight - scrollTop - clientHeight < 50) {
            scrollToBottomChat();
        }
    }
  }, [messages]);


  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const newUserMessage = { role: "user", content: inputValue.trim() };
    const currentConversation = [...messages, newUserMessage];
    setMessages(currentConversation);
    setInputValue("");
    setLoading(true);
    setError(null);

    // Make the user's new message visible before API call starts
    // Use a timeout to allow DOM to update then scroll
    setTimeout(() => scrollToBottomChat(), 0);


    try {
      const response = await fetch("/smo-imc/prompt-improver/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentConversation.slice(-6)
                                         .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.details || "Failed to fetch response from AI.");
      }

      const data = await response.json();

      if (data.originalFullPrompt || data.revisedFullPrompt || data.analysisBreakdown) {
        setStructuredAnalysis({
            originalFullPrompt: data.originalFullPrompt,
            revisedFullPrompt: data.revisedFullPrompt,
            analysisBreakdown: data.analysisBreakdown || [],
        });
      }

      if (data.chatResponse) {
        const aiChatMessage = { role: "assistant", content: data.chatResponse };
        setMessages((prevMessages) => [...prevMessages, aiChatMessage]);
      } else {
        const fallbackMessage = { role: "assistant", content: "I've processed your request. Please see the analysis panel." };
        setMessages((prevMessages) => [...prevMessages, fallbackMessage]);
      }

    } catch (err) {
      console.error(err);
      const errorMessage = err.message || "An error occurred. Please try again.";
      setError(errorMessage);
      setMessages((prevMessages) => [...prevMessages, {role: "assistant", content: `Sorry, I encountered an error: ${errorMessage}.`}]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
      // Scroll to bottom again after AI response is added
      setTimeout(() => scrollToBottomChat(), 0);
    }
  };

  return (
    // Use min-h-full if this component itself is meant to fill its parent.
    // If it's the outermost page component, min-h-screen is often for full viewport height.
    // For this layout, we want the content to define the height, and the outer div to allow scrolling if content overflows.
    <div className="min-h-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex flex-col p-4">
      <header className="w-full max-w-6xl mx-auto bg-indigo-600 text-white p-4 rounded-t-lg mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-center">AI Prompt Improver</h1>
      </header>

      {/* Main content area that grows and allows internal scrolling */}
      <div className="flex-grow w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
{/* Panel for Structured Prompt Analysis */}
        {/* Make this panel scrollable independently */}
        <div className="bg-white shadow-xl rounded-lg p-6 flex flex-col overflow-y-auto h-auto md:max-h-[calc(100vh-160px)]"> {/* Adjusted max-height */}
          <h2 className="text-xl font-semibold text-indigo-700 mb-4 py-2"> {/* <<<< REMOVED sticky top-0 bg-white z-10 */}
            Prompt Analysis
          </h2>
          <div className="flex-grow"> {/* This div will allow content to push sticky header and then scroll */}
            {structuredAnalysis ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-1">Original Prompt:</h3>
                  <p className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-gray-800 whitespace-pre-wrap">
                    {structuredAnalysis.originalFullPrompt || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-green-700 mb-1">Revised Prompt:</h3>
                  <p className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-gray-800 whitespace-pre-wrap">
                    {structuredAnalysis.revisedFullPrompt || "N/A"}
                  </p>
                </div>
                {structuredAnalysis.analysisBreakdown && structuredAnalysis.analysisBreakdown.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Element Breakdown:</h3>
                    <div className="space-y-3">
                      {structuredAnalysis.analysisBreakdown.map((item, index) => (
                        <div key={index} className="p-3 border border-gray-200 rounded-md bg-gray-50">
                          <p className="font-semibold text-indigo-600">{item.element}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            <span className="font-medium">Original:</span> {item.original}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            <span className="font-medium">Revised:</span> {item.revised}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center mt-10">
                Submit a prompt to see the analysis here.
              </p>
            )}
          </div>
        </div>

        {/* Panel for Chat Interface */}
        {/* Ensure this panel also manages its own scrolling and height */}
        <div className="bg-white shadow-xl rounded-lg flex flex-col overflow-hidden md:max-h-[calc(100vh-160px)]"> {/* Adjusted max-height */}
          <div ref={chatContainerRef} className="flex-grow p-6 space-y-4 overflow-y-auto"> {/* Scrollable message area */}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl shadow ${
                    msg.role === "user"
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} /> {/* For initial scroll to this point if needed, less critical now */}
             {/* Error message display */}
            {error && !loading && (
              <div className="text-red-500 text-center p-2 bg-red-100 rounded" role="alert">
                Error: {error}
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-gray-200 bg-white rounded-b-lg flex-shrink-0"
          >
            <div className="flex items-center space-x-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter your prompt here..."
                rows={3}
                className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }}}
              />
              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors flex items-center justify-center
                  ${loading || !inputValue.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  }`}
              >
                {loading ? <Spinner /> : "Send"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PromptImproverPage;