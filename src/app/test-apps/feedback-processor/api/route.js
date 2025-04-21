// src/app/test-apps/feedback-processor/api/route.js
import OpenAI from "openai";
import { NextResponse } from "next/server";
import Papa from "papaparse";

const openai = new OpenAI({
    apiKey: process.env.SMO_OPENAI_API_KEY,
});

// --- STOP WORDS LIST (Unchanged) ---
const STOP_WORDS = new Set([
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

// --- Configuration Constants (Unchanged) ---
const STUDENT_ID_HEADER = 'Student Id';
const TIMING_COLUMN_HEADER = 'Timing';
const FEEDBACK_COLUMN_HEADER = 'Student Feedback';
const OMIT_COMMENT_STRINGS = new Set(['none', 'n/a', '-']);
const TIMING_LESS = "It took less time to complete the tasks and activities than estimated";
const TIMING_MORE = "It took more time to complete the tasks and activities than estimated";
const TIMING_SAME = "It took about the same amount of time to complete the tasks and activities as estimated";

// Helper function to read file content as text (Unchanged)
async function readFileAsText(file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    try {
        if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
            return buffer.toString("utf-8");
        }
    } catch (e) {
        console.warn(`Encoding detection failed for ${file.name}, falling back to UTF-8`);
    }
    return buffer.toString("utf-8");
}

// Helper function to extract session name from filename (Unchanged)
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


export async function POST(request) {
    console.log("Received request to API route");

    try {
        const formData = await request.formData();
        const files = formData.getAll("files");

        if (!files || files.length === 0) {
            console.log("No files found in request.");
            return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
        }
        console.log(`Received ${files.length} file(s).`);

        let sessionDataMap = {};
        const processingWarnings = [];
        let allCommentsText = "";

        // --- 1. Parse CSV files (Logic largely unchanged) ---
        for (const file of files) {
            // ... (Keep the existing file parsing logic exactly as it was) ...
            // This includes reading the file, handling headers, processing rows for comments,
            // timing, and learning outcomes. The allCommentsText variable will be populated here.
            console.log(`Processing file: ${file.name}`);
            if (file.type !== "text/csv" && !file.name.toLowerCase().endsWith(".csv")) {
                console.warn(`Skipping non-CSV file: ${file.name} (Type: ${file.type})`);
                processingWarnings.push(`Skipped non-CSV file: "${file.name}". Only .csv files are accepted.`);
                continue;
            }

            const sessionName = getSessionName(file.name);
            if (!sessionDataMap[sessionName]) {
                sessionDataMap[sessionName] = {
                    comments: [],
                    timingCounts: { less: 0, more: 0, same: 0 },
                    learningOutcomes: [], // Format: [{ loHeader: string, responses: { response: count } }]
                    parsingInfo: {
                        foundStudentId: false,
                        foundTiming: false,
                        foundFeedback: false,
                        loColumnsIdentified: 0,
                    }
                };
            }

            try {
                const fileContent = await readFileAsText(file);
                if (!fileContent || fileContent.trim().length === 0) {
                    console.warn(`File ${file.name} is empty or could not be read properly.`);
                    processingWarnings.push(`File "${file.name}" is empty or unreadable.`);
                    continue;
                }

                await new Promise((resolve, reject) => {
                    const parseConfig = {
                        header: true,
                        skipEmptyLines: true,
                        dynamicTyping: false, // Keep as false to handle various inputs safely
                        quotes: true,        // Standard CSV quote handling
                        escapeChar: '"',     // Standard CSV escape character
                        transformHeader: header => header.trim(), // Initial trim for all headers
                        complete: (results) => {
                            try {
                                // --- Handle Parsing Errors ---
                                if (results.errors.length > 0) {
                                    console.warn(`CSV parsing warnings/errors in ${file.name}:`, results.errors);
                                    // Provide more specific warnings if possible
                                    results.errors.forEach(err => processingWarnings.push(`Parsing issue in "${file.name}" near row ${err.row || 'unknown'}: ${err.message} (${err.code})`));
                                }

                                // --- Validate Headers ---
                                const actualHeaders = results.meta.fields;
                                if (!actualHeaders || actualHeaders.length === 0) {
                                    processingWarnings.push(`Could not parse headers for file "${file.name}". Skipping file.`);
                                    // Reject the promise as we cannot proceed without headers
                                    reject(new Error(`No headers found in ${file.name}`));
                                    return;
                                }

                                // --- Find Key Column Indices ---
                                let studentIdIndex = -1;
                                let timingIndex = -1;
                                let feedbackIndex = -1;
                                actualHeaders.forEach((header, index) => {
                                    // Use exact match after initial trim from transformHeader
                                    if (header === STUDENT_ID_HEADER) studentIdIndex = index;
                                    if (header === TIMING_COLUMN_HEADER) timingIndex = index;
                                    if (header === FEEDBACK_COLUMN_HEADER) feedbackIndex = index;
                                });

                                // --- Update Parsing Info ---
                                sessionDataMap[sessionName].parsingInfo.foundStudentId = studentIdIndex !== -1;
                                sessionDataMap[sessionName].parsingInfo.foundTiming = timingIndex !== -1;
                                sessionDataMap[sessionName].parsingInfo.foundFeedback = feedbackIndex !== -1;

                                // --- Identify, Clean, and Store Learning Outcome Columns ---
                                let originalLoHeaders = []; // Store original headers for row data lookup
                                let cleanedLoHeaders = [];  // Store cleaned headers for display/keys

                                if (studentIdIndex !== -1 && timingIndex !== -1 && studentIdIndex < timingIndex) {
                                    // Extract headers between Student Id and Timing
                                    originalLoHeaders = actualHeaders.slice(studentIdIndex + 1, timingIndex);

                                    // --- START: Enhanced Cleaning Logic for LO Headers (v3) ---
                                    cleanedLoHeaders = originalLoHeaders.map(header => {
                                        let cleaned = header.trim(); // Start with trimming whitespace

                                        // 1. Remove specific trailing '.\\"' sequence if present
                                        if (cleaned.endsWith('.\\"')) {
                                            cleaned = cleaned.slice(0, -3); // Remove last 3 chars
                                        }

                                        // 2. Remove specific trailing '\.' sequence if present (Added based on feedback)
                                        //    Need to escape the backslash in the string check
                                        if (cleaned.endsWith('\\.')) {
                                            cleaned = cleaned.slice(0, -2); // Remove last 2 chars
                                        }

                                        // 3. Remove surrounding double quotes (e.g., "LO Title")
                                        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
                                            cleaned = cleaned.slice(1, -1); // Remove first and last char
                                        }
                                        // 4. Remove surrounding single quotes (e.g., 'LO Title')
                                        if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
                                            cleaned = cleaned.slice(1, -1);
                                        }

                                        // 5. Final trim in case removing quotes/sequences exposed whitespace
                                        cleaned = cleaned.trim();

                                        return cleaned;
                                    });
                                    // --- END: Enhanced Cleaning Logic for LO Headers (v3) ---

                                    sessionDataMap[sessionName].parsingInfo.loColumnsIdentified = originalLoHeaders.length;

                                    // Initialize the learningOutcomes array using the *cleaned* headers
                                    sessionDataMap[sessionName].learningOutcomes = cleanedLoHeaders.map(cleanedHeader => ({
                                        loHeader: cleanedHeader, // Store the clean version
                                        responses: {}
                                    }));

                                    if (originalLoHeaders.length === 0) {
                                        processingWarnings.push(`No columns found between "${STUDENT_ID_HEADER}" and "${TIMING_COLUMN_HEADER}" in "${file.name}" for Learning Outcomes.`);
                                    }
                                } else {
                                    // Warning if LO structure cannot be determined
                                    processingWarnings.push(`Could not identify Learning Outcome columns in "${file.name}". Requires both "${STUDENT_ID_HEADER}" and "${TIMING_COLUMN_HEADER}" columns to be present in the correct order.`);
                                }

                                // --- Issue Header Warnings (if key columns missing) ---
                                if (!sessionDataMap[sessionName].parsingInfo.foundFeedback) {
                                    processingWarnings.push(`File "${file.name}" missing required column: '${FEEDBACK_COLUMN_HEADER}'. Feedback comments cannot be processed.`);
                                }
                                if (!sessionDataMap[sessionName].parsingInfo.foundTiming) {
                                    processingWarnings.push(`File "${file.name}" missing column: '${TIMING_COLUMN_HEADER}'. Timing data cannot be processed.`);
                                }
                                if (!sessionDataMap[sessionName].parsingInfo.foundStudentId) {
                                    processingWarnings.push(`File "${file.name}" missing column: '${STUDENT_ID_HEADER}'. Learning Outcome data cannot be reliably identified.`);
                                }

                                // --- Process Rows ---
                                let commentsFoundInFile = 0;
                                results.data.forEach((row, rowIndex) => { // Add rowIndex for better error reporting if needed
                                    // Process Feedback Comments
                                    if (sessionDataMap[sessionName].parsingInfo.foundFeedback) {
                                        const feedback = row[FEEDBACK_COLUMN_HEADER]?.trim();
                                        if (feedback && !OMIT_COMMENT_STRINGS.has(feedback.toLowerCase())) {
                                            sessionDataMap[sessionName].comments.push(feedback);
                                            allCommentsText += feedback + " "; // Accumulate for word cloud
                                            commentsFoundInFile++;
                                        }
                                    }

                                    // Process Timing Responses
                                    if (sessionDataMap[sessionName].parsingInfo.foundTiming) {
                                        const timingResponse = row[TIMING_COLUMN_HEADER]?.trim();
                                        if (timingResponse) {
                                            switch (timingResponse) {
                                                case TIMING_LESS: sessionDataMap[sessionName].timingCounts.less++; break;
                                                case TIMING_MORE: sessionDataMap[sessionName].timingCounts.more++; break;
                                                case TIMING_SAME: sessionDataMap[sessionName].timingCounts.same++; break;
                                                // Optional: Log unexpected timing values?
                                                // default: console.log(`Unexpected timing value in ${file.name} row ${rowIndex+2}: ${timingResponse}`);
                                            }
                                        }
                                    }

                                    // Process Learning Outcomes
                                    // Use originalLoHeaders for lookup in the row data, but map to cleaned structure by index
                                    if (originalLoHeaders.length > 0 && sessionDataMap[sessionName].learningOutcomes.length === originalLoHeaders.length) {
                                        originalLoHeaders.forEach((originalHeader, index) => {
                                            const loResponse = row[originalHeader]?.trim(); // Lookup using original header name
                                            if (loResponse) {
                                                // Find the corresponding entry in our structured learningOutcomes array using the index
                                                const loEntry = sessionDataMap[sessionName].learningOutcomes[index];
                                                if (loEntry) {
                                                     // Increment count for this specific response string
                                                     const currentCount = loEntry.responses[loResponse] || 0;
                                                     loEntry.responses[loResponse] = currentCount + 1;
                                                } else {
                                                    // This should ideally not happen if initialization is correct
                                                    console.error(`Internal Error: Could not find LO entry at index ${index} for original header "${originalHeader}" in file ${file.name}`);
                                                }
                                            }
                                        });
                                    }
                                }); // End of row processing loop

                                console.log(`File "${file.name}": Processed ${results.data.length} rows. Found ${commentsFoundInFile} comments, ${sessionDataMap[sessionName].parsingInfo.loColumnsIdentified} LO columns.`);
                                resolve(); // Resolve the promise indicating successful parsing of this file

                            } catch (completionError) {
                                // Catch errors within the 'complete' callback itself
                                console.error(`Error within PapaParse complete callback for ${file.name}:`, completionError);
                                processingWarnings.push(`Internal error processing parsed data for ${file.name}: ${completionError.message}`);
                                reject(completionError); // Reject the promise
                            }
                        },
                        error: (error) => {
                            // Catch fatal parsing errors reported by PapaParse
                            console.error(`Fatal CSV parsing error in ${file.name}:`, error.message);
                            processingWarnings.push(`Failed to parse file "${file.name}": ${error.message}`);
                            reject(error); // Reject the promise
                        }
                    }; // End of parseConfig
                    Papa.parse(fileContent, parseConfig); // Start parsing
                }); // End of Promise wrapper for PapaParse

            } catch (parseOrReadError) {
                console.error(`Error reading or parsing file ${file.name}:`, parseOrReadError);
                const errorMsg = parseOrReadError.message ? parseOrReadError.message : "Unknown read/parse error";
                processingWarnings.push(`Failed to process file "${file.name}": ${errorMsg}`);
            }
        } // End of file loop

        // --- Filter out sessions with no usable data (Unchanged) ---
        const validSessionNames = Object.keys(sessionDataMap).filter(name =>
            sessionDataMap[name].comments.length > 0 ||
            sessionDataMap[name].timingCounts.less > 0 ||
            sessionDataMap[name].timingCounts.more > 0 ||
            sessionDataMap[name].timingCounts.same > 0 ||
            sessionDataMap[name].learningOutcomes.length > 0
        );

        if (validSessionNames.length === 0) {
             const errorMsg = processingWarnings.length > 0 ? "Failed to process files or extract data. Issues found: " + processingWarnings.join(" ") : "No student feedback, timing, or learning outcome data could be extracted. Ensure files are valid CSVs with required columns ('Student Id', 'Timing', 'Student Feedback') and potentially Learning Outcome columns between 'Student Id' and 'Timing'.";
             console.warn("No usable feedback or other data extracted.", processingWarnings);
             return NextResponse.json({ error: errorMsg, processingWarnings: processingWarnings.length > 0 ? processingWarnings : undefined }, { status: 400 });
        }
        console.log(`Finished parsing. Found data for ${validSessionNames.length} sessions.`);

        // --- 1.5 Generate Word Cloud Data (Initial Structure) ---
        let wordCloudData = [];
        const wordsToAnalyzeForSentiment = []; // <-- NEW: Store words for sentiment analysis
        if (allCommentsText.length > 0) {
            try {
                console.log("Generating word cloud data (max 50 words)...");
                const words = allCommentsText.toLowerCase().replace(/’/g, "'").replace(/[^a-z'\s-]/g, "").replace(/\s+/g, ' ').split(' '); // Keep hyphens
                const wordCounts = {};
                words.forEach(word => {
                    const trimmedWord = word.trim();
                    if (trimmedWord && trimmedWord.length > 2 && !STOP_WORDS.has(trimmedWord) && isNaN(trimmedWord)) {
                        wordCounts[trimmedWord] = (wordCounts[trimmedWord] || 0) + 1;
                    }
                });
                // Create initial structure and collect words for analysis
                wordCloudData = Object.entries(wordCounts)
                    .map(([text, count]) => ({ value: text, count: count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 50); // Limit to top 50

                // Extract just the words for the sentiment analysis prompt
                wordCloudData.forEach(tag => wordsToAnalyzeForSentiment.push(tag.value));

                console.log(`Generated ${wordCloudData.length} words for cloud. Preparing sentiment analysis.`);
            } catch (cloudError) {
                console.error("Error generating word cloud data:", cloudError);
                processingWarnings.push("Failed to generate word cloud data.");
                wordCloudData = []; // Ensure it's empty on error
            }
        }

        // --- 1.6 Call OpenAI for Word Cloud Sentiment Analysis --- (NEW SECTION) ---
        if (wordsToAnalyzeForSentiment.length > 0) {
            console.log(`Sending ${wordsToAnalyzeForSentiment.length} words to OpenAI for sentiment analysis...`);
            const sentimentSystemPrompt = `
You are a sentiment analysis assistant. You will receive a JSON list of words.
Analyze each word individually in the context of general student feedback (e.g., about courses, teaching, materials).
Determine if each word typically carries a 'positive', 'negative', or 'neutral' sentiment in that context.
Respond ONLY with a single, valid JSON object.
The keys of the JSON object MUST be the exact words from the input list.
The values MUST be one of the strings: "positive", "negative", or "neutral".
Do NOT include any other text, explanations, or introductions.

Example Input: ["helpful", "difficult", "activity", "confusing", "great"]
Example Output:
{
  "helpful": "positive",
  "difficult": "negative",
  "activity": "neutral",
  "confusing": "negative",
  "great": "positive"
}
            `.trim();

            const sentimentUserPrompt = JSON.stringify(wordsToAnalyzeForSentiment); // Send as JSON string

            try {
                const sentimentResponse = await openai.chat.completions.create({
                    model: "gpt-4o-mini", // Or "gpt-3.5-turbo" for potentially faster/cheaper analysis
                    messages: [
                        { role: "system", content: sentimentSystemPrompt },
                        { role: "user", content: sentimentUserPrompt }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.1, // Low temperature for consistency
                    max_tokens: 1024, // Adjust if needed based on word count
                });
                console.log("Received sentiment analysis response from OpenAI.");

                const sentimentChoice = sentimentResponse.choices[0];
                if (!sentimentChoice?.message?.content) {
                    throw new Error("Invalid sentiment response structure received from OpenAI.");
                }

                try {
                    const wordSentiments = JSON.parse(sentimentChoice.message.content);
                    console.log(`Successfully parsed OpenAI sentiment response.`);

                    // --- Merge sentiment back into wordCloudData ---
                    wordCloudData = wordCloudData.map(tag => {
                        const sentiment = wordSentiments[tag.value];
                        if (["positive", "negative", "neutral"].includes(sentiment)) {
                            return { ...tag, sentiment: sentiment };
                        } else {
                            console.warn(`Word "${tag.value}" not found or invalid sentiment received: ${sentiment}. Defaulting to neutral.`);
                            return { ...tag, sentiment: "neutral" }; // Default if missing or invalid
                        }
                    });
                    console.log("Merged sentiment data into word cloud data.");

                } catch (jsonError) {
                    console.error("Failed to parse JSON sentiment response from OpenAI:", sentimentChoice.message.content);
                    processingWarnings.push(`Failed to parse word sentiment analysis response. Word cloud colors will be default. Error: ${jsonError.message}`);
                    // Add default sentiment if parsing fails
                    wordCloudData = wordCloudData.map(tag => ({ ...tag, sentiment: "neutral" }));
                }

            } catch (sentimentOpenaiError) {
                console.error("OpenAI API Error during sentiment analysis:", sentimentOpenaiError);
                let errorDetails = sentimentOpenaiError.message || "Unknown AI sentiment error";
                processingWarnings.push(`Failed to get word sentiment analysis from AI: ${errorDetails}. Word cloud colors will be default.`);
                // Add default sentiment if API call fails
                wordCloudData = wordCloudData.map(tag => ({ ...tag, sentiment: "neutral" }));
            }
        } else if (wordCloudData.length > 0) {
            // If word cloud data exists but sentiment analysis wasn't needed/possible
            console.log("No words to analyze for sentiment or word cloud generation failed.");
            wordCloudData = wordCloudData.map(tag => ({ ...tag, sentiment: "neutral" }));
        }

        // --- 2. Prepare Prompt for OpenAI (Feedback Summary/Categorization) --- (Unchanged logic, just renumbered)
        const summarySystemPrompt = `
You are an expert academic feedback analyst. Your task is to process student feedback comments provided for different course sessions.
For EACH session provided in the input:
1.  Write a brief, neutral summary paragraph (2-3 sentences) capturing the main themes of the feedback for that session.
2.  Categorise the comments into 'Positive comments'. List the specific comments that express satisfaction, enjoyment, or highlight strengths.
3.  Categorise the comments into 'Critical comments/Suggestions for improvement'. List the specific comments that express dissatisfaction, confusion, constructive criticism, or suggest changes.

**CRITICAL INSTRUCTIONS:**
*   **VERBATIM REPRODUCTION:** Every single comment listed in the 'positiveComments' and 'criticalComments' arrays MUST be the **exact, complete, and unmodified text** from the original input provided for that session. Do NOT summarize, paraphrase, shorten, or alter the original comments in any way when listing them.
*   **COMPLETE CATEGORIZATION:** Ensure **every original comment** provided for a session is placed verbatim into exactly ONE of the two lists ('positiveComments' or 'criticalComments'). If a comment seems neutral, place it in the category that seems slightly more appropriate or default to 'Critical comments/Suggestions for improvement' if unsure. The ONLY type of comments you can omit are the ones that say something like only 'none' or 'N/A'.
*   **JSON STRUCTURE:** Structure your entire response as a single, valid JSON object. The keys of this object MUST be the session names provided in the input (e.g., "Session 1", "Session 2", "Unknown Session"). The value for each session key MUST be a JSON object with the following EXACT structure:
    {
      "summary": "string",
      "positiveComments": ["string"],
      "criticalComments": ["string"]
    }
*   **NO EXTRA TEXT:** Do not include any introductory text, concluding remarks, apologies, or any other text outside the main JSON object structure.

Your goal is analysis and categorization, preserving the original feedback text perfectly within the categories, omitting only explicitly trivial responses like 'none' or 'N/A'.
        `.trim();

        let summaryUserPromptContent = "Please analyze the following student feedback comments grouped by session, following all instructions precisely:\n\n";
        let sessionsSentToOpenAIForSummary = 0;
        validSessionNames.forEach((sessionName) => {
            const comments = sessionDataMap[sessionName]?.comments;
            if (comments && comments.length > 0) {
                summaryUserPromptContent += `--- ${sessionName} ---\n`;
                comments.forEach((comment) => { summaryUserPromptContent += `- ${comment}\n`; });
                summaryUserPromptContent += "\n";
                sessionsSentToOpenAIForSummary++;
            }
        });

        let analysisResults = {};

        // --- 3. Call OpenAI API for Summary/Categorization (Only if there are comments) --- (Unchanged logic, just renumbered)
        if (sessionsSentToOpenAIForSummary > 0) {
            console.log(`Sending request to OpenAI API for summary/categorization for ${sessionsSentToOpenAIForSummary} sessions...`);
            try {
                const summaryResponse = await openai.chat.completions.create({
                    model: "gpt-4o-mini", messages: [{ role: "system", content: summarySystemPrompt }, { role: "user", content: summaryUserPromptContent }],
                    response_format: { type: "json_object" }, temperature: 0.3, max_tokens: 8192, // Ensure enough tokens
                });
                console.log("Received summary/categorization response from OpenAI API.");
                const choice = summaryResponse.choices[0];
                if (choice.finish_reason === 'length') { processingWarnings.push("Warning: AI summary/categorization might be incomplete (output limit reached)."); }
                else if (choice.finish_reason !== 'stop') { processingWarnings.push(`Warning: AI summary/categorization may have finished unexpectedly (Reason: ${choice.finish_reason}).`); }
                if (!choice?.message?.content) { throw new Error("Invalid response structure received from OpenAI for summary."); }
                try {
                    analysisResults = JSON.parse(choice.message.content);
                    console.log(`Successfully parsed OpenAI summary response for ${Object.keys(analysisResults).length} sessions.`);
                } catch (jsonError) {
                    console.error("Failed to parse JSON summary response from OpenAI:", choice.message.content);
                    processingWarnings.push(`Failed to parse the AI's summary/categorization response as valid JSON. Summary/categorization may be missing. Error: ${jsonError.message}`);
                    analysisResults = {};
                }
            } catch (openaiError) {
                console.error("OpenAI API Error during summary/categorization:", openaiError);
                let errorDetails = openaiError.message || "Unknown AI error";
                if (openaiError.response) { errorDetails = `Status ${openaiError.response.status}: ${JSON.stringify(openaiError.response.data)}`; }
                else if (openaiError.code) { errorDetails = `Code ${openaiError.code}: ${openaiError.message}`; }
                processingWarnings.push(`Failed to analyze feedback using AI: ${errorDetails}. Summary/categorization may be missing.`);
                analysisResults = {};
            }
        } else {
            console.log("No non-trivial comments found in any session, skipping OpenAI summary call.");
            validSessionNames.forEach(name => {
                if (!analysisResults[name]) {
                    analysisResults[name] = { summary: "No non-trivial comments provided for AI analysis.", positiveComments: [], criticalComments: [] };
                }
            });
        }

        // --- 4. Combine ALL Data (Timing, LO Array, AI Analysis) --- (Unchanged logic, just renumbered)
        const finalResults = {};
        validSessionNames.forEach(sessionName => {
            const sessionData = sessionDataMap[sessionName];
            finalResults[sessionName] = analysisResults[sessionName] || {
                 summary: sessionData.comments.length > 0 ? "AI analysis not available." : "No comments provided.",
                 positiveComments: [], criticalComments: []
            };
            finalResults[sessionName].timingCounts = sessionData.timingCounts;
            finalResults[sessionName].learningOutcomes = sessionData.learningOutcomes;
        });


        // --- 5. Prepare Final Response --- (Ensure updated wordCloudData is included)
        const finalResponse = {
            results: finalResults,
            processingWarnings: processingWarnings.length > 0 ? processingWarnings : undefined,
            // Send the wordCloudData that potentially has the sentiment property added
            wordCloudData: wordCloudData.length > 0 ? wordCloudData : undefined
        };

        console.log("Successfully processed feedback, timing data, LO data, generated word cloud data, and performed sentiment analysis.");
        return NextResponse.json(finalResponse);

    } catch (error) {
        console.error("General Server Error in POST handler:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred on the server.", details: error.message },
            { status: 500 }
        );
    }
}