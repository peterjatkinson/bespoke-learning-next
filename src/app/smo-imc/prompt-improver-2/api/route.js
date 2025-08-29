// app/prompt-improver/api/route.js
import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.SMO_OPENAI_API_KEY,
});

/**
 * Strict JSON schema: top-level and nested objects set additionalProperties:false.
 * We’ve removed minDetailPolicy completely from the response schema.
 */
const promptAnalysisSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    originalFullPrompt: { type: "string" },
    revisedFullPrompt: { type: "string" },
    analysisBreakdown: {
      type: "array",
      description:
        "ONLY include elements that are already accepted (past accepted + newly accepted this turn). Do NOT include pending or uncollected elements.",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          element: { type: "string" },
          original: { type: "string" },
          revised: { type: "string" },
          isAccepted: {
            type: "boolean",
            description:
              "Must be true for every item returned here; this list only contains accepted elements.",
          },
        },
        required: ["element", "original", "revised", "isAccepted"],
      },
    },
    chatResponse: {
      type: "string",
      description:
        "Conversational, Markdown-formatted message that (1) acknowledges user input, (2) states acceptance or requests more detail, and (3) introduces the next element if and only if the current one was accepted.",
    },
    pendingElement: {
      type: "string",
      description:
        "The element currently being collected next. If the last input was not accepted, keep this the SAME as before.",
    },
    acceptedThisTurn: { type: "boolean" },
    acceptedElement: {
      type: "string",
      description: "If acceptedThisTurn = true, which element was accepted.",
    },
    acceptedElements: {
      type: "array",
      items: { type: "string" },
      description:
        "Full list of accepted elements after processing the current turn.",
    },
    requiredElements: {
      type: "array",
      items: { type: "string" },
      description:
        "Canonical element order for the given promptType (image/video).",
    },
  },
  required: [
    "originalFullPrompt",
    "revisedFullPrompt",
    "analysisBreakdown",
    "chatResponse",
    "pendingElement",
    "acceptedThisTurn",
    "acceptedElement",
    "acceptedElements",
    "requiredElements",
  ],
};

const REQUIRED_ELEMENTS = {
  image: ["Subject", "Action", "Scene/Context", "Style", "Ambiance", "Composition"],
  video: [
    "Subject",
    "Action",
    "Scene/Context",
    "Style",
    "Ambiance",
    "Composition",
    "Camera Motion",
    "Shot Duration",
    "Pacing",
    "Transitions",
  ],
};

/**
 * Softer, judgment-based guidance (no precise word counts).
 * These are embedded in the system prompt (not returned to the client).
 */
const DETAIL_GUIDANCE = {
  Subject: {
    acceptIf:
      "Contains at least one specific detail (descriptor, proper noun, model/type, or distinctive attribute) — e.g., color, age, texture, style, or a proper name.",
    nudgeIf:
      "Only 1–2 generic words (e.g., 'cat', 'car') with no descriptors. Ask for a bit more detail, but allow user to override with 'accept as is'.",
    examplesAccept: [
      "weathered red lighthouse",
      "1950s Gibson Les Paul guitar",
      "elderly Japanese calligrapher",
    ],
  },
  Action: {
    acceptIf:
      "Includes a clear verb phrase and at least one qualifying detail (how/tempo/intent).",
    nudgeIf:
      "Single verb with no context (e.g., 'running'). Ask for manner or context, but allow 'accept as is'.",
    examplesAccept: ["sprinting through rain", "whispering a secret", "meticulously engraving"],
  },
  "Scene/Context": {
    acceptIf:
      "Mentions environment/location and one extra anchor such as time-of-day, weather, era, or key background element.",
    nudgeIf:
      "Vague place with no anchors (e.g., 'outside'). Nudge for time/weather/era, but allow 'accept as is'.",
    examplesAccept: ["night market in Taipei", "sunlit Victorian conservatory"],
  },
  Style: {
    acceptIf:
      "Names a style/aesthetic or concrete reference (photographic stock, art movement, medium).",
    nudgeIf:
      "Purely generic ('nice', 'cool'). Suggest a style or reference, but allow 'accept as is'.",
    examplesAccept: ["cinematic, Kodak Portra", "Art Deco illustration", "photorealistic render"],
  },
  Ambiance: {
    acceptIf:
      "Conveys mood/feeling and suggests lighting or color tone/palette.",
    nudgeIf:
      "Only 'happy'/'sad' with no lighting/color cue. Nudge for light/palette, but allow 'accept as is'.",
    examplesAccept: ["hopeful, warm golden-hour glow", "brooding, cool blue shadows"],
  },
  Composition: {
    acceptIf:
      "Specifies framing/camera angle or lens/DoF guidance.",
    nudgeIf:
      "Just 'good composition'. Nudge for angle/framing, but allow 'accept as is'.",
    examplesAccept: ["low-angle medium shot, shallow DoF", "rule of thirds, wide 24mm"],
  },
  "Camera Motion": {
    acceptIf: "Names a motion type (dolly, pan, handheld, crane) with a qualifier (slow/gentle/etc.).",
    nudgeIf: "Just 'move camera'.",
    examplesAccept: ["slow dolly-in", "gentle pan right", "handheld tracking"],
  },
  "Shot Duration": {
    acceptIf: "Includes a rough duration (e.g., '2–3 seconds', 'brief 1s cut').",
    nudgeIf: "No duration at all.",
    examplesAccept: ["2–3 seconds", "5-second establishing shot"],
  },
  Pacing: {
    acceptIf: "Provides a tempo/energy cue (fast cuts, lingering, measured).",
    nudgeIf: "No pacing hint.",
    examplesAccept: ["fast-paced with quick cuts", "slow, lingering cadence"],
  },
  Transitions: {
    acceptIf: "Names a transition (cut, dissolve, match cut, fade).",
    nudgeIf: "No transition info.",
    examplesAccept: ["hard cut", "cross-dissolve", "match cut"],
  },
};

const systemPromptContent = `You are "Prompt Coach", an AI that builds refined prompts step by step.

Inputs you will receive each turn:
- promptType: "image" or "video"
- currentPromptToRefine: the last accepted full prompt so far (may be "")
- userRequest: the user's latest message intended to add/adjust ONE element
- acceptedElements: array of element names already accepted so far
- userOverride: boolean if the user explicitly wants to keep the input minimal ("accept as is", "keep it minimal", etc.)

Your tasks each turn:

1) Determine which element is currently being collected ("pendingElement"). If none yet, start with "Subject", then "Action", "Scene/Context", "Style", "Ambiance", "Composition". For 'video', continue with "Camera Motion", "Shot Duration", "Pacing", "Transitions". Do NOT skip ahead.

2) Apply a UNIVERSAL PRE-FLIGHT GATE:
   - IF userOverride === true → accept the element even if minimal.
   - ELSE:
       • If the input is just 1–2 generic words with no specificity, do NOT accept.
       • Each element has its own minimum detail expectations:
         - Subject → should name type/object/person with at least one descriptor (e.g., color, age, condition, style).
         - Action → must include a verb phrase; bare single verbs ("run") are not sufficient. Encourage manner/context.
         - Scene/Context → must mention a location/environment AND at least one anchor (time of day, weather, or cultural/era detail).
         - Style → should give a concrete style or reference (art medium, photographic stock, art movement).
         - Ambiance → must mention mood/feeling AND lighting or color palette.
         - Composition → should specify framing/camera angle or lens/DoF.
         - Camera Motion → should specify a camera movement type, ideally with a qualifier.
         - Shot Duration → should include a numeric or approximate duration.
         - Pacing → should describe the tempo/energy of editing.
         - Transitions → should name a transition type.
   - If insufficient → acceptedThisTurn=false, keep pendingElement unchanged, and revisedFullPrompt identical to original. In chatResponse: explain clearly what’s missing and give 2–3 compact suggestions. Remind user they can reply "accept as is".

3) If input IS sufficient (or userOverride=true):
   - acceptedThisTurn=true; acceptedElement=pendingElement.
   - Update revisedFullPrompt by merging this element.
   - Add this element to analysisBreakdown with isAccepted=true.
   - Advance pendingElement and briefly introduce it with 1–2 examples.

4) analysisBreakdown must ONLY include elements that are accepted (past ones + new this turn).

5) Never reveal the full revised prompt in chatResponse (UI shows it). Just summarize changes and guide next step.

Return ONLY a JSON object matching the schema.
`;

export async function POST(request) {
  const reqId = `pc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  try {
    const body = await request.json();
    const promptType = body.promptType;
    const currentPromptToRefine = body.currentPromptToRefine ?? "";
    const userRequest = body.userRequest ?? "";
    const acceptedElements = Array.isArray(body.acceptedElements) ? body.acceptedElements : [];
    const clientConversationId = body.conversationId || null;

    if (!promptType || (promptType !== "image" && promptType !== "video")) {
      return NextResponse.json(
        { error: "Valid promptType ('image' or 'video') is required." },
        { status: 400 }
      );
    }
    if (userRequest === undefined) {
      return NextResponse.json({ error: "userRequest is required." }, { status: 400 });
    }

    // NEW: detect explicit override phrases from the user
    const lower = (userRequest || "").toLowerCase();
    const userOverride =
      /\b(accept as is|keep it minimal|that's enough|that’s enough|skip for now)\b/i.test(lower);

    const input = [
      { role: "system", content: systemPromptContent },
      {
        role: "user",
        content:
          `promptType: ${promptType}\n` +
          `currentPromptToRefine: """${currentPromptToRefine}"""\n` +
          `acceptedElements: ${JSON.stringify(acceptedElements)}\n` +
          `userOverride: ${userOverride}\n` +   // <-- pass explicit override flag
          `userRequest: """${userRequest}"""\n`,
      },
    ];

    console.log(`[PromptCoach][${reqId}] → OpenAI (Responses)`, {
      promptType,
      acceptedElements,
      currentPromptToRefineLength: currentPromptToRefine.length,
      clientConversationId,
      userOverride,
    });

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input,
      ...(clientConversationId ? { conversation: clientConversationId } : {}),
      temperature: 0.1,
      text: {
        format: {
          type: "json_schema",
          name: "PromptAnalysis",
          schema: promptAnalysisSchema,
          strict: true,
        },
      },
    });

    const raw =
      response.output_text ||
      (response.output?.[0]?.content?.[0]?.text ?? "");

    console.log(`[PromptCoach][${reqId}] ← OpenAI raw content\n${raw}`);
    if (response?.usage) {
      console.log(`[PromptCoach][${reqId}] ← Token usage`, response.usage);
    }

    if (!raw) throw new Error("AI returned no content.");

    let aiResponseJson;
    try {
      aiResponseJson = JSON.parse(raw);

      // Normalize requiredElements
      const requiredElements = REQUIRED_ELEMENTS[promptType];
      if (
        !Array.isArray(aiResponseJson.requiredElements) ||
        aiResponseJson.requiredElements.length !== requiredElements.length
      ) {
        aiResponseJson.requiredElements = requiredElements;
      }

      // Keep originalFullPrompt consistent with input
      if (aiResponseJson.originalFullPrompt !== currentPromptToRefine) {
        aiResponseJson.originalFullPrompt = currentPromptToRefine;
      }

      // If not accepted, keep revisedFullPrompt unchanged
      if (aiResponseJson.acceptedThisTurn === false) {
        aiResponseJson.revisedFullPrompt = currentPromptToRefine;
      }

      // analysisBreakdown: only accepted items with isAccepted=true
      if (!Array.isArray(aiResponseJson.analysisBreakdown)) {
        aiResponseJson.analysisBreakdown = [];
      } else {
        aiResponseJson.analysisBreakdown = aiResponseJson.analysisBreakdown.filter(
          (it) => it && it.isAccepted === true
        );
      }

      // acceptedElements: prior + any new
const acceptedSet = new Set(acceptedElements);
if (aiResponseJson.acceptedThisTurn && aiResponseJson.acceptedElement) {
  acceptedSet.add(aiResponseJson.acceptedElement);

  // FIX: if model forgot to include the new element in analysisBreakdown, add it explicitly
  const alreadyIncluded = aiResponseJson.analysisBreakdown.some(
    (it) => it.element === aiResponseJson.acceptedElement
  );
  if (!alreadyIncluded) {
    aiResponseJson.analysisBreakdown.push({
      element: aiResponseJson.acceptedElement,
      original: currentPromptToRefine,
      revised: aiResponseJson.revisedFullPrompt,
      isAccepted: true,
    });
  }
}
aiResponseJson.acceptedElements = Array.from(acceptedSet);

      console.log(
        `[PromptCoach][${reqId}] → Client normalized JSON\n${JSON.stringify(aiResponseJson, null, 2)}`
      );
    } catch (e) {
      console.error(`[PromptCoach][${reqId}] JSON parse error:`, e);
      console.error(`[PromptCoach][${reqId}] Raw content that failed to parse:\n${raw}`);
      throw new Error("AI returned malformed JSON.");
    }

    // Return OpenAI’s conversation id so the client can reuse it
    return NextResponse.json(
      { ...aiResponseJson, conversationId: response.conversation },
      { status: 200 }
    );
  } catch (error) {
    console.error(`[PromptCoach][${reqId}] Error in API route:`, error);
    return NextResponse.json(
      {
        error: "Failed to get structured response from AI.",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
