// src/app/api/pdf-simple-processor/route.js
import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
    apiKey: process.env.SMO_OPENAI_API_KEY, // Ensure this ENV var is set
});

export async function POST(request) {
    console.log("Simple PDF Processor API route hit.");

    try {
        const payload = await request.json();
        const { textBlock, wordCloudDataInput } = payload;

        if (typeof textBlock !== 'string') {
             return NextResponse.json({ error: "Missing or invalid 'textBlock' string in payload." }, { status: 400 });
        }
         const safeWordCloudInput = (!wordCloudDataInput || !Array.isArray(wordCloudDataInput)) ? [] : wordCloudDataInput;
         if (!textBlock.trim()) {
             return NextResponse.json({ error: "Received empty text block for analysis." }, { status: 400 });
         }

        const processingWarnings = [];
        let finalWordCloudData = null;
        let aiCategorizationResult = { positive: [], critical: [] };

        // --- 1. Word Cloud Sentiment Analysis ---
        const wordsToAnalyze = safeWordCloudInput.map(tag => tag.value);
        const sentimentMessages = [];

        if (wordsToAnalyze.length > 0) {
            console.log(`Preparing ${wordsToAnalyze.length} words for sentiment analysis...`);
            // *** UPDATED SENTIMENT PROMPT ***
            const sentimentSystemPrompt = `
You are a sentiment analysis assistant. You will receive a JSON list of words.
Analyze each word individually in the context of general student feedback (e.g., about courses, teaching, materials).
Determine if each word typically carries a 'positive', 'negative', or 'neutral' sentiment in that context.
Respond ONLY with a single, valid **JSON** object.
The keys of the JSON object MUST be the exact words from the input list.
The values MUST be one of the strings: "positive", "negative", or "neutral".
Do NOT include any other text, explanations, or introductions. Ensure the output is valid **JSON**.

Example Input: ["helpful", "difficult", "activity", "confusing", "great"]
Example Output **JSON**:
{
  "helpful": "positive",
  "difficult": "negative",
  "activity": "neutral",
  "confusing": "negative",
  "great": "positive"
}
            `.trim();
            // *** END UPDATED PROMPT ***

            const sentimentUserPrompt = JSON.stringify(wordsToAnalyze);
            sentimentMessages.push({ role: "system", content: sentimentSystemPrompt });
            sentimentMessages.push({ role: "user", content: sentimentUserPrompt });
            console.log("--- Sending DATA to OpenAI for Sentiment Analysis ---");
            console.log("Messages:", JSON.stringify(sentimentMessages, null, 2));

            try {
                const sentimentPromise = openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: sentimentMessages,
                    response_format: { type: "json_object" }, // This requires "JSON" in prompt
                    temperature: 0.1, max_tokens: 1024
                });
                const sentimentResponse = await sentimentPromise;
                console.log("Received sentiment response.");
                const sentimentChoice = sentimentResponse.choices[0];
                if (!sentimentChoice?.message?.content) throw new Error("Invalid sentiment response structure.");
                try {
                    const wordSentiments = JSON.parse(sentimentChoice.message.content);
                    finalWordCloudData = safeWordCloudInput.map(tag => {
                        const sentiment = wordSentiments[tag.value];
                        return { ...tag, sentiment: ["positive", "negative", "neutral"].includes(sentiment) ? sentiment : "neutral" };
                    });
                    console.log("Merged word sentiments.");
                } catch (jsonError) {
                    console.error("Failed to parse sentiment JSON:", jsonError);
                    processingWarnings.push("Failed to parse word sentiment results.");
                    finalWordCloudData = safeWordCloudInput.map(tag => ({ ...tag, sentiment: "neutral" }));
                }
            } catch (sentimentError) {
                // Check if it's the specific 400 error related to JSON prompt requirement
                if (sentimentError.status === 400 && sentimentError.message.includes("'messages' must contain the word 'json'")) {
                     console.error("OpenAI API Error: The prompt is likely missing the word 'JSON' required for json_object response format.");
                     processingWarnings.push(`AI sentiment analysis failed: Prompt missing required 'JSON' instruction.`);
                } else {
                    console.error("OpenAI sentiment error:", sentimentError);
                    processingWarnings.push(`AI sentiment analysis failed: ${sentimentError.message}`);
                }
                finalWordCloudData = safeWordCloudInput.map(tag => ({ ...tag, sentiment: "neutral" }));
            }
        } else {
            console.log("No words for sentiment analysis.");
            finalWordCloudData = [];
        }

        // --- 2. Comment Categorization from Text Block ---
        const categorizationMessages = [];
        console.log(`Preparing text block (length: ${textBlock.length}) for categorization...`);
        // *** UPDATED CATEGORIZATION PROMPT ***
        const categorizationSystemPrompt = `
You are an expert feedback analyst. You will receive a single block of text containing multiple student comments, likely separated by newlines or paragraph breaks.
First, identify the distinct individual comments within this text block. Treat text separated by one or more blank lines as separate comments. Also consider text following question headers (like Q3, Q4, Q5) as potentially starting new comment sections if not immediately following another comment.
Second, after identifying the comments, categorize EACH identified comment verbatim into 'Positive comments' or 'Critical comments/Suggestions for improvement'.
Ensure EVERY identified comment is placed into exactly ONE category. Maintain the exact original wording of each comment.
Respond ONLY with a single **JSON** object with keys "positive" and "critical". Each key must hold a **JSON** array of the verbatim comment strings belonging to that category. Ensure the output is valid **JSON**.
Do not include comments that are just variations of "None", "N/A", or similar meaninglessness.

Example Input Text Block:
"Great course overall! Really enjoyed the content.

Some lectures were a bit too fast.

I found the readings very helpful.

Maybe add more examples for assignment 2."

Example Output **JSON**:
{
  "positive": [
    "Great course overall! Really enjoyed the content.",
    "I found the readings very helpful."
  ],
  "critical": [
    "Some lectures were a bit too fast.",
    "Maybe add more examples for assignment 2."
  ]
}
        `.trim();
        // *** END UPDATED PROMPT ***

        const categorizationUserPrompt = `Please identify and categorize the comments in the following text block:\n\n${textBlock}`;
        categorizationMessages.push({ role: "system", content: categorizationSystemPrompt });
        categorizationMessages.push({ role: "user", content: categorizationUserPrompt });
        console.log("--- Sending DATA to OpenAI for Comment Categorization ---");
        console.log("Messages:", JSON.stringify(categorizationMessages, null, 2));

        try {
             const categorizationPromise = openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: categorizationMessages,
                response_format: { type: "json_object" }, // This requires "JSON" in prompt
                temperature: 0.2, max_tokens: 4096,
            });
             const categorizationResponse = await categorizationPromise;
             console.log("Received categorization response.");
             const catChoice = categorizationResponse.choices[0];
             if (catChoice.finish_reason === 'length') processingWarnings.push("Warning: Comment categorization might be incomplete (output limit reached).");
             if (!catChoice?.message?.content) throw new Error("Invalid categorization response structure.");
             try {
                 const parsedCategories = JSON.parse(catChoice.message.content);
                 if (parsedCategories && Array.isArray(parsedCategories.positive) && Array.isArray(parsedCategories.critical)) {
                    aiCategorizationResult = parsedCategories;
                    console.log("Parsed comment categories.");
                 } else { throw new Error("Parsed categorization JSON has incorrect structure."); }
             } catch (jsonError) {
                 console.error("Failed to parse categorization JSON:", jsonError);
                 processingWarnings.push("Failed to parse comment categorization results.");
             }
        } catch (categorizationError) {
             // Check if it's the specific 400 error related to JSON prompt requirement
            if (categorizationError.status === 400 && categorizationError.message.includes("'messages' must contain the word 'json'")) {
                 console.error("OpenAI API Error: The categorization prompt is likely missing the word 'JSON' required for json_object response format.");
                 processingWarnings.push(`AI categorization failed: Prompt missing required 'JSON' instruction.`);
            } else {
                console.error("OpenAI categorization error:", categorizationError);
                processingWarnings.push(`AI comment categorization failed: ${categorizationError.message}`);
            }
        }


        // --- 3. Prepare Final Response ---
        const finalResponse = {
            categorizedComments: aiCategorizationResult,
            wordCloudData: finalWordCloudData,
            processingWarnings: processingWarnings.length > 0 ? processingWarnings : undefined,
        };

        console.log("Analysis complete. Sending response.");
        return NextResponse.json(finalResponse);

    } catch (error) {
        console.error("General Server Error in Simple PDF Processor API:", error);
        if (error instanceof SyntaxError) {
             return NextResponse.json({ error: "Invalid request payload format." }, { status: 400 });
        }
        return NextResponse.json(
            { error: "An unexpected error occurred on the server.", details: error.message },
            { status: 500 }
        );
    }
}