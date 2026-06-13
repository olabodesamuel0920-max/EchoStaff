"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppState } from "@/context/state-context";
import { 
  ShieldAlert, 
  Users, 
  Building2, 
  UserCheck, 
  MessageSquare, 
  Activity, 
  Cpu, 
  Terminal, 
  Check, 
  ArrowLeft,
  RefreshCw,
  Server
} from "lucide-react";

export default function AdminControlPanel() {
  const { systemStats } = useAppState();

  const [logs, setLogs] = useState<string[]>([
    "System Initialized. Cognitive mocks active.",
    "OpenAI sandbox connection optimal.",
    "localStorage synchronization pipeline connected.",
    "Active node checks: 14 nodes online."
  ]);
  const [runningCheck, setRunningCheck] = useState(false);
  const [health, setHealth] = useState(systemStats.systemHealth);

  const handleRunDiagnostics = () => {
    setRunningCheck(true);
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Starting system diagnostic scan...`]);
    
    setTimeout(() => {
      setRunningCheck(false);
      setHealth("Optimal");
      setLogs(prev => [
        ...prev, 
        `[${new Date().toLocaleTimeString()}] Diagnostic complete: 0 leaks, 0 configuration anomalies. Uptime: 99.98%`
      ]);
    }, 1200);
  };

  const handleClearLogs = () => {
    setLogs([`[${new Date().toLocaleTimeString()}] Console logs cleared by administrator.`]);
  };

  return (
    <div className="bg-black min-h-screen text-zinc-200 p-6 md:p-12 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Top bar back */}
        <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <span className="h-4 w-px bg-zinc-900" />
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-purple-400" />
              <span>Platform Owner Console</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-ring" />
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Superuser Authorized (Simulated Sandbox)</span>
          </div>
        </div>

        {/* Global Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total SaaS Users</span>
              <span className="text-2xl font-extrabold text-white block mt-1">{systemStats.totalUsers}</span>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Managed Businesses</span>
              <span className="text-2xl font-extrabold text-white block mt-1">{systemStats.totalBusinesses}</span>
            </div>
            <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Building2 className="h-5 w-5" />
            </div>
          </div>

          <div className="glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total Active Staff</span>
              <span className="text-2xl font-extrabold text-white block mt-1">{systemStats.totalAgents}</span>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total Messages Logged</span>
              <span className="text-2xl font-extrabold text-white block mt-1">{systemStats.totalConversations}</span>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* System Health / API logs grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Health State */}
            <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-purple-400" />
                <span>Node Health</span>
              </h3>

              <div className="flex items-center justify-between p-3.5 rounded-lg bg-zinc-900/15 border border-zinc-900">
                <span className="text-xs text-zinc-400">Global Uptime State:</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                  health === "Optimal" 
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" 
                    : "bg-amber-500/15 border-amber-500/30 text-amber-400"
                }`}>
                  {health}
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-[11px] text-zinc-500">
                  <span>API Usage Capacity</span>
                  <span>{systemStats.apiUsagePercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: `${systemStats.apiUsagePercent}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center text-xs pt-3">
                <div className="p-3 bg-zinc-900/20 rounded-lg border border-zinc-900">
                  <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Active Nodes</span>
                  <span className="text-base font-extrabold text-zinc-300 block mt-1">{systemStats.activeNodes} / 16</span>
                </div>
                <div className="p-3 bg-zinc-900/20 rounded-lg border border-zinc-900">
                  <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Errors Count</span>
                  <span className="text-base font-extrabold text-rose-400 block mt-1">{systemStats.errorsCount} logged</span>
                </div>
              </div>

              <button
                onClick={handleRunDiagnostics}
                disabled={runningCheck}
                className="w-full rounded-lg bg-purple-600 hover:bg-purple-500 text-center py-2 text-xs font-semibold text-white transition-colors flex justify-center items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${runningCheck ? "animate-spin" : ""}`} />
                <span>{runningCheck ? "Executing Audit Scan..." : "Execute Global Self-Check"}</span>
              </button>
            </div>

            {/* Simulated Server Card */}
            <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Server className="h-4.5 w-4.5 text-purple-400" />
                <span>Secure Edge Nodes</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center bg-zinc-900/10 border border-zinc-900 p-2.5 rounded-lg">
                  <span className="text-zinc-400">Node US-EAST-1</span>
                  <span className="text-emerald-400 font-bold">Online</span>
                </div>
                <div className="flex justify-between items-center bg-zinc-900/10 border border-zinc-900 p-2.5 rounded-lg">
                  <span className="text-zinc-400">Node EU-WEST-2</span>
                  <span className="text-emerald-400 font-bold">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Console Output Logs */}
          <div className="lg:col-span-2 glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg flex flex-col justify-between space-y-4 min-h-[400px]">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Terminal className="h-4.5 w-4.5 text-purple-400" />
                <span>Edge Console Log Stream</span>
              </h3>
              
              <button 
                onClick={handleClearLogs}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 font-semibold"
              >
                Clear Console
              </button>
            </div>

            {/* Terminal Window */}
            <div className="flex-1 rounded-lg bg-black/90 p-4 border border-zinc-900 font-mono text-[11px] text-zinc-400 overflow-y-auto space-y-2 leading-relaxed h-80">
              {logs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-purple-500 shrink-0">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-zinc-500">
              Simulated Telemetry: Feed synchronized from Supabase-ready edge nodes. Uptime: 99.98% (Phase 1 Sandbox Mode)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
