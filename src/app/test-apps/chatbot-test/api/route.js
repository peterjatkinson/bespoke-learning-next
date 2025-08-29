import { NextResponse } from "next/server";
import OpenAI from 'openai';

// This ensures the environment is compatible with streaming and tools if needed later.
export const runtime = "nodejs";

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.SMO_OPENAI_API_KEY,
});

// The system prompt defines the assistant's role and instructions.
const systemPrompt = `You are an expert assistant for a university module on Integrated Marketing Communications (IMC).
Your role is to answer student questions accurately and concisely based on the information provided in the module outline file.
Use the file search tool to find the relevant information before answering.
If the answer is not in the document, state that you cannot find the information in the provided materials. This is important – if what the user is asking is not in the file, do NOT make up an answer; just say you are unable to answer that question based on the module materials you have access to.
Be helpful, clear, and academic in your tone. For example, if they ask about a concept not covered in the file, respond with "I'm sorry, but that topic is not covered in the provided module materials."
When you use information from the file, you MUST include a citation at the end of the sentence.`;

export async function POST(req) {
  try {
    const body = await req.json();
    // The client now sends a conversationId instead of the full chat history.
    let { message, conversationId } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let inputMessages;

    // If no conversationId is provided, create a new conversation.
    if (!conversationId) {
      console.log("Creating a new conversation...");
      // **FIX:** The create method does not take any parameters.
      const conversation = await openai.conversations.create();
      conversationId = conversation.id;
      console.log("New conversation created with ID:", conversationId);
      
      // **FIX:** For a new conversation, include the system prompt with the first user message.
      inputMessages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ];

    } else {
      console.log("Using existing conversation with ID:", conversationId);
      // For an existing conversation, just send the new user message.
      inputMessages = [{ role: "user", content: message }];
    }

    console.log("Sending request to OpenAI API...");

    // Call the Responses API using the conversation object.
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: inputMessages,
      // Pass the conversation ID to maintain state on the server.
      conversation: conversationId, 
      tools: [
        {
          type: "file_search",
          vector_store_ids: [process.env.IMC_VECTOR_STORE_ID],
        },
      ],
      text: {
        format: {
          type: "text",
        },
      },
      max_output_tokens: 1024,
    });

    // Log the entire raw response from the API to the terminal for debugging.
    console.log("--- OpenAI API Response ---");
    console.log(JSON.stringify(response, null, 2));
    console.log("--------------------------");

    // Extract the message text and the annotations array.
    const responseText = response.output_text;
    const annotations = response.content?.[0]?.annotations || [];

    if (responseText) {
      // Return the message, annotations, AND the conversationId to the client.
      return NextResponse.json({ 
        message: responseText, 
        annotations: annotations, 
        conversationId: conversationId 
      });
    } else {
      console.error("API response did not contain output_text.");
      return NextResponse.json({ error: 'No response from assistant' }, { status: 500 });
    }

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
        error: "An error occurred in the API route.",
        details: error.message || "Unknown error",
    }, { status: 500 });
  }
}
