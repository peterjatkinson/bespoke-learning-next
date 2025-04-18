"use client"; // Required for Next.js App Router client components

import React, { useState, useRef, useEffect } from "react";
import { TagCloud } from 'react-tagcloud'; // Import the TagCloud component
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// Optional: Define color options for the tag cloud
const tagCloudColorOptions = {
  luminosity: 'bright',
  hue: 'blue',
};

// Constants for Timing Responses (ensure these match EXACTLY what's in your CSV and route.js)
// Not strictly needed in page.js anymore but kept for reference if useful
// const TIMING_LESS = "It took less time to complete the tasks and activities than estimated";
// const TIMING_MORE = "It took more time to complete the tasks and activities than estimated";
// const TIMING_SAME = "It took about the same amount of time to complete the tasks and activities as estimated";

// --- NEW: Learning Outcome Table Component ---
// --- NEW: Learning Outcome Table Component ---
function LearningOutcomeTable({ loData }) {
  // loData is NOW an ARRAY: [{ loHeader: string, responses: { response: count } }]

  // Check if the array is empty or not provided
  if (!loData || !Array.isArray(loData) || loData.length === 0) {
    return <p className="text-sm text-gray-500 italic">No learning outcome data recorded for this session.</p>;
  }

  // 1. Get all unique response headers (columns) across all LOs
  const uniqueResponses = new Set();
  loData.forEach(item => { // Iterate through the array of LO items
    if (item.responses) {
      Object.keys(item.responses).forEach(response => uniqueResponses.add(response));
    }
  });
  // Sort column headers alphabetically for consistency
  const responseHeaders = Array.from(uniqueResponses).sort();

  // 2. Get LO items (rows) - order is already preserved in the array
  const loItems = loData; // No sorting needed here

  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
            <tr>
            <th scope="col" className="py-3 px-4 font-semibold">
                Learning Outcome
            </th>
            {responseHeaders.map(header => (
                <th key={header} scope="col" className="py-3 px-4 font-semibold text-center">
                {header}
                </th>
            ))}
            </tr>
        </thead>
        <tbody>
            {/* Iterate through the loItems array directly */}
            {loItems.map((item) => (
            <tr key={item.loHeader} className="bg-white border-b hover:bg-gray-50">
                {/* Access loHeader directly from the item */}
                <td className="py-3 px-4 font-medium text-gray-900 whitespace-normal">
                {item.loHeader}
                </td>
                {/* Map through the sorted response headers (columns) */}
                {responseHeaders.map(response => (
                <td key={`${item.loHeader}-${response}`} className="py-3 px-4 text-center">
                    {/* Access count from item.responses object */}
                    {item.responses?.[response] || 0}
                </td>
                ))}
            </tr>
            ))}
        </tbody>
        </table>
    </div>
  );
}

export default function FeedbackAnalyzerPage() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingWarnings, setProcessingWarnings] = useState([]);
  const [wordCloudData, setWordCloudData] = useState(null);

  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (results || wordCloudData) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [results, wordCloudData]);

  const handleFileChange = (event) => {
    setError(null);
    setResults(null);
    setProcessingWarnings([]);
    setWordCloudData(null);
    if (event.target.files) {
      const csvFiles = Array.from(event.target.files).filter(
        (file) => file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv")
      );
      setFiles(csvFiles);
      if (csvFiles.length !== event.target.files.length) {
        setProcessingWarnings(["Some non-CSV files were ignored."]);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (files.length === 0) {
      setError("Please select at least one CSV file.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);
    setProcessingWarnings([]);
    setWordCloudData(null);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/test-apps/feedback-processor/api", { // Ensure this path is correct
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! Status: ${response.status}`);
      }

      // console.log("Received data from API:", JSON.stringify(data, null, 2)); // Debugging: Check structure
      setResults(data.results);
      setProcessingWarnings(data.processingWarnings || []);
      setWordCloudData(data.wordCloudData || null);

    } catch (err) {
      console.error("Analysis Error:", err);
      setError(err.message || "An unknown error occurred during analysis.");
      setResults(null);
      setWordCloudData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFiles([]);
    setResults(null);
    setError(null);
    setProcessingWarnings([]);
    setWordCloudData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Custom renderer for TagCloud (Unchanged)
  const customTagRenderer = (tag, size, color) => {
    return (
      <span
        key={tag.value}
        style={{
          fontSize: `${size}px`,
          margin: '3px',
          padding: '3px',
          display: 'inline-block',
          color: color,
          cursor: 'default',
        }}
        title={`Count: ${tag.count}`}
      >
        {tag.value}
      </span>
    );
  };

  // Helper function for Timing Chart (Unchanged)
  const prepareTimingChartData = (timingCounts) => {
    if (!timingCounts) return [];
    return [
      { name: 'Less Time', count: timingCounts.less || 0, fill: '#82ca9d' },
      { name: 'Same Time', count: timingCounts.same || 0, fill: '#8884d8' },
      { name: 'More Time', count: timingCounts.more || 0, fill: '#ffc658' },
    ].filter(item => item.count > 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 shadow-xl rounded-lg border border-gray-200">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Student Feedback Analyzer
        </h1>

        {/* Form remains the same */}
        <form onSubmit={handleSubmit} className="space-y-6 mb-8">
          <div>
            <label
              htmlFor="file-upload"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Upload CSV Files (e.g., Session 1.csv, Session 2.csv)
            </label>
            <input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              multiple
              accept=".csv, text/csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {files.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                {files.length} CSV file{files.length !== 1 ? 's' : ''} selected.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
            <button
              type="submit"
              disabled={isLoading || files.length === 0}
              className={`w-full sm:w-auto inline-flex justify-center items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out ${isLoading || files.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                }`}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Analyzing...
                </>
              ) : (
                "Analyze Feedback"
              )}
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex justify-center px-6 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Clear Selection
            </button>
          </div>

          {/* Error/Warning Display Area (Unchanged) */}
          {(error || processingWarnings.length > 0) && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md" aria-live="assertive">
              {error && (<p className="text-sm font-medium text-red-800 mb-2">Error: {error}</p>)}
              {processingWarnings.length > 0 && (
                <div className={`${error ? 'mt-2 pt-2 border-t border-red-200' : ''}`}>
                  <p className="text-sm font-medium text-orange-800 mb-1">Processing Warnings/Issues:</p>
                  <ul className="list-disc list-inside text-sm text-orange-700">
                    {processingWarnings.map((msg, index) => (
                      <li key={index}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </form>

        {/* --- Results Area --- */}
        <div ref={resultsRef}>
          {(results || wordCloudData) && (
            <div className="mt-10 space-y-8">

              {/* Session Analysis Results */}
              {results && Object.keys(results).length > 0 && (
                <>
                  <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                    Feedback Analysis Results
                  </h2>
                  {Object.entries(results)
                    .sort(([keyA], [keyB]) => { // Sorting logic remains the same
                      if (keyA === "Unknown Session") return 1;
                      if (keyB === "Unknown Session") return -1;
                      const numA = parseInt(keyA.match(/\d+/)?.[0] || '0');
                      const numB = parseInt(keyB.match(/\d+/)?.[0] || '0');
                      if (numA !== numB) return numA - numB;
                      return keyA.localeCompare(keyB);
                    })
                    .map(([sessionName, sessionData]) => {
                      const timingChartData = prepareTimingChartData(sessionData.timingCounts);
                      const hasTimingData = timingChartData.length > 0;
                      const hasLOData = sessionData.learningOutcomes && Object.keys(sessionData.learningOutcomes).length > 0;

                      return (
                        <div
                          key={sessionName}
                          className="p-6 bg-gray-50 rounded-lg shadow border border-gray-200 mb-6"
                        >
                          <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
                            {sessionName}
                          </h3>

                          {/* --- Timing Chart Section --- */}
                          {(hasTimingData || sessionData.timingCounts) && ( // Show section if data exists or was processed
                             <div className="mb-6">
                                <h4 className="text-lg font-medium text-gray-600 mb-3">
                                    Response to whether it took more, less or about the same time as estimated
                                </h4>
                                {hasTimingData ? (
                                    <div style={{ width: '100%', height: 250 }}>
                                        <ResponsiveContainer>
                                        <BarChart data={timingChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }} barGap={10} barCategoryGap="20%">
                                            <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                                            <YAxis allowDecimals={false} width={30} tick={{ fontSize: 12 }}/>
                                            <Tooltip contentStyle={{ fontSize: '12px', padding: '5px' }} itemStyle={{ padding: '0' }} />
                                            <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                     <p className="text-sm text-gray-500 italic">No timing responses recorded for this session.</p>
                                )}
                             </div>
                          )}
                          {/* --- End Timing Chart Section --- */}

                          {/* --- Learning Outcome Table Section (NEW) --- */}
                          { (hasLOData || sessionData.learningOutcomes) && ( // Show section if data exists or was processed
                            <div className="mb-6">
                                <h4 className="text-lg font-medium text-gray-600 mb-3">
                                    Response to learning outcomes
                                </h4>
                                <LearningOutcomeTable loData={sessionData.learningOutcomes} />
                            </div>
                          )}
                          {/* --- End Learning Outcome Table Section --- */}

                          {/* Summary */}
                          <div className="mb-5">
                            <h4 className="text-lg font-medium text-gray-600 mb-2">Summary</h4>
                            <p className="text-gray-700 text-sm leading-relaxed italic">
                              {sessionData.summary || "No summary provided."}
                            </p>
                          </div>

                          {/* Positive Comments */}
                          <div className="mb-5">
                            <h4 className="text-lg font-medium text-green-700 mb-2">Positive Comments</h4>
                            {sessionData.positiveComments && sessionData.positiveComments.length > 0 ? (
                              <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
                                {sessionData.positiveComments.map((comment, index) => (
                                  <li key={`pos-${index}`}>{comment}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500 italic">No positive comments identified.</p>
                            )}
                          </div>

                          {/* Critical Comments */}
                          <div>
                            <h4 className="text-lg font-medium text-red-700 mb-2">
                              Critical Comments / Suggestions for Improvement
                            </h4>
                            {sessionData.criticalComments && sessionData.criticalComments.length > 0 ? (
                              <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                                {sessionData.criticalComments.map((comment, index) => (
                                  <li key={`crit-${index}`}>{comment}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500 italic">No critical comments or suggestions identified.</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                </>
              )} {/* End Session Analysis Results */}

              {/* --- Word Cloud Section (Unchanged rendering logic) --- */}
              {wordCloudData && wordCloudData.length > 0 && (
                <div className="p-6 bg-gray-50 rounded-lg shadow border border-gray-200">
                  <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
                    Common Words in Feedback (Top 50) {/* Updated title slightly */}
                  </h2>
                  <div className="text-center p-4" aria-label="Word cloud showing frequent feedback terms">
                    <TagCloud
                      minSize={14}
                      maxSize={45}
                      tags={wordCloudData}
                      colorOptions={tagCloudColorOptions}
                      shuffle={false}
                      renderer={customTagRenderer}
                      className="simple-cloud"
                    />
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Most frequent words across all feedback (common words excluded). Size indicates frequency. Hover over words for count.
                  </p>
                </div>
              )} {/* End Word Cloud Section */}

            </div>
          )} {/* End Results Area Container */}
        </div> {/* End Ref container */}
      </div>
    </div>
  );
}