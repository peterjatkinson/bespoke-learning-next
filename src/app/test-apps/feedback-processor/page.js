"use client"; // Required for Next.js App Router client components

import React, { useState, useRef, useEffect } from "react";
import { TagCloud } from 'react-tagcloud';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
// --- NEW: Import docx and file-saver ---
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ShadingType
} from "docx";
import { saveAs } from 'file-saver';
// --- End Imports ---

const tagCloudColorOptions = {
  luminosity: 'bright',
  hue: 'blue',
};

// --- Learning Outcome Table Component (FROM PREVIOUS STEP - Needs slight modification for Docx generation) ---
// This component remains for displaying on the page. Docx generation will rebuild the table structure.
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
  const [isDownloading, setIsDownloading] = useState(false); // State for download button
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
    files.forEach((file) => formData.append("files", file));
    try {
      const response = await fetch("/test-apps/feedback-processor/api", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `HTTP error! Status: ${response.status}`);
      setResults(data.results);
      setProcessingWarnings(data.processingWarnings || []);
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

  const customTagRenderer = (tag, size, color) => ( // Unchanged
    <span key={tag.value} style={{ fontSize: `${size}px`, margin: '3px', padding: '3px', display: 'inline-block', color: color, cursor: 'default' }} title={`Count: ${tag.count}`}>{tag.value}</span>
  );

  const prepareTimingChartData = (timingCounts) => { // Unchanged
    if (!timingCounts) return [];
    return [
      { name: 'Less Time', count: timingCounts.less || 0, fill: '#82ca9d' },
      { name: 'Same Time', count: timingCounts.same || 0, fill: '#8884d8' },
      { name: 'More Time', count: timingCounts.more || 0, fill: '#ffc658' },
    ].filter(item => item.count > 0);
  };

  // --- NEW: Function to generate DOCX content ---
  const generateDocxContent = (analysisResults) => {
    const children = []; // Holds all paragraphs, tables, etc.

    // --- Optional: Add overall title ---
    children.push(
        new Paragraph({
            text: "Student Feedback Analysis Report",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
        })
    );

    // Sort sessions for consistent order in the document
    const sortedSessions = Object.entries(analysisResults).sort(([keyA], [keyB]) => {
        if (keyA === "Unknown Session") return 1;
        if (keyB === "Unknown Session") return -1;
        const numA = parseInt(keyA.match(/\d+/)?.[0] || '0');
        const numB = parseInt(keyB.match(/\d+/)?.[0] || '0');
        if (numA !== numB) return numA - numB;
        return keyA.localeCompare(keyB);
    });

    // --- Iterate through each session ---
    sortedSessions.forEach(([sessionName, sessionData]) => {
        // Session Title
        children.push(new Paragraph({
            text: sessionName,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }, // Add space before H1
            border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } } // Underline H1
        }));

        // --- Timing Data (Textual representation, not chart) ---
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
            ].join('; '); // Simple text representation
             children.push(new Paragraph({ text: timingText, style: "normal" }));
        }

        // --- Learning Outcome Table ---
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

            // Define table header style
            const tableHeaderCell = (text) => new TableCell({
                 children: [new Paragraph({ text: text, alignment: AlignmentType.CENTER })],
                 shading: { fill: "E0E0E0", type: ShadingType.CLEAR, color: "auto" }, // Light grey background
                 margins: { top: 100, bottom: 100, left: 100, right: 100 },
                 verticalAlign: AlignmentType.CENTER,
            });

            // Create header row
             const headerRow = new TableRow({
                children: [
                    tableHeaderCell("Learning Outcome"), // First column header
                    ...responseHeaders.map(header => tableHeaderCell(header)) // Other column headers
                ],
                tableHeader: true,
            });

            // Create data rows
            const dataRows = loItems.map(item => new TableRow({
                children: [
                    // First cell (LO Header)
                    new TableCell({
                        children: [new Paragraph(item.loHeader)],
                        margins: { top: 50, bottom: 50, left: 100, right: 100 },
                        width: { size: 4500, type: WidthType.DXA }, // Example fixed width
                    }),
                    // Subsequent cells (Counts)
                    ...responseHeaders.map(response => new TableCell({
                        children: [new Paragraph({ text: `${item.responses?.[response] || 0}`, alignment: AlignmentType.CENTER })],
                        margins: { top: 50, bottom: 50, left: 100, right: 100 },
                        verticalAlign: AlignmentType.CENTER,
                    }))
                ]
            }));

            // Create the table
            const table = new Table({
                rows: [headerRow, ...dataRows],
                width: { size: 100, type: WidthType.PERCENTAGE }, // Make table full width
                borders: { // Add simple borders
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

        // --- Summary ---
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

        // --- Positive Comments ---
        if (sessionData.positiveComments && sessionData.positiveComments.length > 0) {
             children.push(new Paragraph({
                text: "Positive Comments",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
            }));
            sessionData.positiveComments.forEach(comment => {
                children.push(new Paragraph({
                    text: comment,
                    bullet: { level: 0 }, // Add bullets
                    style: "normal"
                }));
            });
        }

        // --- Critical Comments ---
        if (sessionData.criticalComments && sessionData.criticalComments.length > 0) {
            children.push(new Paragraph({
                text: "Critical Comments / Suggestions",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
            }));
            sessionData.criticalComments.forEach(comment => {
                 children.push(new Paragraph({
                    text: comment,
                    bullet: { level: 0 }, // Add bullets
                    style: "normal"
                }));
            });
        }

         // Add space between sessions
         children.push(new Paragraph({ text: "", spacing: { after: 300 } }));

    }); // End session loop

    // --- Optional: Add Word Cloud Data (Textual) ---
    if (wordCloudData && wordCloudData.length > 0) {
         children.push(new Paragraph({
            text: "Common Words in Feedback (Top 50)",
            heading: HeadingLevel.HEADING_1, // Make it a main section
            spacing: { before: 400, after: 200 },
            border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } }
        }));
        const wordList = wordCloudData.map(tag => `${tag.value} (${tag.count})`).join(', ');
        children.push(new Paragraph({ text: wordList, style: "normal" }));
    }


    // Create the document object
    const doc = new Document({
        sections: [{
            properties: {}, // Add page margins, etc. here if needed
            children: children,
        }],
        styles: { // Define basic styles if needed
            paragraphStyles: [
                { id: "normal", name: "Normal", run: { size: 22 } }, // 11pt font
                { id: "Heading1", name: "Heading 1", basedOn: "normal", next: "normal", quickFormat: true, run: { size: 32, bold: true, color: "333333" } }, // 16pt bold
                { id: "Heading2", name: "Heading 2", basedOn: "normal", next: "normal", quickFormat: true, run: { size: 26, bold: true, color: "555555" } }, // 13pt bold
            ]
        }
    });

    return doc;
  };

  // --- NEW: Handler for the download button ---
  const handleDownloadDocx = async () => {
    if (!results) {
        console.error("No results available to download.");
        return;
    }
    setIsDownloading(true);
    try {
        console.log("Generating DOCX...");
        // Generate the document structure using the function above
        const doc = generateDocxContent(results);

        // Use Packer to generate the blob
        const blob = await Packer.toBlob(doc);

        // Use file-saver to trigger the download
        saveAs(blob, "feedback_analysis_report.docx");
        console.log("DOCX download initiated.");

    } catch (err) {
        console.error("Error generating or downloading DOCX:", err);
        setError("Failed to generate Word document."); // Show error to user
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
                 {/* --- NEW: Download Button --- */}
                {results && !isLoading && (
                     <button
                        type="button"
                        onClick={handleDownloadDocx}
                        disabled={isDownloading}
                        className={`w-full sm:w-auto inline-flex justify-center items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out ${isDownloading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 focus:ring-green-500"}`}
                        aria-busy={isDownloading}
                    >
                        {isDownloading ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                                Generating...
                            </>
                        ) : (
                            "Download Results (.docx)"
                        )}
                    </button>
                 )}
                 {/* --- End Download Button --- */}
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

        {/* --- Results Area (Structure mostly unchanged, just includes LO Table component call) --- */}
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
                          {/* Timing Chart Section */}
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
                          {/* Learning Outcome Table Section */}
                          { (hasLOData || sessionData.learningOutcomes) && (
                            <div className="mb-6">
                                <h4 className="text-lg font-medium text-gray-600 mb-3">Learning Outcome Responses</h4>
                                {/* Uses the same component, but the DOCX generation rebuilds it */}
                                <LearningOutcomeTable loData={sessionData.learningOutcomes} />
                            </div>
                          )}
                          {/* Summary */}
                          <div className="mb-5">
                            <h4 className="text-lg font-medium text-gray-600 mb-2">Summary</h4>
                            <p className="text-gray-700 text-sm leading-relaxed italic">{sessionData.summary || "No summary provided."}</p>
                          </div>
                          {/* Positive Comments */}
                          <div className="mb-5">
                            <h4 className="text-lg font-medium text-green-700 mb-2">Positive Comments</h4>
                            {sessionData.positiveComments?.length > 0 ? (<ul className="list-disc list-inside space-y-1 text-sm text-green-800">{sessionData.positiveComments.map((c, i) => (<li key={`pos-${i}`}>{c}</li>))}</ul>) : (<p className="text-sm text-gray-500 italic">No positive comments.</p>)}
                          </div>
                          {/* Critical Comments */}
                          <div>
                            <h4 className="text-lg font-medium text-red-700 mb-2">Critical Comments / Suggestions</h4>
                            {sessionData.criticalComments?.length > 0 ? (<ul className="list-disc list-inside space-y-1 text-sm text-red-800">{sessionData.criticalComments.map((c, i) => (<li key={`crit-${i}`}>{c}</li>))}</ul>) : (<p className="text-sm text-gray-500 italic">No critical comments.</p>)}
                          </div>
                        </div>
                      )
                    })}
                </>
              )}
              {/* Word Cloud Section */}
              {wordCloudData && wordCloudData.length > 0 && (
                <div className="p-6 bg-gray-50 rounded-lg shadow border border-gray-200">
                  <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">Common Words (Top 50)</h2>
                  <div className="text-center p-4" aria-label="Word cloud">
                    <TagCloud minSize={14} maxSize={45} tags={wordCloudData} colorOptions={tagCloudColorOptions} shuffle={false} renderer={customTagRenderer} className="simple-cloud"/>
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-2">Size indicates frequency. Hover for count.</p>
                </div>
              )}
            </div>
          )}
        </div> {/* End Ref container */}
      </div>
    </div>
  );
}