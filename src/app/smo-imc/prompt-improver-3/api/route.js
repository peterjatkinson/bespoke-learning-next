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

// ## COMPOSITION STEP (rewrites from scratch, produces 1–4 clean sentences + tags) ##
const composeSystemPrompt = `
You are a "Prompt Synthesizer".
INPUTS:
- prompt type
- elements with user text (some may be empty)
- tag map (element -> tag name like <Subject>...</Subject>)

TASK:
Write a NEW prompt from scratch in 1–4 complete sentences that integrates ONLY non-empty elements.
Then return it as "taggedPrompt" where EACH included element is wrapped in its tag exactly once.

STRICT RULES:
- Do NOT use quotation marks at all (no “ ” or " "); never quote style descriptors.
- Start with the Subject; then naturally integrate Action, Scene, Ambiance, Style, Composition, etc.
- Fragmentary inputs must be rewritten into grammatical phrases or clauses (e.g., "in the rain" -> "in the rain"; "sad" -> "conveying sadness").
- Ensure EVERY tagged span is inside a sentence—never trailing after a period.
- Do not duplicate element content outside its tag; each element appears once.
- No labels or bullet points; no parentheticals naming elements.
- Clean punctuation; no dangling commas or double periods.
- End the whole prompt with terminal punctuation.

Return JSON only.
`;

const composeSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    taggedPrompt: {
      type: "string",
      description: "Final prompt (1–4 sentences) with element spans wrapped in tags.",
    },
  },
  required: ["taggedPrompt"],
};

// Helpers
const toTagName = (name) =>
  name
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

const punctuationCleanup = (s) =>
  s
    .replace(/\s+,/g, ",")
    .replace(/\s+\./g, ".")
    .replace(/,\s*,/g, ", ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([!?;:])/g, "$1")
    .replace(/([!?;:])\s*\./g, "$1")
    .trim();

// remove double-quotes around phrases (but keep apostrophes like robot's)
const stripDoubleQuotes = (s) => s.replace(/"([^"]*)"/g, "$1");

// join orphan short fragments like "in the rain" / "sad" to previous sentence
const fixDanglingFragments = (text) => {
  const pieces = text.match(/[^.!?]+[.!?]/g) || [text];
  const preps = /^(in|with|under|on|at|by|amid|amidst|during|while|as|like|featuring|within)\b/i;
  const shortAdj = /^(sad|happy|gloomy|melancholic|moody|dark|bright|quiet|noisy|somber|solemn)\b/i;

  const out = [];
  for (let i = 0; i < pieces.length; i++) {
    let s = pieces[i].trim();
    const core = s.replace(/[.!?]+$/, "").trim();
    const wordCount = core.split(/\s+/).filter(Boolean).length;

    const looksFragment = (preps.test(core) && wordCount <= 6) || (shortAdj.test(core) && wordCount <= 3);
    if (looksFragment && out.length) {
      // merge into previous sentence
      const prev = out.pop().replace(/[.!?]+$/, "");
      s = `${prev}, ${core}.`;
    }
    out.push(s);
  }
  // Ensure terminal punctuation
  return out
    .map((s) => (/[.!?]$/.test(s) ? s : s + "."))
    .join(" ")
    .trim();
};

export async function POST(request) {
  console.log("API Request Received");
  try {
    const body = await request.json();
    const { action } = body;
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

    if (action === "compose") {
      const { promptType, analysisBreakdown } = body;

      const elementsForType = REQUIRED_ELEMENTS[promptType] || REQUIRED_ELEMENTS.image;
      const tagMap = elementsForType.map((el) => ({ element: el, tag: toTagName(el) }));

      const elementsWithText = Array.isArray(analysisBreakdown)
        ? analysisBreakdown
            .map(({ element, text }) => ({ element, text: (text || "").trim() }))
            .filter((e) => elementsForType.includes(e.element))
        : [];

      // Use the larger model here for better prose quality & adherence to rules
      const response = await openai.responses.create({
        model: "gpt-4o",
        input: [
          { role: "system", content: composeSystemPrompt },
          {
            role: "user",
            content:
              `Prompt type: ${promptType}\n` +
              `Tag map: ${JSON.stringify(tagMap)}\n` +
              `Elements: ${JSON.stringify(elementsWithText)}`,
          },
        ],
        text: { format: { type: "json_schema", name: "PromptCompose", schema: composeSchema, strict: true } },
      });

      const parsed = JSON.parse(response.output_text);
      const tagged = (parsed.taggedPrompt || "").trim();

      // Extract per-element exact spans, strip tags, then sanitize
      const perElementTexts = {};
      let refinedPrompt = tagged;

      for (const { element, tag } of tagMap) {
        const re = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i");
        const match = tagged.match(re);
        const inner = match ? match[1].trim() : "";
        perElementTexts[element] = stripDoubleQuotes(inner);
        refinedPrompt = refinedPrompt.replace(new RegExp(`</?${tag}>`, "gi"), "");
      }

      refinedPrompt = stripDoubleQuotes(refinedPrompt);
      refinedPrompt = punctuationCleanup(refinedPrompt);
      refinedPrompt = fixDanglingFragments(refinedPrompt);

      return NextResponse.json({ refinedPrompt, perElementTexts });
    }

    return NextResponse.json({ error: "Invalid action specified." }, { status: 400 });
  } catch (error) {
    console.error("Error in prompt-improver API:", error);
    const errorMessage = error instanceof OpenAI.APIError ? error.message : "An internal error occurred.";
    return NextResponse.json({ error: "Failed to get a response from the AI.", details: errorMessage }, { status: 500 });
  }
}
