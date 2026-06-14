"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/state-context";
import { ChevronDown, Plus, Globe, LogOut, Check, Menu, RefreshCw, Wifi, WifiOff, Database, HardDrive, AlertTriangle } from "lucide-react";
import { Dialog } from "./ui/dialog";

interface TopbarProps {
  onMenuClick: () => void;
}

export const DashboardTopbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { 
    activeWorkspaceId, 
    activeWorkspace, 
    workspaces, 
    setActiveWorkspaceId,
    addClientWorkspace,
    isMockMode,
    toggleMockMode,
    user,
    isSupabaseConfigured,
    logout,
    dbSyncError,
    dbConnectionError,
    shouldUseSupabase,
    isSandboxMode,
    isDatabaseMode,
    isOfflineFallbackActive,
    lastSyncTimestamp,
    refetchData,
  } = useAppState();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  
  // New Workspace form state
  const [wsName, setWsName] = useState("");
  const [wsIndustry, setWsIndustry] = useState("");
  const [wsValue, setWsValue] = useState("1000");

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsName || !wsIndustry) return;
    addClientWorkspace(wsName, wsIndustry, parseFloat(wsValue) || 1000);
    setWsName("");
    setWsIndustry("");
    setWsValue("1000");
    setIsModalOpen(false);
  };

  const handleForceRefetch = async () => {
    setIsRefetching(true);
    try {
      await refetchData();
    } finally {
      setIsRefetching(false);
    }
  };

  // Determine mode badge color
  const getBadgeConfig = () => {
    if (isDatabaseMode) {
      return {
        bgClass: "bg-emerald-950/20",
        textClass: "text-emerald-400",
        borderClass: "border-emerald-900/30",
        dotClass: "bg-emerald-400",
        label: "Database Connected",
      };
    }
    if (isOfflineFallbackActive) {
      return {
        bgClass: "bg-amber-950/20",
        textClass: "text-amber-400",
        borderClass: "border-amber-900/30",
        dotClass: "bg-amber-400",
        label: "Offline Fallback",
      };
    }
    return {
      bgClass: "bg-purple-950/20",
      textClass: "text-purple-400",
      borderClass: "border-purple-900/30",
      dotClass: "bg-purple-400",
      label: "Local Sandbox",
    };
  };

  const badge = getBadgeConfig();

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-zinc-900 bg-zinc-950/40 backdrop-blur-md px-6 z-30 sticky top-0">
        {/* Left: Mobile Toggle & Workspace Switcher */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="rounded-lg p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Workspace Switcher */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 px-3 py-1.5 text-sm font-medium text-zinc-200 transition-colors shadow-sm cursor-pointer"
            >
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              <span className="max-w-[150px] truncate">{activeWorkspace?.clientName || "Select Workspace"}</span>
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            </button>

            {isDropdownOpen && (
              <>
                {/* Overlay Backdrop to close */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-64 origin-top-left rounded-lg border border-zinc-800 bg-zinc-950 p-1.5 shadow-xl z-20 glass-panel">
                  <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Switch Client
                  </p>
                  <div className="mt-1 space-y-0.5">
                    {workspaces.map((ws) => (
                      <button
                        key={ws.id}
                        onClick={() => {
                          setActiveWorkspaceId(ws.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition-colors cursor-pointer ${
                          ws.id === activeWorkspaceId 
                            ? "bg-purple-600/10 text-purple-400" 
                            : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex flex-col truncate">
                          <span>{ws.clientName}</span>
                          <span className="text-[10px] text-zinc-500">{ws.industry}</span>
                        </div>
                        {ws.id === activeWorkspaceId && <Check className="h-4 w-4 text-purple-500" />}
                      </button>
                    ))}
                  </div>

                  <div className="mt-1.5 border-t border-zinc-900 pt-1.5">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsModalOpen(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-semibold text-purple-400 hover:bg-zinc-900 transition-colors cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create New Workspace</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Mode Badge & Telemetry & Profiles */}
        <div className="flex items-center gap-4">
          {/* Mode Visibility Badge — now clickable to open telemetry */}
          <div className="relative">
            <button
              onClick={() => setIsTelemetryOpen(!isTelemetryOpen)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border shadow-inner cursor-pointer transition-all hover:brightness-110 ${badge.bgClass} ${badge.textClass} ${badge.borderClass}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${badge.dotClass} animate-pulse`} />
              <span>{badge.label}</span>
              <ChevronDown className={`h-3 w-3 ml-0.5 transition-transform ${isTelemetryOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Telemetry Popover */}
            {isTelemetryOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsTelemetryOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl border border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl shadow-2xl z-20 overflow-hidden">
                  {/* Header */}
                  <div className={`px-4 py-3 border-b border-zinc-800/50 ${
                    isDatabaseMode
                      ? "bg-gradient-to-r from-emerald-950/30 to-transparent"
                      : isOfflineFallbackActive
                      ? "bg-gradient-to-r from-amber-950/30 to-transparent"
                      : "bg-gradient-to-r from-purple-950/30 to-transparent"
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {isDatabaseMode ? (
                        <Database className="h-4 w-4 text-emerald-400" />
                      ) : isOfflineFallbackActive ? (
                        <WifiOff className="h-4 w-4 text-amber-400" />
                      ) : (
                        <HardDrive className="h-4 w-4 text-purple-400" />
                      )}
                      <span className="text-sm font-semibold text-zinc-200">
                        {isDatabaseMode ? "Database Mode" : isOfflineFallbackActive ? "Offline Fallback Active" : "Local Sandbox Demo"}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      {isDatabaseMode 
                        ? "All data is persisted to your Supabase cloud database." 
                        : isOfflineFallbackActive
                        ? "Database connection lost. Changes saved locally until reconnection."
                        : "Running in demo mode with localStorage. Sign in to enable persistence."}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="px-4 py-3 space-y-2.5">
                    {/* Connection Status */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500 flex items-center gap-1.5">
                        {isDatabaseMode || isOfflineFallbackActive ? (
                          <Wifi className="h-3 w-3" />
                        ) : (
                          <WifiOff className="h-3 w-3" />
                        )}
                        Connection
                      </span>
                      <span className={`font-medium ${isDatabaseMode ? "text-emerald-400" : isOfflineFallbackActive ? "text-amber-400" : "text-zinc-400"}`}>
                        {isDatabaseMode ? "Online" : isOfflineFallbackActive ? "Reconnecting…" : "N/A (Demo)"}
                      </span>
                    </div>

                    {/* Auth Email */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Auth</span>
                      <span className="text-zinc-300 font-mono text-[11px] truncate max-w-[180px]">
                        {user ? user.email : "Not authenticated"}
                      </span>
                    </div>

                    {/* Supabase Config */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Supabase</span>
                      <span className={`font-medium ${isSupabaseConfigured ? "text-emerald-400" : "text-zinc-500"}`}>
                        {isSupabaseConfigured ? "Configured" : "Not configured"}
                      </span>
                    </div>

                    {/* Last Sync */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Last Sync</span>
                      <span className="text-zinc-400 font-mono text-[11px]">
                        {lastSyncTimestamp 
                          ? new Date(lastSyncTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                          : "—"}
                      </span>
                    </div>

                    {/* Sync Error */}
                    {dbSyncError && (
                      <div className="flex items-start gap-2 rounded-lg bg-red-950/20 border border-red-900/30 px-3 py-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-red-400 leading-relaxed break-all">
                          {dbSyncError}
                        </p>
                      </div>
                    )}

                    {/* Connection Error */}
                    {dbConnectionError && (
                      <div className="flex items-start gap-2 rounded-lg bg-amber-950/20 border border-amber-900/30 px-3 py-2">
                        <WifiOff className="h-3.5 w-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-amber-400 leading-relaxed break-all">
                          {dbConnectionError}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  {isDatabaseMode && (
                    <div className="px-4 py-3 border-t border-zinc-800/50">
                      <button
                        onClick={handleForceRefetch}
                        disabled={isRefetching}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/60 border border-zinc-800/50 px-3 py-2 text-xs font-medium text-zinc-300 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
                        {isRefetching ? "Refreshing…" : "Force Refetch"}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Global Connection Stats */}
          <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500 border-l border-zinc-900 pl-4">
            <Globe className="h-3.5 w-3.5 text-zinc-500" />
            <span>OpenAI Sandbox: Active</span>
          </div>

          {/* Profile Avatar / Quick Link */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 p-0.5 shadow-md shadow-purple-500/10 animate-glow">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-950 text-xs font-bold text-zinc-200">
                {user ? user.email?.slice(0, 2).toUpperCase() : "SB"}
              </div>
            </div>
            {user && (
              <button
                onClick={logout}
                className="flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Create Workspace Dialog Modal */}
        <Dialog 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title="Create Client Workspace"
        >
          <form onSubmit={handleCreateWorkspace} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Business / Client Name
              </label>
              <input 
                type="text" 
                placeholder="e.g. Acme Retail, Bloom Salon"
                value={wsName}
                onChange={(e) => setWsName(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Industry Sector
              </label>
              <input 
                type="text" 
                placeholder="e.g. Retail, Real Estate, Beauty"
                value={wsIndustry}
                onChange={(e) => setWsIndustry(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Monthly SLA Value ($)
              </label>
              <input 
                type="number" 
                placeholder="1200"
                value={wsValue}
                onChange={(e) => setWsValue(e.target.value)}
                required
                min="1"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
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
                className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-all cursor-pointer shadow-md shadow-purple-500/10"
              >
                Initialize Workspace
              </button>
            </div>
          </form>
        </Dialog>
      </header>

      {dbConnectionError && (
        <div className="bg-amber-950/60 border-b border-amber-900/40 text-amber-400 px-6 py-2 text-xs flex items-center justify-between z-20 sticky top-16 backdrop-blur-md animate-pulse">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
            <span className="font-semibold">Offline Fallback Active:</span>
            <span>Database connection offline. Changes are saved locally to temporary sandbox storage.</span>
          </div>
          <span className="text-[10px] opacity-75 font-mono break-all hidden sm:inline ml-4">({dbConnectionError})</span>
        </div>
      )}

      {dbSyncError && !dbConnectionError && (
        <div className="bg-red-950/60 border-b border-red-900/40 text-red-400 px-6 py-2 text-xs flex items-center justify-between z-20 sticky top-16 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
            <span className="font-semibold">Sync Alert:</span>
            <span>Failed to sync recent update to cloud database. Retrying...</span>
          </div>
          <span className="text-[10px] opacity-75 font-mono break-all hidden sm:inline ml-4">({dbSyncError})</span>
        </div>
      )}
    </>
  );
};
