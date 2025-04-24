// src/app/test-apps/feedback-processor-clientside/api/route.js
import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
    apiKey: process.env.SMO_OPENAI_API_KEY,
});

// --- Prompts ---

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

const refineSystemPrompt = `
You are a feedback refinement assistant. You will receive a JSON object where keys are session names and values are objects containing 'positiveComments' and 'criticalComments' lists.
Your task is to analyze EACH comment list ('positiveComments' and 'criticalComments') for EACH session to filter out comments that lack specific substance or actionable detail, aiming to keep only the more informative feedback.

**Criteria for REMOVAL:**

1.  **Very Short & Non-Substantive:** Remove comments that are extremely short (e.g., 1-3 words) AND clearly lack substance.
    *   Examples: "ok", "good", "yes", "no", "fine", "great", "thanks", "none", "N/A", single emojis, "all good", "nothing", "it was ok", "no comment", "agreed", "+1".

2.  **Generic Praise/Positives:** Remove comments, even if longer, that consist *only* of general positive sentiment or praise *without mentioning specific aspects*, examples, or details about *why* it was good.
    *   Examples: "The material was clear and insightful.", "This is new information but well explained", "Thank you for this cohesive introductory module", "Great content and easy-to-follow material!", "The content and readings are very informative.", "Thank you for a very interesting session!", "The content covered was very insightful.", "Well structured.", "Very clear.", "Enjoyed it.", "Helpful session.", "Learned a lot.".

3.  **Generic Criticism (Less Common but possible):** Similarly, remove very generic negative comments if they offer no specifics (e.g., "It was bad", "Confusing", "Didn't like it").

**Criteria for KEEPING:**

*   Keep comments that offer **specific feedback**, mention **particular examples, topics, slides, or activities**, identify **specific strengths or weaknesses**, suggest **concrete improvements**, describe a specific **learning experience or difficulty**, or provide **unique insights or perspectives** beyond simple agreement or general praise/criticism.
*   Even relatively brief comments should be KEPT if they contain a specific point (e.g., "Slide 5 was confusing", "Liked the group activity", "Pacing was too fast", "Need more practical examples", "The reading on X was excellent").
*   **Err on the side of keeping a comment if you are unsure**, unless it clearly falls into the removal categories above (very short/non-substantive or purely generic praise).

**CRITICAL INSTRUCTIONS:**

*   **VERBATIM PRESERVATION:** Comments you decide to KEEP must be returned **exactly** as they were provided in the input, without any modification, summarization, or alteration. Preserve original capitalization and punctuation.
*   **STRUCTURED JSON RESPONSE:** Respond ONLY with a single, valid JSON object. The keys MUST be the exact session names from the input. The value for each session key MUST be an object with the keys 'positiveComments' and 'criticalComments', containing lists of the *kept* verbatim comments.
*   **COMPLETE COVERAGE:** Process all sessions provided in the input. If a session's comment list becomes empty after filtering, return empty lists (e.g., "positiveComments": []).
*   **NO EXTRA TEXT:** Do not include any explanations, introductions, apologies, or text outside the main JSON object structure.

Your goal is to filter aggressively for comments containing specific substance or actionable feedback, removing both the extremely short non-comments AND the purely generic statements, while preserving the exact text of the remaining, more valuable feedback.
`.trim();



// --- Main POST Handler ---
export async function POST(request) {
    console.log("Received request to API route");

    try {
        const payload = await request.json();
        const action = payload.action; // Check if an action is specified

        // --- Route 1: Handle Refinement Request ---
        if (action === 'refine') {
            console.log("--> Detected 'refine' action");
            const { commentsToRefine } = payload;

            if (!commentsToRefine || Object.keys(commentsToRefine).length === 0) {
                console.log("No comments received for refinement.");
                return NextResponse.json({ error: "No comments data received for refinement." }, { status: 400 });
            }

            const sessionNames = Object.keys(commentsToRefine);
            console.log(`Received comments for refinement from ${sessionNames.length} sessions.`);

            const refineUserPromptContent = "Please refine the following comments based precisely on the system instructions:\n\n" + JSON.stringify(commentsToRefine, null, 2);

            let refinedCommentsData = {};
            let refinementWarnings = [];

            console.log(`Sending request to OpenAI API for comment refinement...`);
            try {
                const refineResponse = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: refineSystemPrompt },
                        { role: "user", content: refineUserPromptContent }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.1,
                    max_tokens: 4096,
                });
                console.log("Received refinement response from OpenAI API.");

                const choice = refineResponse.choices[0];
                if (choice.finish_reason === 'length') refinementWarnings.push("Warning: AI refinement might be incomplete (output limit reached).");
                else if (choice.finish_reason !== 'stop') refinementWarnings.push(`Warning: AI refinement may have finished unexpectedly (Reason: ${choice.finish_reason}).`);

                if (!choice?.message?.content) {
                    throw new Error("Invalid response structure received from OpenAI for refinement.");
                }

                try {
                    const parsedRefinement = JSON.parse(choice.message.content);
                    console.log(`Successfully parsed OpenAI refinement response.`);

                     // Validate and structure the output, falling back to original if session is missing
                    refinedCommentsData = {};
                    sessionNames.forEach(name => {
                        const refinedSession = parsedRefinement[name];
                        if (refinedSession && Array.isArray(refinedSession.positiveComments) && Array.isArray(refinedSession.criticalComments)) {
                             refinedCommentsData[name] = {
                                 positiveComments: refinedSession.positiveComments,
                                 criticalComments: refinedSession.criticalComments
                             };
                        } else {
                            console.warn(`Session "${name}" missing or invalid in refinement output. Using original comments.`);
                            refinementWarnings.push(`Refinement data for session "${name}" was missing or invalid; original comments kept.`);
                            refinedCommentsData[name] = {
                                positiveComments: commentsToRefine[name]?.positiveComments || [],
                                criticalComments: commentsToRefine[name]?.criticalComments || []
                            };
                        }
                    });

                } catch (jsonError) {
                    console.error("Failed to parse JSON refinement response from OpenAI:", choice.message.content);
                    refinementWarnings.push(`Failed to parse the AI's refinement response. Comments remain unrefined. Error: ${jsonError.message}`);
                    refinedCommentsData = commentsToRefine; // Fallback to original on parse error
                }

            } catch (openaiError) {
                console.error("OpenAI API Error during refinement:", openaiError);
                refinementWarnings.push(`Failed to refine comments using AI: ${openaiError.message || 'Unknown AI error'}. Comments remain unrefined.`);
                refinedCommentsData = commentsToRefine; // Fallback to original on API error
            }

            // --- Prepare and Send Refinement Response ---
            const finalResponse = {
                refinedComments: refinedCommentsData,
                refinementWarnings: refinementWarnings.length > 0 ? refinementWarnings : undefined,
            };
            console.log("Sending refinement results back to client.");
            return NextResponse.json(finalResponse);
        }

        // --- Route 2: Handle Initial Analysis Request (Default) ---
        else {
            console.log("--> Performing initial analysis");
            const { sessionData, wordCloudDataInput } = payload;

            if (!sessionData || Object.keys(sessionData).length === 0) {
                console.log("No pre-processed session data received from frontend.");
                return NextResponse.json({ error: "No session data received for analysis." }, { status: 400 });
            }
            // Note: wordCloudDataInput can be null/empty if no comments

            console.log(`Received pre-processed data for ${Object.keys(sessionData).length} sessions.`);
            const processingWarnings = []; // Initialize warnings for this analysis run

            // --- 2a. Call OpenAI for Word Cloud Sentiment Analysis (if applicable) ---
            let finalWordCloudData = null;
            const wordsToAnalyze = wordCloudDataInput && wordCloudDataInput.length > 0
                                 ? wordCloudDataInput.map(tag => tag.value)
                                 : [];

            if (wordsToAnalyze.length > 0) {
                console.log(`Sending ${wordsToAnalyze.length} words to OpenAI for sentiment analysis...`);
                const sentimentUserPrompt = JSON.stringify(wordsToAnalyze);

                try {
                    const sentimentResponse = await openai.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [ { role: "system", content: sentimentSystemPrompt }, { role: "user", content: sentimentUserPrompt } ],
                        response_format: { type: "json_object" }, temperature: 0.1, max_tokens: 1024,
                    });
                    console.log("Received sentiment analysis response from OpenAI.");
                    const sentimentChoice = sentimentResponse.choices[0];
                    if (!sentimentChoice?.message?.content) throw new Error("Invalid sentiment response structure.");

                    try {
                        const wordSentiments = JSON.parse(sentimentChoice.message.content);
                        console.log(`Successfully parsed OpenAI sentiment response.`);
                        finalWordCloudData = wordCloudDataInput.map(tag => {
                            const sentiment = wordSentiments[tag.value];
                            if (["positive", "negative", "neutral"].includes(sentiment)) { return { ...tag, sentiment: sentiment }; }
                            else { console.warn(`Word "${tag.value}" not found or invalid sentiment: ${sentiment}. Defaulting to neutral.`); return { ...tag, sentiment: "neutral" }; }
                        });
                        console.log("Merged sentiment data into word cloud data.");
                    } catch (jsonError) {
                        console.error("Failed to parse JSON sentiment response from OpenAI:", sentimentChoice.message.content);
                        processingWarnings.push(`Failed to parse word sentiment analysis. Word cloud colors may be default. Error: ${jsonError.message}`);
                        finalWordCloudData = wordCloudDataInput.map(tag => ({ ...tag, sentiment: "neutral" })); // Default on parse failure
                    }
                } catch (sentimentOpenaiError) {
                    console.error("OpenAI API Error during sentiment analysis:", sentimentOpenaiError);
                    processingWarnings.push(`Failed to get word sentiment analysis: ${sentimentOpenaiError.message || 'Unknown AI error'}. Word cloud colors may be default.`);
                    finalWordCloudData = wordCloudDataInput.map(tag => ({ ...tag, sentiment: "neutral" })); // Default on API failure
                }
            } else {
                 console.log("No words provided for sentiment analysis.");
                 finalWordCloudData = []; // Ensure empty array if no input
            }

            // --- 2b. Prepare Prompt for OpenAI (Feedback Summary/Categorization) ---
            let summaryUserPromptContent = "Please analyze the following student feedback comments grouped by session, following all instructions precisely:\n\n";
            let sessionsSentToOpenAIForSummary = 0;
            const sessionNames = Object.keys(sessionData);

            sessionNames.forEach((sessionName) => {
                const comments = sessionData[sessionName]?.comments;
                if (comments && comments.length > 0) {
                    summaryUserPromptContent += `--- ${sessionName} ---\n`;
                    comments.forEach((comment) => { summaryUserPromptContent += `- ${comment}\n`; });
                    summaryUserPromptContent += "\n";
                    sessionsSentToOpenAIForSummary++;
                } else { console.log(`Session ${sessionName} has no comments received.`); }
            });

            let aiAnalysisResults = {};

            // --- 2c. Call OpenAI API for Summary/Categorization (Only if there are comments) ---
            if (sessionsSentToOpenAIForSummary > 0) {
                console.log(`Sending request to OpenAI API for summary/categorization for ${sessionsSentToOpenAIForSummary} sessions...`);
                try {
                    const summaryResponse = await openai.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [ { role: "system", content: summarySystemPrompt }, { role: "user", content: summaryUserPromptContent } ],
                        response_format: { type: "json_object" }, temperature: 0.3, max_tokens: 8192, // Increased max_tokens
                    });
                    console.log("Received summary/categorization response from OpenAI API.");
                    const choice = summaryResponse.choices[0];
                    if (choice.finish_reason === 'length') processingWarnings.push("Warning: AI summary/categorization might be incomplete (output limit reached).");
                    else if (choice.finish_reason !== 'stop') processingWarnings.push(`Warning: AI summary/categorization finished unexpectedly (Reason: ${choice.finish_reason}).`);

                    if (!choice?.message?.content) throw new Error("Invalid response structure for summary.");

                    try {
                        aiAnalysisResults = JSON.parse(choice.message.content);
                        console.log(`Successfully parsed OpenAI summary response for ${Object.keys(aiAnalysisResults).length} sessions.`);
                         // Add validation/fallback for missing sessions in AI response
                        sessionNames.forEach(name => {
                            if (!aiAnalysisResults[name] && sessionData[name]?.comments?.length > 0) {
                                console.warn(`AI summary response missing data for session: ${name}. Providing fallback.`);
                                processingWarnings.push(`AI analysis data missing for session: ${name}.`);
                                aiAnalysisResults[name] = { summary: "AI analysis failed for this session.", positiveComments: [], criticalComments: sessionData[name].comments }; // Put all comments in critical as fallback
                            } else if (!aiAnalysisResults[name]) {
                                // Handle case where session had no comments originally
                                 aiAnalysisResults[name] = { summary: "No comments provided for analysis.", positiveComments: [], criticalComments: [] };
                            }
                        });

                    } catch (jsonError) {
                        console.error("Failed to parse JSON summary response from OpenAI:", choice.message.content);
                        processingWarnings.push(`Failed to parse AI summary/categorization response. Error: ${jsonError.message}`);
                        aiAnalysisResults = {}; // Reset on parse failure
                    }
                } catch (openaiError) {
                    console.error("OpenAI API Error during summary/categorization:", openaiError);
                    processingWarnings.push(`Failed to analyze feedback using AI: ${openaiError.message || 'Unknown AI error'}.`);
                    aiAnalysisResults = {}; // Reset on API failure
                }
            } else {
                console.log("No non-trivial comments received to send for OpenAI summary call.");
                 // Create default empty structures if no comments were sent
                 sessionNames.forEach(name => {
                     aiAnalysisResults[name] = { summary: "No comments provided for analysis.", positiveComments: [], criticalComments: [] };
                 });
            }

            // --- 2d. Combine ALL Data (Timing/LO from Frontend + AI Results) ---
            const finalResults = {};
            sessionNames.forEach(sessionName => {
                const frontendData = sessionData[sessionName]; // Includes comments, timing, LOs
                // Use AI results if available, otherwise create fallback structure
                const aiData = aiAnalysisResults[sessionName] || {
                     summary: frontendData?.comments?.length > 0 ? "AI analysis not available for this session." : "No comments provided for analysis.",
                     positiveComments: [],
                     // If AI fails completely, put all original comments here as a fallback
                     criticalComments: (!aiAnalysisResults[sessionName] && frontendData?.comments?.length > 0) ? frontendData.comments : []
                };

                finalResults[sessionName] = {
                    // Data from AI analysis (or fallback)
                    summary: aiData.summary,
                    positiveComments: aiData.positiveComments,
                    criticalComments: aiData.criticalComments,
                    // Data originally processed on the frontend
                    timingCounts: frontendData.timingCounts,
                    learningOutcomes: frontendData.learningOutcomes,
                };
            });

            // --- 2e. Prepare Final Analysis Response ---
            const finalResponse = {
                results: finalResults,
                processingWarnings: processingWarnings.length > 0 ? processingWarnings : undefined,
                wordCloudData: finalWordCloudData
            };

            console.log("Successfully processed initial analysis, sending results back to client.");
            return NextResponse.json(finalResponse);
        }

    } catch (error) {
        // Catch general errors (e.g., request JSON parsing failure, unexpected issues)
        console.error("General Server Error in POST handler:", error);
        // Determine if it was likely a refinement error based on the stack or message if possible,
        // otherwise return a generic error. This is less precise than separate routes.
        const isRefinementAttempt = error.message.toLowerCase().includes('refine');
        return NextResponse.json(
            {
                error: `An unexpected server error occurred${isRefinementAttempt ? ' during refinement' : ''}.`,
                details: error.message
            },
            { status: 500 }
        );
    }
}