import { supabase } from "./client";
import { 
  ClientWorkspace, 
  BrandBrain, 
  Agent, 
  Conversation, 
  Message, 
  TrainingItem, 
  CallScenario, 
  CallSimulation 
} from "../types";

// ==========================================
// Data Mappers (DB schema -> Frontend types)
// ==========================================

export const mapWorkspace = (db: any): ClientWorkspace => ({
  id: db.id,
  clientName: db.name,
  industry: db.industry || "General",
  agentsCount: 0,
  volume: 0,
  value: 1200,
  trainingStatus: 85,
});

export const mapBrandBrain = (db: any): BrandBrain => ({
  profile: {
    name: "",
    industry: "",
    overview: db.business_overview || "",
    products: Array.isArray(db.products_services) ? db.products_services : [],
    pricingNotes: db.pricing_notes || "",
    policies: Array.isArray(db.policies) ? db.policies.join("\n") : (db.policies || ""),
    ownerNotes: db.owner_notes || "",
  },
  faqs: Array.isArray(db.faqs) ? db.faqs : [],
  toneOfVoice: db.tone_of_voice || "Professional and polite.",
  doRules: Array.isArray(db.do_rules) ? db.do_rules : [],
  dontRules: Array.isArray(db.dont_rules) ? db.dont_rules : [],
  exampleReplies: [],
});

export const mapAgent = (db: any): Agent => ({
  id: db.id,
  name: db.name,
  role: db.role || "",
  personality: db.personality || "",
  tone: db.tone || "",
  channels: Array.isArray(db.channels) ? db.channels : ["Web chat"],
  status: (db.status || "Training") as "Draft" | "Training" | "Active",
  linkedBrainId: db.workspace_id,
  callReadiness: db.call_readiness_score || 0,
  lastSimulationResult: db.last_simulation_result || "",
  needsTraining: db.needs_training || false,
});

export const mapConversation = (db: any, messages: Message[] = []): Conversation => ({
  id: db.id,
  customerName: db.customer_name || "Unknown Customer",
  channel: db.channel || "Web chat",
  summary: db.summary || "",
  leadStatus: (db.lead_status || "New") as "New" | "Hot" | "Warm" | "Cold" | "Converted",
  date: db.created_at || new Date().toISOString(),
  sentiment: (db.sentiment || "Neutral") as "Positive" | "Neutral" | "Negative",
  needsFollowUp: db.needs_follow_up || false,
  messages,
});

export const mapMessage = (db: any): Message => ({
  id: db.id,
  sender: db.role as "user" | "agent" | "system",
  text: db.content || "",
  timestamp: new Date(db.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
});

export const mapTrainingItem = (db: any): TrainingItem => ({
  id: db.id,
  customerQuestion: db.question || "",
  aiAnswer: db.ai_answer || "",
  ownerCorrection: db.owner_correction || "",
  status: (db.status || "Pending") as "Pending" | "Approved" | "Improved",
});

export const mapCallScenario = (db: any): CallScenario => ({
  id: db.id,
  title: db.title,
  persona: db.persona_name || "",
  mood: (db.customer_mood || "calm") as "calm" | "curious" | "skeptical" | "urgent" | "angry",
  goal: db.customer_goal || "",
  openingLine: db.opening_line || "",
  expectedOutcome: db.expected_outcome || "",
  difficulty: (db.difficulty || "Medium") as "Easy" | "Medium" | "Hard",
  agentId: db.workspace_id,
});

export const mapCallSimulation = (db: any): CallSimulation => ({
  id: db.id,
  scenarioId: db.scenario_id,
  agentId: db.agent_id,
  durationSeconds: db.scorecard?.durationSeconds || 60,
  scorecard: db.scorecard || undefined,
  conversationId: db.conversation_id,
  date: db.created_at || new Date().toISOString(),
  status: (db.status || "ended") as "ringing" | "connected" | "ended" | "analyzing",
});

// ==========================================
// Database Reads
// ==========================================

export async function fetchWorkspaces() {
  if (!supabase) return [];
  const { data, error } = await supabase.from("workspaces").select("*");
  if (error) {
    console.error("Error fetching workspaces:", error);
    return [];
  }
  return data.map(mapWorkspace);
}

export async function fetchBrandBrains() {
  if (!supabase) return {};
  const { data, error } = await supabase.from("brand_brains").select("*");
  if (error) {
    console.error("Error fetching brand brains:", error);
    return {};
  }
  const brains: Record<string, BrandBrain> = {};
  data.forEach((dbBrain: any) => {
    brains[dbBrain.workspace_id] = mapBrandBrain(dbBrain);
  });
  return brains;
}

export async function fetchAgents() {
  if (!supabase) return [];
  const { data, error } = await supabase.from("agents").select("*");
  if (error) {
    console.error("Error fetching agents:", error);
    return [];
  }
  return data.map(mapAgent);
}

export async function fetchConversations() {
  if (!supabase) return [];
  const { data, error } = await supabase.from("conversations").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
  return data;
}

export async function fetchAllMessages() {
  if (!supabase) return [];
  const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
  return data.map((msg: any) => ({
    ...mapMessage(msg),
    conversationId: msg.conversation_id
  }));
}

export async function fetchTrainingItems() {
  if (!supabase) return [];
  const { data, error } = await supabase.from("training_items").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching training items:", error);
    return [];
  }
  return data;
}

export async function fetchCallScenarios() {
  if (!supabase) return [];
  const { data, error } = await supabase.from("call_scenarios").select("*");
  if (error) {
    console.error("Error fetching call scenarios:", error);
    return [];
  }
  return data.map(mapCallScenario);
}

export async function fetchCallSimulations() {
  if (!supabase) return [];
  const { data, error } = await supabase.from("call_simulations").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching call simulations:", error);
    return [];
  }
  return data;
}

// ==========================================
// Database Writes
// ==========================================

export async function createWorkspace(ownerId: string, name: string, industry: string) {
  if (!supabase) return null;
  const { data, error } = await supabase.from("workspaces").insert({
    owner_id: ownerId,
    name,
    industry,
  }).select().single();

  if (error) {
    console.error("Error creating workspace:", error);
    return null;
  }
  return mapWorkspace(data);
}

export async function upsertBrandBrain(workspaceId: string, brain: BrandBrain) {
  if (!supabase) return null;
  const dbBrain = {
    workspace_id: workspaceId,
    tone_of_voice: brain.toneOfVoice,
    business_overview: brain.profile.overview,
    products_services: brain.profile.products,
    pricing_notes: brain.profile.pricingNotes,
    do_rules: brain.doRules,
    dont_rules: brain.dontRules,
    policies: [brain.profile.policies],
    owner_notes: brain.profile.ownerNotes,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("brand_brains").upsert(dbBrain, { onConflict: "workspace_id" }).select().single();
  if (error) {
    console.error("Error upserting brand brain:", error);
    return null;
  }
  return mapBrandBrain(data);
}

export async function insertAgent(agent: Agent) {
  if (!supabase) return null;
  // Ensure we generate a valid UUID, omitting client-side mock string ids
  const dbAgent = {
    id: agent.id.startsWith("agent-") ? undefined : agent.id,
    workspace_id: agent.linkedBrainId,
    name: agent.name,
    role: agent.role,
    personality: agent.personality,
    tone: agent.tone,
    channels: agent.channels,
    status: agent.status,
    call_readiness_score: agent.callReadiness || 0,
    last_simulation_result: agent.lastSimulationResult || "",
    needs_training: agent.needsTraining || false,
  };

  const { data, error } = await supabase.from("agents").insert(dbAgent).select().single();
  if (error) {
    console.error("Error inserting agent:", error);
    return null;
  }
  return mapAgent(data);
}

export async function updateAgent(agent: Agent) {
  if (!supabase) return null;
  const dbAgent = {
    name: agent.name,
    role: agent.role,
    personality: agent.personality,
    tone: agent.tone,
    channels: agent.channels,
    status: agent.status,
    call_readiness_score: agent.callReadiness || 0,
    last_simulation_result: agent.lastSimulationResult || "",
    needs_training: agent.needsTraining || false,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("agents").update(dbAgent).eq("id", agent.id).select().single();
  if (error) {
    console.error("Error updating agent:", error);
    return null;
  }
  return mapAgent(data);
}

export async function insertConversation(workspaceId: string, conv: Omit<Conversation, "messages">) {
  if (!supabase) return null;
  const isMockId = conv.id.startsWith("playground-conv-") || conv.id.startsWith("conv-res-");
  const dbConv = {
    id: isMockId ? undefined : conv.id,
    workspace_id: workspaceId,
    customer_name: conv.customerName,
    channel: conv.channel,
    summary: conv.summary,
    lead_status: conv.leadStatus,
    sentiment: conv.sentiment,
    needs_follow_up: conv.needsFollowUp,
  };

  const { data, error } = await supabase.from("conversations").insert(dbConv).select().single();
  if (error) {
    console.error("Error inserting conversation:", error);
    return null;
  }
  return data;
}

export async function updateConversation(conv: Omit<Conversation, "messages">) {
  if (!supabase) return null;
  const dbConv = {
    customer_name: conv.customerName,
    channel: conv.channel,
    summary: conv.summary,
    lead_status: conv.leadStatus,
    sentiment: conv.sentiment,
    needs_follow_up: conv.needsFollowUp,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("conversations").update(dbConv).eq("id", conv.id).select().single();
  if (error) {
    console.error("Error updating conversation:", error);
    return null;
  }
  return data;
}

export async function insertMessage(conversationId: string, msg: Message) {
  if (!supabase) return null;
  const isMockId = msg.id.startsWith("msg-");
  const dbMsg = {
    id: isMockId ? undefined : msg.id,
    conversation_id: conversationId,
    role: msg.sender,
    content: msg.text,
  };

  const { data, error } = await supabase.from("messages").insert(dbMsg).select().single();
  if (error) {
    console.error("Error inserting message:", error);
    return null;
  }
  return mapMessage(data);
}

export async function insertTrainingItem(workspaceId: string, item: TrainingItem) {
  if (!supabase) return null;
  const isMockId = item.id.startsWith("train-");
  const dbItem = {
    id: isMockId ? undefined : item.id,
    workspace_id: workspaceId,
    question: item.customerQuestion,
    ai_answer: item.aiAnswer,
    owner_correction: item.ownerCorrection || "",
    status: item.status.toLowerCase(),
  };

  const { data, error } = await supabase.from("training_items").insert(dbItem).select().single();
  if (error) {
    console.error("Error inserting training item:", error);
    return null;
  }
  return mapTrainingItem(data);
}

export async function updateTrainingItemStatus(id: string, status: string, correction?: string) {
  if (!supabase) return null;
  const updates: any = {
    status: status.toLowerCase(),
    updated_at: new Date().toISOString(),
  };
  if (correction !== undefined) {
    updates.owner_correction = correction;
  }

  const { data, error } = await supabase.from("training_items").update(updates).eq("id", id).select().single();
  if (error) {
    console.error("Error updating training item status:", error);
    return null;
  }
  return mapTrainingItem(data);
}

export async function deleteTrainingItem(id: string) {
  if (!supabase) return false;
  const { error } = await supabase.from("training_items").delete().eq("id", id);
  if (error) {
    console.error("Error deleting training item:", error);
    return false;
  }
  return true;
}

export async function insertCallScenario(workspaceId: string, scenario: CallScenario) {
  if (!supabase) return null;
  const isMockId = scenario.id.startsWith("scen-");
  const dbScenario = {
    id: isMockId ? undefined : scenario.id,
    workspace_id: workspaceId,
    title: scenario.title,
    persona_name: scenario.persona,
    customer_mood: scenario.mood,
    customer_goal: scenario.goal,
    opening_line: scenario.openingLine,
    expected_outcome: scenario.expectedOutcome,
    difficulty: scenario.difficulty,
  };

  const { data, error } = await supabase.from("call_scenarios").insert(dbScenario).select().single();
  if (error) {
    console.error("Error inserting call scenario:", error);
    return null;
  }
  return mapCallScenario(data);
}

export async function insertCallSimulation(workspaceId: string, sim: CallSimulation) {
  if (!supabase) return null;
  const isMockId = sim.id.startsWith("sim-") || sim.id.startsWith("scen-");
  const dbSim = {
    id: isMockId ? undefined : sim.id,
    workspace_id: workspaceId,
    agent_id: sim.agentId,
    scenario_id: sim.scenarioId,
    conversation_id: sim.conversationId,
    scorecard: {
      ...sim.scorecard,
      durationSeconds: sim.durationSeconds,
    },
    status: sim.status,
  };

  const { data, error } = await supabase.from("call_simulations").insert(dbSim).select().single();
  if (error) {
    console.error("Error inserting call simulation:", error);
    return null;
  }
  return mapCallSimulation(data);
}
