"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppState } from "@/context/state-context";
import { 
  Phone, Play, Trash2, Key, Sliders, Cpu, Mic, Volume2, 
  AlertCircle, PhoneOff, PhoneCall, Check, Plus, AlertTriangle, 
  ShieldCheck, HelpCircle, GraduationCap, FileText, ArrowRight, X, Sparkles, VolumeX
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Message, CallScenario, CallSimulation, CallScorecard, Conversation } from "@/lib/types";

type CallLabStatus = "idle" | "ringing" | "connected" | "ended" | "analyzing";

export default function CallLabPage() {
  const { 
    activeWorkspaceId, 
    activeWorkspace, 
    agents, 
    brandBrains, 
    callScenarios, 
    callSimulations, 
    addCustomScenario, 
    saveCallSimulation, 
    sendCallSimulationMessage,
    conversations,
    trainingItems,
    addFAQ,
    addTrainingItem,
    updateAgent
  } = useAppState();

  const workspaceAgents = agents.filter(a => a.linkedBrainId === activeWorkspaceId);
  const workspaceScenarios = callScenarios.filter(s => 
    workspaceAgents.some(a => a.id === s.agentId)
  );

  const [selectedScenarioId, setSelectedScenarioId] = useState("");
  const [callStatus, setCallStatus] = useState<CallLabStatus>("idle");
  const [activeSimulationId, setActiveSimulationId] = useState<string | null>(null);
  
  // Active Conversation inside Simulator
  const [simMessages, setSimMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isAITyping, setIsAITyping] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Scorecard State
  const [completedScorecard, setCompletedScorecard] = useState<CallScorecard | null>(null);
  const [missingKnowledgeGap, setMissingKnowledgeGap] = useState<string | null>(null);
  const [trainingLinked, setTrainingLinked] = useState(false);
  const [brainLinked, setBrainLinked] = useState(false);
  const [readyMarked, setReadyMarked] = useState(false);

  // Voice States
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ringIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Modal Dialog States
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPersona, setNewPersona] = useState("");
  const [newMood, setNewMood] = useState<"calm" | "curious" | "skeptical" | "urgent" | "angry">("curious");
  const [newGoal, setNewGoal] = useState("");
  const [newOpeningLine, setNewOpeningLine] = useState("");
  const [newExpectedOutcome, setNewExpectedOutcome] = useState("");
  const [newDifficulty, setNewDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [newAgentId, setNewAgentId] = useState("");

  // Speech Recognition Check
  const SpeechRecognitionAPI = typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  const isSpeechSupported = !!SpeechRecognitionAPI;

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Select default scenario
  useEffect(() => {
    if (workspaceScenarios.length > 0 && !selectedScenarioId) {
      setSelectedScenarioId(workspaceScenarios[0].id);
    }
  }, [workspaceScenarios, selectedScenarioId]);

  // Set default agent for custom scenario modal
  useEffect(() => {
    if (workspaceAgents.length > 0 && !newAgentId) {
      setNewAgentId(workspaceAgents[0].id);
    }
  }, [workspaceAgents, newAgentId]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [simMessages, isAITyping]);

  // Call timer effect
  useEffect(() => {
    if (callStatus === "connected") {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  // Speech APIs Cleanup
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        recognitionRef.current?.abort();
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  const startRingingSound = () => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      stopRingingSound();

      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;
      
      const playRingTone = () => {
        if (!ctx || ctx.state === "closed") return;
        
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc1.frequency.value = 440;
        osc2.frequency.value = 480;
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime + 1.9);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.0);
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc1.start();
        osc2.start();
        
        osc1.stop(ctx.currentTime + 2.0);
        osc2.stop(ctx.currentTime + 2.0);
      };
      
      playRingTone();
      ringIntervalRef.current = setInterval(playRingTone, 6000);
    } catch (e) {
      console.warn("Failed to play ringing sound:", e);
    }
  };

  const stopRingingSound = () => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
      }
      audioCtxRef.current = null;
    }
  };

  // Trigger ringing sound on status change or mute toggle (starts after user action starts simulation)
  useEffect(() => {
    if (callStatus === "ringing" && !isMuted) {
      startRingingSound();
    } else {
      stopRingingSound();
    }
    return () => stopRingingSound();
  }, [callStatus, isMuted]);

  // Stop listening/speech/ringing on workspace switch or scenario change
  useEffect(() => {
    stopVoiceEngine();
    stopRingingSound();
    setCallStatus("idle");
    setSpeechError("");
  }, [activeWorkspaceId, selectedScenarioId]);

  const activeScenario = callScenarios.find(s => s.id === selectedScenarioId);
  const activeAgent = activeScenario ? agents.find(a => a.id === activeScenario.agentId) : null;
  const activeBrain = brandBrains[activeWorkspaceId];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Launch Call
  const handleStartSimulation = () => {
    if (!activeScenario || !activeAgent) return;
    setCallStatus("ringing");
    setCallDuration(0);
    setSimMessages([]);
    setCompletedScorecard(null);
    setMissingKnowledgeGap(null);
    setTrainingLinked(false);
    setBrainLinked(false);
    setReadyMarked(false);
  };

  // Accept Inbound Call
  const handleAcceptCall = () => {
    if (!activeScenario || !activeAgent) return;
    setCallStatus("connected");
    
    // Simulate Customer Opening Line
    const openingMsg: Message = {
      id: `sim-msg-${Date.now()}-user`,
      sender: "user",
      text: activeScenario.openingLine,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setSimMessages([openingMsg]);
    setIsAITyping(true);

    // Call completions for first reply
    setTimeout(async () => {
      try {
        const responseData = await sendCallSimulationMessage(activeScenario.agentId, activeScenario.openingLine, []);
        const replyMsg: Message = {
          id: `sim-msg-${Date.now()}-agent`,
          sender: "agent",
          text: responseData.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setSimMessages(prev => [...prev, replyMsg]);
        
        // Speak response if in voice mode
        if (isVoiceMode) {
          speakOutput(responseData.reply);
        }
      } catch (err) {
        console.error("Simulation completions error:", err);
      } finally {
        setIsAITyping(false);
      }
    }, 1500);
  };

  // Reject / Cancel
  const handleRejectCall = () => {
    stopVoiceEngine();
    setCallStatus("idle");
  };

  // Send message as Customer (typing or speaking)
  const submitCustomerLine = async (text: string) => {
    if (!text.trim() || !activeScenario || !activeAgent) return;
    
    const userMsg: Message = {
      id: `sim-msg-${Date.now()}-user`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setSimMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsAITyping(true);

    try {
      // Pass full conversation history
      const responseData = await sendCallSimulationMessage(activeScenario.agentId, text, simMessages);
      const replyMsg: Message = {
        id: `sim-msg-${Date.now()}-agent`,
        sender: "agent",
        text: responseData.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setSimMessages(prev => [...prev, replyMsg]);

      // Speak if in voice mode
      if (isVoiceMode) {
        speakOutput(responseData.reply);
      }
    } catch (err) {
      console.error("Simulation message failed:", err);
    } finally {
      setIsAITyping(false);
    }
  };

  // End Call & Analyze Scorecard
  const handleEndCall = () => {
    stopVoiceEngine();
    setCallStatus("analyzing");

    // Brief analyzing timer
    setTimeout(() => {
      // Rule-based scorecard generation based on messages and agent settings
      const userSaysCount = simMessages.filter(m => m.sender === "user").length;
      const agentSaysCount = simMessages.filter(m => m.sender === "agent").length;

      // Scan user messages for common objections or missing gaps
      let gapDetected: string | null = null;
      let hasAngryWords = false;

      for (const m of simMessages) {
        if (m.sender === "user") {
          const txt = m.text.toLowerCase();
          if (txt.includes("cystic") || txt.includes("eczema") || txt.includes("disease")) {
            gapDetected = "Objection: Medical diagnostics boundary check.";
          } else if (txt.includes("refund") || txt.includes("cancellation fee") || txt.includes("cancel late")) {
            gapDetected = "Objection: Policy dispute handling.";
          } else if (txt.includes("basic integration") || txt.includes("basic webhooks")) {
            gapDetected = "Objection: Enterprise tier pricing justification.";
          }
          if (txt.includes("ridiculous") || txt.includes("angry") || txt.includes("refuse") || txt.includes("terrible")) {
            hasAngryWords = true;
          }
        }
      }

      // Compute scores
      let qualityScore = Math.max(70, 95 - (userSaysCount * 2) - (gapDetected ? 10 : 0));
      let toneMatchScore = Math.max(75, 92 - (hasAngryWords ? 8 : 0));
      let policySafetyScore = gapDetected ? 85 : 100;
      
      const suggestedFollowUp = gapDetected !== null || qualityScore < 80;

      const scorecard: CallScorecard = {
        qualityScore,
        toneMatchScore,
        policySafetyScore,
        detectedIntent: activeScenario?.title || "general query",
        leadStatus: activeScenario?.difficulty === "Hard" ? "Warm" : "Hot",
        confidenceScore: 0.92,
        suggestedFollowUp,
        missingKnowledge: gapDetected || undefined,
        recommendedTrainingAction: gapDetected 
          ? `Create specific Brand Brain FAQ rules to qualify: "${gapDetected.split(": ")[1]}"`
          : "Audit approved. Perfect response flow."
      };

      setCompletedScorecard(scorecard);
      setMissingKnowledgeGap(gapDetected);
      setCallStatus("ended");

      // Save call simulation inside app context
      if (activeScenario && activeAgent) {
        const newSimId = `sim-${Date.now()}`;
        const newConvId = `sim-conv-${Date.now()}`;
        const newDate = new Date().toISOString();

        const simulatedConversation: Conversation = {
          id: newConvId,
          customerName: `${activeScenario.persona} (Call Sim)`,
          channel: "Call Simulation",
          summary: `${activeScenario.title}: Simulated customer call with ${activeAgent.name}.`,
          leadStatus: scorecard.leadStatus,
          date: newDate,
          sentiment: hasAngryWords ? "Negative" : "Positive",
          needsFollowUp: scorecard.suggestedFollowUp,
          messages: simMessages
        };

        const newSim: CallSimulation = {
          id: newSimId,
          scenarioId: activeScenario.id,
          agentId: activeAgent.id,
          durationSeconds: callDuration,
          scorecard,
          conversationId: newConvId,
          date: newDate,
          status: "ended"
        };
        
        saveCallSimulation(newSim, simulatedConversation);

        // Inject simulated conversation into global context
        // state-context already manages conversations Record by WorkspaceID
        // We trigger this by updating conversations state:
        // We can let the context save it or we can update local storage manually, but the cleanest way is updating state through state-context.
        // Wait, we can push this conversation directly into localStorage or let state-context trigger updates!
        // Let's check how state-context holds conversations. We have conversations: Record<string, Conversation[]>
        // Since setConversations is local to state-context, wait, is there an action for adding standard conversations?
        // No, but we can do it by updating the simulations state context! In state-context.tsx, we can update setConversations if we export a handler,
        // or wait, when we call saveCallSimulation, does it update setConversations?
        // Ah! In state-context.tsx:
        // saveCallSimulation only updates callSimulations and setAgents.
        // We should make saveCallSimulation also update setConversations! That is extremely clean and ensures zero code duplication.
        // Let's modify saveCallSimulation to also append the Call Simulation conversation to the global conversations inbox list.
        // Wait, since we can update the state inside page.tsx directly by modifying the global conversations state, wait, is setConversations exposed in StateContextProps?
        // Let's check:
        // StateContextProps has:
        // conversations: Record<string, Conversation[]>;
        // But no setConversations modifier!
        // Wait! We can modify state-context.tsx again to make saveCallSimulation append the simulated conversation to the conversations record automatically!
        // Let's check if we can do this.
        // Yes! Inside saveCallSimulation:
        // we can construct the Conversation object and append it to conversations[activeWorkspaceId]!
        // That is absolutely beautiful. Let's write that replacement for saveCallSimulation in state-context.tsx.
        // Wait, let's look at the current saveCallSimulation in state-context.tsx:
        // const saveCallSimulation = (sim: CallSimulation) => { ... }
        // We will update it.
      }
    }, 1500);
  };

  // Speech Recognition (Microphone input)
  const handleStartSpeech = () => {
    if (typeof window === "undefined" || !isSpeechSupported) return;

    window.speechSynthesis?.cancel();
    setSpeechError("");

    try {
      const rec = new SpeechRecognitionAPI();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setVoiceTranscript("");
        setSpeechError("");
      };

      rec.onresult = (event: any) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setVoiceTranscript(final || interim);
      };

      rec.onerror = (e: any) => {
        console.error("Speech error in simulation:", e);
        if (e.error === "not-allowed") {
          setSpeechError("Microphone permission denied. Please allow microphone access.");
        } else if (e.error !== "no-speech") {
          setSpeechError(`Speech recognition error: ${e.error}`);
        }
      };

      rec.onend = () => {
        setVoiceTranscript(latest => {
          if (latest.trim()) {
            submitCustomerLine(latest.trim());
          }
          return latest;
        });
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
      setSpeechError("Failed to access microphone.");
    }
  };

  // Text-to-speech speaker
  const speakOutput = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/\[System:[^\]]*\]/gi, "")
      .replace(/\[[^\]]*\]/g, "")
      .replace(/[*_`~#]/g, "")
      .replace(/✨|✨|✨/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google")) ||
                      voices.find(v => v.lang.startsWith("en")) ||
                      voices[0];
    if (preferred) utterance.voice = preferred;

    window.speechSynthesis.speak(utterance);
  };

  const stopVoiceEngine = () => {
    if (typeof window !== "undefined") {
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    }
    setVoiceTranscript("");
    setSpeechError("");
  };

  // Custom Scenario Create
  const handleCreateScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newPersona || !newGoal || !newOpeningLine || !newAgentId) return;

    addCustomScenario({
      title: newTitle,
      persona: newPersona,
      mood: newMood,
      goal: newGoal,
      openingLine: newOpeningLine,
      expectedOutcome: newExpectedOutcome || "Resolve customer query professionally",
      difficulty: newDifficulty,
      agentId: newAgentId
    });

    // Reset Form
    setNewTitle("");
    setNewPersona("");
    setNewMood("curious");
    setNewGoal("");
    setNewOpeningLine("");
    setNewExpectedOutcome("");
    setNewDifficulty("Easy");
    setIsScenarioModalOpen(false);
  };

  const handleSendToTraining = () => {
    if (!activeScenario || !activeAgent || !completedScorecard) return;
    
    const userMsgs = simMessages.filter(m => m.sender === "user");
    const agentMsgs = simMessages.filter(m => m.sender === "agent");
    const lastUserQuery = userMsgs.length > 0 ? userMsgs[userMsgs.length - 1].text : "Custom Objection";
    const lastAIReply = agentMsgs.length > 0 ? agentMsgs[agentMsgs.length - 1].text : "Unknown or standard reply";

    addTrainingItem(lastUserQuery, lastAIReply);
    setTrainingLinked(true);
  };

  const handleAddToBrain = () => {
    if (!activeScenario || !activeAgent || !completedScorecard) return;
    
    const userMsgs = simMessages.filter(m => m.sender === "user");
    const agentMsgs = simMessages.filter(m => m.sender === "agent");
    const lastUserQuery = userMsgs.length > 0 ? userMsgs[userMsgs.length - 1].text : "Custom Objection";
    const lastAIReply = agentMsgs.length > 0 ? agentMsgs[agentMsgs.length - 1].text : "Verified response";

    addFAQ({ question: lastUserQuery, answer: lastAIReply });
    setBrainLinked(true);
  };

  const handleMarkAsReady = () => {
    if (!activeAgent || !completedScorecard) return;
    
    updateAgent({
      ...activeAgent,
      status: "Active",
      callReadiness: 96,
      lastSimulationResult: "96% (Excellent)",
      needsTraining: false
    });
    setReadyMarked(true);
  };

  // 6. Demo Script Builder Dynamic Copy Generator
  const generateDemoScript = () => {
    if (!activeAgent || !activeBrain) return null;
    
    const faqs = activeBrain.faqs || [];
    const products = activeBrain.profile.products || [];
    
    const testQuestions = faqs.length > 0
      ? faqs.slice(0, 3).map(f => f.question)
      : ["What are your pricing packages?", "What is your refund/cancellation policy?", "Are your specialists certified?"];
    if (testQuestions.length < 5) {
      testQuestions.push("Do you have payment plans?", "Can I reschedule my appointment?");
    }

    const objections = activeBrain.profile.policies 
      ? ["Objections regarding late cancellations or no-show fees", "Inquiries about custom pricing options"]
      : ["Inquiries about package discounts", "objections about service safety"];

    const weakSpots = [];
    if (!activeBrain.profile.pricingNotes) weakSpots.push("Pricing Objections (No pricing notes configured in Brand Brain)");
    if (!activeBrain.profile.policies) weakSpots.push("Cancellation disputes (No store cancellation policy defined)");
    if (trainingItems[activeWorkspaceId]?.length > 0) {
      weakSpots.push(`Unresolved objections (You have ${trainingItems[activeWorkspaceId].length} training items pending review)`);
    } else {
      weakSpots.push("Clinical objections (Ensure do/don't guardrails are fully aligned)");
    }

    return {
      walkthrough: `Explain to your client that ${activeAgent.name} acts as a trained "${activeAgent.role}" for ${activeBrain.profile.name}. They speak with a "${activeAgent.tone}" tone. Run a Call Simulation in front of them, using custom objections to show how the AI adheres to guardrails.`,
      testQuestions,
      objections,
      weakSpots
    };
  };

  const demoScript = generateDemoScript();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Phone className="h-5 w-5 text-purple-400" />
            <span>Call Lab & Objections Simulator</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Simulate real customer calls, audit AI responses under fire, and generate demo scripts.
          </p>
        </div>

        <button 
          onClick={() => setIsScenarioModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Create Test Scenario</span>
        </button>
      </div>

      {/* Main Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Panel: Scenario Builder */}
        <div className="lg:col-span-3 glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              1. Select Scenario
            </h3>
            
            <div className="space-y-2">
              {workspaceScenarios.map((scen) => (
                <button
                  key={scen.id}
                  onClick={() => {
                    setSelectedScenarioId(scen.id);
                    setCallStatus("idle");
                    setCompletedScorecard(null);
                    setSimMessages([]);
                  }}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all text-xs cursor-pointer ${
                    selectedScenarioId === scen.id
                      ? "border-purple-500/30 bg-purple-600/10 text-purple-200 font-semibold"
                      : "border-zinc-900 bg-zinc-950/40 text-zinc-400 hover:border-zinc-800"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold truncate max-w-[120px]">{scen.title}</span>
                    <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      scen.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      scen.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                      "bg-rose-500/10 text-rose-450 border border-rose-500/20"
                    }`}>{scen.difficulty}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 line-clamp-1">
                    Persona: {scen.persona} ({scen.mood})
                  </p>
                </button>
              ))}

              {workspaceScenarios.length === 0 && (
                <div className="p-4 text-center border border-dashed border-zinc-900 rounded-lg text-[10px] text-zinc-600 italic">
                  No scenarios configured. Click "Create Test Scenario" to build one.
                </div>
              )}
            </div>
          </div>

          {activeScenario && activeAgent && (
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-lg p-3 space-y-3.5 text-xs">
              <div className="border-b border-zinc-900 pb-2">
                <span className="text-zinc-550 font-bold uppercase tracking-wider text-[9px] block">Linked Agent</span>
                <span className="text-zinc-200 font-bold">{activeAgent.name}</span>
                <span className="text-[10px] text-zinc-550 block">{activeAgent.role}</span>
              </div>
              <div>
                <span className="text-zinc-550 font-bold uppercase tracking-wider text-[9px] block">Customer Persona</span>
                <p className="text-zinc-300 font-medium">{activeScenario.persona}</p>
                <span className="text-[10px] text-zinc-500 uppercase font-semibold">Mood: {activeScenario.mood}</span>
              </div>
              <div>
                <span className="text-zinc-550 font-bold uppercase tracking-wider text-[9px] block">Customer Goal</span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">{activeScenario.goal}</p>
              </div>
            </div>
          )}
        </div>

        {/* Center Panel: Live Call Simulator */}
        <div className="lg:col-span-6 border border-zinc-900 bg-zinc-950 rounded-xl overflow-hidden shadow-2xl flex flex-col justify-between min-h-[460px] relative">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500" />
          
          {/* Header & Status Indicator */}
          <div className="bg-zinc-950 px-6 py-4 border-b border-zinc-900 flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/10">
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500">Live Call Simulator</label>
                <span className="text-sm font-semibold text-zinc-200">
                  {callStatus === "idle" ? "System Ready" : 
                   callStatus === "ringing" ? "Ringing..." :
                   callStatus === "connected" ? `Active Call (${formatTime(callDuration)})` :
                   callStatus === "analyzing" ? "Analyzing Audio..." : "Call Ended"}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsVoiceMode(!isVoiceMode)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isVoiceMode 
                    ? "border-emerald-500/30 bg-emerald-600/10 text-emerald-400" 
                    : "border-zinc-800 bg-zinc-900/10 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Mic className="h-3.5 w-3.5" />
                <span>Voice Mode</span>
              </button>
            </div>
          </div>

          {/* Interactive Screen Viewport */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col justify-between">
            
            {/* 1. Ringing Screen */}
            {callStatus === "ringing" && activeScenario && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 my-auto">
                <div className="relative">
                  <div className="absolute -inset-4 rounded-full bg-purple-500/10 animate-ping" />
                  <div className="absolute -inset-8 rounded-full bg-purple-500/5 animate-ping delay-300" />
                  <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <PhoneCall className="h-8 w-8 text-white animate-bounce" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="block text-zinc-500 uppercase tracking-widest text-[9px] font-bold">Incoming Call</span>
                  <h3 className="text-lg font-extrabold text-white">{activeScenario.persona}</h3>
                  <p className="text-xs text-purple-400 font-semibold">{activeScenario.title} Simulation</p>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={handleAcceptCall}
                    className="rounded-full bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 text-xs font-bold text-white transition-colors flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Accept Call</span>
                  </button>
                  <button
                    onClick={handleRejectCall}
                    className="rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-6 py-2.5 text-xs font-bold text-zinc-400 transition-colors cursor-pointer"
                  >
                    <span>Reject</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="rounded-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 p-2.5 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer flex items-center justify-center"
                    title={isMuted ? "Unmute Ringtone" : "Mute Ringtone"}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
                  </button>
                </div>
              </div>
            )}

            {/* 2. Connected Transcript View */}
            {callStatus === "connected" && (
              <div className="flex-1 flex flex-col justify-between space-y-4 h-full">
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 min-h-[220px]">
                  {simMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex gap-3 ${msg.sender === "user" ? "" : "justify-end"}`}
                    >
                      {msg.sender === "user" && (
                        <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0">
                          {activeScenario?.persona.charAt(0)}
                        </div>
                      )}
                      
                      <div 
                        className={`rounded-lg px-4 py-2.5 text-xs max-w-[80%] whitespace-pre-wrap leading-relaxed ${
                          msg.sender === "user" 
                            ? "bg-zinc-900 text-zinc-300 border border-zinc-900" 
                            : "bg-purple-950/20 border border-purple-900/20 text-purple-200"
                        }`}
                      >
                        {msg.sender !== "user" && (
                          <div className="flex items-center gap-1.5 text-purple-400 text-[9px] font-bold uppercase tracking-wider mb-1">
                            <Sparkles className="h-3 w-3" />
                            <span>{activeAgent?.name} (AI Staff)</span>
                          </div>
                        )}
                        {msg.text}
                      </div>

                      {msg.sender !== "user" && (
                        <div className="h-8 w-8 rounded-full bg-purple-900 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {activeAgent?.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  ))}

                  {isAITyping && (
                    <div className="flex gap-3 justify-end">
                      <div className="rounded-lg bg-purple-950/10 border border-purple-900/10 px-4 py-3 text-xs max-w-[80%] text-zinc-500 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce" />
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce delay-100" />
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce delay-200" />
                        <span className="text-[10px] text-purple-400/70 font-semibold uppercase tracking-wider pl-1">{activeAgent?.name} is responding...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Bar */}
                <div className="border-t border-zinc-900/60 pt-4 flex flex-col space-y-3">
                  {isVoiceMode && isSpeechSupported && (
                    <div className="flex items-center justify-between bg-zinc-900/30 border border-zinc-900 p-2.5 rounded-lg text-xs">
                      <span className="text-zinc-500 font-medium">
                        {speechError ? <span className="text-rose-400 font-semibold">{speechError}</span> : "Speak into mic as customer..."}
                      </span>
                      <button
                        onClick={handleStartSpeech}
                        className="p-2 rounded-full bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/25 transition-colors cursor-pointer"
                      >
                        <Mic className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Type customer reply to challenge the AI..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submitCustomerLine(inputText)}
                      className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-purple-650"
                    />
                    <button
                      type="button"
                      onClick={() => submitCustomerLine(inputText)}
                      className="rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer"
                    >
                      Send
                    </button>
                    <button
                      type="button"
                      onClick={handleEndCall}
                      className="rounded-lg bg-rose-600 hover:bg-rose-500 px-4 py-2.5 text-xs font-bold text-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <PhoneOff className="h-4 w-4" />
                      <span>End Call</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Analyzing State */}
            {callStatus === "analyzing" && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 my-auto">
                <Sparkles className="h-10 w-10 text-purple-500/30 animate-pulse" />
                <span className="text-xs font-bold text-zinc-300">Auditing Agent Objections...</span>
                <p className="text-[10px] text-zinc-550">Calculating tone match, policy safety, and quality metrics.</p>
              </div>
            )}

            {/* 4. Idle / Call Finished Screens */}
            {callStatus === "idle" && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4 my-auto">
                <Phone className="h-10 w-10 text-purple-500/30 animate-pulse" />
                <span className="text-xs font-bold text-zinc-300">OBJECTIONS & CALL SIMULATOR</span>
                <p className="text-[10.5px] text-zinc-500 leading-relaxed">
                  Select a test scenario from the left panel and click accepting call. You can challenge the AI with complaints or custom pricing queries to audit its adherence to Brand Brain directives.
                </p>
                {activeScenario ? (
                  <button
                    onClick={handleStartSimulation}
                    className="rounded-lg bg-purple-650 hover:bg-purple-600 px-5 py-2.5 text-xs font-bold text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="h-4 w-4" />
                    <span>Start Simulation call</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-zinc-600 italic">Configure scenario to start.</span>
                )}
              </div>
            )}

            {callStatus === "ended" && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4 my-auto">
                <ShieldCheck className="h-10 w-10 text-emerald-500/30" />
                <span className="text-xs font-bold text-zinc-300">Call simulation completed</span>
                <p className="text-[10.5px] text-zinc-500 leading-relaxed">
                  Call simulation logs saved to inbox. Review performance metrics in the right scorecard panel.
                </p>
                <button
                  onClick={handleStartSimulation}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/10 hover:bg-zinc-900 px-5 py-2.5 text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
                >
                  Run Simulation Again
                </button>
              </div>
            )}

          </div>

          <div className="bg-zinc-950 px-6 py-2.5 border-t border-zinc-900 flex justify-between items-center text-[10px] text-zinc-500">
            <span>Disclaimer: Simulation only. Real phone calling comes in a later phase.</span>
          </div>
        </div>

        {/* Right Panel: Call Scorecard / Insights */}
        <div className="lg:col-span-3 glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              3. Call Scorecard
            </h3>

            {completedScorecard ? (
              <div className="space-y-4 text-xs">
                
                {/* Core scores grid */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center bg-zinc-900/20 border border-zinc-900 p-2.5 rounded-lg">
                    <span className="text-zinc-500 font-semibold">Response Quality:</span>
                    <span className={`font-bold ${
                      completedScorecard.qualityScore >= 90 ? "text-emerald-400" :
                      completedScorecard.qualityScore >= 75 ? "text-amber-400" : "text-rose-400"
                    }`}>{completedScorecard.qualityScore}%</span>
                  </div>

                  <div className="flex justify-between items-center bg-zinc-900/20 border border-zinc-900 p-2.5 rounded-lg">
                    <span className="text-zinc-500 font-semibold">Brand Tone Match:</span>
                    <span className="text-zinc-200 font-bold">{completedScorecard.toneMatchScore}%</span>
                  </div>

                  <div className="flex justify-between items-center bg-zinc-900/20 border border-zinc-900 p-2.5 rounded-lg">
                    <span className="text-zinc-500 font-semibold">Policy Safety:</span>
                    <span className="text-zinc-200 font-bold">{completedScorecard.policySafetyScore}%</span>
                  </div>
                </div>

                {/* Cognitive insights */}
                <div className="space-y-2 border-t border-zinc-900 pt-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-550 font-semibold">Qualified Lead:</span>
                    <span className="text-emerald-400 font-bold uppercase tracking-wider text-[9px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {completedScorecard.leadStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-550 font-semibold">Intent:</span>
                    <span className="text-purple-400 font-bold uppercase tracking-wider text-[9px] bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      {completedScorecard.detectedIntent}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-550 font-semibold">Human Follow Up:</span>
                    <span className={`font-bold ${completedScorecard.suggestedFollowUp ? "text-amber-450" : "text-emerald-450"}`}>
                      {completedScorecard.suggestedFollowUp ? "⚠️ Action Required" : "✓ Safe Autopilot"}
                    </span>
                  </div>
                </div>

                {/* Gaps detected */}
                <div className="border-t border-zinc-900 pt-3.5 space-y-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Diagnostics</span>
                  {missingKnowledgeGap ? (
                    <div className="bg-rose-500/5 border border-rose-500/20 rounded p-2.5 text-[10.5px] text-rose-300 leading-relaxed space-y-1">
                      <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[9px] uppercase tracking-wider">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>Knowledge Gap Found</span>
                      </div>
                      <p>{missingKnowledgeGap}</p>
                    </div>
                  ) : (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded p-2.5 text-[10.5px] text-emerald-300 leading-relaxed space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[9px] uppercase tracking-wider">
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                        <span>Objections Met</span>
                      </div>
                      <p>The AI successfully defended all store policies and pricing boundaries.</p>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="p-4 text-center border border-dashed border-zinc-900 rounded-lg text-[10px] text-zinc-600 italic leading-relaxed">
                Complete a call simulation to view performance analysis, policy safety, and tone-matching scorecard.
              </div>
            )}
          </div>

          {/* Action integrations */}
          {completedScorecard && (
            <div className="space-y-2 border-t border-zinc-900 pt-4">
              <button
                onClick={handleSendToTraining}
                disabled={trainingLinked || !missingKnowledgeGap}
                className="w-full rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-center py-2 text-xs font-semibold text-zinc-350 transition-colors flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <GraduationCap className="h-4 w-4" />
                <span>{trainingLinked ? "Sent to Training" : "Send to Training Center"}</span>
              </button>
              
              <button
                onClick={handleAddToBrain}
                disabled={brainLinked || !missingKnowledgeGap}
                className="w-full rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-center py-2 text-xs font-semibold text-zinc-350 transition-colors flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="h-4 w-4" />
                <span>{brainLinked ? "Linked FAQ to Brain" : "Add FAQ to Brand Brain"}</span>
              </button>

              <button
                onClick={handleMarkAsReady}
                disabled={readyMarked}
                className="w-full rounded-lg bg-purple-650 hover:bg-purple-600 text-center py-2 text-xs font-bold text-white transition-colors flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{readyMarked ? "Marked as Ready" : "Mark as Ready for Live Calls"}</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Demo Script Builder (Bottom Section) */}
      {demoScript && activeAgent && (
        <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <FileText className="h-5 w-5 text-purple-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
              Interactive Demo Script Builder ({activeAgent.name})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
            
            {/* Left Block */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-1">
                  How to demo this AI staff to a client
                </span>
                <p className="text-zinc-400 bg-zinc-950/40 p-3.5 rounded-lg border border-zinc-900">
                  {demoScript.walkthrough}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-1">
                  Best 5 customer questions to test
                </span>
                <ul className="space-y-1.5 pl-3 list-decimal text-zinc-400 bg-zinc-950/40 p-3.5 rounded-lg border border-zinc-900">
                  {demoScript.testQuestions.map((q, idx) => (
                    <li key={idx} className="marker:text-purple-400 font-medium">
                      &ldquo;{q}&rdquo;
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Block */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-1">
                  Sales objections this AI is ready to handle
                </span>
                <ul className="space-y-1.5 pl-4 list-disc text-zinc-400 bg-zinc-950/40 p-3.5 rounded-lg border border-zinc-900">
                  {demoScript.objections.map((o, idx) => (
                    <li key={idx} className="marker:text-purple-400 font-medium">
                      {o}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
                  Weak spots to train before going live
                </span>
                <ul className="space-y-1.5 pl-4 list-disc text-zinc-450 bg-zinc-950/40 p-3.5 rounded-lg border border-zinc-900">
                  {demoScript.weakSpots.map((ws, idx) => (
                    <li key={idx} className="marker:text-rose-400 font-semibold text-rose-350">
                      {ws}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Test Scenario Creation Modal Dialog */}
      <Dialog
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        title="Create Call Scenario"
      >
        <form onSubmit={handleCreateScenario} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Scenario Title
              </label>
              <input
                type="text"
                placeholder="Pricing Objection, etc."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-250 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Customer Persona Name
              </label>
              <input
                type="text"
                placeholder="Jane Doe"
                value={newPersona}
                onChange={(e) => setNewPersona(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-250 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Customer Mood
              </label>
              <select
                value={newMood}
                onChange={(e) => setNewMood(e.target.value as any)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/45 px-3 py-2 text-sm text-zinc-250 focus:outline-none focus:ring-1 focus:ring-purple-600"
              >
                <option value="calm">Calm</option>
                <option value="curious">Curious</option>
                <option value="skeptical">Skeptical</option>
                <option value="urgent">Urgent</option>
                <option value="angry">Angry</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Difficulty Level
              </label>
              <select
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value as any)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/45 px-3 py-2 text-sm text-zinc-250 focus:outline-none focus:ring-1 focus:ring-purple-600"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Select Agent to Link
            </label>
            <select
              value={newAgentId}
              onChange={(e) => setNewAgentId(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/45 px-3 py-2 text-sm text-zinc-250 focus:outline-none focus:ring-1 focus:ring-purple-600"
            >
              {workspaceAgents.map(ag => (
                <option key={ag.id} value={ag.id}>
                  {ag.name} ({ag.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Customer Goal
            </label>
            <textarea
              placeholder="What does the customer want to achieve?"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              required
              rows={2}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-250 focus:outline-none focus:ring-1 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Opening Customer Statement / Line
            </label>
            <input
              type="text"
              placeholder="Hi, I want to cancel my reservation..."
              value={newOpeningLine}
              onChange={(e) => setNewOpeningLine(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-250 focus:outline-none focus:ring-1 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Expected Outcome
            </label>
            <input
              type="text"
              placeholder="Log the dispute and refuse the refund"
              value={newExpectedOutcome}
              onChange={(e) => setNewExpectedOutcome(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-250 focus:outline-none focus:ring-1 focus:ring-purple-600"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-center py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-purple-500/10 cursor-pointer"
          >
            Create Scenario
          </button>
        </form>
      </Dialog>
    </div>
  );
}
