// === Artifact: route.js ===
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialise the OpenAI client with the API key from environment variables
const openai = new OpenAI({
    apiKey: process.env.SMO_OPENAI_API_KEY,
});

// Define the runtime environment
export const runtime = 'nodejs';

// Define all target platforms
const ALL_PLATFORMS = ['email', 'facebook', 'x', 'instagram', 'tiktok'];

// Main POST function to handle requests
export async function POST(req) {
    try {
        // Parse the request body
        const body = await req.json();
        // Note: 'platform' is no longer needed in the input for generation
        const { campaignIdea, productName } = body;

        // Validate input
        if (!campaignIdea || !productName) {
            return NextResponse.json({ error: 'Missing required fields: campaignIdea, productName' }, { status: 400 });
        }

        // --- Generate Image Content (Once) ---
        let imageUrl = null;
        // We generate one image for all platforms
        try {
            const imagePrompt = `Create a compelling, photorealistic visual for a social media post about a marketing campaign. Campaign idea: "${campaignIdea}". Product: "${productName}". Style should be clean, modern and eye-catching. Avoid text overlays.`;
            const imageResponse = await openai.images.generate({
                model: "dall-e-3",
                prompt: imagePrompt,
                n: 1,
                size: "1024x1024",
                quality: "standard",
                response_format: "url",
            });

            if (imageResponse.data && imageResponse.data.length > 0 && imageResponse.data[0].url) {
                imageUrl = imageResponse.data[0].url;
            } else {
                console.warn('Image generation did not return a valid URL.');
            }
        } catch (imageError) {
            console.error('Error generating DALL·E image:', imageError);
            // Log error but proceed, imageUrl will remain null
        }

        // --- Generate Text Content (For All Platforms Concurrently) ---
        const textGenerationPromises = ALL_PLATFORMS.map(async (platform) => {
            try {
                const textPrompt = getTextGenerationPrompt(platform, campaignIdea, productName);
                const textResponse = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: 'You are a creative social media marketing assistant. Generate concise, engaging and platform-appropriate content based on the user\'s request. Adapt tone and format for the specified platform.' },
                        { role: 'user', content: textPrompt },
                    ],
                    temperature: 0.7,
                    max_tokens: 250, // Max tokens per platform
                    top_p: 1,
                });

                const textContent = textResponse.choices[0]?.message?.content?.trim() || '';
                if (!textContent) {
                    console.warn(`Text generation resulted in empty content for platform: ${platform}.`);
                    // Return a specific fallback for this platform
                    return { platform, text: `[Could not generate text for ${platform} - please try again]` };
                }
                return { platform, text: textContent };
            } catch (textError) {
                console.error(`Error generating text content for ${platform}:`, textError);
                // Return an error message for this specific platform
                return { platform, text: `[Error generating text for ${platform}: ${textError.message}]` };
            }
        });

        // Wait for all text generations to complete
        const textResults = await Promise.all(textGenerationPromises);

        // Format results into an object: { platform: text, ... }
        const texts = textResults.reduce((acc, result) => {
            acc[result.platform] = result.text;
            return acc;
        }, {});

        // Return the generated texts (object) and the single image URL
        return NextResponse.json({ texts, imageUrl });

    } catch (error) {
        // Catch any unexpected errors during request processing
        console.error('Error in social-campaign route:', error);
        return NextResponse.json(
            {
                error: 'An internal server error occurred.',
                details: error.message || 'Unknown error',
            },
            { status: 500 }
        );
    }
}

// Helper function to create platform-specific prompts (remains the same)
function getTextGenerationPrompt(platform, campaignIdea, productName) {
    let prompt = `Generate content for a ${platform} post.\n`;
    prompt += `Product/Service: ${productName}\n`;
    prompt += `Campaign Idea: ${campaignIdea}\n\n`;

    switch (platform) {
        case 'email':
            prompt += 'Write a concise and engaging email body text. Include ONLY the body text and a compelling subject line suggestion prefixed EXACTLY with "Subject: ". Focus on benefits and include a clear call to action. Keep it relatively short for good readability.';
            break;
        case 'facebook':
            prompt += 'Write ONLY the text content for a Facebook post (no extra commentary). Make it conversational and engaging. Include relevant hashtags. Aim for a friendly tone.';
            break;
        case 'x':
            prompt += `Write ONLY the text content suitable for an X (formerly Twitter) post (no extra commentary). Be concise (under 280 characters ideally). Use relevant hashtags. Consider adding a question or call to action.`;
            break;
        case 'instagram':
            prompt += 'Write ONLY an Instagram caption (no extra commentary). Focus on visual storytelling if possible. Use relevant emojis and hashtags. Include a call to action or encourage engagement in the comments.';
            break;
        case 'tiktok':
            prompt += 'Write ONLY a short, punchy TikTok caption (no extra commentary). Use trending or relevant hashtags. Keep it very brief and engaging to complement a video format. Suggest relevant sounds or trends if applicable.';
            break;
        default:
            prompt += 'Write general social media post text about this campaign.';
    }
    // Add a final instruction for clean output
    prompt += '\n\nOutput ONLY the requested text/caption/body, without any introductory phrases like "Here is the text..." or explanations.'
    return prompt;
}