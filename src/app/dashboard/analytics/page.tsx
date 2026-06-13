"use client";

import React from "react";
import { useAppState } from "@/context/state-context";
import { BarChart3, TrendingUp, HelpCircle, FileText, AlertTriangle, Users } from "lucide-react";

export default function AnalyticsPage() {
  const { 
    activeWorkspaceId, 
    activeWorkspace, 
    conversations, 
    trainingItems,
    brandBrains
  } = useAppState();

  const workspaceConvs = conversations[activeWorkspaceId] || [];
  const workspaceTraining = trainingItems[activeWorkspaceId] || [];
  const brainFAQs = brandBrains[activeWorkspaceId]?.faqs || [];

  // Compute metrics
  const totalConvsCount = activeWorkspace?.volume || 0;
  const hotLeads = workspaceConvs.filter(c => c.leadStatus === "Hot" || c.leadStatus === "Warm");
  const conversionRate = totalConvsCount > 0 ? Math.round((hotLeads.length / totalConvsCount) * 100) : 18;

  // Mock list calculations based on active workspace
  const isAesthetics = activeWorkspaceId === "luna-aesthetics";

  const baseQuestions = isAesthetics 
    ? [
        { q: "Botox injection pain and recovery times", count: 42, trend: "+12%" },
        { q: "Hydrafacial sensitive skin compatibility", count: 28, trend: "+8%" },
        { q: "Consultation pricing and deductibility rules", count: 25, trend: "+15%" },
        { q: "Lip filler swelling duration", count: 18, trend: "-3%" }
      ]
    : [
        { q: "NetSuite and QuickBooks integration pricing", count: 85, trend: "+25%" },
        { q: "Apex Professional terminal pricing volume deals", count: 64, trend: "+18%" },
        { q: "Onboarding SLA times for Enterprise dispatchers", count: 40, trend: "+5%" },
        { q: "Routing engine deadhead mile calculations", count: 32, trend: "+12%" }
      ];

  // Map real FAQs from state context
  const faqQuestions = brainFAQs.map((faq, idx) => ({
    q: faq.question,
    count: 24 - idx * 2 > 0 ? 24 - idx * 2 : 5,
    trend: idx % 2 === 0 ? "+14%" : "+4%"
  }));

  const topQuestions = [...faqQuestions, ...baseQuestions].slice(0, 5);

  const commonObjections = isAesthetics
    ? [
        { obj: "Pricing of Dermal Fillers ($650/syringe)", friction: "High", count: 15 },
        { obj: "$50 Consultation fee restriction", friction: "Medium", count: 12 },
        { obj: "24-hour cancellation fee penalties", friction: "Low", count: 8 }
      ]
    : [
        { obj: "Terminal licensing fee totals ($249/terminal)", friction: "High", count: 35 },
        { obj: "Starter tier lack of NetSuite integration", friction: "Medium", count: 24 },
        { obj: "48-hour onboarding deployment delays", friction: "Low", count: 10 }
      ];

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
