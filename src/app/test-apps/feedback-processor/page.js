"use client"; // Required for Next.js App Router client components

import React, { useState, useRef, useEffect } from "react";
import { TagCloud } from 'react-tagcloud';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
// --- Imports for Docx (Unchanged) ---
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ShadingType
} from "docx";
import { saveAs } from 'file-saver';
// --- End Imports ---

// --- REMOVED: Default colorOptions are no longer needed ---
// const tagCloudColorOptions = {
//   luminosity: 'bright',
//   hue: 'blue',
// };

// --- Learning Outcome Table Component (Unchanged) ---
function LearningOutcomeTable({ loData }) {
  if (!loData || !Array.isArray(loData) || loData.length === 0) {
    return <p className="text-sm text-gray-500 italic">No learning outcome data recorded for this session.</p>;
  }
  const uniqueResponses = new Set();
  loData.forEach(item => {
    if (item.responses) {
      Object.keys(item.responses).forEach(response => uniqueResponses.add(response));
    }
  });
  const responseHeaders = Array.from(uniqueResponses).sort();
  const loItems = loData;

  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0">
            <tr>
            <th scope="col" className="py-3 px-4 font-semibold">Learning Outcome</th>
            {responseHeaders.map(header => (
                <th key={header} scope="col" className="py-3 px-4 font-semibold text-center">{header}</th>
            ))}
            </tr>
        </thead>
        <tbody>
            {loItems.map((item) => (
            <tr key={item.loHeader} className="bg-white border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900 whitespace-normal">{item.loHeader}</td>
                {responseHeaders.map(response => (
                <td key={`${item.loHeader}-${response}`} className="py-3 px-4 text-center">
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
// --- End Learning Outcome Table Component ---


export default function FeedbackAnalyzerPage() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [processingWarnings, setProcessingWarnings] = useState([]);
  // wordCloudData will now contain { value: string, count: number, sentiment: string }
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
    files.forEach((file) => formData.append("files", file));
    try {
      const response = await fetch("/test-apps/feedback-processor/api", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `HTTP error! Status: ${response.status}`);
      setResults(data.results);
      setProcessingWarnings(data.processingWarnings || []);
      // Ensure wordCloudData is set correctly, even if empty/null
      setWordCloudData(data.wordCloudData || null);
    } catch (err) {
      console.error("Analysis Error:", err);
      setError(err.message || "An unknown error occurred during analysis.");
      setResults(null); setWordCloudData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFiles([]); setResults(null); setError(null); setProcessingWarnings([]); setWordCloudData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- UPDATED: Custom Tag Renderer ---
  const customTagRenderer = (tag, size /* color arg removed */) => {
    let color;
    // Determine color based on sentiment from the backend
    switch (tag.sentiment) {
      case 'positive':
        color = '#228B22'; // ForestGreen
        break;
      case 'negative':
        color = '#DC143C'; // Crimson Red
        break;
      case 'neutral':
      default: // Fallback for neutral or if sentiment is missing
        color = '#696969'; // DimGray (Dark Gray)
        break;
    }

    return (
      <span
        key={tag.value}
        style={{
          fontSize: `${size}px`,
          margin: '3px',
          padding: '3px',
          display: 'inline-block',
          color: color, // Apply the determined color
          cursor: 'default',
          // Optional: slightly adjust style based on sentiment? (e.g., boldness)
          // fontWeight: tag.sentiment === 'positive' ? 500 : tag.sentiment === 'negative' ? 500 : 400,
        }}
        // Add sentiment to the hover tooltip for clarity
        title={`Count: ${tag.count}${tag.sentiment ? ` (${tag.sentiment})` : ''}`}
      >
        {tag.value}
      </span>
    );
  };

  const prepareTimingChartData = (timingCounts) => { // Unchanged
    if (!timingCounts) return [];
    return [
      { name: 'Less Time', count: timingCounts.less || 0, fill: '#82ca9d' },
      { name: 'Same Time', count: timingCounts.same || 0, fill: '#8884d8' },
      { name: 'More Time', count: timingCounts.more || 0, fill: '#ffc658' },
    ].filter(item => item.count > 0);
  };

  // --- Function to generate DOCX content (Unchanged) ---
  const generateDocxContent = (analysisResults) => {
      // ... (Keep the existing generateDocxContent function exactly as it was) ...
      // It already includes logic for title, sessions, timing, LO table, summaries, comments,
      // and the textual word cloud list.
      const children = []; // Holds all paragraphs, tables, etc.

        children.push(
            new Paragraph({
                text: "Student Feedback Analysis Report",
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
            })
        );

        const sortedSessions = Object.entries(analysisResults).sort(([keyA], [keyB]) => {
            if (keyA === "Unknown Session") return 1;
            if (keyB === "Unknown Session") return -1;
            const numA = parseInt(keyA.match(/\d+/)?.[0] || '0');
            const numB = parseInt(keyB.match(/\d+/)?.[0] || '0');
            if (numA !== numB) return numA - numB;
            return keyA.localeCompare(keyB);
        });

        sortedSessions.forEach(([sessionName, sessionData]) => {
            children.push(new Paragraph({
                text: sessionName,
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
                border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } }
            }));

            if (sessionData.timingCounts) {
                 children.push(new Paragraph({
                    text: "Timing Response",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                }));
                const timingText = [
                    `Less time than estimated: ${sessionData.timingCounts.less || 0}`,
                    `About the same time as estimated: ${sessionData.timingCounts.same || 0}`,
                    `More time than estimated: ${sessionData.timingCounts.more || 0}`
                ].join('; ');
                 children.push(new Paragraph({ text: timingText, style: "normal" }));
            }

            if (sessionData.learningOutcomes && Array.isArray(sessionData.learningOutcomes) && sessionData.learningOutcomes.length > 0) {
                children.push(new Paragraph({
                    text: "Learning Outcome Responses",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                }));

                const loData = sessionData.learningOutcomes;
                const uniqueResponses = new Set();
                loData.forEach(item => {
                    if (item.responses) Object.keys(item.responses).forEach(response => uniqueResponses.add(response));
                });
                const responseHeaders = Array.from(uniqueResponses).sort();
                const loItems = loData;

                const tableHeaderCell = (text) => new TableCell({
                     children: [new Paragraph({ text: text, alignment: AlignmentType.CENTER })],
                     shading: { fill: "E0E0E0", type: ShadingType.CLEAR, color: "auto" },
                     margins: { top: 100, bottom: 100, left: 100, right: 100 },
                     verticalAlign: AlignmentType.CENTER,
                });

                 const headerRow = new TableRow({
                    children: [
                        tableHeaderCell("Learning Outcome"),
                        ...responseHeaders.map(header => tableHeaderCell(header))
                    ],
                    tableHeader: true,
                });

                const dataRows = loItems.map(item => new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph(item.loHeader)],
                            margins: { top: 50, bottom: 50, left: 100, right: 100 },
                            width: { size: 4500, type: WidthType.DXA },
                        }),
                        ...responseHeaders.map(response => new TableCell({
                            children: [new Paragraph({ text: `${item.responses?.[response] || 0}`, alignment: AlignmentType.CENTER })],
                            margins: { top: 50, bottom: 50, left: 100, right: 100 },
                            verticalAlign: AlignmentType.CENTER,
                        }))
                    ]
                }));

                const table = new Table({
                    rows: [headerRow, ...dataRows],
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" },
                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" },
                        left: { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" },
                        right: { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" },
                        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                    },
                });
                children.push(table);
            }

            if (sessionData.summary) {
                children.push(new Paragraph({
                    text: "Summary",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                }));
                children.push(new Paragraph({
                    children: [new TextRun({ text: sessionData.summary, italics: true })],
                    style: "normal"
                }));
            }

            if (sessionData.positiveComments && sessionData.positiveComments.length > 0) {
                 children.push(new Paragraph({
                    text: "Positive Comments",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                }));
                sessionData.positiveComments.forEach(comment => {
                    children.push(new Paragraph({
                        text: comment,
                        bullet: { level: 0 },
                        style: "normal"
                    }));
                });
            }

            if (sessionData.criticalComments && sessionData.criticalComments.length > 0) {
                children.push(new Paragraph({
                    text: "Critical Comments / Suggestions",
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 200, after: 100 },
                }));
                sessionData.criticalComments.forEach(comment => {
                     children.push(new Paragraph({
                        text: comment,
                        bullet: { level: 0 },
                        style: "normal"
                    }));
                });
            }

             children.push(new Paragraph({ text: "", spacing: { after: 300 } }));

        }); // End session loop

        // --- Word Cloud Data (Textual - already handled) ---
        // Check if wordCloudData exists (passed separately or implicitly available scope)
        // NOTE: This part needs access to the `wordCloudData` state variable.
        // It might be better to pass wordCloudData as an argument to generateDocxContent
        // For simplicity here, assuming it's accessible in the scope it's called.
        // You might need: const generateDocxContent = (analysisResults, wordCloudDataForDoc) => { ... }
        // And call it like: const doc = generateDocxContent(results, wordCloudData);

        // Let's pass it explicitly for clarity:
        if (wordCloudData && wordCloudData.length > 0) {
            children.push(new Paragraph({
                text: "Common Words in Feedback (Top 50)",
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
                border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } }
            }));
            // Include sentiment in the textual list as well
            const wordList = wordCloudData.map(tag => `${tag.value} (${tag.count}, ${tag.sentiment || 'neutral'})`).join(', ');
            children.push(new Paragraph({ text: wordList, style: "normal" }));
        }


        const doc = new Document({
            sections: [{
                properties: {},
                children: children,
            }],
            styles: {
                paragraphStyles: [
                    { id: "normal", name: "Normal", run: { size: 22 } }, // 11pt
                    { id: "Heading1", name: "Heading 1", basedOn: "normal", next: "normal", quickFormat: true, run: { size: 32, bold: true, color: "333333" } }, // 16pt
                    { id: "Heading2", name: "Heading 2", basedOn: "normal", next: "normal", quickFormat: true, run: { size: 26, bold: true, color: "555555" } }, // 13pt
                ]
            }
        });

        return doc;
    };


  // --- Handler for the download button (Modified slightly to pass wordCloudData) ---
  const handleDownloadDocx = async () => {
    if (!results) {
        console.error("No results available to download.");
        return;
    }
    setIsDownloading(true);
    try {
        console.log("Generating DOCX...");
        // Pass wordCloudData state to the generation function
        const doc = generateDocxContent(results /*, wordCloudData */); // Pass if needed by your generateDocxContent setup

        const blob = await Packer.toBlob(doc);
        saveAs(blob, "feedback_analysis_report.docx");
        console.log("DOCX download initiated.");

    } catch (err) {
        console.error("Error generating or downloading DOCX:", err);
        setError("Failed to generate Word document.");
    } finally {
        setIsDownloading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 shadow-xl rounded-lg border border-gray-200">
        {/* --- Page Title (Unchanged) --- */}
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Student Feedback Analyzer
        </h1>

        {/* --- Form (Unchanged) --- */}
        <form onSubmit={handleSubmit} className="space-y-6 mb-8">
             {/* File Input */}
             <div>
                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Upload CSV Files (e.g., Session 1.csv, Session 2.csv)
                </label>
                <input id="file-upload" ref={fileInputRef} type="file" multiple accept=".csv, text/csv" onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                {files.length > 0 && <p className="mt-2 text-sm text-gray-600">{files.length} CSV file{files.length !== 1 ? 's' : ''} selected.</p>}
            </div>
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                <button type="submit" disabled={isLoading || files.length === 0} aria-busy={isLoading}
                className={`w-full sm:w-auto inline-flex justify-center items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out ${isLoading || files.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"}`}>
                    {isLoading ? (<><span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>Analyzing...</>) : ("Analyze Feedback")}
                </button>
                <button type="button" onClick={handleClear} disabled={isLoading}
                className="w-full sm:w-auto inline-flex justify-center px-6 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                    Clear Selection
                </button>
                 {/* Download Button (Unchanged) */}
                 {results && !isLoading && (
                     <button
                        type="button"
                        onClick={handleDownloadDocx}
                        disabled={isDownloading}
                        className={`w-full sm:w-auto inline-flex justify-center items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out ${isDownloading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 focus:ring-green-500"}`}
                        aria-busy={isDownloading}
                    >
                        {isDownloading ? ( <> <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span> Generating... </> ) : ( "Download Results (.docx)" )}
                    </button>
                 )}
            </div>
             {/* Error/Warning Area (Unchanged) */}
             {(error || processingWarnings.length > 0) && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md" aria-live="assertive">
                    {error && (<p className="text-sm font-medium text-red-800 mb-2">Error: {error}</p>)}
                    {processingWarnings.length > 0 && (
                        <div className={`${error ? 'mt-2 pt-2 border-t border-red-200' : ''}`}>
                        <p className="text-sm font-medium text-orange-800 mb-1">Processing Warnings/Issues:</p>
                        <ul className="list-disc list-inside text-sm text-orange-700">{processingWarnings.map((msg, index) => (<li key={index}>{msg}</li>))}</ul>
                        </div>
                    )}
                </div>
            )}
        </form>

        {/* --- Results Area (Structure Unchanged, only Word Cloud rendering changes) --- */}
        <div ref={resultsRef}>
          {(results || wordCloudData) && (
            <div className="mt-10 space-y-8">
              {/* Session Analysis Results (Unchanged) */}
              {results && Object.keys(results).length > 0 && (
                <>
                  <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                    Feedback Analysis Results
                  </h2>
                  {Object.entries(results)
                    .sort(([keyA], [keyB]) => { /* Sorting logic unchanged */
                      if (keyA === "Unknown Session") return 1; if (keyB === "Unknown Session") return -1;
                      const numA = parseInt(keyA.match(/\d+/)?.[0] || '0'); const numB = parseInt(keyB.match(/\d+/)?.[0] || '0');
                      if (numA !== numB) return numA - numB; return keyA.localeCompare(keyB);
                    })
                    .map(([sessionName, sessionData]) => {
                      const timingChartData = prepareTimingChartData(sessionData.timingCounts);
                      const hasTimingData = timingChartData.length > 0;
                      const hasLOData = sessionData.learningOutcomes && Array.isArray(sessionData.learningOutcomes) && sessionData.learningOutcomes.length > 0;

                      return (
                        <div key={sessionName} className="p-6 bg-gray-50 rounded-lg shadow border border-gray-200 mb-6">
                          <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">{sessionName}</h3>
                          {/* Timing Chart Section (Unchanged) */}
                          {(hasTimingData || sessionData.timingCounts) && (
                             <div className="mb-6">
                                <h4 className="text-lg font-medium text-gray-600 mb-3">Timing Response</h4>
                                {hasTimingData ? (
                                    <div style={{ width: '100%', height: 250 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={timingChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }} barGap={10} barCategoryGap="20%">
                                                <CartesianGrid strokeDasharray="3 3" vertical={false}/> <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} /> <YAxis allowDecimals={false} width={30} tick={{ fontSize: 12 }}/>
                                                <Tooltip contentStyle={{ fontSize: '12px', padding: '5px' }} itemStyle={{ padding: '0' }} /> <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : ( <p className="text-sm text-gray-500 italic">No timing responses recorded.</p> )}
                             </div>
                          )}
                          {/* Learning Outcome Table Section (Unchanged) */}
                          { (hasLOData || sessionData.learningOutcomes) && (
                            <div className="mb-6">
                                <h4 className="text-lg font-medium text-gray-600 mb-3">Learning Outcome Responses</h4>
                                <LearningOutcomeTable loData={sessionData.learningOutcomes} />
                            </div>
                          )}
                          {/* Summary (Unchanged) */}
                          <div className="mb-5">
                            <h4 className="text-lg font-medium text-gray-600 mb-2">Summary</h4>
                            <p className="text-gray-700 text-sm leading-relaxed italic">{sessionData.summary || "No summary provided."}</p>
                          </div>
                          {/* Positive Comments (Unchanged) */}
                          <div className="mb-5">
                            <h4 className="text-lg font-medium text-green-700 mb-2">Positive Comments</h4>
                            {sessionData.positiveComments?.length > 0 ? (<ul className="list-disc list-inside space-y-1 text-sm text-green-800">{sessionData.positiveComments.map((c, i) => (<li key={`pos-${i}`}>{c}</li>))}</ul>) : (<p className="text-sm text-gray-500 italic">No positive comments.</p>)}
                          </div>
                          {/* Critical Comments (Unchanged) */}
                          <div>
                            <h4 className="text-lg font-medium text-red-700 mb-2">Critical Comments / Suggestions</h4>
                            {sessionData.criticalComments?.length > 0 ? (<ul className="list-disc list-inside space-y-1 text-sm text-red-800">{sessionData.criticalComments.map((c, i) => (<li key={`crit-${i}`}>{c}</li>))}</ul>) : (<p className="text-sm text-gray-500 italic">No critical comments.</p>)}
                          </div>
                        </div>
                      )
                    })}
                </>
              )}

              {/* --- UPDATED: Word Cloud Section --- */}
              {wordCloudData && wordCloudData.length > 0 && (
                <div className="p-6 bg-gray-50 rounded-lg shadow border border-gray-200">
                  <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">Common Words (Top 50)</h2>
                  <div className="text-center p-4" aria-label="Word cloud with sentiment coloring">
                    <TagCloud
                      minSize={14}
                      maxSize={45}
                      tags={wordCloudData} // Data now includes sentiment
                      // colorOptions prop is removed - color handled by renderer
                      shuffle={false}
                      renderer={customTagRenderer} // Use the updated renderer
                      className="simple-cloud" // Keep existing class if needed
                    />
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Size indicates frequency. Color indicates sentiment (Green: Positive, Red: Negative, Gray: Neutral). Hover for details.
                  </p>
                </div>
              )}
              {/* --- End Word Cloud Section --- */}

            </div>
          )}
        </div> {/* End Ref container */}
      </div>
    </div>
  );
}