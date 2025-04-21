// src/app/test-apps/feedback-processor/api/route.js
import OpenAI from "openai";
import { NextResponse } from "next/server";
// REMOVED: import Papa from "papaparse"; // No longer needed on backend

const openai = new OpenAI({
    apiKey: process.env.SMO_OPENAI_API_KEY,
});

// REMOVED: STOP_WORDS (Frontend handles word cloud generation now)
// REMOVED: Configuration Constants (STUDENT_ID_HEADER, TIMING_COLUMN_HEADER, etc. - Frontend handles parsing)
// REMOVED: readFileAsText helper
// REMOVED: getSessionName helper (Session name comes from frontend)

export async function POST(request) {
    console.log("Received request to API route (expecting pre-processed data)");

    try {
        // --- 1. Get Pre-processed Data from Frontend ---
        // Read JSON body instead of FormData
        const payload = await request.json();
        const { sessionData, wordCloudDataInput } = payload;

        if (!sessionData || Object.keys(sessionData).length === 0) {
            console.log("No pre-processed session data received from frontend.");
            // Note: Frontend should ideally prevent sending empty data
            return NextResponse.json({ error: "No session data received for analysis." }, { status: 400 });
        }
        if (!wordCloudDataInput) {
             console.log("No word cloud input data received from frontend.");
             // Allow proceeding without word cloud if comments were empty
        }

        console.log(`Received pre-processed data for ${Object.keys(sessionData).length} sessions.`);
        const processingWarnings = []; // Initialize warnings for backend processing

        // --- 2. Call OpenAI for Word Cloud Sentiment Analysis (if applicable) ---
        let finalWordCloudData = null; // Will hold { value, count, sentiment }

        // Extract just the words for the sentiment prompt
        const wordsToAnalyze = wordCloudDataInput && wordCloudDataInput.length > 0
                             ? wordCloudDataInput.map(tag => tag.value)
                             : [];

        if (wordsToAnalyze.length > 0) {
            console.log(`Sending ${wordsToAnalyze.length} words to OpenAI for sentiment analysis...`);
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

            const sentimentUserPrompt = JSON.stringify(wordsToAnalyze);

            try {
                const sentimentResponse = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: sentimentSystemPrompt },
                        { role: "user", content: sentimentUserPrompt }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.1,
                    max_tokens: 1024,
                });
                console.log("Received sentiment analysis response from OpenAI.");

                const sentimentChoice = sentimentResponse.choices[0];
                if (!sentimentChoice?.message?.content) {
                    throw new Error("Invalid sentiment response structure received from OpenAI.");
                }

                try {
                    const wordSentiments = JSON.parse(sentimentChoice.message.content);
                    console.log(`Successfully parsed OpenAI sentiment response.`);

                    // Merge sentiment back into the original wordCloudDataInput structure
                    finalWordCloudData = wordCloudDataInput.map(tag => {
                        const sentiment = wordSentiments[tag.value];
                        if (["positive", "negative", "neutral"].includes(sentiment)) {
                            return { ...tag, sentiment: sentiment }; // Add sentiment
                        } else {
                            console.warn(`Word "${tag.value}" not found or invalid sentiment: ${sentiment}. Defaulting to neutral.`);
                            return { ...tag, sentiment: "neutral" };
                        }
                    });
                    console.log("Merged sentiment data into word cloud data.");

                } catch (jsonError) {
                    console.error("Failed to parse JSON sentiment response from OpenAI:", sentimentChoice.message.content);
                    processingWarnings.push(`Failed to parse word sentiment analysis response. Word cloud colors may be default. Error: ${jsonError.message}`);
                    // Assign default sentiment if parsing fails, but keep original data
                    finalWordCloudData = wordCloudDataInput.map(tag => ({ ...tag, sentiment: "neutral" }));
                }

            } catch (sentimentOpenaiError) {
                console.error("OpenAI API Error during sentiment analysis:", sentimentOpenaiError);
                processingWarnings.push(`Failed to get word sentiment analysis from AI: ${sentimentOpenaiError.message || 'Unknown AI error'}. Word cloud colors may be default.`);
                // Assign default sentiment if API fails
                finalWordCloudData = wordCloudDataInput.map(tag => ({ ...tag, sentiment: "neutral" }));
            }
        } else {
             console.log("No words provided for sentiment analysis.");
             finalWordCloudData = []; // Ensure it's an empty array if no input
        }


        // --- 3. Prepare Prompt for OpenAI (Feedback Summary/Categorization) ---
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
        const sessionNames = Object.keys(sessionData);

        sessionNames.forEach((sessionName) => {
            // Access comments directly from the received sessionData
            const comments = sessionData[sessionName]?.comments;
            if (comments && comments.length > 0) {
                summaryUserPromptContent += `--- ${sessionName} ---\n`;
                comments.forEach((comment) => { summaryUserPromptContent += `- ${comment}\n`; });
                summaryUserPromptContent += "\n";
                sessionsSentToOpenAIForSummary++;
            } else {
                 console.log(`Session ${sessionName} has no comments received from frontend.`);
            }
        });

        let aiAnalysisResults = {}; // Store results from the summary/categorization AI

        // --- 4. Call OpenAI API for Summary/Categorization (Only if there are comments) ---
        if (sessionsSentToOpenAIForSummary > 0) {
            console.log(`Sending request to OpenAI API for summary/categorization for ${sessionsSentToOpenAIForSummary} sessions...`);
            try {
                const summaryResponse = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: summarySystemPrompt },
                        { role: "user", content: summaryUserPromptContent }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.3,
                    max_tokens: 8192,
                });
                console.log("Received summary/categorization response from OpenAI API.");
                const choice = summaryResponse.choices[0];
                if (choice.finish_reason === 'length') processingWarnings.push("Warning: AI summary/categorization might be incomplete (output limit reached).");
                else if (choice.finish_reason !== 'stop') processingWarnings.push(`Warning: AI summary/categorization may have finished unexpectedly (Reason: ${choice.finish_reason}).`);

                if (!choice?.message?.content) {
                    throw new Error("Invalid response structure received from OpenAI for summary.");
                }
                try {
                    aiAnalysisResults = JSON.parse(choice.message.content);
                    console.log(`Successfully parsed OpenAI summary response for ${Object.keys(aiAnalysisResults).length} sessions.`);
                } catch (jsonError) {
                    console.error("Failed to parse JSON summary response from OpenAI:", choice.message.content);
                    processingWarnings.push(`Failed to parse the AI's summary/categorization response. Summary/categorization may be missing. Error: ${jsonError.message}`);
                    aiAnalysisResults = {}; // Reset on parse failure
                }
            } catch (openaiError) {
                console.error("OpenAI API Error during summary/categorization:", openaiError);
                processingWarnings.push(`Failed to analyze feedback using AI: ${openaiError.message || 'Unknown AI error'}. Summary/categorization may be missing.`);
                aiAnalysisResults = {}; // Reset on API failure
            }
        } else {
            console.log("No non-trivial comments received to send for OpenAI summary call.");
            // Create default empty structures if no comments were sent
            sessionNames.forEach(name => {
                 aiAnalysisResults[name] = { summary: "No comments provided for analysis.", positiveComments: [], criticalComments: [] };
            });
        }

        // --- 5. Combine ALL Data (Timing/LO from Frontend + AI Results) ---
        const finalResults = {};
        sessionNames.forEach(sessionName => {
            const frontendData = sessionData[sessionName];
            const aiData = aiAnalysisResults[sessionName] || { // Use AI data or fallback
                 summary: frontendData.comments.length > 0 ? "AI analysis not available for this session." : "No comments provided for analysis.",
                 positiveComments: [],
                 criticalComments: []
            };

            finalResults[sessionName] = {
                // Data from AI analysis
                summary: aiData.summary,
                positiveComments: aiData.positiveComments,
                criticalComments: aiData.criticalComments,
                // Data originally processed on the frontend
                timingCounts: frontendData.timingCounts,
                learningOutcomes: frontendData.learningOutcomes,
            };
        });

        // --- 6. Prepare Final Response ---
        const finalResponse = {
            results: finalResults,
            processingWarnings: processingWarnings.length > 0 ? processingWarnings : undefined,
            wordCloudData: finalWordCloudData // Send the word cloud data with sentiment added (or default)
        };

        console.log("Successfully processed feedback, combined with AI analysis results.");
        return NextResponse.json(finalResponse);

    } catch (error) {
        // Catch errors in backend processing (e.g., JSON parsing failure)
        console.error("General Server Error in POST handler:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred on the server.", details: error.message },
            { status: 500 }
        );
    }
}