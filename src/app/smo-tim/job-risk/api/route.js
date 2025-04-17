import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.SMO_OPENAI_API_KEY,
});

const jobRiskSchema = {
  type: "object",
  properties: {
    risk: {
      type: "array",
      items: {
        type: "object",
        properties: {
          jobTitle: { type: "string" },
          riskScore: { type: "number" },
          explanation: { type: "string" },
        },
        required: ["jobTitle", "riskScore", "explanation"],
        additionalProperties: false,
      },
    },
  },
  required: ["risk"],
  additionalProperties: false,
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { jobTitle } = body;

    if (!jobTitle || typeof jobTitle !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'jobTitle' in request body." },
        { status: 400 }
      );
    }

    const inputMessages = [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              "You are an expert assessing the risk of job roles in the future (e.g. because they could become automated or redundant for other reasons).",
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Evaluate the risk for the job title: "${jobTitle}".
Respond as an array with a single object. Provide:
- A risk score between 0 (no risk) and 10 (high risk)
- A short paragraph explanation for the score.

Return your response strictly using the provided JSON schema.`,
          },
        ],
      },
    ];

    const response = await openai.responses.create({
      model: "gpt-4o-mini-2024-07-18",
      input: inputMessages,
      text: {
        format: {
          type: "json_schema",
          name: "risk",
          strict: true,
          schema: jobRiskSchema,
        },
      },
      temperature: 0,
    });

    if (!response.output_text) {
      console.error("OpenAI API returned no output_text");
      throw new Error("No output_text in OpenAI response.");
    }

    console.log("✅ Raw output from OpenAI:", response.output_text);

    let parsed;
    try {
      parsed = JSON.parse(response.output_text);
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError);
      console.error("⚠️ Raw text that failed to parse:", response.output_text);
      return NextResponse.json(
        {
          error: "Invalid JSON output from OpenAI",
          raw: response.output_text,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    console.error("💥 Error generating risk score and summary:", error);
    return NextResponse.json(
      {
        error: "Failed to generate risk score and summary",
        details: error.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
