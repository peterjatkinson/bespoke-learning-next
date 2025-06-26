// app/prompt-improver/page.js
"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Image as ImageIcon, Video as VideoIcon, Copy as CopyIcon, RotateCcw as StartOverIcon } from "lucide-react";

const Spinner = () => (
  <svg
    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const PromptImproverPage = () => {
  const [promptType, setPromptType] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [structuredAnalysis, setStructuredAnalysis] = useState(null);
  const [isRevisedPromptCopied, setIsRevisedPromptCopied] = useState(false);
  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false); // New state to track if first prompt was submitted

  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

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
      if ((lastMessage && lastMessage.role === 'assistant') || isNearBottom) {
        scrollToBottomChat();
      }
    }
  }, [messages]);

  useEffect(() => {
    if (promptType && inputRef.current) {
      inputRef.current.focus();
    }
  }, [promptType]);

  const handlePromptTypeSelect = (type) => {
    setPromptType(type);
    setMessages([{ role: "assistant", content: `Great! You're working on a prompt for a **${type}**. Paste your initial prompt below, and I'll help you refine it.` }]);
    setStructuredAnalysis(null);
    setError(null);
    setInputValue("");
    setIsRevisedPromptCopied(false);
    setHasSubmittedOnce(false); // Reset on type change
  };

  const handleStartOver = () => {
    setPromptType(null);
    setMessages([]);
    setStructuredAnalysis(null);
    setError(null);
    setInputValue("");
    setIsRevisedPromptCopied(false);
    setHasSubmittedOnce(false);
  };

  const handleCopyRevisedPrompt = () => {
    if (structuredAnalysis && structuredAnalysis.revisedFullPrompt) {
      navigator.clipboard.writeText(structuredAnalysis.revisedFullPrompt).then(() => {
        setIsRevisedPromptCopied(true);
        setTimeout(() => setIsRevisedPromptCopied(false), 2000);
      }).catch(err => console.error('Failed to copy revised prompt: ', err));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading || !promptType) return;

    const userChatMessage = { role: "user", content: inputValue.trim() };
    const conversationForAPI = [...messages, userChatMessage];
    setMessages(conversationForAPI);
    
    // Determine the base prompt for this iteration for the API
    // If structuredAnalysis exists and has a revisedFullPrompt, use that as the base for further refinement.
    // Otherwise (first submission for this promptType session), the inputValue IS the base prompt.
    const currentPromptToRefineForAPI = (structuredAnalysis && structuredAnalysis.revisedFullPrompt) 
                                      ? structuredAnalysis.revisedFullPrompt 
                                      : inputValue.trim();

    setInputValue("");
    setLoading(true);
    setError(null);
    setIsRevisedPromptCopied(false);
    setTimeout(() => scrollToBottomChat(), 0);

    const apiPayload = {
        promptType: promptType,
        currentPromptToRefine: currentPromptToRefineForAPI,
        userRequest: userChatMessage.content, // This is always the user's latest typed input
        // Send recent chat history for conversational context (excluding the very last user message already part of userRequest)
        chatHistory: conversationForAPI.slice(0, -1) // All messages except the last one
                                      .slice(-5) // Take last 5 from that, for brevity
                                      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
                                      .map(msg => ({role: msg.role, content: msg.content})) 
    };

    try {
      const response = await fetch("/smo-imc/prompt-improver/api", { // YOUR API PATH
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.details || "Failed to fetch response from AI.");
      }
      const data = await response.json(); 
      
      setStructuredAnalysis({
          originalFullPrompt: data.originalFullPrompt, // AI should return currentPromptToRefineForAPI here
          revisedFullPrompt: data.revisedFullPrompt,
          analysisBreakdown: data.analysisBreakdown || [],
      });
      setHasSubmittedOnce(true); // Mark that at least one submission has happened
      
      if (data.chatResponse) {
        setMessages((prevMessages) => [...prevMessages, { role: "assistant", content: data.chatResponse }]);
      } else {
        setMessages((prevMessages) => [...prevMessages, { role: "assistant", content: "I've processed your request. Please see the analysis panel." }]);
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.message || "An error occurred. Please try again.";
      setError(errorMessage);
      setMessages((prevMessages) => [...prevMessages, {role: "assistant", content: `Sorry, I encountered an error: ${errorMessage}.`}]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
      setTimeout(() => scrollToBottomChat(), 0);
    }
  };

  return (
    <div 
        className="min-h-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex flex-col p-4"
        style={{ minHeight: promptType ? '800px' : 'auto' }}
    >
      <header className="w-full max-w-6xl mx-auto bg-indigo-600 text-white p-4 rounded-t-lg mb-4 flex-shrink-0 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-center flex-grow">AI Prompt Improver</h1>
        {promptType && (
          <button onClick={handleStartOver} className="ml-4 p-2 text-sm bg-indigo-500 hover:bg-indigo-400 rounded-md flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300" title="Start Over">
            <StartOverIcon className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Start Over</span>
          </button>
        )}
      </header>

      {!promptType ? (
        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="bg-white p-8 sm:p-12 rounded-lg shadow-xl w-full max-w-lg">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 sm:mb-8 text-center">What are you creating a prompt for?</h2>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button onClick={() => handlePromptTypeSelect('image')} className="flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-base sm:text-lg transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 w-full">
                <ImageIcon className="mr-2 h-5 w-5 sm:h-6 sm:w-6" /> Image
              </button>
              <button onClick={() => handlePromptTypeSelect('video')} className="flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-base sm:text-lg transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 w-full">
                <VideoIcon className="mr-2 h-5 w-5 sm:h-6 sm:w-6" /> Video
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-grow w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
          <div className="bg-white shadow-xl rounded-lg p-6 flex flex-col h-[650px]">
            <h2 className="text-xl font-semibold text-indigo-700 mb-4 py-2 flex-shrink-0">Prompt Analysis <span className="text-sm font-normal text-gray-500">({promptType})</span></h2>
            <div className="flex-grow overflow-y-auto">
              {structuredAnalysis ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-1">
                      {/* Change label after first submission */}
                      {hasSubmittedOnce && messages.filter(m => m.role === 'user').length > 1 ? "Previous Prompt:" : "Original Prompt:"}
                    </h3>
                    <p className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-gray-800 whitespace-pre-wrap">
                      {structuredAnalysis.originalFullPrompt || "N/A"}
                    </p>
                  </div>
                  <div className="relative">
                    <h3 className="text-lg font-medium text-green-700 mb-1">Revised Prompt:</h3>
                    <p className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-gray-800 whitespace-pre-wrap">
                      {structuredAnalysis.revisedFullPrompt || "N/A"}
                    </p>
                    {structuredAnalysis.revisedFullPrompt && (
                      <button onClick={handleCopyRevisedPrompt} title="Copy revised prompt" className="absolute top-0 right-0 mt-1 mr-1 p-1.5 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 transition-colors" aria-label="Copy revised prompt to clipboard">
                        {isRevisedPromptCopied ? <span className="text-xs px-1">Copied!</span> : <CopyIcon className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                  {structuredAnalysis.analysisBreakdown && structuredAnalysis.analysisBreakdown.length > 0 && (
                     <div>
                      <h3 className="text-lg font-medium text-gray-700 mb-2 mt-4">Element Breakdown:</h3>
                      <div className="space-y-3">
                        {structuredAnalysis.analysisBreakdown.map((item, indexItem) => (
                          <div key={indexItem} className="p-3 border border-gray-200 rounded-md bg-gray-50">
                            <p className="font-semibold text-indigo-600">{item.element}</p>
                            <p className="text-xs text-gray-500 mt-1"><span className="font-medium">Original:</span> {item.original}</p>
                            <p className="text-xs text-green-600 mt-1"><span className="font-medium">Revised:</span> {item.revised}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : <p className="text-gray-500 text-center mt-10">Enter your {promptType} prompt in the chat to see the analysis.</p>}
            </div>
          </div>
          <div className="bg-white shadow-xl rounded-lg flex flex-col h-[650px]">
            <div ref={chatContainerRef} className="flex-grow p-6 space-y-4 overflow-y-auto">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] p-3 rounded-xl shadow ${ msg.role === "user" ? "bg-indigo-500 text-white" : "bg-gray-200 text-gray-800"}`}>
                      <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                </div>
              ))}
              {error && !loading && <div className="text-red-500 text-center p-2 bg-red-100 rounded" role="alert">Error: {error}</div>}
            </div>
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white rounded-b-lg flex-shrink-0">
             <div className="flex items-center space-x-2">
                <textarea ref={inputRef} value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={promptType ? `Enter your ${promptType} prompt...` : "Select prompt type first"} rows={3} className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" disabled={loading || !promptType} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }}}/>
                <button type="submit" disabled={loading || !inputValue.trim() || !promptType} className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors flex items-center justify-center ${loading || !inputValue.trim() || !promptType ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"}`}>
                  {loading ? <Spinner /> : "Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptImproverPage;