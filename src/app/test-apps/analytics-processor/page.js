"use client";

import React, { useState, useRef } from "react";
import Papa from 'papaparse';

// --- Constants ---
const UNIVERSITY_ID_HEADER = 'University ID';
const PROGRESS_HEADER = 'Progress';
// --- UPDATED: List of phrases to exclude (lowercase) ---
const EXCLUSION_PHRASES = [
    'learning outcomes',
    'reading',
    'useful resource',
    'live class',
    'information box',
    'live tutorial' // Catches "Useful resource" and "Useful resources"
];
const DEFAULT_MEDIAN_DIFFERENCE = 10; // Default threshold value
// --- End Constants ---

// --- Helper Function to Calculate Median ---
function calculateMedian(numbers) {
    if (!numbers || numbers.length === 0) {
        return null; // Return null for empty lists
    }
    const sortedNumbers = [...numbers].sort((a, b) => a - b);
    const midIndex = Math.floor(sortedNumbers.length / 2);
    if (sortedNumbers.length % 2 === 0) {
        return (sortedNumbers[midIndex - 1] + sortedNumbers[midIndex]) / 2;
    } else {
        return sortedNumbers[midIndex];
    }
}

// --- Helper Function to Extract Session Number ---
function extractSessionNumber(filename) {
    const match = filename.match(/Session\s*(\d+)/i);
    if (match && match[1]) {
        return parseInt(match[1], 10);
    }
    return null;
}


export default function EngagementAnalyzerPage() {
    const [files, setFiles] = useState([]);
    const [results, setResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [medianDifferenceThresholdInput, setMedianDifferenceThresholdInput] = useState(String(DEFAULT_MEDIAN_DIFFERENCE));

    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        setError(null);
        setResults(null);
        if (event.target.files) {
            const csvFiles = Array.from(event.target.files).filter(
                (file) => file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv")
            );
            setFiles(csvFiles);
            if (csvFiles.length !== event.target.files.length) {
                setError("Some non-CSV files were ignored.");
            }
        }
    };

    const handleClear = () => {
        setFiles([]);
        setResults(null);
        setError(null);
        setIsLoading(false);
        setMedianDifferenceThresholdInput(String(DEFAULT_MEDIAN_DIFFERENCE));
        if (fileInputRef.current) fileInputRef.current.value = "";
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

        let validatedThreshold = DEFAULT_MEDIAN_DIFFERENCE;
        const parsedInput = parseFloat(medianDifferenceThresholdInput);
        if (!isNaN(parsedInput) && parsedInput >= 0) {
             validatedThreshold = parsedInput;
             console.log(`Using user-provided threshold difference: ${validatedThreshold}`);
        } else {
             console.log(`Invalid or no threshold input, using default: ${DEFAULT_MEDIAN_DIFFERENCE}`);
        }
        setMedianDifferenceThresholdInput(String(validatedThreshold));

        const analysisPromises = files.map(file => parseAndAnalyzeFile(file, validatedThreshold));

        try {
            const analysisResultsArray = await Promise.all(analysisPromises);
            const finalResults = {};
            analysisResultsArray.forEach(result => {
                if (result) {
                    result.thresholdUsed = validatedThreshold;
                    finalResults[result.filename] = result;
                }
            });

            if (Object.keys(finalResults).length === 0) {
                 setError("Could not process any of the selected files. Check format and content.");
                 setResults(null);
            } else {
                 setResults(finalResults);
            }
             console.log("--- FINAL AGGREGATED RESULTS ---", finalResults);

        } catch (err) {
            console.error("Error processing files:", err);
            setError(err.message || "An unexpected error occurred during analysis.");
            setResults(null);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Function to Parse and Analyze a Single File (Updated Filtering) ---
    const parseAndAnalyzeFile = (file, thresholdValue) => {
        return new Promise((resolve) => {
            console.log(`\n--- Processing File: ${file.name} (Threshold Diff: ${thresholdValue}) ---`);
            console.log(`Excluding headers containing (case-insensitive): ${EXCLUSION_PHRASES.join(', ')}`); // Log exclusion phrases
            const reader = new FileReader();

            reader.onload = (event) => {
                const fileContent = event.target.result;
                if (!fileContent || fileContent.trim().length === 0) { resolve(null); return; }

                Papa.parse(fileContent, {
                    header: true, skipEmptyLines: 'greedy', dynamicTyping: false, transformHeader: h => h.trim(),
                    complete: (results) => {
                        try {
                            if (results.errors.length > 0) { console.warn(`CSV parsing warnings/errors in ${file.name}:`, results.errors); }

                            const dataRows = results.data; const headers = results.meta.fields;
                            const validDataRows = dataRows.filter(row => headers.some(h => row[h] !== null && String(row[h]).trim() !== ''));
                            const studentCount = validDataRows.length;
                            console.log(`[${file.name}] Step 1: Enrolled Students = ${studentCount}`);
                            if (studentCount === 0) { console.warn(`File "${file.name}" contains no valid student data rows.`); resolve(null); return; }
                            if (!headers || headers.length === 0) { throw new Error(`Could not parse headers for file "${file.name}".`); }

                            const uniIdIndex = headers.indexOf(UNIVERSITY_ID_HEADER); const progressIndex = headers.indexOf(PROGRESS_HEADER);
                            if (uniIdIndex === -1) { throw new Error(`Header "${UNIVERSITY_ID_HEADER}" not found.`); }
                            if (progressIndex === -1) { throw new Error(`Header "${PROGRESS_HEADER}" not found.`); }
                            if (uniIdIndex >= progressIndex - 1) { throw new Error(`No columns between "${UNIVERSITY_ID_HEADER}" and "${PROGRESS_HEADER}".`); }

                            const initialExerciseHeaders = headers.slice(uniIdIndex + 1, progressIndex);

                            // --- UPDATED FILTERING LOGIC ---
                            const excludedHeaders = [];
                            const finalExerciseHeaders = initialExerciseHeaders.filter(header => {
                                const lowerCaseHeader = header.toLowerCase();
                                // Check if the header includes ANY of the exclusion phrases
                                const shouldExclude = EXCLUSION_PHRASES.some(phrase => lowerCaseHeader.includes(phrase));
                                if (shouldExclude) {
                                    excludedHeaders.push(header); // Keep track of excluded headers
                                }
                                return !shouldExclude; // Keep headers that should NOT be excluded
                            });
                            // --- END UPDATED FILTERING LOGIC ---

                            if(excludedHeaders.length > 0) {
                                console.log(`[${file.name}] Excluding ${excludedHeaders.length} columns based on phrases:`, excludedHeaders);
                            }
                            console.log(`[${file.name}] Final Exercise Headers for Analysis (${finalExerciseHeaders.length}):`, finalExerciseHeaders);

                            if (finalExerciseHeaders.length === 0) {
                                console.warn(`File "${file.name}" has no exercise columns remaining after filtering.`);
                                resolve({ filename: file.name, studentCount: studentCount, overallMedian: null, lowEngagementExercises: [], warnings: [...results.errors.map(e => `Row ${e.row}: ${e.message}`), `No exercises remain after filtering.`] });
                                return;
                            }

                            // Scoring logic (unchanged)
                            const exerciseAverages = [];
                            finalExerciseHeaders.forEach(exHeader => {
                                let totalScore = 0;
                                validDataRows.forEach(row => {
                                    const value = row[exHeader] ? String(row[exHeader]).trim() : '';
                                    if (value === '100') { totalScore += 100; }
                                    else if (value === '1') { totalScore += 1; }
                                });
                                const averageScore = studentCount > 0 ? (totalScore / studentCount) : 0;
                                exerciseAverages.push({ title: exHeader, average: averageScore });
                            });
                            console.log(`[${file.name}] Step 3: Calculated Average Scores (${exerciseAverages.length}).`);

                            // Median and Low Engagement logic (unchanged)
                            const allAverages = exerciseAverages.map(ex => ex.average);
                            const overallMedian = calculateMedian(allAverages);
                            console.log(`[${file.name}] Step 4: Overall Median Engagement Score = ${overallMedian !== null ? overallMedian.toFixed(1) : 'N/A'}`);

                            const medianThreshold = overallMedian !== null ? overallMedian - thresholdValue : -Infinity;
                            const lowEngagementExercises = [];
                            exerciseAverages.forEach(ex => {
                                if (overallMedian !== null && ex.average < medianThreshold) {
                                    lowEngagementExercises.push({ title: ex.title, percentage: ex.average });
                                }
                            });
                            console.log(`[${file.name}] Step 5: Low Engagement Exercises (Avg Score < ${overallMedian !== null ? medianThreshold.toFixed(1) : 'N/A'}):`, lowEngagementExercises);

                            resolve({
                                filename: file.name,
                                studentCount: studentCount,
                                overallMedian: overallMedian,
                                lowEngagementExercises: lowEngagementExercises,
                                warnings: results.errors.map(e => `Row ${e.row}: ${e.message}`)
                                // thresholdUsed is added in handleSubmit
                            });

                        } catch (analysisError) { console.error(`Error analyzing ${file.name}:`, analysisError); resolve({ filename: file.name, error: `Analysis failed: ${analysisError.message}` }); }
                    },
                    error: (parseError) => { console.error(`Parsing error in ${file.name}:`, parseError.message); resolve({ filename: file.name, error: `Parsing failed: ${parseError.message}` }); }
                });
            };
            reader.onerror = (event) => { console.error(`Error reading ${file.name}:`, reader.error); resolve({ filename: file.name, error: `Failed to read file.` }); };
            reader.readAsText(file);
        });
    };

    // --- Render Component (JSX Unchanged) ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-cyan-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 shadow-xl rounded-lg border border-gray-200">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    Student Engagement Analyzer
                </h1>

                 {/* Form */}
                 <form onSubmit={handleSubmit} className="space-y-6 mb-8">
                      {/* File Input */}
                      <div>
                          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2"> Upload Engagement CSV File(s) </label>
                          <input id="file-upload" ref={fileInputRef} type="file" multiple accept=".csv, text/csv" onChange={handleFileChange} disabled={isLoading} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed" />
                          {files.length > 0 && <p className="mt-2 text-sm text-gray-600">{files.length} CSV file{files.length !== 1 ? 's' : ''} selected.</p>}
                      </div>
                      {/* Threshold Input */}
                      <div>
                           <label htmlFor="threshold-input" className="block text-sm font-medium text-gray-700 mb-1"> Low Engagement Threshold (Score points below median) </label>
                           <input id="threshold-input" type="number" value={medianDifferenceThresholdInput} onChange={(e) => setMedianDifferenceThresholdInput(e.target.value)} disabled={isLoading} min="0" step="0.1" placeholder={String(DEFAULT_MEDIAN_DIFFERENCE)} className="block w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm disabled:opacity-50" />
                           <p className="mt-1 text-xs text-gray-500">Default is {DEFAULT_MEDIAN_DIFFERENCE}. Enter the difference (e.g., 10 means less than Median Average Score - 10).</p>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                          <button type="submit" disabled={isLoading || files.length === 0} aria-busy={isLoading} className={`w-full sm:w-auto inline-flex justify-center items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out ${isLoading || files.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500"}`}> {isLoading ? (<><span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>Processing...</>) : ("Analyze Data")} </button>
                          <button type="button" onClick={handleClear} disabled={isLoading} className="w-full sm:w-auto inline-flex justify-center px-6 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"> Clear Selection </button>
                      </div>
                      {/* Error Area */}
                      {error && ( <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md" aria-live="assertive"> <p className="text-sm font-medium text-red-800">Error: {error}</p> </div> )}
                  </form>

                {/* --- Results Area (JSX Unchanged) --- */}
                {results && Object.keys(results).length > 0 && (
                    <div className="mt-10 space-y-8">
                        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6"> Analysis Results </h2>
                        <p><em>Note:</em> averages exclude stats from exercises that don't actually involve doing anything on the page (e.g. readings, information boxes, live sessions)</p>
                        {Object.entries(results)
                            .sort(([filenameA], [filenameB]) => {
                                const numA = extractSessionNumber(filenameA); const numB = extractSessionNumber(filenameB); if (numA !== null && numB !== null) { return numA - numB; } if (numA !== null && numB === null) { return -1; } if (numA === null && numB !== null) { return 1; } return filenameA.localeCompare(filenameB);
                            })
                            .map(([filename, fileData]) => {
                                const displayMedianThreshold = fileData.overallMedian !== null ? (fileData.overallMedian - fileData.thresholdUsed).toFixed(1) : 'N/A';
                                const displayMedian = fileData.overallMedian !== null ? fileData.overallMedian.toFixed(1) : 'N/A';

                                return (
                                    <div key={filename} className="p-6 bg-gray-50 rounded-lg shadow border border-gray-200 mb-6">
                                        <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">{filename}</h3>
                                        {fileData.error ? ( <p className="text-red-600 font-medium">Failed to process: {fileData.error}</p> ) : (
                                            <>
                                                {fileData.warnings && fileData.warnings.length > 0 && ( <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md"><p className="text-sm font-medium text-yellow-800 mb-1">Warnings:</p><ul className="list-disc list-inside text-sm text-yellow-700">{fileData.warnings.map((msg, index) => (<li key={`warn-${index}`}>{msg}</li>))}</ul></div> )}
                                                <p className="mb-2 text-gray-700"><span className="font-medium">Enrolled Students:</span> {fileData.studentCount}</p>
                                                <p className="mb-4 text-gray-700"><span className="font-medium">Overall Median Avg Score (Analyzed Exercises):</span> {displayMedian}</p>
                                                <p className="mb-4 text-xs text-gray-500 italic">Low engagement threshold used: Avg score less than {fileData.thresholdUsed} points below median avg score.</p>

                                                <div>
                                                     <h4 className="text-lg font-medium text-gray-600 mb-3"> Analyzed Exercises with Avg Score less than {fileData.thresholdUsed} Points Below Median ({fileData.overallMedian !== null ? `< ${displayMedianThreshold}` : 'N/A'}) </h4>
                                                     {fileData.lowEngagementExercises && fileData.lowEngagementExercises.length > 0 ? (
                                                         <ul className="list-disc list-inside space-y-1 text-sm text-gray-800 bg-blue-50 p-3 rounded border border-blue-200">
                                                             {fileData.lowEngagementExercises
                                                               .sort((a, b) => a.percentage - b.percentage)
                                                               .map((ex, index) => ( <li key={`low-${index}`}><strong>{ex.title}:</strong> {ex.percentage.toFixed(1)}</li> ))}
                                                         </ul>
                                                     ) : (
                                                         <p className="text-sm text-gray-500 italic">
                                                             {fileData.overallMedian === null ? "Cannot determine low engagement as no exercises were analyzed." : `No analyzed exercises found with average score below the ${displayMedianThreshold} threshold.`}
                                                         </p>
                                                     )}
                                                 </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                )}
                {/* End Results Area */}
            </div>
        </div>
    );
}