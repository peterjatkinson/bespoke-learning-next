"use client";

import React, { useState, useRef, useEffect, useMemo } from "react"; // Added useMemo
import { TagCloud } from 'react-tagcloud';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
    WidthType, AlignmentType, BorderStyle, ShadingType
} from "docx";
import { saveAs } from 'file-saver';
import Papa from 'papaparse'; // PapaParse is used on the frontend here

// --- Constants (Unchanged) ---
const STUDENT_ID_HEADER = 'Student Id';
const TIMING_COLUMN_HEADER = 'Timing';
const FEEDBACK_COLUMN_HEADER = 'Student Feedback';
const OMIT_COMMENT_STRINGS = new Set(['none', 'n/a', '-']);
const TIMING_LESS = "It took less time to complete the tasks and activities than estimated";
const TIMING_MORE = "It took more time to complete the tasks and activities than estimated";
const TIMING_SAME = "It took about the same amount of time to complete the tasks and activities as estimated";
const STOP_WORDS = new Set([ /* ... Keep your existing stop words list ... */
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
    "n/a", "na", "-", "module", "session", "also", "get", "bit", "lot", "really", "think", "will", "well", "much", "good", "great", "like", "feel", "found", "very", "quite", "especially", "content", "learn", "learning", "understand", "understanding", "would", "could", "week", "section", "studies", "study", "course", "module"
]);
// --- End Constants ---

// --- Helper function getSessionName (Unchanged) ---
function getSessionName(filename) {
    const match = filename.match(/^(Session\s*\d+)/i); if (match) { return match[1].replace(/\s+/g, ' ').trim(); } if (filename.toLowerCase().endsWith('.csv')) { const baseName = filename.slice(0, -4); if (!baseName.match(/^\d+$/) && baseName.length > 0 && baseName.trim().length > 0) { return baseName.trim(); } } return "Unknown Session";
}

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

export default function FeedbackAnalyzerPage() {
    // --- State variables ---
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // For initial analysis
    const [isDownloading, setIsDownloading] = useState(false);
    const [isRefiningComments, setIsRefiningComments] = useState(false); // For existing refine action
    const [isThemingComments, setIsThemingComments] = useState(false); // For NEW theme action

    const [error, setError] = useState(null);
    const [processingWarnings, setProcessingWarnings] = useState([]);

    // Store results from different analysis types
    const [initialAnalysisResults, setInitialAnalysisResults] = useState(null); // Full original AI results (P/C, summary, etc.)
    const [refinedCommentsOnlyResults, setRefinedCommentsOnlyResults] = useState(null); // Results from "Refine Comments Only" (filtered P/C lists)
    const [themedCommentsResults, setThemedCommentsResults] = useState(null); // Results from "Refine and Organise by Theme" (themed structure)

    // State to manage which results are currently displayed and exported
    const [currentResultsView, setCurrentResultsView] = useState(null);
    const [viewMode, setViewMode] = useState('initial'); // 'initial', 'refined', 'themed'

    const [wordCloudData, setWordCloudData] = useState(null); // Word cloud data (from initial analysis only)

    const fileInputRef = useRef(null);
    const resultsRef = useRef(null);

    // Combine all loading states for disabling buttons
    const isBusy = isLoading || isRefiningComments || isThemingComments;

    // --- useEffect (Scroll into view - Unchanged) ---
    useEffect(() => {
      // Scroll when any results view becomes available or wordCloudData is set
      if (currentResultsView || wordCloudData) {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }, [currentResultsView, wordCloudData]); // Depend on currentResultsView now

    // --- handleFileChange (Reset ALL results and view states) ---
    const handleFileChange = (event) => {
        setError(null);
        setInitialAnalysisResults(null);
        setRefinedCommentsOnlyResults(null);
        setThemedCommentsResults(null);
        setCurrentResultsView(null); // Reset current view
        setViewMode('initial'); // Reset view mode
        setProcessingWarnings([]);
        setWordCloudData(null);
        setIsRefiningComments(false);
        setIsThemingComments(false);
        if (event.target.files) {
          const csvFiles = Array.from(event.target.files).filter(
            (file) => file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv")
          );
          setFiles(csvFiles);
          if (csvFiles.length !== event.target.files.length) {
            setProcessingWarnings(["Some non-CSV files were ignored."]);
          } else {
              setProcessingWarnings([]); // Clear previous warnings if all files are CSVs
          }
        }
     };

    // --- parseCsvFile (Unchanged) ---
     const parseCsvFile = (file) => {
        return new Promise((resolve, reject) => {
            const sessionName = getSessionName(file.name);
            let fileWarnings = [];
            console.log(`Parsing file: ${file.name} on frontend...`);
            const reader = new FileReader();

            reader.onload = (event) => {
                const fileContent = event.target.result;
                if (!fileContent || fileContent.trim().length === 0) {
                    fileWarnings.push(`File "${file.name}" is empty or unreadable.`);
                    resolve({ sessionName, data: null, warnings: fileWarnings, allCommentsText: "" });
                    return;
                }

                let sessionData = {
                    comments: [], // Store ALL original comments parsed
                    timingCounts: { less: 0, more: 0, same: 0 },
                    learningOutcomes: [], // Format: [{ loHeader: string, responses: { response: count } }]
                    parsingInfo: {
                        foundStudentId: false, foundTiming: false, foundFeedback: false
                    }
                };
                let allCommentsTextForFile = ""; // For word cloud

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
                                cleanedLoHeaders = originalLoHeaders.map(header => {
                                    let cleaned = header.trim();
                                    if (cleaned.endsWith('.\\"')) { cleaned = cleaned.slice(0, -3); }
                                    if (cleaned.endsWith('\\.')) { cleaned = cleaned.slice(0, -2); }
                                    if (cleaned.startsWith('"') && cleaned.endsWith('"')) { cleaned = cleaned.slice(1, -1); }
                                    if (cleaned.startsWith("'") && cleaned.endsWith("'")) { cleaned = cleaned.slice(1, -1); }
                                    return cleaned.trim();
                                });
                                sessionData.learningOutcomes = cleanedLoHeaders.map(cleanedHeader => ({ loHeader: cleanedHeader, responses: {} }));
                                if (originalLoHeaders.length === 0) {
                                    fileWarnings.push(`No columns found between "${STUDENT_ID_HEADER}" and "${TIMING_COLUMN_HEADER}" in "${file.name}" for Learning Outcomes.`);
                                }
                            } else {
                                fileWarnings.push(`Could not identify Learning Outcome columns in "${file.name}". Requires "${STUDENT_ID_HEADER}" and "${TIMING_COLUMN_HEADER}" in order.`);
                            }

                            if (!sessionData.parsingInfo.foundFeedback) fileWarnings.push(`File "${file.name}" missing: '${FEEDBACK_COLUMN_HEADER}'. Comments skipped.`);
                            if (!sessionData.parsingInfo.foundTiming) fileWarnings.push(`File "${file.name}" missing: '${TIMING_COLUMN_HEADER}'. Timing skipped.`);
                            if (!sessionData.parsingInfo.foundStudentId) fileWarnings.push(`File "${file.name}" missing: '${STUDENT_ID_HEADER}'. LO data skipped.`);


                            // Process Rows
                            results.data.forEach((row) => {
                                // Process Feedback Comments
                                if (sessionData.parsingInfo.foundFeedback && row[FEEDBACK_COLUMN_HEADER]) {
                                    const feedback = row[FEEDBACK_COLUMN_HEADER].trim();
                                    if (feedback && !OMIT_COMMENT_STRINGS.has(feedback.toLowerCase())) {
                                        sessionData.comments.push(feedback);
                                        allCommentsTextForFile += feedback + " "; // Accumulate for word cloud
                                    }
                                }

                                // Process Timing Responses
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

                                // Process Learning Outcomes
                                if (originalLoHeaders.length > 0 && sessionData.learningOutcomes.length === originalLoHeaders.length) {
                                    originalLoHeaders.forEach((originalHeader, index) => {
                                         if (row[originalHeader]) { // Check if the header exists in the row data
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
                            }); // End of row processing loop
                            console.log(`Frontend parsing complete for ${file.name}. Found ${sessionData.comments.length} comments.`);
                            resolve({ sessionName, data: sessionData, warnings: fileWarnings, allCommentsText: allCommentsTextForFile });

                        } catch (completionError) {
                            console.error(`Error within PapaParse complete callback for ${file.name}:`, completionError);
                            fileWarnings.push(`Internal error processing parsed data for ${file.name}: ${completionError.message}`);
                            resolve({ sessionName, data: null, warnings: fileWarnings, allCommentsText: "" }); // Resolve with error info
                        }
                    },
                    error: (error) => {
                        console.error(`Fatal CSV parsing error in ${file.name}:`, error.message);
                        fileWarnings.push(`Failed to parse file "${file.name}": ${error.message}`);
                        resolve({ sessionName, data: null, warnings: fileWarnings, allCommentsText: "" }); // Resolve with error info
                    }
                }); // End of parseConfig
            };

            reader.onerror = (event) => {
                console.error(`Error reading file ${file.name}:`, reader.error);
                fileWarnings.push(`Failed to read file "${file.name}".`);
                resolve({ sessionName, data: null, warnings: fileWarnings, allCommentsText: "" }); // Resolve with error info
            };

            reader.readAsText(file);
        });
     };


    // --- handleSubmit (Initiates the *first* API call for initial analysis) ---
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (files.length === 0) { setError("Please select at least one CSV file."); return; }
        setIsLoading(true); setError(null);
        // Reset all result states and view mode on new submission
        setInitialAnalysisResults(null);
        setRefinedCommentsOnlyResults(null);
        setThemedCommentsResults(null);
        setCurrentResultsView(null); // Reset current view
        setViewMode('initial'); // Reset view mode
        setProcessingWarnings([]);
        setWordCloudData(null);
        setIsRefiningComments(false);
        setIsThemingComments(false);

        try {
            // 1. Parse CSV files on the frontend
            console.log("Starting frontend CSV parsing...");
            const parsePromises = files.map(file => parseCsvFile(file));
            const parsedResults = await Promise.all(parsePromises);
            console.log("Frontend CSV parsing complete.");

            // 2. Aggregate data across files if multiple files have the same session name
            let aggregatedSessionData = {};
            let combinedWarnings = [];
            let combinedCommentsText = "";

            parsedResults.forEach(result => {
                if (result.warnings.length > 0) {
                    combinedWarnings.push(...result.warnings);
                }
                // Only process if parsing was successful and yielded data
                if (result.data) {
                    const sessionName = result.sessionName;
                    // Initialize session data if it doesn't exist
                    if (!aggregatedSessionData[sessionName]) {
                        aggregatedSessionData[sessionName] = {
                            comments: [], // This will hold ALL raw comments for the session
                            timingCounts: { less: 0, more: 0, same: 0 },
                            learningOutcomes: []
                        };
                    }

                    // Aggregate comments
                    aggregatedSessionData[sessionName].comments.push(...result.data.comments);
                    // Aggregate timing counts
                    aggregatedSessionData[sessionName].timingCounts.less += result.data.timingCounts.less;
                    aggregatedSessionData[sessionName].timingCounts.more += result.data.timingCounts.more;
                    aggregatedSessionData[sessionName].timingCounts.same += result.data.timingCounts.same;

                    // Aggregate learning outcomes
                    result.data.learningOutcomes.forEach(parsedLO => {
                         // Find if this LO header already exists for this session
                        let existingLO = aggregatedSessionData[sessionName].learningOutcomes.find(lo => lo.loHeader === parsedLO.loHeader);

                        if (!existingLO) {
                            // If not, add it
                            existingLO = { loHeader: parsedLO.loHeader, responses: {} };
                            aggregatedSessionData[sessionName].learningOutcomes.push(existingLO);
                        }

                        // Aggregate responses for this LO
                        Object.entries(parsedLO.responses).forEach(([responseText, count]) => {
                            existingLO.responses[responseText] = (existingLO.responses[responseText] || 0) + count;
                        });
                    });

                    // Accumulate comments text for word cloud
                    combinedCommentsText += result.allCommentsText;
                }
            });

             setProcessingWarnings(combinedWarnings); // Display warnings from parsing

            // Check if any usable data was extracted from any session
            const validSessionNames = Object.keys(aggregatedSessionData).filter(name =>
                 aggregatedSessionData[name].comments.length > 0 ||
                 aggregatedSessionData[name].timingCounts.less > 0 ||
                 aggregatedSessionData[name].timingCounts.more > 0 ||
                 aggregatedSessionData[name].timingCounts.same > 0 ||
                 aggregatedSessionData[name].learningOutcomes.some(lo => Object.keys(lo.responses).length > 0)
            );

            if (validSessionNames.length === 0) {
                 const errorMsg = combinedWarnings.length > 0 ? "Failed to process files or extract data. Check warnings above." : "No student feedback, timing, or learning outcome data could be extracted. Ensure files are valid CSVs with required columns ('Student Id', 'Timing', 'Student Feedback') and potentially Learning Outcome columns between 'Student Id' and 'Timing'.";
                 throw new Error(errorMsg);
            }

            // Filter aggregated data to only include sessions with data
            const finalAggregatedData = {};
            validSessionNames.forEach(name => {
                 finalAggregatedData[name] = aggregatedSessionData[name];
            });


            // 3. Generate initial word cloud data (before sentiment)
            let initialWordCloudData = [];
            if (combinedCommentsText.length > 0) {
                try {
                    console.log("Generating initial word cloud data on frontend...");
                     // Use the combined text from all comments
                    const words = combinedCommentsText.toLowerCase().replace(/’/g, "'").replace(/[^a-z'\s-]/g, "").replace(/\s+/g, ' ').split(' ');
                    const wordCounts = {};
                    words.forEach(word => {
                        const trimmedWord = word.trim();
                        if (trimmedWord && trimmedWord.length > 2 && !STOP_WORDS.has(trimmedWord) && isNaN(trimmedWord)) {
                            wordCounts[trimmedWord] = (wordCounts[trimmedWord] || 0) + 1;
                        }
                    });
                    initialWordCloudData = Object.entries(wordCounts)
                        .map(([text, count]) => ({ value: text, count: count }))
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 50); // Limit to top 50
                    console.log(`Generated ${initialWordCloudData.length} words for cloud on frontend.`);
                } catch (cloudError) {
                    console.error("Error generating word cloud data on frontend:", cloudError);
                    setProcessingWarnings(prev => [...prev, "Failed to generate word cloud data."].filter((v, i, a) => a.indexOf(v) === i));
                    initialWordCloudData = []; // Ensure empty on error
                }
            }

            // 4. Prepare payload for the backend (Initial Analysis)
            const apiPayload = {
                 action: 'initial_analysis', // Explicitly state the action
                 sessionData: finalAggregatedData, // Includes comments, timing, LOs
                 wordCloudDataInput: initialWordCloudData // Initial WC data for sentiment analysis
            };

            // 5. Send to backend API
            console.log("Sending processed data to backend API (initial analysis)...");
            const response = await fetch("/test-apps/feedback-processor-clientside/api", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiPayload)
            });
            const data = await response.json();

            // Add backend processing warnings to existing frontend warnings
             if (data.processingWarnings) {
                 setProcessingWarnings(prev => [...prev, ...data.processingWarnings].filter((v, i, a) => a.indexOf(v) === i));
             }

            if (!response.ok) {
                throw new Error(data.error || `Backend API error! Status: ${response.status}`);
            }

            // 6. Set results (store in both 'initialAnalysisResults' and 'currentResultsView')
            setInitialAnalysisResults(data.initialAnalysisResults); // Store the complete initial results
            setCurrentResultsView(data.initialAnalysisResults); // Display initial results by default
            setViewMode('initial'); // Set view mode

            setWordCloudData(data.wordCloudData || null); // Store word cloud with sentiment

        } catch (err) {
            console.error("Error during frontend processing or initial API call:", err);
            setError(err.message || "An unknown error occurred during analysis.");
            // Reset all result states and view mode on error
            setInitialAnalysisResults(null);
            setRefinedCommentsOnlyResults(null);
            setThemedCommentsResults(null);
            setCurrentResultsView(null);
            setViewMode('initial');
            setWordCloudData(null);
        } finally {
            setIsLoading(false);
        }
    };

    // --- handleRefineCommentsOnly (Triggers the existing refine action) ---
    const handleRefineCommentsOnly = async () => {
        // Base refinement on the *initial* analysis results comments
        if (!initialAnalysisResults) {
            setError("Cannot refine: Initial analysis results are missing.");
            return;
        }
        setIsRefiningComments(true);
        setError(null);
        // Clear any previous warnings specifically from refinement/theming
        setProcessingWarnings(prev => prev.filter(w =>
            !w.startsWith("Failed to refine") &&
            !w.startsWith("Warning: AI refinement") &&
            !w.startsWith("Failed to perform theme analysis") &&
            !w.startsWith("Warning: AI theme analysis")
        ));

        try {
            console.log("Starting 'Refine Comments Only' process...");
            // 1. Extract P/C comments from initialAnalysisResults
            const commentsToRefine = {};
            Object.entries(initialAnalysisResults).forEach(([sessionName, sessionData]) => {
                commentsToRefine[sessionName] = {
                    positiveComments: sessionData.positiveComments || [],
                    criticalComments: sessionData.criticalComments || []
                };
            });

             // Check if there are any comments at all before sending
            const hasAnyComments = Object.values(commentsToRefine).some(session =>
                session.positiveComments.length > 0 || session.criticalComments.length > 0
            );
             if (!hasAnyComments) {
                 setProcessingWarnings(prev => [...prev, "No comments found in the initial results to refine."].filter((v, i, a) => a.indexOf(v) === i));
                 setIsRefiningComments(false);
                 return; // Exit if no comments to refine
             }


            // 2. Prepare payload with 'action: refine'
            const refinePayload = { action: 'refine', commentsToRefine: commentsToRefine };

            // 3. Call the backend API
            console.log("Sending comments to API for refinement (remove short)...");
            const response = await fetch("/test-apps/feedback-processor-clientside/api", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(refinePayload)
            });
            const refineData = await response.json();

            // Add refinement warnings
            if (refineData.refinementWarnings) {
                 setProcessingWarnings(prev => [...prev, ...refineData.refinementWarnings].filter((v, i, a) => a.indexOf(v) === i));
             }

            // Check for errors, but still process data if provided (fallback)
            if (!response.ok) {
                 if (!refineData.refinedComments){
                     throw new Error(refineData.error || `Refinement (remove short) API error! Status: ${response.status}`);
                 } else {
                    console.warn(`Refinement API returned status ${response.status} but provided fallback comment data.`);
                 }
            }

            // 4. Create and Store Refined Results, Update Display
            if (refineData.refinedComments) {
                console.log("Received refined comments (remove short), creating refined results dataset...");
                // Create the new refined results object based on the initial analysis data
                const newRefinedResults = JSON.parse(JSON.stringify(initialAnalysisResults)); // Deep copy initial data structure

                Object.keys(refineData.refinedComments).forEach(sessionName => {
                     // Check if session exists in the initial data structure before updating
                    if (newRefinedResults[sessionName]) {
                        const refinedSessionData = refineData.refinedComments[sessionName];
                        // ONLY update the comments lists in the copied object
                        newRefinedResults[sessionName].positiveComments = refinedSessionData.positiveComments || [];
                        newRefinedResults[sessionName].criticalComments = refinedSessionData.criticalComments || [];
                        // Ensure themes key is removed if it somehow existed in a weird state
                         if (newRefinedResults[sessionName].themes) {
                             delete newRefinedResults[sessionName].themes;
                         }
                    } else {
                         console.warn(`Refinement API returned data for session "${sessionName}" which was not in the initial results. Ignoring refinement for this session.`);
                    }
                });

                setRefinedCommentsOnlyResults(newRefinedResults); // Store the complete refined P/C results
                setCurrentResultsView(newRefinedResults); // Update the *displayed* results
                setViewMode('refined'); // Set view mode to refined

            } else {
                 console.error("Refinement (remove short) API call did not return expected 'refinedComments' data.");
                 setError("Refinement process failed to return updated comments structure.");
            }

        } catch (err) {
            console.error("Error during 'Refine Comments Only' process:", err);
            setError(`Refinement failed: ${err.message || "Unknown error"}`);
        } finally {
            setIsRefiningComments(false);
        }
    };

    // --- NEW: handleRefineAndTheme (Triggers the new filter+theme action) ---
    const handleRefineAndTheme = async () => {
        // Now triggers a two-step process on the backend, starting with filtering the initial P/C lists.
        // We need the initial analysis results to provide the comments for the backend's first step.
        if (!initialAnalysisResults) {
            setError("Cannot organise by theme: Initial analysis results are missing.");
            return;
        }
        setIsThemingComments(true);
        setError(null);
         // Clear any previous warnings specifically from refinement/theming
        setProcessingWarnings(prev => prev.filter(w =>
            !w.startsWith("Failed to refine") &&
            !w.startsWith("Warning: AI refinement") &&
            !w.startsWith("Failed to perform theme analysis") &&
            !w.startsWith("Warning: AI theme analysis") &&
             !w.startsWith("AI filtering step") // Clear any filter warnings too, as backend step 1 might add them
        ));

        try {
             console.log("Starting 'Refine and Organise by Theme' process (Two-Step Backend)...");
             // 1. Prepare payload with 'action: refine_and_theme' and send the initialAnalysisResults.
             //    The backend will extract positiveComments and criticalComments from this
             //    for its filtering step, then theme the result.
             const themePayload = {
                action: 'refine_and_theme',
                initialAnalysisResults: initialAnalysisResults // Send the full initial results object
            };

             // Check if there are any comments at all in the initial results before sending
             const hasAnyCommentsInitially = Object.values(initialAnalysisResults).some(sessionData =>
                 (sessionData.positiveComments?.length > 0 || sessionData.criticalComments?.length > 0)
             );
             if (!hasAnyCommentsInitially) {
                  setProcessingWarnings(prev => [...prev, "No comments found in the initial results to organise by theme."].filter((v, i, a) => a.indexOf(v) === i));
                  setIsThemingComments(false);
                  return; // Exit if no comments to theme
              }


            // 2. Call the backend API
            console.log("Sending initial analysis results to API for two-step refine & theme process...");
            const response = await fetch("/test-apps/feedback-processor-clientside/api", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(themePayload)
            });
            const themeData = await response.json();

             // Add backend processing warnings (could include warnings from filter step now)
            if (themeData.processingWarnings) {
                setProcessingWarnings(prev => [...prev, ...themeData.processingWarnings].filter((v, i, a) => a.indexOf(v) === i));
            }
            // Keep legacy warning keys just in case, though backend should use processingWarnings
             if (themeData.refinementWarnings) {
                  setProcessingWarnings(prev => [...prev, ...themeData.refinementWarnings].filter((v, i, a) => a.indexOf(v) === i));
             }
              if (themeData.themeWarnings) {
                 setProcessingWarnings(prev => [...prev, ...themeData.themeWarnings].filter((v, i, a) => a.indexOf(v) === i));
             }


            // Check for errors, but still process data if provided (fallback)
            if (!response.ok) {
                 if (!themeData.themedComments){
                     throw new Error(themeData.error || `Refine & Theme analysis API error! Status: ${response.status}`);
                 } else {
                     console.warn(`Refine & Theme analysis API returned status ${response.status} but provided fallback themed data.`);
                 }
            }


            // 3. Create and Store Themed Results, Update Display
             if (themeData.themedComments) {
                console.log("Received themed comments, creating themed results dataset...");
                 // Create a *new* structure for themed results based on initial analysis data
                 // We need timing, LOs, summary from the initial analysis, but the new themed comments.
                 const newThemedResults = JSON.parse(JSON.stringify(initialAnalysisResults)); // Deep copy initial structure

                 Object.keys(themeData.themedComments).forEach(sessionName => {
                     // Check if session exists in the initial data structure
                     if (newThemedResults[sessionName]) {
                        const themedSessionData = themeData.themedComments[sessionName];
                         // Replace the comments part with the new themed structure
                         // Remove the old keys (positiveComments, criticalComments, originalCommentsList)
                         delete newThemedResults[sessionName].positiveComments;
                         delete newThemedResults[sessionName].criticalComments;
                         delete newThemedResults[sessionName].originalCommentsList; // This raw list isn't used in the themed view

                         // Add the new themes key
                         newThemedResults[sessionName].themes = themedSessionData.themes || {};

                          // If the backend returned themed comments structure but no themes (e.g. all comments filtered out),
                         // ensure the themes object is explicitly empty rather than undefined/null.
                         if (!newThemedResults[sessionName].themes) {
                             newThemedResults[sessionName].themes = {};
                         }

                     } else {
                         console.warn(`Theme analysis API returned data for session "${sessionName}" which was not in the initial results. Ignoring themed comments for this session.`);
                     }
                 });

                 setThemedCommentsResults(newThemedResults); // Store the complete themed results
                 setCurrentResultsView(newThemedResults); // Update the *displayed* results
                 setViewMode('themed'); // Set view mode to themed

             } else {
                 console.error("'Refine and organise by theme' API call did not return expected 'themedComments' data.");
                 setError("Theme analysis process failed to return updated comments structure.");
             }


        } catch (err) {
            console.error("Error during 'Refine and Organise by Theme' process:", err);
            setError(`Theme analysis failed: ${err.message || "Unknown error"}`);
        } finally {
            setIsThemingComments(false);
        }
     };

    // --- handleClear (Reset ALL state) ---
    const handleClear = () => {
        setFiles([]);
        setInitialAnalysisResults(null);
        setRefinedCommentsOnlyResults(null);
        setThemedCommentsResults(null);
        setCurrentResultsView(null);
        setViewMode('initial');
        setError(null);
        setProcessingWarnings([]);
        setWordCloudData(null);
        setIsLoading(false);
        setIsRefiningComments(false);
        setIsThemingComments(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Clear the file input element
        }
    };

    // --- View Switching Handlers ---
    const handleShowFullView = () => {
        if (initialAnalysisResults && !isBusy) {
            setCurrentResultsView(initialAnalysisResults);
            setViewMode('initial');
            console.log("Switched to: Full Comments View");
        }
    };

     const handleShowRefinedView = () => {
        if (refinedCommentsOnlyResults && !isBusy) {
            setCurrentResultsView(refinedCommentsOnlyResults);
            setViewMode('refined');
             console.log("Switched to: Refined Comments View");
        }
    };

    const handleShowThemedView = () => {
        if (themedCommentsResults && !isBusy) {
            setCurrentResultsView(themedCommentsResults);
            setViewMode('themed');
             console.log("Switched to: Themed Comments View");
        }
    };

    // --- customTagRenderer (Unchanged) ---
    const customTagRenderer = (tag, size) => { /* ... No change ... */
        let color; switch (tag.sentiment) { case 'positive': color = '#228B22'; break; case 'negative': color = '#DC143C'; break; case 'neutral': default: color = '#696969'; break; }
        return ( <span key={tag.value} style={{ fontSize: `${size}px`, margin: '3px', padding: '3px', display: 'inline-block', color: color, cursor: 'default' }} title={`Count: ${tag.count}${tag.sentiment ? ` (${tag.sentiment})` : ''}`}> {tag.value} </span> );
    };

    // --- prepareTimingChartData (Unchanged) ---
    const prepareTimingChartData = (timingCounts) => { /* ... No change ... */
        if (!timingCounts) return [];
        return [
            { name: 'Less Time', count: timingCounts.less || 0, fill: '#82ca9d' },
            { name: 'Same Time', count: timingCounts.same || 0, fill: '#8884d8' },
            { name: 'More Time', count: timingCounts.more || 0, fill: '#ffc658' },
        ].filter(item => item.count > 0);
    };

     // --- generateDocxContent (Unchanged, uses currentResultsView and viewMode) ---
     const generateDocxContent = (analysisResults, currentViewMode, wordCloudDataForDoc) => {
        const children = []; // Holds all paragraphs, tables, etc.

        children.push(
            new Paragraph({
                text: "Student Feedback Analysis Report",
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
            })
        );

        // Add indication of which view is exported
         children.push(
            new Paragraph({
                text: `(Exported: ${currentViewMode === 'initial' ? 'Full Comments View' : currentViewMode === 'refined' ? 'Refined Comments View' : 'Themed Comments View'})`,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }, // More space after the subtitle
                run: { italics: true, size: 20 } // Smaller text, italic
            })
         );


        const sortedSessions = Object.entries(analysisResults).sort(([keyA], [keyB]) => {
            if (keyA === "Unknown Session") return 1; if (keyB === "Unknown Session") return -1;
            const numA = parseInt(keyA.match(/\d+/)?.[0] || '0'); const numB = parseInt(keyB.match(/\d+/)?.[0] || '0');
            if (numA !== numB) return numA - numB; return keyA.localeCompare(keyB);
        });

        sortedSessions.forEach(([sessionName, sessionData]) => {
            children.push(new Paragraph({
                text: sessionName,
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 400, after: 200 },
                border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } }
            }));

            // Timing Data (appears in all views)
            if (sessionData.timingCounts && (sessionData.timingCounts.less > 0 || sessionData.timingCounts.more > 0 || sessionData.timingCounts.same > 0)) {
                 children.push(new Paragraph({ text: "Timing Response", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
                const timingText = [`Less time than estimated: ${sessionData.timingCounts.less || 0}`, `About the same time as estimated: ${sessionData.timingCounts.same || 0}`, `More time than estimated: ${sessionData.timingCounts.more || 0}`].join('; ');
                 children.push(new Paragraph({ text: timingText, style: "normal" }));
            }

            // Learning Outcome Data (appears in all views)
            if (sessionData.learningOutcomes && Array.isArray(sessionData.learningOutcomes) && sessionData.learningOutcomes.length > 0) {
                // Check if there's any actual response count greater than 0 across all LOs
                const hasAnyLOResponses = sessionData.learningOutcomes.some(lo =>
                    lo.responses && Object.values(lo.responses).some(count => count > 0)
                );
                if(hasAnyLOResponses){
                    children.push(new Paragraph({ text: "Learning Outcome Responses", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
                    const loData = sessionData.learningOutcomes; const uniqueResponses = new Set(); loData.forEach(item => { if (item.responses) Object.keys(item.responses).forEach(response => uniqueResponses.add(response)); }); const responseHeaders = Array.from(uniqueResponses).sort(); const loItems = loData; const tableHeaderCell = (text) => new TableCell({ children: [new Paragraph({ text: text, alignment: AlignmentType.CENTER })], shading: { fill: "E0E0E0", type: ShadingType.CLEAR, color: "auto" }, margins: { top: 100, bottom: 100, left: 100, right: 100 }, verticalAlign: AlignmentType.CENTER }); const headerRow = new TableRow({ children: [tableHeaderCell("Learning Outcome"), ...responseHeaders.map(header => tableHeaderCell(header))], tableHeader: true }); const dataRows = loItems.map(item => new TableRow({ children: [new TableCell({ children: [new Paragraph(item.loHeader)], margins: { top: 50, bottom: 50, left: 100, right: 100 }, width: { size: 4500, type: WidthType.DXA } }), ...responseHeaders.map(response => new TableCell({ children: [new Paragraph({ text: `${item.responses?.[response] || 0}`, alignment: AlignmentType.CENTER })], margins: { top: 50, bottom: 50, left: 100, right: 100 }, verticalAlign: AlignmentType.CENTER }))] })); const table = new Table({ rows: [headerRow, ...dataRows], width: { size: 100, type: WidthType.PERCENTAGE }, borders: { top: { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" }, left: { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" }, right: { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" }, insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" }, insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } } }); children.push(table);
                }
            }

            // Summary (appears in initial/refined views, maybe not themed depending on prompt)
            // Based on the prompt, summary is only generated initially, so display it if available
            if (sessionData.summary) { // Display summary if it exists in the data object
                 children.push(new Paragraph({ text: (viewMode === 'themed' ? 'Original Summary' : 'Summary'), heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
                 children.push(new Paragraph({ children: [new TextRun({ text: sessionData.summary, italics: true, font: "Calibri" })], style: "normal" }));
            }


            // --- Comment Section based on View Mode ---
            if (viewMode === 'initial' || viewMode === 'refined') {
                // Display Positive and Critical Comments
                const positiveComments = sessionData.positiveComments || [];
                const criticalComments = sessionData.criticalComments || [];

                if (positiveComments.length > 0) {
                     children.push(new Paragraph({ text: "Positive Comments", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 }, run: { color: "228B22" } })); // Green color heading
                    positiveComments.forEach(comment => { children.push(new Paragraph({ text: comment, bullet: { level: 0 }, style: "normal" })); });
                } else {
                     children.push(new Paragraph({ text: "Positive Comments", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 }, run: { color: "228B22" } })); // Green color heading
                     children.push(new Paragraph({ text: `No positive comments ${(viewMode === 'refined' && initialAnalysisResults[sessionName]?.positiveComments?.length > 0) ? 'remaining after refinement' : (initialAnalysisResults && initialAnalysisResults[sessionName]?.positiveComments?.length > 0 && viewMode === 'initial') ? 'provided by AI analysis' : 'provided'}.`, style: "normal", run: { italics: true, color: "696969" } }));
                }

                if (criticalComments.length > 0) {
                    children.push(new Paragraph({ text: "Critical Comments / Suggestions", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 }, run: { color: "DC143C" } })); // Red color heading
                    criticalComments.forEach(comment => { children.push(new Paragraph({ text: comment, bullet: { level: 0 }, style: "normal" })); });
                } else {
                     children.push(new Paragraph({ text: "Critical Comments / Suggestions", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 }, run: { color: "DC143C" } })); // Red color heading
                     children.push(new Paragraph({ text: `No critical comments ${(viewMode === 'refined' && initialAnalysisResults[sessionName]?.criticalComments?.length > 0) ? 'remaining after refinement' : (initialAnalysisResults && initialAnalysisResults[sessionName]?.criticalComments?.length > 0 && viewMode === 'initial') ? 'provided by AI analysis' : 'provided'}.`, style: "normal", run: { italics: true, color: "696969" } }));
                }

            } else if (viewMode === 'themed') {
                // Display Themed Comments
                const themes = sessionData.themes || {};
                const themeTitles = Object.keys(themes).sort(); // Sort themes alphabetically

                if (themeTitles.length > 0) {
                    children.push(new Paragraph({ text: "Comments Organised by Theme", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
                    themeTitles.forEach(themeTitle => {
                        const comments = themes[themeTitle] || [];
                         if (comments.length > 0) { // Ensure theme has comments after potential filtering issues
                            children.push(new Paragraph({ text: themeTitle, heading: HeadingLevel.HEADING_3, spacing: { before: 100, after: 50 } })); // Theme title as Heading 3
                            comments.forEach(comment => {
                                children.push(new Paragraph({ text: comment, bullet: { level: 0 }, style: "normal" }));
                            });
                         }
                    });
                } else {
                     children.push(new Paragraph({ text: "Comments Organised by Theme", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
                     children.push(new Paragraph({ text: "No comments remained after filtering and grouping by theme.", style: "normal", run: { italics: true, color: "696969" } }));
                }
            }

             children.push(new Paragraph({ text: "", spacing: { after: 300 } })); // Space after each session

        }); // End session loop

        // --- Word Cloud Data (Textual - from initial analysis) ---
        // This section uses the wordCloudData state which is only set once by initial analysis
        if (wordCloudDataForDoc && wordCloudDataForDoc.length > 0) {
            children.push(new Paragraph({ text: "Common Words in Feedback (Top 50)", heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 }, border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } } }));
            const wordList = wordCloudDataForDoc.map(tag => `${tag.value} (${tag.count}${tag.sentiment ? `, ${tag.sentiment}` : ''})`).join(', '); // Include sentiment in text list
            children.push(new Paragraph({ text: wordList, style: "normal" }));
        }


        const doc = new Document({
            sections: [{
                properties: {},
                children: children,
            }],
            styles: {
                paragraphStyles: [
                    { id: "normal", name: "Normal", run: { size: 22, font: "Calibri" } }, // 11pt
                    { id: "Heading1", name: "Heading 1", basedOn: "normal", next: "normal", quickFormat: true, run: { size: 32, bold: true, color: "333333", font: "Calibri Light" } }, // 16pt
                    { id: "Heading2", name: "Heading 2", basedOn: "normal", next: "normal", quickFormat: true, run: { size: 26, bold: true, color: "555555", font: "Calibri Light" } }, // 13pt
                     { id: "Heading3", name: "Heading 3", basedOn: "normal", next: "normal", quickFormat: true, run: { size: 24, bold: true, color: "666666", font: "Calibri Light" } }, // 12pt
                ]
            }
        });

        return doc;
    };


    // --- handleDownloadDocx (Uses current view) ---
    const handleDownloadDocx = async () => {
        if (!currentResultsView) {
            console.error("No results available to download.");
            return;
        }
        setIsDownloading(true);
        try {
            console.log(`Generating DOCX (using ${viewMode} view)...`);
            // Pass the currently displayed results, the current view mode, and word cloud data
            const doc = generateDocxContent(currentResultsView, viewMode, wordCloudData);
            const blob = await Packer.toBlob(doc);

            // Update filename based on the current view mode
            let filenamePrefix = 'feedback_analysis_report';
            if (viewMode === 'refined') {
                 filenamePrefix += '_refined';
            } else if (viewMode === 'themed') {
                 filenamePrefix += '_themed';
            }
            saveAs(blob, `${filenamePrefix}.docx`);
            console.log("DOCX download initiated.");

        } catch (err) {
            console.error("Error generating or downloading DOCX:", err);
            setError("Failed to generate Word document.");
        } finally {
            setIsDownloading(false);
        }
    };

    // --- Button Visibility Logic (useMemo to avoid re-calculating on every render) ---
     const showRefineCommentsOnlyButton = useMemo(() => {
         return initialAnalysisResults !== null && // Initial analysis is done
                refinedCommentsOnlyResults === null && // Refine P/C hasn't been run yet
                !isBusy && // Not currently busy
                viewMode !== 'themed'; // Not currently in the themed view
     }, [initialAnalysisResults, refinedCommentsOnlyResults, isBusy, viewMode]);

     const showRefineAndThemeButton = useMemo(() => {
         return initialAnalysisResults !== null && // Initial analysis is done
                themedCommentsResults === null && // Theme analysis hasn't been run yet
                !isBusy; // Not currently busy
     }, [initialAnalysisResults, themedCommentsResults, isBusy]);

     const showFullViewButton = useMemo(() => {
        return initialAnalysisResults !== null && // Full results exist
               viewMode !== 'initial' && // Not currently viewing full results
               !isBusy; // Not currently busy
     }, [initialAnalysisResults, viewMode, isBusy]);

     const showRefinedViewButton = useMemo(() => {
         return refinedCommentsOnlyResults !== null && // Refined P/C results exist
                viewMode !== 'refined' && // Not currently viewing refined P/C results
                !isBusy; // Not currently busy
     }, [refinedCommentsOnlyResults, viewMode, isBusy]);

     const showThemedViewButton = useMemo(() => {
         return themedCommentsResults !== null && // Themed results exist
                viewMode !== 'themed' && // Not currently viewing themed results
                !isBusy; // Not currently busy
     }, [themedCommentsResults, viewMode, isBusy]);

     const showDownloadButton = currentResultsView !== null && !isBusy;


    // --- RETURN JSX ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 shadow-xl rounded-lg border border-gray-200">
                {/* Title */}
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800"> Student Feedback Analyzer </h1>
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6 mb-8">
                   {/* File Input */}
                   <div>
                       <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2"> Upload CSV Files (e.g., Session 1.csv, Session 2.csv) </label>
                       <input id="file-upload" ref={fileInputRef} type="file" multiple accept=".csv, text/csv" onChange={handleFileChange} disabled={isBusy} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed" />
                       {files.length > 0 && <p className="mt-2 text-sm text-gray-600">{files.length} CSV file{files.length !== 1 ? 's' : ''} selected.</p>}
                   </div>
                   {/* Action Buttons Area */}
                   <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 items-center justify-center sm:justify-start">
                       {/* Analyze Button */}
                       <button type="submit" disabled={isBusy || files.length === 0} aria-busy={isLoading} className={`flex-grow sm:flex-grow-0 inline-flex justify-center items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out ${isBusy || files.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"}`}> {isLoading ? (<><span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>Analyzing...</>) : ("Analyze Feedback")} </button>
                       {/* Clear Button */}
                       <button type="button" onClick={handleClear} disabled={isBusy} className="flex-grow sm:flex-grow-0 inline-flex justify-center px-6 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"> Clear Selection </button>

                       {/* Refine Comments Only Button */}
                       {showRefineCommentsOnlyButton && (
                           <button type="button" onClick={handleRefineCommentsOnly} disabled={isBusy} className="flex-grow sm:flex-grow-0 inline-flex justify-center items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                               Refine Comments (Remove Short)
                           </button>
                       )}
                        {/* Refine Comments Only Loading Indicator (only if refining this specific type) */}
                       {isRefiningComments && ( <div className="flex items-center text-sm text-purple-700"> <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-600 mr-2"></span> Refining comments... </div> )}


                       {/* NEW: Refine and Organise by Theme Button */}
                       {showRefineAndThemeButton && (
                            <button type="button" onClick={handleRefineAndTheme} disabled={isBusy} className="flex-grow sm:flex-grow-0 inline-flex justify-center items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                                Refine & Organise by Theme
                            </button>
                        )}
                       {/* Refine and Organise by Theme Loading Indicator (only if refining this specific type) */}
                       {isThemingComments && ( <div className="flex items-center text-sm text-teal-700"> <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-teal-600 mr-2"></span> Organising themes... </div> )}

                       {/* --- View Toggle Buttons --- */}
                       {showFullViewButton && (
                           <button type="button" onClick={handleShowFullView} disabled={isBusy} className="flex-grow sm:flex-grow-0 inline-flex justify-center items-center px-6 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                               Show Full View
                           </button>
                       )}
                        {showRefinedViewButton && (
                           <button type="button" onClick={handleShowRefinedView} disabled={isBusy} className="flex-grow sm:flex-grow-0 inline-flex justify-center items-center px-6 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                               Show Refined View
                           </button>
                       )}
                        {showThemedViewButton && (
                           <button type="button" onClick={handleShowThemedView} disabled={isBusy} className="flex-grow sm:flex-grow-0 inline-flex justify-center items-center px-6 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                               Show Themed View
                           </button>
                       )}
                       {/* --- End View Toggle Buttons --- */}


                       {/* Download Button */}
                       {showDownloadButton && (
                           <button type="button" onClick={handleDownloadDocx} disabled={isBusy || isDownloading} className={`flex-grow sm:flex-grow-0 inline-flex justify-center items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out ${isBusy || isDownloading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 focus:ring-green-500"}`} aria-busy={isDownloading}>
                               {isDownloading ? ( <> <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span> Generating... </> ) : (`Download ${viewMode === 'initial' ? 'Full' : viewMode === 'refined' ? 'Refined' : 'Themed'} View (.docx)`)}
                           </button>
                       )}
                   </div>
                   {/* Current View Indicator */}
                   {currentResultsView && !isBusy && (
                        <p className="mt-2 text-sm text-gray-600 font-medium text-center">
                            Currently viewing: <span className="font-bold">{viewMode === 'initial' ? 'Full Comments' : viewMode === 'refined' ? 'Refined Comments (Short Removed)' : 'Themed Comments'}</span>
                        </p>
                   )}
                    {/* Overall busy indicator */}
                    {isBusy && (
                         <div className="flex items-center text-sm text-blue-700 justify-center mt-2">
                            <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></span>
                            {isLoading ? 'Analyzing Feedback...' : isRefiningComments ? 'Refining Comments...' : 'Organising Themes...'}
                        </div>
                    )}
                   {/* Error/Warning Area */}
                   {(error || processingWarnings.length > 0) && ( <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md" aria-live="assertive"> {error && (<p className="text-sm font-medium text-red-800 mb-2">Error: {error}</p>)} {processingWarnings.length > 0 && ( <div className={`${error ? 'mt-2 pt-2 border-t border-red-200' : ''}`}> <p className="text-sm font-medium text-orange-800 mb-1">Processing Notes / Warnings:</p> <ul className="list-disc list-inside space-y-1 text-sm text-orange-700">{processingWarnings.map((msg, index) => (<li key={index}>{msg}</li>))}</ul> </div> )} </div> )}
                </form>

                {/* --- Results Area (Renders based on currentResultsView and viewMode) --- */}
                <div ref={resultsRef}>
                    {(currentResultsView || wordCloudData) && !isBusy && ( // Display if any results or word cloud exist and not busy
                        <div className="mt-10 space-y-8">
                            {/* Session Analysis Results - Renders based on currentResultsView */}
                            {currentResultsView && Object.keys(currentResultsView).length > 0 ? (
                                <>
                                <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                                  Feedback Analysis Results
                                </h2>
                                {Object.entries(currentResultsView)
                                    .sort(([keyA], [keyB]) => { /* Sort logic */ if (keyA === "Unknown Session") return 1; if (keyB === "Unknown Session") return -1; const numA = parseInt(keyA.match(/\d+/)?.[0] || '0'); const numB = parseInt(keyB.match(/\d+/)?.[0] || '0'); if (numA !== numB) return numA - numB; return keyA.localeCompare(keyB); })
                                    .map(([sessionName, sessionData]) => {
                                        const timingChartData = prepareTimingChartData(sessionData.timingCounts);
                                        const hasTimingData = timingChartData.length > 0;
                                        const hasLOData = sessionData.learningOutcomes && Array.isArray(sessionData.learningOutcomes) && sessionData.learningOutcomes.length > 0;

                                        // Add a unique key that changes with the view mode to force re-render of session block
                                        const sessionKey = `${sessionName}-${viewMode}`;

                                        return (
                                            <div key={sessionKey} className="p-6 bg-gray-50 rounded-lg shadow border border-gray-200 mb-6">
                                                <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">{sessionName}</h3>
                                                {/* Timing (Unchanged - always from initial data) */}
                                                {(hasTimingData || (sessionData.timingCounts && (sessionData.timingCounts.less > 0 || sessionData.timingCounts.more > 0 || sessionData.timingCounts.same > 0))) ? (
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
                                                 ) : null}
                                                {/* LO (Unchanged - always from initial data) */}
                                                { hasLOData && sessionData.learningOutcomes.some(lo => lo.responses && Object.values(lo.responses).some(count => count > 0)) ? (
                                                  <div className="mb-6">
                                                      <h4 className="text-lg font-medium text-gray-600 mb-3">Learning Outcome Responses</h4>
                                                      <LearningOutcomeTable loData={sessionData.learningOutcomes} />
                                                  </div>
                                                ) : null}
                                                {/* Summary (Unchanged - always from initial data, displayed differently based on viewMode) */}
                                                {sessionData.summary && (
                                                     <div className="mb-5">
                                                        <h4 className="text-lg font-medium text-gray-600 mb-2">{viewMode === 'themed' ? 'Original Summary' : 'Summary'}</h4>
                                                        <p className="text-gray-700 text-sm leading-relaxed italic">{sessionData.summary || "No summary provided."}</p>
                                                    </div>
                                                )}

                                                {/* --- Comment Rendering based on View Mode --- */}
                                                {viewMode === 'initial' || viewMode === 'refined' ? (
                                                     // Display Positive and Critical Comments for 'initial' or 'refined' view
                                                    <>
                                                        <div className="mb-5">
                                                            <h4 className="text-lg font-medium text-green-700 mb-2">Positive Comments</h4>
                                                            {sessionData.positiveComments?.length > 0 ? (
                                                                <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
                                                                    {sessionData.positiveComments.map((c, i) => (<li key={`pos-${i}`}>{c}</li>))}
                                                                </ul>
                                                            ) : (
                                                                <p className="text-sm text-gray-500 italic">
                                                                    No positive comments {(viewMode === 'refined' && initialAnalysisResults[sessionName]?.positiveComments?.length > 0) ? 'remaining after refinement' : (initialAnalysisResults && initialAnalysisResults[sessionName]?.positiveComments?.length > 0 && viewMode === 'initial') ? 'provided by AI analysis' : 'provided'}.
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-medium text-red-700 mb-2">Critical Comments / Suggestions</h4>
                                                            {sessionData.criticalComments?.length > 0 ? (
                                                                <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                                                                    {sessionData.criticalComments.map((c, i) => (<li key={`crit-${i}`}>{c}</li>))}
                                                                </ul>
                                                            ) : (
                                                                <p className="text-sm text-gray-500 italic">
                                                                    No critical comments {(viewMode === 'refined' && initialAnalysisResults[sessionName]?.criticalComments?.length > 0) ? 'remaining after refinement' : (initialAnalysisResults && initialAnalysisResults[sessionName]?.criticalComments?.length > 0 && viewMode === 'initial') ? 'provided by AI analysis' : 'provided'}.
                                                                </p>
                                                            )}
                                                        </div>
                                                    </>
                                                ) : viewMode === 'themed' ? (
                                                    // Display Themed Comments for 'themed' view
                                                    <div>
                                                         <h4 className="text-lg font-medium text-gray-600 mb-3">Comments Organised by Theme</h4>
                                                         {sessionData.themes && Object.keys(sessionData.themes).length > 0 ? (
                                                             <div className="space-y-4">
                                                                 {Object.entries(sessionData.themes).sort(([titleA], [titleB]) => titleA.localeCompare(titleB)).map(([themeTitle, comments]) => (
                                                                     <div key={themeTitle}>
                                                                         <h5 className="text-md font-semibold text-gray-800 mb-1">{themeTitle} ({comments.length})</h5>
                                                                          {comments.length > 0 ? (
                                                                             <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                                                                 {comments.map((c, i) => (<li key={`theme-${themeTitle}-${i}`}>{c}</li>))}
                                                                             </ul>
                                                                         ) : (
                                                                              <p className="text-sm text-gray-500 italic">No comments for this theme.</p> // Should ideally not happen if comments array is empty
                                                                         )}
                                                                     </div>
                                                                 ))}
                                                             </div>
                                                         ) : (
                                                             <p className="text-sm text-gray-500 italic">No comments remained after filtering and grouping by theme.</p>
                                                         )}
                                                    </div>
                                                ) : (
                                                    // Default/Fallback - Should not happen if currentResultsView is not null
                                                    <p className="text-sm text-gray-500 italic">Select a view mode to display comments.</p>
                                                )}
                                                {/* --- End Comment Rendering --- */}
                                            </div>
                                        )
                                    })}
                                </>
                            ) : (
                                // Message when currentResultsView is null but not busy
                                <div className="text-center text-gray-600 py-10">
                                     {files.length > 0 && initialAnalysisResults === null && !isBusy && (
                                         <p>Click "Analyze Feedback" to process your files.</p>
                                     )}
                                     {files.length === 0 && !isBusy && (
                                         <p>Upload CSV files to begin analysis.</p>
                                     )}
                                      {initialAnalysisResults === null && !isBusy && error && (
                                        <p className="text-red-700">Analysis failed. Please check the warnings above.</p>
                                      )}
                                </div>
                            )}

                            {/* Word Cloud Section (Unchanged - uses wordCloudData) */}
                            {wordCloudData && wordCloudData.length > 0 && (
                                <div className="p-6 bg-gray-50 rounded-lg shadow border border-gray-200">
                                    <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">Common Words (Top 50)</h2>
                                    <div className="text-center p-4" aria-label="Word cloud with sentiment coloring">
                                        <TagCloud
                                            minSize={14}
                                            maxSize={45}
                                            tags={wordCloudData} // Data includes sentiment
                                            shuffle={false}
                                            renderer={customTagRenderer}
                                            className="simple-cloud"
                                        />
                                    </div>
                                    <p className="text-xs text-center text-gray-500 mt-2">
                                        Size indicates frequency. Color indicates sentiment (Green: Positive, Red: Negative, Gray: Neutral). Hover for details.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    {/* Loading state - consolidated indicator above results area */}
                </div> {/* End Ref container */}
            </div>
        </div>
    );
}