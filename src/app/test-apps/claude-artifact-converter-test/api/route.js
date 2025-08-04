// app/api/generate-alt-text/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { imageData, mediaType, context } = body;

    // Validate required fields
    if (!imageData || !mediaType) {
      return NextResponse.json(
        { error: 'Missing required fields: imageData and mediaType' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Prepare context information
    const contextInfo = context?.trim() ? `\n\nADDITIONAL CONTEXT: ${context.trim()}` : '';

    // Prepare the message for Claude API
    const messages = [{
      role: "user",
      content: [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType,
            data: imageData
          }
        },
        {
          type: "text",
          text: `You are an expert at writing alt text for images. Analyse this image and provide alt text that follows these specific requirements:

FORMATTING REQUIREMENTS:
- Write in British English (use British spellings like colour, realise, centre, etc.)
- NO Oxford commas (use 'A, B and C' not 'A, B, and C')
- Write as ONE continuous paragraph with NO bullet points or line breaks
- Keep it concise but descriptive enough for screen readers
- Always use single quote marks, never double quote marks

CONTENT REQUIREMENTS:
- Describe what's actually visible in the image
- Include important visual details, colours, positioning, and context
- Mention any text that appears in the image
- Focus on what's relevant for understanding the image's purpose
- If it's a decorative image, keep it brief
- If it contains important information, be more detailed${contextInfo}

Respond with ONLY the alt text, no additional commentary or formatting.`
        }
      ]
    }];

    // Make request to Claude API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        messages: messages
      })
    });

    // Check if the response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Claude API error (${response.status}):`, errorText);
      
      // Return appropriate error messages based on status code
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Authentication failed - please check API key' },
          { status: 500 }
        );
      } else if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded - please try again later' },
          { status: 429 }
        );
      } else {
        return NextResponse.json(
          { error: 'Failed to generate alt text - please try again' },
          { status: 500 }
        );
      }
    }

    // Parse the response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse Claude API response:', parseError);
      return NextResponse.json(
        { error: 'Invalid response from AI service' },
        { status: 500 }
      );
    }

    // Validate response structure
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('Unexpected response structure from Claude API:', data);
      return NextResponse.json(
        { error: 'Unexpected response format from AI service' },
        { status: 500 }
      );
    }

    // Extract and clean the alt text
    const altText = data.content[0].text.trim();

    // Return successful response
    return NextResponse.json({
      altText: altText,
      success: true
    });

  } catch (error) {
    console.error('Unexpected error in alt text generation:', error);
    
    // Handle different types of errors
    if (error.name === 'SyntaxError') {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred - please try again' },
      { status: 500 }
    );
  }
}

// Handle unsupported HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}