// src/app/test-apps/feedback-processor/api/route.js
import OpenAI from "openai";
import { NextResponse } from "next/server";
import Papa from "papaparse";

const openai = new OpenAI({
  apiKey: process.env.SMO_OPENAI_API_KEY,
});

// --- STOP WORDS LIST ---
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


// Helper function to read file content as text
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

// Helper function to extract session name from filename
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
  console.log("Received request to API route"); // Matched to your path

  try {
    const formData = await request.formData();
    const files = formData.getAll("files");

    if (!files || files.length === 0) {
      console.log("No files found in request.");
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }
    console.log(`Received ${files.length} file(s).`);

    let sessionFeedback = {};
    const errors = []; // Renamed to processingWarnings below
    let allCommentsText = ""; // String to hold ALL comments for word cloud

    // --- 1. Parse CSV files ---
    for (const file of files) {
        console.log(`Processing file: ${file.name}`);
        if (file.type !== "text/csv" && !file.name.toLowerCase().endsWith(".csv")) {
            console.warn(`Skipping non-CSV file: ${file.name} (Type: ${file.type})`);
            errors.push(`Skipped non-CSV file: "${file.name}". Only .csv files are accepted.`);
            continue;
        }

        const sessionName = getSessionName(file.name);
        // Initialize session array here BEFORE the async callback
        if (!sessionFeedback[sessionName]) {
           sessionFeedback[sessionName] = [];
        }

        try {
            const fileContent = await readFileAsText(file);
            if (!fileContent || fileContent.trim().length === 0) {
                console.warn(`File ${file.name} is empty or could not be read properly.`);
                errors.push(`File "${file.name}" is empty or unreadable.`);
                continue;
            }

            // Using a Promise to handle PapaParse's async nature within the loop
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
                                results.errors.forEach(err => errors.push(`Parsing issue in "${file.name}" near row ${err.row}: ${err.message}`));
                            }

                            const feedbackHeader = "Student Feedback";
                            const actualHeaders = results.meta.fields;
                            const feedbackHeaderExists = actualHeaders.some(h => h === feedbackHeader);

                            if (!feedbackHeaderExists) {
                                console.error(`File ${file.name} missing header '${feedbackHeader}'. Found: ${actualHeaders.join(', ')}`);
                                errors.push(`File "${file.name}" missing required column: '${feedbackHeader}'.`);
                                if (sessionFeedback[sessionName]?.length === 0) delete sessionFeedback[sessionName];
                                resolve(); // Resolve promise even if header is missing for this file
                                return;
                            }

                            let commentsFoundInFile = 0;
                            results.data.forEach((row) => {
                                const feedback = row[feedbackHeader]?.trim();
                                if (feedback) {
                                    sessionFeedback[sessionName].push(feedback);
                                    allCommentsText += feedback + " "; // Append for word cloud
                                    commentsFoundInFile++;
                                }
                            });

                            if (commentsFoundInFile === 0 && sessionFeedback[sessionName]?.length === 0) {
                                delete sessionFeedback[sessionName]; // Clean up if no comments found
                                console.log(`No valid feedback comments found in ${file.name}`);
                            }
                            resolve(); // Resolve promise on successful completion
                        } catch (completionError) {
                            console.error(`Error within PapaParse complete callback for ${file.name}:`, completionError);
                            errors.push(`Internal error processing parsed data for ${file.name}`);
                            reject(completionError); // Reject promise on error within callback
                        }
                    },
                    error: (error) => {
                        console.error(`Fatal CSV parsing error in ${file.name}:`, error.message);
                        errors.push(`Failed to parse file "${file.name}": ${error.message}`);
                        if (sessionFeedback[sessionName]?.length === 0) delete sessionFeedback[sessionName];
                        reject(error); // Reject promise on fatal parsing error
                    }
                };
                Papa.parse(fileContent, parseConfig);
            }); // End of Promise wrapper for PapaParse

        } catch (parseOrReadError) {
            console.error(`Error reading or parsing file ${file.name}:`, parseOrReadError);
            // Check if it's a PapaParse error object or a general read error
            const errorMsg = parseOrReadError.message ? parseOrReadError.message : "Unknown read/parse error";
            errors.push(`Failed to process file "${file.name}": ${errorMsg}`);
            // Clean up potentially empty session entry if parsing failed
            if (sessionFeedback[sessionName]?.length === 0) {
               delete sessionFeedback[sessionName];
            }
        }
    } // End of file loop

    const totalCommentsParsed = Object.values(sessionFeedback).reduce((acc, comments) => acc + comments.length, 0);
    console.log(`Finished parsing. Found ${totalCommentsParsed} comments across ${Object.keys(sessionFeedback).length} sessions.`);

    if (Object.keys(sessionFeedback).length === 0) {
         const errorMsg = errors.length > 0 ? "Failed to process files successfully. Issues found: " + errors.join(" ") : "No student feedback could be extracted. Ensure files are valid CSVs with a 'Student Feedback' column containing comments.";
         console.warn("No feedback extracted.", errors);
         return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // --- 1.5 Generate Word Cloud Data ---
    let wordCloudData = [];
    if (allCommentsText.length > 0) {
        try {
            console.log("Generating word cloud data (for react-tagcloud)...");
            const words = allCommentsText
                .toLowerCase()
                .replace(/’/g, "'") // Normalize apostrophes
                .replace(/[^a-z'\s]/g, "") // Keep letters, apostrophes, whitespace
                .replace(/\s+/g, ' ')
                .split(' ');

            const wordCounts = {};
            words.forEach(word => {
                // Trim word in case of extra spaces from regex replacements
                const trimmedWord = word.trim();
                if (trimmedWord && trimmedWord.length > 2 && !STOP_WORDS.has(trimmedWord) && isNaN(trimmedWord)) {
                    wordCounts[trimmedWord] = (wordCounts[trimmedWord] || 0) + 1;
                }
            });

            wordCloudData = Object.entries(wordCounts)
                .map(([text, count]) => ({ value: text, count: count })) // Format for react-tagcloud
                .sort((a, b) => b.count - a.count)
                .slice(0, 25); // Top 100 words

            console.log(`Generated ${wordCloudData.length} words for cloud.`);
        } catch (cloudError) {
            console.error("Error generating word cloud data:", cloudError);
            errors.push("Failed to generate word cloud data.");
        }
    }

    // --- 2. Prepare Prompt for OpenAI ---
    const systemPrompt = `
You are an expert academic feedback analyst. Your task is to process student feedback comments provided for different course sessions.
For EACH session provided in the input:
1.  Write a brief, neutral summary paragraph (2-3 sentences) capturing the main themes of the feedback for that session.
2.  Categorise the comments into 'Positive comments'. List the specific comments that express satisfaction, enjoyment, or highlight strengths.
3.  Categorise the comments into 'Critical comments/Suggestions for improvement'. List the specific comments that express dissatisfaction, confusion, constructive criticism, or suggest changes.

**CRITICAL INSTRUCTIONS:**
*   **VERBATIM REPRODUCTION:** Every single comment listed in the 'positiveComments' and 'criticalComments' arrays MUST be the **exact, complete, and unmodified text** from the original input provided for that session. Do NOT summarize, paraphrase, shorten, or alter the original comments in any way when listing them.
*   **COMPLETE CATEGORIZATION:** Ensure **every original comment** provided for a session is placed verbatim into exactly ONE of the two lists ('positiveComments' or 'criticalComments'). If a comment seems neutral, place it in the category that seems slightly more appropriate or default to 'Critical comments/Suggestions for improvement' if unsure. Do NOT omit any comments.
*   **JSON STRUCTURE:** Structure your entire response as a single, valid JSON object. The keys of this object MUST be the session names provided in the input (e.g., "Session 1", "Session 2", "Unknown Session"). The value for each session key MUST be a JSON object with the following EXACT structure:
    {
      "summary": "string",
      "positiveComments": ["string"],
      "criticalComments": ["string"]
    }
*   **NO EXTRA TEXT:** Do not include any introductory text, concluding remarks, apologies, or any other text outside the main JSON object structure.

Your goal is analysis and categorization, preserving the original feedback text perfectly within the categories.
    `.trim();

    let userPromptContent = "Please analyze the following student feedback comments grouped by session, following all instructions precisely:\n\n";
    // Using Object.entries for potentially more stable iteration order
    Object.entries(sessionFeedback).forEach(([sessionName, comments]) => {
        userPromptContent += `--- ${sessionName} ---\n`;
        comments.forEach((comment) => {
            userPromptContent += `- ${comment}\n`;
        });
        userPromptContent += "\n";
    });

    console.log("Sending request to OpenAI API...");
    // Log prompts if needed for debugging (uncomment)
    // console.log("==================== OpenAI Request Payload ====================");
    // console.log("--- System Prompt ---\n", systemPrompt);
    // console.log("\n--- User Prompt Content ---\n", userPromptContent);
    // console.log("================== END OpenAI Request Payload ==================");


    // --- 3. Call OpenAI API ---
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Or "gpt-4o"
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPromptContent },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 8192,
      });

      console.log("Received response from OpenAI API.");
      const choice = response.choices[0];

      if (choice.finish_reason === 'length') {
          console.warn("OpenAI response truncated (max_tokens reached).");
          errors.push("Warning: AI analysis might be incomplete (output limit reached).");
      } else if (choice.finish_reason !== 'stop') {
          console.warn(`OpenAI response finished unexpectedly: ${choice.finish_reason}`);
          errors.push(`Warning: AI analysis may have finished unexpectedly (Reason: ${choice.finish_reason}).`);
      }

      if (!choice || !choice.message || !choice.message.content) {
        throw new Error("Invalid response structure received from OpenAI.");
      }

      let analysisResults;
      try {
        analysisResults = JSON.parse(choice.message.content);
      } catch (jsonError) {
          console.error("Failed to parse JSON response from OpenAI:", choice.message.content);
          throw new Error(`Failed to parse the AI's response as valid JSON. Error: ${jsonError.message}`);
      }

      // Combine analysis results, warnings, AND word cloud data
      const finalResponse = {
          results: analysisResults,
          processingWarnings: errors.length > 0 ? errors : undefined, // Use the final 'errors' array here
          wordCloudData: wordCloudData.length > 0 ? wordCloudData : undefined // Add word cloud data
      };

      console.log("Successfully processed feedback and generated word cloud data.");
      return NextResponse.json(finalResponse);

    } catch (openaiError) {
      console.error("OpenAI API Error:", openaiError);
      let errorDetails = openaiError.message || "Unknown AI error";
       if (openaiError.response) {
           errorDetails = `Status ${openaiError.response.status}: ${JSON.stringify(openaiError.response.data)}`;
       } else if (openaiError.code) {
           errorDetails = `Code ${openaiError.code}: ${openaiError.message}`;
       }
       const previousErrors = errors.length > 0 ? " Previous file processing issues: " + errors.join(" ") : "";
       const errorMsg = `Failed to analyze feedback using AI. ${errorDetails}${previousErrors}`;
       return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

  } catch (error) {
    console.error("General Server Error in POST handler:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred on the server.", details: error.message },
      { status: 500 }
    );
  }
}