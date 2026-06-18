"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppState } from "@/context/state-context";
import { Play, Sparkles, Send, Trash2, Key, Sliders, Cpu, Mic, Volume2, AlertCircle, X } from "lucide-react";

type VoiceModeState = "idle" | "listening" | "processing" | "speaking" | "error";

export default function AgentPlaygroundPage() {
  const { 
    activeWorkspaceId, 
    activeWorkspace, 
    agents, 
    playgroundMessages, 
    sendPlaygroundMessage,
    clearPlaygroundHistory,
    playgroundInsights,
    liveAIEnabled
  } = useAppState();

  const workspaceAgents = agents.filter(a => a.linkedBrainId === activeWorkspaceId);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showOpenAIConfig, setShowOpenAIConfig] = useState(false);

  // OpenAI Settings Previews
  const [temperature, setTemperature] = useState("0.7");

  // Voice Mode States
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceModeState>("idle");
  const [voiceError, setVoiceError] = useState("");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Browser speech recognition availability check
  const SpeechRecognitionAPI = typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  const isSpeechSupported = !!SpeechRecognitionAPI;

  // Set default agent
  useEffect(() => {
    if (workspaceAgents.length > 0 && !selectedAgentId) {
      setSelectedAgentId(workspaceAgents[0].id);
    }
  }, [workspaceAgents, selectedAgentId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [playgroundMessages, selectedAgentId, isTyping]);

  // Cleanup speech synthesis and recognition on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        recognitionRef.current?.abort();
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  // Cleanup on agent / workspace change
  useEffect(() => {
    stopVoiceMode();
    setIsVoiceMode(false);
  }, [selectedAgentId, activeWorkspaceId]);

  const activeAgent = agents.find(a => a.id === selectedAgentId);
  const messages = playgroundMessages[selectedAgentId] || [];
  const insights = playgroundInsights[selectedAgentId];

  // Determine AI Engine Status (A, B, or C)
  let aiEngineStatus: "live" | "sandbox" | "fallback" = "sandbox";
  if (liveAIEnabled) {
    if (insights?.usedFallback) {
      aiEngineStatus = "fallback";
    } else {
      aiEngineStatus = "live";
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedAgentId) return;

    const userText = inputText.trim();
    setInputText("");
    setIsTyping(true);

    await sendPlaygroundMessage(selectedAgentId, userText);
    
    setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  // Voice Input Speech Recognition logic
  const startListening = () => {
    if (typeof window === "undefined") return;

    // Interrupt any active voice synthesis
    window.speechSynthesis?.cancel();

    if (!isSpeechSupported) {
      setVoiceState("error");
      setVoiceError("Voice demo is not supported in this browser. Use text chat instead.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setVoiceState("listening");
        setVoiceTranscript("");
        setVoiceError("");
      };

      recognition.onresult = (event: any) => {
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

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event);
        if (event.error === "not-allowed") {
          setVoiceState("error");
          setVoiceError("Microphone permission denied. Please enable microphone access in your browser settings to use Voice Mode.");
        } else if (event.error !== "no-speech") {
          setVoiceState("error");
          setVoiceError(`Microphone error: ${event.error}`);
        } else {
          setVoiceState("idle");
        }
      };

      recognition.onend = () => {
        setVoiceState((current) => {
          if (current === "listening") {
            setVoiceTranscript((latestTranscript) => {
              if (latestTranscript.trim()) {
                processVoiceMessage(latestTranscript.trim());
                return latestTranscript;
              } else {
                setVoiceState("idle");
              }
              return latestTranscript;
            });
          }
          return current;
        });
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("Speech recognition failed to start:", e);
      setVoiceState("error");
      setVoiceError("Failed to initialize microphone.");
    }
  };

  const processVoiceMessage = async (text: string) => {
    setVoiceState("processing");
    try {
      const replyText = await sendPlaygroundMessage(selectedAgentId, text, "Voice Demo");
      if (replyText) {
        speakResponse(replyText);
      } else {
        setVoiceState("idle");
      }
    } catch (err) {
      console.error("Voice completion processing failed:", err);
      setVoiceState("error");
      setVoiceError("Failed to generate AI completions.");
    }
  };

  // Text-To-Speech response reader
  const speakResponse = (text: string) => {
    if (typeof window === "undefined") return;

    if (!window.speechSynthesis) {
      setVoiceState("idle");
      return;
    }

    window.speechSynthesis.cancel();

    // Remove markdown symbols, system directives, and emojis to prevent reading glitches
    const cleanText = text
      .replace(/\[System:[^\]]*\]/gi, "")
      .replace(/\[[^\]]*\]/g, "")
      .replace(/[*_`~#]/g, "")
      .replace(/✨|✨|✨/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google")) ||
                           voices.find(v => v.lang.startsWith("en")) ||
                           voices[0];
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setVoiceState("speaking");
    };

    utterance.onend = () => {
      setVoiceState("idle");
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis error:", e);
      setVoiceState("idle");
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopVoiceMode = () => {
    if (typeof window !== "undefined") {
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    }
    setVoiceState("idle");
    setVoiceTranscript("");
  };

  // Stop listening/speech on agent or workspace switch
  useEffect(() => {
    stopVoiceMode();
  }, [selectedAgentId, activeWorkspaceId]);

  const toggleVoiceMode = () => {
    stopVoiceMode();
    setIsVoiceMode(!isVoiceMode);
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col lg:flex-row gap-6">
      {/* Left: Chat Pane */}
      <div className="flex-1 flex flex-col border border-zinc-900 bg-zinc-950 rounded-xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500" />
        
        {/* Chat Header */}
        <div className="bg-zinc-950 px-6 py-4 border-b border-zinc-900 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/10 shrink-0">
              <Play className="h-4 w-4" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500">Active Agent Tester</label>
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-zinc-200 focus:outline-none border-b border-transparent hover:border-zinc-700 cursor-pointer pr-4"
                >
                  {workspaceAgents.length === 0 ? (
                    <option value="">No active agents</option>
                  ) : (
                    workspaceAgents.map((ag) => (
                      <option key={ag.id} value={ag.id} className="bg-zinc-950 text-zinc-300">
                        {ag.name} ({ag.role})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Status Badge */}
              <div className="flex items-center mt-0.5 sm:mt-3 shrink-0">
                <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                  aiEngineStatus === "live"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : aiEngineStatus === "fallback"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                    : "bg-zinc-900/40 border-zinc-850 text-zinc-500"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    aiEngineStatus === "live" ? "bg-emerald-400" :
                    aiEngineStatus === "fallback" ? "bg-amber-400" : "bg-zinc-500"
                  } ${aiEngineStatus !== "sandbox" ? "animate-pulse" : ""}`} />
                  {aiEngineStatus === "live" ? "Live AI Ready" :
                   aiEngineStatus === "fallback" ? "Key Active, Fallback Used" : "Sandbox Mock Mode"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={toggleVoiceMode}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isVoiceMode 
                  ? "border-emerald-500/30 bg-emerald-600/10 text-emerald-400 animate-pulse" 
                  : "border-zinc-800 bg-zinc-900/10 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Mic className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Voice Mode</span>
            </button>
            <button 
              onClick={() => setShowOpenAIConfig(!showOpenAIConfig)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showOpenAIConfig 
                  ? "border-purple-500/30 bg-purple-600/10 text-purple-400" 
                  : "border-zinc-800 bg-zinc-900/10 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </button>
            <button
              onClick={() => clearPlaygroundHistory(selectedAgentId)}
              className="rounded-lg border border-zinc-800 bg-zinc-900/10 px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Clear conversations"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>

        {/* Notice Banner */}
        {aiEngineStatus === "live" ? (
          <div className="bg-emerald-500/5 border-b border-zinc-900 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-400">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live AI Ready: Server-side environment credentials are linked and operational.</span>
            </div>
          </div>
        ) : aiEngineStatus === "fallback" ? (
          <div className="bg-amber-500/5 border-b border-zinc-900 px-6 py-2.5 flex items-center justify-between text-xs text-amber-500">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse-ring" />
              <span>Live Key Detected, Fallback Used: The server key is active but the last OpenAI request failed. Check system logs.</span>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900/20 border-b border-zinc-900 px-6 py-2.5 flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
              <span>Sandbox Mock Mode: No server key detected. Add <code className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded">OPENAI_API_KEY</code> to <code className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded">.env.local</code> and restart the dev server.</span>
            </div>
          </div>
        )}

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && !isTyping && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-3">
              <Sparkles className="h-10 w-10 text-purple-500/30 animate-pulse" />
              <span className="text-xs font-bold text-zinc-300">Interactive sandbox initialized</span>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Send a message or enable <strong className="text-zinc-400 font-semibold">Voice Mode</strong> to test <strong className="text-zinc-400 font-semibold">{activeAgent?.name || "the agent"}</strong>. 
                They will answer according to the pricing notes, rules, and FAQs set in your Brand Brain.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 ${msg.sender === "user" ? "" : "justify-end"}`}
            >
              {msg.sender === "user" && (
                <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0">
                  U
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
                    <span>{activeAgent?.name} ({activeAgent?.tone.split(" ")[0]})</span>
                  </div>
                )}
                {msg.text}
                <span className="block text-[8px] text-zinc-600 mt-1.5 text-right">{msg.timestamp}</span>
              </div>

              {msg.sender !== "user" && (
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow shadow-purple-500/10">
                  {activeAgent?.name.charAt(0)}
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 justify-end">
              <div className="rounded-lg bg-purple-950/10 border border-purple-900/10 px-4 py-3 text-xs max-w-[80%] text-zinc-500 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce delay-100" />
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-bounce delay-200" />
                <span className="text-[10px] text-purple-400/70 font-semibold uppercase tracking-wider pl-1">{activeAgent?.name} is thinking...</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-purple-900/20 flex items-center justify-center text-xs font-bold text-zinc-500 shrink-0">
                {activeAgent?.name.charAt(0)}
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Voice Interface vs Standard Text Input Bar */}
        {isVoiceMode ? (
          <div className="bg-zinc-950 p-6 border-t border-zinc-900 flex flex-col items-center justify-center space-y-4 relative overflow-hidden min-h-[160px]">
            {/* Visualizer Backdrop */}
            {voiceState === "listening" && (
              <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
            )}
            {voiceState === "speaking" && (
              <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 z-10">
              {/* Voice Transcript Preview */}
              <div className="flex flex-col space-y-1.5 text-center sm:text-left flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold uppercase tracking-widest px-2 py-0.5 rounded self-center sm:self-auto">
                    Voice Demo Channel
                  </span>
                  <span className="text-[9px] text-zinc-500 font-semibold bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded self-center sm:self-auto">
                    Web voice demo only. Real phone calling comes in a later phase.
                  </span>
                </div>
                {voiceTranscript ? (
                  <p className="text-xs text-zinc-300 italic max-w-md line-clamp-2">
                    &ldquo;{voiceTranscript}&rdquo;
                  </p>
                ) : (
                  <p className="text-xs text-zinc-650 italic">
                    {voiceState === "listening" ? "Listening to your voice... Speak now." :
                     voiceState === "speaking" ? "AI speaking..." :
                     voiceState === "processing" ? "Transcribing & compiling answers..." :
                     "Microphone idle. Click button to start speaking."}
                  </p>
                )}
              </div>

              {/* Speech Controls */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex flex-col items-end hidden md:flex">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500">Status</span>
                  <span className={`text-xs font-bold uppercase ${
                    voiceState === "listening" ? "text-emerald-400" :
                    voiceState === "processing" ? "text-purple-400" :
                    voiceState === "speaking" ? "text-blue-400" :
                    voiceState === "error" ? "text-rose-400" : "text-zinc-400"
                  }`}>
                    {voiceState === "listening" ? "Listening..." :
                     voiceState === "processing" ? "Thinking..." :
                     voiceState === "speaking" ? "Speaking..." :
                     voiceState === "error" ? "Mic Error" : "Idle"}
                  </span>
                </div>

                {!isSpeechSupported ? (
                  <div className="text-[10px] text-rose-400 font-semibold bg-rose-950/20 border border-rose-900/30 px-3 py-2 rounded-lg max-w-[220px]">
                    Voice demo is not supported in this browser. Use text chat instead.
                  </div>
                ) : (
                  <div className="relative flex items-center justify-center">
                    {voiceState === "listening" && (
                      <>
                        <div className="absolute h-14 w-14 rounded-full bg-emerald-500/20 animate-ping" />
                        <div className="absolute h-18 w-18 rounded-full bg-emerald-500/10 animate-ping delay-300" />
                      </>
                    )}
                    {voiceState === "speaking" && (
                      <>
                        <div className="absolute h-14 w-14 rounded-full bg-blue-500/20 animate-pulse" />
                        <div className="absolute h-18 w-18 rounded-full bg-blue-500/10 animate-pulse delay-300" />
                      </>
                    )}
                    <button
                      type="button"
                      onClick={voiceState === "listening" || voiceState === "speaking" ? stopVoiceMode : startListening}
                      className={`h-11 w-11 rounded-full flex items-center justify-center text-white transition-all shadow-lg shrink-0 cursor-pointer ${
                        voiceState === "listening"
                          ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                          : voiceState === "speaking"
                          ? "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 animate-pulse"
                          : "bg-purple-600 hover:bg-purple-500 shadow-purple-500/20 animate-pulse"
                      }`}
                      title={voiceState === "listening" ? "Stop listening" : "Start speaking"}
                    >
                      {voiceState === "listening" ? (
                        <span className="h-3.5 w-3.5 bg-white rounded-sm" />
                      ) : voiceState === "speaking" ? (
                        <Volume2 className="h-5 w-5" />
                      ) : (
                        <Mic className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  {voiceState !== "idle" && (
                    <button
                      type="button"
                      onClick={stopVoiceMode}
                      className="rounded-lg border border-zinc-800 bg-zinc-900/10 hover:bg-rose-950/20 hover:text-rose-400 hover:border-rose-900/30 px-3 py-2 text-xs font-semibold text-zinc-400 transition-colors cursor-pointer"
                    >
                      Stop
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={toggleVoiceMode}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/10 hover:bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                  >
                    Text Mode
                  </button>
                </div>
              </div>
            </div>

            {voiceError && (
              <div className="text-[10px] text-rose-400 font-medium bg-rose-950/25 border border-rose-900/30 rounded px-2.5 py-1 flex items-center gap-1.5 z-10 font-semibold">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{voiceError}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-zinc-950 p-4 border-t border-zinc-900">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                placeholder={selectedAgentId ? `Ask ${activeAgent?.name} something about ${activeWorkspace?.clientName}...` : "Select an agent to begin"}
                disabled={!selectedAgentId}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-650 focus:outline-none focus:ring-1 focus:ring-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || !selectedAgentId}
                className="rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-2.5 text-xs font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Right: OpenAI Connection & Insights panel */}
      {showOpenAIConfig && (
        <>
          {/* Backdrop for mobile drawer */}
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setShowOpenAIConfig(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 z-50 w-80 max-w-[90vw] bg-zinc-950 border-l border-zinc-900 p-5 shadow-2xl flex flex-col justify-between space-y-6 overflow-y-auto lg:static lg:w-80 lg:z-auto lg:border-l-0 lg:border lg:rounded-xl lg:bg-zinc-950/20 glass-panel">
            {/* Mobile drawer header */}
            <div className="flex justify-between items-center lg:hidden border-b border-zinc-900 pb-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Playground Settings</span>
              <button 
                onClick={() => setShowOpenAIConfig(false)}
                className="rounded-lg p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-6 flex-1">
              
              {/* AI Agent Insights */}
              <div className="space-y-4 border-b border-zinc-900 pb-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                    AI Agent Insights
                  </h3>
                </div>

                {insights ? (
                  <div className="space-y-3.5 text-xs">
                    {/* Model Used */}
                    <div className="flex justify-between items-center bg-zinc-900/20 border border-zinc-900 p-2.5 rounded-lg">
                      <span className="text-zinc-500 font-semibold">Engine model:</span>
                      <span className="text-zinc-300 font-bold truncate max-w-[120px]">{insights.modelUsed}</span>
                    </div>

                    {/* Sandbox Fallback vs Live */}
                    <div className="flex justify-between items-center bg-zinc-900/20 border border-zinc-900 p-2.5 rounded-lg">
                      <span className="text-zinc-500 font-semibold">Response type:</span>
                      <span className={`font-bold flex items-center gap-1 ${
                        aiEngineStatus === "live" ? "text-emerald-400" :
                        aiEngineStatus === "fallback" ? "text-amber-500" : "text-amber-400"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          aiEngineStatus === "live" ? "bg-emerald-400" :
                          aiEngineStatus === "fallback" ? "bg-amber-500" : "bg-amber-400"
                        } animate-pulse-ring`} />
                        {aiEngineStatus === "live" ? "Live AI" :
                         aiEngineStatus === "fallback" ? "Fallback Mock" : "Sandbox Mock"}
                      </span>
                    </div>

                    {/* Detected Intent */}
                    <div className="flex justify-between items-center bg-zinc-900/20 border border-zinc-900 p-2.5 rounded-lg">
                      <span className="text-zinc-500 font-semibold">Detected intent:</span>
                      <span className="text-zinc-300 font-bold uppercase tracking-wider text-[9px] bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full truncate max-w-[120px]">
                        {insights.detectedIntent}
                      </span>
                    </div>

                    {/* Lead Status */}
                    <div className="flex justify-between items-center bg-zinc-900/20 border border-zinc-900 p-2.5 rounded-lg">
                      <span className="text-zinc-550 font-semibold">Lead status:</span>
                      <span className={`font-bold uppercase tracking-wider text-[9px] border px-2 py-0.5 rounded-full ${
                        insights.suggestedLeadStatus === "Hot"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400 font-extrabold"
                          : insights.suggestedLeadStatus === "Warm"
                          ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                          : insights.suggestedLeadStatus === "Converted"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-zinc-800 border-zinc-850 text-zinc-400"
                      }`}>
                        {insights.suggestedLeadStatus}
                      </span>
                    </div>

                    {/* Suggested Follow Up */}
                    <div className="flex justify-between items-center bg-zinc-900/20 border border-zinc-900 p-2.5 rounded-lg">
                      <span className="text-zinc-500 font-semibold">Follow-up state:</span>
                      <span className={`font-bold ${insights.suggestedFollowUp ? "text-amber-450" : "text-emerald-450"}`}>
                        {insights.suggestedFollowUp ? "⚠️ Action Required" : "✓ Autopilot"}
                      </span>
                    </div>

                    {/* Confidence Score */}
                    <div className="space-y-1 bg-zinc-900/20 border border-zinc-900 p-2.5 rounded-lg">
                      <div className="flex justify-between text-[10px] text-zinc-500 font-semibold">
                        <span>Intent Confidence</span>
                        <span>{Math.round(insights.confidenceScore * 100)}%</span>
                      </div>
                      <div className="h-1 w-full bg-zinc-950 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-600 rounded-full transition-all duration-300"
                          style={{ width: `${insights.confidenceScore * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center border border-dashed border-zinc-900 rounded-lg text-[10px] text-zinc-500 italic">
                    No message history logged yet. Send a message or use voice mode to audit AI diagnostics.
                  </div>
                )}
              </div>

              {/* Production Settings Form */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                    Production Settings
                  </h3>
                </div>
                
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  Configure prompt parameters and verify server keys for your workspace.
                </p>

                <div className="space-y-4">
                  {/* Secure API Key Status Indicator */}
                  <div className="bg-zinc-900/30 border border-zinc-900 p-3 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                      <Key className="h-3.5 w-3.5 text-purple-400" />
                      <span>Server API Key</span>
                    </div>
                    {liveAIEnabled ? (
                      <div className="space-y-1">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">✓ Active & Secured</span>
                        <p className="text-[9px] text-zinc-500 leading-relaxed">
                          OpenAI API keys are configured server-side only through environment variables.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block">✗ Missing Server Key</span>
                        <p className="text-[9px] text-zinc-555 leading-relaxed">
                          No server key detected. Add <code className="text-zinc-300 bg-zinc-900 px-1 py-0.5 rounded">OPENAI_API_KEY</code> to <code className="text-zinc-305 bg-zinc-905 px-1.5 py-0.5 rounded">.env.local</code> and restart the dev server.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Model Selector (Locked Preview) */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                      Model Selector <span className="text-purple-400 font-bold">(Preview Only)</span>
                    </label>
                    <select
                      disabled
                      value="gpt-4o-mini"
                      className="w-full rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-xs text-zinc-500 cursor-not-allowed focus:outline-none"
                    >
                      <option value="gpt-4o-mini">gpt-4o-mini (Server Default)</option>
                      <option value="gpt-4o">gpt-4o (Locked)</option>
                      <option value="o1-preview">o1-preview (Locked)</option>
                    </select>
                    <p className="text-[8px] text-zinc-600 mt-1">
                      Model choice is locked server-side to gpt-4o-mini for safety.
                    </p>
                  </div>

                  {/* Temperature Slider */}
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1 flex justify-between">
                      <span>Temperature</span>
                      <span className="text-purple-400 font-bold">{temperature}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="w-full accent-purple-600 bg-zinc-900 h-1 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-purple-950/15 border border-purple-900/25 p-3 text-[9px] text-purple-400/80 leading-relaxed shrink-0">
              <strong>Security Notice:</strong> Local inputs are disabled. Keys can only be configured via environment variables server-side.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
