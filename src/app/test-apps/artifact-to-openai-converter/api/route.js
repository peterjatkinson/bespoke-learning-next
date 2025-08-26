// app/api/generate-clearr/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Parse the request body
    const body = await request.json();
    const {
      moduleTitle,
      learningOutcomes,
      targetAudience,
      currentContent,
      assessmentDetails,
      resourcesAvailable,
      constraints
    } = body;

    // Validate required fields
    if (!moduleTitle || !learningOutcomes || !currentContent) {
      return NextResponse.json(
        { error: "Missing required fields: moduleTitle, learningOutcomes, and currentContent are required." },
        { status: 400 }
      );
    }

    // Check for OpenAI API key
    if (!process.env.SMO_OPENAI_API_KEY) {
      console.error("OpenAI API key not found in environment variables");
      return NextResponse.json(
        { error: "Server configuration error. Please check API key setup." },
        { status: 500 }
      );
    }

    // Create the prompt for OpenAI
    const prompt = `As an expert in learning design and the CLEARR pedagogical framework, redesign this online learning module into a structured week of learning. 

CLEARR Framework:
- C: Catalyse/Challenge - Hook learners, create curiosity, present challenges
- L: Link - Connect to prior knowledge and existing understanding  
- E: Explain - Provide clear explanations and new information
- A: Act/Apply - Active learning activities and application exercises
- R: Respond - Feedback mechanisms (automated, tutor, or peer feedback)
- R: Reflect/Relate - Reflection activities and transfer to real-world contexts

Module Details:
Module Title: ${moduleTitle}
Learning Outcomes: ${learningOutcomes}
Target Audience: ${targetAudience || 'Not specified'}
Current Content: ${currentContent}
Assessment Details: ${assessmentDetails || 'Not specified'}
Resources Available: ${resourcesAvailable || 'Not specified'}
Constraints: ${constraints || 'None specified'}

Create a structured week of online learning (5-6 total hours) using the CLEARR framework. Provide a JSON response with this exact structure (all the main sections should return a paragraph in length):

{
  "moduleOverview": {
    "title": "Restructured module title",
    "totalDuration": "Total hours",
    "learningOutcomes": ["Outcome 1", "Outcome 2", "Outcome 3"]
  },
  "weekStructure": [
    {
      "day": "Day 1",
      "theme": "Daily theme",
      "duration": "X hours",
      "clearrSections": [
        {
          "clearrPhase": "Catalyse",
          "pageTitle": "Engaging page title",
          "duration": "X minutes",
          "activities": [
            {
              "title": "Activity name",
              "description": "What students do",
              "type": "Video|Reading|Interactive|Discussion|Quiz|Reflection",
              "duration": "X min"
            }
          ]
        },
        {
          "clearrPhase": "Link",
          "pageTitle": "Connection page title", 
          "duration": "X minutes",
          "activities": [...]
        },
        {
          "clearrPhase": "Explain",
          "pageTitle": "Explanation page title",
          "duration": "X minutes", 
          "activities": [...]
        },
        {
          "clearrPhase": "Act",
          "pageTitle": "Application page title",
          "duration": "X minutes",
          "activities": [...]
        },
        {
          "clearrPhase": "Respond",
          "pageTitle": "Feedback page title",
          "duration": "X minutes",
          "activities": [...]
        },
        {
          "clearrPhase": "Reflect",
          "pageTitle": "Reflection page title", 
          "duration": "X minutes",
          "activities": [...]
        }
      ]
    }
  ],
  "assessmentIntegration": {
    "formativeAssessments": ["Assessment 1", "Assessment 2"],
    "summativeAssessment": "Main assessment description",
    "feedbackStrategy": "How feedback is provided throughout"
  },
  "implementationTips": [
    "Tip 1 for successful implementation",
    "Tip 2 for successful implementation"
  ]
}

Ensure the total time adds up to 5-6 hours across the week, with realistic timing for each activity. Make activities engaging, varied, and pedagogically sound for online learning. Include a mix of synchronous and asynchronous activities where appropriate.

You should be really imaginative and creative in your design, while still being practical and realistic for online learning. Give a paragraph for each section, describing the purpose and how it fits into the overall learning journey.

Your entire response must be valid JSON only. Do not include any text outside the JSON structure.`;

    // Make request to OpenAI API
    console.log("Making request to OpenAI API...");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SMO_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using cost-effective model; can change to "gpt-4o" for better quality
        messages: [
          {
            role: "system",
            content: "You are an expert learning designer specializing in the CLEARR pedagogical framework. You provide structured, practical learning designs for online education."
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
      console.error("OpenAI API error:", response.status, errorData);
      
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

      if (response.status === 400 && errorData.error?.code === 'invalid_request_error') {
        return NextResponse.json(
          { error: "Invalid request format. Please check your input." }, 
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: errorData.error?.message || "OpenAI API error occurred" }, 
        { status: response.status }
      );
    }

    // Parse OpenAI response
    const data = await response.json();
    console.log("OpenAI API response received");

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Unexpected OpenAI response format:", data);
      return NextResponse.json(
        { error: "Unexpected response format from OpenAI API" },
        { status: 500 }
      );
    }

    // Extract the AI response text
    let responseText = data.choices[0].message.content;
    
    // Clean potential markdown formatting
    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", parseError);
      console.error("Raw response:", responseText);
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    // Validate the parsed response structure
    if (!parsedResponse.moduleOverview || !parsedResponse.weekStructure) {
      console.error("Invalid response structure:", parsedResponse);
      return NextResponse.json(
        { error: "Invalid response structure from AI. Please try again." },
        { status: 500 }
      );
    }

    // Return the successfully parsed structure
    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error("Unexpected error in API route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}