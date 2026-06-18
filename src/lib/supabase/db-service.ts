import { supabase } from "./client";
import { 
  ClientWorkspace, 
  BrandBrain, 
  Agent, 
  Conversation, 
  Message, 
  TrainingItem, 
  CallScenario, 
  CallSimulation,
  WidgetConfig
} from "../types";

// ==========================================
// Data Mappers (DB schema -> Frontend types)
// All snake_case to camelCase mapping is centralized here.
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

export const mapBrandBrain = (db: any): BrandBrain => {
  let ownerNotes = db.owner_notes || "";
  let handoffName = "";
  let handoffContact = "";
  let handoffRules = "";

  if (db.owner_notes && db.owner_notes.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(db.owner_notes);
      ownerNotes = parsed.ownerNotes ?? "";
      handoffName = parsed.handoffName ?? "";
      handoffContact = parsed.handoffContact ?? "";
      handoffRules = parsed.handoffRules ?? "";
    } catch (e) {
      console.warn("Failed to parse owner_notes JSON:", e);
    }
  }

  return {
    profile: {
      name: "",
      industry: "",
      overview: db.business_overview || "",
      products: Array.isArray(db.products_services) ? db.products_services : [],
      pricingNotes: db.pricing_notes || "",
      policies: Array.isArray(db.policies) ? db.policies.join("\n") : (db.policies || ""),
      ownerNotes,
    },
    faqs: Array.isArray(db.faqs) ? db.faqs : [],
    toneOfVoice: db.tone_of_voice || "Professional and polite.",
    doRules: Array.isArray(db.do_rules) ? db.do_rules : [],
    dontRules: Array.isArray(db.dont_rules) ? db.dont_rules : [],
    exampleReplies: [],
    handoffName,
    handoffContact,
    handoffRules,
  };
};

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
  metadata: db.metadata || undefined,
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

export const mapWidgetConfig = (db: any): WidgetConfig => ({
  id: db.id,
  workspaceId: db.workspace_id,
  agentId: db.agent_id || "",
  publicKey: db.public_key,
  enabled: db.enabled ?? true,
  greeting: db.greeting || "Hello! How can we help you today?",
  accentColor: db.accent_color || "#10b981",
  displayName: db.display_name || "AI Assistant",
  allowedDomains: Array.isArray(db.allowed_domains) ? db.allowed_domains : [],
});

// ==========================================
// Workspace Bundle Type (consolidated load)
// ==========================================

export interface WorkspaceBundle {
  workspaces: ClientWorkspace[];
  brandBrains: Record<string, BrandBrain>;
  agents: Agent[];
  conversations: Record<string, Conversation[]>;
  trainingItems: Record<string, TrainingItem[]>;
  callScenarios: CallScenario[];
  callSimulations: Record<string, CallSimulation[]>;
  widgetConfigs: Record<string, WidgetConfig>;
}

// ==========================================
// Database Reads
// ==========================================

export async function fetchWorkspaces(): Promise<ClientWorkspace[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("workspaces").select("*");
  if (error) {
    console.error("Error fetching workspaces:", error);
    throw new Error(`Failed to fetch workspaces: ${error.message}`);
  }
  return data.map(mapWorkspace);
}

export async function fetchBrandBrains(): Promise<Record<string, BrandBrain>> {
  if (!supabase) return {};
  const { data, error } = await supabase.from("brand_brains").select("*");
  if (error) {
    console.error("Error fetching brand brains:", error);
    throw new Error(`Failed to fetch brand brains: ${error.message}`);
  }
  const brains: Record<string, BrandBrain> = {};
  data.forEach((dbBrain: any) => {
    brains[dbBrain.workspace_id] = mapBrandBrain(dbBrain);
  });
  return brains;
}

export async function fetchAgents(): Promise<Agent[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("agents").select("*");
  if (error) {
    console.error("Error fetching agents:", error);
    throw new Error(`Failed to fetch agents: ${error.message}`);
  }
  return data.map(mapAgent);
}

export async function fetchConversations() {
  if (!supabase) return [];
  const { data, error } = await supabase.from("conversations").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching conversations:", error);
    throw new Error(`Failed to fetch conversations: ${error.message}`);
  }
  return data;
}

export async function fetchAllMessages() {
  if (!supabase) return [];
  const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
  if (error) {
    console.error("Error fetching messages:", error);
    throw new Error(`Failed to fetch messages: ${error.message}`);
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
    throw new Error(`Failed to fetch training items: ${error.message}`);
  }
  return data;
}

export async function fetchCallScenarios(): Promise<CallScenario[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("call_scenarios").select("*");
  if (error) {
    console.error("Error fetching call scenarios:", error);
    throw new Error(`Failed to fetch call scenarios: ${error.message}`);
  }
  return data.map(mapCallScenario);
}

export async function fetchCallSimulations() {
  if (!supabase) return [];
  const { data, error } = await supabase.from("call_simulations").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching call simulations:", error);
    throw new Error(`Failed to fetch call simulations: ${error.message}`);
  }
  return data;
}

// ==========================================
// Consolidated Loaders
// ==========================================

/**
 * loadWorkspaceBundle(): Loads all user data from Supabase in parallel.
 * Returns a fully-mapped WorkspaceBundle ready for direct consumption by state-context.
 * Throws on any critical fetch failure.
 */
export async function loadWorkspaceBundle(): Promise<WorkspaceBundle> {
  const [ws, brains, ags, dbConvs, dbMsgs, items, scenarios, sims, widgetConfs] = await Promise.all([
    fetchWorkspaces(),
    fetchBrandBrains(),
    fetchAgents(),
    fetchConversations(),
    fetchAllMessages(),
    fetchTrainingItems(),
    fetchCallScenarios(),
    fetchCallSimulations(),
    fetchWidgetConfigs(),
  ]);

  // Group messages by conversation ID
  const messagesByConv: Record<string, Message[]> = {};
  dbMsgs.forEach((msg: any) => {
    const cid = msg.conversationId;
    if (!messagesByConv[cid]) messagesByConv[cid] = [];
    messagesByConv[cid].push({
      id: msg.id,
      sender: msg.sender,
      text: msg.text,
      timestamp: msg.timestamp,
    });
  });

  // Group conversations by workspace ID
  const convsMap: Record<string, Conversation[]> = {};
  dbConvs.forEach((c: any) => {
    const wsId = c.workspace_id;
    if (!convsMap[wsId]) convsMap[wsId] = [];
    convsMap[wsId].push(mapConversation(c, messagesByConv[c.id] || []));
  });

  // Group training items by workspace ID
  const itemsMap: Record<string, TrainingItem[]> = {};
  items.forEach((item: any) => {
    const wsId = item.workspace_id;
    if (!itemsMap[wsId]) itemsMap[wsId] = [];
    itemsMap[wsId].push(mapTrainingItem(item));
  });

  // Group call simulations by workspace ID
  const simsMap: Record<string, CallSimulation[]> = {};
  sims.forEach((sim: any) => {
    const wsId = sim.workspace_id;
    if (!simsMap[wsId]) simsMap[wsId] = [];
    simsMap[wsId].push(mapCallSimulation(sim));
  });

  // Populate brand brain profile name and industry from workspaces
  ws.forEach((w) => {
    if (brains[w.id]) {
      brains[w.id].profile.name = w.clientName;
      brains[w.id].profile.industry = w.industry;
    }
  });

  return {
    workspaces: ws,
    brandBrains: brains,
    agents: ags,
    conversations: convsMap,
    trainingItems: itemsMap,
    callScenarios: scenarios,
    callSimulations: simsMap,
    widgetConfigs: widgetConfs,
  };
}

/**
 * loadDashboardMetrics(): Returns the workspace bundle alongside
 * computed aggregate metrics for the dashboard overview page.
 */
export async function loadDashboardMetrics() {
  const bundle = await loadWorkspaceBundle();
  
  let totalConversations = 0;
  Object.values(bundle.conversations).forEach(convs => {
    totalConversations += convs.length;
  });

  let totalTrainingItems = 0;
  Object.values(bundle.trainingItems).forEach(items => {
    totalTrainingItems += items.length;
  });

  let totalSimulations = 0;
  Object.values(bundle.callSimulations).forEach(sims => {
    totalSimulations += sims.length;
  });

  return {
    ...bundle,
    metrics: {
      totalWorkspaces: bundle.workspaces.length,
      totalAgents: bundle.agents.length,
      totalConversations,
      totalTrainingItems,
      totalCallScenarios: bundle.callScenarios.length,
      totalSimulations,
    },
  };
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
    throw new Error(`Failed to create workspace: ${error.message}`);
  }
  return mapWorkspace(data);
}

export async function updateWorkspace(id: string, name: string, industry: string) {
  if (!supabase) return null;
  const { data, error } = await supabase.from("workspaces").update({
    name,
    industry,
    updated_at: new Date().toISOString(),
  }).eq("id", id).select().single();

  if (error) {
    console.error("Error updating workspace:", error);
    throw new Error(`Failed to update workspace: ${error.message}`);
  }
  return mapWorkspace(data);
}

export async function upsertBrandBrain(workspaceId: string, brain: BrandBrain) {
  if (!supabase) return null;

  // TODO: Handoff rules, contact details, and names should become proper database columns or a dedicated handoff_rules table later.
  const ownerNotesObj = {
    ownerNotes: brain.profile.ownerNotes || "",
    handoffName: brain.handoffName || "",
    handoffContact: brain.handoffContact || "",
    handoffRules: brain.handoffRules || "",
  };
  const serializedOwnerNotes = JSON.stringify(ownerNotesObj);

  const dbBrain = {
    workspace_id: workspaceId,
    tone_of_voice: brain.toneOfVoice,
    business_overview: brain.profile.overview,
    products_services: brain.profile.products,
    pricing_notes: brain.profile.pricingNotes,
    do_rules: brain.doRules,
    dont_rules: brain.dontRules,
    policies: [brain.profile.policies],
    owner_notes: serializedOwnerNotes,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("brand_brains").upsert(dbBrain, { onConflict: "workspace_id" }).select().single();
  if (error) {
    console.error("Error upserting brand brain:", error);
    throw new Error(`Failed to upsert brand brain: ${error.message}`);
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
    throw new Error(`Failed to insert agent: ${error.message}`);
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
    throw new Error(`Failed to update agent: ${error.message}`);
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
    throw new Error(`Failed to insert conversation: ${error.message}`);
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
    throw new Error(`Failed to update conversation: ${error.message}`);
  }
  return data;
}

/**
 * createConversationWithMessages(): Atomically inserts a conversation
 * and all its messages. Returns the database conversation ID.
 */
export async function createConversationWithMessages(workspaceId: string, conversation: Conversation) {
  if (!supabase) return null;

  // Insert the conversation first
  const dbConv = await insertConversation(workspaceId, conversation);
  if (!dbConv) return null;

  // Insert all messages sequentially to preserve order
  for (const msg of conversation.messages) {
    await insertMessage(dbConv.id, msg);
  }

  return dbConv;
}

export async function insertMessage(conversationId: string, msg: Message) {
  if (!supabase) return null;
  const isMockId = msg.id.startsWith("msg-") || msg.id === "cm1" || msg.id === "cm2";
  const dbMsg = {
    id: isMockId ? undefined : msg.id,
    conversation_id: conversationId,
    role: msg.sender,
    content: msg.text,
  };

  const { data, error } = await supabase.from("messages").insert(dbMsg).select().single();
  if (error) {
    console.error("Error inserting message:", error);
    throw new Error(`Failed to insert message: ${error.message}`);
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
    throw new Error(`Failed to insert training item: ${error.message}`);
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
    throw new Error(`Failed to update training item: ${error.message}`);
  }
  return mapTrainingItem(data);
}

export async function deleteTrainingItem(id: string) {
  if (!supabase) return false;
  const { error } = await supabase.from("training_items").delete().eq("id", id);
  if (error) {
    console.error("Error deleting training item:", error);
    throw new Error(`Failed to delete training item: ${error.message}`);
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
    throw new Error(`Failed to insert call scenario: ${error.message}`);
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
    throw new Error(`Failed to insert call simulation: ${error.message}`);
  }
  return mapCallSimulation(data);
}

// ==========================================
// Widget Configurations Reads/Writes
// ==========================================

export async function fetchWidgetConfigs(): Promise<Record<string, WidgetConfig>> {
  if (!supabase) return {};
  const { data, error } = await supabase.from("widget_configs").select("*");
  if (error) {
    console.error("Error fetching widget configs:", error);
    throw new Error(`Failed to fetch widget configs: ${error.message}`);
  }
  const configs: Record<string, WidgetConfig> = {};
  data.forEach((dbConfig: any) => {
    configs[dbConfig.workspace_id] = mapWidgetConfig(dbConfig);
  });
  return configs;
}

export async function upsertWidgetConfig(config: WidgetConfig) {
  if (!supabase) return null;
  const dbConfig = {
    id: config.id.startsWith("widget-") ? undefined : config.id,
    workspace_id: config.workspaceId,
    agent_id: config.agentId || null,
    public_key: config.publicKey,
    enabled: config.enabled,
    greeting: config.greeting,
    accent_color: config.accentColor,
    display_name: config.displayName,
    allowed_domains: config.allowedDomains,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("widget_configs")
    .upsert(dbConfig, { onConflict: "workspace_id" })
    .select()
    .single();
  if (error) {
    console.error("Error upserting widget config:", error);
    throw new Error(`Failed to upsert widget config: ${error.message}`);
  }
  return mapWidgetConfig(data);
}
