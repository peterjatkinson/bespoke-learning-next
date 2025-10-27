import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.SMO_OPENAI_API_KEY,
});

// System prompt for the AI assistant
const systemPrompt = `You are an expert statistics tutor specializing in educational research and effect sizes.
Your role is to help students understand how to calculate and interpret effect sizes, particularly Cohen's d.

Key responsibilities:
1. Explain statistical concepts clearly and in simple terms for students who may be new to statistics
2. Break down formulas step-by-step
3. Help students understand WHY each step is necessary, not just HOW to do it
4. Provide practical examples and interpretations
5. Be encouraging and patient
6. When students make errors, help them understand where they went wrong

Topics you should be prepared to discuss:
- What effect sizes are and why they matter in educational research
- The difference between statistical significance and practical significance
- How to calculate pooled standard deviation
- How to calculate and interpret Cohen's d
- Small, medium, and large effect sizes
- When to use different effect size measures
- Common mistakes in calculating effect sizes

Always be supportive and educational in your tone. Remember that students are learning, so use analogies and real-world examples when helpful.`;

let conversationHistory = [];

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, context } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    console.log("Received message:", message);
    console.log("Context:", context);

    // Add user message to history
    conversationHistory.push({ role: "user", content: message });

    // Prepare messages with system prompt and context
    const messages = [
      { role: "system", content: systemPrompt },
      {
        role: "system",
        content: `The student is currently at this stage: ${context || 'unknown'}. Tailor your response to be most helpful for their current step.`
      },
      ...conversationHistory
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = completion.choices[0].message.content;

    // Add assistant response to history
    conversationHistory.push({ role: "assistant", content: assistantMessage });

    // Keep conversation history manageable (last 10 messages)
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }

    console.log("Assistant response:", assistantMessage);

    return NextResponse.json({
      message: assistantMessage,
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: "An error occurred while processing your request.",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
