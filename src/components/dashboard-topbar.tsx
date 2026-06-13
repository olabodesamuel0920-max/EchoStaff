"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/state-context";
import { ChevronDown, Plus, Globe, Settings, LogOut, Check, Menu } from "lucide-react";
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
    toggleMockMode
  } = useAppState();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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

  return (
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

      {/* Right: API Mode Switcher & Profiles */}
      <div className="flex items-center gap-4">
        {/* Mock Status Toggler */}
        <button 
          onClick={toggleMockMode}
          className={`hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all shadow-inner border border-purple-900/30 cursor-pointer ${
            isMockMode 
              ? "bg-purple-950/20 text-purple-400 hover:bg-purple-900/20" 
              : "bg-emerald-950/20 text-emerald-400 border-emerald-900/30 hover:bg-emerald-900/20"
          }`}
          title="Click to toggle sandbox/database mode"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isMockMode ? "bg-purple-400" : "bg-emerald-400"} animate-pulse-ring`} />
          <span>{isMockMode ? "Mock Mode" : "Supabase Ready"}</span>
        </button>

        {/* Global Connection Stats */}
        <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500 border-l border-zinc-900 pl-4">
          <Globe className="h-3.5 w-3.5 text-zinc-500" />
          <span>OpenAI Sandbox: Active</span>
        </div>

        {/* Profile Avatar / Quick Link */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 p-0.5 shadow-md shadow-purple-500/10">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-950 text-xs font-bold text-zinc-200">
              AD
            </div>
          </div>
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
  );
};
