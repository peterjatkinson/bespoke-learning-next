// app/prompt-improver/api/route.js
import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.SMO_OPENAI_API_KEY,
});

// Define a schema for the structured part of the AI's response
const promptAnalysisSchema = {
  type: "object",
  properties: {
    originalFullPrompt: { type: "string", description: "The user's full original prompt text." },
    revisedFullPrompt: { type: "string", description: "The full revised prompt text." },
    analysisBreakdown: {
      type: "array",
      description: "Breakdown of each prompt element.",
      items: {
        type: "object",
        properties: {
          element: { type: "string", description: "Name of the prompt element (e.g., Subject, Action)." },
          original: { type: "string", description: "The user's input for this element from the original prompt. State 'Not specified' if absent." },
          revised: { type: "string", description: "The revised content for this element. State 'No change' or 'Not applicable' if so." },
          // Optional: You could add 'strengths' and 'suggestions' here too if you want them in the structured data
        },
        required: ["element", "original", "revised"],
      },
    },
    chatResponse: {
      type: "string",
      description: "A conversational, Markdown-formatted explanation of the changes, overall feedback, and next steps for the chat interface. This should reference the analysis but not duplicate it verbatim.",
    },
  },
  required: ["originalFullPrompt", "revisedFullPrompt", "analysisBreakdown", "chatResponse"],
};


const systemPromptContent = `
You are an AI Prompt Engineering Assistant. Your goal is to help users refine their text prompts for generating images and videos. You will provide both a structured analysis for a dedicated UI display and a conversational response for a chat interface.

**Important: Scope of Assistance**
Your ONLY function is to assist with improving text prompts for AI image/video generation. If the user asks questions or makes requests unrelated to this specific task, your 'chatResponse' should politely decline, stating you are designed only for prompt engineering assistance. The structured analysis parts can be minimal or indicate "Not applicable for off-topic request".

**User Interaction & Your Task:**
The user will provide their initial prompt or a follow-up message.
1.  Analyze their *latest* prompt input thoroughly against the "Key Guidelines".
2.  Formulate a "revisedFullPrompt".
3.  Prepare an "analysisBreakdown" comparing original and revised elements.
4.  Craft a "chatResponse" in Markdown. This response should summarize the key improvements, explain the reasoning behind the revised prompt, and guide the user on how they can refine it further or ask more questions. It should be conversational and refer to the structured analysis (which will be displayed separately) without exhaustively repeating it. Use clear Markdown (headings, lists, bolding, blank lines for spacing).

**Key Guidelines for Prompt Improvement (Your Knowledge Base):**
*   **Core Philosophy:** Marketing Brief Approach, Filmmaker/Visual Artist Mindset, Clarity, Positive Language, Context, Iteration, Avoid Abstract Nuance, Specify Output.
*   **Essential Elements:** Subject, Action, Composition, Scene/Context, Camera Motion, Ambiance, Style, Additional Details (Emotion/Narrative, Lens, Film Stock), Tool-Specifics.
*   **Considerations:** Bias/Representation, Target Audience, Negative Prompts.

**Output Format (Strict JSON):**
You MUST respond with a single, valid JSON object that conforms *exactly* to the following schema. Do NOT include any text outside of this JSON object.

SCHEMA:
${JSON.stringify(promptAnalysisSchema, null, 2)}

**Detailed Instructions for JSON Fields:**

*   **originalFullPrompt:** The user's most recent full prompt that you are analyzing. If it's a follow-up message that's not a full prompt, try to infer the relevant part or use the last full prompt from the conversation history.
*   **revisedFullPrompt:** Your suggested improved full prompt.
*   **analysisBreakdown (array of objects):**
    *   For each key element (Subject, Action, Composition, Scene/Context, Camera Motion, Ambiance, Style, Other Key Details), create an object.
    *   **element:** The name of the element.
    *   **original:** What the user had for this in their original prompt. Be concise. If nothing, "Not specified."
    *   **revised:** What this element becomes in your revised prompt. Be concise. If no change or not applicable for this element in the revision, state that.
*   **chatResponse (Markdown String):**
    *   Start with an overall positive and encouraging tone.
    *   Briefly mention the key changes made in the 'revisedFullPrompt'.
    *   Explain *why* certain changes were made, referencing the "Key Guidelines".
    *   Use Markdown for readability (e.g., ## Overall Feedback, ### Key Changes, * bullet points). Ensure blank lines for spacing.
    *   Conclude by inviting further refinement or questions.
    *   If the user's input was off-topic, this field should contain the polite refusal message.

**Example for 'analysisBreakdown' item:**
{ "element": "Subject", "original": "a cat", "revised": "a fluffy ginger tabby cat" }

**Example for 'chatResponse' (partial):**
"Great start with your prompt! I've suggested a revised version which you can see in the dedicated panel.
### Key Changes:
*   **Subject:** I've made the subject more specific ('a fluffy ginger tabby cat' instead of just 'a cat') to help the AI generate a clearer image. This aligns with the principle of being explicit.
*   **Action:** ...
Let me know if you'd like to explore other options or refine any part of this!"

If this is the first turn and the user just said "hello", the 'originalFullPrompt' can be their greeting, 'revisedFullPrompt' can be an example prompt, 'analysisBreakdown' can explain that example, and 'chatResponse' can be a welcome message asking for their first prompt.
`;

export async function POST(request) {
  try {
    const body = await request.json();
    const userMessages = body.messages;

    if (!userMessages || !Array.isArray(userMessages) || userMessages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    // Construct messages for OpenAI, ensuring history is included for context
    const messagesToOpenAI = [
      { role: "system", content: systemPromptContent },
      // Include previous user and assistant messages that are part of the current prompt refinement conversation
      ...userMessages.map(msg => ({ role: msg.role, content: msg.content })),
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Or "gpt-4o" for better adherence to complex JSON
      messages: messagesToOpenAI,
      response_format: { type: "json_object" }, // Crucial for ensuring JSON output
      temperature: 0.5, // Lower temperature for more predictable structured output
    });

    let aiResponseJson;
    if (completion.choices[0].message.content) {
      try {
        aiResponseJson = JSON.parse(completion.choices[0].message.content);
      } catch (e) {
        console.error("Failed to parse AI JSON response:", e);
        console.error("Raw AI response:", completion.choices[0].message.content);
        throw new Error("AI returned malformed JSON.");
      }
    } else {
      throw new Error("AI returned no content.");
    }

    // The entire aiResponseJson (which should match our schema) is sent to the frontend
    return NextResponse.json(aiResponseJson, { status: 200 });

  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Failed to get structured response from AI.", details: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}