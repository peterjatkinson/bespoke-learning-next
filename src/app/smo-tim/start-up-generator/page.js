"use client";

import React, { useState, useRef, useEffect } from "react";

const StartupIdeaGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState(null);
  const [error, setError] = useState(null);
  const [industryInput, setIndustryInput] = useState("");

  // Define character limit for the industry input.
  const charLimit = 50;

  // Initialize submission count from localStorage or default to 0
  const initialSubmissionCount =
    typeof window !== "undefined"
      ? parseInt(localStorage.getItem("startupIdeaSubmissionCount") || "0", 10)
      : 0;
  const [submissionCount, setSubmissionCount] = useState(initialSubmissionCount);
  const submissionLimit = 10;

  const generatedContentRef = useRef(null);
  const liveRegionRef = useRef(null);

  // Handler for the industry input. It enforces the character limit
  // by slicing any input that exceeds the limit.
  const handleIndustryChange = (e) => {
    const { value } = e.target;
    const newValue = value.length > charLimit ? value.slice(0, charLimit) : value;
    setIndustryInput(newValue);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setIdeas(null);
    setError(null);
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent =
        "Generating start-up ideas. Please wait.";
    }
    try {
      const response = await fetch("/smo-tim/start-up-generator/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry: industryInput.trim() }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate start-up ideas.");
      }
      const data = await response.json();
      setIdeas(data.ideas);

      // Increment submission count and update localStorage
      const newCount = submissionCount + 1;
      setSubmissionCount(newCount);
      localStorage.setItem("startupIdeaSubmissionCount", newCount);

      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = "Start-up ideas generated.";
      }
    } catch (err) {
      console.error(err);
      setError(
        "An error occurred while generating start-up ideas. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ideas && generatedContentRef.current) {
      generatedContentRef.current.querySelector("h2").focus();
    }
  }, [ideas]);

  return (
    <div className="min-h-full bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-900">
          Start-up ideas generator
        </h1>
        <div className="mb-6 text-center">
          <p className="text-lg text-gray-700">
            Click the button below to generate innovative start-up ideas.
          </p>
          {/* New industry input field with character limit display */}
          <div className="mt-4">
            <input
              type="text"
              maxLength={charLimit}
              value={industryInput}
              onChange={handleIndustryChange}
              placeholder="Optional: enter an industry"
              className="px-4 py-2 border rounded-md w-80"
              aria-label="Enter an industry (optional)"
            />
            <p className="text-gray-500 text-sm mt-1">
              {industryInput.length}/{charLimit} characters
            </p>
          </div>
        </div>
        <div className="text-center mb-6" aria-live="polite" ref={liveRegionRef} />
        {error && (
          <div className="text-red-500 text-center mb-4" role="alert">
            {error}
          </div>
        )}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleSubmit}
            disabled={loading || submissionCount >= submissionLimit}
            className={`p-3 rounded-lg transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
              loading || submissionCount >= submissionLimit
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-blue-900 text-white hover:from-green-700 hover:to-blue-700"
            }`}
            aria-busy={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></span>
                Generating...
              </div>
            ) : submissionCount >= submissionLimit ? (
              "Submission limit reached"
            ) : (
              "Generate start-up ideas"
            )}
          </button>
        </div>
        {submissionCount < submissionLimit && (
          <p className="text-center mt-2 text-sm text-gray-600">
            You have {submissionLimit - submissionCount} submission
            {submissionLimit - submissionCount !== 1 ? "s" : ""} remaining.
          </p>
        )}
        {ideas && (
          <div className="mt-8 space-y-6" aria-live="polite" ref={generatedContentRef}>
            <h2 className="text-2xl font-bold text-center text-green-900" tabIndex="-1">
              Generated start-up ideas
            </h2>
            {ideas.map((idea, index) => (
              <div
                key={index}
                className="bg-white p-6 shadow-lg border border-green-100 transition-all"
              >
                <h3 className="text-xl font-bold mb-4 text-green-900">
                  {idea.title}
                </h3>
                <div className="space-y-3 text-gray-700">
                  <p className="pb-2 border-b border-gray-100">
                    <span className="font-semibold text-blue-900">Description:</span> {idea.description}
                  </p>
                  <p className="pb-2 border-b border-gray-100">
                    <span className="font-semibold text-blue-900">Target market:</span> {idea.targetMarket}
                  </p>
                  <p className="pb-2 border-b border-gray-100">
                    <span className="font-semibold text-blue-900">Potential challenges:</span> {idea.potentialChallenges.join("; ")}
                  </p>
                  <p>
                    <span className="font-semibold text-blue-900">Revenue streams:</span> {idea.revenueStreams.join("; ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StartupIdeaGenerator;
