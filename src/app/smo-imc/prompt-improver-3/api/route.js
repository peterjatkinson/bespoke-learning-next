// app/prompt-improver/api/route.js
import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.SMO_OPENAI_API_KEY,
});

const REQUIRED_ELEMENTS = {
  image: ["Subject", "Style", "Action", "Scene", "Ambiance", "Composition"],
  video: ["Subject", "Style", "Action", "Scene", "Ambiance", "Composition", "Camera Motion", "Shot Duration", "Pacing"],
};

// ## PROMPT & SCHEMA FOR THE INITIAL ANALYSIS STEP ##
const analysisSystemPrompt = `
You are a "Prompt Deconstructor". Your task is to analyze a user's full creative prompt.
1.  Extract the text corresponding to each required element: ${REQUIRED_ELEMENTS.image.join(", ")}.
2.  If an element is completely missing from the prompt, set its 'text' to an empty string.
3.  For each element that IS present, provide a brief, constructive 'critique' (1 sentence) on how it could be more descriptive or evocative.
4.  For any element that is MISSING, the 'critique' must be a question prompting the user for that specific information.
5.  Set 'isMissing' to true only if the element is completely absent from the user's prompt.
Your entire output must be a single JSON object.
`;

const analysisSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    analysisBreakdown: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          element: { type: "string" },
          text: { type: "string", description: "The extracted text for this element from the user's prompt. Empty string if not found." },
          critique: { type: "string", description: "Your constructive suggestion for improvement or a question if missing." },
          isMissing: { type: "boolean" },
        },
        required: ["element", "text", "critique", "isMissing"],
      },
    },
  },
  required: ["analysisBreakdown"],
};

// ## PROMPT & SCHEMA FOR THE REFINEMENT STEP ##
const refinementSystemPrompt = `
You are a "Prompt Coach". Your job is to evaluate a user's revised input for a single prompt element that was previously weak or missing.
- You will be given the element and the user's new text.
- Decide if the new text is a good, descriptive improvement.
- Provide an encouraging, conversational chat response.
- Your entire output must be a single JSON object.
`;

const refinementSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    isSufficient: { type: "boolean", description: "Is the user's new input a good improvement?" },
    revisedText: { type: "string", description: "Your slightly polished version of the user's new input." },
    chatResponse: { type: "string", description: "Your conversational message to the user." },
  },
  required: ["isSufficient", "revisedText", "chatResponse"],
};


export async function POST(request) {
  // ADDED: Log to show when the API is hit
  console.log("API Request Received");
  try {
    const body = await request.json();
    const { action } = body; 

    // ADDED: Log the action and body for debugging
    console.log(`Action: ${action}`, body);

    if (action === "analyze") {
      const { userPrompt, promptType } = body;
      const response = await openai.responses.create({
        model: "gpt-4o",
        input: [
          { role: "system", content: analysisSystemPrompt },
          { role: "user", content: `Please deconstruct this ${promptType} prompt: "${userPrompt}"` },
        ],
        text: { format: { type: "json_schema", name: "PromptAnalysis", schema: analysisSchema, strict: true } },
      });
      const result = JSON.parse(response.output_text);
      return NextResponse.json({ ...result, conversationId: response.conversation });
    }

    if (action === "refine") {
      const { userRequest, elementToRefine, conversationId } = body;
      const response = await openai.responses.create({
        model: "gpt-4o-mini",
        input: [
          { role: "system", content: refinementSystemPrompt },
          { role: "user", content: `Here is my updated idea for the **${elementToRefine}**: "${userRequest}"` },
        ],
        ...(conversationId && { conversation: conversationId }),
        text: { format: { type: "json_schema", name: "PromptRefinement", schema: refinementSchema, strict: true } },
      });
      const result = JSON.parse(response.output_text);
      return NextResponse.json({ ...result, conversationId: response.conversation });
    }

    return NextResponse.json({ error: "Invalid action specified." }, { status: 400 });

  } catch (error) {
    // ADDED: Log the full error on the server side
    console.error("Error in prompt-improver API:", error);
    const errorMessage = error instanceof OpenAI.APIError ? error.message : "An internal error occurred.";
    return NextResponse.json({ error: "Failed to get a response from the AI.", details: errorMessage }, { status: 500 });
  }
}