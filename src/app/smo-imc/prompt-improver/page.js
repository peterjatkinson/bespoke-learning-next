// app/prompt-improver/page.js
"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

  const scrollToBottomChat = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottomChat();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const newUserMessage = { role: "user", content: inputValue.trim() };
    const currentConversation = [...messages, newUserMessage];
    setMessages(currentConversation); // Add user message to chat immediately
    setInputValue("");
    setLoading(true);
    setError(null);
    // setStructuredAnalysis(null); // Optionally clear previous analysis

    try {
      const response = await fetch("/smo-imc/prompt-improver/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send relevant part of conversation history for context
        body: JSON.stringify({
          messages: currentConversation.slice(-6) // Send last N messages for context (adjust N as needed)
                                         .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.details || "Failed to fetch response from AI.");
      }

      const data = await response.json(); // Expecting JSON with structuredAnalysis and chatResponse

      if (data.structuredAnalysis || data.revisedFullPrompt) { // Check if structured data is present
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
        // Fallback if chatResponse is missing but other data might be there
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
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex flex-col p-4">
      <header className="w-full max-w-6xl mx-auto bg-indigo-600 text-white p-4 rounded-t-lg mb-4">
        <h1 className="text-2xl font-bold text-center">AI Prompt Improver</h1>
      </header>

      <div className="flex-grow w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Panel for Structured Prompt Analysis */}
        <div className="bg-white shadow-xl rounded-lg p-6 flex flex-col h-[calc(100vh-150px)] md:h-auto md:min-h-[calc(100vh-120px)] overflow-y-auto">
          <h2 className="text-xl font-semibold text-indigo-700 mb-4 sticky top-0 bg-white py-2">
            Prompt Analysis
          </h2>
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

        {/* Panel for Chat Interface */}
        <div className="bg-white shadow-xl rounded-lg flex flex-col h-[calc(100vh-150px)] md:min-h-[calc(100vh-120px)]">
          <div className="flex-grow p-6 space-y-4 overflow-y-auto">
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
            <div ref={messagesEndRef} />
            {error && !loading && ( // Show error only if not loading
              <div className="text-red-500 text-center p-2 bg-red-100 rounded" role="alert">
                Error: {error}
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-gray-200 bg-white rounded-b-lg"
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
                className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors
                  ${loading || !inputValue.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  }`}
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PromptImproverPage;