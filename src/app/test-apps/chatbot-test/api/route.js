import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.SMO_OPENAI_API_KEY,
});

// Full system prompt (will be logged on first turn)
const systemPrompt = `You are an expert assistant for a university module on Integrated Marketing Communications (IMC).
Your role is to answer student questions accurately and concisely based on the information provided in the module outline file.
Use the file search tool to find the relevant information before answering.
If the answer is not in the document, state that you cannot find the information in the provided materials. This is important – if what the user is asking is not in the file, do NOT make up an answer; just say you are unable to answer that question based on the module materials you have access to.
Be helpful, clear, and academic in your tone. For example, if they ask about a concept not covered in the file, respond with "I'm sorry, but that topic is not covered in the provided module materials."
When you use information from the file, you MUST include a citation at the end of the sentence.
Don't ever explicitly talk about the file search tool or the module outline file in your responses. Just provide the information as if you are an expert in IMC.`;

// Small helper to keep some log lines readable
function preview(text, max = 1000) {
  if (typeof text !== "string") return text;
  return text.length <= max ? text : `${text.slice(0, max)}… [truncated ${text.length - max} chars]`;
}

// Digest of file_search calls + citation annotations
function logToolsAndCitationsDigest(response) {
  try {
    console.log("--- Tool & Citation Digest ---");

    // Vector store IDs from the response config
    const vsIds = (Array.isArray(response.tools) ? response.tools : [])
      .filter((t) => t?.type === "file_search")
      .flatMap((t) => Array.isArray(t.vector_store_ids) ? t.vector_store_ids : []);
    console.log("vector_store_ids:", vsIds.length ? vsIds : "(none)");

    // File-search queries
    const outputs = Array.isArray(response.output) ? response.output : [];
    const fsCalls = outputs.filter((o) => o?.type === "file_search_call");
    if (fsCalls.length) {
      fsCalls.forEach((call, i) => {
        console.log(`file_search_call[${i}] queries:`, Array.isArray(call.queries) ? call.queries : "(none)");
        if (Array.isArray(call.results)) {
          console.log(`file_search_call[${i}] results count:`, call.results.length);
        } else {
          console.log(`file_search_call[${i}] results: (not provided)`);
        }
      });
    } else {
      console.log("file_search_call: (none)");
    }

    // Citations
    const annotationList = [];
    for (const item of outputs) {
      if (item?.type === "message" && Array.isArray(item.content)) {
        for (const c of item.content) {
          if (c && Array.isArray(c.annotations)) annotationList.push(...c.annotations);
        }
      }
    }
    const citations = annotationList.filter((a) => a?.type === "file_citation");
    if (citations.length) {
      const byFile = new Map();
      for (const cit of citations) {
        const key = cit.filename || cit.file_id || "unknown";
        if (!byFile.has(key)) byFile.set(key, []);
        byFile.get(key).push(cit);
      }
      console.log("citations.total:", citations.length);
      for (const [file, arr] of byFile.entries()) {
        const indices = arr.map((a) => a.index).filter((n) => typeof n === "number").slice(0, 50);
        console.log(` • ${file}: ${arr.length} cite(s); indices (first 50):`, indices);
      }
    } else {
      console.log("citations: (none)");
    }
    console.log("------------------------------");
  } catch (e) {
    console.log("Tool & Citation Digest logging error:", e?.message || e);
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    let { message, conversationId } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Log what came from the frontend
    console.log("Incoming frontend payload message:", preview(message));

    let inputMessages;

    if (!conversationId) {
      console.log("Creating a new conversation...");
      const conversation = await openai.conversations.create();
      conversationId = conversation.id;
      console.log("New conversation created with ID:", conversationId);

      // First turn: include system prompt + user message
      inputMessages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ];
    } else {
      console.log("Using existing conversation with ID:", conversationId);
      // Follow-up turns: just the new user message
      inputMessages = [{ role: "user", content: message }];
    }

    const hasSystem = inputMessages.some((m) => m.role === "system");
    console.log("hasSystemPromptThisCall:", hasSystem);

    // >>> LOG THE EXACT REQUEST WE'RE ABOUT TO SEND (FULL / UNREDACTED) <<<
    const requestPayload = {
      model: "gpt-4o-mini",
      input: inputMessages,
      conversation: conversationId,
      tools: [
        {
          type: "file_search",
          vector_store_ids: [process.env.IMC_VECTOR_STORE_ID],
        },
      ],
      text: { format: { type: "text" } },
      max_output_tokens: 1024,
    };

    console.log("--- OpenAI API Request (FULL) ---");
    console.log(JSON.stringify(requestPayload, null, 2));
    console.log("---------------------------------");

    console.log("Sending request to OpenAI API...");

    const response = await openai.responses.create(requestPayload);

    // Compact summary
    console.log("--- OpenAI API Response (summary) ---");
    console.log("response.id:", response.id);
    console.log("response.status:", response.status);
    console.log("response.model:", response.model);
    if (response.usage) {
      console.log("usage.total_tokens:", response.usage.total_tokens);
      console.log("usage.input_tokens:", response.usage.input_tokens);
      console.log("usage.output_tokens:", response.usage.output_tokens);
      if (response.usage?.input_tokens_details?.cached_tokens != null) {
        console.log("usage.input_tokens_details.cached_tokens:", response.usage.input_tokens_details.cached_tokens);
      }
    }
    console.log("output_text (preview):", preview(response.output_text));
    console.log("-------------------------------------");

    // Always log a digest of tools + citations
    logToolsAndCitationsDigest(response);

    // Full raw response (as you had before)
    console.log("--- OpenAI API Response (FULL) ---");
    console.log(JSON.stringify(response, null, 2));
    console.log("----------------------------------");

    // Extract message + annotations for the client
    const responseText = response.output_text;
    const annotations = response.content?.[0]?.annotations || [];

    if (responseText) {
      return NextResponse.json({
        message: responseText,
        annotations,
        conversationId,
      });
    } else {
      console.error("API response did not contain output_text.");
      return NextResponse.json({ error: "No response from assistant" }, { status: 500 });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: "An error occurred in the API route.",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
