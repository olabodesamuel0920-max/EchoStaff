"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  ClientWorkspace, 
  BrandBrain, 
  Agent, 
  Conversation, 
  TrainingItem, 
  SystemStats,
  BusinessProfile,
  FAQ,
  Message,
  CallScenario,
  CallSimulation,
  CallScorecard,
  WidgetConfig
} from "../lib/types";
import { 
  initialWorkspaces, 
  initialBrandBrains, 
  initialAgents, 
  initialConversations, 
  initialTrainingItems, 
  seedSystemStats,
  initialCallScenarios
} from "../lib/seedData";
import { generateMockBrandedResponse } from "../lib/mockAI";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  loadWorkspaceBundle,
  createWorkspace,
  updateWorkspace as updateWorkspaceDb,
  upsertBrandBrain,
  insertAgent,
  updateAgent as updateAgentDb,
  insertConversation,
  updateConversation,
  insertMessage,
  createConversationWithMessages,
  insertTrainingItem,
  updateTrainingItemStatus,
  deleteTrainingItem,
  insertCallScenario,
  insertCallSimulation,
  mapConversation,
  mapTrainingItem,
  mapCallSimulation,
  upsertWidgetConfig
} from "@/lib/supabase/db-service";

export interface AgentInsights {
  detectedIntent: string;
  suggestedLeadStatus: "Cold" | "Warm" | "Hot" | "Converted";
  suggestedFollowUp: boolean;
  confidenceScore: number;
  modelUsed: string;
  usedFallback: boolean;
}

interface StateContextProps {
  activeWorkspaceId: string;
  activeWorkspace: ClientWorkspace | undefined;
  workspaces: ClientWorkspace[];
  brandBrains: Record<string, BrandBrain>;
  agents: Agent[];
  conversations: Record<string, Conversation[]>;
  trainingItems: Record<string, TrainingItem[]>;
  systemStats: SystemStats;
  playgroundMessages: Record<string, Message[]>;
  playgroundInsights: Record<string, AgentInsights>;
  isMockMode: boolean;
  liveAIEnabled: boolean;
  callScenarios: CallScenario[];
  callSimulations: Record<string, CallSimulation[]>;
  widgetConfigs: Record<string, WidgetConfig>;
  user: any;
  authLoading: boolean;
  isSupabaseConfigured: boolean;
  logout: () => Promise<void>;
  onboardingError: string | null;
  dbSyncError: string | null;
  dbConnectionError: string | null;
  retryOnboarding: () => Promise<void>;
  
  // Data mode helpers
  shouldUseSupabase: boolean;
  isSandboxMode: boolean;
  isDatabaseMode: boolean;
  isOfflineFallbackActive: boolean;
  lastSyncTimestamp: string | null;
  refetchData: () => Promise<void>;
  
  setActiveWorkspaceId: (id: string) => void;
  updateBusinessProfile: (profile: BusinessProfile) => void;
  updateToneOfVoice: (tone: string) => void;
  addFAQ: (faq: Omit<FAQ, "id">) => void;
  removeFAQ: (id: string) => void;
  addDoRule: (rule: string) => void;
  removeDoRule: (rule: string) => void;
  addDontRule: (rule: string) => void;
  removeDontRule: (rule: string) => void;
  addAgent: (agent: Omit<Agent, "id" | "linkedBrainId">) => void;
  updateAgent: (agent: Agent) => void;
  sendPlaygroundMessage: (agentId: string, text: string, channel?: string) => Promise<string | undefined>;
  clearPlaygroundHistory: (agentId: string) => void;
  approveTrainingItem: (id: string) => void;
  improveTrainingItem: (id: string, correction: string) => void;
  rejectTrainingItem: (id: string) => void;
  addTrainingItem: (customerQuestion: string, aiAnswer: string) => void;
  addClientWorkspace: (name: string, industry: string, value: number) => void;
  toggleMockMode: () => void;
  addCustomScenario: (scenario: Omit<CallScenario, "id">) => void;
  saveCallSimulation: (simulation: CallSimulation, conversation?: Conversation) => void;
  sendCallSimulationMessage: (agentId: string, text: string, conversationHistory: Message[]) => Promise<any>;
  updateWidgetConfig: (config: Omit<WidgetConfig, "id" | "publicKey" | "workspaceId">) => void;
  updateHandoffRules: (name: string, contact: string, rules: string) => void;
  updateWorkspaceDetails: (name: string, industry: string) => void;
}

const StateContext = createContext<StateContextProps | undefined>(undefined);

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [activeWorkspaceId, setActiveWorkspaceIdRaw] = useState<string>("luna-aesthetics");
  const [workspaces, setWorkspaces] = useState<ClientWorkspace[]>(initialWorkspaces);
  const [brandBrains, setBrandBrains] = useState<Record<string, BrandBrain>>(initialBrandBrains);
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [conversations, setConversations] = useState<Record<string, Conversation[]>>(initialConversations);
  const [trainingItems, setTrainingItems] = useState<Record<string, TrainingItem[]>>(initialTrainingItems);
  const [systemStats, setSystemStats] = useState<SystemStats>(seedSystemStats);
  const [playgroundMessages, setPlaygroundMessages] = useState<Record<string, Message[]>>({});
  const [playgroundInsights, setPlaygroundInsights] = useState<Record<string, AgentInsights>>({});
  const [isMockMode, setIsMockMode] = useState<boolean>(true);
  const [liveAIEnabled, setLiveAIEnabled] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [callScenarios, setCallScenarios] = useState<CallScenario[]>(initialCallScenarios);
  const [callSimulations, setCallSimulations] = useState<Record<string, CallSimulation[]>>({});
  const [widgetConfigs, setWidgetConfigs] = useState<Record<string, WidgetConfig>>({});

  // Supabase Auth and Loader States
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(isSupabaseConfigured);
  const [supabaseConvIds, setSupabaseConvIds] = useState<Record<string, string>>({});

  // Telemetry state hooks
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [dbSyncError, setDbSyncError] = useState<string | null>(null);
  const [dbConnectionError, setDbConnectionError] = useState<string | null>(null);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<string | null>(null);

  // ==========================================
  // Data Mode Helpers (computed)
  // ==========================================
  const shouldUseSupabase = isSupabaseConfigured && !!user && !dbConnectionError;
  const isSandboxMode = !isSupabaseConfigured || (!user && !authLoading);
  const isDatabaseMode = shouldUseSupabase;
  const isOfflineFallbackActive = isSupabaseConfigured && !!user && !!dbConnectionError;

  // Track whether we've already loaded supabase data for the current user to avoid double-loading.
  const loadedUserRef = useRef<string | null>(null);

  // ==========================================
  // User-scoped active workspace persistence
  // ==========================================
  const setActiveWorkspaceId = useCallback((id: string) => {
    setActiveWorkspaceIdRaw(id);
    if (typeof window !== "undefined") {
      const key = user ? `echostaff_active_workspace_id_${user.id}` : "echostaff_active_workspace_id";
      localStorage.setItem(key, id);
    }
  }, [user]);

  // Auth Redirect Guard: Redirect to /login if unauthenticated on dashboard
  useEffect(() => {
    if (isSupabaseConfigured && !authLoading && !user && pathname.startsWith("/dashboard")) {
      router.replace("/login");
    }
  }, [user, authLoading, pathname, router]);

  // Auth listener and loader
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsInitialized(true);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Onboarding starter workspace creator
  const runOnboarding = async (userId: string) => {
    const defaultWorkspaceName = "My First Workspace";
    const defaultIndustry = "Consulting";
    const ws = await createWorkspace(userId, defaultWorkspaceName, defaultIndustry);
    
    if (ws) {
      const starterBrain: BrandBrain = {
        profile: {
          name: defaultWorkspaceName,
          industry: defaultIndustry,
          overview: "A premium consulting business providing strategic advice.",
          products: ["Strategic Planning Session ($250/hour)"],
          pricingNotes: "Payments due at booking.",
          policies: "24-hour cancellation rule.",
          ownerNotes: "Keep answers professional.",
        },
        toneOfVoice: "Professional, knowledgeable, and polite.",
        doRules: ["Answer questions accurately", "Recommend booking a strategy session"],
        dontRules: ["Never give financial advice"],
        faqs: [{ id: "faq-starter", question: "How do I book a session?", answer: "You can book directly by requesting a calendar link." }],
        exampleReplies: ["Hello! How can I assist you with your business strategy today?"]
      };
      await upsertBrandBrain(ws.id, starterBrain);

      const starterAgent: Agent = {
        id: `agent-starter-${Date.now()}`,
        name: "Alex",
        role: "Strategic Growth Assistant",
        personality: "Alex is structured, reliable, and goal-oriented.",
        tone: "Professional & Articulate",
        channels: ["Web chat"],
        status: "Training",
        linkedBrainId: ws.id,
        callReadiness: 80,
        lastSimulationResult: "",
        needsTraining: false,
      };
      await insertAgent(starterAgent);
    }
  };

  // Load database items when authenticated
  const loadSupabaseData = useCallback(async (userId: string) => {
    try {
      setDbConnectionError(null);
      setDbSyncError(null);
      setOnboardingError(null);

      const bundle = await loadWorkspaceBundle();
      
      if (bundle.workspaces.length === 0) {
        try {
          await runOnboarding(userId);
        } catch (onbErr: any) {
          console.error("Onboarding failed:", onbErr);
          setOnboardingError(onbErr.message || "Failed to initialize default workspace");
          return;
        }
        // Reload after onboarding
        const reloadedBundle = await loadWorkspaceBundle();
        applyBundle(reloadedBundle, userId);
      } else {
        applyBundle(bundle, userId);
      }

      setIsMockMode(false);
      setLastSyncTimestamp(new Date().toISOString());
    } catch (error: any) {
      console.error("Failed to load Supabase data:", error);
      setDbConnectionError(error.message || "Could not connect to database");
      setIsMockMode(true);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  /**
   * applyBundle(): Applies a loaded WorkspaceBundle into React state,
   * and restores user-scoped active workspace from localStorage.
   */
  const applyBundle = (bundle: Awaited<ReturnType<typeof loadWorkspaceBundle>>, userId: string) => {
    setWorkspaces(bundle.workspaces);
    setBrandBrains(bundle.brandBrains);
    setAgents(bundle.agents);
    setConversations(bundle.conversations);
    setTrainingItems(bundle.trainingItems);
    setCallScenarios(bundle.callScenarios);
    setCallSimulations(bundle.callSimulations);
    setWidgetConfigs(bundle.widgetConfigs || {});

    // Restore user-scoped active workspace with ownership verification
    if (bundle.workspaces.length > 0) {
      const storedKey = `echostaff_active_workspace_id_${userId}`;
      const storedId = typeof window !== "undefined" ? localStorage.getItem(storedKey) : null;
      
      if (storedId && bundle.workspaces.some(w => w.id === storedId)) {
        setActiveWorkspaceIdRaw(storedId);
      } else {
        setActiveWorkspaceIdRaw(bundle.workspaces[0].id);
      }
    }
  };

  /**
   * refetchData(): Public method to force-reload all data from Supabase.
   * Used by the Telemetry Panel's "Force Refetch" button.
   * No-op in sandbox mode.
   */
  const refetchData = useCallback(async () => {
    if (!shouldUseSupabase || !user) return;
    await loadSupabaseData(user.id);
  }, [shouldUseSupabase, user, loadSupabaseData]);

  const retryOnboarding = async () => {
    if (!user) return;
    setAuthLoading(true);
    setOnboardingError(null);
    try {
      await loadSupabaseData(user.id);
    } catch (err: any) {
      console.error("Retry onboarding failed:", err);
      setOnboardingError(err.message || "Failed to initialize default workspace");
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // Only load if we haven't already loaded for this user
      if (loadedUserRef.current !== user.id) {
        loadedUserRef.current = user.id;
        loadSupabaseData(user.id);
      }
    } else {
      loadedUserRef.current = null;
      // If unauthenticated or logged out, load from localStorage fallback
      setIsMockMode(true);
    }
  }, [user, loadSupabaseData]);

  // 1. Initial Load from LocalStorage (Fallback / Mock Mode only)
  useEffect(() => {
    if (typeof window !== "undefined" && !user) {
      try {
        const storedActiveId = localStorage.getItem("echostaff_active_workspace_id");
        const storedWorkspaces = localStorage.getItem("echostaff_workspaces");
        const storedBrains = localStorage.getItem("echostaff_brand_brains");
        const storedAgents = localStorage.getItem("echostaff_agents");
        const storedConversations = localStorage.getItem("echostaff_conversations");
        const storedTraining = localStorage.getItem("echostaff_training_items");
        const storedStats = localStorage.getItem("echostaff_system_stats");
        const storedPlayground = localStorage.getItem("echostaff_playground_messages");
        const storedInsights = localStorage.getItem("echostaff_playground_insights");
        const storedScenarios = localStorage.getItem("echostaff_call_scenarios");
        const storedSimulations = localStorage.getItem("echostaff_call_simulations");
        const storedWidgetConfigs = localStorage.getItem("echostaff_widget_configs");

        if (storedActiveId) setActiveWorkspaceIdRaw(storedActiveId);
        if (storedWorkspaces) setWorkspaces(JSON.parse(storedWorkspaces));
        if (storedBrains) setBrandBrains(JSON.parse(storedBrains));
        if (storedAgents) setAgents(JSON.parse(storedAgents));
        if (storedConversations) setConversations(JSON.parse(storedConversations));
        if (storedTraining) setTrainingItems(JSON.parse(storedTraining));
        if (storedStats) setSystemStats(JSON.parse(storedStats));
        if (storedPlayground) setPlaygroundMessages(JSON.parse(storedPlayground));
        if (storedInsights) setPlaygroundInsights(JSON.parse(storedInsights));
        if (storedScenarios) setCallScenarios(JSON.parse(storedScenarios));
        if (storedSimulations) setCallSimulations(JSON.parse(storedSimulations));
        if (storedWidgetConfigs) setWidgetConfigs(JSON.parse(storedWidgetConfigs));
      } catch (e) {
        console.error("Failed to load state from localStorage", e);
      } finally {
        setIsInitialized(true);
      }
    }
  }, [user]);


  useEffect(() => {
    fetch("/api/chat")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.liveAIEnabled === "boolean") {
          setLiveAIEnabled(data.liveAIEnabled);
        }
      })
      .catch((err) => console.warn("Failed to check live AI status:", err));
  }, []);

  // 2. Sync to LocalStorage (only in sandbox mode / when not logged into Supabase)
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined" && !user) {
      try {
        localStorage.setItem("echostaff_active_workspace_id", activeWorkspaceId);
        localStorage.setItem("echostaff_workspaces", JSON.stringify(workspaces));
        localStorage.setItem("echostaff_brand_brains", JSON.stringify(brandBrains));
        localStorage.setItem("echostaff_agents", JSON.stringify(agents));
        localStorage.setItem("echostaff_conversations", JSON.stringify(conversations));
        localStorage.setItem("echostaff_training_items", JSON.stringify(trainingItems));
        localStorage.setItem("echostaff_system_stats", JSON.stringify(systemStats));
        localStorage.setItem("echostaff_playground_messages", JSON.stringify(playgroundMessages));
        localStorage.setItem("echostaff_playground_insights", JSON.stringify(playgroundInsights));
        localStorage.setItem("echostaff_call_scenarios", JSON.stringify(callScenarios));
        localStorage.setItem("echostaff_call_simulations", JSON.stringify(callSimulations));
        localStorage.setItem("echostaff_widget_configs", JSON.stringify(widgetConfigs));
      } catch (e) {
        console.error("Failed to sync state to localStorage", e);
      }
    }
  }, [
    activeWorkspaceId,
    workspaces,
    brandBrains,
    agents,
    conversations,
    trainingItems,
    systemStats,
    playgroundMessages,
    playgroundInsights,
    isInitialized,
    callScenarios,
    callSimulations,
    widgetConfigs
  ]);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  // ==========================================
  // Helper: Wrap Supabase writes with error tracking
  // ==========================================
  const syncToDb = async <T,>(operation: () => Promise<T>, errorContext: string): Promise<T | null> => {
    try {
      const result = await operation();
      // Clear any previous sync error on success
      setDbSyncError(null);
      return result;
    } catch (err: any) {
      console.error(`Failed to sync ${errorContext}:`, err);
      setDbSyncError(err.message || `Failed to sync ${errorContext}`);
      return null;
    }
  };

  // Business Profile Updates
  const updateBusinessProfile = (profile: BusinessProfile) => {
    setBrandBrains((prev) => {
      const updated = {
        ...prev,
        [activeWorkspaceId]: {
          ...prev[activeWorkspaceId],
          profile,
        },
      };
      if (shouldUseSupabase) {
        syncToDb(
          () => upsertBrandBrain(activeWorkspaceId, updated[activeWorkspaceId]),
          "Brand Brain profile"
        );
      }
      return updated;
    });
  };

  // Tone of Voice Updates
  const updateToneOfVoice = (tone: string) => {
    setBrandBrains((prev) => {
      const updated = {
        ...prev,
        [activeWorkspaceId]: {
          ...prev[activeWorkspaceId],
          toneOfVoice: tone,
        },
      };
      if (shouldUseSupabase) {
        syncToDb(
          () => upsertBrandBrain(activeWorkspaceId, updated[activeWorkspaceId]),
          "Brand Brain tone"
        );
      }
      return updated;
    });
  };

  // FAQs
  const addFAQ = (faq: Omit<FAQ, "id">) => {
    const newFaq: FAQ = {
      ...faq,
      id: `faq-${Date.now()}`,
    };
    setBrandBrains((prev) => {
      const updated = {
        ...prev,
        [activeWorkspaceId]: {
          ...prev[activeWorkspaceId],
          faqs: [...prev[activeWorkspaceId].faqs, newFaq],
        },
      };
      if (shouldUseSupabase) {
        syncToDb(
          () => upsertBrandBrain(activeWorkspaceId, updated[activeWorkspaceId]),
          "Brand Brain FAQ addition"
        );
      }
      return updated;
    });
  };

  const removeFAQ = (id: string) => {
    setBrandBrains((prev) => {
      const updated = {
        ...prev,
        [activeWorkspaceId]: {
          ...prev[activeWorkspaceId],
          faqs: prev[activeWorkspaceId].faqs.filter((f) => f.id !== id),
        },
      };
      if (shouldUseSupabase) {
        syncToDb(
          () => upsertBrandBrain(activeWorkspaceId, updated[activeWorkspaceId]),
          "Brand Brain FAQ removal"
        );
      }
      return updated;
    });
  };

  // Do Rules
  const addDoRule = (rule: string) => {
    setBrandBrains((prev) => {
      const updated = {
        ...prev,
        [activeWorkspaceId]: {
          ...prev[activeWorkspaceId],
          doRules: [...prev[activeWorkspaceId].doRules, rule],
        },
      };
      if (shouldUseSupabase) {
        syncToDb(
          () => upsertBrandBrain(activeWorkspaceId, updated[activeWorkspaceId]),
          "Brand Brain Do Rule addition"
        );
      }
      return updated;
    });
  };

  const removeDoRule = (ruleToRemove: string) => {
    setBrandBrains((prev) => {
      const updated = {
        ...prev,
        [activeWorkspaceId]: {
          ...prev[activeWorkspaceId],
          doRules: prev[activeWorkspaceId].doRules.filter((r) => r !== ruleToRemove),
        },
      };
      if (shouldUseSupabase) {
        syncToDb(
          () => upsertBrandBrain(activeWorkspaceId, updated[activeWorkspaceId]),
          "Brand Brain Do Rule removal"
        );
      }
      return updated;
    });
  };

  // Don't Rules
  const addDontRule = (rule: string) => {
    setBrandBrains((prev) => {
      const updated = {
        ...prev,
        [activeWorkspaceId]: {
          ...prev[activeWorkspaceId],
          dontRules: [...prev[activeWorkspaceId].dontRules, rule],
        },
      };
      if (shouldUseSupabase) {
        syncToDb(
          () => upsertBrandBrain(activeWorkspaceId, updated[activeWorkspaceId]),
          "Brand Brain Don't Rule addition"
        );
      }
      return updated;
    });
  };

  const removeDontRule = (ruleToRemove: string) => {
    setBrandBrains((prev) => {
      const updated = {
        ...prev,
        [activeWorkspaceId]: {
          ...prev[activeWorkspaceId],
          dontRules: prev[activeWorkspaceId].dontRules.filter((r) => r !== ruleToRemove),
        },
      };
      if (shouldUseSupabase) {
        syncToDb(
          () => upsertBrandBrain(activeWorkspaceId, updated[activeWorkspaceId]),
          "Brand Brain Don't Rule removal"
        );
      }
      return updated;
    });
  };

  // Agents
  const addAgent = (newAgentData: Omit<Agent, "id" | "linkedBrainId">) => {
    const newAgent: Agent = {
      ...newAgentData,
      id: `agent-${Date.now()}`,
      linkedBrainId: activeWorkspaceId,
    };
    setAgents((prev) => [...prev, newAgent]);

    // Increment agent count in workspaces
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === activeWorkspaceId ? { ...w, agentsCount: w.agentsCount + 1 } : w
      )
    );
    setSystemStats((prev) => ({ ...prev, totalAgents: prev.totalAgents + 1 }));

    if (shouldUseSupabase) {
      syncToDb(
        () => insertAgent(newAgent).then((dbAgent) => {
          if (dbAgent) {
            setAgents((prev) =>
              prev.map((a) => (a.id === newAgent.id ? dbAgent : a))
            );
          }
          return dbAgent;
        }),
        "Agent creation"
      );
    }
  };

  const updateAgent = (updatedAgent: Agent) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === updatedAgent.id ? updatedAgent : a))
    );
    if (shouldUseSupabase) {
      syncToDb(
        () => updateAgentDb(updatedAgent),
        "Agent update"
      );
    }
  };

  // Play Ground Messaging
  const sendPlaygroundMessage = async (agentId: string, text: string, channel?: string) => {
    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Store user message in playground messages list
    setPlaygroundMessages((prev) => ({
      ...prev,
      [agentId]: [...(prev[agentId] || []), userMsg],
    }));

    // Sync User Message to main conversations log
    setConversations((prev) => {
      const workspaceConvs = prev[activeWorkspaceId] || [];
      const existingConvIdx = workspaceConvs.findIndex(c => c.id === `playground-conv-${agentId}`);
      
      const updatedConvs = [...workspaceConvs];
      if (existingConvIdx >= 0) {
        const existingConv = updatedConvs[existingConvIdx];
        updatedConvs[existingConvIdx] = {
          ...existingConv,
          channel: channel || existingConv.channel || "Web chat",
          summary: text.slice(0, 50) + (text.length > 50 ? "..." : ""),
          date: new Date().toISOString(),
          messages: [...existingConv.messages, userMsg],
        };
      } else {
        const newConv: Conversation = {
          id: `playground-conv-${agentId}`,
          customerName: "Playground Tester",
          channel: channel || "Web chat",
          summary: text.slice(0, 50) + (text.length > 50 ? "..." : ""),
          leadStatus: "New",
          date: new Date().toISOString(),
          sentiment: "Neutral",
          needsFollowUp: false,
          messages: [userMsg],
        };
        updatedConvs.unshift(newConv);
      }

      return {
        ...prev,
        [activeWorkspaceId]: updatedConvs,
      };
    });

    // Supabase syncing for User message
    let dbConvId = supabaseConvIds[agentId];
    if (shouldUseSupabase) {
      try {
        if (!dbConvId) {
          const dbConv = await insertConversation(activeWorkspaceId, {
            id: `playground-conv-${agentId}`,
            customerName: "Playground Tester",
            channel: channel || "Web chat",
            summary: text.slice(0, 50) + (text.length > 50 ? "..." : ""),
            leadStatus: "New",
            date: new Date().toISOString(),
            sentiment: "Neutral",
            needsFollowUp: false,
          });
          if (dbConv) {
            dbConvId = dbConv.id;
            setSupabaseConvIds(prev => ({ ...prev, [agentId]: dbConv.id }));
          }
        } else {
          await updateConversation({
            id: dbConvId,
            customerName: "Playground Tester",
            channel: channel || "Web chat",
            summary: text.slice(0, 50) + (text.length > 50 ? "..." : ""),
            leadStatus: "New",
            date: new Date().toISOString(),
            sentiment: "Neutral",
            needsFollowUp: false,
          });
        }
        if (dbConvId) {
          await insertMessage(dbConvId, userMsg);
        }
      } catch (err) {
        console.warn("Failed to sync user message to Supabase:", err);
      }
    }

    const agent = agents.find((a) => a.id === agentId);
    const brain = brandBrains[activeWorkspaceId];

    if (agent && brain) {
      try {
        // Retrieve conversation history
        const history = playgroundMessages[agentId] || [];

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            activeWorkspace,
            brandBrain: brain,
            selectedAgent: agent,
            userMessage: text,
            conversationHistory: history
          })
        });

        if (!response.ok) {
          throw new Error("Secure OpenAI API chat endpoint failed");
        }

        const data = await response.json();
        
        const agentMsg: Message = {
          id: `msg-${Date.now()}-agent`,
          sender: "agent",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setPlaygroundMessages((prev) => ({
          ...prev,
          [agentId]: [...(prev[agentId] || []), agentMsg],
        }));

        setPlaygroundInsights((prev) => ({
          ...prev,
          [agentId]: {
            detectedIntent: data.detectedIntent,
            suggestedLeadStatus: data.suggestedLeadStatus,
            suggestedFollowUp: data.suggestedFollowUp,
            confidenceScore: data.confidenceScore,
            modelUsed: data.modelUsed,
            usedFallback: data.usedFallback
          }
        }));

        // Sync Agent Response to conversations with AI insights
        setConversations((prev) => {
          const workspaceConvs = prev[activeWorkspaceId] || [];
          const existingConvIdx = workspaceConvs.findIndex(c => c.id === `playground-conv-${agentId}`);
          
          if (existingConvIdx >= 0) {
            const updatedConvs = [...workspaceConvs];
            const existingConv = updatedConvs[existingConvIdx];
            
            updatedConvs[existingConvIdx] = {
              ...existingConv,
              leadStatus: data.suggestedLeadStatus || existingConv.leadStatus,
              needsFollowUp: data.suggestedFollowUp ?? existingConv.needsFollowUp,
              sentiment: text.toLowerCase().includes("thank") || text.toLowerCase().includes("great") ? "Positive" : existingConv.sentiment,
              messages: [...existingConv.messages, agentMsg],
            };
            return {
              ...prev,
              [activeWorkspaceId]: updatedConvs,
            };
          }
          return prev;
        });

        // Supabase syncing for Agent Response
        if (shouldUseSupabase && dbConvId) {
          try {
            await insertMessage(dbConvId, agentMsg);
            await updateConversation({
              id: dbConvId,
              customerName: "Playground Tester",
              channel: channel || "Web chat",
              summary: data.reply.slice(0, 50) + (data.reply.length > 50 ? "..." : ""),
              leadStatus: data.suggestedLeadStatus || "Warm",
              date: new Date().toISOString(),
              sentiment: text.toLowerCase().includes("thank") || text.toLowerCase().includes("great") ? "Positive" : "Neutral",
              needsFollowUp: data.suggestedFollowUp ?? false,
            });
          } catch (err) {
            console.warn("Failed to sync agent response to Supabase:", err);
          }
        }

        // Increment stats
        setSystemStats((prev) => ({ ...prev, totalConversations: prev.totalConversations + 1 }));
        setWorkspaces((prev) =>
          prev.map((w) =>
            w.id === activeWorkspaceId ? { ...w, volume: w.volume + 1 } : w
          )
        );

        return data.reply;

      } catch (err) {
        console.warn("Playground secure completion failed, invoking client fallback:", err);
        
        // Timeout mock AI reply
        const fallbackReply = generateMockBrandedResponse(text, agent, brain);
        const agentMsg: Message = {
          id: `msg-${Date.now()}-agent`,
          sender: "agent",
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setPlaygroundMessages((prev) => ({
          ...prev,
          [agentId]: [...(prev[agentId] || []), agentMsg],
        }));

        setPlaygroundInsights((prev) => ({
          ...prev,
          [agentId]: {
            detectedIntent: "general query",
            suggestedLeadStatus: "Warm",
            suggestedFollowUp: true,
            confidenceScore: 0.85,
            modelUsed: "Offline Local Mock Fallback",
            usedFallback: true
          }
        }));

        // Sync fallback response to conversations list
        setConversations((prev) => {
          const workspaceConvs = prev[activeWorkspaceId] || [];
          const existingConvIdx = workspaceConvs.findIndex(c => c.id === `playground-conv-${agentId}`);
          
          if (existingConvIdx >= 0) {
            const updatedConvs = [...workspaceConvs];
            const existingConv = updatedConvs[existingConvIdx];
            
            const textLower = text.toLowerCase();
            const isHot = textLower.includes("price") || textLower.includes("cost") || textLower.includes("book") || textLower.includes("schedule") || textLower.includes("buy") || textLower.includes("pricing") || textLower.includes("consultation");
            
            updatedConvs[existingConvIdx] = {
              ...existingConv,
              channel: channel || existingConv.channel || "Web chat",
              leadStatus: isHot ? "Hot" : existingConv.leadStatus,
              needsFollowUp: isHot ? true : existingConv.needsFollowUp,
              messages: [...existingConv.messages, agentMsg],
            };
            return {
              ...prev,
              [activeWorkspaceId]: updatedConvs,
            };
          }
          return prev;
        });

        // Supabase syncing for Fallback Agent Response
        if (shouldUseSupabase && dbConvId) {
          try {
            await insertMessage(dbConvId, agentMsg);
            const textLower = text.toLowerCase();
            const isHot = textLower.includes("price") || textLower.includes("cost") || textLower.includes("book") || textLower.includes("schedule") || textLower.includes("buy") || textLower.includes("pricing") || textLower.includes("consultation");
            await updateConversation({
              id: dbConvId,
              customerName: "Playground Tester",
              channel: channel || "Web chat",
              summary: fallbackReply.slice(0, 50) + (fallbackReply.length > 50 ? "..." : ""),
              leadStatus: isHot ? "Hot" : "Warm",
              date: new Date().toISOString(),
              sentiment: "Neutral",
              needsFollowUp: isHot,
            });
          } catch (err2) {
            console.warn("Failed to sync fallback message to Supabase:", err2);
          }
        }

        setSystemStats((prev) => ({ ...prev, totalConversations: prev.totalConversations + 1 }));
        setWorkspaces((prev) =>
          prev.map((w) =>
            w.id === activeWorkspaceId ? { ...w, volume: w.volume + 1 } : w
          )
        );
        return fallbackReply;
      }
    }
    return undefined;
  };

  const clearPlaygroundHistory = (agentId: string) => {
    setPlaygroundMessages((prev) => ({
      ...prev,
      [agentId]: [],
    }));

    setPlaygroundInsights((prev) => {
      const updated = { ...prev };
      delete updated[agentId];
      return updated;
    });

    setConversations((prev) => ({
      ...prev,
      [activeWorkspaceId]: (prev[activeWorkspaceId] || []).filter(c => c.id !== `playground-conv-${agentId}`),
    }));

    // If Supabase is active, clear session references for this agent playground chat
    setSupabaseConvIds(prev => {
      const updated = { ...prev };
      delete updated[agentId];
      return updated;
    });
  };

  // Call Lab Actions
  const addCustomScenario = (scenario: Omit<CallScenario, "id">) => {
    const newScen: CallScenario = {
      ...scenario,
      id: `scen-custom-${Date.now()}`
    };
    setCallScenarios((prev) => [...prev, newScen]);
    if (shouldUseSupabase) {
      syncToDb(
        () => insertCallScenario(activeWorkspaceId, newScen).then((dbScenario) => {
          if (dbScenario) {
            setCallScenarios(prevScens => prevScens.map(sc => sc.id === newScen.id ? dbScenario : sc));
          }
          return dbScenario;
        }),
        "Call Scenario"
      );
    }
  };

  const saveCallSimulation = (sim: CallSimulation, conversation?: Conversation) => {
    setCallSimulations((prev) => {
      const workspaceSims = prev[activeWorkspaceId] || [];
      return {
        ...prev,
        [activeWorkspaceId]: [sim, ...workspaceSims]
      };
    });

    if (conversation) {
      setConversations((prev) => {
        const workspaceConvs = prev[activeWorkspaceId] || [];
        return {
          ...prev,
          [activeWorkspaceId]: [conversation, ...workspaceConvs]
        };
      });
    }

    if (sim.scorecard) {
      setAgents((prev) =>
        prev.map((a) => {
          if (a.id === sim.agentId) {
            const currentScore = sim.scorecard?.qualityScore || 85;
            const needsTraining = currentScore < 80 || sim.scorecard?.suggestedFollowUp;
            const updatedAgent = {
              ...a,
              callReadiness: currentScore,
              lastSimulationResult: `${currentScore}% (${currentScore >= 90 ? "Excellent" : currentScore >= 75 ? "Good" : "Needs Work"})`,
              needsTraining
            };
            if (shouldUseSupabase) {
              syncToDb(
                () => updateAgentDb(updatedAgent),
                "Agent update from scorecard"
              );
            }
            return updatedAgent;
          }
          return a;
        })
      );
    }

    if (shouldUseSupabase) {
      if (conversation) {
        syncToDb(
          async () => {
            const dbConv = await createConversationWithMessages(activeWorkspaceId, conversation);
            if (dbConv) {
              const updatedSim = {
                ...sim,
                conversationId: dbConv.id
              };
              await insertCallSimulation(activeWorkspaceId, updatedSim);
            }
            return dbConv;
          },
          "Call Simulation"
        );
      }
    }
  };

  const sendCallSimulationMessage = async (
    agentId: string,
    text: string,
    conversationHistory: Message[]
  ) => {
    const agent = agents.find((a) => a.id === agentId);
    const brain = brandBrains[activeWorkspaceId];

    if (!agent || !brain) {
      throw new Error("Missing agent or brand brain configuration");
    }

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        activeWorkspace,
        brandBrain: brain,
        selectedAgent: agent,
        userMessage: text,
        conversationHistory
      })
    });

    if (!response.ok) {
      throw new Error("Call simulation completions request failed");
    }

    return response.json();
  };

  // Training Center Actions
  const addTrainingItem = (customerQuestion: string, aiAnswer: string) => {
    const newItem: TrainingItem = {
      id: `train-sim-${Date.now()}`,
      customerQuestion,
      aiAnswer,
      status: "Pending"
    };
    setTrainingItems((prev) => {
      const workspaceItems = prev[activeWorkspaceId] || [];
      const updated = {
        ...prev,
        [activeWorkspaceId]: [newItem, ...workspaceItems]
      };
      if (shouldUseSupabase) {
        syncToDb(
          () => insertTrainingItem(activeWorkspaceId, newItem).then((dbItem) => {
            if (dbItem) {
              setTrainingItems(prevCurrent => {
                const currentItems = prevCurrent[activeWorkspaceId] || [];
                return {
                  ...prevCurrent,
                  [activeWorkspaceId]: currentItems.map(item => item.id === newItem.id ? dbItem : item)
                };
              });
            }
            return dbItem;
          }),
          "Training Item creation"
        );
      }
      return updated;
    });
  };

  const approveTrainingItem = (id: string) => {
    setTrainingItems((prev) => ({
      ...prev,
      [activeWorkspaceId]: prev[activeWorkspaceId].filter((t) => t.id !== id),
    }));

    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === activeWorkspaceId ? { ...w, trainingStatus: Math.min(w.trainingStatus + 2, 100) } : w
      )
    );

    if (shouldUseSupabase) {
      syncToDb(
        () => updateTrainingItemStatus(id, "Approved"),
        "Training Item approval"
      );
    }
  };

  const improveTrainingItem = (id: string, correction: string) => {
    const item = trainingItems[activeWorkspaceId]?.find((t) => t.id === id);
    if (!item) return;

    setTrainingItems((prev) => ({
      ...prev,
      [activeWorkspaceId]: prev[activeWorkspaceId].filter((t) => t.id !== id),
    }));

    const newFAQ: FAQ = {
      id: `faq-from-train-${Date.now()}`,
      question: item.customerQuestion,
      answer: correction,
    };

    setBrandBrains((prev) => {
      const updated = {
        ...prev,
        [activeWorkspaceId]: {
          ...prev[activeWorkspaceId],
          faqs: [...prev[activeWorkspaceId].faqs, newFAQ],
          doRules: [...prev[activeWorkspaceId].doRules, `Ensure replies to "${item.customerQuestion}" align with: ${correction.slice(0, 50)}...`],
        },
      };
      if (shouldUseSupabase) {
        syncToDb(
          () => upsertBrandBrain(activeWorkspaceId, updated[activeWorkspaceId]),
          "Brand Brain improvement FAQ"
        );
      }
      return updated;
    });

    const resolvedConv: Conversation = {
      id: `conv-res-${Date.now()}`,
      customerName: "Audited Customer Q",
      channel: "Training Review",
      summary: `Owner resolved: ${item.customerQuestion.slice(0, 30)}`,
      leadStatus: "Converted",
      date: new Date().toISOString(),
      sentiment: "Positive",
      needsFollowUp: false,
      messages: [
        { id: "cm1", sender: "user", text: item.customerQuestion, timestamp: "Now" },
        { id: "cm2", sender: "agent", text: correction, timestamp: "Now" },
      ],
    };

    setConversations((prev) => ({
      ...prev,
      [activeWorkspaceId]: [resolvedConv, ...(prev[activeWorkspaceId] || [])],
    }));

    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === activeWorkspaceId ? { ...w, trainingStatus: Math.min(w.trainingStatus + 4, 100) } : w
      )
    );

    if (shouldUseSupabase) {
      syncToDb(
        () => updateTrainingItemStatus(id, "Improved", correction),
        "Training Item improvement"
      );
      syncToDb(
        () => createConversationWithMessages(activeWorkspaceId, resolvedConv),
        "Resolved conversation"
      );
    }
  };

  const rejectTrainingItem = (id: string) => {
    const item = trainingItems[activeWorkspaceId]?.find((t) => t.id === id);
    setTrainingItems((prev) => ({
      ...prev,
      [activeWorkspaceId]: prev[activeWorkspaceId].filter((t) => t.id !== id),
    }));

    if (item) {
      setBrandBrains((prev) => {
        const updated = {
          ...prev,
          [activeWorkspaceId]: {
            ...prev[activeWorkspaceId],
            dontRules: [...prev[activeWorkspaceId].dontRules, `Never say: "${item.aiAnswer}" when asked about "${item.customerQuestion.slice(0, 35)}..."`],
          },
        };
        if (shouldUseSupabase) {
          syncToDb(
            () => upsertBrandBrain(activeWorkspaceId, updated[activeWorkspaceId]),
            "Brand Brain reject rule"
          );
          syncToDb(
            () => deleteTrainingItem(id),
            "Training Item deletion"
          );
        }
        return updated;
      });
    }
  };

  // Add Client Workspace in Agency Mode
  const addClientWorkspace = (name: string, industry: string, value: number) => {
    const cleanId = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const newWs: ClientWorkspace = {
      id: cleanId,
      clientName: name,
      industry,
      agentsCount: 0,
      volume: 0,
      value,
      trainingStatus: 50,
    };

    const newBrain: BrandBrain = {
      profile: {
        name,
        industry,
        overview: `Overview for ${name}. Define your business goals in the Brand Brain settings.`,
        products: [],
        pricingNotes: "",
        policies: "",
        ownerNotes: "",
      },
      toneOfVoice: "Professional and polite.",
      doRules: ["Be courteous and helpful."],
      dontRules: ["Never give inaccurate information."],
      faqs: [],
      exampleReplies: [],
    };

    setWorkspaces((prev) => [...prev, newWs]);
    setBrandBrains((prev) => ({ ...prev, [cleanId]: newBrain }));
    
    const welcomeAgent: Agent = {
      id: `agent-auto-${Date.now()}`,
      name: "Welcome Bot",
      role: "Trainee Representative",
      personality: "A simple welcome assistant created automatically.",
      tone: "Polite & Helpful",
      channels: ["Web chat"],
      status: "Draft",
      linkedBrainId: cleanId,
    };
    setAgents((prev) => [...prev, welcomeAgent]);
    setConversations((prev) => ({ ...prev, [cleanId]: [] }));
    setTrainingItems((prev) => ({ ...prev, [cleanId]: [] }));

    setSystemStats((prev) => ({
      ...prev,
      totalBusinesses: prev.totalBusinesses + 1,
    }));

    if (shouldUseSupabase) {
      syncToDb(
        async () => {
          const dbWs = await createWorkspace(user.id, name, industry);
          if (dbWs) {
            setWorkspaces(prevWs => prevWs.map(w => w.id === cleanId ? dbWs : w));
            setBrandBrains(prevBrains => {
              const updated = { ...prevBrains, [dbWs.id]: newBrain };
              delete updated[cleanId];
              return updated;
            });
            setActiveWorkspaceId(dbWs.id);
            await upsertBrandBrain(dbWs.id, newBrain);
            
            const dbAgentInput = {
              ...welcomeAgent,
              linkedBrainId: dbWs.id
            };
            await insertAgent(dbAgentInput);
          }
          return dbWs;
        },
        "Client workspace creation"
      );
    }
  };

  const updateWidgetConfig = (newConfigData: Omit<WidgetConfig, "id" | "publicKey" | "workspaceId">) => {
    setWidgetConfigs((prev) => {
      const existing = prev[activeWorkspaceId] || {
        id: `widget-${activeWorkspaceId}`,
        workspaceId: activeWorkspaceId,
        agentId: "",
        publicKey: "pk_" + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10),
        enabled: true,
        greeting: "Hello! How can we help you today?",
        accentColor: "#10b981",
        displayName: "AI Assistant",
        allowedDomains: [],
      };
      const updatedConfig: WidgetConfig = {
        ...existing,
        ...newConfigData,
      };
      const updated = {
        ...prev,
        [activeWorkspaceId]: updatedConfig,
      };
      if (shouldUseSupabase) {
        syncToDb(
          () => upsertWidgetConfig(updatedConfig),
          "Widget Configuration"
        );
      }
      return updated;
    });
  };

  const updateHandoffRules = (name: string, contact: string, rules: string) => {
    setBrandBrains((prev) => {
      const existing = prev[activeWorkspaceId] || {
        profile: { name: "", industry: "", overview: "", products: [], pricingNotes: "", policies: "", ownerNotes: "" },
        faqs: [],
        toneOfVoice: "Professional and polite.",
        doRules: [],
        dontRules: [],
        exampleReplies: [],
      };
      const updatedBrain = {
        ...existing,
        handoffName: name,
        handoffContact: contact,
        handoffRules: rules,
      };
      const updated = {
        ...prev,
        [activeWorkspaceId]: updatedBrain,
      };
      if (shouldUseSupabase) {
        syncToDb(
          () => upsertBrandBrain(activeWorkspaceId, updatedBrain),
          "Brand Brain handoff rules"
        );
      }
      return updated;
    });
  };

  const updateWorkspaceDetails = (name: string, industry: string) => {
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === activeWorkspaceId ? { ...w, clientName: name, industry } : w
      )
    );
    if (shouldUseSupabase) {
      syncToDb(
        () => updateWorkspaceDb(activeWorkspaceId, name, industry),
        "Workspace Details Update"
      );
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    loadedUserRef.current = null;
    setWorkspaces(initialWorkspaces);
    setBrandBrains(initialBrandBrains);
    setAgents(initialAgents);
    setConversations(initialConversations);
    setTrainingItems(initialTrainingItems);
    setCallScenarios(initialCallScenarios);
    setCallSimulations({});
    setWidgetConfigs({});
    setActiveWorkspaceIdRaw("luna-aesthetics");
    setLastSyncTimestamp(null);
    setDbSyncError(null);
    setDbConnectionError(null);
    router.push("/login");
  };

  const toggleMockMode = () => {
    setIsMockMode((prev) => !prev);
  };

  if (isSupabaseConfigured && authLoading && pathname.startsWith("/dashboard")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-sm text-zinc-400 font-medium tracking-wider animate-pulse">Securing workspace session...</p>
        </div>
      </div>
    );
  }

  if (isSupabaseConfigured && !user && pathname.startsWith("/dashboard")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-sm text-zinc-400 font-medium tracking-wider animate-pulse">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <StateContext.Provider
      value={{
        activeWorkspaceId,
        activeWorkspace,
        workspaces,
        brandBrains,
        agents,
        conversations,
        trainingItems,
        systemStats,
        playgroundMessages,
        playgroundInsights,
        isMockMode,
        liveAIEnabled,
        callScenarios,
        callSimulations,
        widgetConfigs,
        user,
        authLoading,
        isSupabaseConfigured,
        logout,
        onboardingError,
        dbSyncError,
        dbConnectionError,
        retryOnboarding,
        shouldUseSupabase,
        isSandboxMode,
        isDatabaseMode,
        isOfflineFallbackActive,
        lastSyncTimestamp,
        refetchData,
        setActiveWorkspaceId,
        addCustomScenario,
        saveCallSimulation,
        sendCallSimulationMessage,
        updateBusinessProfile,
        updateToneOfVoice,
        addFAQ,
        removeFAQ,
        addDoRule,
        removeDoRule,
        addDontRule,
        removeDontRule,
        addAgent,
        updateAgent,
        sendPlaygroundMessage,
        clearPlaygroundHistory,
        approveTrainingItem,
        improveTrainingItem,
        rejectTrainingItem,
        addTrainingItem,
        addClientWorkspace,
        toggleMockMode,
        updateWidgetConfig,
        updateHandoffRules,
        updateWorkspaceDetails,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within a StateProvider");
  }
  return context;
};
