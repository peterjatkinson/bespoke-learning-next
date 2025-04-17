import OpenAI from "openai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const openai = new OpenAI({
  apiKey: process.env.SMO_OPENAI_API_KEY,
});

// --- Corrected Zod Schema ---
// Removed .min(0).max(100) from personalityRadar fields
const PersonaSchema = z.object({
  demographics: z.object({
    name: z.string().describe("The persona's first name. Use 'USER_INPUT' as placeholder."),
    age: z.string().describe("The persona's age range or specific age. Use 'USER_INPUT' as placeholder."),
    occupation: z.string().describe("The persona's job title or role. Use 'USER_INPUT' as placeholder."),
    incomeLevel: z.number().describe("Estimated annual income as a number, e.g., 45000."),
    educationLevel: z.string().describe("Highest level of education achieved."),
    location: z.string().describe("General location (e.g., city, region). Use 'USER_INPUT' as placeholder."),
  }),
  psychographics: z.object({
    valuesAndBeliefs: z.string().describe("Core values, beliefs, and attitudes."),
    lifestyle: z.string().describe("Hobbies, interests, daily routine, social habits."),
    personalityTraits: z.string().describe("Key personality characteristics (e.g., introverted, analytical)."),
    goalsAndAspirations: z.string().describe("Personal and professional goals."),
  }),
  painPointsAndChallenges: z.object({
    primaryFrustrations: z.string().describe("Main problems or frustrations the persona faces relevant to the brand."),
    underlyingCauses: z.string().describe("Root causes of these frustrations."),
    impactOnBehavior: z.string().describe("How these challenges affect their decisions or behavior."),
    opportunitiesForSolutions: z.string().describe("How the brand/product could potentially solve these issues."),
  }),
  purchasingBehavior: z.object({
    buyingHabits: z.string().describe("Frequency, timing, and common types of purchases."),
    purchasingMotivations: z.string().describe("Reasons behind purchase decisions (e.g., price, quality, status)."),
    preferredCommunicationChannels: z.string().describe("How they prefer to receive marketing messages (e.g., email, social media)."),
    preferredPurchasingChannels: z.string().describe("Where they prefer to buy (e.g., online, in-store)."),
    roleInBuyingProcess: z.string().describe("Their influence in the decision-making process (e.g., decision-maker, influencer)."),
  }),
  quote: z.string().describe("A short, impactful quote representing the persona's perspective."),
  scenario: z.string().describe("A brief narrative illustrating a typical situation or interaction related to the brand/problem."),
  personalityRadar: z.object({
    // REMOVED .min(0).max(100) from these fields
    openness: z.number().describe("Score (0-100) for openness to experience."),
    conscientiousness: z.number().describe("Score (0-100) for conscientiousness."),
    extraversion: z.number().describe("Score (0-100) for extraversion."),
    agreeableness: z.number().describe("Score (0-100) for agreeableness."),
    neuroticism: z.number().describe("Score (0-100) for neuroticism (emotional stability inverse)."),
  }),
}).describe("A detailed consumer persona profile.");

const jsonSchema = zodToJsonSchema(PersonaSchema, "persona");

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      brandName,
      brandDescription,
      personName,
      personAge,
      personOccupation,
      personLocation,
    } = body;

    // Basic input validation
    if (!brandName || !brandDescription || !personName || !personAge || !personOccupation || !personLocation) {
        console.error("Validation Error: Missing required input fields");
        return NextResponse.json({ error: "Missing required input fields", details: "Server validation failed: one or more inputs were empty." }, { status: 400 });
    }

    // Extract first name for scenario generation
    const firstName = personName.split(' ')[0];

    // --- Prepare Prompts ---
    const systemPrompt = `
You are a marketing expert generating a structured consumer persona based on brand details and some user-provided demographics.
Your goal is to create a realistic and insightful persona profile.
Follow the provided JSON schema exactly.
Use British English spellings.
For the fields 'name', 'age', 'occupation', and 'location' within the 'demographics' object, use the exact placeholder string "USER_INPUT". These will be replaced later.
For 'incomeLevel', provide only a numeric value (e.g., 45000).
For the 'personalityRadar' fields (openness, conscientiousness, etc.), provide numeric scores between 0 and 100 as instructed in their descriptions.
Do not include a 'gender' field anywhere in the response.
The persona should be consistent with the provided age (${personAge}), occupation (${personOccupation}), and location (${personLocation}), even though these specific fields are placeholders in the output.
Ensure the quote and scenario reference the persona concept, not the placeholder "USER_INPUT". The quote should use single quote marks to contain the quote.
IMPORTANT: In the scenario, ALWAYS use the person's first name and NEVER use pronouns like "he" or "she" to refer to the person. Use the first name repeatedly instead of pronouns.
`.trim();

    const userPrompt = `
Generate a consumer persona based on the following details:
- Brand Name: ${brandName}
- Brand Description: ${brandDescription}
- User-Provided Age Hint: ${personAge}
- User-Provided Occupation Hint: ${personOccupation}
- User-Provided Location Hint: ${personLocation}
- User-Provided First Name: ${firstName}

Remember to use "USER_INPUT" as placeholders for name, age, occupation, and location in the final JSON demographics, but use the provided hints to inform the rest of the persona's characteristics (psychographics, behaviors, etc.). 


IMPORTANT REQUIREMENTS:
1. Ensure the personalityRadar scores are between 0 and 100.
2. The scenario and quote should feel natural for someone with the provided hints.
3. In the scenario, ALWAYS use the person's first name (${firstName}) and NEVER use pronouns like "he" or "she" to refer to the person. Use the first name repeatedly instead of pronouns.
`.trim();

    const response = await openai.responses.create({
        model: "gpt-4o-mini-2024-07-18",
        input: [
            { role: "system", content: [{ type: "input_text", text: systemPrompt }] },
            { role: "user", content: [{ type: "input_text", text: userPrompt }] }
        ],
        text: {
            format: {
                type: "json_schema",
                name: "persona",
                strict: true,
                schema: jsonSchema.definitions.persona
            }
        },
        temperature: 0.8,
        max_output_tokens: 2000,
        top_p: 1,
        store: false,
    });

    if (!response.output_text) {
      console.error("OpenAI response missing output_text. Full response:", JSON.stringify(response, null, 2));
      throw new Error("No valid response text received from OpenAI.");
    }

    // Parse the JSON response text
    let personaData;
    try {
        personaData = JSON.parse(response.output_text);
    } catch (parseError) {
        throw new Error("Invalid JSON format received from OpenAI.");
    }

    // --- Override Placeholders ---
    if (personaData.demographics) {
        personaData.demographics.name = personName;
        personaData.demographics.age = personAge;
        personaData.demographics.occupation = personOccupation;
        personaData.demographics.location = personLocation;
    } else {
        console.warn("Generated persona data missing 'demographics' object. Initializing.");
        personaData.demographics = {
            name: personName,
            age: personAge,
            occupation: personOccupation,
            location: personLocation,
            incomeLevel: 0,
            educationLevel: "N/A",
        };
    }
    
    if (personaData.quote?.includes("USER_INPUT")) {
        console.warn("Replacing 'USER_INPUT' in quote");
        personaData.quote = personaData.quote.replace(/USER_INPUT/g, firstName);
    }
    
    if (personaData.scenario?.includes("USER_INPUT")) {
        console.warn("Replacing 'USER_INPUT' in scenario");
        personaData.scenario = personaData.scenario.replace(/USER_INPUT/g, firstName);
    }

    // --- DALL·E Image Generation ---
    let imageUrl = null;
    try {
      const { name: finalName, age: finalAge, occupation: finalOccupation } = personaData.demographics;
      const now = new Date();
      const seconds = now.getSeconds();
      const races = ["White", "Black or African", "Asian", "Hispanic or Latino", "Middle Eastern", "Multiracial"];
      const raceBasedOnTime = races[seconds % races.length];

      const imagePrompt = `Realistic portrait photo of ${finalName}, a ${finalAge}-year-old individual, ${raceBasedOnTime} appearance. Professional setting or context relevant to their occupation (${finalOccupation}). Photorealistic style.`;

      const imageResponse = await openai.images.generate({
        prompt: imagePrompt,
        n: 1,
        size: "256x256",
        quality: "standard",
        response_format: "url",
      });

      if (imageResponse.data && imageResponse.data.length > 0 && imageResponse.data[0].url) {
        imageUrl = imageResponse.data[0].url;
      } else {
          console.warn("DALL-E response did not contain a valid image URL. Response:", JSON.stringify(imageResponse, null, 2));
      }
    } catch (imageError) {
      console.error("Error generating DALL·E image:", imageError);
    }

    personaData.imageUrl = imageUrl;

    return NextResponse.json(personaData);

  } catch (error) {
    console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.error("!!! Error in /api/persona-generator endpoint !!!");
    console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.error("Error Message:", error.message);
    console.error("Error Stack:", error.stack);
    if (error.response) {
      console.error("API Response Status:", error.response.status);
      console.error("API Response Data:", JSON.stringify(error.response.data, null, 2));
    } else if (error.status) {
       console.error("OpenAI API Error Status:", error.status);
       console.error("OpenAI API Error Headers:", JSON.stringify(error.headers, null, 2));
       console.error("OpenAI API Error Body:", JSON.stringify(error.error, null, 2));
    } else {
        console.error("Caught error object:", JSON.stringify(error, null, 2));
    }

    const statusCode = error.status || 500;
    const errorDetail = error.error?.message || error.message || "Unknown server error occurred";

    return NextResponse.json(
      {
        error: "Failed to generate consumer persona",
        details: errorDetail,
      },
      { status: statusCode }
    );
  }
}