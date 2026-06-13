"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppState } from "@/context/state-context";
import { Play, Sparkles, Send, Trash2, Key, Sliders, Check, Cpu } from "lucide-react";

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
  const [showOpenAIConfig, setShowOpenAIConfig] = useState(true);

  // OpenAI Form Placeholders (Not saved to localStorage for security)
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [temperature, setTemperature] = useState("0.7");
  const [apiKeySaved, setApiKeySaved] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

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

  const activeAgent = agents.find(a => a.id === selectedAgentId);
  const messages = playgroundMessages[selectedAgentId] || [];
  const insights = playgroundInsights[selectedAgentId];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedAgentId) return;

    const userText = inputText.trim();
    setInputText("");
    setIsTyping(true);

    // Context triggers typing delay, we just simulate typing states in UI
    await sendPlaygroundMessage(selectedAgentId, userText);
    
    // Typing indicator stops when reply lands
    setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) return;
    setApiKeySaved(true);
    setTimeout(() => {
      setApiKeySaved(false);
    }, 2000);
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
          </div>

          <div className="flex gap-2">
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

        {/* Sandbox / Connection Notice Banner */}
        {liveAIEnabled ? (
          <div className="bg-emerald-500/5 border-b border-zinc-900 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-400">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-ring" />
              <span>Live AI Engine Active (completions run securely via server-side credentials).</span>
            </div>
            {insights?.usedFallback && (
              <span className="text-amber-500 bg-amber-950/20 border border-amber-900/30 px-2 py-0.5 rounded font-medium animate-pulse">
                ⚠️ Last message fell back to mock
              </span>
            )}
          </div>
        ) : (
          <div className="bg-amber-500/5 border-b border-zinc-900 px-6 py-2.5 flex items-center justify-between text-xs text-amber-500">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse-ring" />
              <span>Running in sandbox AI mode. Add <code className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded">OPENAI_API_KEY</code> to <code className="text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded">.env.local</code> to enable live intelligence.</span>
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
                Send a message to test <strong className="text-zinc-400 font-semibold">{activeAgent?.name || "the agent"}</strong>. 
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

        {/* Input Bar */}
        <div className="bg-zinc-950 p-4 border-t border-zinc-900">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              placeholder={selectedAgentId ? `Ask ${activeAgent?.name} something about ${activeWorkspace?.clientName}...` : "Select an agent to begin"}
              disabled={!selectedAgentId}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>

      {/* Right: OpenAI Connection & Insights panel */}
      {showOpenAIConfig && (
        <div className="w-full lg:w-80 glass-panel border border-zinc-900 rounded-xl p-5 shadow-2xl flex flex-col justify-between space-y-6 overflow-y-auto">
          <div className="space-y-6">
            
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
                    <span className={`font-bold flex items-center gap-1 ${insights.usedFallback ? "text-amber-400" : "text-emerald-400"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${insights.usedFallback ? "bg-amber-400" : "bg-emerald-400"} animate-pulse-ring`} />
                      {insights.usedFallback ? "Sandbox Mock" : "Live AI"}
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
                    <span className="text-zinc-500 font-semibold">Lead status:</span>
                    <span className={`font-bold uppercase tracking-wider text-[9px] border px-2 py-0.5 rounded-full ${
                      insights.suggestedLeadStatus === "Hot"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
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
                    <span className={`font-bold ${insights.suggestedFollowUp ? "text-amber-400" : "text-emerald-400"}`}>
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
                <div className="p-4 text-center border border-dashed border-zinc-900 rounded-lg text-[10px] text-zinc-600 italic">
                  No message history logged yet. Send a message to audit AI diagnostics.
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
                <strong>Phase 2 Preview:</strong> This panel simulates production configuration. In the next phase, your API key connects to a secure server-side endpoint (<code className="text-purple-400">/api/chat</code>) executing completions with dynamic system prompts tailored by your Brand Brain.
              </p>

              <form onSubmit={handleSaveApiKey} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5">
                    <Key className="h-3 w-3 text-purple-400" />
                    <span>OpenAI API Key</span>
                  </label>
                  <input
                    type="password"
                    placeholder="sk-proj-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-750 focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Model Selector
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-600"
                  >
                    <option value="gpt-4o">gpt-4o (Standard)</option>
                    <option value="gpt-4o-mini">gpt-4o-mini (Fast)</option>
                    <option value="o1-preview">o1-preview (Complex)</option>
                  </select>
                </div>

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

                <button
                  type="submit"
                  className="w-full rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-center py-2 text-xs font-semibold text-zinc-300 transition-colors flex justify-center items-center gap-1.5 cursor-pointer"
                >
                  {apiKeySaved ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Keys Linked</span>
                    </>
                  ) : (
                    <span>Link Keys & Sandbox</span>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="rounded-lg bg-purple-950/15 border border-purple-900/25 p-3 text-[9px] text-purple-400/80 leading-relaxed shrink-0">
            <strong>Security Notice:</strong> Keys are never saved to local states. They are passed directly to server actions via TLS sessions.
          </div>
        </div>
      )}
    </div>
  );
}
