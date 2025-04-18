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
    "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
    "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too",
    "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't",
    "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves",
    // Domain-specific words (customize as needed)
    "n/a", "na", "-", "module", "session", "also", "get", "bit", "lot", "really", "think", "will", "well", "much", "good", "great", "like", "feel", "found", "very", "quite", "especially", "content", "learn", "learning", "understand", "understanding", "useful", "helpful", "enjoyed", "interesting", "informative", "would", "could"
]);

// --- Configuration Constants ---
const STUDENT_ID_HEADER = 'Student Id';
const TIMING_COLUMN_HEADER = 'Timing';
const FEEDBACK_COLUMN_HEADER = 'Student Feedback';
const OMIT_COMMENT_STRINGS = new Set(['none', 'n/a', '-']);

// --- Constants for Timing Responses ---
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

    // --- 1. Parse CSV files ---
    for (const file of files) {
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
                // CHANGE: Initialize learningOutcomes as an array to preserve order
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
                    dynamicTyping: false,
                    quotes: true,
                    escapeChar: '"',
                    transformHeader: header => header.trim(),
                    complete: (results) => {
                        try {
                            if (results.errors.length > 0) {
                                console.warn(`CSV parsing warnings/errors in ${file.name}:`, results.errors);
                                results.errors.forEach(err => processingWarnings.push(`Parsing issue in "${file.name}" near row ${err.row}: ${err.message}`));
                            }

                            const actualHeaders = results.meta.fields;
                            if (!actualHeaders || actualHeaders.length === 0) {
                                processingWarnings.push(`Could not parse headers for file "${file.name}". Skipping file.`);
                                reject(new Error(`No headers found in ${file.name}`));
                                return;
                            }

                            // --- Find Key Column Indices ---
                            let studentIdIndex = -1;
                            let timingIndex = -1;
                            let feedbackIndex = -1;
                            actualHeaders.forEach((header, index) => {
                                if (header === STUDENT_ID_HEADER) studentIdIndex = index;
                                if (header === TIMING_COLUMN_HEADER) timingIndex = index;
                                if (header === FEEDBACK_COLUMN_HEADER) feedbackIndex = index;
                            });

                            sessionDataMap[sessionName].parsingInfo.foundStudentId = studentIdIndex !== -1;
                            sessionDataMap[sessionName].parsingInfo.foundTiming = timingIndex !== -1;
                            sessionDataMap[sessionName].parsingInfo.foundFeedback = feedbackIndex !== -1;

                            // --- Identify and Clean Learning Outcome Columns ---
                            let originalLoHeaders = []; // Keep original headers for row lookups
                            let cleanedLoHeaders = []; // Store cleaned headers for keys/display
                            if (studentIdIndex !== -1 && timingIndex !== -1 && studentIdIndex < timingIndex) {
                                originalLoHeaders = actualHeaders.slice(studentIdIndex + 1, timingIndex);
                                // Clean headers (remove trailing '\.')
                                cleanedLoHeaders = originalLoHeaders.map(h => h.replace(/\\\.$/, '').trim());
                                sessionDataMap[sessionName].parsingInfo.loColumnsIdentified = originalLoHeaders.length;

                                // CHANGE: Initialize the learningOutcomes array with cleaned headers preserving order
                                sessionDataMap[sessionName].learningOutcomes = cleanedLoHeaders.map(header => ({
                                    loHeader: header,
                                    responses: {}
                                }));

                                if (originalLoHeaders.length === 0) {
                                    processingWarnings.push(`No columns found between "${STUDENT_ID_HEADER}" and "${TIMING_COLUMN_HEADER}" in "${file.name}" for Learning Outcomes.`);
                                }
                            } else {
                                processingWarnings.push(`Could not identify Learning Outcome columns in "${file.name}". Requires both "${STUDENT_ID_HEADER}" and "${TIMING_COLUMN_HEADER}" columns to be present in the correct order.`);
                            }

                            // --- Issue Header Warnings --- (Unchanged)
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
                            results.data.forEach((row) => {
                                // Process Feedback (if header exists & not omitted)
                                if (sessionDataMap[sessionName].parsingInfo.foundFeedback) {
                                    const feedback = row[FEEDBACK_COLUMN_HEADER]?.trim();
                                    if (feedback && !OMIT_COMMENT_STRINGS.has(feedback.toLowerCase())) {
                                        sessionDataMap[sessionName].comments.push(feedback);
                                        allCommentsText += feedback + " ";
                                        commentsFoundInFile++;
                                    } else if (feedback) {
                                        // console.log(`Skipping comment "${feedback}" in ${file.name} as it matches omit list.`);
                                    }
                                }

                                // Process Timing (if header exists)
                                if (sessionDataMap[sessionName].parsingInfo.foundTiming) {
                                    const timingResponse = row[TIMING_COLUMN_HEADER]?.trim();
                                    if (timingResponse) {
                                        switch (timingResponse) {
                                            case TIMING_LESS: sessionDataMap[sessionName].timingCounts.less++; break;
                                            case TIMING_MORE: sessionDataMap[sessionName].timingCounts.more++; break;
                                            case TIMING_SAME: sessionDataMap[sessionName].timingCounts.same++; break;
                                        }
                                    }
                                }

                                // Process Learning Outcomes (using the ordered array)
                                if (originalLoHeaders.length > 0) {
                                    // Iterate using original headers to look up row data
                                    originalLoHeaders.forEach((originalHeader, index) => {
                                        const loResponse = row[originalHeader]?.trim(); // Use original header for lookup
                                        if (loResponse) {
                                            // Get the corresponding LO object from the ordered array using index
                                            const loEntry = sessionDataMap[sessionName].learningOutcomes[index];
                                            // Ensure responses object exists (should already from initialization)
                                            if (loEntry) {
                                                 // Ensure response key exists and increment count
                                                const currentCount = loEntry.responses[loResponse] || 0;
                                                loEntry.responses[loResponse] = currentCount + 1;
                                            } else {
                                                // Should not happen if initialization is correct, but good to log
                                                console.error(`Error: Could not find LO entry at index ${index} for header ${originalHeader} in file ${file.name}`);
                                            }
                                        }
                                    });
                                }
                            });

                            console.log(`File "${file.name}": Found ${commentsFoundInFile} comments, ${sessionDataMap[sessionName].parsingInfo.loColumnsIdentified} LO columns.`);
                            resolve();
                        } catch (completionError) {
                            console.error(`Error within PapaParse complete callback for ${file.name}:`, completionError);
                            processingWarnings.push(`Internal error processing parsed data for ${file.name}`);
                            reject(completionError);
                        }
                    },
                    error: (error) => {
                        console.error(`Fatal CSV parsing error in ${file.name}:`, error.message);
                        processingWarnings.push(`Failed to parse file "${file.name}": ${error.message}`);
                        reject(error);
                    }
                };
                Papa.parse(fileContent, parseConfig);
            }); // End of Promise wrapper for PapaParse

        } catch (parseOrReadError) {
            console.error(`Error reading or parsing file ${file.name}:`, parseOrReadError);
            const errorMsg = parseOrReadError.message ? parseOrReadError.message : "Unknown read/parse error";
            processingWarnings.push(`Failed to process file "${file.name}": ${errorMsg}`);
        }
    } // End of file loop

    // --- Filter out sessions that ended up with no usable data ---
    const validSessionNames = Object.keys(sessionDataMap).filter(name =>
        sessionDataMap[name].comments.length > 0 ||
        sessionDataMap[name].timingCounts.less > 0 ||
        sessionDataMap[name].timingCounts.more > 0 ||
        sessionDataMap[name].timingCounts.same > 0 ||
        // Check if the learningOutcomes array has entries
        sessionDataMap[name].learningOutcomes.length > 0
    );

    if (validSessionNames.length === 0) {
         const errorMsg = processingWarnings.length > 0 ? "Failed to process files or extract data. Issues found: " + processingWarnings.join(" ") : "No student feedback, timing, or learning outcome data could be extracted. Ensure files are valid CSVs with required columns ('Student Id', 'Timing', 'Student Feedback') and potentially Learning Outcome columns between 'Student Id' and 'Timing'.";
         console.warn("No usable feedback or other data extracted.", processingWarnings);
         return NextResponse.json({ error: errorMsg, processingWarnings: processingWarnings.length > 0 ? processingWarnings : undefined }, { status: 400 });
    }

    console.log(`Finished parsing. Found data for ${validSessionNames.length} sessions.`);

    // --- 1.5 Generate Word Cloud Data (Limit to 50 words) --- (Unchanged)
    let wordCloudData = [];
    if (allCommentsText.length > 0) {
        try {
            console.log("Generating word cloud data (max 50 words)...");
            const words = allCommentsText.toLowerCase().replace(/’/g, "'").replace(/[^a-z'\s]/g, "").replace(/\s+/g, ' ').split(' ');
            const wordCounts = {};
            words.forEach(word => {
                const trimmedWord = word.trim();
                if (trimmedWord && trimmedWord.length > 2 && !STOP_WORDS.has(trimmedWord) && isNaN(trimmedWord)) {
                    wordCounts[trimmedWord] = (wordCounts[trimmedWord] || 0) + 1;
                }
            });
            wordCloudData = Object.entries(wordCounts).map(([text, count]) => ({ value: text, count: count })).sort((a, b) => b.count - a.count).slice(0, 50);
            console.log(`Generated ${wordCloudData.length} words for cloud.`);
        } catch (cloudError) {
            console.error("Error generating word cloud data:", cloudError);
            processingWarnings.push("Failed to generate word cloud data.");
        }
    }

    // --- 2. Prepare Prompt for OpenAI (Only use comments) --- (Unchanged - Prompt text already updated)
    const systemPrompt = `
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

    let userPromptContent = "Please analyze the following student feedback comments grouped by session, following all instructions precisely:\n\n";
    let sessionsSentToOpenAI = 0;
    validSessionNames.forEach((sessionName) => {
        const comments = sessionDataMap[sessionName]?.comments;
        if (comments && comments.length > 0) {
            userPromptContent += `--- ${sessionName} ---\n`;
            comments.forEach((comment) => { userPromptContent += `- ${comment}\n`; });
            userPromptContent += "\n";
            sessionsSentToOpenAI++;
        } else {
            // console.log(`Session ${sessionName} has no comments to send for AI analysis.`);
        }
    });

    let analysisResults = {};

    // --- 3. Call OpenAI API (Only if there are comments) --- (Unchanged)
    if (sessionsSentToOpenAI > 0) {
        console.log(`Sending request to OpenAI API for ${sessionsSentToOpenAI} sessions...`);
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPromptContent }],
                response_format: { type: "json_object" }, temperature: 0.3, max_tokens: 8192,
            });
            console.log("Received response from OpenAI API.");
            const choice = response.choices[0];
            if (choice.finish_reason === 'length') { processingWarnings.push("Warning: AI analysis might be incomplete (output limit reached)."); }
            else if (choice.finish_reason !== 'stop') { processingWarnings.push(`Warning: AI analysis may have finished unexpectedly (Reason: ${choice.finish_reason}).`); }
            if (!choice?.message?.content) { throw new Error("Invalid response structure received from OpenAI."); }
            try {
                analysisResults = JSON.parse(choice.message.content);
                console.log(`Successfully parsed OpenAI response for ${Object.keys(analysisResults).length} sessions.`);
            } catch (jsonError) {
                console.error("Failed to parse JSON response from OpenAI:", choice.message.content);
                processingWarnings.push(`Failed to parse the AI's response as valid JSON. Summary/categorization may be missing. Error: ${jsonError.message}`);
                analysisResults = {};
            }
        } catch (openaiError) {
            console.error("OpenAI API Error:", openaiError);
            let errorDetails = openaiError.message || "Unknown AI error";
            if (openaiError.response) { errorDetails = `Status ${openaiError.response.status}: ${JSON.stringify(openaiError.response.data)}`; }
            else if (openaiError.code) { errorDetails = `Code ${openaiError.code}: ${openaiError.message}`; }
            processingWarnings.push(`Failed to analyze feedback using AI: ${errorDetails}. Summary/categorization may be missing.`);
            analysisResults = {};
        }
    } else {
        console.log("No non-trivial comments found in any session, skipping OpenAI call.");
        validSessionNames.forEach(name => {
            if (!analysisResults[name]) {
                analysisResults[name] = { summary: "No non-trivial comments provided for AI analysis.", positiveComments: [], criticalComments: [] };
            }
        });
    }

    // --- 4. Combine ALL Data (Timing, LO Array, AI Analysis) ---
    const finalResults = {};
    validSessionNames.forEach(sessionName => {
        const sessionData = sessionDataMap[sessionName];
        finalResults[sessionName] = analysisResults[sessionName] || {
             summary: sessionData.comments.length > 0 ? "AI analysis not available." : "No comments provided.",
             positiveComments: [], criticalComments: []
        };
        finalResults[sessionName].timingCounts = sessionData.timingCounts;
        // Assign the learningOutcomes array directly
        finalResults[sessionName].learningOutcomes = sessionData.learningOutcomes;
    });


    // --- 5. Prepare Final Response ---
    const finalResponse = {
        results: finalResults,
        processingWarnings: processingWarnings.length > 0 ? processingWarnings : undefined,
        wordCloudData: wordCloudData.length > 0 ? wordCloudData : undefined
    };

    console.log("Successfully processed feedback, timing data, LO data (ordered), and generated word cloud data.");
    // console.log("Final response being sent:", JSON.stringify(finalResponse, null, 2));
    return NextResponse.json(finalResponse);

  } catch (error) {
    console.error("General Server Error in POST handler:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred on the server.", details: error.message },
      { status: 500 }
    );
  }
}