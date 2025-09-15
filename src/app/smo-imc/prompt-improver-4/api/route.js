// app/prompt-improver/api/route.js
import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.SMO_OPENAI_API_KEY,
});

// Elements per type
const REQUIRED_ELEMENTS = {
  image: ["Subject", "Style", "Action", "Scene", "Ambiance", "Composition"],
  video: [
    "Subject",
    "Style",
    "Action",
    "Scene",
    "Ambiance",
    "Composition",
    "Camera Motion",
    "Shot Duration",
    "Pacing",
  ],
};

/* =========================
   JSON Schemas (strict)
   ========================= */
const buildSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    initialPrompt: {
      type: "string",
      description:
        "Polished prompt written in 1–4 sentences, cohesive and grammatical, with no quotation marks.",
    },
    suggestions: {
      type: "array",
      description:
        "Include ONE entry for EVERY required element, providing suggestions to enhance detail and specificity. Each suggestion is short Markdown with 2–4 bullets.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          element: { type: "string" },
          suggestion: {
            type: "string",
            description:
              "Markdown with 2–4 bullets. Each bullet encourages specificity and gives concrete dials plus a tiny *italic* example.",
          },
        },
        required: ["element", "suggestion"],
      },
    },
  },
  required: ["initialPrompt", "suggestions"],
};

// NEW: mid review now returns a review for EVERY element
const midReviewSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    polishedDraft: {
      type: "string",
      description:
        "Lightly copy-edited version of the user's first revision (fix grammar/flow only; do not add new content).",
    },
    elementReviews: {
      type: "array",
      description:
        "One entry for EVERY required element of this prompt type.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          element: { type: "string" },
          isSufficient: { type: "boolean" },
          note: {
            type: "string",
            description:
              "One crisp sentence: either praise ('sufficient as-is') or a very short pointer to what detail would help.",
          },
        },
        required: ["element", "isSufficient", "note"],
      },
    },
    suggestions: {
      type: "array",
      description:
        "ONLY include elements where isSufficient=false. Each entry provides detailed enhancement suggestions as Markdown with 2–4 bullets. Must be empty array if all elements are sufficient.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          element: { type: "string" },
          suggestion: { type: "string" },
        },
        required: ["element", "suggestion"],
      },
    },
  },
  required: ["polishedDraft", "elementReviews", "suggestions"],
};

const finalReviewSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    isReady: {
      type: "boolean",
      description:
        "True if the revised prompt is clear, cohesive, and production-ready without further edits.",
    },
    polishedPrompt: {
      type: "string",
      description:
        "Lightly copy-edited version of the user's final submission (no new content).",
    },
    finalNotes: {
      type: "string",
      description:
        "Comprehensive final recommendations (3-6 sentences). If isReady=true, summarize strengths and suggest optional enhancements. If isReady=false, provide specific actionable advice. Always include practical usage tips.",
    },
  },
  required: ["isReady", "polishedPrompt", "finalNotes"],
};

/* =========================
   System Prompts
   ========================= */
function commonSuggestionRules(promptType) {
  const isVideo = promptType === "video";
  return `
SUGGESTIONS FORMAT (REQUIRED FOR ALL ELEMENTS):
- For EVERY required element, output ONE "suggestion" as **Markdown** with **2–4 bullets**.
- Each bullet should (a) ask a guiding question, (b) offer 1–2 concrete dials, and (c) include a tiny example in *italics*.
- Keep each element's suggestion under ~80 words.
- Even if an element seems sufficient, provide enhancement suggestions to make it more specific and detailed.

ELEMENT HINTS:
- Subject: identity, traits, age, emotion, posture; *e.g., rugged courier, mid-40s, rain-spattered, shoulders hunched*.
- Action: strong verb + manner/speed; *e.g., trudging slowly through traffic*.
- Scene: place, time, weather, era; *e.g., neon alley at dusk, light rain*.
- Ambiance: mood, lighting, palette; *e.g., moody, cool blues and cyan highlights*.
- Style: medium/influence/era/stock; *e.g., illustrative ink wash, 1970s sci-fi paperback vibe*.
- Composition: shot size/angle/framing/DoF; *e.g., medium close-up, low angle, shallow depth*.
${isVideo ? `- Camera Motion: move/rig/speed; *e.g., slow dolly forward, stabilized gimbal*.
- Shot Duration: seconds or range; *e.g., a 6-second shot, single beat*.
- Pacing: rhythm/tempo/energy; *e.g., measured pacing, a breath between movements*.` : ""}
`.trim();
}

function buildSystemPrompt(promptType) {
  const elems = REQUIRED_ELEMENTS[promptType].join(", ");
  const isVideo = promptType === "video";
  return `
You are a "Prompt Composer".

USER PROVIDES: values for ${promptType} elements: ${elems}. (Some may be empty.)

TASK A — INITIAL PROMPT:
- Write a NEW prompt from scratch (1–4 complete sentences) that integrates ONLY non-empty elements.
- Vivid, cohesive, grammatical. Present tense, active voice.
- NO quotation marks anywhere. Clean punctuation; no trailing fragments.
${isVideo ? `` : `
- IMAGES ONLY: Focus on visual elements only. Do not suggest sound, scent, taste, or other non-visual sensory details that cannot be depicted in a still image.`}

${isVideo ? `VIDEO INTEGRATION:
- "Camera Motion": natural clause (e.g., "with a slow dolly forward" / "handheld with subtle sway").
- "Shot Duration": phrase like "a 5-second shot".
- "Pacing": short natural phrasing ("with brisk pacing", "lingers slowly").` : ""}

TASK B — PER-ELEMENT SUGGESTIONS:
${commonSuggestionRules(promptType)}
${isVideo ? `` : `
- IMAGES ONLY: Keep all suggestions focused on what can be visually depicted in a still image. Avoid mentioning audio, scent, taste, or temporal elements that don't apply to static images.`}

IMPORTANT: You MUST provide suggestions for ALL ${REQUIRED_ELEMENTS[promptType].length} required elements (${REQUIRED_ELEMENTS[promptType].join(", ")}), regardless of how much detail the user initially provided. This helps users enhance every aspect of their prompt.

OUTPUT: JSON per schema.
`.trim();
}

function midReviewSystemPrompt(promptType) {
  const elems = REQUIRED_ELEMENTS[promptType].join(", ");
  const isVideo = promptType === "video";
  return `
You are a "Prompt Reviewer".

INPUT: a single revised ${promptType} prompt written by the user.

TASK A — POLISH:
- Produce a lightly copy-edited version (polishedDraft) fixing grammar/flow only.
- Do NOT introduce new facts or change meaning.
${isVideo ? `` : `
- IMAGES ONLY: Ensure the prompt focuses on visual elements only. Remove any references to sound, scent, taste, or other non-visual sensory details.`}

TASK B — ELEMENT REVIEWS (REQUIRED):
- For EVERY required element (${elems}), add one entry to "elementReviews":
  - element (string),
  - isSufficient (boolean): does the current draft include enough, specific detail for this element?,
  - note (1 crisp sentence): praise if sufficient, or a brief pointer to what additional detail would help.
${isVideo ? `` : `
- IMAGES ONLY: When evaluating sufficiency, consider only visual details that can be depicted in a still image.`}

TASK C — OPTIONAL DETAILED SUGGESTIONS:
${commonSuggestionRules(promptType)}
- CRITICAL: Only include an element in "suggestions" if isSufficient=false for that element.
- If an element has isSufficient=true, do NOT include it in the suggestions array.
- The suggestions array should ONLY contain elements that need more work (where isSufficient=false).
${isVideo ? `` : `
- IMAGES ONLY: All suggestions must focus on visual elements that can be depicted in a still image. Do not suggest audio, scent, taste, or temporal elements.`}

RULES:
- "elementReviews" must include EVERY element; do not omit any.
- Suggestions array may be empty if the draft is already sufficiently detailed.

OUTPUT: JSON per schema.
`.trim();
}

function finalReviewSystemPrompt(promptType) {
  const isVideo = promptType === "video";
  return `
You are a "Prompt Finisher" providing comprehensive final recommendations.

INPUT: A user's FINAL ${promptType} prompt after they've incorporated suggestions.

GOALS:
- Decide if it's production-ready as-is (isReady).
- Produce a lightly copy-edited version (polishedPrompt) fixing only grammar/flow/awkwardness (no new content).
${isVideo ? `` : `
- IMAGES ONLY: Ensure all content focuses on visual elements that can be depicted in a still image.`}
- Provide comprehensive final recommendations (finalNotes) that the user can act on independently:
  * If isReady=true: Summarize what works well and suggest 2-3 optional enhancements they could try
  * If isReady=false: Provide specific, actionable advice for improvement
  * Always include practical tips for getting better results with this type of prompt
  * Keep finalNotes conversational and encouraging (3-6 sentences)
${isVideo ? `` : `
  * IMAGES ONLY: All recommendations must focus on visual elements only. Do not suggest sound, scent, taste, or other non-visual sensory details.`}

Return a single JSON object conforming to the schema.
`.trim();
}

/* =========================
   Helpers
   ========================= */
const clean = (s) =>
  (s || "")
    .replace(/\s+,/g, ",")
    .replace(/\s+\./g, ".")
    .replace(/,\s*,/g, ", ")
    .replace(/\s{2,}/g, " ")
    .replace(/"([^"]*)"/g, "$1")
    .trim();

/* =========================
   POST handler
   ========================= */
export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "build") {
      const { promptType, elements } = body; // elements: { [elementName]: string }
      if (!promptType || !elements) {
        return NextResponse.json({ error: "Missing promptType or elements." }, { status: 400 });
      }

      const elementsForType = REQUIRED_ELEMENTS[promptType] || REQUIRED_ELEMENTS.image;
      const sanitized = elementsForType.map((el) => ({
        element: el,
        text: (elements[el] || "").trim(),
      }));

      const response = await openai.responses.create({
        model: "gpt-4o",
        input: [
          { role: "system", content: buildSystemPrompt(promptType) },
          {
            role: "user",
            content:
              "Here are the user-provided elements as an array of {element, text} objects:\n" +
              JSON.stringify(sanitized),
          },
        ],
        text: { format: { type: "json_schema", name: "BuildFromElements", schema: buildSchema, strict: true } },
      });

      const result = JSON.parse(response.output_text);

      return NextResponse.json({
        initialPrompt: clean(result.initialPrompt),
        suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
      });
    }

    if (action === "midReview") {
      const { promptType, draftPrompt } = body;
      if (!promptType || !draftPrompt) {
        return NextResponse.json({ error: "Missing promptType or draftPrompt." }, { status: 400 });
      }

      const response = await openai.responses.create({
        model: "gpt-4o",
        input: [
          { role: "system", content: midReviewSystemPrompt(promptType) },
          { role: "user", content: draftPrompt },
        ],
        text: { format: { type: "json_schema", name: "MidReview", schema: midReviewSchema, strict: true } },
      });

      const result = JSON.parse(response.output_text);

      return NextResponse.json({
        polishedDraft: clean(result.polishedDraft),
        elementReviews: Array.isArray(result.elementReviews) ? result.elementReviews : [],
        suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
      });
    }

    if (action === "finalReview") {
      const { revisedPrompt, promptType } = body;
      if (!revisedPrompt || !revisedPrompt.trim()) {
        return NextResponse.json({ error: "Missing revisedPrompt." }, { status: 400 });
      }
      if (!promptType) {
        return NextResponse.json({ error: "Missing promptType for final review." }, { status: 400 });
      }

      const response = await openai.responses.create({
        model: "gpt-4o-mini",
        input: [
          { role: "system", content: finalReviewSystemPrompt(promptType) },
          { role: "user", content: revisedPrompt },
        ],
        text: { format: { type: "json_schema", name: "FinalReview", schema: finalReviewSchema, strict: true } },
      });

      const result = JSON.parse(response.output_text);

      return NextResponse.json({
        isReady: !!result.isReady,
        polishedPrompt: clean(result.polishedPrompt),
        finalNotes: result.finalNotes || "No additional recommendations provided.",
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("API error:", error);
    const message = error instanceof OpenAI.APIError ? error.message : "Internal error.";
    return NextResponse.json({ error: "Failed to complete request.", details: message }, { status: 500 });
  }
}
