// app/api/prompt-improver/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { promptType, currentPrompt, userRequest } = body;

    if (!promptType || (promptType !== 'image' && promptType !== 'video')) {
      return NextResponse.json({ error: "Valid promptType ('image' or 'video') is required." }, { status: 400 });
    }
    
    if (!currentPrompt) {
      return NextResponse.json({ error: "currentPrompt is required." }, { status: 400 });
    }

    const systemPrompt = `You are an AI Prompt Engineering Assistant. Your goal is to help users refine their text prompts for generating ${promptType}s.

**Core Task:**
1. Analyze the current prompt: "${currentPrompt}"
2. Consider the user's request: "${userRequest}"
3. Apply prompt engineering best practices for ${promptType} generation

**Key Guidelines for ${promptType.charAt(0).toUpperCase() + promptType.slice(1)} Prompts:**
- Be descriptive and clear: Use adjectives and adverbs to paint a vivid picture
- Provide context: Help understand the background, environment, time of day, weather, setting
- Reference specific artistic styles: mention aesthetic (photorealistic, cinematic, artistic style, etc.)
- Use positive language: Describe what you DO want to see
- Be specific: Don't just say "a car"; describe make, model, color, condition
- Consider composition: Think about framing, camera angle, subject placement, depth of field
- Mood and ambiance: Describe desired feeling, lighting, color palette

${promptType === 'video' ? `
**Video Specifics:**
- Camera Motion: (slow zoom in, tracking shot, dolly out, handheld, static)
- Shot Duration: (brief 2-second shot, longer 5-second establishing shot)
- Pacing: (fast-paced sequence, gentle slow unfolding)
- Transitions: (hard cut, fade to black, wipe transition)
` : ''}

Respond with a JSON object containing:
- originalFullPrompt: The current prompt being analyzed
- revisedFullPrompt: Your improved version incorporating best practices
- analysisBreakdown: Array of objects with {element, original, revised} for each key element
- chatResponse: A conversational summary of key improvements made

Elements to analyze for ${promptType}: ${promptType === 'video' ? 'Subject, Action, Composition, Scene/Context, Ambiance, Style, Camera Motion, Shot Duration, Pacing, Transitions' : 'Subject, Action, Composition, Scene/Context, Ambiance, Style'}

DO NOT OUTPUT ANYTHING OTHER THAN VALID JSON.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        messages: [
          { role: "user", content: systemPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Anthropic API Error:", response.status, errorData);
      throw new Error(`Anthropic API request failed: ${response.status}`);
    }

    const data = await response.json();
    let responseText = data.content[0].text;
    
    // Clean up potential markdown formatting
    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    try {
      const parsedResponse = JSON.parse(responseText);
      return NextResponse.json(parsedResponse);
    } catch (parseError) {
      console.error("Failed to parse Claude response as JSON:", responseText);
      // Return a fallback response
      return NextResponse.json({
        originalFullPrompt: currentPrompt,
        revisedFullPrompt: `${currentPrompt}, photorealistic, high quality, detailed composition`,
        analysisBreakdown: [{
          element: "Style",
          original: "Basic prompt",
          revised: "Added photorealistic style and quality descriptors"
        }],
        chatResponse: "I've made some basic improvements to your prompt. The AI response wasn't in the expected format, so this is a simplified enhancement."
      });
    }

  } catch (error) {
    console.error("Error in prompt improver API:", error);
    return NextResponse.json(
      { error: "Failed to analyze prompt", details: error.message },
      { status: 500 }
    );
  }
}

// Optional: Add other HTTP methods if needed
export async function GET() {
  return NextResponse.json({ message: "Prompt Improver API is running" });
}