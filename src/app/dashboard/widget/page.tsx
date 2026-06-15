"use client";

import React, { useState, useEffect } from "react";
import { useAppState } from "@/context/state-context";
import { Globe, Shield, Paintbrush, Code, Check, Plus, Trash2, Copy } from "lucide-react";

export default function WidgetConfigPage() {
  const {
    activeWorkspaceId,
    activeWorkspace,
    agents,
    widgetConfigs,
    updateWidgetConfig,
  } = useAppState();

  const workspaceAgents = agents.filter((a) => a.linkedBrainId === activeWorkspaceId);
  const activeConfig = widgetConfigs[activeWorkspaceId];

  // Local Form state
  const [enabled, setEnabled] = useState(true);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [greeting, setGreeting] = useState("");
  const [accentColor, setAccentColor] = useState("#10b981");
  const [displayName, setDisplayName] = useState("");
  const [domains, setDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState("");
  
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [originDomain, setOriginDomain] = useState("https://echostaff.ai");

  // Load origin on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOriginDomain(window.location.origin);
    }
  }, []);

  // Sync state with active configuration and workspace changes
  useEffect(() => {
    if (activeConfig) {
      setEnabled(activeConfig.enabled);
      setSelectedAgentId(activeConfig.agentId || (workspaceAgents[0]?.id || ""));
      setGreeting(activeConfig.greeting || "Hello! How can we help you today?");
      setAccentColor(activeConfig.accentColor || "#10b981");
      setDisplayName(activeConfig.displayName || activeWorkspace?.clientName || "AI Assistant");
      setDomains(activeConfig.allowedDomains || []);
    } else {
      // Default fallback if no config exists yet
      setEnabled(true);
      setSelectedAgentId(workspaceAgents[0]?.id || "");
      setGreeting("Hello! How can we help you today?");
      setAccentColor("#10b981");
      setDisplayName(activeWorkspace?.clientName || "AI Assistant");
      setDomains([]);
    }
  }, [activeConfig, activeWorkspaceId, activeWorkspace]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateWidgetConfig({
      enabled,
      agentId: selectedAgentId,
      greeting,
      accentColor,
      displayName,
      allowedDomains: domains,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddDomain = () => {
    if (!newDomain.trim()) return;
    const cleanDomain = newDomain.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "");
    if (cleanDomain && !domains.includes(cleanDomain)) {
      setDomains([...domains, cleanDomain]);
    }
    setNewDomain("");
  };

  const handleRemoveDomain = (index: number) => {
    setDomains(domains.filter((_, idx) => idx !== index));
  };

  // Preset Colors
  const colorPresets = [
    { name: "Emerald", hex: "#10b981" },
    { name: "Purple", hex: "#8b5cf6" },
    { name: "Indigo", hex: "#6366f1" },
    { name: "Rose", hex: "#f43f5e" },
    { name: "Amber", hex: "#f59e0b" },
    { name: "Cyan", hex: "#06b6d4" },
  ];

  const publicKey = activeConfig?.publicKey || "pk_preview_placeholder";
  const embedCode = `<script src="${originDomain}/widget.js" data-echostaff-widget="${publicKey}" async></script>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Preview Iframe URL query builder
  const previewQueryUrl = `/embed/widget/preview?enabled=${enabled}&greeting=${encodeURIComponent(
    greeting
  )}&color=${encodeURIComponent(accentColor)}&name=${encodeURIComponent(
    displayName
  )}&agentId=${selectedAgentId}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-purple-400" />
            <span>Website Widget Integration</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Build and install a customer-facing AI chatbot widget on your own website.
          </p>
        </div>

        {saved && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
            <Check className="h-3.5 w-3.5" />
            <span>Settings Saved</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Configurations Panel (7 Cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Activation and Routing */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple-400" />
              <span>Status & Routing</span>
            </h3>

            <div className="flex items-center justify-between p-3.5 bg-zinc-900/25 border border-zinc-900 rounded-lg">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-350 block">Enable Website Widget</span>
                <span className="text-[10px] text-zinc-500 block">
                  Activate to load the chat bubble on external host websites.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 peer-checked:after:bg-white"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-450 mb-1.5">
                  Business Display Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full text-xs rounded-lg border border-zinc-900 bg-zinc-900/40 px-3 py-2.5 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-650"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-450 mb-1.5">
                  Assigned Staff / Agent
                </label>
                {workspaceAgents.length === 0 ? (
                  <div className="text-xs text-rose-400 py-2.5">
                    No agents created yet. Please add an agent first.
                  </div>
                ) : (
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="w-full text-xs rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2.5 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-650"
                  >
                    {workspaceAgents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.role})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-450 mb-1.5">
                Widget Greeting Message
              </label>
              <textarea
                required
                rows={3}
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                placeholder="Ex: Hello! Welcome. How can I help you today?"
                className="w-full text-xs rounded-lg border border-zinc-900 bg-zinc-900/40 px-3 py-2.5 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-655"
              />
            </div>
          </div>

          {/* Section 2: Branding & Color */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-2">
              <Paintbrush className="h-4 w-4 text-purple-400" />
              <span>Accent Color Branding</span>
            </h3>

            <div className="flex flex-wrap gap-2.5 items-center">
              {colorPresets.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => setAccentColor(preset.hex)}
                  style={{ backgroundColor: preset.hex }}
                  className={`h-7 w-7 rounded-full transition-transform active:scale-90 relative cursor-pointer ${
                    accentColor.toLowerCase() === preset.hex.toLowerCase() 
                      ? "scale-110 ring-2 ring-white" 
                      : "opacity-85 hover:opacity-100"
                  }`}
                  title={preset.name}
                >
                  {accentColor.toLowerCase() === preset.hex.toLowerCase() && (
                    <Check className="h-4.5 w-4.5 text-white absolute inset-0 m-auto" />
                  )}
                </button>
              ))}

              <div className="h-7 border-l border-zinc-800 mx-1.5" />

              {/* Custom hex input */}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-8 w-8 rounded-lg border border-zinc-900 bg-zinc-950 p-0.5 cursor-pointer"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  placeholder="#10b981"
                  className="w-20 text-[11px] font-mono rounded-lg border border-zinc-900 bg-zinc-900/40 px-2 py-1 text-zinc-350 focus:outline-none focus:border-zinc-800"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Allowed Domains */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-400" />
              <span>Security & Domains restriction</span>
            </h3>
            
            <p className="text-[10px] text-zinc-550 leading-relaxed">
              Limit embedding to specific domains to prevent unauthorized hosts from loading your widget. Leave blank to authorize all domains.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddDomain();
                  }
                }}
                className="flex-1 text-xs rounded-lg border border-zinc-900 bg-zinc-900/40 px-3 py-2 text-zinc-200 placeholder:text-zinc-650 focus:outline-none focus:border-zinc-800"
              />
              <button
                type="button"
                onClick={handleAddDomain}
                className="rounded-lg bg-purple-650 hover:bg-purple-600 px-3.5 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {domains.length === 0 ? (
                <span className="text-xs text-zinc-600 italic">No domain limits specified. Widget will load on any domain.</span>
              ) : (
                domains.map((dom, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1 rounded bg-zinc-900 border border-zinc-850 px-2 py-1 text-[11px] text-zinc-350"
                  >
                    <span>{dom}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDomain(idx)}
                      className="text-zinc-550 hover:text-rose-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Section 4: Copy Snippet code */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Code className="h-4 w-4 text-purple-400" />
                <span>Embed Snippet Code</span>
              </h3>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-850 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900/90 px-2.5 py-1.5 text-[10px] font-bold text-zinc-455 transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <p className="text-[10px] text-zinc-550 leading-relaxed">
              Add this lightweight script tag right before the closing <code className="text-zinc-400 font-mono">&lt;/body&gt;</code> tag of your website HTML document.
            </p>

            <div className="relative">
              <pre className="text-[10px] font-mono leading-normal p-3 rounded-lg bg-black border border-zinc-900 overflow-x-auto text-purple-300">
                {embedCode}
              </pre>
            </div>

            {publicKey === "pk_preview_placeholder" && (
              <div className="rounded-lg border border-amber-950/30 bg-amber-955/5 p-3 text-[10px] text-amber-500 leading-relaxed">
                <strong>Attention:</strong> Your widget is running in sandbox preview mode. Real external website embedding requires active cloud database configuration.
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-550 hover:to-indigo-550 py-3 text-xs font-bold text-white shadow-lg shadow-purple-500/10 transition-all cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>Save Configuration Settings</span>
          </button>
        </form>

        {/* Right Live Preview Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-450">
              Live Mockup Preview
            </span>
            <span className="text-[10px] text-zinc-550 italic">
              Updates instantly as you type
            </span>
          </div>

          <div className="relative border border-zinc-900 rounded-2xl bg-zinc-950 overflow-hidden shadow-2xl h-[580px] flex flex-col">
            {/* Mock website header */}
            <div className="px-4 py-2 border-b border-zinc-900 bg-zinc-900/20 flex justify-between items-center text-[10px] text-zinc-650">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <div className="rounded bg-zinc-900/60 border border-zinc-900 px-3 py-0.5 text-center font-mono w-48 truncate">
                mywebsite.com
              </div>
              <div className="w-8" />
            </div>

            {/* Mock webpage content */}
            <div className="flex-1 p-6 space-y-4 font-sans text-zinc-600 text-xs">
              <h2 className="text-zinc-400 font-bold text-sm">Welcome to Our Website</h2>
              <p className="leading-relaxed">
                This is a mock page illustrating how the EchoStaff AI chat bubble is injected. The float bubble loads dynamically at the bottom-right corner.
              </p>
              <div className="h-20 bg-zinc-900/10 border border-dashed border-zinc-900 rounded-lg flex items-center justify-center text-[10px] text-zinc-700 uppercase font-semibold">
                Main Page Canvas Layout
              </div>
              <p className="leading-relaxed text-[11px]">
                Click the chat bubble in the bottom right corner to open and test the chat assistant config in real-time.
              </p>
            </div>

            {/* Embedded Live Preview Iframe */}
            <iframe
              key={previewQueryUrl} // force reload on config change
              src={previewQueryUrl}
              className="absolute inset-0 top-[29px] w-full h-[calc(100%-29px)] border-none bg-transparent"
              title="Website Chat Widget Preview Frame"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
