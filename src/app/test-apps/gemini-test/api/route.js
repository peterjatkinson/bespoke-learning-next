// app/api/generate-analysis/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // 1. Extract chatHistory from the client request
    const { chatHistory } = await request.json();

    if (!chatHistory || !Array.isArray(chatHistory) || chatHistory.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid chatHistory in request body' }, { status: 400 });
    }

    // 2. Get API Key from environment variables (server-side only)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Gemini API Key is not configured in environment variables.");
      return NextResponse.json({ error: 'API Key not configured on server. Please set GEMINI_API_KEY.' }, { status: 500 });
    }

    // 3. Construct the Gemini API URL
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // 4. Prepare the payload for the Gemini API
    const payload = {
      contents: chatHistory, // chatHistory from client is the 'contents' array
      // Optional: Add generationConfig if needed
      // generationConfig: {
      //   temperature: 0.7,
      //   maxOutputTokens: 250,
      //   topP: 1.0,
      //   topK: 40,
      // },
      // Optional: Add safetySettings if needed
      // safetySettings: [
      //   { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      //   { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      // ]
    };

    // 5. Make the fetch request to the Gemini API
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // 6. Handle the response from Gemini API
    if (!response.ok) {
      const errorData = await response.json(); // Try to parse error response from Gemini
      console.error("Error from Gemini API:", JSON.stringify(errorData, null, 2));
      return NextResponse.json(
        { error: `Gemini API Error: ${errorData?.error?.message || response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data); // Send Gemini's successful response back to the client

  } catch (error) {
    console.error("Error in /api/generate-analysis route:", error);
    // Differentiate between JSON parsing errors and other errors
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 });
  }
}