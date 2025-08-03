import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.SMO_OPENAI_API_KEY,
});

// --- Manually Defined JSON Schema with 'additionalProperties: false' ---
const personaJsonSchema = {
  type: "object",
  properties: {
    demographics: {
      type: "object",
      properties: {
        name: { type: "string", description: "The persona's first name. Use 'USER_INPUT' as placeholder." },
        age: { type: "string", description: "The persona's age range or specific age. Use 'USER_INPUT' as placeholder." },
        occupation: { type: "string", description: "The persona's job title or role. Use 'USER_INPUT' as placeholder." },
        incomeLevel: { type: "number", description: "Estimated annual income as a number, e.g., 45000." },
        educationLevel: { type: "string", description: "Highest level of education achieved." },
        location: { type: "string", description: "General location (e.g., city, region). Use 'USER_INPUT' as placeholder." },
      },
      required: ["name", "age", "occupation", "incomeLevel", "educationLevel", "location"],
      // --- CORRECTION: Add additionalProperties: false to nested object ---
      additionalProperties: false,
    },
    psychographics: {
      type: "object",
      properties: {
        valuesAndBeliefs: { type: "string", description: "Core values, beliefs, and attitudes." },
        lifestyle: { type: "string", description: "Hobbies, interests, daily routine, social habits." },
        personalityTraits: { type: "string", description: "Key personality characteristics (e.g., introverted, analytical)." },
        goalsAndAspirations: { type: "string", description: "Personal and professional goals." },
      },
      required: ["valuesAndBeliefs", "lifestyle", "personalityTraits", "goalsAndAspirations"],
      // --- CORRECTION: Add additionalProperties: false to nested object ---
      additionalProperties: false,
    },
    painPointsAndChallenges: {
      type: "object",
      properties: {
        primaryFrustrations: { type: "string", description: "Main problems or frustrations the persona faces relevant to the brand." },
        underlyingCauses: { type: "string", description: "Root causes of these frustrations." },
        impactOnBehavior: { type: "string", description: "How these challenges affect their decisions or behavior." },
        opportunitiesForSolutions: { type: "string", description: "How the brand/product could potentially solve these issues." },
      },
      required: ["primaryFrustrations", "underlyingCauses", "impactOnBehavior", "opportunitiesForSolutions"],
      // --- CORRECTION: Add additionalProperties: false to nested object ---
      additionalProperties: false,
    },
    purchasingBehavior: {
      type: "object",
      properties: {
        buyingHabits: { type: "string", description: "Frequency, timing, and common types of purchases." },
        purchasingMotivations: { type: "string", description: "Reasons behind purchase decisions (e.g., price, quality, status)." },
        preferredCommunicationChannels: { type: "string", description: "How they prefer to receive marketing messages (e.g., email, social media)." },
        preferredPurchasingChannels: { type: "string", description: "Where they prefer to buy (e.g., online, in-store)." },
        roleInBuyingProcess: { type: "string", description: "Their influence in the decision-making process (e.g., decision-maker, influencer)." },
      },
      required: ["buyingHabits", "purchasingMotivations", "preferredCommunicationChannels", "preferredPurchasingChannels", "roleInBuyingProcess"],
      // --- CORRECTION: Add additionalProperties: false to nested object ---
      additionalProperties: false,
    },
    quote: { type: "string", description: "A short, impactful quote representing the persona's perspective." },
    scenario: { type: "string", description: "A brief narrative illustrating a typical situation or interaction related to the brand/problem." },
    personalityRadar: {
      type: "object",
      properties: {
        openness: { type: "number", description: "Score (0-100) for openness to experience." },
        conscientiousness: { type: "number", description: "Score (0-100) for conscientiousness." },
        extraversion: { type: "number", description: "Score (0-100) for extraversion." },
        agreeableness: { type: "number", description: "Score (0-100) for agreeableness." },
        neuroticism: { type: "number", description: "Score (0-100) for neuroticism (emotional stability inverse)." },
      },
      required: ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"],
      // --- CORRECTION: Add additionalProperties: false to nested object ---
      additionalProperties: false,
    },
  },
  required: ["demographics", "psychographics", "painPointsAndChallenges", "purchasingBehavior", "quote", "scenario", "personalityRadar"],
  description: "A detailed consumer persona profile.",
  // --- CORRECTION: Add additionalProperties: false to the root object ---
  additionalProperties: false,
};


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

    const firstName = personName.split(' ')[0];

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
                schema: personaJsonSchema
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
        size: "512x512",
        response_format: "url",
      });

      if (imageResponse.data && imageResponse.data.length > 0 && imageResponse.data[0].url) {
        imageUrl = imageResponse.data[0].url;
      } else {
          console.warn("DALL-E response did not contain a valid image URL. Response:", JSON.stringify(imageResponse, null, 2));
      }
    } catch (imageError) {
      console.error("Error generating DALL·E image:", imageError.message);
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
    const errorDetail = error.error?.message || "Unknown server error occurred";

    return NextResponse.json(
      {
        error: "Failed to generate consumer persona",
        details: errorDetail,
      },
      { status: statusCode }
    );
  }
}