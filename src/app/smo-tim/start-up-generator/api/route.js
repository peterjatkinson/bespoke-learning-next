// /app/api/generate-startup-ideas/route.js
import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.SMO_OPENAI_API_KEY, // Ensure your API key is set in your environment variables
});

// Define the JSON schema for the start-up ideas response.
const startupIdeaSchema = {
  type: "object",
  properties: {
    ideas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          targetMarket: { type: "string" },
          potentialChallenges: { type: "array", items: { type: "string" } },
          revenueStreams: { type: "array", items: { type: "string" } },
        },
        required: [
          "title",
          "description",
          "targetMarket",
          "potentialChallenges",
          "revenueStreams",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["ideas"],
  additionalProperties: false,
};

export async function POST(request) {
  try {
    // Parse the incoming JSON body from the request.
    const body = await request.json();
    const userIndustry = body.industry ? body.industry.trim() : "";

    let firstIndustry, secondIndustry;
    if (userIndustry) {
      // If a user provided an industry, use it for both ideas.
      firstIndustry = userIndustry;
      secondIndustry = userIndustry;
    } else {
      // Otherwise, determine industries based on the current seconds.
      const now = new Date();
      const seconds = now.getSeconds(); // 0 - 59

      const industries = [
        "technology",
        "finance",
        "healthcare",
        "entertainment",
        "education",
        "luxury goods",
        "retail",
        "hospitality",
        "transportation",
        "real estate",
        "event planning",
        "pharma",
        "cybersecurity",
        "design",
        "gaming",
        "travel",
        "media",
        "sports",
        "e-commerce",
        "consulting",
      ];

      firstIndustry = industries[seconds % industries.length];
      secondIndustry = industries[(seconds + 1) % industries.length];
    }

    // Create the prompts for the OpenAI API.
    const systemPrompt = `
You are an start-up ideation expert.
Generate structured and creative start-up ideas.
Each idea must include:
- Title
- Description (a detailed explanation of the idea)
- Target Market (who would benefit from this idea)
- Potential Challenges (a list of challenges the start-up might face)
- Revenue Streams (a list of potential revenue sources)

The start-up does not need to be based around emerging technologies.

Use British English spellings and no Oxford commas. And sentence case for headings (i.e. always start with a capital letter for the first word of a heading, but not for subsequent words of a heading).

Follow the JSON schema exactly.
    `.trim();

    const userPrompt = `
Generate two innovative start-up ideas with no specific focus on any business area or industry.
Tailor the ideas for the industries as follows:
- The first idea is tailored for the industry "${firstIndustry}".
- The second idea is tailored for the industry "${secondIndustry}".
Respond using only valid JSON that conforms exactly to the provided schema.
    `.trim();

    // Prepare the messages array.
    const inputMessages = [
      {
        role: "system",
        content: [{ type: "input_text", text: systemPrompt }],
      },
      {
        role: "user",
        content: [{ type: "input_text", text: userPrompt }],
      },
    ];

    // Use the responses API with a json_schema format.
    const response = await openai.responses.create({
      model: "gpt-4o-mini-2024-07-18",
      input: inputMessages,
      text: {
        format: {
          type: "json_schema",
          name: "ideas",
          strict: true,
          schema: startupIdeaSchema,
        },
      },
      temperature: 1,
      max_output_tokens: 2048,
      top_p: 1,
      store: false,
    });

    if (!response.output_text) {
      throw new Error("No output_text in OpenAI response.");
    }

    const parsed = JSON.parse(response.output_text);
    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    console.error("Error generating start-up ideas:", error);
    return NextResponse.json(
      {
        error: "Failed to generate start-up ideas",
        details: error.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
