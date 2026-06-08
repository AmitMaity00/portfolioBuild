import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, type, vibe = 'professional' } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!prompt) return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not configured in .env.local" }, { status: 500 });

    const vibeInstructions: Record<string, string> = {
      professional: `TONE & VOICE: Sophisticated, authoritative, impact-driven. Speak as a seasoned expert.
CONTENT STYLE: Use specific metrics, quantifiable achievements, and specialized industry skills. Demonstrate depth of expertise.
STRUCTURE: Lead with the 'how' and 'why' before the 'what'. Avoid jargon unless industry-standard.
IMPACT: Make every sentence count. Each phrase should add credibility and professional weight.
LENGTH: Concise but comprehensive - aim for maximum density of professional value in minimum words.`,
      
      hacker: `TONE & VOICE: Minimalist, highly technical, precise. Speak like you're writing technical documentation.
CONTENT STYLE: Focus on system architecture, performance optimization, and problem-solving at scale. Specific tools, frameworks, and methodologies.
STRUCTURE: Dense with technical value - like a technical spec or whitepaper abstract. No fluff.
DEPTH: Go deep on implementation details and technical decisions made.
STYLE: Use technical terminology confidently. Show mastery through precision and specificity.`,
      
      creative: `TONE & VOICE: Bold, visionary, narrative-driven. Tell the story of creation.
CONTENT STYLE: Focus on the intersection of craft and technology. Unique perspective and innovation.
STRUCTURE: Use descriptive, evocative language. Build a narrative arc. Show the 'why it matters' emotionally.
CREATIVITY: Don't just describe what was made - describe the vision, inspiration, and creative process.
ENGAGEMENT: Make it feel like art meets engineering. Show personality while maintaining professionalism.`
    };

    const typeInstruction = type === 'bio' 
      ? `Write a compelling professional biography (3-4 sentences, 2-3 paragraphs):
        1. OPENING HOOK: Start with a strong role-based statement that immediately positions expertise
        2. EXPERTISE: Mention 2-3 specific, high-level skills with relevant context
        3. IMPACT: Describe professional achievement, specialization, or unique approach
        4. VISION: End with a forward-looking value statement about what you bring
        Make it dense with professional value. Every sentence should reinforce credibility.`
      : `Write a detailed project description (2-3 sentences):
        1. PROBLEM: What specific problem did this solve? Be concrete.
        2. SOLUTION: What technology stack or approach did you use? Be specific.
        3. OUTCOME: What was the measurable result or unique innovation?
        Focus on the intersection of problem-solving, technical skill, and measurable impact.`;

    const systemInstruction = `You are a world-class career coach, technical writer, and marketing copywriter specialized in transforming ideas into compelling narratives.

Your task: ${typeInstruction}

PERSONALITY VIBE REQUIREMENT: ${vibeInstructions[vibe] || vibeInstructions.professional}

CRITICAL RULES:
- Output ONLY the requested text. No conversational filler. No meta-commentary.
- No quotation marks or introductory phrases like "Here's..." or "This..."
- Write as if directly addressing the reader (first person for bios, descriptive for projects)
- Assume the reader is evaluating professional credibility - every word matters
- Use active voice and strong verbs
- Be specific rather than general`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ 
            text: `${systemInstruction}\n\nCONTEXT: ${prompt}\n\nNow write the ${type === 'bio' ? 'biography' : 'project description'} in the ${vibe} vibe:` 
          }] 
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 500,
        }
      })
    });

    if (!res.ok) {
      const gError = await res.json();
      console.error("Gemini API Error Detail:", JSON.stringify(gError, null, 2));
      throw new Error(gError.error?.message || "Failed to generate content");
    }

    const data = await res.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return NextResponse.json({ text: generatedText.trim() }, { status: 200 });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
