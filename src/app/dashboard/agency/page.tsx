"use client";

import React, { useState } from "react";
import { useAppState } from "@/context/state-context";
import { Building2, Plus, DollarSign, UserCheck, MessageSquare, GraduationCap, Check } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";

export default function AgencyDashboardPage() {
  const { workspaces, addClientWorkspace, setActiveWorkspaceId } = useAppState();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form states
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [value, setValue] = useState("1000");
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !industry) return;

    addClientWorkspace(name, industry, parseFloat(value) || 1000);
    setName("");
    setIndustry("");
    setValue("1000");
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setIsModalOpen(false);
    }, 1200);
  };

  // Calculate high-level stats
  const totalClientsCount = workspaces.length;
  const totalMRR = workspaces.reduce((acc, curr) => acc + curr.value, 0);
  const totalVolume = workspaces.reduce((acc, curr) => acc + curr.volume, 0);

  return (
    <div className="space-y-8">
      {/* Header and global agency stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-400" />
            <span>Conversational Agency Console</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage multi-tenant client databases, assign AI staff, and audit throughput logs.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-md shadow-purple-500/15 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Provision Client Workspace</span>
        </button>
      </div>

      {/* Agency KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Managed Workspaces</span>
          <span className="text-2xl font-extrabold text-white block mt-2">{totalClientsCount} clients</span>
          <span className="text-[10px] text-zinc-500 mt-1 block">Active tenant databases</span>
        </div>

        <div className="glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Combined Volume</span>
          <span className="text-2xl font-extrabold text-white block mt-2">{totalVolume} messages</span>
          <span className="text-[10px] text-zinc-500 mt-1 block">SLA message capacity limits</span>
        </div>

        <div className="glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Combined Agency MRR</span>
          <span className="text-2xl font-extrabold text-white block mt-2">${totalMRR} / mo</span>
          <span className="text-[10px] text-purple-400 font-semibold mt-1 block">White-label value capture</span>
        </div>
      </div>

      {/* Clients list grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((ws) => (
          <div 
            key={ws.id}
            className="glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4 hover:border-zinc-800/80 transition-colors"
          >
            {/* Upper half metadata */}
            <div className="space-y-1">
              <div className="flex justify-between items-start">
                <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500">{ws.industry}</span>
                <span className="text-xs font-bold text-purple-400">${ws.value}/mo</span>
              </div>
              <h3 className="text-base font-bold text-zinc-200">{ws.clientName}</h3>
            </div>

            {/* Middle half progress/stats */}
            <div className="space-y-3 pt-2">
              {/* Stats values */}
              <div className="grid grid-cols-3 gap-2 border-y border-zinc-900 py-3 text-center text-xs">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 block font-semibold">Agents</span>
                  <span className="text-xs font-bold text-zinc-300 block mt-1 flex items-center justify-center gap-1">
                    <UserCheck className="h-3.5 w-3.5 text-purple-500" />
                    {ws.agentsCount}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 block font-semibold">Volume</span>
                  <span className="text-xs font-bold text-zinc-300 block mt-1 flex items-center justify-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
                    {ws.volume}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 block font-semibold">Accuracy</span>
                  <span className="text-xs font-bold text-zinc-300 block mt-1 flex items-center justify-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5 text-emerald-500" />
                    {ws.trainingStatus}%
                  </span>
                </div>
              </div>

              {/* Progress bar accuracy */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-zinc-500 font-semibold">
                  <span>Accuracy Gauge</span>
                  <span>{ws.trainingStatus}%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${ws.trainingStatus}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Active Switcher button */}
            <button
              onClick={() => {
                setActiveWorkspaceId(ws.id);
                // Redirect user to dashboard overview for this client
                window.location.href = "/dashboard";
              }}
              className="w-full rounded-lg border border-zinc-850 hover:bg-zinc-900 text-center py-2 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
            >
              Configure Workspace
            </button>
          </div>
        ))}
      </div>

      {/* Provision Client Dialog */}
      <Dialog 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Provision Client Workspace"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {saved && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Check className="h-4 w-4" />
              <span>Workspace provisioned! Redirecting...</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Client / Business Name
            </label>
            <input 
              type="text" 
              placeholder="e.g. Luna Aesthetics, Acme Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Industry Category
            </label>
            <input 
              type="text" 
              placeholder="e.g. Healthcare, Real Estate, E-commerce"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Monthly SLA Value ($)
            </label>
            <input 
              type="number" 
              placeholder="1200"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
              min="1"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-600"
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
              className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2 text-xs font-semibold text-white transition-all shadow-md shadow-purple-500/10 cursor-pointer"
            >
              Provision Client
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
