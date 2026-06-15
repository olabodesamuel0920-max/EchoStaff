"use client";

import React from "react";
import { useAppState } from "@/context/state-context";
import { BarChart3, TrendingUp, HelpCircle, FileText, AlertTriangle, Users, Globe } from "lucide-react";

export default function AnalyticsPage() {
  const { 
    activeWorkspaceId, 
    activeWorkspace, 
    conversations, 
    trainingItems,
    brandBrains,
    widgetConfigs
  } = useAppState();

  const workspaceConvs = conversations[activeWorkspaceId] || [];
  const workspaceTraining = trainingItems[activeWorkspaceId] || [];
  const brainFAQs = brandBrains[activeWorkspaceId]?.faqs || [];

  // Compute metrics
  const totalConvsCount = activeWorkspace?.volume || 0;
  const hotLeads = workspaceConvs.filter(c => c.leadStatus === "Hot" || c.leadStatus === "Warm");
  const conversionRate = totalConvsCount > 0 ? Math.round((hotLeads.length / totalConvsCount) * 100) : 18;

  // Widget Metrics
  const widgetConvs = workspaceConvs.filter(c => c.channel === "Website Widget");
  const widgetVolume = widgetConvs.length;
  const widgetHotLeads = widgetConvs.filter(c => c.leadStatus === "Hot" || c.leadStatus === "Warm");
  const widgetFollowUpRate = widgetConvs.length > 0 ? Math.round((widgetConvs.filter(c => c.needsFollowUp).length / widgetConvs.length) * 100) : 0;
  const activeConfig = brandBrains[activeWorkspaceId] ? widgetConfigs[activeWorkspaceId] : null;

  // Dynamically extract intents and objections from real conversation history
  const realIntents: { q: string; count: number; trend: string }[] = [];
  const realObjections: { obj: string; friction: "High" | "Medium" | "Low"; count: number }[] = [];

  workspaceConvs.forEach(conv => {
    const textLower = (conv.summary + " " + conv.messages.map(m => m.text).join(" ")).toLowerCase();
    
    // Objections analysis
    if (textLower.includes("price") || textLower.includes("cost") || textLower.includes("charge") || textLower.includes("fee") || textLower.includes("deposit") || textLower.includes("expensive")) {
      let objName = "Pricing Inquiry / Deposit Objection";
      if (activeWorkspaceId === "luna-aesthetics") objName = "Pricing of Dermal Fillers ($650/syringe)";
      else if (activeWorkspaceId === "eka-kitchen") objName = "50% non-refundable event deposit upfront fee";
      else if (activeWorkspaceId === "apex-saas") objName = "Terminal licensing fee totals ($249/terminal)";
      else if (activeWorkspaceId === "horizon-travel") objName = "Private jet positioning fee charges";
      
      const existing = realObjections.find(o => o.obj === objName);
      if (existing) {
        existing.count += 1;
      } else {
        realObjections.push({ obj: objName, friction: "High", count: 1 });
      }
    }
    
    if (textLower.includes("cancellation") || textLower.includes("cancel") || textLower.includes("refund") || textLower.includes("late")) {
      let objName = "Cancellation & Refund Queries";
      if (activeWorkspaceId === "luna-aesthetics") objName = "24-hour cancellation fee penalties";
      else if (activeWorkspaceId === "eka-kitchen") objName = "72-hour Catering Cancellation Refund Policies";
      else if (activeWorkspaceId === "horizon-travel") objName = "Last minute villa cancellation restrictions";
      
      const existing = realObjections.find(o => o.obj === objName);
      if (existing) {
        existing.count += 1;
      } else {
        realObjections.push({ obj: objName, friction: "Medium", count: 1 });
      }
    }

    // Intents extraction
    conv.messages.forEach(msg => {
      if (msg.sender === "user") {
        const txt = msg.text;
        if (txt.length > 15 && txt.length < 80 && (txt.includes("?") || txt.includes("how") || txt.includes("what") || txt.includes("does") || txt.includes("can"))) {
          const cleanQ = txt.replace(/[?.!,]/g, "").trim();
          const existing = realIntents.find(i => i.q.toLowerCase() === cleanQ.toLowerCase());
          if (existing) {
            existing.count += 1;
          } else {
            realIntents.push({ q: cleanQ, count: 1, trend: "+12%" });
          }
        }
      }
    });
  });

  realObjections.sort((a, b) => b.count - a.count);
  realIntents.sort((a, b) => b.count - a.count);

  // Fallbacks for base questions (localized/realistic)
  const aestheticsBase = [
    { q: "Botox injection pain and recovery times", count: 42, trend: "+12%" },
    { q: "Hydrafacial sensitive skin compatibility", count: 28, trend: "+8%" },
    { q: "Consultation pricing and deductibility rules", count: 25, trend: "+15%" },
    { q: "Lip filler swelling duration", count: 18, trend: "-3%" }
  ];

  const kitchenBase = [
    { q: "Corporate Jollof lunch delivery menu and minimum orders", count: 38, trend: "+15%" },
    { q: "Bespoke event catering 50% deposit negotiation", count: 24, trend: "+10%" },
    { q: "Private Chef dining menu customization options", count: 18, trend: "+5%" },
    { q: "Gluten-free modern West African dish alternatives", count: 12, trend: "+2%" }
  ];

  const saasBase = [
    { q: "NetSuite and QuickBooks integration pricing", count: 85, trend: "+25%" },
    { q: "Apex Professional terminal pricing volume deals", count: 64, trend: "+18%" },
    { q: "Onboarding SLA times for Enterprise dispatchers", count: 40, trend: "+5%" },
    { q: "Routing engine deadhead mile calculations", count: 32, trend: "+12%" }
  ];

  const travelBase = [
    { q: "Private jet charter empty leg availability and pricing", count: 30, trend: "+10%" },
    { q: "Elite membership global airport VIP lounge escorts", count: 22, trend: "+14%" },
    { q: "Bespoke itinerary planning fees deductibility", count: 15, trend: "+5%" },
    { q: "Villa bookings and cancellation refund policies", count: 10, trend: "+2%" }
  ];

  const baseQuestions = activeWorkspaceId === "luna-aesthetics" ? aestheticsBase
                      : activeWorkspaceId === "eka-kitchen" ? kitchenBase
                      : activeWorkspaceId === "horizon-travel" ? travelBase
                      : saasBase;

  // Merge real intents with seed fallbacks
  const mergedIntents = [...realIntents];
  baseQuestions.forEach(seed => {
    if (!mergedIntents.some(i => i.q.toLowerCase() === seed.q.toLowerCase())) {
      mergedIntents.push(seed);
    }
  });

  // Map real FAQs from state context
  const faqQuestions = brainFAQs.map((faq, idx) => ({
    q: faq.question,
    count: 24 - idx * 2 > 0 ? 24 - idx * 2 : 5,
    trend: idx % 2 === 0 ? "+14%" : "+4%"
  }));

  const topQuestions = [...faqQuestions, ...mergedIntents].slice(0, 5);

  // Objections Fallbacks
  const aestheticsObjections = [
    { obj: "Pricing of Dermal Fillers ($650/syringe)", friction: "High" as const, count: 15 },
    { obj: "$50 Consultation fee restriction", friction: "Medium" as const, count: 12 },
    { obj: "24-hour cancellation fee penalties", friction: "Low" as const, count: 8 }
  ];

  const kitchenObjections = [
    { obj: "50% non-refundable event deposit upfront fee", friction: "High" as const, count: 18 },
    { obj: "Victoria Island/Lekki flat delivery zone restrictions", friction: "Medium" as const, count: 12 },
    { obj: "Spice level adjustments for non-traditional guests", friction: "Low" as const, count: 6 }
  ];

  const saasObjections = [
    { obj: "Terminal licensing fee totals ($249/terminal)", friction: "High" as const, count: 35 },
    { obj: "Starter tier lack of NetSuite integration", friction: "Medium" as const, count: 24 },
    { obj: "48-hour onboarding deployment delays", friction: "Low" as const, count: 10 }
  ];

  const travelObjections = [
    { obj: "Private jet positioning fee charges", friction: "High" as const, count: 14 },
    { obj: "Bespoke planning fee non-refundability policy", friction: "Medium" as const, count: 10 },
    { obj: "Last minute villa cancellation restrictions", friction: "Low" as const, count: 5 }
  ];

  const baseObjections = activeWorkspaceId === "luna-aesthetics" ? aestheticsObjections
                       : activeWorkspaceId === "eka-kitchen" ? kitchenObjections
                       : activeWorkspaceId === "horizon-travel" ? travelObjections
                       : saasObjections;

  // Merge real objections
  const mergedObjections = [...realObjections];
  baseObjections.forEach(seed => {
    if (!mergedObjections.some(o => o.obj.toLowerCase() === seed.obj.toLowerCase())) {
      mergedObjections.push(seed);
    }
  });

  const commonObjections = mergedObjections.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-400" />
            <span>Operational Analytics</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Analyze customer intents, objection nodes, and conversion analytics.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Total Chat Volume</span>
          <span className="text-2xl font-extrabold text-white block mt-2">{totalConvsCount} sessions</span>
          <span className="text-[10px] text-zinc-500 mt-1 block">Live API & Widget queries</span>
        </div>

        <div className="glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Lead Conversion Rate</span>
          <span className="text-2xl font-extrabold text-white block mt-2">{conversionRate}%</span>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-1">
            <TrendingUp className="h-3 w-3" />
            +4.2% from last week
          </span>
        </div>

        <div className="glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Outstanding Audit Flags</span>
          <span className="text-2xl font-extrabold text-white block mt-2">{workspaceTraining.length} gaps</span>
          <span className="text-[10px] text-zinc-500 mt-1 block">Requires manual feedback</span>
        </div>
      </div>

      {/* Channel Distribution & Widget KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Channel Volume Share */}
        <div className="md:col-span-5 glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Globe className="h-4.5 w-4.5 text-purple-400" />
            <span>Channel Volume Share</span>
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                <span>Website Widget</span>
                <span className="font-semibold text-zinc-200">
                  {widgetVolume} / {workspaceConvs.length} ({workspaceConvs.length > 0 ? Math.round((widgetVolume / workspaceConvs.length) * 100) : 0}%)
                </span>
              </div>
              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${workspaceConvs.length > 0 ? (widgetVolume / workspaceConvs.length) * 100 : 0}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500" 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                <span>Playground / Web Chat</span>
                <span className="font-semibold text-zinc-200">
                  {workspaceConvs.filter(c => c.channel === "Web chat" || c.channel === "Playground").length} / {workspaceConvs.length}
                </span>
              </div>
              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${workspaceConvs.length > 0 ? (workspaceConvs.filter(c => c.channel === "Web chat" || c.channel === "Playground").length / workspaceConvs.length) * 100 : 0}%` }}
                  className="h-full bg-zinc-700" 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                <span>Call Lab Simulations</span>
                <span className="font-semibold text-zinc-200">
                  {workspaceConvs.filter(c => c.channel === "Call Simulation" || c.channel === "Call Lab").length} / {workspaceConvs.length}
                </span>
              </div>
              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${workspaceConvs.length > 0 ? (workspaceConvs.filter(c => c.channel === "Call Simulation" || c.channel === "Call Lab").length / workspaceConvs.length) * 100 : 0}%` }}
                  className="h-full bg-zinc-850" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Website Widget Metrics */}
        <div className="md:col-span-7 glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Globe className="h-4.5 w-4.5 text-purple-400" />
            <span>Website Widget Active Metrics</span>
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-900/20 border border-zinc-900 p-3.5 rounded-lg text-center space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">Widget Volume</span>
              <span className="text-xl font-bold text-white block">{widgetVolume} chats</span>
            </div>
            <div className="bg-zinc-900/20 border border-zinc-900 p-3.5 rounded-lg text-center space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">Widget Hot Leads</span>
              <span className="text-xl font-bold text-amber-400 block">{widgetHotLeads.length} leads</span>
            </div>
            <div className="bg-zinc-900/20 border border-zinc-900 p-3.5 rounded-lg text-center space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase font-semibold">Follow-up Rate</span>
              <span className="text-xl font-bold text-purple-450 block">{widgetFollowUpRate}%</span>
            </div>
          </div>
          <div className="text-[10px] text-zinc-650 bg-zinc-900/10 p-2.5 rounded border border-zinc-900 flex justify-between">
            <span>External domains allowed: {activeConfig?.allowedDomains?.length || 0}</span>
            <span>Widget status: <strong className={activeConfig?.enabled ? "text-emerald-400" : "text-zinc-500"}>{activeConfig?.enabled ? "Active" : "Disabled"}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most asked intents */}
        <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <HelpCircle className="h-4.5 w-4.5 text-purple-400" />
            <span>Top Customer Intent Areas</span>
          </h3>

          <div className="space-y-3">
            {topQuestions.map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-3.5 rounded-lg bg-zinc-900/20 border border-zinc-900/60 text-xs"
              >
                <span className="text-zinc-300 font-medium max-w-[70%] truncate">{item.q}</span>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-400">{item.count} hits</span>
                  <span className={`font-bold ${item.trend.startsWith("+") ? "text-emerald-400" : "text-zinc-500"}`}>
                    {item.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Objections Node */}
        <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-purple-400" />
            <span>Objection & Friction Audits</span>
          </h3>

          <div className="space-y-3">
            {commonObjections.map((item, idx) => (
              <div 
                key={idx} 
                className="flex justify-between items-center p-3.5 rounded-lg bg-zinc-900/20 border border-zinc-900/60 text-xs"
              >
                <div className="space-y-1">
                  <span className="text-zinc-300 block font-medium">{item.obj}</span>
                  <span className="text-[10px] text-zinc-500">{item.count} sessions qualified</span>
                </div>

                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                  item.friction === "High" 
                    ? "bg-rose-500/10 border border-rose-500/20 text-rose-400" 
                    : item.friction === "Medium"
                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                    : "bg-zinc-800 text-zinc-400 border border-zinc-850"
                }`}>
                  {item.friction} Friction
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Conversion opportunities */}
      <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <Users className="h-4.5 w-4.5 text-purple-400" />
          <span>Active Opportunities</span>
        </h3>
        
        {hotLeads.length === 0 ? (
          <p className="text-xs text-zinc-500 italic py-4">No active conversion leads qualified in logs.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hotLeads.map((lead) => (
              <div key={lead.id} className="rounded-lg bg-zinc-900/25 border border-zinc-900 p-4 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <strong className="text-zinc-200">{lead.customerName}</strong>
                  <span className="rounded bg-purple-500/15 text-purple-400 border border-purple-500/20 px-2 py-0.5 text-[9px]">
                    {lead.channel}
                  </span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed line-clamp-2">
                  Summary: {lead.summary}
                </p>
                <div className="pt-2 border-t border-zinc-900 flex justify-between text-[10px] text-zinc-500">
                  <span>Sentiment: {lead.sentiment}</span>
                  <span className="text-amber-400 font-semibold uppercase tracking-wider">Awaiting contact</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
