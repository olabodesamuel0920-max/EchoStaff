"use client";

import React from "react";
import Link from "next/link";
import { useAppState } from "@/context/state-context";
import { 
  UserCheck, 
  MessageSquare, 
  TrendingUp, 
  DollarSign, 
  Sparkles, 
  AlertTriangle,
  ArrowRight,
  Flame,
  CheckCircle2
} from "lucide-react";

export default function DashboardOverview() {
  const { 
    activeWorkspaceId, 
    activeWorkspace, 
    agents, 
    conversations, 
    trainingItems,
    callSimulations
  } = useAppState();

  // Filter based on active workspace
  const workspaceAgents = agents.filter(a => a.linkedBrainId === activeWorkspaceId);
  const workspaceConvs = conversations[activeWorkspaceId] || [];
  const workspaceTraining = trainingItems[activeWorkspaceId] || [];

  // Compute metrics
  const activeAgentsCount = workspaceAgents.filter(a => a.status === "Active").length;
  const conversationVolume = activeWorkspace?.volume || 0;
  const monthlyValue = activeWorkspace?.value || 0;
  const trainingScore = activeWorkspace?.trainingStatus || 0;

  // Derive "Hot Leads"
  const hotLeads = workspaceConvs.filter(c => c.leadStatus === "Hot" || c.leadStatus === "Warm");

  // Call Lab Metrics
  const workspaceSims = (callSimulations && callSimulations[activeWorkspaceId]) || [];
  const totalCallSims = workspaceSims.length;
  
  const averageReadiness = totalCallSims > 0
    ? Math.round(workspaceSims.reduce((acc, sim) => acc + (sim.scorecard?.qualityScore || 0), 0) / totalCallSims)
    : (workspaceAgents.length > 0
        ? Math.round(workspaceAgents.reduce((acc, a) => acc + (a.callReadiness || 85), 0) / workspaceAgents.length)
        : 85);

  const callsNeedingTraining = workspaceSims.filter(sim => 
    sim.scorecard && (sim.scorecard.qualityScore < 80 || sim.scorecard.suggestedFollowUp)
  ).length;

  const bestAgent = workspaceAgents.length > 0
    ? [...workspaceAgents].sort((a, b) => (b.callReadiness || 85) - (a.callReadiness || 85))[0]
    : null;

  if (workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-amber-500 animate-pulse" />
        <h2 className="text-lg font-bold text-zinc-100">No Workspaces Found</h2>
        <p className="text-xs text-zinc-500 max-w-[320px] leading-relaxed">
          We couldn't locate any workspaces for your account. Please create one using the workspace switcher above or wait for onboarding to complete.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Heading */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Workspace Hub
            <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-semibold">
              Live Console
            </span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Auditing and training metrics for <strong className="text-zinc-300 font-semibold">{activeWorkspace?.clientName}</strong>.
          </p>
        </div>

        <Link 
          href="/dashboard/playground"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-all shadow-md shadow-purple-500/15 cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Launch Simulator Playground</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Active Staff</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/10">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{activeAgentsCount}</span>
            <span className="text-[10px] text-zinc-500">/ {workspaceAgents.length} configured</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">Running on selected channels</p>
        </div>

        {/* Card 2 */}
        <div className="glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Conversations</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{conversationVolume}</span>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" />
              +12.4%
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">Simulated message flow</p>
        </div>

        {/* Card 3 */}
        <div className="glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">SLA Client Value</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">${monthlyValue}</span>
            <span className="text-[10px] text-zinc-500">/ month contract</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">Fixed agency billing tier</p>
        </div>

        {/* Card 4 */}
        <div className="glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Hot Leads Rate</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/10">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {conversationVolume > 0 ? Math.round((hotLeads.length / conversationVolume) * 100) : 18}%
            </span>
            <span className="text-[10px] text-zinc-500">{hotLeads.length} leads qualified</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">Conversion rate optimized</p>
        </div>
      </div>

      {/* Call Lab Diagnostics */}
      <div className="glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Call Lab & Simulator Diagnostics
            </h3>
          </div>
          <Link 
            href="/dashboard/call-lab"
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
          >
            Launch Call Lab
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1 bg-zinc-900/20 border border-zinc-900/60 p-3 rounded-lg">
            <span className="text-zinc-550 font-semibold block">Total Call Simulations</span>
            <span className="text-lg font-extrabold text-white">{totalCallSims}</span>
          </div>
          <div className="space-y-1 bg-zinc-900/20 border border-zinc-900/60 p-3 rounded-lg">
            <span className="text-zinc-550 font-semibold block">Live-Call Readiness</span>
            <span className={`text-lg font-extrabold block ${
              averageReadiness >= 90 ? "text-emerald-400" : averageReadiness >= 75 ? "text-amber-400" : "text-rose-455"
            }`}>{averageReadiness}%</span>
          </div>
          <div className="space-y-1 bg-zinc-900/20 border border-zinc-900/60 p-3 rounded-lg">
            <span className="text-zinc-550 font-semibold block">Simulations Needing Training</span>
            <span className={`text-lg font-extrabold block ${
              callsNeedingTraining > 0 ? "text-amber-500" : "text-zinc-400"
            }`}>{callsNeedingTraining} calls</span>
          </div>
          <div className="space-y-1 bg-zinc-900/20 border border-zinc-900/60 p-3 rounded-lg">
            <span className="text-zinc-550 font-semibold block">Best Performing Agent</span>
            <span className="text-sm font-extrabold text-purple-400 truncate block">
              {bestAgent ? `${bestAgent.name} (${bestAgent.callReadiness || 85}%)` : "No agents"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Training & Hot Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Training Score circular gauge & Knowledge gaps */}
        <div className="lg:col-span-1 space-y-6">
          {/* Training Score Card */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 self-start">
              Agent Cognitive Accuracy
            </h3>
            
            {/* Gauge Graphic */}
            <div className="relative flex items-center justify-center h-32 w-32 mt-2">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  className="stroke-zinc-900 fill-none"
                  strokeWidth="8"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  className="stroke-purple-600 fill-none transition-all duration-1000"
                  strokeWidth="8"
                  strokeDasharray={326}
                  strokeDashoffset={326 - (326 * trainingScore) / 100}
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-extrabold text-white glow-text">{trainingScore}%</span>
                <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mt-0.5">Brain Score</span>
              </div>
            </div>

            <div className="mt-6 space-y-1">
              <span className="block text-xs font-semibold text-zinc-300">
                {trainingScore >= 90 ? "Excellent Voice Control" : trainingScore >= 75 ? "Steady Performance" : "Needs Training Review"}
              </span>
              <p className="text-[10px] text-zinc-500 max-w-[200px]">
                Determined by the ratio of approved replies and resolved customer objections.
              </p>
            </div>
            
            <Link 
              href="/dashboard/training" 
              className="mt-5 w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 py-2 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
            >
              <span>Audit Pending Items ({workspaceTraining.length})</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Knowledge Gaps Card */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
              Knowledge Gaps
            </h3>
            {workspaceTraining.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500/20 mb-2" />
                <span className="text-xs font-semibold text-zinc-400">All questions resolved</span>
                <p className="text-[10px] text-zinc-600 mt-1 max-w-[150px]">EchoStaff AI is fully aligned with client scope.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10 p-2.5">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-amber-400">Unresolved Customer Queries</span>
                    <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                      We have {workspaceTraining.length} customer questions that the AI answered but flagged for owner correction.
                    </p>
                  </div>
                </div>
                <div className="border-t border-zinc-900/50 pt-2 space-y-1.5">
                  {workspaceTraining.map((item) => (
                    <div key={item.id} className="rounded-lg bg-zinc-900/20 border border-zinc-900 p-2 text-[11px] truncate text-zinc-400">
                      &ldquo;{item.customerQuestion}&rdquo;
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Hot Leads Feed & Active Staff List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hot Leads list */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Hot Leads / Active Opportunities
              </h3>
              <Link href="/dashboard/conversations" className="text-xs text-purple-400 hover:text-purple-300 font-semibold">
                View Inbox
              </Link>
            </div>

            {hotLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-zinc-900 rounded-lg">
                <Flame className="h-8 w-8 text-zinc-800 mb-2" />
                <span className="text-xs font-semibold text-zinc-400">No active hot leads</span>
                <p className="text-[10px] text-zinc-600 mt-1">Chat in the Playground to generate leads.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {hotLeads.map((lead) => (
                  <div 
                    key={lead.id} 
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-zinc-900/20 border border-zinc-900 hover:border-zinc-800/80 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-200">{lead.customerName}</span>
                        <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[9px] font-semibold text-purple-400">
                          {lead.channel}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                          lead.sentiment === "Positive" 
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                            : lead.sentiment === "Negative"
                            ? "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                            : "bg-zinc-800 border border-zinc-800 text-zinc-400"
                        }`}>
                          {lead.sentiment} Sentiment
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed truncate max-w-md">
                        {lead.summary}
                      </p>
                    </div>

                    <Link 
                      href="/dashboard/conversations"
                      className="rounded-lg border border-zinc-800 hover:bg-zinc-900 px-3 py-1.5 text-[10px] font-semibold text-zinc-300 transition-colors shrink-0 w-full sm:w-auto text-center"
                    >
                      Audit Log
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Agents status */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Staff Status
              </h3>
              <Link href="/dashboard/agents" className="text-xs text-purple-400 hover:text-purple-300 font-semibold">
                Manage Staff
              </Link>
            </div>

            {workspaceAgents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <span className="text-xs font-semibold text-zinc-400">No staff members created</span>
                <p className="text-[10px] text-zinc-600 mt-1">Navigate to Agents page to construct your first AI employee.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {workspaceAgents.map((agent) => (
                  <div key={agent.id} className="p-3.5 rounded-lg bg-zinc-900/30 border border-zinc-900 flex justify-between items-center">
                    <div>
                      <span className="block text-sm font-semibold text-zinc-200">{agent.name}</span>
                      <span className="text-[10px] text-zinc-500">{agent.role}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        agent.status === "Active" 
                          ? "bg-emerald-500" 
                          : agent.status === "Training" 
                          ? "bg-amber-500" 
                          : "bg-zinc-600"
                      }`} />
                      <span className={`text-[10px] font-semibold ${
                        agent.status === "Active" 
                          ? "text-emerald-400" 
                          : agent.status === "Training" 
                          ? "text-amber-400" 
                          : "text-zinc-500"
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
