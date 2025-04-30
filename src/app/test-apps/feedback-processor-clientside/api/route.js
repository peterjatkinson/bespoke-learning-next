import OpenAI from "openai";
import { NextResponse } from "next/server";
const openai = new OpenAI({
apiKey: process.env.SMO_OPENAI_API_KEY,
});
// --- System Prompts ---
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
Write a brief, neutral summary paragraph (2-3 sentences) capturing the main themes of the feedback for that session – be specific not vague or general.
Categorise the comments into 'Positive comments'. List the specific comments that express satisfaction, enjoyment, or highlight strengths.
Categorise the comments into 'Critical comments/Suggestions for improvement'. List the specific comments that express dissatisfaction, confusion, constructive criticism, or suggest changes.
CRITICAL INSTRUCTIONS:
VERBATIM REPRODUCTION: Every single comment listed in the 'positiveComments' and 'criticalComments' arrays MUST be the exact, complete, and unmodified text from the original input provided for that session. Do NOT summarize, paraphrase, shorten, or alter the original comments in any way when listing them.
COMPLETE CATEGORIZATION: Ensure every original comment provided for a session is placed verbatim into exactly ONE of the two lists ('positiveComments' or 'criticalComments'). If a comment seems neutral, place it in the category that seems slightly more appropriate or default to 'Critical comments/Suggestions for improvement' if unsure. The ONLY type of comments you can omit are the ones that say something like only 'none' or 'N/A'.
JSON STRUCTURE: Structure your entire response as a single, valid JSON object. The keys of this object MUST be the session names provided in the input (e.g., "Session 1", "Session 2", "Unknown Session"). The value for each session key MUST be a JSON object with the following EXACT structure:
{
"summary": "string", // Summary is part of the initial analysis, not refinement/theming
"positiveComments": ["string"],
"criticalComments": ["string"]
}
NO EXTRA TEXT: Do not include any introductory text, concluding remarks, apologies, or text outside the main JSON object structure.
Your goal is analysis and categorization, preserving the original feedback text perfectly within the categories, omitting only explicitly trivial responses like 'none' or 'N/A'.
`.trim();
// Existing prompt for removing short comments (filters P/C lists) - Used as Step 1 in the new theme process
const refineSystemPrompt = `
You are a feedback refinement assistant. You will receive a JSON object where keys are session names and values are objects containing 'positiveComments' and 'criticalComments' lists.
Your task is to analyze EACH comment list ('positiveComments' and 'criticalComments') for EACH session to filter out comments that lack specific substance or actionable detail, aiming to keep only the more informative feedback.
Criteria for REMOVAL:
Very Short & Non-Substantive: Remove comments that are extremely short (e.g., 1-3 words) AND clearly lack substance.
Examples: "ok", "good", "yes", "no", "fine", "great", "thanks", "none", "N/A", single emojis, "all good", "nothing", "it was ok", "no comment", "agreed", "+1".
Generic Praise/Positives: Remove comments, even if longer, that consist only of general positive sentiment or praise without mentioning specific aspects, examples, or details about why it was good.
Examples: "The material was clear and insightful.", "This is new information but well explained", "Thank you for this cohesive introductory module", "Great content and easy-to-follow material!", "The content and readings are very informative.", "Thank you for a very interesting session!", "The content covered was very insightful.", "Well structured.", "Very clear.", "Enjoyed it.", "Helpful session.", "Learned a lot.".
Generic Criticism (Less Common but possible): Similarly, remove very generic negative comments if they offer no specifics (e.g., "It was bad", "Confusing", "Didn't like it").
Criteria for KEEPING:
Keep comments that offer specific feedback, mention particular examples, topics, slides, or activities, identify specific strengths or weaknesses, suggest concrete improvements, describe a specific learning experience or difficulty, or provide unique insights or perspectives beyond simple agreement or general praise/criticism.
Even relatively brief comments should be KEPT if they contain a specific point (e.g., "Slide 5 was confusing", "Liked the group activity", "Pacing was too fast", "Need more practical examples", "The reading on X was excellent").
Err on the side of keeping a comment if you are unsure, unless it clearly falls into the removal categories above (very short/non-substantive or purely generic praise).
CRITICAL INSTRUCTIONS:
VERBATIM PRESERVATION: Comments you decide to KEEP must be returned exactly as they were provided in the input, without any modification, summarization, or alteration. Preserve original capitalization and punctuation.
STRUCTURED JSON RESPONSE: Respond ONLY with a single, valid JSON object. The keys MUST be the exact session names from the input. The value for each session key MUST be an object with the keys 'positiveComments' and 'criticalComments', containing lists of the kept verbatim comments.
COMPLETE COVERAGE: Process all sessions provided in the input. If a session's comment list becomes empty after filtering, return empty lists (e.g., "positiveComments": []).
NO EXTRA TEXT: Do not include any explanations, introductions, apologies, or text outside the main JSON object structure.
Your goal is to filter aggressively for comments containing specific substance or actionable feedback, removing both the extremely short non-comments AND the purely generic statements, while preserving the exact text of the remaining, more valuable feedback.
`.trim();
// NEW prompt for Organising by Theme (operates on already filtered comments)
const themingSystemPrompt = `
You are an expert academic feedback analyst specializing in qualitative data analysis. Your task is to take a list of student feedback comments for each session (these comments have already been filtered to remove generic or unsubstantial responses) and group them into meaningful themes.
For EACH session provided in the input:
Group Comments: Take all comments provided for that session and organize them into groups based on common topics, issues, or ideas.
Create Themes: If two or more filtered comments in a session clearly relate to the same specific topic or issue, create a concise, descriptive title for that theme (e.g., "Pacing", "Group Activity", "Content Depth", "Examples Provided").
Identify Miscellaneous: Collect ALL filtered comments that were not included in any specific "Main Theme" (because they did not relate to at least one other comment on the same topic within that session) and group them together under a single, specific heading titled "Miscellaneous Comments".
List Verbatim Comments: Under each theme title or the "Miscellaneous Comments" heading, list the exact verbatim text of the comments that belong to that group.
CRITICAL INSTRUCTIONS:
VERBATIM PRESERVATION: Comments listed under any heading ("Main Themes" or "Miscellaneous Comments") MUST be the exact, complete, and unmodified text as provided in the input for that session.
COMPLETENESS: Every single comment provided in the input for a session MUST appear verbatim under exactly one theme title (if it's part of a Main Theme with 2+ comments) OR under the "Miscellaneous Comments" heading. Do NOT lose or omit any comments provided in the input.
GROUPING RULE: A specific "Main Theme" title should only be created if there are two or more comments that clearly belong to that theme. Any comment not part of a theme with 2+ comments must be placed under "Miscellaneous Comments".
ORDERING: The "Miscellaneous Comments" heading should always appear LAST in the list of themes (keys within the 'themes' object) for each session in the JSON output. Theme titles other than "Miscellaneous Comments" can be sorted alphabetically.
JSON STRUCTURE: Structure your entire response as a single, valid JSON object. The keys of this object MUST be the exact session names from the input. The value for each session key MUST be a JSON object with the following EXACT structure:
{
"themes": {
"Theme Title 1": ["string", "string", ...], // Theme with 2+ comments
"Theme Title 2": ["string", ...], // Theme with 2+ comments
// ... other themes with 2+ comments ...
"Miscellaneous Comments": ["string", "string", ...] // ALL filtered comments not in a 2+ comment theme MUST go here
}
// Include an empty themes object ({}) if no comments were provided in the input for a session, or if all provided comments were effectively empty strings after trimming (though input should be pre-filtered).
}
NO EXTRA TEXT: Do not include any introductory text, concluding remarks, apologies, or text outside the main JSON object structure.
Example Input (already filtered comments for one session):
--- Session 1 ---
The group activity was really insightful.
I found the readings too extensive for the time given.
I wish there were more practical examples.
The lecturer explained concepts very clearly.
Loved the group work.
Need fewer readings next time.
The assessment was confusing.
The video links didn't work.
Expected JSON Output for Session 1:
{
"Session 1": {
"themes": {
"Group Activity": [
"The group activity was really insightful.",
"Loved the group work."
],
"Readings": [
"I found the readings too extensive for the time given.",
"Need fewer readings next time."
],
"Miscellaneous Comments": [
"I wish there were more practical examples.",
"The lecturer explained concepts very clearly.",
"The assessment was confusing.",
"The video links didn't work."
]
}
}
}
Your goal is to organize ALL provided comments for each session by theme (for topics with 2+ comments) or into the "Miscellaneous Comments" group (for all other comments), preserving the exact text.
`.trim();
// --- Main POST Handler ---
export async function POST(request) {
console.log("Received request to API route");
try {
    const payload = await request.json();
    const action = payload.action; // Check if an action is specified

    // --- Handle Refinement (Existing Logic - Used by 'Refine Comments Only' button) ---
    if (action === 'refine') {
        console.log("--> Detected 'refine' action");
        // Expecting payload.commentsToRefine: { sessionName: { positiveComments: [...], criticalComments: [...] } }
        const { commentsToRefine } = payload;

        if (!commentsToRefine || Object.keys(commentsToRefine).length === 0) {
            console.log("No comments received for refinement.");
            return NextResponse.json({ error: "No comments data received for refinement." }, { status: 400 });
        }

        const refineUserPromptContent = JSON.stringify(commentsToRefine, null, 2);

        let refinedCommentsData = {};
        let refinementWarnings = [];

        console.log(`Sending request to OpenAI API for comment refinement (remove short)...`);
        try {
            const refineResponse = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: refineSystemPrompt },
                    { role: "user", content: refineUserPromptContent }
                ],
                response_format: { type: "json_object" },
                temperature: 0.1, // Less creativity needed for filtering
                max_tokens: 4096,
            });
            console.log("Received refinement (remove short) response from OpenAI API.");

            const choice = refineResponse.choices[0];
            if (choice.finish_reason === 'length') refinementWarnings.push("Warning: AI refinement (remove short) might be incomplete (output limit reached).");
            else if (choice.finish_reason !== 'stop') refinementWarnings.push(`Warning: AI refinement (remove short) may have finished unexpectedly (Reason: ${choice.finish_reason}).`);

            if (!choice?.message?.content) {
                throw new Error("Invalid response structure received from OpenAI for refinement (remove short).");
            }

            try {
                const parsedRefinement = JSON.parse(choice.message.content);
                console.log(`Successfully parsed OpenAI refinement (remove short) response.`);

                refinedCommentsData = {};
                Object.keys(commentsToRefine).forEach(name => { // Use input keys to ensure all sessions are covered
                    const refinedSession = parsedRefinement[name];
                     // Validate expected structure: object with positiveComments & criticalComments arrays
                    if (refinedSession && Array.isArray(refinedSession.positiveComments) && Array.isArray(refinedSession.criticalComments)) {
                         refinedCommentsData[name] = {
                             positiveComments: refinedSession.positiveComments,
                             criticalComments: refinedSession.criticalComments
                         };
                    } else {
                        console.warn(`Refinement output for session "${name}" missing or invalid. Keeping original comments for this session.`);
                        refinementWarnings.push(`Refinement (remove short) data for session "${name}" was missing or invalid; original comments kept for this session.`);
                        refinedCommentsData[name] = commentsToRefine[name] || { positiveComments: [], criticalComments: [] }; // Fallback
                    }
                });

            } catch (jsonError) {
                console.error("Failed to parse JSON refinement (remove short) response from OpenAI:", choice.message.content);
                refinementWarnings.push(`Failed to parse AI refinement (remove short) response. Comments remain unrefined. Error: ${jsonError.message}`);
                refinedCommentsData = commentsToRefine; // Fallback to original on parse error
            }

        } catch (openaiError) {
            console.error("OpenAI API Error during refinement (remove short):", openaiError);
            refinementWarnings.push(`Failed to refine comments using AI: ${openaiError.message || 'Unknown AI error'}. Comments remain unrefined.`);
            refinedCommentsData = commentsToRefine; // Fallback to original on API error
        }

        const finalResponse = {
            refinedComments: refinedCommentsData,
            refinementWarnings: refinementWarnings.length > 0 ? refinementWarnings : undefined,
        };
        console.log("Sending refinement (remove short) results back to client.");
        return NextResponse.json(finalResponse);
    }

    // --- NEW: Handle Refine and Organise by Theme Request (Two-Step Process) ---
    else if (action === 'refine_and_theme') {
        console.log("--> Detected 'refine_and_theme' action (Two-Step Process)");
        // This action now needs the initial P/C lists generated by the *first* analysis call
        // Expecting payload.initialAnalysisResults: { sessionName: { positiveComments: [...], criticalComments: [...], ...otherData } }
        const { initialAnalysisResults } = payload;

        if (!initialAnalysisResults || Object.keys(initialAnalysisResults).length === 0) {
            console.log("No initial analysis results received for theme analysis.");
            return NextResponse.json({ error: "No initial analysis results received for theme analysis." }, { status: 400 });
        }

        const sessionNames = Object.keys(initialAnalysisResults);
        console.log(`Received initial analysis results for ${sessionNames.length} sessions for theme analysis.`);

        let combinedWarnings = []; // Collect warnings from both steps

        // --- Step 1: Refine Comments (Remove Short/Generic) ---
        console.log("Step 1: Filtering comments using refineSystemPrompt...");
        const commentsToFilter = {};
         let hasAnyCommentsToFilter = false;
        sessionNames.forEach(name => {
             // Use the positive/critical lists from the initial analysis results as input
             const pos = initialAnalysisResults[name]?.positiveComments || [];
             const crit = initialAnalysisResults[name]?.criticalComments || [];
             commentsToFilter[name] = { positiveComments: pos, criticalComments: crit };
             if (pos.length > 0 || crit.length > 0) hasAnyCommentsToFilter = true;
        });

        let filteredCommentsBySession = {}; // Will store { sessionName: { positiveComments: [...], criticalComments: [...] } }
        let refinementWarnings = []; // Warnings specific to Step 1

        if (hasAnyCommentsToFilter) {
             try {
                 const refineResponse = await openai.chat.completions.create({
                     model: "gpt-4o-mini",
                     messages: [
                         { role: "system", content: refineSystemPrompt },
                         { role: "user", content: JSON.stringify(commentsToFilter, null, 2) } // Send the P/C structure
                     ],
                     response_format: { type: "json_object" },
                     temperature: 0.1,
                     max_tokens: 4096,
                 });

                const choice = refineResponse.choices[0];
                if (choice.finish_reason === 'length') refinementWarnings.push("Warning: AI filtering step (remove short) might be incomplete (output limit reached).");
                else if (choice.finish_reason !== 'stop') refinementWarnings.push(`Warning: AI filtering step (remove short) may have finished unexpectedly (Reason: ${choice.finish_reason}).`);

                 if (!choice?.message?.content) {
                     throw new Error("Invalid response structure received from OpenAI during filtering step.");
                 }

                 try {
                     const parsedRefinement = JSON.parse(choice.message.content);
                     console.log(`Successfully parsed OpenAI filtering step response.`);

                     sessionNames.forEach(name => {
                        const refinedSession = parsedRefinement[name];
                        // Validate expected structure: object with positiveComments & criticalComments arrays
                        if (refinedSession && Array.isArray(refinedSession.positiveComments) && Array.isArray(refinedSession.criticalComments)) {
                            filteredCommentsBySession[name] = {
                                positiveComments: refinedSession.positiveComments,
                                criticalComments: refinedSession.criticalComments
                            };
                        } else {
                            console.warn(`Filtering step output for session "${name}" missing or invalid. Keeping original initial comments for this session.`);
                            refinementWarnings.push(`Filtering data for session "${name}" was missing or invalid; using initial comments for theming.`);
                            // Fallback to initial comments for this session if AI response is bad
                            const initialSessionData = initialAnalysisResults[name] || {};
                            filteredCommentsBySession[name] = {
                                 positiveComments: initialSessionData.positiveComments || [],
                                 criticalComments: initialSessionData.criticalComments || []
                             };
                        }
                     });

                 } catch (jsonError) {
                     console.error("Failed to parse JSON filtering step response from OpenAI:", choice.message.content);
                     refinementWarnings.push(`Failed to parse AI filtering response. Using initial comments for theming. Error: ${jsonError.message}`);
                     // Fallback: Use initial comments for all sessions on parse error
                     filteredCommentsBySession = {};
                     sessionNames.forEach(name => {
                         const initialSessionData = initialAnalysisResults[name] || {};
                         filteredCommentsBySession[name] = {
                             positiveComments: initialSessionData.positiveComments || [],
                             criticalComments: initialSessionData.criticalComments || []
                         };
                     });
                 }

             } catch (openaiError) {
                 console.error("OpenAI API Error during filtering step:", openaiError);
                 refinementWarnings.push(`Failed to filter comments using AI: ${openaiError.message || 'Unknown AI error'}. Using initial comments for theming.`);
                 // Fallback: Use initial comments for all sessions on API error
                  filteredCommentsBySession = {};
                  sessionNames.forEach(name => {
                      const initialSessionData = initialAnalysisResults[name] || {};
                      filteredCommentsBySession[name] = {
                          positiveComments: initialSessionData.positiveComments || [],
                          criticalComments: initialSessionData.criticalComments || []
                      };
                  });
             }
        } else {
             console.log("No comments to filter in Step 1.");
             sessionNames.forEach(name => { filteredCommentsBySession[name] = { positiveComments: [], criticalComments: [] }; });
        }

        combinedWarnings.push(...refinementWarnings); // Add Step 1 warnings

        // --- Step 2: Organise Filtered Comments by Theme ---
        console.log("Step 2: Theming filtered comments...");
        let commentsForThemingPrompt = "";
        let sessionNamesWithFilteredComments = []; // Track which sessions still have comments after filtering

        sessionNames.forEach(sessionName => {
             const filteredPos = filteredCommentsBySession[sessionName]?.positiveComments || [];
             const filteredCrit = filteredCommentsBySession[sessionName]?.criticalComments || [];
             const allFilteredComments = [...filteredPos, ...filteredCrit]; // Combine P/C lists

             if (allFilteredComments.length > 0) {
                 commentsForThemingPrompt += `--- ${sessionName} ---\n`;
                 allFilteredComments.forEach(comment => { commentsForThemingPrompt += `- ${comment}\n`; });
                 commentsForThemingPrompt += "\n";
                 sessionNamesWithFilteredComments.push(sessionName); // This session has comments for theming
             }
        });

        let themedCommentsData = {}; // Will store { sessionName: { themes: {...} } }
        let themeWarnings = []; // Warnings specific to Step 2

        // Initialize themedCommentsData with empty themes for all sessions, in case AI misses one or fails.
        sessionNames.forEach(name => { themedCommentsData[name] = { themes: {} }; });


        if (commentsForThemingPrompt.trim().length > 0) {
            console.log(`Sending filtered comments for theming to OpenAI API for ${sessionNamesWithFilteredComments.length} sessions...`);
             try {
                 const themeResponse = await openai.chat.completions.create({
                     model: "gpt-4o-mini",
                     messages: [
                         { role: "system", content: themingSystemPrompt }, // Use the new theming-only prompt
                         { role: "user", content: commentsForThemingPrompt } // Send the combined filtered lists
                     ],
                     response_format: { type: "json_object" },
                     temperature: 0.3,
                     max_tokens: 8192,
                 });
                 console.log("Received theme analysis response from OpenAI API.");

                 const choice = themeResponse.choices[0];
                 if (choice.finish_reason === 'length') themeWarnings.push("Warning: AI theme analysis step might be incomplete (output limit reached).");
                 else if (choice.finish_reason !== 'stop') themeWarnings.push(`Warning: AI theme analysis step may have finished unexpectedly (Reason: ${choice.finish_reason}).`);

                 if (!choice?.message?.content) {
                     throw new Error("Invalid response structure received from OpenAI for theme analysis step.");
                 }

                 try {
                     const parsedThemeResults = JSON.parse(choice.message.content);
                     console.log(`Successfully parsed OpenAI theme analysis response.`);

                     sessionNames.forEach(name => { // Use input keys to ensure all sessions are covered
                         const themedSession = parsedThemeResults[name];
                          // Validate expected structure: object with 'themes' object
                         if (themedSession && themedSession.themes && typeof themedSession.themes === 'object') {
                              // Ensure the Miscellaneous Comments key is last if present
                              let sortedThemes = {};
                              const themeKeys = Object.keys(themedSession.themes).sort();
                              themeKeys.filter(key => key !== "Miscellaneous Comments").forEach(key => {
                                  if (Array.isArray(themedSession.themes[key])) sortedThemes[key] = themedSession.themes[key];
                              });
                              if (themedSession.themes["Miscellaneous Comments"] && Array.isArray(themedSession.themes["Miscellaneous Comments"])) {
                                   sortedThemes["Miscellaneous Comments"] = themedSession.themes["Miscellaneous Comments"];
                              }
                             themedCommentsData[name] = { themes: sortedThemes };
                         } else {
                            console.warn(`Theme analysis output for session "${name}" missing or invalid. No themed comments generated for this session.`);
                            themeWarnings.push(`Theme analysis data for session "${name}" was missing or invalid; no themed comments generated.`);
                             // Fallback: Return empty themes object for this session
                            themedCommentsData[name] = { themes: {} };
                         }
                     });

                 } catch (jsonError) {
                     console.error("Failed to parse JSON theme analysis response from OpenAI:", choice.message.content);
                     themeWarnings.push(`Failed to parse the AI's theme analysis response. No themed comments generated. Error: ${jsonError.message}`);
                     // Fallback: Keep themedCommentsData as initially empty
                 }

             } catch (openaiError) {
                 console.error("OpenAI API Error during theme analysis step:", openaiError);
                 themeWarnings.push(`Failed to perform theme analysis using AI: ${openaiError.message || 'Unknown AI error'}. No themed comments generated.`);
                 // Fallback: Keep themedCommentsData as initially empty
             }
        } else {
            console.log("No filtered comments available for theming in Step 2.");
            // themedCommentsData is already initialized with empty themes for all sessions
        }

        combinedWarnings.push(...themeWarnings); // Add Step 2 warnings


        // --- Prepare and Send Final Theme Analysis Response ---
        const finalResponse = {
            themedComments: themedCommentsData, // This structure is themes
            processingWarnings: combinedWarnings.length > 0 ? combinedWarnings : undefined,
        };
        console.log("Sending theme analysis results back to client.");
        return NextResponse.json(finalResponse);
    }

    // --- Handle Initial Analysis Request (Default Action) ---
    else {
        console.log("--> Performing initial analysis");
        // Expecting payload.sessionData format: { sessionName: { comments: [...], timingCounts: {...}, learningOutcomes: [...] } }
        // Expecting payload.wordCloudDataInput format: [{ value: string, count: number }]
        const { sessionData, wordCloudDataInput } = payload;

        if (!sessionData || Object.keys(sessionData).length === 0) {
            console.log("No pre-processed session data received from frontend for initial analysis.");
            return NextResponse.json({ error: "No session data received for analysis." }, { status: 400 });
        }
        // Note: wordCloudDataInput can be null/empty if no comments

        console.log(`Received pre-processed data for ${Object.keys(sessionData).length} sessions for initial analysis.`);
        const processingWarnings = payload.processingWarnings || []; // Start with warnings from frontend parsing

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
                    console.error("Failed to parse JSON sentiment response from OpenAI:", choice.message.content);
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
             finalWordCloudData = wordCloudDataInput || []; // Ensure empty array if no input
        }

        // --- 2b. Prepare Prompt for OpenAI (Feedback Summary/Categorization) ---
        let summaryUserPromptContent = "Please analyze the following student feedback comments grouped by session, following all instructions precisely:\n\n";
        let sessionsSentToOpenAIForSummary = 0;
        const sessionNames = Object.keys(sessionData);
        const originalCommentsBySession = {}; // Prepare data structure for potential future theme analysis

        sessionNames.forEach((sessionName) => {
            const comments = sessionData[sessionName]?.comments;
            if (comments && comments.length > 0) {
                summaryUserPromptContent += `--- ${sessionName} ---\n`;
                comments.forEach((comment) => { summaryUserPromptContent += `- ${comment}\n`; });
                summaryUserPromptContent += "\n";
                sessionsSentToOpenAIForSummary++;
                originalCommentsBySession[sessionName] = comments; // Store original comments list
            } else { console.log(`Session ${sessionName} has no comments received.`); originalCommentsBySession[sessionName] = []; }
        });

        let aiAnalysisResults = {}; // Will store { sessionName: { summary: string, positiveComments: [...], criticalComments: [...] } }

        // --- 2c. Call OpenAI API for Summary/Categorization (Only if there are comments) ---
        if (sessionsSentToOpenAIForSummary > 0) {
            console.log(`Sending request to OpenAI API for summary/categorization for ${sessionsSentToOpenAIForSummary} sessions...`);
            try {
                const summaryResponse = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [ { role: "system", content: summarySystemPrompt }, { role: "user", content: summaryUserPromptContent } ],
                    response_format: { type: "json_object" }, temperature: 0.3, max_tokens: 8192,
                });
                console.log("Received summary/categorization response from OpenAI API.");
                const choice = summaryResponse.choices[0];
                if (choice.finish_reason === 'length') processingWarnings.push("Warning: AI summary/categorization might be incomplete (output limit reached).");
                else if (choice.finish_reason !== 'stop') processingWarnings.push(`Warning: AI summary/categorization finished unexpectedly (Reason: ${choice.finish_reason}).`);

                if (!choice?.message?.content) throw new Error("Invalid response structure for summary.");

                try {
                    aiAnalysisResults = JSON.parse(choice.message.content);
                    console.log(`Successfully parsed OpenAI summary response for ${Object.keys(aiAnalysisResults).length} sessions.`);
                     // Add validation/fallback for missing sessions or invalid structure in AI response
                    sessionNames.forEach(name => {
                         // Ensure session exists and has the correct structure for summary and P/C lists
                        if (!aiAnalysisResults[name] || !Array.isArray(aiAnalysisResults[name]?.positiveComments) || !Array.isArray(aiAnalysisResults[name]?.criticalComments)) {
                            console.warn(`AI summary response missing or invalid data for session: ${name}. Providing fallback.`);
                            processingWarnings.push(`AI analysis data missing or invalid for session: ${name}.`);
                            // Fallback: Use summary if provided by AI, otherwise default. Put all original comments in critical list.
                            aiAnalysisResults[name] = {
                                summary: aiAnalysisResults[name]?.summary || (originalCommentsBySession[name]?.length > 0 ? "AI analysis failed for this session." : "No comments provided for analysis."),
                                positiveComments: [],
                                criticalComments: originalCommentsBySession[name] || [] // Fallback to original comments list
                            };
                        }
                        // If AI provided valid P/C data but missing summary (less likely with current prompt), add a default
                        if (!aiAnalysisResults[name]?.summary) {
                            aiAnalysisResults[name].summary = originalCommentsBySession[name]?.length > 0 ? "Summary not provided by AI." : "No comments provided for analysis.";
                        }
                    });

                } catch (jsonError) {
                    console.error("Failed to parse JSON summary response from OpenAI:", choice.message.content);
                    processingWarnings.push(`Failed to parse AI summary/categorization response. Error: ${jsonError.message}`);
                     // Fallback: Create default empty/fallback structures for all sessions
                    aiAnalysisResults = {};
                     sessionNames.forEach(name => {
                         aiAnalysisResults[name] = {
                             summary: originalCommentsBySession[name]?.length > 0 ? "AI analysis failed for this session." : "No comments provided for analysis.",
                             positiveComments: [],
                             criticalComments: originalCommentsBySession[name] || [] // Fallback to original comments list
                         };
                     });
                }
            } catch (openaiError) {
                console.error("OpenAI API Error during summary/categorization:", openaiError);
                processingWarnings.push(`Failed to analyze feedback using AI: ${openaiError.message || 'Unknown AI error'}.`);
                // Fallback: Create default empty/fallback structures for all sessions
                aiAnalysisResults = {};
                sessionNames.forEach(name => {
                     aiAnalysisResults[name] = {
                         summary: originalCommentsBySession[name]?.length > 0 ? "AI analysis failed for this session." : "No comments provided for analysis.",
                         positiveComments: [],
                         criticalComments: originalCommentsBySession[name] || [] // Fallback to original comments list
                     };
                 });
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
            const frontendData = sessionData[sessionName]; // Includes original comments list, timing, LOs
            const aiData = aiAnalysisResults[sessionName]; // Includes summary, positiveComments, criticalComments (from AI or fallback)

            finalResults[sessionName] = {
                // Data from AI analysis (or fallback)
                summary: aiData.summary,
                // Store the comments from the initial AI categorization
                positiveComments: aiData.positiveComments,
                criticalComments: aiData.criticalComments,
                // Store the *original* full list of comments received from the frontend
                // This is needed as the source for the theme analysis input in the new flow
                originalCommentsList: frontendData.comments || [],
                // Data originally processed on the frontend
                timingCounts: frontendData.timingCounts,
                learningOutcomes: frontendData.learningOutcomes,
            };
        });

        // --- 2e. Prepare Final Initial Analysis Response ---
        const finalResponse = {
            initialAnalysisResults: finalResults, // Changed key name to be specific
            processingWarnings: processingWarnings.length > 0 ? processingWarnings : undefined,
            wordCloudData: finalWordCloudData
        };

        console.log("Successfully processed initial analysis, sending results back to client.");
        return NextResponse.json(finalResponse);
    }

} catch (error) {
    // Catch general errors (e.g., request JSON parsing failure, unexpected issues)
    console.error("General Server Error in POST handler:", error);
    // Determine error context for clearer message
    const requestedAction = payload?.action || 'initial analysis';
    return NextResponse.json(
        {
            error: `An unexpected server error occurred during ${requestedAction}.`,
            details: error.message
        },
        { status: 500 }
    );
}
}
