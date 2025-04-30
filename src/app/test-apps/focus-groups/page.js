"use client";

import React, { useState, useRef, useEffect } from "react";
import { UserCircle, MessageCircle, Send, AlertCircle, RefreshCw, FileText, Download, BarChart, Clipboard } from "lucide-react";
import { TagCloud } from 'react-tagcloud';


const InformedFocusGroupBuilder = () => {
  // States for form inputs
  const [brandName, setBrandName] = useState("");
  const [conceptDescription, setConceptDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  
  // States for app flow
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // States for focus group interaction
  const [question, setQuestion] = useState("");
  const [questionHistory, setQuestionHistory] = useState([]);
  const [askingQuestion, setAskingQuestion] = useState(false);
  
  // States for summary feature
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summary, setSummary] = useState(null);
  const [transcript, setTranscript] = useState("");
  
  // Add this line for word cloud data
  const [wordCloudData, setWordCloudData] = useState([]);
  // Add these helper functions for the tag cloud right after your state declarations
  const customRenderer = (tag, size, color) => (
    <span
      key={tag.value}
      style={{
        animation: 'blinker 3s linear infinite',
        animationDelay: `${Math.random() * 2}s`,
        fontSize: `${size}px`,
        margin: '3px',
        padding: '3px',
        display: 'inline-block',
        color: `${color}`,
      }}
    >
      {tag.value}
    </span>
  );

  // Options for the tag cloud
  const tagCloudOptions = {
    luminosity: 'dark',
    hue: 'blue',
  };


  // Refs for accessibility and focus management
  const questionInputRef = useRef(null);
  const liveRegionRef = useRef(null);
  const personasRef = useRef(null);
  const summaryRef = useRef(null);
  
  // Function to generate personas
  const handleGeneratePersonas = async (e) => {
    e.preventDefault();
    
    if (!brandName.trim()) {
      setError("Please provide a brand name");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = "Generating focus group participants. Please wait...";
    }
    
    try {
      const response = await fetch("/test-apps/focus-groups/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generatePersonas",
          brandInfo: {
            brandName,
            conceptDescription,
            targetAudience,
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate personas");
      }
      
      const data = await response.json();
      setPersonas(data.personas);
      setFormSubmitted(true);
      
      // Clear any previous responses and summary
      setQuestionHistory([]);
      setSummary(null);
      setTranscript("");
      
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = "Focus group participants generated successfully.";
      }
      
    } catch (err) {
      console.error(err);
      setError("An error occurred while generating personas. Please try again.");
      
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = "Error generating focus group participants.";
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Function to submit questions to the focus group
  const handleAskQuestion = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) {
      return;
    }
    
    setAskingQuestion(true);
    
    const currentQuestion = question;
    
    // Add question to history
    setQuestionHistory(prev => [
      ...prev, 
      { question: currentQuestion, responses: {} }
    ]);
    
    // Clear the input
    setQuestion("");
    
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = "Asking focus group your question. Please wait...";
    }
    
    try {
      // Now we send the full question history to maintain context
      const response = await fetch("/test-apps/focus-groups/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "askQuestion",
          question: currentQuestion,
          personas,
          brandInfo: {
            brandName,
            conceptDescription,
            targetAudience,
          },
          // Send previous questions and answers for context
          chatHistory: questionHistory,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to get responses");
      }
      
      const data = await response.json();
      
      // Update the latest question in the history with responses
      setQuestionHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1].responses = data.responses;
        return updated;
      });
      
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = "Focus group has responded to your question.";
      }
      
    } catch (err) {
      console.error(err);
      setError("An error occurred while getting responses. Please try again.");
      
      // Update the history to show error
      setQuestionHistory(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1].error = true;
        }
        return updated;
      });
      
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = "Error getting focus group responses.";
      }
    } finally {
      setAskingQuestion(false);
    }
  };
  
  // Function to generate summary of focus group
  const handleGenerateSummary = async () => {
    if (questionHistory.length === 0) {
      setError("Please ask at least one question before generating a summary.");
      return;
    }
    
    setGeneratingSummary(true);
    setError(null);
    
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = "Generating focus group summary. Please wait...";
    }
    
    try {
      const response = await fetch("/test-apps/focus-groups/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generateSummary",
          personas,
          brandInfo: {
            brandName,
            conceptDescription,
            targetAudience,
          },
          chatHistory: questionHistory,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }
      
      const data = await response.json();
      setSummary(data.summary);
      setTranscript(data.transcript);

          // Add this line to set word cloud data
    setWordCloudData(data.wordCloudData || []);
      
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = "Focus group summary generated successfully.";
      }
      
      // Scroll to summary section
      setTimeout(() => {
        if (summaryRef.current) {
          summaryRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
      
    } catch (err) {
      console.error(err);
      setError("An error occurred while generating the summary. Please try again.");
      
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = "Error generating focus group summary.";
      }
    } finally {
      setGeneratingSummary(false);
    }
  };
  
  // Function to download transcript
  const handleDownloadTranscript = () => {
    if (!transcript) return;
    
    const element = document.createElement("a");
    const file = new Blob([transcript], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${brandName.replace(/\s+/g, '-').toLowerCase()}-focus-group-transcript.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  // Function to restart the focus group builder
  const handleReset = () => {
    setBrandName("");
    setConceptDescription("");
    setTargetAudience("");
    setFormSubmitted(false);
    setPersonas([]);
    setQuestionHistory([]);
    setSummary(null);
    setTranscript("");
    setError(null);
  };
  
  // Function to copy transcript to clipboard
  const handleCopyTranscript = () => {
    if (!transcript) return;
    
    navigator.clipboard.writeText(transcript)
      .then(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = "Transcript copied to clipboard.";
        }
      })
      .catch(err => {
        console.error("Failed to copy transcript:", err);
        setError("Failed to copy transcript to clipboard.");
      });
  };
  
  // Effect to scroll to personas when they're generated
  useEffect(() => {
    if (personas.length > 0 && personasRef.current) {
      personasRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [personas]);
  
  // Effect to scroll to latest question
  useEffect(() => {
    if (questionHistory.length > 0) {
      const chatContainer = document.getElementById('chat-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [questionHistory]);
  
  // Effect to focus on question input after personas are generated
  useEffect(() => {
    if (formSubmitted && personas.length > 0 && questionInputRef.current) {
      setTimeout(() => {
        questionInputRef.current.focus();
      }, 500);
    }
  }, [formSubmitted, personas]);

  return (
    <div className="min-h-full bg-gradient-to-b from-blue-50 to-indigo-100 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Live region for screen readers */}
        <div className="sr-only" aria-live="polite" ref={liveRegionRef}></div>
        
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-900 mb-2">
            Focus Group Simulator
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto flex items-center justify-center">
            <span>Create and interact with a diverse focus group for your brand or product concept.</span>
          </p>
        </header>
        
        {/* Error display if any */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-start" role="alert">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Brand Info Form - shown if personas haven't been generated yet */}
        {!formSubmitted && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4" id="form-heading">
              Brand Information
            </h2>
            <form onSubmit={handleGeneratePersonas} aria-labelledby="form-heading">
              <div className="space-y-4">
                <div>
                  <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 mb-1">
                    Brand/Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="brandName"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Lush Cosmetics, Tesla Model Y"
                    required
                    aria-required="true"
                  />
                </div>
                
                <div>
                  <label htmlFor="conceptDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Concept Description (Optional)
                  </label>
                  <textarea
                    id="conceptDescription"
                    value={conceptDescription}
                    onChange={(e) => setConceptDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., A vegan protein snack aimed at young athletes"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-1">
                    Target Audience (Optional)
                  </label>
                  <input
                    type="text"
                    id="targetAudience"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., 18-34 year-olds across the UK"
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || !brandName.trim()}
                    className={`w-full py-3 px-6 ${
                      loading || !brandName.trim()
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    } text-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors`}
                    aria-busy={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Generating Personas...
                      </span>
                    ) : (
                      "Generate Focus Group"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
        
        {/* Reset button - shown once personas are generated */}
        {formSubmitted && personas.length > 0 && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={handleReset}
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
              aria-label="Start over with a new brand"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Start Over
            </button>
          </div>
        )}
        
        {/* Personas Display */}
        {formSubmitted && personas.length > 0 && (
          <div ref={personasRef} className="mb-10" aria-live="polite">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6 text-center">
              Your Focus Group Participants
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {personas.map((persona, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
                  aria-labelledby={`persona-name-${index}`}
                >
                  <div className="p-4 bg-indigo-50 flex justify-center">
                    <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
                      <UserCircle className="h-24 w-24 text-indigo-500" />
                    </div>
                  </div>
                  
                  <div className="p-4 flex-1">
                    <h3 
                      id={`persona-name-${index}`}
                      className="text-lg font-semibold text-indigo-900 mb-1"
                    >
                      {persona.name}, {persona.age}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {persona.gender} • {persona.location}
                    </p>
                    
                    <p className="text-sm text-gray-800 mb-2">
                      <span className="font-medium">Occupation:</span> {persona.occupation}
                    </p>
                    
                    <p className="text-sm text-gray-800 mb-2">
                      {persona.personalityDescription}
                    </p>
                    
                    <div className="bg-indigo-50 text-indigo-800 text-xs font-medium py-1 px-2 rounded-full inline-block mb-2">
                      {persona.brandAttitude}
                    </div>
                    
                    <p className="text-sm text-gray-800 italic">
                      <span className="font-medium">Note:</span> {persona.personalDetail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Question Interface */}
        {formSubmitted && personas.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <h2 className="text-xl font-semibold text-gray-800 p-4 border-b flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-indigo-600" />
              Ask Your Focus Group
            </h2>
            
            {/* Fixed height chat area with scroll */}
            <div className="h-96 overflow-y-auto p-4" id="chat-container">
              {questionHistory.length === 0 && (
                <p className="text-center text-gray-500 my-8 flex flex-col items-center">
                  Ask a question below to see how the focus group responds!
                </p>
              )}
              
              {questionHistory.map((item, qIndex) => (
                <div key={qIndex} className="border-t pt-4 mb-6">
                  <div className="flex items-start mb-4">
                    <div className="bg-indigo-100 text-indigo-800 p-3 rounded-lg inline-block">
                      <MessageCircle className="h-5 w-5 inline-block mr-2" />
                      <span className="font-medium">You asked:</span> {item.question}
                    </div>
                  </div>
                  
                  {item.error ? (
                    <div className="text-red-500 ml-2 mb-4">
                      <AlertCircle className="h-5 w-5 inline-block mr-1" />
                      Error getting responses. Please try again.
                    </div>
                  ) : Object.keys(item.responses).length === 0 ? (
                    <div className="flex justify-center my-4">
                      <RefreshCw className="h-5 w-5 animate-spin text-indigo-600" />
                    </div>
                  ) : (
                    <div className="ml-8 space-y-4">
                      {personas.map((persona, pIndex) => (
                        <div key={pIndex} className="flex items-start mb-2">
                          <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 mr-3 bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
                            <UserCircle className="h-8 w-8 text-indigo-500" />
                          </div>
                          <div>
                            <p className="font-medium text-indigo-900">{persona.name}:</p>
                            <p className="text-gray-700">
                              {item.responses[persona.name] || "No response"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Question input fixed at the bottom */}
            <div className="border-t p-4">
              <form onSubmit={handleAskQuestion} className="flex space-x-2">
                <div className="flex-1">
                  <label htmlFor="question" className="sr-only">Your question</label>
                  <input
                    type="text"
                    id="question"
                    ref={questionInputRef}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., What attracts you to this brand?"
                    disabled={askingQuestion}
                    aria-disabled={askingQuestion}
                  />
                </div>
                <button
                  type="submit"
                  disabled={askingQuestion || !question.trim()}
                  className={`px-4 py-2 ${
                    askingQuestion || !question.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } text-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors`}
                  aria-busy={askingQuestion}
                >
                  {askingQuestion ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                  <span className="sr-only">Ask question</span>
                </button>
              </form>
            </div>
          </div>
        )}
        
        {/* End Focus Group & Generate Summary button - shown after questions have been asked */}
        {formSubmitted && questionHistory.length > 0 && !summary && (
          <div className="mb-8 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleGenerateSummary}
              disabled={generatingSummary || questionHistory.length === 0}
              className={`flex items-center justify-center px-6 py-3 ${
                generatingSummary || questionHistory.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } text-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors`}
              aria-busy={generatingSummary}
            >
              {generatingSummary ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Generating Summary...
                </>
              ) : (
                <>
                  <BarChart className="h-5 w-5 mr-2" />
                  End Focus Group & Generate Summary
                </>
              )}
            </button>
            
            {transcript && (
              <button
                onClick={handleDownloadTranscript}
                className="flex items-center justify-center px-6 py-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              >
                <Download className="h-5 w-5 mr-2" />
                Download Transcript
              </button>
            )}
          </div>
        )}
        
        {/* Summary Section - shown after generating summary */}
        {summary && (
          <div ref={summaryRef} className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <h2 className="text-xl font-semibold text-gray-800 p-4 border-b flex items-center">
              <BarChart className="h-5 w-5 mr-2 text-green-600" />
              Focus Group Summary
            </h2>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Key Takeaways</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {summary.keyTakeaways.map((takeaway, index) => (
                    <li key={index} className="text-gray-700">{takeaway}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Participant Sentiment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(summary.participantSentiment).map(([name, sentiment], index) => (
                    <div key={index} className="border border-gray-100 p-3 rounded-md bg-gray-50">
                      <p className="font-medium text-indigo-900">{name}</p>
                      <p className="text-gray-700">{sentiment}</p>
                    </div>
                  ))}
                </div>
              </div>
                            
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Recommendations</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {summary.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-gray-700">{recommendation}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">Overall Conclusion</h3>
                <p className="text-gray-700">{summary.overallConclusion}</p>
              </div>

              {wordCloudData && wordCloudData.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Word Cloud Visualization</h3>
          <div className="bg-gray-50 rounded-lg p-4 min-h-64 w-full flex justify-center">
            <TagCloud 
              minSize={12}
              maxSize={35}
              tags={wordCloudData.map(item => ({
                value: item.text,
                count: item.value
              }))}
              className="text-center p-4"
              renderer={customRenderer}
              colorOptions={tagCloudOptions}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Word size represents frequency in the focus group transcript.
          </p>
        </div>
      )}

            </div>
            
            <div className="bg-gray-50 p-4 border-t flex flex-wrap gap-3">
              <button
                onClick={handleDownloadTranscript}
                className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              >
                <FileText className="h-5 w-5 mr-2" />
                Download Full Transcript
              </button>
              
              <button
                onClick={handleCopyTranscript}
                className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                <Clipboard className="h-5 w-5 mr-2" />
                Copy Transcript
              </button>
            </div>
          </div>
        )}
        
        {/* Reflection & Critical Thinking Section - shown after at least one question */}
        {questionHistory.length > 0 && (
          <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100">
            <h2 className="text-xl font-semibold text-indigo-900 mb-4 flex items-center">
              Critical Reflection
            </h2>
            <div className="space-y-4 text-gray-700">
              <p className="font-medium">
              Consider the following questions about this synthetic focus group:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Were the responses realistic or did they seem stereotyped?</li>
                <li>Was the sample diverse enough for your research needs?</li>
                <li>What are the risks of assuming these AI-generated answers reflect real consumer opinions?</li>
                <li>What questions worked well? What questions could be improved?</li>
                <li>How might you validate these insights with real consumers?</li>
              </ul>
              <p className="mt-4 text-sm text-indigo-700 italic">
                Remember: This is a learning tool that simulates focus group dynamics, but real consumer research remains essential for validating insights.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InformedFocusGroupBuilder;
