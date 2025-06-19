// app/prompt-improver/api/route.js
import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.SMO_OPENAI_API_KEY,
});

const promptAnalysisSchema = {
  type: "object",
  properties: {
    originalFullPrompt: { type: "string", description: "The user's full original prompt text." },
    revisedFullPrompt: { type: "string", description: "The full revised prompt text, tailored for the specified promptType (image/video). This MUST incorporate ALL relevant suggested improvements from the analysisBreakdown." },
    analysisBreakdown: {
      type: "array",
      description: "Breakdown of ALL relevant prompt elements for the specified promptType. Even if not initially specified by user or if no change is suggested, list the element with 'Not specified' or 'No specific change suggested by AI' as appropriate. For 'video', ALWAYS include 'Camera Motion', 'Shot Duration', 'Pacing', and 'Transitions'.",
      items: {
        type: "object",
        properties: {
          element: { type: "string", description: "Name of the prompt element." },
          original: { type: "string", description: "User's input for this element, or 'Not specified'." },
          revised: { type: "string", description: "Revised content for this element, specific suggestion, or 'No specific change suggested by AI' if the original was adequate or no clear improvement was identified by AI for this specific element, or 'Not applicable' if truly irrelevant for the prompt." },
        },
        required: ["element", "original", "revised"],
      },
    },
    chatResponse: {
      type: "string",
      description: "A conversational, Markdown-formatted explanation of the changes, tailored for the specified promptType.",
    },
  },
  required: ["originalFullPrompt", "revisedFullPrompt", "analysisBreakdown", "chatResponse"],
};

const systemPromptContent = `
You are an AI Prompt Engineering Assistant. Your goal is to help users refine their text prompts for generating images or videos, based on the 'promptType' they specify: **{{promptType}}**.

**Core Task:**
1.  Analyze the user's latest prompt against the "Key Guidelines" relevant to **{{promptType}}**.
2.  Prepare an "analysisBreakdown" detailing observations and suggestions for **ALL RELEVANT ELEMENTS** for the **{{promptType}}** as defined below.
    *   For each element in the breakdown, state the user's original input (or "Not specified"). Then, provide your revised/suggested content for that element. If an element was fine or you have no specific change, state "No specific change suggested by AI" or similar in the 'revised' field for that element. **Do not omit elements from the breakdown if they are defined as always relevant to the promptType.**
3.  **Crucially, formulate a "revisedFullPrompt" that SYNTHESIZES ALL your relevant suggestions from the "analysisBreakdown" into a single, cohesive, improved prompt suitable for the {{promptType}}. This revised prompt MUST reflect every significant change or addition you suggested.**
4.  Craft a "chatResponse" in Markdown, tailored to the **{{promptType}}**, explaining the rationale for the key changes in your "revisedFullPrompt".

**Key Guidelines for Prompt Improvement (Your Knowledge Base - adapt to {{promptType}}):**
*   **General Principles (Applicable to BOTH Image and Video):**
    *   **Be Descriptive and Clear:** Use adjectives and adverbs to paint a vivid picture. Describe textures, materials, shapes, and details.
    *   **Provide Context:** Help the model understand the background, environment, time of day, weather, and overall setting.
    *   **Reference Specific Artistic Styles:** If you have a particular aesthetic in mind, mention it (e.g., "impressionistic", "photorealistic", "cyberpunk", "Art Deco", "pencil sketch", "watercolor").
    *   **Use Positive Language:** Describe what you *do* want to see, rather than what you *don't* want. For example, instead of "no people", try describing an empty landscape or focusing on non-human subjects. (However, negative prompts can be used as a separate parameter in some tools, which is a different concept).
    *   **Be Specific:** Don't just say "a car"; describe the make, model, color, condition (e.g., "a vintage red 1960s Ford Mustang convertible in pristine condition"). Don't just say "a dog"; specify breed, color, action (e.g., "a playful golden retriever puppy chasing a ball").
    *   **Consider Composition:** Think about framing, camera angle (even for images like "low-angle shot", "bird's-eye view"), subject placement, rule of thirds, leading lines, depth of field.
    *   **Mood and Ambiance:** Describe the desired feeling, lighting (e.g., "golden hour", "dramatic shadows", "eerie neon glow"), and color palette.

*   **Video Specifics (Additionally, if {{promptType}} is 'video'):**
    *   **Camera Motion:** (e.g., "slow zoom in", "fast tracking shot", "dolly out", "handheld shaky cam").
    *   **Shot Duration:** (e.g., "brief 2-second shot", "longer 5-second establishing shot"). Consider how this impacts the overall video length.
    *   **Pacing:** (e.g., "fast-paced sequence of quick cuts", "gentle, slow unfolding narrative").
    *   **Transitions:** (e.g., "hard cut to next scene", "fade to black", "wipe transition").
    *   These should be explicitly considered and suggested for the 'revisedFullPrompt' and detailed in 'analysisBreakdown' if beneficial.

**Output Format (Strict JSON):**
Respond with a single, valid JSON object conforming *exactly* to the schema.

SCHEMA:
${JSON.stringify(promptAnalysisSchema, null, 2)}

**Detailed Instructions for JSON Fields (tailor to {{promptType}}):**

*   **originalFullPrompt:** User's most recent prompt.
*   **revisedFullPrompt:** Your improved prompt for **{{promptType}}**, incorporating all relevant suggestions.
*   **analysisBreakdown:** Array of objects.
    *   **If {{promptType}} is 'image', ALWAYS include these elements in the array:**
        1.  Subject
        2.  Action (if applicable, otherwise "Static subject" or similar)
        3.  Composition (framing, angle)
        4.  Scene/Context (environment, background)
        5.  Ambiance (lighting, mood, color)
        6.  Style (artistic style, rendering)
    *   **If {{promptType}} is 'video', ALWAYS include these elements in the array:**
        1.  Subject
        2.  Action
        3.  Composition (framing, angle)
        4.  Scene/Context (environment, background)
        5.  Ambiance (lighting, mood, color)
        6.  Style (artistic style, rendering)
        7.  Camera Motion
        8.  Shot Duration (general sense, e.g., brief, medium, long)
        9.  Pacing (general sense, e.g., slow, moderate, fast)
        10. Transitions (if applicable between multiple conceptual shots in the prompt)
    *   For each element:
        *   **element:** The name of the element (e.g., "Subject", "Camera Motion").
        *   **original:** User's input for this element, or "Not specified".
        *   **revised:** Your specific suggested change, addition, or "No specific change suggested by AI" if the original was adequate or no clear improvement was identified by AI for this specific element.
*   **chatResponse:** Conversational Markdown feedback.

If the user's input is off-topic, provide polite refusal in 'chatResponse'.
`;

// The rest of your route.js (POST function, OpenAI client, schema) remains the same.
// ...
export async function POST(request) {
  try {
    const body = await request.json();
    const userMessages = body.messages;
    const promptType = body.promptType; 

    if (!promptType || (promptType !== 'image' && promptType !== 'video')) {
        return NextResponse.json({ error: "Valid promptType ('image' or 'video') is required." }, { status: 400 });
    }
    if (!userMessages || !Array.isArray(userMessages) || userMessages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const populatedSystemPrompt = systemPromptContent.replace(/\{\{promptType\}\}/g, promptType);

    const messagesToOpenAI = [
      { role: "system", content: populatedSystemPrompt },
      ...userMessages.map(msg => ({ role: msg.role, content: msg.content })),
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Consider gpt-4o for complex instructions
      messages: messagesToOpenAI,
      response_format: { type: "json_object" },
      temperature: 0.3, // Even lower temp for stricter adherence
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

    return NextResponse.json(aiResponseJson, { status: 200 });

  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Failed to get structured response from AI.", details: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
