import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Parse the incoming request body
    const body = await request.json();
    const { topic, level, duration, learningObjective } = body;

    // Validate required fields
    if (!topic || !level || !duration || !learningObjective) {
      return NextResponse.json(
        { error: "All fields are required: topic, level, duration, learningObjective" },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.SMO_OPENAI_API_KEY) {
      console.error("SMO_OPENAI_API_KEY not found in environment variables");
      return NextResponse.json(
        { error: "Server configuration error. API key not found." },
        { status: 500 }
      );
    }

    // Create the prompt for OpenAI
    const prompt = `Create a detailed online learning activity following the CLEARR learning design model for:
              
Topic: ${topic}
Level: ${level}
Duration: ${duration}
Learning Objective: ${learningObjective}

IMPORTANT: Each CLEARR component must include specific, actionable details with 2-3 clear steps and concrete examples. Be detailed but concise.

CLEARR Model Components:
- C: Catalyse/Challenge - Hook learners with an engaging opener or challenge
- L: Link - Connect to prior knowledge or real-world applications
- E: Explain - Provide clear instruction and content delivery
- A: Act/Apply - Active learning through activities and application
- R: Respond - Feedback mechanisms (automated, tutor, or peer)
- R: Reflect/Relate - Reflection and transfer to new contexts

Please structure your response as a JSON object with this exact format:

{
  "title": "Activity title",
  "overview": "Brief description of the activity",
  "clearr_components": {
    "catalyse": {
      "description": "Clear description of the hook/challenge approach and why it engages learners",
      "step_by_step_activity": "2-3 specific steps with concrete examples of what learners will do. Include specific prompts, questions, or scenarios.",
      "materials_needed": "Specific materials or resources required",
      "facilitator_notes": "Key implementation tips for instructors",
      "time": "Estimated time"
    },
    "link": {
      "description": "How this connects to prior knowledge and real-world applications",
      "step_by_step_activity": "2-3 specific steps with examples of linking activities, discussion prompts, or exercises.",
      "materials_needed": "Specific materials or resources required",
      "facilitator_notes": "Key implementation tips for instructors",
      "time": "Estimated time"
    },
    "explain": {
      "description": "Content delivery strategy and approach",
      "step_by_step_activity": "2-3 specific steps for content delivery, including delivery methods and interactive elements with examples.",
      "materials_needed": "Specific materials or resources required",
      "facilitator_notes": "Key implementation tips for instructors",
      "time": "Estimated time"
    },
    "act": {
      "description": "Hands-on learning approach and strategy",
      "step_by_step_activity": "2-3 specific steps for active learning tasks, exercises, or problem-solving activities with concrete examples and expected outcomes.",
      "materials_needed": "Specific materials or resources required",
      "facilitator_notes": "Key implementation tips for instructors",
      "time": "Estimated time"
    },
    "respond": {
      "description": "Feedback strategy and mechanism",
      "step_by_step_activity": "2-3 specific steps for how feedback will be provided and collected. Include specific feedback methods or tools with examples.",
      "materials_needed": "Specific materials or resources required",
      "facilitator_notes": "Key implementation tips for instructors",
      "time": "Estimated time"
    },
    "reflect": {
      "description": "Reflection and transfer strategy",
      "step_by_step_activity": "2-3 specific steps for reflection activities and knowledge transfer with concrete examples of prompts or scenarios.",
      "materials_needed": "Specific materials or resources required",
      "facilitator_notes": "Key implementation tips for instructors",
      "time": "Estimated time"
    }
  },
  "tools_needed": ["List of required tools/platforms"],
  "assessment_method": "Specific assessment approach with clear criteria",
  "adaptations": "Practical suggestions for different learning styles and accessibility needs"
}

Your entire response MUST be valid JSON only. Do not include any text outside the JSON structure.`;

    // Make request to OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SMO_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert educational designer specializing in the CLEARR learning model. You create detailed, practical learning activities with specific steps and examples."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.7,
        stream: false
      })
    });

    // Handle OpenAI API errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      console.error("OpenAI API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });

      if (response.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." }, 
          { status: 429 }
        );
      }
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Invalid API key." }, 
          { status: 401 }
        );
      }

      if (response.status === 400) {
        return NextResponse.json(
          { error: "Invalid request. Please check your input." }, 
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: errorData.error?.message || "OpenAI API error occurred" }, 
        { status: response.status }
      );
    }

    // Parse the response
    const data = await response.json();
    
    // Extract the AI response
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Unexpected OpenAI response structure:", data);
      return NextResponse.json(
        { error: "Invalid response from AI service" },
        { status: 500 }
      );
    }

    let aiResponse = data.choices[0].message.content;
    
    // Clean up potential markdown formatting
    aiResponse = aiResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    // Parse the JSON response
    let activityData;
    try {
      activityData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Raw AI Response:", aiResponse);
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    // Validate the structure of the response
    if (!activityData.title || !activityData.clearr_components) {
      console.error("Invalid activity data structure:", activityData);
      return NextResponse.json(
        { error: "Invalid activity structure generated. Please try again." },
        { status: 500 }
      );
    }

    // Return the successful response
    return NextResponse.json({
      success: true,
      activity: activityData,
      usage: data.usage // Include token usage for monitoring
    });

  } catch (error) {
    console.error("Unexpected error in API route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}