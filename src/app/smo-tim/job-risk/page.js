"use client";

import React, { useState, useRef } from "react";

const JobRisk = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [loading, setLoading] = useState(false);
  const [riskData, setRiskData] = useState(null);

  // Initialize submission count from localStorage or default to 0
  const initialSubmissionCount =
    typeof window !== "undefined"
      ? parseInt(localStorage.getItem("jobRiskSubmissionCount") || "0", 10)
      : 0;
  const [submissionCount, setSubmissionCount] = useState(initialSubmissionCount);
  const submissionLimit = 10;

  const liveRegionRef = useRef(null);
  const charLimit = 50;

  // Updated handleChange to enforce a 50-character limit and slice pasted text if needed.
  const handleChange = (e) => {
    const { value } = e.target;
    const newValue = value.length > charLimit ? value.slice(0, charLimit) : value;
    setJobTitle(newValue);
    if (fieldError) {
      setFieldError("");
    }
  };

  const handleSubmit = async () => {
    if (!jobTitle.trim()) {
      setFieldError("Job title is required.");
      return;
    }

    setLoading(true);
    setRiskData(null);

    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = "Calculating risk. Please wait.";
    }

    try {
      const response = await fetch("/smo-tim/job-risk/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle }),
      });

      if (!response.ok) {
        throw new Error("Failed to assess risk.");
      }

      const data = await response.json();
      setRiskData(data);

      // Increment submission count and update localStorage
      const newCount = submissionCount + 1;
      setSubmissionCount(newCount);
      localStorage.setItem("jobRiskSubmissionCount", newCount);

      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = "Risk calculated.";
      }
    } catch (error) {
      console.error(error);
      setFieldError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-900">
          Job automation risk assessor
        </h1>

        <div className="sr-only" aria-live="polite" ref={liveRegionRef}></div>

        <div className="mb-4">
          <label htmlFor="jobTitle" className="block text-lg font-medium text-blue-900">
            Enter a job title
          </label>
          <input
            id="jobTitle"
            name="jobTitle"
            type="text"
            value={jobTitle}
            onChange={handleChange}
            className={`w-full mt-1 p-3 border ${
              fieldError ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
            aria-invalid={!!fieldError}
          />
          {fieldError && (
            <p className="text-red-500 text-sm mt-1">{fieldError}</p>
          )}
          <p className="text-gray-500 text-sm mt-1">
            {jobTitle.length}/{charLimit} characters
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || submissionCount >= submissionLimit}
          className={`w-full p-3 rounded-lg transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
            loading || submissionCount >= submissionLimit
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-blue-900 text-white hover:bg-blue-700"
          }`}
        >
          {loading
            ? "Calculating..."
            : submissionCount >= submissionLimit
            ? "Submission limit reached"
            : "Assess risk"}
        </button>

        {submissionCount < submissionLimit && (
          <p className="text-center mt-2 text-sm text-gray-600">
            You have {submissionLimit - submissionCount} submission
            {submissionLimit - submissionCount !== 1 ? "s" : ""} remaining.
          </p>
        )}

{riskData && riskData.risk && riskData.risk.length > 0 && (
  <div className="mt-8 bg-white p-6 shadow-lg border border-green-100 rounded-lg">
    <h2 className="text-xl font-semibold mb-4 text-blue-900">Assessment</h2>
    <p>
      <strong>Job title:</strong> {riskData.risk[0].jobTitle}
    </p>
    <p>
      <strong>Risk score:</strong> {riskData.risk[0].riskScore} / 10
    </p>
    <p>
      <strong>Explanation:</strong> {riskData.risk[0].explanation}
    </p>
  </div>
)}
      </div>
    </div>
  );
};

export default JobRisk;
