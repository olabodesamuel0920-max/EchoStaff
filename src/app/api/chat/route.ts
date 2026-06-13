import { NextRequest, NextResponse } from "next/server";
import { getAgentCompletion } from "@/lib/openai";
import { generateMockBrandedResponse } from "@/lib/mockAI";

export async function GET() {
  return NextResponse.json({
    liveAIEnabled: !!process.env.OPENAI_API_KEY
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      activeWorkspace, 
      brandBrain, 
      selectedAgent, 
      userMessage, 
      conversationHistory = [] 
    } = body;

    // Validate request parameters safely
    if (!brandBrain || !selectedAgent || !userMessage) {
      return NextResponse.json(
        { error: "Missing required fields in request body" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Fallback: If OpenAI API key is missing, execute mock engine
    if (!apiKey) {
      return NextResponse.json(generateFallbackResponse(userMessage, selectedAgent, brandBrain, "Missing OPENAI_API_KEY"));
    }

    try {
      // Call the clean OpenAI wrapper that uses Structured Outputs with strict JSON schema
      const result = await getAgentCompletion(selectedAgent, brandBrain, userMessage, conversationHistory);
      return NextResponse.json(result);
    } catch (openAiError) {
      console.warn("OpenAI API call failed, falling back. Error:", openAiError);
      const errorMessage = openAiError instanceof Error ? openAiError.message : String(openAiError);
      return NextResponse.json(generateFallbackResponse(userMessage, selectedAgent, brandBrain, `OpenAI API Error: ${errorMessage}`));
    }

  } catch (error) {
    console.error("Unhandled error in secure chat route:", error);
    // Graceful recovery
    return NextResponse.json({
      reply: "I am experiencing temporary system connectivity issues, but I will make sure we note this. How else can I assist?",
      detectedIntent: "system error",
      suggestedLeadStatus: "Warm",
      suggestedFollowUp: true,
      confidenceScore: 0.5,
      modelUsed: "System Fallback Error Node",
      usedFallback: true
    });
  }
}

/**
 * Generates structured mock responses when OpenAI API is unavailable.
 */
function generateFallbackResponse(
  userMessage: string, 
  agent: any, 
  brandBrain: any,
  fallbackReason: string
) {
  const query = userMessage.toLowerCase().trim();
  const reply = generateMockBrandedResponse(userMessage, agent, brandBrain);
  
  // Categorize intent based on keywords
  let detectedIntent = "general query";
  let suggestedLeadStatus: "Cold" | "Warm" | "Hot" | "Converted" = "Warm";
  let suggestedFollowUp = false;

  if (query.includes("pricing") || query.includes("cost") || query.includes("price") || query.includes("how much") || query.includes("rate") || query.includes("fee")) {
    detectedIntent = "pricing inquiry";
    suggestedLeadStatus = "Hot";
    suggestedFollowUp = true;
  } else if (query.includes("book") || query.includes("schedule") || query.includes("appointment") || query.includes("slot")) {
    detectedIntent = "booking request";
    suggestedLeadStatus = "Hot";
    suggestedFollowUp = false;
  } else if (query.includes("cancel") || query.includes("refund") || query.includes("policy") || query.includes("complaint") || query.includes("angry") || query.includes("scary")) {
    detectedIntent = "complaint / policy inquiry";
    suggestedLeadStatus = "Warm";
    suggestedFollowUp = true;
  } else if (query.includes("hi") || query.includes("hello") || query.includes("hey") || query.includes("greetings")) {
    detectedIntent = "greeting";
    suggestedLeadStatus = "Cold";
  }

  return {
    reply,
    detectedIntent,
    suggestedLeadStatus,
    suggestedFollowUp,
    confidenceScore: 0.85,
    modelUsed: `Offline Cognitive Mock (${fallbackReason})`,
    usedFallback: true
  };
}
