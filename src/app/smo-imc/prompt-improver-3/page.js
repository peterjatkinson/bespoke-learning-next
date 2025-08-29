// app/prompt-improver/page.js
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Image as ImageIcon, Video as VideoIcon, Copy as CopyIcon, RotateCcw as StartOverIcon, CheckCircle2 as CheckIcon, AlertTriangle as AlertIcon, Send as SendIcon } from "lucide-react";

// You only had this path in one fetch call, now it's used for both
const API_PATH = "/smo-imc/prompt-improver-3/api"; 

const Spinner = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

export default function PromptImproverPage() {
  const [appMode, setAppMode] = useState("initial"); // 'initial', 'analyzing', 'refining', 'complete'
  const [promptType, setPromptType] = useState(null);
  const [initialPrompt, setInitialPrompt] = useState("");
  const [breakdown, setBreakdown] = useState([]);
  const [messages, setMessages] = useState([]);
  const [refinementQueue, setRefinementQueue] = useState([]);
  const [currentElementToRefine, setCurrentElementToRefine] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(""); // State for displaying errors

  const revisedFullPrompt = useMemo(() => {
    if (breakdown.length === 0) return "Your prompt will be built here...";
    return breakdown.map(item => item.text).filter(Boolean).join(", ") + ".";
  }, [breakdown]);

  const chatContainerRef = useRef(null);
  useEffect(() => { chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const handleStartOver = () => {
    setAppMode("initial");
    setPromptType(null);
    setInitialPrompt("");
    setBreakdown([]);
    setMessages([]);
    setRefinementQueue([]);
    setCurrentElementToRefine(null);
    setInputValue("");
    setIsLoading(false);
    setConversationId(null);
    setErrorMessage("");
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!initialPrompt.trim() || !promptType) return;

    setIsLoading(true);
    setAppMode("analyzing");
    setErrorMessage("");
    
    try {
      const response = await fetch(API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "analyze", userPrompt: initialPrompt, promptType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server Error Response:", errorData);
        throw new Error(errorData.details || "Analysis failed due to a server error.");
      }
      
      const data = await response.json();
      const analysis = data.analysisBreakdown;
      setBreakdown(analysis);
      setConversationId(data.conversationId);
      
      const queue = analysis.filter(item => item.isMissing || item.critique).map(item => item.element);
      setRefinementQueue(queue);

      if (queue.length > 0) {
        const nextElement = queue[0];
        setCurrentElementToRefine(nextElement);
        const firstCritique = analysis.find(item => item.element === nextElement).critique;
        setMessages([{ role: "assistant", content: `Great, I've analyzed your prompt. Let's refine it together.\n\nFirst, for the **${nextElement}**: ${firstCritique}` }]);
        setAppMode("refining");
      } else {
        setMessages([{ role: "assistant", content: `Excellent! Your initial prompt is very detailed. I've broken it down for you on the left.` }]);
        setAppMode("complete");
      }
    } catch (err) {
      console.error("Caught Analysis Error:", err);
      setErrorMessage(err.message);
      setAppMode("initial");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { role: "user", content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch(API_PATH, { // <-- CORRECTED API PATH HERE TOO
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refine", userRequest: userMessage.content, elementToRefine: currentElementToRefine, conversationId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server Error Response:", errorData);
        throw new Error(errorData.details || "Refinement failed due to a server error.");
      }

      const data = await response.json();
      setConversationId(data.conversationId);
      
      setBreakdown(prev => prev.map(item => 
        item.element === currentElementToRefine ? { ...item, text: data.revisedText, isMissing: false, critique: "" } : item
      ));

      const newQueue = refinementQueue.slice(1);
      setRefinementQueue(newQueue);

      let finalChatResponse = data.chatResponse;
      if (newQueue.length > 0) {
        const nextElement = newQueue[0];
        setCurrentElementToRefine(nextElement);
        const nextCritique = breakdown.find(item => item.element === nextElement).critique;
        finalChatResponse += `\n\nNow, let's look at the **${nextElement}**: ${nextCritique}`;
      } else {
        setCurrentElementToRefine(null);
        finalChatResponse += `\n\nAmazing work! We've refined all the elements. Your final prompt is ready.`;
        setAppMode("complete");
      }
      setMessages(prev => [...prev, { role: "assistant", content: finalChatResponse }]);

    } catch (err) {
      console.error("Caught Refinement Error:", err);
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (appMode === "initial" || appMode === "analyzing") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-2xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Prompt Coach</h1>
          <p className="text-gray-600 mb-6 text-center">Start with your draft prompt and I'll help you improve it.</p>
          <form onSubmit={handleAnalyze}>
            <textarea
              value={initialPrompt}
              onChange={(e) => setInitialPrompt(e.target.value)}
              placeholder="e.g., A photo of a sad robot in the rain..."
              rows="5"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              disabled={isLoading}
            />
            <div className="flex items-center justify-between gap-4">
                <div className="flex gap-2">
                    <button type="button" onClick={() => setPromptType('image')} className={`px-4 py-2 rounded-lg flex items-center gap-2 border-2 ${promptType === 'image' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`} disabled={isLoading}><ImageIcon size={18}/> Image</button>
                    <button type="button" onClick={() => setPromptType('video')} className={`px-4 py-2 rounded-lg flex items-center gap-2 border-2 ${promptType === 'video' ? 'border-teal-500 bg-teal-50' : 'border-gray-300'}`} disabled={isLoading}><VideoIcon size={18}/> Video</button>
                </div>
                <button type="submit" disabled={!initialPrompt || !promptType || isLoading} className="px-6 py-3 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center min-w-[120px]">
                    {isLoading ? <Spinner /> : "Analyze Prompt"}
                </button>
            </div>
            {errorMessage && <p className="text-red-500 text-sm mt-4 text-center">{errorMessage}</p>}
          </form>
        </div>
      </div>
    );
  }

  // Refinement and Complete Modes
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Prompt Coach <span className="text-base font-medium text-gray-500 capitalize">({promptType})</span></h1>
        <button onClick={handleStartOver} className="p-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md flex items-center gap-2"><StartOverIcon size={16} /> Start Over</button>
      </header>
      <main className="grid md:grid-cols-2 gap-6 p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-6 h-[calc(100vh-120px)]">
          <h2 className="text-xl font-semibold text-gray-700">Prompt Analysis</h2>
          <div className="relative">
            <h3 className="font-semibold text-gray-600 mb-2">Refined Prompt</h3>
            <p className="p-4 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800 min-h-[100px] whitespace-pre-wrap">{revisedFullPrompt}</p>
            <button title="Copy" className="absolute top-10 right-2 p-1.5 bg-gray-200 hover:bg-gray-300 rounded text-gray-600"><CopyIcon size={16} /></button>
          </div>
          <div className="flex-grow overflow-y-auto">
            <h3 className="font-semibold text-gray-600 mb-2">Element Breakdown</h3>
            <div className="space-y-2">
              {breakdown.map(item => (
                <div key={item.element} className={`p-3 border rounded-lg ${item.isMissing ? 'border-amber-300 bg-amber-50' : 'border-green-300 bg-green-50'}`}>
                  <div className="flex items-center gap-2 font-semibold text-gray-700">
                    {item.isMissing ? <AlertIcon className="text-amber-500" size={18}/> : <CheckIcon className="text-green-600" size={18}/>}
                    {item.element}
                  </div>
                  {item.text && <p className="text-xs text-gray-600 mt-1 pl-7">{item.text}</p>}
                  {item.critique && <p className="text-xs font-semibold text-gray-500 mt-1 pl-7">Suggestion: {item.critique}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg flex flex-col h-[calc(100vh-120px)]">
          <div ref={chatContainerRef} className="flex-grow p-6 space-y-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3 rounded-xl shadow-sm ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}>
                  {/* ## THIS IS THE FIX ## */}
                  <ReactMarkdown
                    components={{
                      // This tells ReactMarkdown to render its output inside a div with our desired classes.
                      div: ({ children }) => <div className="prose prose-sm max-w-none">{children}</div>,
                      // We can override any tag, but mapping the root 'div' is often enough.
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleRefine} className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={appMode === 'complete' ? "Prompt is complete!" : `Address the feedback for ${currentElementToRefine}...`} className="flex-grow p-3 border rounded-lg" disabled={isLoading || appMode === 'complete'} />
              <button type="submit" disabled={isLoading || !inputValue.trim() || appMode === 'complete'} className="p-3 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
                {isLoading ? <Spinner /> : <SendIcon size={20} />}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}