"use client";

import React, { useState, useRef, useEffect } from "react";
import { TagCloud } from 'react-tagcloud';
// --- NEW: Import docx and file-saver ---
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, convertInchesToTwip
} from "docx";
import { saveAs } from 'file-saver';
// --- End Imports ---

// Dynamic imports for pdfjs-dist will be used inside handleSubmit

// Keep stop words defined globally or move inside if preferred
const STOP_WORDS = new Set([ /* ... Keep your extensive list here ... */
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "particularly", "q2", "q3", "q4", "q5", "recommend", "module", "colleague", "answer", "helpful", "learning", "outcomes", "please", "explain", "why", "found", "least", "achieve", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves",
    "n/a", "na", "-", "module", "session", "also", "get", "bit", "lot", "really", "think", "will", "well", "much", "good", "great", "like", "feel", "found", "very", "quite", "especially", "content", "learn", "learning", "understand", "understanding", "would", "could", "week", "section", "studies", "study", "course"
]);

// The marker phrase to find in the text
const START_MARKER_PHRASE = "the main reason for your answer";


export default function PdfCommentAnalyzerPage() {
    const [file, setFile] = useState(null);
    const [categorizedComments, setCategorizedComments] = useState({ positive: [], critical: [] });
    const [wordCloudData, setWordCloudData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false); // <-- State for download button
    const [error, setError] = useState(null);
    const [processingStatus, setProcessingStatus] = useState('');
    const [processingWarning, setProcessingWarning] = useState('');

    const fileInputRef = useRef(null);
    const resultsRef = useRef(null);

    useEffect(() => {
        if (categorizedComments.positive.length > 0 || categorizedComments.critical.length > 0 || wordCloudData) {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [categorizedComments, wordCloudData]);

    const handleFileChange = (event) => {
        setError(null); setProcessingWarning(''); setCategorizedComments({ positive: [], critical: [] });
        setWordCloudData(null); setProcessingStatus(''); setFile(null);
        if (event.target.files && event.target.files[0]) {
            const selectedFile = event.target.files[0];
            if (selectedFile.type === "application/pdf") { setFile(selectedFile); }
            else { setError("Please upload a PDF file."); if (fileInputRef.current) fileInputRef.current.value = ""; }
        }
    };

    const handleClear = () => {
        setFile(null); setCategorizedComments({ positive: [], critical: [] }); setWordCloudData(null);
        setError(null); setProcessingWarning(''); setProcessingStatus('');
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // --- Improved Text Processing Function using Regex (Unchanged) ---
    function extractRelevantText(fullText, marker) {
        // 1. Split the marker phrase by spaces
        const markerParts = marker.split(' ');

        // 2. Escape regex special characters in each part
        //    (Handles cases where parts might contain ., *, ?, etc.)
        const escapedParts = markerParts.map(part =>
            part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape regex metacharacters
        );

        // 3. Join the escaped parts with \s+
        //    \s+ matches one or more whitespace characters (space, tab, newline, etc.)
        //    This makes the search tolerant to extra spaces between words in the marker.
        const flexibleMarkerPattern = escapedParts.join('\\s+');

        // 4. Construct the final regex to find the *line* containing the flexible marker pattern
        //    ^ matches the start of a line (due to 'm' flag)
        //    .*? matches any character non-greedily
        //    $ matches the end of a line (due to 'm' flag)
        //    'i' flag for case-insensitivity
        //    'm' flag for multiline matching (^ and $ match start/end of lines)
        const markerRegex = new RegExp(`^.*?${flexibleMarkerPattern}.*$`, "im");

        console.log("Searching with flexible marker regex:", markerRegex); // For debugging

        const match = markerRegex.exec(fullText);

        if (!match) {
            console.warn(`Marker phrase "${marker}" (with flexible spacing) not found using regex.`);
            // Keep the existing warning behavior or adjust as needed
            setProcessingWarning(prev => prev ? `${prev}\nMarker phrase "${marker}" not found. Processing all extracted text.` : `Marker phrase "${marker}" not found. Processing all extracted text.`);
            return fullText; // Return the whole text if marker isn't found
        }

        // --- The rest of the logic remains the same: find the end of the matched line ---
        // --- and extract text starting from the *next* line.                ---

        const endOfMatchedLineIndex = match.index + match[0].length;

        // Find the next newline character *after* the matched line ends
        const nextNewlineIndex = fullText.indexOf('\n', endOfMatchedLineIndex);

        if (nextNewlineIndex === -1) {
            // Marker found, but it might be the last line or there's no text after it.
            console.log("Marker found, but no newline character after the matched line.");
            // Return text immediately following the matched line (if any)
            return fullText.slice(endOfMatchedLineIndex).trim();
        }

        // Extract text starting from the character *after* the newline
        console.log(`Flexible marker pattern found on line ending at index ${endOfMatchedLineIndex}. Extracting text from index ${nextNewlineIndex + 1}.`);
        return fullText.slice(nextNewlineIndex + 1).trim();
    }

    // --- Main Submit Handler (Unchanged) ---
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!file) { setError("Please select a PDF file first."); return; }

        setIsLoading(true); setError(null); setProcessingWarning('');
        setCategorizedComments({ positive: [], critical: [] }); setWordCloudData(null);
        setProcessingStatus('Initializing PDF processing...');

        try {
            setProcessingStatus('Loading PDF library...');
            const pdfjsLib = await import('pdfjs-dist/build/pdf');
            if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) { pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`; console.log('PDF worker source set to:', pdfjsLib.GlobalWorkerOptions.workerSrc); }
            setProcessingStatus('Reading file...');
            const fileReader = new FileReader();
            const fileData = await new Promise((resolve, reject) => { fileReader.onload = (e) => resolve(new Uint8Array(e.target.result)); fileReader.onerror = (err) => reject(new Error(`File reading failed: ${err}`)); fileReader.readAsArrayBuffer(file); });
            setProcessingStatus('Loading PDF document...');
            const pdf = await pdfjsLib.getDocument({ data: fileData }).promise; const numPages = pdf.numPages; console.log(`PDF loaded with ${numPages} pages.`);
            let fullText = '';
            for (let i = 1; i <= numPages; i++) { setProcessingStatus(`Extracting text from page ${i}/${numPages}...`); const page = await pdf.getPage(i); const textContent = await page.getTextContent(); textContent.items.forEach(item => { fullText += item.str + (item.hasEOL ? '\n' : ' '); }); fullText += '\n\n'; page.cleanup(); }
            console.log("Text extraction complete."); if (!fullText || fullText.trim().length === 0) { throw new Error("Could not extract any text content using pdf.js getTextContent."); }
            setProcessingStatus('Processing extracted text...');
            const relevantText = extractRelevantText(fullText, START_MARKER_PHRASE); if (!relevantText || relevantText.trim().length === 0) { throw new Error("No relevant text found after the starting marker phrase or PDF text was empty."); }
            setProcessingStatus('Generating word list...'); let initialWordCloudData = [];
             if (relevantText.length > 0) { try { const words = relevantText.toLowerCase().replace(/’/g, "'").replace(/[^a-z'\s-]/g, "").replace(/\s+/g, ' ').split(' '); const wordCounts = {}; words.forEach(word => { const trimmedWord = word.trim(); if (trimmedWord && trimmedWord.length > 2 && !STOP_WORDS.has(trimmedWord) && isNaN(trimmedWord)) { wordCounts[trimmedWord] = (wordCounts[trimmedWord] || 0) + 1; } }); initialWordCloudData = Object.entries(wordCounts).map(([text, count]) => ({ value: text, count: count })).sort((a, b) => b.count - a.count).slice(0, 35); console.log(`Generated ${initialWordCloudData.length} words for cloud.`); } catch (cloudError) { console.error("Error generating word cloud data:", cloudError); setProcessingWarning(prev => prev ? `${prev}\nFailed to generate word cloud data.` : "Failed to generate word cloud data."); } }
            setProcessingStatus('Sending data for AI analysis...'); const apiPayload = { textBlock: relevantText, wordCloudDataInput: initialWordCloudData };
            const response = await fetch("/test-apps/nps-processor/api", { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(apiPayload) }); // Changed API Path
            const data = await response.json();
            if (data.processingWarnings) { setProcessingWarning(prev => prev ? `${prev}\nBackend: ${data.processingWarnings.join(', ')}` : `Backend: ${data.processingWarnings.join(', ')}`); }
            if (!response.ok) { throw new Error(data.error || `Backend API error! Status: ${response.status}`); }
            setProcessingStatus('Displaying results.'); setCategorizedComments(data.categorizedComments || { positive: [], critical: [] }); setWordCloudData(data.wordCloudData || null);
        } catch (err) { console.error("Error during processing:", err); setError(`Processing failed: ${err.message || 'Unknown error'}`); setProcessingStatus('Error occurred.'); }
        finally { setIsLoading(false); }
    }; // End handleSubmit


    // --- Custom Tag Renderer (Unchanged) ---
    const customTagRenderer = (tag, size) => {
        let color;
        switch (tag.sentiment) {
            case 'positive': color = '#228B22'; break;
            case 'negative': color = '#DC143C'; break;
            case 'neutral': default: color = '#696969'; break;
        }
        return ( <span key={tag.value} style={{ fontSize: `${size}px`, margin: '3px', padding: '3px', display: 'inline-block', color: color, cursor: 'default' }} title={`Count: ${tag.count}${tag.sentiment ? ` (${tag.sentiment})` : ''}`}> {tag.value} </span> );
    };

    // --- NEW: Function to generate DOCX content ---
    const generateDocxContent = (commentsData, wordCloudDocData) => {
        const children = [];

        children.push(
            new Paragraph({
                text: "PDF Feedback Analysis Report",
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
                spacing: { after: convertInchesToTwip(0.25) },
            })
        );

        // Positive Comments
        if (commentsData.positive && commentsData.positive.length > 0) {
            children.push(new Paragraph({
               text: "Positive Comments",
               heading: HeadingLevel.HEADING_1, // Use H1 for main sections
               spacing: { before: convertInchesToTwip(0.2), after: convertInchesToTwip(0.1) },
            }));
            commentsData.positive.forEach(comment => {
                children.push(new Paragraph({
                    text: comment,
                    bullet: { level: 0 },
                    style: "normal", // Apply the 'normal' style defined below
                    indent: { left: convertInchesToTwip(0.5) } // Indent bullet points
                }));
            });
        } else {
             children.push(new Paragraph({ text: "Positive Comments", heading: HeadingLevel.HEADING_1, spacing: { before: convertInchesToTwip(0.2), after: convertInchesToTwip(0.1) } }));
             children.push(new Paragraph({ text: "No positive comments identified.", style: "normal", italics: true }));
        }

         // Add space between sections
        children.push(new Paragraph({ text: "", spacing: { after: convertInchesToTwip(0.2) } }));


        // Critical Comments
        if (commentsData.critical && commentsData.critical.length > 0) {
            children.push(new Paragraph({
               text: "Critical Comments / Suggestions",
               heading: HeadingLevel.HEADING_1,
               spacing: { before: convertInchesToTwip(0.2), after: convertInchesToTwip(0.1) },
            }));
            commentsData.critical.forEach(comment => {
                children.push(new Paragraph({
                    text: comment,
                    bullet: { level: 0 },
                    style: "normal",
                    indent: { left: convertInchesToTwip(0.5) }
                }));
            });
        } else {
             children.push(new Paragraph({ text: "Critical Comments / Suggestions", heading: HeadingLevel.HEADING_1, spacing: { before: convertInchesToTwip(0.2), after: convertInchesToTwip(0.1) } }));
             children.push(new Paragraph({ text: "No critical comments identified.", style: "normal", italics: true }));
        }

        // Add space between sections
        children.push(new Paragraph({ text: "", spacing: { after: convertInchesToTwip(0.2) } }));


        // Word Cloud Data (Textual)
        if (wordCloudDocData && wordCloudDocData.length > 0) {
            children.push(new Paragraph({
               text: "Common Words (Top 35)",
               heading: HeadingLevel.HEADING_1,
               spacing: { before: convertInchesToTwip(0.2), after: convertInchesToTwip(0.1) },
            }));
            const wordList = wordCloudDocData.map(tag => `${tag.value} (${tag.count}, ${tag.sentiment || 'neutral'})`).join(', ');
            children.push(new Paragraph({ text: wordList, style: "normal" }));
        }

        // Create the document object with styles
        const doc = new Document({
            sections: [{
                properties: {}, // Add page margins, etc. here if needed
                children: children,
            }],
            styles: {
                default: { // Set default document properties
                    heading1: { run: { size: 28, bold: true, font: "Calibri", color: "333333" } }, // 14pt
                    heading2: { run: { size: 26, bold: true, font: "Calibri Light", color: "555555" } }, // 13pt (If you need H2)
                    document: { run: { size: 22, font: "Calibri" } }, // 11pt default body text
                },
                paragraphStyles: [
                    { id: "normal", name: "Normal", basedOn: "Normal", next: "Normal", run: { size: 22, font: "Calibri" } },
                    // Heading styles are often inherited from defaults but can be explicitly defined too
                    { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 28, bold: true, font: "Calibri", color: "333333" } },
                ]
            }
        });

        return doc;
    };

    // --- NEW: Handler for the download button ---
    const handleDownloadDocx = async () => {
        // Ensure data exists before attempting download
        if (!categorizedComments || (!categorizedComments.positive?.length && !categorizedComments.critical?.length)) {
            console.error("No comment data available to download.");
            setError("No comment data to download."); // Inform user
            return;
        }
        setIsDownloading(true);
        setError(null); // Clear previous errors
        try {
            console.log("Generating DOCX...");
            // Pass the necessary state data to the generation function
            const doc = generateDocxContent(categorizedComments, wordCloudData);

            const blob = await Packer.toBlob(doc);
            saveAs(blob, "pdf_feedback_analysis.docx");
            console.log("DOCX download initiated.");

        } catch (err) {
            console.error("Error generating or downloading DOCX:", err);
            setError("Failed to generate Word document.");
        } finally {
            setIsDownloading(false);
        }
    };


    // --- RETURN JSX ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 shadow-xl rounded-lg border border-gray-200">
                 <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Simple PDF Feedback Analyzer</h1>
                 {/* Form */}
                 <div className="space-y-6 mb-8">
                     {/* File Input */}
                     <div>
                         <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">Upload Feedback PDF File</label>
                         <input id="file-upload" ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"/>
                         {file && <p className="mt-2 text-sm text-gray-600">Selected: {file.name}</p>}
                     </div>
                     {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 items-center"> {/* Use items-center for vertical alignment */}
                        <button type="button" onClick={handleSubmit} disabled={isLoading || !file} aria-busy={isLoading} className={`w-full sm:w-auto inline-flex justify-center items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out ${isLoading || !file ? "bg-gray-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700 focus:ring-teal-500"}`}> {isLoading ? (<><span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>Processing...</>) : ("Analyze Feedback")} </button>
                        <button type="button" onClick={handleClear} disabled={isLoading} className="w-full sm:w-auto inline-flex justify-center px-6 py-2 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"> Clear Selection </button>
                        {/* --- NEW: Download Button --- */}
                        {(categorizedComments.positive.length > 0 || categorizedComments.critical.length > 0 || wordCloudData) && !isLoading && (
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
                     {/* Status/Error/Warning Area */}
                      {(isLoading || error || processingWarning) && (
                         <div className="mt-4 p-3 rounded-md border bg-gray-50">
                              {isLoading && processingStatus && ( <p className="text-sm text-center text-teal-600">{processingStatus}</p> )}
                              {error && ( <div className={`p-2 mt-2 bg-red-50 border-red-200 rounded ${isLoading || processingWarning ? 'border-t pt-2' : ''}`} aria-live="assertive"> <p className="text-sm font-medium text-red-800">Error: {error}</p> </div> )}
                              {!error && processingWarning && ( <div className={`p-2 mt-2 bg-yellow-50 border-yellow-200 rounded ${isLoading ? 'border-t pt-2' : ''}`} aria-live="polite"> <p className="text-sm font-medium text-yellow-800">Note: {processingWarning}</p> </div> )}
                         </div>
                     )}
                 </div>

                 {/* --- Results Area --- */}
                 <div ref={resultsRef}>
                     {/* --- UPDATED: Display Categorized Comments Vertically --- */}
                     {(categorizedComments.positive.length > 0 || categorizedComments.critical.length > 0) && !isLoading && (
                         <div className="mt-10 p-6 bg-gray-50 rounded-lg shadow border border-gray-200 mb-6 space-y-6">
                             <h2 className="text-2xl font-semibold text-center text-gray-800">
                                 Categorized Comments
                             </h2>
                             {/* Positive Comments Section */}
                             <div className="mt-4"> {/* Added margin-top */}
                                 <h3 className="text-lg font-medium text-green-700 mb-2">Positive Comments</h3>
                                 {categorizedComments.positive.length > 0 ? (
                                     // REMOVED background/border classes from UL
                                     <ul className="list-disc list-inside space-y-2 text-sm text-green-800">
                                         {categorizedComments.positive.map((c, i) => (<li key={`pos-${i}`}>{c}</li>))}
                                     </ul>
                                 ) : (
                                     <p className="text-sm text-gray-500 italic bg-gray-100 p-3 rounded border">No positive comments identified.</p>
                                 )}
                             </div>

                             {/* Critical Comments Section */}
                             <div className="mt-4"> {/* Added margin-top */}
                                 <h3 className="text-lg font-medium text-red-700 mb-2">Critical Comments / Suggestions</h3>
                                 {categorizedComments.critical.length > 0 ? (
                                     // REMOVED background/border classes from UL
                                     <ul className="list-disc list-inside space-y-2 text-sm text-red-800">
                                         {categorizedComments.critical.map((c, i) => (<li key={`crit-${i}`}>{c}</li>))}
                                     </ul>
                                 ) : (
                                      <p className="text-sm text-gray-500 italic bg-gray-100 p-3 rounded border">No critical comments identified.</p>
                                 )}
                             </div>
                         </div>
                     )}
                     {/* --- End Updated Comments Section --- */}

                     {/* Word Cloud */}
                     {wordCloudData && wordCloudData.length > 0 && !isLoading && (
                        <div className="mt-6 p-6 bg-gray-50 rounded-lg shadow border border-gray-200">
                            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">Common Words (Top 35)</h2>
                            <div className="text-center p-4" aria-label="Word cloud with sentiment coloring"> <TagCloud minSize={14} maxSize={45} tags={wordCloudData} shuffle={false} renderer={customTagRenderer} className="simple-cloud" /> </div>
                            <p className="text-xs text-center text-gray-500 mt-2"> Size indicates frequency. Color indicates sentiment (Green: Positive, Red: Negative, Gray: Neutral). Hover for details. </p>
                        </div>
                     )}
                 </div>
            </div>
        </div>
    );
}