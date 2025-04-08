import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs"; // Ensures compatibility with streaming/tools

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, brandInfo, question, personas, chatHistory } = body;

    if (action === "generatePersonas") {
      return await generatePersonas(brandInfo);
    } else if (action === "askQuestion") {
      return await handleQuestion(question, personas, brandInfo, chatHistory);
    } else if (action === "generateSummary") {
      return await generateSummary(personas, brandInfo, chatHistory);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in focus-group route:", error);
    return NextResponse.json({
      error: "An error occurred",
      details: error.message || "Unknown error",
    }, { status: 500 });
  }
}

async function generatePersonas(brandInfo) {
  const { brandName, conceptDescription, targetAudience } = brandInfo;

  const systemPrompt = `Create 4 diverse synthetic focus group personas to provide feedback on a brand/product. For each persona, provide:
1. First name
2. Age (varied across different demographics)
3. Gender (ensure diversity)
4. Region/Location (varied across different regions)
5. Occupation (should vary – don't assume everyone is a white-collar worker, unless that's likely based on the brand)
6. Brief personality description (1-2 sentences)
7. Attitude toward the brand (e.g., loyalist, skeptic, new customer, etc.)
8. One relevant personal detail or hobby

Make sure the personas are diverse in terms of demographics, backgrounds, attitudes toward the brand, and perspectives.
Each persona should feel like a real person with unique traits, not a stereotype.

Make sure the personas are diverse. Return valid JSON. Follow the schema exactly.`;

  const userPrompt = `Create a balanced, diverse focus group for:
Brand: ${brandName}
${conceptDescription ? `Concept: ${conceptDescription}` : ""}
${targetAudience ? `Audience: ${targetAudience}` : ""}`;

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    tools: [
      {
        type: "file_search",
        vector_store_ids: ["vs_67ee673383608191b014c30f0581a675"],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "focus_group_personas",
        strict: true,
        schema: {
          type: "object",
          properties: {
            personas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  age: { type: "integer" },
                  gender: { type: "string" },
                  location: { type: "string" },
                  occupation: { type: "string" },
                  personalityDescription: { type: "string" },
                  brandAttitude: { type: "string" },
                  personalDetail: { type: "string" },
                },
                required: [
                  "name",
                  "age",
                  "gender",
                  "location",
                  "occupation",
                  "personalityDescription",
                  "brandAttitude",
                  "personalDetail",
                ],
                additionalProperties: false,
              },
            },
          },
          required: ["personas"],
          additionalProperties: false,
        },
      },
    },
    temperature: 1.0,
    max_output_tokens: 2048,
    top_p: 1,
  });

  if (!response.output_text) {
    console.error("API response was:", JSON.stringify(response, null, 2));
    throw new Error("No output_text found.");
  }
  
  let parsed;
try {
  parsed = JSON.parse(response.output_text);
} catch (err) {
  console.error("JSON parsing error:", err);
  console.error("Raw response.output_text was:", response.output_text);
  throw new Error("Failed to parse JSON from response.");
}

return NextResponse.json({ personas: parsed.personas });

}

async function handleQuestion(question, personas, brandInfo, chatHistory) {
  const { brandName, conceptDescription } = brandInfo;

  const personasContext = personas.map((p, i) => `
Persona ${i + 1}:
Name: ${p.name}
Age: ${p.age}
Gender: ${p.gender}
Location: ${p.location}
Occupation: ${p.occupation}
Personality: ${p.personalityDescription}
Attitude: ${p.brandAttitude}
Detail: ${p.personalDetail}
  `.trim()).join("\n\n");

  const systemPrompt = `You are simulating a focus group for ${brandName}${conceptDescription ? ` (${conceptDescription})` : ''}.
Your task is to generate responses from each persona that reflect their unique character, attitude toward the brand, and background.
Each response should be 2-3 sentences and sound natural, as if spoken in a real focus group.
Keep responses conversational but insightful, with occasional speech quirks or hesitations for realism.
Ensure the responses reflect the persona's attitude toward the brand (loyalist, skeptic, etc.) and their personal background.
The personas should not always be unrelentingly positive – sometimes they'll be critical, express doubt or be unsure.

IMPORTANT: Your responses should be informed by relevant market research, consumer behavior, and industry trends that apply to this type of product or service. Use the file search function to find relevant information that might inform how these personas would realistically respond.  

You will be given the chat history showing previous questions and answers. Use this to maintain consistency and context. 
If a question refers to something mentioned earlier, make sure the personas acknowledge this and respond appropriately.
If personas have expressed strong opinions in previous answers, their new responses should remain consistent with those opinions.
Return valid JSON:
{
  "responses": {
    "Name1": "...",
    "Name2": "..."
  }
}`;

  let formattedHistory = "";
  if (chatHistory?.length) {
    formattedHistory = chatHistory.map((item) => {
      let lines = `Moderator: ${item.question}\n`;
      for (const [name, response] of Object.entries(item.responses || {})) {
        lines += `${name}: ${response}\n`;
      }
      return lines;
    }).join("\n---\n\n");
  }

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: systemPrompt + "\n\n" + personasContext },
      { role: "user", content: formattedHistory + `\nNEW QUESTION: ${question}` },
    ],
    tools: [
      {
        type: "file_search",
        vector_store_ids: ["vs_67ee673383608191b014c30f0581a675"],
      },
    ],
    text: {
      format: {
        type: "json_object",
      },
    },
    temperature: 1.0,
    max_output_tokens: 1024,
    top_p: 1,
  });

  if (!response.output_text) throw new Error("No output_text found.");

  const parsed = JSON.parse(response.output_text);
  return NextResponse.json(parsed);
}

function processTranscriptForWordCloud(text, names) {
  const stopWords = new Set([
    'the', 'and', 'a', 'to', 'of', 'in', 'i', 'it', 'is', 'that', 'this',
    'for', 'you', 'was', 'with', 'on', 'are', 'as', 'they', 'be', 'at', 'have',
    'from', 'or', 'an', 'my', 'so', 'we', 'were', 'by', 'me', 'not', 'but',
    'our', 'us', 'your', 'what', 'can', 'just', 'would', 'could', 'their',
    'some', 'about', 'will', 'very', 'been', 'which', 'if', 'had', 'has',
    'when', 'who', 'how', 'all', 'any', 'its', 'also', 'more', 'than',
    'moderator', 'focus', 'group', 'think', 'like', 'really', 'know', 'because',
    'dont', "don't", 'thats', "that's", 'there', 'these', 'those', 'them',
    'then', 'though', 'through', 'actually', 'definitely', 'said', 'say', 'says',
    'okay', 'yes', 'yeah', 'no', 'maybe', 'sure', 'participants', 'participant',
    ...names.map(n => n.toLowerCase())
  ]);

  const words = text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
    .replace(/\n/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  return Object.entries(wordCount)
    .filter(([_, count]) => count > 1)
    .map(([word, count]) => ({ text: word, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 100);
}

async function generateSummary(personas, brandInfo, chatHistory) {
  const { brandName, conceptDescription, targetAudience } = brandInfo;

  const participantNames = personas.map((p) => p.name);

  let transcript = `Focus Group for ${brandName}\n`;
  if (conceptDescription) transcript += `Concept: ${conceptDescription}\n`;
  if (targetAudience) transcript += `Target Audience: ${targetAudience}\n`;
  transcript += "\nPARTICIPANTS:\n";
  transcript += personas
    .map(
      (p) =>
        `${p.name}: ${p.age}, ${p.gender}, ${p.location}, ${p.occupation}, ${p.brandAttitude}`
    )
    .join("\n");
  transcript += "\n\nDISCUSSION TRANSCRIPT:\n\n";

  if (chatHistory?.length) {
    chatHistory.forEach((item) => {
      transcript += `Moderator: ${item.question}\n`;
      Object.entries(item.responses || {}).forEach(([name, res]) => {
        transcript += `${name}: ${res}\n`;
      });
      transcript += "\n---\n\n";
    });
  }

  const systemPrompt = `You are a professional focus group analyst. Analyze the transcript of a focus group discussion for ${brandName} and provide a structured summary.

Format your response as valid JSON with the following structure:
{
  "keyTakeaways": ["takeaway 1", "takeaway 2", "takeaway 3"],
  "participantSentiment": {
${participantNames.map(name => `    "${name}": "sentiment analysis for ${name}"`).join(",\n")}
  },
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "overallConclusion": "A paragraph summarizing the main findings and implications."
}

For key takeaways: Identify 3-5 main insights from the discussion, focusing on patterns across multiple responses.

For the four participants' sentiment: 
- Focus primarily on what each participant actually said during the discussion
- Analyze how their opinions evolved throughout the conversation
- Note specific product features or aspects they responded to positively or negatively
- Identify any shifts in their attitudes during the discussion
- Capture any unique perspectives or concerns they raised

For recommendations: Provide 3-4 actionable recommendations for the brand based on the conversation evidence.

For overall conclusion: Provide a concise paragraph summarizing the findings and their implications for the brand.

Ensure your response is valid JSON.`;

const response = await openai.responses.create({
  model: "gpt-4o-mini",
  input: [
    { role: "system", content: systemPrompt },
    { role: "user", content: transcript },
  ],
  text: {
    format: {
      type: "json_schema",
      name: "focus_group_summary",
      strict: true,
      schema: {
        type: "object",
        properties: {
          keyTakeaways: {
            type: "array",
            items: { type: "string" },
          },
          participantSentiment: {
            type: "object",
            properties: participantNames.reduce((acc, name) => {
              acc[name] = { type: "string" };
              return acc;
            }, {}),
            required: participantNames,
            additionalProperties: false,
          },
          recommendations: {
            type: "array",
            items: { type: "string" },
          },
          overallConclusion: { type: "string" },
        },
        required: [
          "keyTakeaways",
          "participantSentiment",
          "recommendations",
          "overallConclusion",
        ],
        additionalProperties: false,
      },
    },
  },
  temperature: 0.7,
  max_output_tokens: 2048,
  top_p: 1,
});

  if (!response.output_text) {
    console.error("API response was:", JSON.stringify(response, null, 2));
    throw new Error("No output_text found.");
  }

  let summary;
  try {
    summary = JSON.parse(response.output_text);
  } catch (err) {
    console.error("JSON parsing error:", err);
    console.error("Raw response.output_text was:", response.output_text);
    throw new Error("Failed to parse JSON from response.");
  }

  const wordCloudData = processTranscriptForWordCloud(transcript, participantNames);

  return NextResponse.json({ summary, transcript, wordCloudData });
}
