"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  ClientWorkspace, 
  BrandBrain, 
  Agent, 
  Conversation, 
  TrainingItem, 
  SystemStats,
  BusinessProfile,
  FAQ,
  Message
} from "../lib/types";
import { 
  initialWorkspaces, 
  initialBrandBrains, 
  initialAgents, 
  initialConversations, 
  initialTrainingItems, 
  seedSystemStats 
} from "../lib/seedData";
import { generateMockBrandedResponse } from "../lib/mockAI";

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
  addClientWorkspace: (name: string, industry: string, value: number) => void;
  toggleMockMode: () => void;
}

const StateContext = createContext<StateContextProps | undefined>(undefined);

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>("luna-aesthetics");
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

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
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

        if (storedActiveId) setActiveWorkspaceId(storedActiveId);
        if (storedWorkspaces) setWorkspaces(JSON.parse(storedWorkspaces));
        if (storedBrains) setBrandBrains(JSON.parse(storedBrains));
        if (storedAgents) setAgents(JSON.parse(storedAgents));
        if (storedConversations) setConversations(JSON.parse(storedConversations));
        if (storedTraining) setTrainingItems(JSON.parse(storedTraining));
        if (storedStats) setSystemStats(JSON.parse(storedStats));
        if (storedPlayground) setPlaygroundMessages(JSON.parse(storedPlayground));
        if (storedInsights) setPlaygroundInsights(JSON.parse(storedInsights));
      } catch (e) {
        console.error("Failed to load state from localStorage", e);
      } finally {
        setIsInitialized(true);
      }
    }
  }, []);

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

  // 2. Sync to LocalStorage
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
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
    isInitialized
  ]);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  // Business Profile Updates
  const updateBusinessProfile = (profile: BusinessProfile) => {
    setBrandBrains((prev) => ({
      ...prev,
      [activeWorkspaceId]: {
        ...prev[activeWorkspaceId],
        profile,
      },
    }));
  };

  // Tone of Voice Updates
  const updateToneOfVoice = (tone: string) => {
    setBrandBrains((prev) => ({
      ...prev,
      [activeWorkspaceId]: {
        ...prev[activeWorkspaceId],
        toneOfVoice: tone,
      },
    }));
  };

  // FAQs
  const addFAQ = (faq: Omit<FAQ, "id">) => {
    const newFaq: FAQ = {
      ...faq,
      id: `faq-${Date.now()}`,
    };
    setBrandBrains((prev) => ({
      ...prev,
      [activeWorkspaceId]: {
        ...prev[activeWorkspaceId],
        faqs: [...prev[activeWorkspaceId].faqs, newFaq],
      },
    }));
  };

  const removeFAQ = (id: string) => {
    setBrandBrains((prev) => ({
      ...prev,
      [activeWorkspaceId]: {
        ...prev[activeWorkspaceId],
        faqs: prev[activeWorkspaceId].faqs.filter((f) => f.id !== id),
      },
    }));
  };

  // Do Rules
  const addDoRule = (rule: string) => {
    setBrandBrains((prev) => ({
      ...prev,
      [activeWorkspaceId]: {
        ...prev[activeWorkspaceId],
        doRules: [...prev[activeWorkspaceId].doRules, rule],
      },
    }));
  };

  const removeDoRule = (ruleToRemove: string) => {
    setBrandBrains((prev) => ({
      ...prev,
      [activeWorkspaceId]: {
        ...prev[activeWorkspaceId],
        doRules: prev[activeWorkspaceId].doRules.filter((r) => r !== ruleToRemove),
      },
    }));
  };

  // Don't Rules
  const addDontRule = (rule: string) => {
    setBrandBrains((prev) => ({
      ...prev,
      [activeWorkspaceId]: {
        ...prev[activeWorkspaceId],
        dontRules: [...prev[activeWorkspaceId].dontRules, rule],
      },
    }));
  };

  const removeDontRule = (ruleToRemove: string) => {
    setBrandBrains((prev) => ({
      ...prev,
      [activeWorkspaceId]: {
        ...prev[activeWorkspaceId],
        dontRules: prev[activeWorkspaceId].dontRules.filter((r) => r !== ruleToRemove),
      },
    }));
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
  };

  const updateAgent = (updatedAgent: Agent) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === updatedAgent.id ? updatedAgent : a))
    );
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
  };

  // Training Center Actions
  const approveTrainingItem = (id: string) => {
    // Remove from training list
    setTrainingItems((prev) => ({
      ...prev,
      [activeWorkspaceId]: prev[activeWorkspaceId].filter((t) => t.id !== id),
    }));

    // Update training scores
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === activeWorkspaceId ? { ...w, trainingStatus: Math.min(w.trainingStatus + 2, 100) } : w
      )
    );
  };

  const improveTrainingItem = (id: string, correction: string) => {
    const item = trainingItems[activeWorkspaceId]?.find((t) => t.id === id);
    if (!item) return;

    // Remove from training list
    setTrainingItems((prev) => ({
      ...prev,
      [activeWorkspaceId]: prev[activeWorkspaceId].filter((t) => t.id !== id),
    }));

    // 1. Add this correction to FAQs or Do rules in Brand Brain
    const newFAQ: FAQ = {
      id: `faq-from-train-${Date.now()}`,
      question: item.customerQuestion,
      answer: correction,
    };

    setBrandBrains((prev) => ({
      ...prev,
      [activeWorkspaceId]: {
        ...prev[activeWorkspaceId],
        faqs: [...prev[activeWorkspaceId].faqs, newFAQ],
        doRules: [...prev[activeWorkspaceId].doRules, `Ensure replies to "${item.customerQuestion}" align with: ${correction.slice(0, 50)}...`],
      },
    }));

    // 2. Add to mock conversation logs as corrected
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

    // 3. Update Workspace training percentage
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === activeWorkspaceId ? { ...w, trainingStatus: Math.min(w.trainingStatus + 4, 100) } : w
      )
    );
  };

  const rejectTrainingItem = (id: string) => {
    // Adds to "Don't rules"
    const item = trainingItems[activeWorkspaceId]?.find((t) => t.id === id);
    
    setTrainingItems((prev) => ({
      ...prev,
      [activeWorkspaceId]: prev[activeWorkspaceId].filter((t) => t.id !== id),
    }));

    if (item) {
      setBrandBrains((prev) => ({
        ...prev,
        [activeWorkspaceId]: {
          ...prev[activeWorkspaceId],
          dontRules: [...prev[activeWorkspaceId].dontRules, `Never say: "${item.aiAnswer}" when asked about "${item.customerQuestion.slice(0, 35)}..."`],
        },
      }));
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
      trainingStatus: 50, // Starts at 50% baseline
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
    setAgents((prev) => [
      ...prev,
      {
        id: `agent-auto-${Date.now()}`,
        name: "Welcome Bot",
        role: "Trainee Representative",
        personality: "A simple welcome assistant created automatically.",
        tone: "Polite & Helpful",
        channels: ["Web chat"],
        status: "Draft",
        linkedBrainId: cleanId,
      },
    ]);
    setConversations((prev) => ({ ...prev, [cleanId]: [] }));
    setTrainingItems((prev) => ({ ...prev, [cleanId]: [] }));

    setSystemStats((prev) => ({
      ...prev,
      totalBusinesses: prev.totalBusinesses + 1,
    }));
  };

  const toggleMockMode = () => {
    setIsMockMode((prev) => !prev);
  };

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
        setActiveWorkspaceId,
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
        addClientWorkspace,
        toggleMockMode,
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
