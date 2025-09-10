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

/* ---------------------- Schemas ---------------------- */

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
          text: { type: "string" },
          critique: { type: "string" },
          isMissing: { type: "boolean" },
        },
        required: ["element", "text", "critique", "isMissing"],
      },
    },
  },
  required: ["analysisBreakdown"],
};

const refinementSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    isSufficient: { type: "boolean" },
    revisedText: { type: "string" },
    chatResponse: { type: "string" },
  },
  required: ["isSufficient", "revisedText", "chatResponse"],
};

const composeSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    taggedPrompt: { type: "string" },
  },
  required: ["taggedPrompt"],
};

/* ---------------------- Dynamic prompts by type ---------------------- */

function analysisSystemPromptFor(promptType) {
  const elems = (REQUIRED_ELEMENTS[promptType] || REQUIRED_ELEMENTS.image).join(", ");
  return `
You are a "Prompt Deconstructor". Analyze a user's full ${promptType} prompt.

1) Extract the text for each element: ${elems}.
2) If an element is missing, set its 'text' to "" and write a 1-sentence question asking for it.
3) For present elements, write a 1-sentence constructive suggestion.
4) Only set isMissing=true if the element is absent.

Respond as a single JSON object.
`.trim();
}

function composeSystemPromptFor(promptType) {
  const isVideo = promptType === "video";
  return `
You are a "Prompt Synthesizer".

INPUT:
- elements with user text (some empty)
- tag map (element -> tag like <Subject>…</Subject>)

TASK:
Write a NEW prompt from scratch in 1–4 complete sentences that integrates ONLY non-empty elements.
Return it as "taggedPrompt" with each included element wrapped in its tag exactly once.

STRICT RULES:
- No quotation marks anywhere.
- Start with the Subject, then integrate others naturally.
- Rewrite fragments into grammatical phrases/clauses.
- Every tagged span must be inside a sentence (never trailing).
- No labels/bullets/parenthetical element names.
- Clean punctuation; end with terminal punctuation.

${isVideo ? `VIDEO EXTRAS:
- "Camera Motion": natural clause (e.g., "with a slow dolly forward").
- "Shot Duration": phrase like "a 5-second shot".
- "Pacing": natural adverbs/phrases ("with brisk pacing", "lingers slowly").
` : ""}

Return JSON only.
`.trim();
}

const refinementSystemPrompt = `
You are a "Prompt Coach". You will be given an element and a user's new text.
- Decide if the input is a good improvement (isSufficient).
- Provide a short, encouraging chatResponse that ACKNOWLEDGES the update.
- Do NOT ask for more changes to this element right now.
- If you include ideas, phrase them as a brief "Later on, you may wish to…" tip.

Return a single JSON object.
`.trim();

/* ---------------------- Helpers ---------------------- */

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

const stripDoubleQuotes = (s) => s.replace(/"([^"]*)"/g, "$1");

// Join orphan short fragments to previous sentence (e.g., "in the rain", "sad")
const fixDanglingFragments = (text) => {
  const pieces = text.match(/[^.!?]+[.!?]/g) || [text];
  const preps = /^(in|with|under|on|at|by|amid|amidst|during|while|as|like|featuring|within)\b/i;
  const shortAdj = /^(sad|happy|gloomy|melancholic|moody|dark|bright|quiet|noisy|somber|solemn)\b/i;

  const out = [];
  for (let i = 0; i < pieces.length; i++) {
    let s = pieces[i].trim();
    const core = s.replace(/[.!?]+$/, "").trim();
    const words = core.split(/\s+/).filter(Boolean).length;

    const looksFragment = (preps.test(core) && words <= 6) || (shortAdj.test(core) && words <= 3);
    if (looksFragment && out.length) {
      const prev = out.pop().replace(/[.!?]+$/, "");
      s = `${prev}, ${core}.`;
    }
    out.push(s);
  }
  return out.map((s) => (/[.!?]$/.test(s) ? s : s + ".")).join(" ").trim();
};

/* ---------------------- Handler ---------------------- */

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
          { role: "system", content: analysisSystemPromptFor(promptType) },
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

      const response = await openai.responses.create({
        model: "gpt-4o", // better prose + rule adherence
        input: [
          { role: "system", content: composeSystemPromptFor(promptType) },
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

      // Extract per-element spans, strip tags, sanitize
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
