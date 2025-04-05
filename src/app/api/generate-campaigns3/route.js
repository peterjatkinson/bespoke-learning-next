import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { startupIdea, targetAudience, previousCampaigns } = body;

    const systemPrompt = `
You are a strategic marketing expert tasked with generating structured marketing campaign proposals. 
Your campaign should be oriented around the use of emerging technologies such as AR, VR, MR, virtual stores, virtual influencers, machine learning, AI, generative AI, predictive analytics, chatbots, virtual assistants, AI-powered sentiment analysis, AI-powered personalisation, AI agents, Blockchain, smart contracts, NFTs, cryptocurrencies, and IoT.
Each proposal must include:
- Campaign Name
- Approach (describe how the campaign integrates the technology into a **cohesive marketing strategy**, outlining the promotional activities, audience engagement tactics, and overall execution)
- Campaign Goals (set clear, specific, and measurable goals aligned with business objectives; include numeric targets and deadlines, e.g., "Increase website traffic by 10% in one month")
- Recommended Technologies (as a list; ensure these are emerging technologies and innovative applications, but only list those that are actually relevant to the suggested campaign.)

Use British English spellings and no Oxford commas. And sentence case for headings (i.e. always start with a capital letter for the first word of a heading, but not for subsequent words of a heading).

Follow the schema exactly.
`.trim();

    const userPrompt = `
Generate three detailed marketing campaign proposals based on the following:
- Organisation: ${startupIdea}
- Target Audience: ${targetAudience}

Ensure the entire campaign is built around utilising emerging technologies. 
When recommending technologies, mention which ones would be needed for the campaign.

Use British English spellings and no Oxford commas. And sentence case for headings (i.e. always start with a capital word for the first word of a heading, but not for subsequent words of a heading).

Respond using only valid JSON that conforms exactly to the provided schema.
`.trim();

    const additionalSystemMessage =
      previousCampaigns && previousCampaigns.length > 0
        ? `
The following campaigns have been generated in previous attempts:
${JSON.stringify(previousCampaigns)}
Please ensure that the new proposals are completely different from these previous campaigns.
`.trim()
        : null;

    const inputMessages = [
      {
        role: "system",
        content: [{ type: "input_text", text: systemPrompt }],
      },
    ];

    if (additionalSystemMessage) {
      inputMessages.push({
        role: "system",
        content: [{ type: "input_text", text: additionalSystemMessage }],
      });
    }

    inputMessages.push({
      role: "user",
      content: [{ type: "input_text", text: userPrompt }],
    });

    const response = await openai.responses.create({
      model: "gpt-4o-mini-2024-07-18",
      input: inputMessages,
      text: {
        format: {
          type: "json_schema",
          name: "campaigns",
          strict: true,
          schema: {
            type: "object",
            properties: {
              campaigns: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    approach: { type: "string" },
                    campaignGoals: { type: "string" },
                    recommendedTechnologies: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: [
                    "name",
                    "approach",
                    "campaignGoals",
                    "recommendedTechnologies",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["campaigns"],
            additionalProperties: false,
          },
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
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error generating campaign proposals:", error);
    return NextResponse.json(
      {
        error: "Failed to generate campaign proposals",
        details: error.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}