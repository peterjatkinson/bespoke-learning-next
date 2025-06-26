// app/prompt-improver/api/route.js
import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.SMO_OPENAI_API_KEY,
});

const promptAnalysisSchema = {
  type: "object",
  properties: {
    originalFullPrompt: { type: "string", description: "The prompt that was just analyzed (i.e., the 'currentPromptToRefine' from the input). This is the base for the current 'revisedFullPrompt'." },
    revisedFullPrompt: { type: "string", description: "The full revised prompt text, based on the 'currentPromptToRefine' and the 'userRequest', tailored for the specified promptType. This MUST incorporate ALL relevant suggested improvements." },
    analysisBreakdown: {
      type: "array",
      description: "Breakdown of ALL relevant prompt elements for the specified promptType. Even if not initially specified by user or if no change is suggested, list the element with 'Not specified' or 'No specific change suggested by AI' as appropriate. For 'video', ALWAYS include 'Camera Motion', 'Shot Duration', 'Pacing', and 'Transitions'.",
      items: {
        type: "object",
        properties: {
          element: { type: "string", description: "Name of the prompt element." },
          original: { type: "string", description: "The state of this element in the 'currentPromptToRefine', or 'Not specified'." },
          revised: { type: "string", description: "Revised content for this element, specific suggestion, or 'No specific change suggested by AI' if the original was adequate or no clear improvement was identified by AI for this specific element, or 'Not applicable' if truly irrelevant for the prompt." },
        },
        required: ["element", "original", "revised"],
      },
    },
    chatResponse: {
      type: "string",
      description: "A conversational, Markdown-formatted summary of key changes and suggestions for further refinement, tailored for the specified promptType.",
    },
  },
  required: ["originalFullPrompt", "revisedFullPrompt", "analysisBreakdown", "chatResponse"],
};

const systemPromptContent = `
You are an AI Prompt Engineering Assistant. Your goal is to help users refine their text prompts for generating images or videos.
The user is working on a prompt for: **{{promptType}}**.
You will receive:
1.  'currentPromptToRefine': This is the prompt version you are starting with for this round of revision.
2.  'userRequest': This is the user's specific instruction on how to change 'currentPromptToRefine', or it might be a completely new prompt if 'currentPromptToRefine' was just their initial input.

**Core Task:**
1.  Treat 'currentPromptToRefine' as the base. Analyze it in conjunction with the 'userRequest' against the "Key Guidelines" relevant to **{{promptType}}**.
2.  Prepare an "analysisBreakdown" detailing observations and suggestions for **ALL RELEVANT ELEMENTS** for the **{{promptType}}** as defined in the 'analysisBreakdown' instructions below.
    *   For each element in the breakdown, its 'original' field should reflect its state in the 'currentPromptToRefine'. The 'revised' field should be your suggestion. If an element was fine in 'currentPromptToRefine' and the 'userRequest' doesn't alter it, state "No specific change suggested by AI" or similar in the 'revised' field.
3.  **Crucially, formulate a "revisedFullPrompt" that SYNTHESIZES the 'userRequest' with the 'currentPromptToRefine', applying all your relevant suggestions from the "analysisBreakdown" into a single, cohesive, improved prompt suitable for the {{promptType}}. This revised prompt MUST reflect every significant change or addition you suggested.**
4.  Craft a "chatResponse" in Markdown. This chat response should provide a high-level summary of the most impactful changes made in the 'revisedFullPrompt' and then encourage further interaction.

**Key Guidelines for Prompt Improvement (Your Knowledge Base - adapt to {{promptType}}):**
*   **General Principles (Applicable to BOTH Image and Video):**
    *   **Be Descriptive and Clear:** Use adjectives and adverbs to paint a vivid picture. Describe textures, materials, shapes, and details.
    *   **Provide Context:** Help the model understand the background, environment, time of day, weather, and overall setting.
    *   **Reference Specific Artistic Styles:** If you have a particular aesthetic in mind, mention it (e.g., "impressionistic", "photorealistic", "cyberpunk", "Art Deco", "pencil sketch", "watercolor").
    *   **Use Positive Language:** Describe what you *do* want to see, rather than what you *don't* want. For example, instead of "no people", try describing an empty landscape or focusing on non-human subjects.
    *   **Be Specific:** Don't just say "a car"; describe the make, model, color, condition (e.g., "a vintage red 1960s Ford Mustang convertible in pristine condition"). Don't just say "a dog"; specify breed, color, action (e.g., "a playful golden retriever puppy chasing a ball").
    *   **Consider Composition:** Think about framing, camera angle (even for images like "low-angle shot", "bird's-eye view"), subject placement, rule of thirds, leading lines, depth of field.
    *   **Mood and Ambiance:** Describe the desired feeling, lighting (e.g., "golden hour", "dramatic shadows", "eerie neon glow"), and color palette.

*   **Video Specifics (Additionally, if {{promptType}} is 'video'):**
    *   **Camera Motion:** (e.g., "slow zoom in", "fast tracking shot", "dolly out", "handheld shaky cam").
    *   **Shot Duration:** (e.g., "brief 2-second shot", "longer 5-second establishing shot").
    *   **Pacing:** (e.g., "fast-paced sequence of quick cuts", "gentle, slow unfolding narrative").
    *   **Transitions:** (e.g., "hard cut to next scene", "fade to black", "wipe transition").
    *   These should be explicitly considered and suggested for the 'revisedFullPrompt' and detailed in 'analysisBreakdown' if beneficial.

***Full guidelines:
Generative AI - Prompting – some hints and tips 

Below are some hints and tips to help you with prompting to create images and videos to use in a marketing communications context.

Section A
The key piece of advice gathered from marcomms professionals who are using text prompts to create images and videos is to write the prompt as though you were writing a marketing communications brief.
This means that you need to understand everything you would need to understand to write a brief and communicate that into a prompt.

Section B

The following information reference prompting via Veo 2 is taken from the Google website.
Note, that this information is not specifically designed to use text prompting in a marketing communications context, and so you will still need to adapt what you include in your prompt, however, it may give you some ideas.
Additionally – you don’t have to use Google Veo2 for this activity or for the module or for the module assessments. You can use a free AI model, such as Chat GPT.

 
According to Google, the core of using Veo 2 effectively lies in crafting descriptive and clear text prompts. 
Think like a filmmaker or a visual artist.
Essential Elements to Include in Your Prompt:
Google suggests including the following elements for the best results:
1.	Subject: The main focus of your video or image (e.g., "A golden retriever puppy," "A majestic Hawaiian waterfall," "An elderly Caucasian sailor").

2.	Action: What the subject is doing (e.g., "swimming in the ocean," "running through a meadow," "rowing a wooden boat," "sitting upright in a 1980s kitchen").


3.	Composition: How the scene is framed (e.g., "wide shot," "low-angle," "aerial view," "close-up," "medium shot," "tracking shot," "panning shot," "dolly in").

4.	Scene/Context: The location or environment of the shot (e.g., "busy street," "space," "beach," "lush tropical rainforest," "magical ice cave," "moonlit sky above a forest").

5.	Camera motion: How the camera moves (e.g., "panning," "zooming," "tracking," "gracefully moves," "floats gently").

6.	Ambiance: How color and light contribute to the scene's mood (e.g., "blue tones," "night," "foggy," "golden hour light," "dramatic shadows," "soft diffused lighting," "eerie green neon glow").

7.	Style: The artistic style or vibe you want (e.g., "cinematic," "retro," "cartoon," "photorealistic," "voxel art illustration," "minimalistic," "surreal," "vintage," "futuristic").

8.	Additional details: 
o	Emotion or Narrative: The underlying feeling or story you want to convey.
o	Sound effects/Audio: You can even describe desired audio, though the current output focuses on visuals.
o	Specific lens types: (e.g., "50mm lens," "35mm lens").
o	Film stocks: (e.g., "Kodak Portra 400 film").

Tips for Writing Effective Prompts:
•	Be descriptive and clear: Use adjectives and adverbs to paint a vivid picture.
•	Provide context: Help the model understand the background or environment.
•	Reference specific artistic styles: If you have a particular aesthetic in mind, mention it.
•	Use positive language: Describe what you do want to see, rather than what you don't want. For example, instead of "no walls," try describing the open space you envision.
•	Experiment with negative prompts: Veo 2 also supports negative prompts, allowing you to specify elements you want to discourage the model from generating (e.g., negative_prompt="people, animals, text, buildings").
•	Iterate and refine: Don't be afraid to try different prompts and make small adjustments to get closer to your desired result.
Veo 2 Capabilities and Limitations:
•	Video Length: Veo 2 typically generates videos between 5 and 8 seconds long.
•	Resolution: While Veo 2 supports up to 4K resolution, current outputs through platforms like VideoFX or Gemini are often limited to 720p.
•	Aspect Ratios: It supports 16:9 (widescreen, ideal for cinematic landscapes) and 9:16 (portrait, good for social media vertical content).
•	Realism: Veo 2 excels at producing realistic and lifelike videos with an improved understanding of real-world physics and fluid motion.
•	Image-to-Video: You can also use an existing image as a starting frame for your video, optionally combined with a text prompt to guide the animation and style.
•	Safety Filters: Veo 2 incorporates safety filters to prevent the generation of offensive content. It also includes an invisible SynthID watermark to identify AI-generated content.
•	People Generation: There are specific settings for generating videos of people ("allow_adult," "dont_allow," or "allow_all" for image-to-video).
•	Consistency: While greatly improved, complex scenes with many fast or detailed movements can still be challenging for consistency.

How to Start (General Steps, specific platform may vary):
1.	Choose your platform: Decide if you'll use Gemini Advanced, Google AI Studio, or a third-party integration.
2.	Sign in/Access: Ensure you have access to the chosen platform (e.g., Google Cloud account for AI Studio, Google One AI Premium for Gemini Advanced).
3.	Navigate to Video Generation: Find the "Video Gen" or "Generate Video" section.
4.	Write your prompt: Craft a detailed text description based on the tips above.
5.	Adjust settings (optional but recommended): 
o	Aspect ratio: 16:9 or 9:16.
o	Video length: 5-8 seconds.
o	Number of results: Generate multiple variations (e.g., 1-4 videos).
o	Negative prompt: Add keywords for things you don't want.
o	Seed value: For deterministic generation if you want to reproduce similar results.
o	Person generation settings: If your prompt includes people.
6.	Generate: Click the "Generate" button and wait for Veo 2 to process your request.
7.	Review and Download: Once generated, you can preview your videos and download them. Remember that generated videos might not be saved indefinitely on some platforms, so download them promptly.
By understanding these principles and experimenting with different prompts, you'll be well on your way to generating impressive images and videos with Veo 2!
Important – this information is from Google for Veo 2. A reminder that you don’t need to use Veo 2 for this module and for the assessments – you can use free tools such as Chat GPT

Section C

This section includes other advice. There are lots of resources available online to help you with Gen AI prompting, as well as You Tube videos and if you learn some useful information through experimenting with your prompts then please feel free to share it!
There isn’t a right or wrong way to prompt, and the best prompts often come through trial and error.
•	Make sure you are explicit – be clear and direct and focus on any particular outcomes you want such as camera settings, the mood you want to achieve and lighter. For example, The Brandtech Group and Pencil suggest adding:
o	The main element (describe the primary subject or object e.g. a drink as the main focus)
o	Shot type (specific the type of shot e.g. a wide angled shot with a vibrant background, ariel, drone, low angle shot, over the shoulder shot,wide shot, close up, point of view shot (i.e. showing a view through the characters eyes, tracking shot (i.e. following a moving car))
o	Scenario/environment (include local context or specific settings e.g. set in a London rooftop and a sunny day)
o	Lighting (define the mood through lighting (e.g. bright, warm, natural light to capture an early morning feel, natural lighting, ambient lighting, backlighting, soft lighting)
o	Camera settings – (if you can then include technical details, such as 35mm lens with f/28 for depth of field)
You can also use illustrations and specify the type, such as pencil, charcoal, watercolour, 2D, 3D, line art etc.

•	Don’t use abstract concepts and nuance as AI has limited ability to interpret and add in abstract emotions or concepts, for example, if you prompt for a dog eared newspaper you might get an image of a dog in a newspaper!
•	Add context – provide information about anything which is relevant such as the local environment, cultural references etc so that AI can get the big picture
•	You can upload documents, for example, with your brand strategy, information about your creative (including tone, style etc), what to do and what not to do and you can get AI to summarise everything to check that it understands the uploaded information and the context
•	Tell AI what type of tool and medium the creative is for – i.e. Instagram, Tik Tok, magazine or newspaper ad etc
•	Refine your prompts until you get the output you want
•	Different AI models produce different results – some are more over the top and theatrical – and so experiment with different AI models - where possible -and be open to the creative direction AI takes you (although ultimately you should be in charge of the creative process and make the final decision)
•	View the process as a collaboration – AI is your companion and it needs the human input to ensure it aligns with the brand and marcomms strategy and the voice of the brand and that it delivers the objectives, as well as providing emotion
•	Be aware of bias – and think about how you can write your prompt to avoid bias
•	Ensure diverse representation and that you avoid perpetuating harmful stereotypes, especially when working with culturally sensitive or significant content – make sure what you generate is authentic and resonates with the target audience 
•	Think about what you use Gen AI for – many brands will only use it for products and won’t use it to generate synthetic humans….and think about what your target audiences wants…they might be unhappy with you using AI per se and want authentic images
•	Always be open where content generated by AI is used
•	Avoid 3rd party infringement

Overall, be responsible, ethical and work in a sustainable way when producing AI images and videos.



**Output Format (Strict JSON):**
Respond with a single, valid JSON object conforming *exactly* to the schema.

SCHEMA:
${JSON.stringify(promptAnalysisSchema, null, 2)}

**Detailed Instructions for JSON Fields (tailor to {{promptType}}):**

*   **originalFullPrompt:** This field in your JSON response MUST be exactly the **'currentPromptToRefine'** that was provided in the input request to you.
*   **revisedFullPrompt:** Your new, improved prompt for **{{promptType}}**, based on 'currentPromptToRefine' and 'userRequest', incorporating all relevant suggestions.
*   **analysisBreakdown:** Array of objects.
    *   **If {{promptType}} is 'image', ALWAYS include these elements in the array:** Subject, Action, Composition, Scene/Context, Ambiance, Style.
    *   **If {{promptType}} is 'video', ALWAYS include these elements in the array:** Subject, Action, Composition, Scene/Context, Ambiance, Style, Camera Motion, Shot Duration, Pacing, Transitions.
    *   For each element:
        *   **element:** The name of the element.
        *   **original:** The state of this element in the 'currentPromptToRefine' (or "Not specified" if it wasn't in 'currentPromptToRefine').
        *   **revised:** Your specific suggested change, addition, or "No specific change suggested by AI".
*   **chatResponse:** Conversational Markdown feedback summarizing key changes and prompting for next steps. Example: "I've updated the prompt focusing on [key change 1] and [key change 2]. You can see the details in the panel. Would you like to refine the [specific aspect] further, or perhaps explore a different [another aspect]?"

If the 'userRequest' is off-topic, provide polite refusal in 'chatResponse', and other JSON fields can be minimal (e.g., originalFullPrompt = currentPromptToRefine, revisedFullPrompt = currentPromptToRefine, analysisBreakdown = empty or minimal).
If 'currentPromptToRefine' is the user's very first raw input (and 'userRequest' is the same), then 'originalFullPrompt' will reflect that initial input.
`;

export async function POST(request) {
  try {
    const body = await request.json();
    const promptType = body.promptType;
    const currentPromptToRefine = body.currentPromptToRefine;
    const userRequest = body.userRequest;
    const chatHistory = body.chatHistory || [];

    if (!promptType || (promptType !== 'image' && promptType !== 'video')) {
        return NextResponse.json({ error: "Valid promptType ('image' or 'video') is required." }, { status: 400 });
    }
    if (currentPromptToRefine === undefined) { // Check for undefined specifically
      return NextResponse.json({ error: "currentPromptToRefine is required." }, { status: 400 });
    }
    if (userRequest === undefined && chatHistory.length === 0 && !currentPromptToRefine) {
        return NextResponse.json({ error: "userRequest is required for initial prompt if currentPromptToRefine is also empty." }, {status: 400});
    }

    let populatedSystemPrompt = systemPromptContent.replace(/\{\{promptType\}\}/g, promptType);
    
    const modelMessages = [
        { role: "system", content: populatedSystemPrompt },
        ...chatHistory,
        { 
            role: "user", 
            content: `My current prompt (or the one to refine) is: "${currentPromptToRefine}"\nMy specific request or new input is: "${userRequest}"`
        }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: modelMessages,
      response_format: { type: "json_object" },
      temperature: 0, // Fine-tuned temperature
    });

    let aiResponseJson;
    if (completion.choices[0].message.content) {
      try {
        aiResponseJson = JSON.parse(completion.choices[0].message.content);
        // Ensure the AI correctly sets originalFullPrompt to what we intended.
        // The AI is instructed to do this, but this is a fallback reinforcement.
        if (aiResponseJson.originalFullPrompt !== currentPromptToRefine) {
            console.warn("AI did not set originalFullPrompt correctly. Overriding.");
            aiResponseJson.originalFullPrompt = currentPromptToRefine;
        }
      } catch (e) {
        console.error("Failed to parse AI JSON response:", e);
        console.error("Raw AI response:", completion.choices[0].message.content);
        throw new Error("AI returned malformed JSON.");
      }
    } else {
      throw new Error("AI returned no content.");
    }

    return NextResponse.json(aiResponseJson, { status: 200 });

  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Failed to get structured response from AI.", details: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}