"use client";

import React, { useState, useRef, useEffect } from "react";
import { TagCloud } from 'react-tagcloud';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
    WidthType, AlignmentType, BorderStyle, ShadingType
} from "docx";
import { saveAs } from 'file-saver';
import Papa from 'papaparse'; // <-- IMPORT PapaParse for frontend use

// --- Constants moved from backend (needed for parsing logic) ---
const STUDENT_ID_HEADER = 'Student Id';
const TIMING_COLUMN_HEADER = 'Timing';
const FEEDBACK_COLUMN_HEADER = 'Student Feedback';
const OMIT_COMMENT_STRINGS = new Set(['none', 'n/a', '-']);
const TIMING_LESS = "It took less time to complete the tasks and activities than estimated";
const TIMING_MORE = "It took more time to complete the tasks and activities than estimated";
const TIMING_SAME = "It took about the same amount of time to complete the tasks and activities as estimated";
const STOP_WORDS = new Set([ // Keep stop words for frontend word cloud generation
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at",
    "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
    "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
    "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's",
    "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself",
    "let's", "me", "more", "most", "mustn't", "my", "myself",
    "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own",
    "particularly",
    "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
    "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too",
    "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't",
    "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves",
    // Domain-specific words (customize as needed)
    "n/a", "na", "-", "module", "session", "also", "get", "bit", "lot", "really", "think", "will", "well", "much", "good", "great", "like", "feel", "found", "very", "quite", "especially", "content", "learn", "learning", "understand", "understanding", "would", "could", "week", "section", "studies", "study", "course", "module"
]);
// --- End Constants ---


// --- Helper function to extract session name from filename (Unchanged) ---
function getSessionName(filename) {
    const match = filename.match(/^(Session\s*\d+)/i);
    if (match) {
        return match[1].replace(/\s+/g, ' ').trim();
    }
    if (filename.toLowerCase().endsWith('.csv')) {
        const baseName = filename.slice(0, -4);
        if (!baseName.match(/^\d+$/) && baseName.length > 0 && baseName.trim().length > 0) {
             return baseName.trim();
        }
    }
    return "Unknown Session";
}

// --- Learning Outcome Table Component (Unchanged) ---
function LearningOutcomeTable({ loData }) {
    // ... (Component remains exactly the same) ...
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
    const [results, setResults] = useState(null); // Will store combined results from backend
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState(null);
    const [processingWarnings, setProcessingWarnings] = useState([]);
    // wordCloudData state now stores the *final* data including sentiment from backend
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
            } else {
                setProcessingWarnings([]); // Clear warning if all are CSVs
            }
        }
    };

    // --- NEW: Frontend File Parsing Function ---
    const parseCsvFile = (file) => {
        return new Promise((resolve, reject) => {
            const sessionName = getSessionName(file.name);
            let fileWarnings = []; // Local warnings for this file

            console.log(`Parsing file: ${file.name} on frontend...`);

            // Use FileReader to read file content in the browser
            const reader = new FileReader();

            reader.onload = (event) => {
                const fileContent = event.target.result;
                if (!fileContent || fileContent.trim().length === 0) {
                    fileWarnings.push(`File "${file.name}" is empty or unreadable.`);
                    // Resolve with minimal data and warnings, don't reject whole process
                    resolve({ sessionName, data: null, warnings: fileWarnings, allCommentsText: "" });
                    return;
                }

                let sessionData = {
                    comments: [],
                    timingCounts: { less: 0, more: 0, same: 0 },
                    learningOutcomes: [], // Will be populated after cleaning headers
                    parsingInfo: { // Track if key headers were found
                        foundStudentId: false,
                        foundTiming: false,
                        foundFeedback: false,
                    }
                };
                let allCommentsTextForFile = ""; // Accumulate comments for this file

                Papa.parse(fileContent, {
                    header: true,
                    skipEmptyLines: true,
                    dynamicTyping: false,
                    quotes: true,
                    escapeChar: '"',
                    transformHeader: header => header.trim(),
                    complete: (results) => {
                        try {
                            if (results.errors.length > 0) {
                                console.warn(`CSV parsing warnings/errors in ${file.name}:`, results.errors);
                                results.errors.forEach(err => fileWarnings.push(`Parsing issue in "${file.name}" near row ${err.row || 'unknown'}: ${err.message} (${err.code})`));
                            }

                            const actualHeaders = results.meta.fields;
                            if (!actualHeaders || actualHeaders.length === 0) {
                                fileWarnings.push(`Could not parse headers for file "${file.name}". Skipping file processing.`);
                                resolve({ sessionName, data: null, warnings: fileWarnings, allCommentsText: "" });
                                return;
                            }

                            // Find key column indices
                            let studentIdIndex = -1;
                            let timingIndex = -1;
                            let feedbackIndex = -1;
                            actualHeaders.forEach((header, index) => {
                                if (header === STUDENT_ID_HEADER) studentIdIndex = index;
                                if (header === TIMING_COLUMN_HEADER) timingIndex = index;
                                if (header === FEEDBACK_COLUMN_HEADER) feedbackIndex = index;
                            });

                            sessionData.parsingInfo.foundStudentId = studentIdIndex !== -1;
                            sessionData.parsingInfo.foundTiming = timingIndex !== -1;
                            sessionData.parsingInfo.foundFeedback = feedbackIndex !== -1;

                            // Identify, Clean, and Store Learning Outcome Columns
                            let originalLoHeaders = [];
                            let cleanedLoHeaders = [];

                            if (studentIdIndex !== -1 && timingIndex !== -1 && studentIdIndex < timingIndex) {
                                originalLoHeaders = actualHeaders.slice(studentIdIndex + 1, timingIndex);

                                // Cleaning logic (same as backend v3)
                                cleanedLoHeaders = originalLoHeaders.map(header => {
                                    let cleaned = header.trim();
                                    if (cleaned.endsWith('.\\"')) { cleaned = cleaned.slice(0, -3); }
                                    if (cleaned.endsWith('\\.')) { cleaned = cleaned.slice(0, -2); }
                                    if (cleaned.startsWith('"') && cleaned.endsWith('"')) { cleaned = cleaned.slice(1, -1); }
                                    if (cleaned.startsWith("'") && cleaned.endsWith("'")) { cleaned = cleaned.slice(1, -1); }
                                    return cleaned.trim();
                                });

                                sessionData.learningOutcomes = cleanedLoHeaders.map(cleanedHeader => ({
                                    loHeader: cleanedHeader,
                                    responses: {}
                                }));

                                if (originalLoHeaders.length === 0) {
                                    fileWarnings.push(`No columns found between "${STUDENT_ID_HEADER}" and "${TIMING_COLUMN_HEADER}" in "${file.name}" for Learning Outcomes.`);
                                }
                            } else {
                                fileWarnings.push(`Could not identify Learning Outcome columns in "${file.name}". Requires "${STUDENT_ID_HEADER}" and "${TIMING_COLUMN_HEADER}" in order.`);
                            }

                            // Issue Header Warnings
                            if (!sessionData.parsingInfo.foundFeedback) fileWarnings.push(`File "${file.name}" missing: '${FEEDBACK_COLUMN_HEADER}'. Comments skipped.`);
                            if (!sessionData.parsingInfo.foundTiming) fileWarnings.push(`File "${file.name}" missing: '${TIMING_COLUMN_HEADER}'. Timing skipped.`);
                            if (!sessionData.parsingInfo.foundStudentId) fileWarnings.push(`File "${file.name}" missing: '${STUDENT_ID_HEADER}'. LO data skipped.`);


                            // Process Rows
                            results.data.forEach((row) => {
                                // IMPORTANT: Access row data ONLY using the actual headers found
                                // DO NOT use studentId directly if found - it's sensitive!

                                // Process Feedback Comments (if column exists)
                                if (sessionData.parsingInfo.foundFeedback && row[FEEDBACK_COLUMN_HEADER]) {
                                    const feedback = row[FEEDBACK_COLUMN_HEADER].trim();
                                    if (feedback && !OMIT_COMMENT_STRINGS.has(feedback.toLowerCase())) {
                                        sessionData.comments.push(feedback);
                                        allCommentsTextForFile += feedback + " ";
                                    }
                                }

                                // Process Timing (if column exists)
                                if (sessionData.parsingInfo.foundTiming && row[TIMING_COLUMN_HEADER]) {
                                    const timingResponse = row[TIMING_COLUMN_HEADER].trim();
                                    if (timingResponse) {
                                        switch (timingResponse) {
                                            case TIMING_LESS: sessionData.timingCounts.less++; break;
                                            case TIMING_MORE: sessionData.timingCounts.more++; break;
                                            case TIMING_SAME: sessionData.timingCounts.same++; break;
                                        }
                                    }
                                }

                                // Process Learning Outcomes (if columns exist)
                                // Use originalLoHeaders for lookup, map to cleaned structure by index
                                if (originalLoHeaders.length > 0 && sessionData.learningOutcomes.length === originalLoHeaders.length) {
                                    originalLoHeaders.forEach((originalHeader, index) => {
                                        if (row[originalHeader]){ // Check if the original header key exists in the row
                                            const loResponse = row[originalHeader].trim();
                                            if (loResponse) {
                                                const loEntry = sessionData.learningOutcomes[index];
                                                if (loEntry) {
                                                    const currentCount = loEntry.responses[loResponse] || 0;
                                                    loEntry.responses[loResponse] = currentCount + 1;
                                                }
                                            }
                                        }
                                    });
                                }
                            }); // End row loop

                            console.log(`Frontend parsing complete for ${file.name}`);
                            // Resolve with extracted data and any warnings for this file
                            resolve({ sessionName, data: sessionData, warnings: fileWarnings, allCommentsText: allCommentsTextForFile });

                        } catch (completionError) {
                             console.error(`Error within PapaParse complete callback for ${file.name}:`, completionError);
                             fileWarnings.push(`Internal error processing parsed data for ${file.name}: ${completionError.message}`);
                             // Resolve with failure indication for this file
                             resolve({ sessionName, data: null, warnings: fileWarnings, allCommentsText: "" });
                        }
                    }, // End complete callback
                    error: (error) => {
                        console.error(`Fatal CSV parsing error in ${file.name}:`, error.message);
                        fileWarnings.push(`Failed to parse file "${file.name}": ${error.message}`);
                        // Resolve with failure indication for this file
                        resolve({ sessionName, data: null, warnings: fileWarnings, allCommentsText: "" });
                    } // End error callback
                }); // End Papa.parse call
            }; // End reader.onload

            reader.onerror = (event) => {
                console.error(`Error reading file ${file.name}:`, reader.error);
                fileWarnings.push(`Failed to read file "${file.name}".`);
                resolve({ sessionName, data: null, warnings: fileWarnings, allCommentsText: "" });
            };

            // Read the file as text
            reader.readAsText(file);
        }); // End Promise
    }; // End parseCsvFile

    // --- UPDATED: handleSubmit to use frontend parsing ---
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

        try {
            // 1. Parse all files on the frontend
            const parsePromises = files.map(file => parseCsvFile(file));
            const parsedResults = await Promise.all(parsePromises);

            // 2. Aggregate data and collect warnings/comments
            let aggregatedSessionData = {};
            let combinedWarnings = [];
            let combinedCommentsText = "";

            parsedResults.forEach(result => {
                if (result.warnings.length > 0) {
                    combinedWarnings.push(...result.warnings);
                }
                if (result.data) { // Only process if parsing succeeded somewhat
                    const sessionName = result.sessionName;
                    if (!aggregatedSessionData[sessionName]) {
                        aggregatedSessionData[sessionName] = {
                            comments: [],
                            timingCounts: { less: 0, more: 0, same: 0 },
                            learningOutcomes: [] // Will merge/create LOs properly
                        };
                    }
                    // Merge comments
                    aggregatedSessionData[sessionName].comments.push(...result.data.comments);
                    // Merge timing counts
                    aggregatedSessionData[sessionName].timingCounts.less += result.data.timingCounts.less;
                    aggregatedSessionData[sessionName].timingCounts.more += result.data.timingCounts.more;
                    aggregatedSessionData[sessionName].timingCounts.same += result.data.timingCounts.same;
                    // Merge learning outcomes (more complex - need to match headers)
                    result.data.learningOutcomes.forEach(parsedLO => {
                        let existingLO = aggregatedSessionData[sessionName].learningOutcomes.find(lo => lo.loHeader === parsedLO.loHeader);
                        if (!existingLO) {
                            // Add new LO structure if it doesn't exist for this session yet
                            existingLO = { loHeader: parsedLO.loHeader, responses: {} };
                            aggregatedSessionData[sessionName].learningOutcomes.push(existingLO);
                        }
                        // Add counts from parsed responses to existing/new LO
                        Object.entries(parsedLO.responses).forEach(([responseText, count]) => {
                            existingLO.responses[responseText] = (existingLO.responses[responseText] || 0) + count;
                        });
                    });

                    combinedCommentsText += result.allCommentsText; // Add comments from this file
                }
            });

            setProcessingWarnings(combinedWarnings); // Show parsing warnings immediately

            // Filter out sessions with no meaningful data after aggregation
            const validSessionNames = Object.keys(aggregatedSessionData).filter(name =>
                aggregatedSessionData[name].comments.length > 0 ||
                aggregatedSessionData[name].timingCounts.less > 0 ||
                aggregatedSessionData[name].timingCounts.more > 0 ||
                aggregatedSessionData[name].timingCounts.same > 0 ||
                aggregatedSessionData[name].learningOutcomes.some(lo => Object.keys(lo.responses).length > 0)
            );

            if (validSessionNames.length === 0) {
                throw new Error("No usable data (comments, timing, LOs) could be extracted from the selected file(s). Check file format and content.");
            }

            // Prune aggregated data to only include valid sessions
            const finalAggregatedData = {};
            validSessionNames.forEach(name => {
                finalAggregatedData[name] = aggregatedSessionData[name];
            });


            // 3. Generate initial Word Cloud data (value, count) on Frontend
            let initialWordCloudData = [];
            if (combinedCommentsText.length > 0) {
                 try {
                    console.log("Generating word cloud data on frontend...");
                    const words = combinedCommentsText.toLowerCase().replace(/’/g, "'").replace(/[^a-z'\s-]/g, "").replace(/\s+/g, ' ').split(' ');
                    const wordCounts = {};
                    words.forEach(word => {
                        const trimmedWord = word.trim();
                        if (trimmedWord && trimmedWord.length > 2 && !STOP_WORDS.has(trimmedWord) && isNaN(trimmedWord)) {
                            wordCounts[trimmedWord] = (wordCounts[trimmedWord] || 0) + 1;
                        }
                    });
                    initialWordCloudData = Object.entries(wordCounts)
                        .map(([text, count]) => ({ value: text, count: count })) // Structure: { value, count }
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 50);
                    console.log(`Generated ${initialWordCloudData.length} words for cloud on frontend.`);
                } catch (cloudError) {
                    console.error("Error generating word cloud data on frontend:", cloudError);
                    setProcessingWarnings(prev => [...prev, "Failed to generate word cloud data."]);
                    initialWordCloudData = [];
                }
            }


            // 4. Prepare payload for Backend API
            const apiPayload = {
                sessionData: finalAggregatedData, // Contains { comments, timingCounts, learningOutcomes } per session
                wordCloudDataInput: initialWordCloudData // Send { value, count } list
            };

            // 5. Send processed data to Backend for AI analysis
            console.log("Sending processed data to backend API...");
            const response = await fetch("/test-apps/feedback-processor-clientside/api", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiPayload) // Send JSON, not FormData
             });
            const data = await response.json();

            if (!response.ok) {
                // Combine backend warnings with frontend warnings
                setProcessingWarnings(prev => [...prev, ...(data.processingWarnings || [])]);
                throw new Error(data.error || `Backend API error! Status: ${response.status}`);
            }

            // 6. Set final results from backend
            setResults(data.results); // Backend combines AI results with LO/Timing data
            setWordCloudData(data.wordCloudData || null); // Backend returns word cloud data with sentiment added
            // Combine backend warnings with any remaining frontend ones
            setProcessingWarnings(prev => [...prev, ...(data.processingWarnings || [])].filter((v, i, a) => a.indexOf(v) === i)); // Deduplicate


        } catch (err) {
            console.error("Error during frontend processing or API call:", err);
            setError(err.message || "An unknown error occurred during analysis.");
            setResults(null);
            setWordCloudData(null);
        } finally {
            setIsLoading(false);
        }
    }; // End handleSubmit


    const handleClear = () => {
        setFiles([]); setResults(null); setError(null); setProcessingWarnings([]); setWordCloudData(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // --- Custom Tag Renderer (Unchanged) ---
    const customTagRenderer = (tag, size) => {
        let color;
        switch (tag.sentiment) {
            case 'positive': color = '#228B22'; break; // ForestGreen
            case 'negative': color = '#DC143C'; break; // Crimson Red
            case 'neutral': default: color = '#696969'; break; // DimGray
        }
        return ( <span key={tag.value} style={{ fontSize: `${size}px`, margin: '3px', padding: '3px', display: 'inline-block', color: color, cursor: 'default' }} title={`Count: ${tag.count}${tag.sentiment ? ` (${tag.sentiment})` : ''}`}> {tag.value} </span> );
    };

    // --- Prepare Timing Chart Data (Unchanged) ---
    const prepareTimingChartData = (timingCounts) => {
        // ... (Function remains exactly the same) ...
        if (!timingCounts) return [];
        return [
          { name: 'Less Time', count: timingCounts.less || 0, fill: '#82ca9d' },
          { name: 'Same Time', count: timingCounts.same || 0, fill: '#8884d8' },
          { name: 'More Time', count: timingCounts.more || 0, fill: '#ffc658' },
        ].filter(item => item.count > 0);
    };

    // --- Function to generate DOCX content (Unchanged logic, BUT relies on state set by backend) ---
    // IMPORTANT: This function now needs the `wordCloudData` state which includes sentiment
    const generateDocxContent = (analysisResults, wordCloudDataForDoc) => {
        // ... (This function definition remains exactly the same as before, using styles etc.) ...
        // It will correctly use the `wordCloudDataForDoc` passed to it, which should
        // now have the sentiment property added by the backend.
        const children = [];

        children.push(
            new Paragraph({ text: "Student Feedback Analysis Report", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { after: 200 } })
        );

        const sortedSessions = Object.entries(analysisResults).sort(([keyA], [keyB]) => {
            if (keyA === "Unknown Session") return 1; if (keyB === "Unknown Session") return -1;
            const numA = parseInt(keyA.match(/\d+/)?.[0] || '0'); const numB = parseInt(keyB.match(/\d+/)?.[0] || '0');
            if (numA !== numB) return numA - numB; return keyA.localeCompare(keyB);
        });

        sortedSessions.forEach(([sessionName, sessionData]) => {
            children.push(new Paragraph({ text: sessionName, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 }, border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } } }));

            if (sessionData.timingCounts) {
                 children.push(new Paragraph({ text: "Timing Response", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
                 const timingText = [`Less time than estimated: ${sessionData.timingCounts.less || 0}`, `About the same time as estimated: ${sessionData.timingCounts.same || 0}`, `More time than estimated: ${sessionData.timingCounts.more || 0}`].join('; ');
                 children.push(new Paragraph({ text: timingText, style: "normal" }));
            }

            if (sessionData.learningOutcomes && Array.isArray(sessionData.learningOutcomes) && sessionData.learningOutcomes.length > 0) {
                children.push(new Paragraph({ text: "Learning Outcome Responses", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
                const loData = sessionData.learningOutcomes; const uniqueResponses = new Set(); loData.forEach(item => { if (item.responses) Object.keys(item.responses).forEach(response => uniqueResponses.add(response)); }); const responseHeaders = Array.from(uniqueResponses).sort(); const loItems = loData;
                const tableHeaderCell = (text) => new TableCell({ children: [new Paragraph({ text: text, alignment: AlignmentType.CENTER })], shading: { fill: "E0E0E0", type: ShadingType.CLEAR, color: "auto" }, margins: { top: 100, bottom: 100, left: 100, right: 100 }, verticalAlign: AlignmentType.CENTER });
                const headerRow = new TableRow({ children: [tableHeaderCell("Learning Outcome"), ...responseHeaders.map(header => tableHeaderCell(header))], tableHeader: true });
                const dataRows = loItems.map(item => new TableRow({ children: [new TableCell({ children: [new Paragraph(item.loHeader)], margins: { top: 50, bottom: 50, left: 100, right: 100 }, width: { size: 4500, type: WidthType.DXA } }), ...responseHeaders.map(response => new TableCell({ children: [new Paragraph({ text: `${item.responses?.[response] || 0}`, alignment: AlignmentType.CENTER })], margins: { top: 50, bottom: 50, left: 100, right: 100 }, verticalAlign: AlignmentType.CENTER }))] }));
                const table = new Table({ rows: [headerRow, ...dataRows], width: { size: 100, type: WidthType.PERCENTAGE }, borders: { top: { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" }, left: { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" }, right: { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" }, insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" }, insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } } });
                children.push(table);
            }

            if (sessionData.summary) {
                children.push(new Paragraph({ text: "Summary", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
                children.push(new Paragraph({ children: [new TextRun({ text: sessionData.summary, italics: true, font: "Calibri" })], style: "normal" })); // Example font
            }

            if (sessionData.positiveComments && sessionData.positiveComments.length > 0) {
                 children.push(new Paragraph({ text: "Positive Comments", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
                 sessionData.positiveComments.forEach(comment => { children.push(new Paragraph({ text: comment, bullet: { level: 0 }, style: "normal" })); });
            }

            if (sessionData.criticalComments && sessionData.criticalComments.length > 0) {
                children.push(new Paragraph({ text: "Critical Comments / Suggestions", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
                sessionData.criticalComments.forEach(comment => { children.push(new Paragraph({ text: comment, bullet: { level: 0 }, style: "normal" })); });
            }

             children.push(new Paragraph({ text: "", spacing: { after: 300 } }));
        }); // End session loop

        // Use the passed wordCloudDataForDoc which has sentiment
        if (wordCloudDataForDoc && wordCloudDataForDoc.length > 0) {
            children.push(new Paragraph({ text: "Common Words in Feedback (Top 50)", heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 }, border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } } }));
            const wordList = wordCloudDataForDoc.map(tag => `${tag.value} (${tag.count}, ${tag.sentiment || 'neutral'})`).join(', ');
            children.push(new Paragraph({ text: wordList, style: "normal" }));
        }

        const doc = new Document({
            sections: [{ properties: {}, children: children }],
            styles: { // Define styles including fonts
                paragraphStyles: [
                    { id: "normal", name: "Normal", run: { size: 22, font: "Calibri" } }, // Set default font
                    { id: "Heading1", name: "Heading 1", basedOn: "normal", next: "normal", quickFormat: true, run: { size: 32, bold: true, color: "333333", font: "Calibri Light" } }, // Set H1 font
                    { id: "Heading2", name: "Heading 2", basedOn: "normal", next: "normal", quickFormat: true, run: { size: 26, bold: true, color: "555555", font: "Calibri Light" } }, // Set H2 font
                ]
            }
        });
        return doc;
    };


    // --- Handler for the download button (Passes final wordCloudData state) ---
    const handleDownloadDocx = async () => {
        if (!results) {
            console.error("No results available to download.");
            return;
        }
        setIsDownloading(true);
        try {
            console.log("Generating DOCX...");
            // Pass results and the final wordCloudData (which includes sentiment)
            const doc = generateDocxContent(results, wordCloudData);

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


    // --- RETURN JSX (Structure Unchanged) ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 shadow-xl rounded-lg border border-gray-200">
                {/* Title */}
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    Student Feedback Analyzer
                </h1>

                {/* Form */}
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
                           {isLoading ? (<><span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>Processing...</>) : ("Analyze Feedback")}
                       </button>
                       <button type="button" onClick={handleClear} disabled={isLoading}
                       className="w-full sm:w-auto inline-flex justify-center px-6 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                           Clear Selection
                       </button>
                       {/* Download Button */}
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
                    {/* Error/Warning Area */}
                    {(error || processingWarnings.length > 0) && (
                       <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md" aria-live="assertive">
                           {error && (<p className="text-sm font-medium text-red-800 mb-2">Error: {error}</p>)}
                           {processingWarnings.length > 0 && (
                               <div className={`${error ? 'mt-2 pt-2 border-t border-red-200' : ''}`}>
                               <p className="text-sm font-medium text-orange-800 mb-1">Processing Notes / Warnings:</p>
                               <ul className="list-disc list-inside text-sm text-orange-700">{processingWarnings.map((msg, index) => (<li key={index}>{msg}</li>))}</ul>
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
                                    .sort(([keyA], [keyB]) => { /* Sort logic */ if (keyA === "Unknown Session") return 1; if (keyB === "Unknown Session") return -1; const numA = parseInt(keyA.match(/\d+/)?.[0] || '0'); const numB = parseInt(keyB.match(/\d+/)?.[0] || '0'); if (numA !== numB) return numA - numB; return keyA.localeCompare(keyB); })
                                    .map(([sessionName, sessionData]) => {
                                    const timingChartData = prepareTimingChartData(sessionData.timingCounts);
                                    const hasTimingData = timingChartData.length > 0;
                                    const hasLOData = sessionData.learningOutcomes && Array.isArray(sessionData.learningOutcomes) && sessionData.learningOutcomes.length > 0;

                                    return ( /* Session block JSX unchanged */
                                        <div key={sessionName} className="p-6 bg-gray-50 rounded-lg shadow border border-gray-200 mb-6">
                                          <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">{sessionName}</h3>
                                          {(hasTimingData || sessionData.timingCounts) && ( <div className="mb-6"> <h4 className="text-lg font-medium text-gray-600 mb-3">Timing Response</h4> {hasTimingData ? (<div style={{ width: '100%', height: 250 }}> <ResponsiveContainer> <BarChart data={timingChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }} barGap={10} barCategoryGap="20%"> <CartesianGrid strokeDasharray="3 3" vertical={false}/> <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} /> <YAxis allowDecimals={false} width={30} tick={{ fontSize: 12 }}/> <Tooltip contentStyle={{ fontSize: '12px', padding: '5px' }} itemStyle={{ padding: '0' }} /> <Bar dataKey="count" radius={[4, 4, 0, 0]} /> </BarChart> </ResponsiveContainer> </div>) : ( <p className="text-sm text-gray-500 italic">No timing responses recorded.</p> )} </div> )}
                                          { (hasLOData || sessionData.learningOutcomes) && ( <div className="mb-6"> <h4 className="text-lg font-medium text-gray-600 mb-3">Learning Outcome Responses</h4> <LearningOutcomeTable loData={sessionData.learningOutcomes} /> </div> )}
                                          <div className="mb-5"> <h4 className="text-lg font-medium text-gray-600 mb-2">Summary</h4> <p className="text-gray-700 text-sm leading-relaxed italic">{sessionData.summary || "No summary provided."}</p> </div>
                                          <div className="mb-5"> <h4 className="text-lg font-medium text-green-700 mb-2">Positive Comments</h4> {sessionData.positiveComments?.length > 0 ? (<ul className="list-disc list-inside space-y-1 text-sm text-green-800">{sessionData.positiveComments.map((c, i) => (<li key={`pos-${i}`}>{c}</li>))}</ul>) : (<p className="text-sm text-gray-500 italic">No positive comments.</p>)} </div>
                                          <div> <h4 className="text-lg font-medium text-red-700 mb-2">Critical Comments / Suggestions</h4> {sessionData.criticalComments?.length > 0 ? (<ul className="list-disc list-inside space-y-1 text-sm text-red-800">{sessionData.criticalComments.map((c, i) => (<li key={`crit-${i}`}>{c}</li>))}</ul>) : (<p className="text-sm text-gray-500 italic">No critical comments.</p>)} </div>
                                        </div>
                                    )
                                    })}
                                </>
                            )}
                            {/* Word Cloud Section */}
                            {wordCloudData && wordCloudData.length > 0 && (
                                <div className="p-6 bg-gray-50 rounded-lg shadow border border-gray-200">
                                <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">Common Words (Top 50)</h2>
                                <div className="text-center p-4" aria-label="Word cloud with sentiment coloring">
                                  <TagCloud minSize={14} maxSize={45} tags={wordCloudData} shuffle={false} renderer={customTagRenderer} className="simple-cloud" />
                                </div>
                                <p className="text-xs text-center text-gray-500 mt-2"> Size indicates frequency. Color indicates sentiment (Green: Positive, Red: Negative, Gray: Neutral). Hover for details. </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}