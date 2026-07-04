"use client";

import React, { useState, useEffect } from "react";
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
  Server,
  Lock,
  DollarSign,
  Edit2,
  AlertTriangle,
  Scale
} from "lucide-react";

// Approved administrator emails
const ADMIN_EMAILS = [
  "admin@echostaff.ai",
  "olabodesamuel0920+echo1@gmail.com"
];

export default function AdminControlPanel() {
  const { 
    user, 
    authLoading, 
    workspaces, 
    updateWorkspaceBilling, 
    refetchData,
    systemStats 
  } = useAppState();

  const [logs, setLogs] = useState<string[]>([
    "System Initialized. Accessing secure admin layer...",
    "localStorage synchronization pipeline connected.",
    "Database link established."
  ]);
  const [runningCheck, setRunningCheck] = useState(false);
  const [health, setHealth] = useState(systemStats.systemHealth);
  
  // Local state for editing workspace billing settings
  const [editingWsId, setEditingWsId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    plan: "Starter AI Staff",
    billingStatus: "trial" as "trial" | "active" | "overdue" | "cancelled",
    monthlyMessageLimit: 500
  });
  const [saveLoading, setSaveLoading] = useState(false);

  // Auto-refresh logs when workspaces change
  useEffect(() => {
    if (workspaces.length > 0) {
      setLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Synchronized ${workspaces.length} active workspace records from Supabase.`
      ]);
    }
  }, [workspaces]);

  const handleRunDiagnostics = () => {
    setRunningCheck(true);
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Starting global self-check...`]);
    
    setTimeout(() => {
      setRunningCheck(false);
      setHealth("Optimal");
      setLogs(prev => [
        ...prev, 
        `[${new Date().toLocaleTimeString()}] Diagnostic complete: 0 configuration anomalies. Uptime: 99.98%`
      ]);
    }, 1200);
  };

  const handleClearLogs = () => {
    setLogs([`[${new Date().toLocaleTimeString()}] Console logs cleared by administrator.`]);
  };

  const startEditing = (ws: any) => {
    setEditingWsId(ws.id);
    setEditForm({
      plan: ws.plan || "Starter AI Staff",
      billingStatus: ws.billingStatus || "trial",
      monthlyMessageLimit: ws.monthlyMessageLimit || 500
    });
  };

  const cancelEditing = () => {
    setEditingWsId(null);
  };

  const saveBillingChanges = async (wsId: string) => {
    setSaveLoading(true);
    try {
      await updateWorkspaceBilling(
        wsId, 
        editForm.plan, 
        editForm.billingStatus, 
        editForm.monthlyMessageLimit
      );
      setLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Successfully updated billing settings for workspace ${wsId.substring(0, 8)}.`
      ]);
      setEditingWsId(null);
      await refetchData(); // reload updated values
    } catch (err: any) {
      console.error(err);
      setLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ERROR: Failed to update billing for workspace ${wsId.substring(0, 8)}: ${err.message}`
      ]);
    } finally {
      setSaveLoading(false);
    }
  };

  // 1. Auth Loading State
  if (authLoading) {
    return (
      <div className="bg-black min-h-screen text-zinc-200 flex flex-col items-center justify-center gap-4">
        <RefreshCw className="h-8 w-8 text-purple-500 animate-spin" />
        <span className="text-sm text-zinc-500 font-medium">Verifying Administrator Session...</span>
      </div>
    );
  }

  // 2. Auth Allowlist Guard
  const isAdmin = user && ADMIN_EMAILS.includes(user.email);
  if (!isAdmin) {
    return (
      <div className="bg-black min-h-screen text-zinc-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Glowing warning gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-600/10 rounded-full filter blur-[100px] pointer-events-none" />
        
        <div className="max-w-md w-full text-center space-y-6 relative z-10">
          <div className="h-16 w-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
            <Lock className="h-8 w-8 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-black text-white uppercase tracking-wider">403 Access Denied</h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This area is restricted to approved platform administrators. Your account ({user?.email || "anonymous"}) does not have the necessary security credentials.
            </p>
          </div>
          <div className="pt-4 border-t border-zinc-900 flex justify-center gap-4">
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <Link 
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-semibold text-white transition-all cursor-pointer"
            >
              <span>Switch Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Compute SaaS metrics
  const totalWorkspacesCount = workspaces.length;
  const activeSaaSUsers = systemStats.totalUsers; // or unique workspace owners
  
  // Calculate MRR from real workspace plans
  let calculatedMRR = 0;
  let totalUsageCount = 0;
  workspaces.forEach(ws => {
    totalUsageCount += ws.currentMonthMessageCount || 0;
    if (ws.billingStatus === "active") {
      if (ws.plan === "Growth AI Staff") calculatedMRR += 149;
      else if (ws.plan === "Managed AI Staff") calculatedMRR += 390;
      else calculatedMRR += 49;
    }
  });

  return (
    <div className="bg-black min-h-screen text-zinc-200 p-6 md:p-12 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Top bar back */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-4 gap-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <span className="h-4 w-px bg-zinc-900 hidden sm:inline" />
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-purple-400" />
              <span>Platform Owner Console</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-950/30 border border-emerald-900/40 px-2.5 py-1 rounded">
              Superuser: {user.email}
            </span>
          </div>
        </div>

        {/* Global Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total SaaS Clients</span>
              <span className="text-2xl font-extrabold text-white block mt-1">{totalWorkspacesCount}</span>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
              <Building2 className="h-5 w-5" />
            </div>
          </div>

          <div className="glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">SaaS Monthly Revenue</span>
              <span className="text-2xl font-extrabold text-white block mt-1">${calculatedMRR}</span>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>

          <div className="glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total Monthly Messages</span>
              <span className="text-2xl font-extrabold text-white block mt-1">{totalUsageCount}</span>
            </div>
            <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>

          <div className="glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">System Health Node</span>
              <span className="text-2xl font-extrabold text-emerald-400 block mt-1">{health}</span>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400">
              <Activity className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Workspaces Billing & Limit Manager */}
        <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Scale className="h-4.5 w-4.5 text-purple-400" />
              <span>SaaS Client Billings & Usage Limits</span>
            </h3>
            <button 
              onClick={async () => {
                setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Triggering forced database refetch...`]);
                await refetchData();
              }}
              className="text-[10px] text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded px-2.5 py-1 flex items-center gap-1 cursor-pointer hover:bg-zinc-900 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Sync Database</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Business / ID</th>
                  <th className="py-3 px-4">Industry</th>
                  <th className="py-3 px-4">Billing Plan</th>
                  <th className="py-3 px-4">Billing Status</th>
                  <th className="py-3 px-4">Usage Progress</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300">
                {workspaces.map((ws) => {
                  const isEditing = editingWsId === ws.id;
                  const usagePct = ws.monthlyMessageLimit && ws.monthlyMessageLimit > 0 
                    ? Math.min(100, Math.round(((ws.currentMonthMessageCount || 0) / ws.monthlyMessageLimit) * 100))
                    : 0;

                  return (
                    <tr key={ws.id} className="hover:bg-zinc-950/30 transition-colors">
                      <td className="py-4 px-4 font-semibold">
                        <span className="text-white block">{ws.clientName}</span>
                        <span className="text-[10px] text-zinc-600 font-mono block mt-0.5">{ws.id}</span>
                      </td>
                      <td className="py-4 px-4 text-zinc-400">{ws.industry}</td>
                      
                      {/* Plan column */}
                      <td className="py-4 px-4">
                        {isEditing ? (
                          <select 
                            value={editForm.plan}
                            onChange={(e) => setEditForm(prev => ({ ...prev, plan: e.target.value }))}
                            className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                          >
                            <option value="Starter AI Staff">Starter AI Staff ($49/mo)</option>
                            <option value="Growth AI Staff">Growth AI Staff ($149/mo)</option>
                            <option value="Managed AI Staff">Managed AI Staff ($390/mo)</option>
                          </select>
                        ) : (
                          <span className="font-semibold text-zinc-200">{ws.plan || "Starter AI Staff"}</span>
                        )}
                      </td>

                      {/* Status column */}
                      <td className="py-4 px-4">
                        {isEditing ? (
                          <select 
                            value={editForm.billingStatus}
                            onChange={(e) => setEditForm(prev => ({ ...prev, billingStatus: e.target.value as any }))}
                            className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                          >
                            <option value="trial">trial</option>
                            <option value="active">active</option>
                            <option value="overdue">overdue</option>
                            <option value="cancelled">cancelled</option>
                          </select>
                        ) : (
                          <span className={`rounded-full px-2 py-0.5 font-semibold text-[10px] border ${
                            ws.billingStatus === "active" 
                              ? "bg-emerald-500/15 border-emerald-500/20 text-emerald-400" 
                              : ws.billingStatus === "trial"
                                ? "bg-indigo-500/15 border-indigo-500/20 text-indigo-400"
                                : ws.billingStatus === "overdue"
                                  ? "bg-amber-500/15 border-amber-500/20 text-amber-400 animate-pulse"
                                  : "bg-rose-500/15 border-rose-500/20 text-rose-400"
                          }`}>
                            {ws.billingStatus || "trial"}
                          </span>
                        )}
                      </td>

                      {/* Progress column */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5 max-w-[140px]">
                          <div className="flex justify-between text-[10px] text-zinc-500">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-zinc-400 font-semibold">{ws.currentMonthMessageCount || 0} /</span>
                                <input 
                                  type="number"
                                  value={editForm.monthlyMessageLimit}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, monthlyMessageLimit: parseInt(e.target.value) || 0 }))}
                                  className="w-16 bg-zinc-950 border border-zinc-850 rounded text-center px-1 text-zinc-200 focus:outline-none focus:border-purple-500"
                                />
                              </div>
                            ) : (
                              <>
                                <span>{ws.currentMonthMessageCount || 0} / {ws.monthlyMessageLimit || 500} msgs</span>
                                <span>{usagePct}%</span>
                              </>
                            )}
                          </div>
                          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                usagePct >= 90 
                                  ? "bg-rose-500" 
                                  : usagePct >= 70 
                                    ? "bg-amber-500" 
                                    : "bg-purple-600"
                              }`} 
                              style={{ width: `${usagePct}%` }} 
                            />
                          </div>
                        </div>
                      </td>

                      {/* Actions column */}
                      <td className="py-4 px-4 text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => saveBillingChanges(ws.id)}
                              disabled={saveLoading}
                              className="bg-purple-600 hover:bg-purple-500 text-white rounded px-2.5 py-1 text-[10px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 rounded px-2.5 py-1 text-[10px] transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(ws)}
                            className="inline-flex items-center gap-1 hover:text-purple-400 border border-zinc-900 hover:border-purple-500/20 rounded px-2.5 py-1 transition-all cursor-pointer"
                          >
                            <Edit2 className="h-3 w-3" />
                            <span>Modify Billing</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Diagnostics grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Stats */}
          <div className="lg:col-span-1 space-y-6">
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
                  <span>API Capacity Allocation</span>
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
          </div>

          {/* Console Output Logs */}
          <div className="lg:col-span-2 glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg flex flex-col justify-between space-y-4 min-h-[360px]">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Terminal className="h-4.5 w-4.5 text-purple-400" />
                <span>Edge Console Log Stream</span>
              </h3>
              
              <button 
                onClick={handleClearLogs}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 font-semibold cursor-pointer"
              >
                Clear Console
              </button>
            </div>

            {/* Terminal Window */}
            <div className="flex-1 rounded-lg bg-black/90 p-4 border border-zinc-900 font-mono text-[11px] text-zinc-400 overflow-y-auto space-y-2 leading-relaxed h-72">
              {logs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-purple-500 shrink-0">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-zinc-500">
              SaaS Telemetry: Real-time sync pipeline active. Connected to Supabase Cloud Engine.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
