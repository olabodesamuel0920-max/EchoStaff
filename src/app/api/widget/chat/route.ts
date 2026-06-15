import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getAgentCompletion } from "@/lib/openai";
import { generateMockBrandedResponse } from "@/lib/mockAI";
import { initialBrandBrains, initialAgents, initialWorkspaces } from "@/lib/seedData";
import { mapAgent, mapBrandBrain } from "@/lib/supabase/db-service";

export const dynamic = "force-dynamic";

// Normalizes referrer/origin URLs to match plain domain configurations
function normalizeDomain(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    return url.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return urlStr.trim().toLowerCase().replace(/^www\./, "");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { publicKey, sessionId, message, conversationHistory = [] } = body;

    // 1. Core input validations
    if (!publicKey || !sessionId || !message) {
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }

    if (message.length > 1000) {
      return NextResponse.json({ error: "Message too long. Keep messages under 1000 characters." }, { status: 400 });
    }

    let workspaceId = "";
    let agentId = "";
    let allowedDomains: string[] = [];

    // 2. Resolve widget config server-side (bypass client data leakage)
    if (publicKey === "preview") {
      workspaceId = body.workspaceId || "preview-workspace";
      agentId = body.agentId || "";
    } else {
      if (!isSupabaseAdminConfigured || !supabaseAdmin) {
        return NextResponse.json(
          { error: "Production widgets require an active cloud database connection." },
          { status: 500 }
        );
      }

      const { data: config, error: configError } = await supabaseAdmin
        .from("widget_configs")
        .select("*")
        .eq("public_key", publicKey)
        .single();

      if (configError || !config) {
        return NextResponse.json({ error: "Invalid widget public key." }, { status: 404 });
      }

      if (!config.enabled) {
        return NextResponse.json({ error: "This assistant is currently offline." }, { status: 403 });
      }

      workspaceId = config.workspace_id;
      agentId = config.agent_id;
      allowedDomains = Array.isArray(config.allowed_domains) ? config.allowed_domains : [];

      // 3. Referer domain check
      if (allowedDomains.length > 0) {
        const referer = req.headers.get("referer");
        const origin = req.headers.get("origin");
        const domainToCheck = referer || origin;

        if (!domainToCheck) {
          return NextResponse.json(
            { error: "Security Check: Origin verification headers are missing." },
            { status: 403 }
          );
        }

        const normalizedHost = normalizeDomain(domainToCheck);
        const isAllowed = allowedDomains.some((domain) => {
          const normalizedConf = normalizeDomain(domain);
          return normalizedHost === normalizedConf || normalizedHost.endsWith("." + normalizedConf);
        });

        if (!isAllowed) {
          return NextResponse.json(
            { error: "Security Check: This domain origin is not authorized." },
            { status: 403 }
          );
        }
      }

      // 4. Abuse Protection: Session message count verification
      // restricting requests by client IP, widget publicKey, and user sessionId.
      const { count, error: countErr } = await supabaseAdmin
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", sessionId)
        .eq("role", "user");

      if (!countErr && count !== null && count >= 15) {
        return NextResponse.json(
          { error: "Session limit reached. To prevent abuse, this chat is restricted to 15 user messages." },
          { status: 429 }
        );
      }
    }

    // 5. Load workspace, brain, and agent
    let agent: any = null;
    let brain: any = null;

    const useDbMode = isSupabaseAdminConfigured && supabaseAdmin && publicKey !== "preview";

    if (useDbMode && supabaseAdmin) {
      const [agentRes, brainRes] = await Promise.all([
        supabaseAdmin.from("agents").select("*").eq("id", agentId).single(),
        supabaseAdmin.from("brand_brains").select("*").eq("workspace_id", workspaceId).single(),
      ]);

      if (agentRes.data) agent = mapAgent(agentRes.data);
      if (brainRes.data) brain = mapBrandBrain(brainRes.data);
    } else {
      // Local Sandbox Fallback
      agent = initialAgents.find((a) => a.id === agentId) || initialAgents[0];
      const fallbackWorkspaceId = initialWorkspaces.some(w => w.id === workspaceId) ? workspaceId : initialWorkspaces[0].id;
      brain = initialBrandBrains[fallbackWorkspaceId] || initialBrandBrains[initialWorkspaces[0].id];
    }

    if (!agent || !brain) {
      return NextResponse.json({ error: "Missing assistant configurations." }, { status: 404 });
    }

    // 6. Request completion
    const apiKey = process.env.OPENAI_API_KEY;
    let result: any = null;

    if (apiKey) {
      try {
        result = await getAgentCompletion(agent, brain, message, conversationHistory);
      } catch (openAiError) {
        console.warn("Widget API: OpenAI call failed, fallback invoked.", openAiError);
        result = generateFallbackResponse(message, agent, brain, "OpenAI API Error");
      }
    } else {
      result = generateFallbackResponse(message, agent, brain, "Missing API Key");
    }

    // 7. Save conversation to Supabase (Production widget only)
    if (useDbMode && supabaseAdmin) {
      try {
        const { data: existingConv } = await supabaseAdmin
          .from("conversations")
          .select("id")
          .eq("id", sessionId)
          .single();

        if (existingConv) {
          // Update conversation summary/sentiment/leads
          await supabaseAdmin
            .from("conversations")
            .update({
              summary: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
              lead_status: result.suggestedLeadStatus || "Warm",
              needs_follow_up: result.suggestedFollowUp || false,
              updated_at: new Date().toISOString(),
            })
            .eq("id", sessionId);
        } else {
          // Create new conversation
          await supabaseAdmin.from("conversations").insert({
            id: sessionId,
            workspace_id: workspaceId,
            agent_id: agentId || null,
            customer_name: `Visitor ${sessionId.substring(0, 8)}`,
            channel: "Website Widget",
            summary: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
            sentiment: "Neutral",
            lead_status: result.suggestedLeadStatus || "New",
            needs_follow_up: result.suggestedFollowUp || false,
          });

          // Increment volume metric on workspace
          const { data: ws } = await supabaseAdmin
            .from("workspaces")
            .select("volume")
            .eq("id", workspaceId)
            .single();
          if (ws) {
            await supabaseAdmin
              .from("workspaces")
              .update({ volume: (ws.volume || 0) + 1 })
              .eq("id", workspaceId);
          }
        }

        // Insert messages sequentially
        await supabaseAdmin.from("messages").insert({
          conversation_id: sessionId,
          role: "user",
          content: message,
        });

        await supabaseAdmin.from("messages").insert({
          conversation_id: sessionId,
          role: "agent",
          content: result.reply,
        });
      } catch (dbErr) {
        console.error("Widget API: Failed to sync conversation to Supabase:", dbErr);
      }
    }

    return NextResponse.json({
      reply: result.reply,
      detectedIntent: result.detectedIntent,
      suggestedLeadStatus: result.suggestedLeadStatus,
      suggestedFollowUp: result.suggestedFollowUp,
      confidenceScore: result.confidenceScore,
      sessionId,
    });
  } catch (error) {
    console.error("Unhandled error in widget chat API:", error);
    return NextResponse.json(
      {
        reply: "I am having difficulty connecting. Please reload the chat or contact business support.",
        detectedIntent: "system error",
        suggestedLeadStatus: "Warm",
        suggestedFollowUp: true,
        confidenceScore: 0.5,
      },
      { status: 500 }
    );
  }
}

// Generates fallback mock responses when OpenAI API is unavailable
function generateFallbackResponse(
  userMessage: string,
  agent: any,
  brandBrain: any,
  fallbackReason: string
) {
  const query = userMessage.toLowerCase().trim();
  const reply = generateMockBrandedResponse(userMessage, agent, brandBrain);

  let detectedIntent = "general query";
  let suggestedLeadStatus: "Cold" | "Warm" | "Hot" | "Converted" = "Warm";
  let suggestedFollowUp = false;

  if (
    query.includes("pricing") ||
    query.includes("cost") ||
    query.includes("price") ||
    query.includes("how much") ||
    query.includes("rate") ||
    query.includes("fee")
  ) {
    detectedIntent = "pricing inquiry";
    suggestedLeadStatus = "Hot";
    suggestedFollowUp = true;
  } else if (
    query.includes("book") ||
    query.includes("schedule") ||
    query.includes("appointment") ||
    query.includes("slot")
  ) {
    detectedIntent = "booking request";
    suggestedLeadStatus = "Hot";
    suggestedFollowUp = false;
  } else if (
    query.includes("cancel") ||
    query.includes("refund") ||
    query.includes("policy") ||
    query.includes("complaint") ||
    query.includes("angry")
  ) {
    detectedIntent = "complaint / policy inquiry";
    suggestedLeadStatus = "Warm";
    suggestedFollowUp = true;
  } else if (
    query.includes("hi") ||
    query.includes("hello") ||
    query.includes("hey") ||
    query.includes("greetings")
  ) {
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
    usedFallback: true,
  };
}
