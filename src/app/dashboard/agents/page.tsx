"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/state-context";
import { UserCheck, Plus, Sparkles, MessageSquare, Phone, Send, Mail, Check } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function AgentBuilderPage() {
  const { 
    agents, 
    activeWorkspaceId, 
    addAgent, 
    updateAgent 
  } = useAppState();

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form States
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [personality, setPersonality] = useState("");
  const [tone, setTone] = useState("Warm & Empathetic");
  const [status, setStatus] = useState<"Draft" | "Training" | "Active">("Active");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["Web chat"]);

  const workspaceAgents = agents.filter(a => a.linkedBrainId === activeWorkspaceId);

  const availableChannels = [
    { name: "Web chat", icon: MessageSquare },
    { name: "Voice", icon: Phone },
    { name: "WhatsApp", icon: Send },
    { name: "Instagram", icon: Instagram },
    { name: "Email", icon: Mail },
  ];

  const handleChannelToggle = (channelName: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelName)
        ? prev.filter(c => c !== channelName)
        : [...prev, channelName]
    );
  };

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || !personality) return;
    
    addAgent({
      name,
      role,
      personality,
      tone,
      channels: selectedChannels,
      status
    });

    // Reset Form
    setName("");
    setRole("");
    setPersonality("");
    setTone("Warm & Empathetic");
    setStatus("Active");
    setSelectedChannels(["Web chat"]);
    setIsModalOpen(false);
  };

  const handleToggleStatus = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    let nextStatus: "Draft" | "Training" | "Active" = "Active";
    if (agent.status === "Active") nextStatus = "Draft";
    else if (agent.status === "Draft") nextStatus = "Training";

    updateAgent({
      ...agent,
      status: nextStatus
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-purple-400" />
            <span>AI Staff Builder</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Construct specialized AI employees, allocate their personalities, and deploy to messaging channels.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-md shadow-purple-500/15 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Build AI Staff Member</span>
        </button>
      </div>

      {/* Grid of Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaceAgents.map((agent) => (
          <div 
            key={agent.id} 
            className="glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4 relative overflow-hidden"
          >
            {/* Upper half info */}
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-zinc-100 flex items-center gap-1.5">
                    {agent.name}
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">{agent.role}</span>
                </div>

                {/* Status selector */}
                <button
                  onClick={() => handleToggleStatus(agent.id)}
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer ${
                    agent.status === "Active"
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                      : agent.status === "Training"
                      ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                      : "bg-zinc-800 border-zinc-800 text-zinc-400"
                  }`}
                  title="Click to cycle status: Active -> Draft -> Training"
                >
                  {agent.status}
                </button>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                {agent.personality}
              </p>
            </div>

            {/* Sub details */}
            <div className="border-t border-zinc-900 pt-3 space-y-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-500 font-semibold uppercase tracking-wider">Tone Model:</span>
                <span className="text-zinc-300 font-medium">{agent.tone}</span>
              </div>

              {/* Call Readiness Telemetry */}
              <div className="border-t border-zinc-950 pt-2 space-y-1.5 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-semibold uppercase tracking-wider">Call Readiness:</span>
                  <span className={`font-bold ${
                    (agent.callReadiness || 85) >= 90 ? "text-emerald-400" :
                    (agent.callReadiness || 85) >= 75 ? "text-amber-400" : "text-rose-450"
                  }`}>{agent.callReadiness || 85}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-semibold uppercase tracking-wider">Last Sim Result:</span>
                  <span className="text-zinc-350 font-medium truncate max-w-[125px]">{agent.lastSimulationResult || "N/A"}</span>
                </div>
                {agent.needsTraining && (
                  <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-center">
                    ⚠️ Needs Training Objections
                  </div>
                )}
              </div>

              {/* Channels List */}
              <div className="flex flex-wrap gap-1.5">
                {agent.channels.map((ch, idx) => {
                  const channelInfo = availableChannels.find(ac => ac.name === ch);
                  const Icon = channelInfo?.icon || MessageSquare;
                  return (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1 rounded bg-zinc-900 px-2 py-1 text-[9px] text-zinc-400 border border-zinc-900"
                    >
                      <Icon className="h-2.5 w-2.5" />
                      <span>{ch}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Empty state construct */}
        {workspaceAgents.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border border-dashed border-zinc-900 rounded-xl bg-zinc-950/20">
            <UserCheck className="h-10 w-10 text-zinc-800 mb-3" />
            <h3 className="text-sm font-semibold text-zinc-300">No staff members created</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-[250px] leading-relaxed">
              Create your first AI specialist to connect them to active customer communication lines.
            </p>
          </div>
        )}
      </div>

      {/* Build Agent Dialog */}
      <Dialog 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Construct AI Employee"
      >
        <form onSubmit={handleCreateAgent} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Name
              </label>
              <input 
                type="text" 
                placeholder="Sophia, Max, etc."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Role Specialty
              </label>
              <input 
                type="text" 
                placeholder="e.g. Sales Consultant"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Personality & Context Prompt
            </label>
            <textarea 
              rows={3}
              placeholder="Describe their behaviors. (e.g. Warm aesthetics expert who always focuses on natural-looking enhancements and suggests consultations.)"
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-750 focus:outline-none focus:ring-1 focus:ring-purple-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Tone style
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-600"
              >
                <option value="Warm & Empathetic">Warm & Empathetic</option>
                <option value="Clinical & Professional">Clinical & Professional</option>
                <option value="Direct & Analytical">Direct & Analytical</option>
                <option value="Refined & Accommodating">Refined & Accommodating</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-600"
              >
                <option value="Active">Active</option>
                <option value="Training">Training</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Communication Channels
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableChannels.map((ch) => (
                <button
                  key={ch.name}
                  type="button"
                  onClick={() => handleChannelToggle(ch.name)}
                  className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                    selectedChannels.includes(ch.name)
                      ? "border-purple-600/30 bg-purple-600/10 text-purple-400"
                      : "border-zinc-800 bg-zinc-900/10 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <ch.icon className="h-3.5 w-3.5" />
                  <span>{ch.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-zinc-800 bg-transparent px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-all shadow-md shadow-purple-500/10 cursor-pointer"
            >
              Configure AI Agent
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
