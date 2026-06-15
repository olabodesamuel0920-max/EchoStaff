"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppState } from "@/context/state-context";
import { supabase } from "@/lib/supabase/client";
import { 
  Activity, 
  Server, 
  ShieldCheck, 
  Terminal, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  Key, 
  User, 
  Mail, 
  FileText, 
  Check, 
  HelpCircle,
  Building,
  Lock
} from "lucide-react";

interface ServerDiagnostics {
  envDetected: boolean;
  anonKeyDetected: boolean;
  serviceRoleKeyDetected: boolean;
  adminClientInitialized: boolean;
  databaseReachable: boolean;
  profilesReachable: boolean;
  workspacesReachable: boolean;
  brandBrainsReachable: boolean;
  agentsReachable: boolean;
  conversationsReachable: boolean;
  widgetConfigsReachable: boolean;
  message: string;
}

export default function SystemDiagnosticsPage() {
  const { 
    isSandboxMode, 
    isDatabaseMode, 
    isOfflineFallbackActive, 
    user, 
    isSupabaseConfigured,
    activeWorkspaceId,
    activeWorkspace,
    lastSyncTimestamp,
    refetchData
  } = useAppState();

  const [loading, setLoading] = useState(false);
  const [serverCheck, setServerCheck] = useState<ServerDiagnostics | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  
  // Client-side table checks
  const [clientChecks, setClientChecks] = useState<Record<string, { reachable: boolean; error?: string }>>({});
  const [clientChecking, setClientChecking] = useState(false);

  // Manual checklists state (persisted to localStorage)
  const [manualChecks, setManualChecks] = useState({
    sqlMigrationsRun: false,
    vercelEnvVarsAdded: false,
    vercelRedeployed: false,
    rlsTestedWithTwoUsers: false,
  });

  const [rlsChecks, setRlsChecks] = useState({
    userACannotSeeWorkspaces: false,
    userACannotSeeBrandBrains: false,
    userACannotSeeAgents: false,
    userACannotSeeConversations: false,
    userACannotSeeWidgetConfigs: false,
  });

  // Load checklist state from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedManual = localStorage.getItem("echostaff_qa_manual_checks");
      if (storedManual) {
        try { setManualChecks(JSON.parse(storedManual)); } catch (_) {}
      }
      const storedRls = localStorage.getItem("echostaff_qa_rls_checks");
      if (storedRls) {
        try { setRlsChecks(JSON.parse(storedRls)); } catch (_) {}
      }
    }
  }, []);

  const saveManualChecks = (newVal: typeof manualChecks) => {
    setManualChecks(newVal);
    localStorage.setItem("echostaff_qa_manual_checks", JSON.stringify(newVal));
  };

  const saveRlsChecks = (newVal: typeof rlsChecks) => {
    setRlsChecks(newVal);
    localStorage.setItem("echostaff_qa_rls_checks", JSON.stringify(newVal));
  };

  // Run server-side check
  const runServerCheck = async () => {
    setLoading(true);
    setServerError(null);
    try {
      const res = await fetch("/api/system/supabase-check");
      if (!res.ok) {
        throw new Error(`Server diagnostics returned status ${res.status}`);
      }
      const data = await res.json();
      setServerCheck(data);
    } catch (err: any) {
      console.error("Server check failed:", err);
      setServerError(err.message || "Failed to query server-side diagnostics.");
    } finally {
      setLoading(false);
    }
  };

  // Run client-side table checks (using Anon client)
  const runClientChecks = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setClientChecks({});
      return;
    }
    setClientChecking(true);
    const tables = ["profiles", "workspaces", "brand_brains", "agents", "conversations", "widget_configs"];
    const results: Record<string, { reachable: boolean; error?: string }> = {};

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select("id").limit(1);
        if (error) {
          results[table] = { reachable: false, error: error.message };
        } else {
          results[table] = { reachable: true };
        }
      } catch (err: any) {
        results[table] = { reachable: false, error: err.message || "Unknown client error" };
      }
    }
    setClientChecks(results);
    setClientChecking(false);
  }, [isSupabaseConfigured]);

  useEffect(() => {
    runServerCheck();
    runClientChecks();
  }, [runClientChecks]);

  // Determine current mode display
  let modeText = "Local Sandbox Mode";
  let modeBadgeColor = "bg-purple-500/15 border-purple-500/30 text-purple-400";
  if (isDatabaseMode) {
    modeText = "Supabase Connected";
    modeBadgeColor = "bg-emerald-500/15 border-emerald-500/30 text-emerald-400";
  } else if (isOfflineFallbackActive) {
    modeText = "Offline Fallback Mode";
    modeBadgeColor = "bg-amber-500/15 border-amber-500/30 text-amber-400";
  }

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-400" />
            <span>Database & System Integrity Diagnostics</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Perform administrative audits, verify server configurations, and track database table integrity.
          </p>
        </div>

        <button
          onClick={() => {
            runServerCheck();
            runClientChecks();
            refetchData();
          }}
          disabled={loading || clientChecking}
          className="rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-350 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${(loading || clientChecking) ? "animate-spin" : ""}`} />
          <span>Execute Audit</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Diagnostics panels (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Mode & Session Status */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Server className="h-4 w-4 text-purple-400" />
              <span>Current Auth & Workspace State</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-900/20 border border-zinc-900 p-3 rounded-lg flex flex-col justify-between">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Connection Mode</span>
                <span className={`inline-block w-fit mt-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${modeBadgeColor}`}>
                  {modeText}
                </span>
              </div>

              <div className="bg-zinc-900/20 border border-zinc-900 p-3 rounded-lg flex flex-col justify-between">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Active Workspace</span>
                <span className="text-xs font-bold text-zinc-300 mt-1 flex items-center gap-1">
                  <Building className="h-3.5 w-3.5 text-zinc-500" />
                  <span>{activeWorkspace?.clientName || (activeWorkspaceId ? `ID: ${activeWorkspaceId.substring(0, 8)}` : "None")}</span>
                </span>
              </div>

              <div className="bg-zinc-900/20 border border-zinc-900 p-3 rounded-lg flex flex-col justify-between">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Auth Session</span>
                <span className="text-xs font-bold text-zinc-300 mt-1 flex items-center gap-1.5">
                  {user ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Session Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5 text-purple-400" />
                      <span>No Session (Local)</span>
                    </>
                  )}
                </span>
              </div>

              <div className="bg-zinc-900/20 border border-zinc-900 p-3 rounded-lg flex flex-col justify-between">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">User Account</span>
                <span className="text-xs font-bold text-zinc-300 mt-1 flex items-center gap-1.5 truncate">
                  <Mail className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="truncate">{user?.email || "anonymous-sandbox"}</span>
                </span>
              </div>
            </div>

            {lastSyncTimestamp && (
              <div className="text-[10px] text-zinc-650 font-medium tracking-wide">
                Last database synchronization: {new Date(lastSyncTimestamp).toLocaleString()}
              </div>
            )}
          </div>

          {/* Server Side Connection Panel */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-400" />
              <span>Server-Side Environment & Table Checks</span>
            </h3>

            {serverError && (
              <div className="p-3 bg-rose-950/20 border border-rose-950 text-rose-400 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {!serverCheck && !serverError ? (
              <div className="text-xs text-zinc-600 animate-pulse">Running server audits...</div>
            ) : serverCheck ? (
              <div className="space-y-4">
                
                {/* Safe ENV booleans */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex justify-between items-center bg-zinc-950/50 border border-zinc-900 p-2.5 rounded-lg text-xs">
                    <span className="text-zinc-500 font-medium flex items-center gap-1">
                      <Key className="h-3.5 w-3.5 text-zinc-600" />
                      <span>Base URL</span>
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${serverCheck.envDetected ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" : "text-zinc-500 border-zinc-800"}`}>
                      {serverCheck.envDetected ? "Present" : "Missing"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-zinc-950/50 border border-zinc-900 p-2.5 rounded-lg text-xs">
                    <span className="text-zinc-500 font-medium flex items-center gap-1">
                      <Key className="h-3.5 w-3.5 text-zinc-600" />
                      <span>Anon Key</span>
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${serverCheck.anonKeyDetected ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" : "text-zinc-500 border-zinc-800"}`}>
                      {serverCheck.anonKeyDetected ? "Present" : "Missing"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-zinc-950/50 border border-zinc-900 p-2.5 rounded-lg text-xs">
                    <span className="text-zinc-500 font-medium flex items-center gap-1">
                      <Lock className="h-3.5 w-3.5 text-zinc-600" />
                      <span>Service Key</span>
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${serverCheck.serviceRoleKeyDetected ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" : "text-zinc-500 border-zinc-800"}`}>
                      {serverCheck.serviceRoleKeyDetected ? "Present" : "Missing"}
                    </span>
                  </div>
                </div>

                {/* Table Checks */}
                <div className="border border-zinc-900 bg-zinc-950/30 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-2 bg-zinc-900/35 border-b border-zinc-900 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    <span>Database Table / Object</span>
                    <span className="text-right">Server Check Status</span>
                  </div>

                  <div className="divide-y divide-zinc-900">
                    {[
                      { name: "profiles", value: serverCheck.profilesReachable },
                      { name: "workspaces", value: serverCheck.workspacesReachable },
                      { name: "brand_brains", value: serverCheck.brandBrainsReachable },
                      { name: "agents", value: serverCheck.agentsReachable },
                      { name: "conversations", value: serverCheck.conversationsReachable },
                      { name: "widget_configs", value: serverCheck.widgetConfigsReachable },
                    ].map((tbl) => (
                      <div key={tbl.name} className="grid grid-cols-2 px-3 py-2 text-xs">
                        <span className="font-semibold text-zinc-350 font-mono">{tbl.name}</span>
                        <div className="flex justify-end">
                          {tbl.value ? (
                            <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                              <Check className="h-3.5 w-3.5" />
                              <span>Reachable</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-zinc-500 font-medium text-[11px]">
                              <XCircle className="h-3.5 w-3.5" />
                              <span>No Access</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/10 border border-zinc-900 rounded-lg text-xs text-zinc-400">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Server Response Message:</span>
                  <span>{serverCheck.message}</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Client Side Table RLS Access Panel */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-purple-400" />
              <span>Client-Side RLS Access (Anon Client)</span>
            </h3>

            {isSandboxMode ? (
              <p className="text-xs text-zinc-650 italic">
                Client checks bypass when running in Local Sandbox Mode. Log in to run RLS verification.
              </p>
            ) : (
              <div className="border border-zinc-900 bg-zinc-950/30 rounded-lg overflow-hidden">
                <div className="grid grid-cols-3 bg-zinc-900/35 border-b border-zinc-900 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  <span className="col-span-1">Table Name</span>
                  <span className="col-span-2 text-right">Client Session Access / RLS Error</span>
                </div>

                <div className="divide-y divide-zinc-900">
                  {[
                    "profiles",
                    "workspaces",
                    "brand_brains",
                    "agents",
                    "conversations",
                    "widget_configs"
                  ].map((table) => {
                    const status = clientChecks[table];
                    return (
                      <div key={table} className="grid grid-cols-3 px-3 py-2 text-xs">
                        <span className="col-span-1 font-semibold text-zinc-350 font-mono">{table}</span>
                        <div className="col-span-2 flex justify-end text-right">
                          {clientChecking ? (
                            <span className="text-zinc-600 animate-pulse text-[11px]">verifying...</span>
                          ) : status?.reachable ? (
                            <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                              <Check className="h-3.5 w-3.5" />
                              <span>Authorized (OK)</span>
                            </span>
                          ) : (
                            <span className="text-zinc-500 text-[10px] truncate max-w-[200px]" title={status?.error || "Connection failed"}>
                              {status?.error || "Verification failed"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: QA Checklist & RLS Isolation (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Manual Verification Checklist */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-400" />
              <span>QA Deployment Checklist</span>
            </h3>
            
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Verify database and cloud configurations manually. Check items off as they are completed:
            </p>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-2 bg-zinc-900/10 border border-zinc-900/40 hover:bg-zinc-900/20 rounded-lg cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={manualChecks.sqlMigrationsRun}
                  onChange={(e) => saveManualChecks({ ...manualChecks, sqlMigrationsRun: e.target.checked })}
                  className="mt-0.5 rounded border-zinc-800 bg-zinc-950 text-purple-600 focus:ring-purple-650"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-zinc-300 block">SQL Migrations Executed</span>
                  <span className="text-[10px] text-zinc-550 block">
                    All migrations (`schema.sql`, `002_widget_configs.sql`) applied in the Supabase SQL editor.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2 bg-zinc-900/10 border border-zinc-900/40 hover:bg-zinc-900/20 rounded-lg cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={manualChecks.vercelEnvVarsAdded}
                  onChange={(e) => saveManualChecks({ ...manualChecks, vercelEnvVarsAdded: e.target.checked })}
                  className="mt-0.5 rounded border-zinc-800 bg-zinc-950 text-purple-600 focus:ring-purple-650"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-zinc-300 block">Vercel Environment Keys</span>
                  <span className="text-[10px] text-zinc-550 block">
                    Bound keys for Supabase URL, Anon key, Service Role key, and OpenAI key in Vercel.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2 bg-zinc-900/10 border border-zinc-900/40 hover:bg-zinc-900/20 rounded-lg cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={manualChecks.vercelRedeployed}
                  onChange={(e) => saveManualChecks({ ...manualChecks, vercelRedeployed: e.target.checked })}
                  className="mt-0.5 rounded border-zinc-800 bg-zinc-950 text-purple-600 focus:ring-purple-650"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-zinc-300 block">Vercel Redeployed</span>
                  <span className="text-[10px] text-zinc-550 block">
                    Redeployed to ensure environmental variables are loaded into edge routes.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2 bg-zinc-900/10 border border-zinc-900/40 hover:bg-zinc-900/20 rounded-lg cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={manualChecks.rlsTestedWithTwoUsers}
                  onChange={(e) => saveManualChecks({ ...manualChecks, rlsTestedWithTwoUsers: e.target.checked })}
                  className="mt-0.5 rounded border-zinc-800 bg-zinc-950 text-purple-600 focus:ring-purple-650"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-zinc-300 block">Multi-Tenant Isolation Tested</span>
                  <span className="text-[10px] text-zinc-550 block">
                    Verified database isolation using two separate user browser accounts.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* RLS Isolation Checklist */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Lock className="h-4 w-4 text-purple-400" />
              <span>RLS Row Isolation Checks</span>
            </h3>
            
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Verify row isolation. Confirm that User A has no ability to query or edit data belonging to User B:
            </p>

            <div className="space-y-3">
              {[
                { key: "userACannotSeeWorkspaces", title: "Workspace Isolation", desc: "User A cannot see or select User B's workspaces." },
                { key: "userACannotSeeBrandBrains", title: "Brand Brain Isolation", desc: "User A cannot query or edit User B's tone rules/FAQs." },
                { key: "userACannotSeeAgents", title: "AI Agent Isolation", desc: "User A cannot load or configure User B's assistant parameters." },
                { key: "userACannotSeeConversations", title: "Message Log Isolation", desc: "User A cannot access User B's widget chat logs/transcripts." },
                { key: "userACannotSeeWidgetConfigs", title: "Widget Configuration Isolation", desc: "User A cannot read or save User B's widget layout configs." },
              ].map((item) => (
                <label key={item.key} className="flex items-start gap-3 p-2 bg-zinc-900/10 border border-zinc-900/40 hover:bg-zinc-900/20 rounded-lg cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={(rlsChecks as any)[item.key]}
                    onChange={(e) => saveRlsChecks({ ...rlsChecks, [item.key]: e.target.checked })}
                    className="mt-0.5 rounded border-zinc-800 bg-zinc-950 text-purple-600 focus:ring-purple-650"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-zinc-300 block">{item.title}</span>
                    <span className="text-[10px] text-zinc-555 block">{item.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
