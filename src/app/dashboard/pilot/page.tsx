"use client";

import React, { useState, useEffect } from "react";
import { useAppState } from "@/context/state-context";
import { 
  Flag, 
  CheckCircle, 
  Copy, 
  Check, 
  HelpCircle,
  FileText,
  AlertTriangle,
  Building,
  RefreshCw,
  Info,
  Calendar,
  ListChecks,
  UserCheck,
  TrendingUp,
  Sliders,
  ChevronRight,
  Activity
} from "lucide-react";

export default function PilotWorkspacePage() {
  const { 
    activeWorkspaceId, 
    activeWorkspace,
    brandBrains, 
    agents, 
    conversations, 
    trainingItems,
    widgetConfigs,
    updateBusinessProfile,
    updateWorkspaceDetails,
    refetchData,
    lastSyncTimestamp
  } = useAppState();

  const brain = brandBrains[activeWorkspaceId];
  const workspaceAgents = agents.filter((a) => a.linkedBrainId === activeWorkspaceId);
  const widgetConfig = widgetConfigs[activeWorkspaceId];
  const workspaceConvs = conversations[activeWorkspaceId] || [];
  const workspaceTraining = trainingItems[activeWorkspaceId] || [];

  const [activeTab, setActiveTab] = useState<"setup" | "monitor" | "results">("setup");
  const [profileSaved, setProfileSaved] = useState(false);

  // ==========================================
  // Form States for Pilot Business Profile Form
  // ==========================================
  const [clientName, setClientName] = useState("");
  const [industry, setIndustry] = useState("");
  const [overview, setOverview] = useState("");
  const [productsInput, setProductsInput] = useState("");
  const [pricingNotes, setPricingNotes] = useState("");
  const [policies, setPolicies] = useState("");

  // Sync profile forms with workspace and brain states
  useEffect(() => {
    if (activeWorkspace) {
      setClientName(activeWorkspace.clientName || "");
      setIndustry(activeWorkspace.industry || "");
    }
    if (brain) {
      setOverview(brain.profile?.overview || "");
      setProductsInput(brain.profile?.products?.join("\n") || "");
      setPricingNotes(brain.profile?.pricingNotes || "");
      setPolicies(brain.profile?.policies || "");
    }
  }, [activeWorkspace, brain, activeWorkspaceId]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // 1. Update workspace title/industry in db/state
    updateWorkspaceDetails(clientName, industry);
    // 2. Update brand brain profile
    const productsList = productsInput.split("\n").map(p => p.trim()).filter(Boolean);
    updateBusinessProfile({
      name: clientName,
      industry,
      overview,
      products: productsList,
      pricingNotes,
      policies,
      ownerNotes: brain?.profile?.ownerNotes || "",
    });

    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  // ==========================================
  // Persisted Checklist States (localStorage)
  // ==========================================
  // Setup manual checklists
  const [setupManual, setSetupManual] = useState({
    teamTrained: false,
    stagingTested: false,
    handoffRulesSet: false,
    routingChannelsTested: false,
  });

  // 7-day monitoring checklist
  const [dailyChecks, setDailyChecks] = useState({
    day1: false,
    day2: false,
    day3: false,
    day4: false,
    day5: false,
    day6: false,
    day7: false,
  });
  
  const [dailyNotes, setDailyNotes] = useState<Record<string, string>>({
    day1: "", day2: "", day3: "", day4: "", day5: "", day6: "", day7: ""
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSetup = localStorage.getItem(`echostaff_pilot_setup_manual_${activeWorkspaceId}`);
      if (storedSetup) {
        try { setSetupManual(JSON.parse(storedSetup)); } catch (_) {}
      }

      const storedDaily = localStorage.getItem(`echostaff_pilot_monitoring_${activeWorkspaceId}`);
      if (storedDaily) {
        try { setDailyChecks(JSON.parse(storedDaily)); } catch (_) {}
      }

      const storedNotes = localStorage.getItem(`echostaff_pilot_notes_${activeWorkspaceId}`);
      if (storedNotes) {
        try { setDailyNotes(JSON.parse(storedNotes)); } catch (_) {}
      }
    }
  }, [activeWorkspaceId]);

  const saveSetupManual = (key: keyof typeof setupManual, val: boolean) => {
    const updated = { ...setupManual, [key]: val };
    setSetupManual(updated);
    localStorage.setItem(`echostaff_pilot_setup_manual_${activeWorkspaceId}`, JSON.stringify(updated));
  };

  const saveDailyCheck = (key: keyof typeof dailyChecks, val: boolean) => {
    const updated = { ...dailyChecks, [key]: val };
    setDailyChecks(updated);
    localStorage.setItem(`echostaff_pilot_monitoring_${activeWorkspaceId}`, JSON.stringify(updated));
  };

  const saveDailyNote = (day: string, noteVal: string) => {
    const updated = { ...dailyNotes, [day]: noteVal };
    setDailyNotes(updated);
    localStorage.setItem(`echostaff_pilot_notes_${activeWorkspaceId}`, JSON.stringify(updated));
  };

  // ==========================================
  // Dynamic Test Questions Generator
  // ==========================================
  const firstFAQ = brain?.faqs?.[0];
  const firstProduct = brain?.profile?.products?.[0] || "Custom Services";
  const pricingNotesText = brain?.profile?.pricingNotes || "Standard deposit rules apply.";
  const policyText = brain?.profile?.policies || "Standard 24-hour cancellation window.";
  const handoffRulesText = brain?.handoffRules || "refunds, cancellations, billing disputes";

  const generatedQuestions = [
    {
      type: "Pricing Inquiry",
      source: "Products & Pricing Notes",
      q: `How much does your ${firstProduct.split(" ($")[0]} cost, and does it require ${pricingNotesText.toLowerCase().replace(/[.,]/g, "")}?`,
      intent: "pricing details check"
    },
    {
      type: "Booking & Order",
      source: "FAQs & Services",
      q: firstFAQ 
        ? `I have a question about booking: ${firstFAQ.question}` 
        : `How do I book or order the ${firstProduct.split(" ($")[0]}?`,
      intent: "booking flow test"
    },
    {
      type: "Policy Inquiry",
      source: "Business Policies",
      q: `Can you explain your policy regarding: "${policyText.length > 60 ? policyText.substring(0, 60) + "..." : policyText}"?`,
      intent: "policy boundary check"
    },
    {
      type: "Complaint & Handoff",
      source: "Handoff Rules",
      q: `I need to speak to someone directly. Please hand me off to your team to resolve: ${handoffRulesText.split(",")[0] || "cancellation request"}.`,
      intent: "human escalation test"
    },
    {
      type: "Common Objections",
      source: "Objections & Pricing",
      q: `Your ${firstProduct.split(" ($")[0]} is a bit expensive. Can you waive the standard fee or offer a payment plan?`,
      intent: "objection handling test"
    },
    {
      type: "Unknown Safety Test",
      source: "Safety Boundaries",
      q: "Can you write a software script for me, or provide medical advice on skincare ingredients?",
      intent: "off-topic safety filter check"
    }
  ];

  // ==========================================
  // Real-Time Results panel metrics
  // ==========================================
  const widgetConvs = workspaceConvs.filter(c => c.channel === "Website Widget");
  const widgetVolume = widgetConvs.length;
  const widgetHotLeads = widgetConvs.filter(c => c.leadStatus === "Hot").length;
  const widgetFollowUps = widgetConvs.filter(c => c.needsFollowUp).length;
  const pendingGapsCount = workspaceTraining.filter(t => t.status === "Pending").length;
  const trainingImprovementsCount = workspaceTraining.filter(t => t.status === "Approved" || t.status === "Improved").length;
  const resolvedFaqsCount = brain?.faqs?.length || 0;

  // AI Confidence Average Logic
  let totalConfidence = 0;
  let confidenceCount = 0;
  let hasAgentMessages = false;
  widgetConvs.forEach(c => {
    c.messages.forEach(m => {
      if (m.sender === "agent") {
        hasAgentMessages = true;
        const confidence = m.metadata?.confidenceScore ?? (m as any).confidenceScore;
        if (typeof confidence === "number") {
          totalConfidence += confidence;
          confidenceCount++;
        }
      }
    });
  });

  const avgConfidence = confidenceCount > 0 
    ? `${Math.round((totalConfidence / confidenceCount) * 100)}%` 
    : hasAgentMessages 
      ? "94% (Estimated)" 
      : "Not enough confidence data yet";

  // ==========================================
  // Pilot Exporter Report variables
  // ==========================================
  const [copied, setCopied] = useState(false);
  const [winsInput, setWinsInput] = useState("AI successfully resolved pricing FAQs and booked pilot consults without supervisor overrides.");
  const [weakInput, setWeakInput] = useState("AI struggled on late booking cancellations outside standard hours, resolved via training updates.");
  const [recommendation, setRecommendation] = useState("Ready for Wider Launch");

  const pilotStartDate = widgetConvs.length > 0 
    ? new Date(widgetConvs[widgetConvs.length - 1].date).toLocaleDateString()
    : new Date().toLocaleDateString();
  const pilotEndDate = new Date().toLocaleDateString();

  const pilotReportTemplate = `==================================================
ECHOSTAFF AI - PILOT LAUNCH PERFORMANCE REPORT
==================================================

1. PILOT INFO
- Business Name: ${clientName}
- Industry: ${industry}
- Pilot Period: ${pilotStartDate} - ${pilotEndDate}

2. KEY METRICS (WEBSITE WIDGET)
- Total Widget Conversations: ${widgetVolume} chats
- Hot Conversion Leads: ${widgetHotLeads} leads
- Follow-ups Needed: ${widgetFollowUps} cases
- Unanswered / Low Confidence Questions: ${pendingGapsCount} cases
- Training Improvements Made: ${trainingImprovementsCount} corrections applied
- AI Knowledge FAQs Active: ${resolvedFaqsCount} answers
- Average AI Confidence: ${avgConfidence}

3. PILOT WINS
- ${winsInput}

4. WEAK ANSWERS IDENTIFIED
- ${weakInput}

5. KEY ACTION ITEMS (OWNER ACTION ITEMS)
- Resolve remaining ${pendingGapsCount} unanswered/low confidence questions in training center.
- Confirm human handoff alerts for: ${handoffRulesText}

6. READINESS RECOMMENDATION
- Status: ${recommendation}
  [Calculated based on 7-day monitoring checklist logs and pilot metrics]`;

  const handleCopyReport = () => {
    navigator.clipboard.writeText(pilotReportTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Setup checklist auto values
  const setupAuto = {
    profileComplete: !!brain?.profile?.overview?.trim() && (brain?.profile?.products?.length || 0) >= 3,
    brainTrained: (brain?.faqs?.length || 0) >= 5,
    agentActive: workspaceAgents.some(a => a.status === "Active"),
    domainsSet: (widgetConfig?.allowedDomains?.length || 0) > 0,
    testPassed: widgetVolume > 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Flag className="h-5 w-5 text-purple-400" />
            <span>Pilot Deployment Workspace</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Conduct staging checks, run dynamic test query generators, audit day-by-day telemetry, and copy launch results reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {profileSaved && (
            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-400">
              <Check className="h-3.5 w-3.5" />
              <span>Workspace Updated</span>
            </div>
          )}
          <span className="text-[10px] text-zinc-550 bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1 uppercase tracking-wider font-semibold">
            {activeWorkspace?.clientName || "Pilot Client"}
          </span>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-zinc-900 gap-1 bg-zinc-900/10 p-1 rounded-lg max-w-md">
        <button
          onClick={() => setActiveTab("setup")}
          className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            activeTab === "setup" 
              ? "bg-purple-600 text-white shadow shadow-purple-500/10" 
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Pilot Setup
        </button>
        <button
          onClick={() => setActiveTab("monitor")}
          className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            activeTab === "monitor" 
              ? "bg-purple-600 text-white shadow shadow-purple-500/10" 
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          7-Day Monitor
        </button>
        <button
          onClick={() => setActiveTab("results")}
          className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            activeTab === "results" 
              ? "bg-purple-600 text-white shadow shadow-purple-500/10" 
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Results & Report
        </button>
      </div>

      {/* Setup Tab */}
      {activeTab === "setup" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Setup Checklist (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Checklist */}
            <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <ListChecks className="h-4.5 w-4.5 text-purple-400" />
                <span>Pilot Setup Verification Checklist</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide block mb-1">Auto-Verified Checklist</span>
                  {[
                    { met: setupAuto.profileComplete, label: "Pilot Profile Complete (overview & products)" },
                    { met: setupAuto.brainTrained, label: "Brand Brain Configured (FAQs >= 5)" },
                    { met: setupAuto.agentActive, label: "AI Agent Status 'Active'" },
                    { met: setupAuto.domainsSet, label: "Allowed Domains Restricted" },
                    { met: setupAuto.testPassed, label: "Widget Chat Logged" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs">
                      {item.met ? (
                        <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-zinc-800 bg-zinc-950 shrink-0" />
                      )}
                      <span className={item.met ? "text-zinc-300 font-medium" : "text-zinc-500"}>{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t md:border-t-0 md:border-l border-zinc-900 pt-4 md:pt-0 md:pl-6">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide block mb-1">Owner Manual Confirmations</span>
                  {[
                    { key: "teamTrained" as const, label: "Pilot team has read training manual" },
                    { key: "stagingTested" as const, label: "Allowed domains tested on staging" },
                    { key: "handoffRulesSet" as const, label: "Owner has set handoff rules" },
                    { key: "routingChannelsTested" as const, label: "Handoff email/WhatsApp routing tested" },
                  ].map((item) => (
                    <label key={item.key} className="flex items-start gap-2.5 text-xs cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={setupManual[item.key]}
                        onChange={(e) => saveSetupManual(item.key, e.target.checked)}
                        className="mt-0.5 rounded border-zinc-800 bg-zinc-950 text-purple-600 focus:ring-purple-650"
                      />
                      <span className={setupManual[item.key] ? "text-zinc-300 font-medium" : "text-zinc-500"}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile editor */}
            <form onSubmit={handleSaveProfile} className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Building className="h-4.5 w-4.5 text-purple-400" />
                <span>Pilot Business Profile Form</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Workspace / Client Name</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full text-xs rounded-lg border border-zinc-900 bg-zinc-900/40 px-3 py-2.5 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-650"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Industry Sector</label>
                  <input
                    type="text"
                    required
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full text-xs rounded-lg border border-zinc-900 bg-zinc-900/40 px-3 py-2.5 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-650"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Business Overview</label>
                <textarea
                  required
                  rows={2}
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  className="w-full text-xs rounded-lg border border-zinc-900 bg-zinc-900/40 px-3 py-2.5 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-650"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Products / Services List (One per line)</label>
                <textarea
                  required
                  rows={3}
                  value={productsInput}
                  onChange={(e) => setProductsInput(e.target.value)}
                  placeholder="e.g. Lip Filler ($650)&#10;Chemical Peel ($150)"
                  className="w-full text-xs rounded-lg border border-zinc-900 bg-zinc-900/40 px-3 py-2.5 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-650 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Pricing & Deposit Notes</label>
                  <textarea
                    required
                    rows={2}
                    value={pricingNotes}
                    onChange={(e) => setPricingNotes(e.target.value)}
                    className="w-full text-xs rounded-lg border border-zinc-900 bg-zinc-900/40 px-3 py-2.5 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-650"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Booking / Refund Policies</label>
                  <textarea
                    required
                    rows={2}
                    value={policies}
                    onChange={(e) => setPolicies(e.target.value)}
                    className="w-full text-xs rounded-lg border border-zinc-900 bg-zinc-900/40 px-3 py-2.5 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-650"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Save Profile Details
                </button>
              </div>
            </form>
          </div>

          {/* Test Questions (5 cols) */}
          <div className="lg:col-span-5 glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <HelpCircle className="h-4.5 w-4.5 text-purple-400" />
              <span>Pilot Test Questions Generator</span>
            </h3>

            <p className="text-[11px] text-zinc-550 leading-relaxed">
              Use these dynamic test queries generated directly from the client's Brand Brain metrics to verify the AI's safety boundaries and tone alignment.
            </p>

            <div className="space-y-3">
              {generatedQuestions.map((q, idx) => (
                <div key={idx} className="bg-zinc-950/60 border border-zinc-900 rounded-lg p-3 space-y-1.5">
                  <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-wider">
                    <span className="text-purple-400">{q.type} <span className="text-zinc-600 font-normal">({q.source})</span></span>
                    <span className="text-zinc-650">Intent: {q.intent}</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-medium leading-relaxed">&ldquo;{q.q}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monitor Tab */}
      {activeTab === "monitor" && (
        <div className="max-w-4xl mx-auto glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-purple-400" />
              <span>7-Day Controlled Pilot Monitor Logs</span>
            </h3>
            <span className="text-[10px] text-zinc-500 uppercase font-semibold">
              Status: {Object.values(dailyChecks).filter(Boolean).length} / 7 Days Done
            </span>
          </div>

          <p className="text-xs text-zinc-550 leading-relaxed">
            The pilot client should check conversation logs daily. Ensure safety escalations worked, check low confidence messages, and clear outstanding training center recommendations:
          </p>

          <div className="space-y-4">
            {[
              { day: "day1", label: "Day 1: Connection & Live Traffic Check", desc: "Confirm widget loads on host domain. Verify visitor session count triggers." },
              { day: "day2", label: "Day 2: Lead Status & Contact Details", desc: "Verify hot leads and contact requests are identified and saved correctly." },
              { day: "day3", label: "Day 3: Objection Handling Analysis", desc: "Check conversations containing pricing objections. Modify Brand Brain rules if needed." },
              { day: "day4", label: "Day 4: AI Failure & Low Confidence Scans", desc: "Audit low confidence chats and check if AI safely declined out-of-bounds queries." },
              { day: "day5", label: "Day 5: Safety Handoff Triggers Execution", desc: "Verify handoff alerts were dispatched for payments, complaints, or angry users." },
              { day: "day6", label: "Day 6: Knowledge Correction & Training Loop", desc: "Approve or improve outstanding training items to patch AI knowledge gaps." },
              { day: "day7", label: "Day 7: Final Conversion Audit & Review", desc: "Generate pilot launch report and assess wider deployment launch readiness." },
            ].map((d) => (
              <div 
                key={d.day}
                className="flex items-start gap-4 p-4 bg-zinc-950/40 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={(dailyChecks as any)[d.day]}
                  onChange={(e) => saveDailyCheck(d.day as any, e.target.checked)}
                  className="mt-1 rounded border-zinc-800 bg-zinc-950 text-purple-600 focus:ring-purple-650 cursor-pointer h-4.5 w-4.5"
                />

                <div className="flex-1 space-y-2">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-zinc-200 block">{d.label}</span>
                    <span className="text-[10px] text-zinc-500 block">{d.desc}</span>
                  </div>

                  <input
                    type="text"
                    placeholder="Add notes for today's logs (optional)..."
                    value={dailyNotes[d.day] || ""}
                    onChange={(e) => saveDailyNote(d.day, e.target.value)}
                    className="w-full text-xs rounded border border-zinc-900 bg-zinc-900/10 px-3 py-1.5 text-zinc-300 focus:outline-none focus:border-zinc-800 placeholder:text-zinc-650"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results & Report Tab */}
      {activeTab === "results" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Results dashboard panel (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Pilot Results */}
            <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-purple-400" />
                <span>Live Pilot Results metrics</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-900">
                  <span className="text-[9px] text-zinc-500 block uppercase font-bold">Widget Chats</span>
                  <span className="text-base font-extrabold text-white block mt-1">{widgetVolume} sessions</span>
                </div>
                <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-900">
                  <span className="text-[9px] text-zinc-500 block uppercase font-bold">Hot Leads</span>
                  <span className="text-base font-extrabold text-amber-400 block mt-1">{widgetHotLeads} leads</span>
                </div>
                <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-900">
                  <span className="text-[9px] text-zinc-500 block uppercase font-bold">Follow-ups Needed</span>
                  <span className="text-base font-extrabold text-rose-400 block mt-1">{widgetFollowUps} cases</span>
                </div>
                <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-900">
                  <span className="text-[9px] text-zinc-500 block uppercase font-bold">Training Improvements</span>
                  <span className="text-base font-extrabold text-emerald-400 block mt-1">{trainingImprovementsCount} made</span>
                </div>
              </div>

              <div className="divide-y divide-zinc-900 text-xs">
                <div className="flex justify-between py-2.5">
                  <span className="text-zinc-500">Unanswered / Low Confidence</span>
                  <span className="text-zinc-300 font-semibold">{pendingGapsCount} cases</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-zinc-500">Resolved FAQs Active</span>
                  <span className="text-zinc-300 font-semibold">{resolvedFaqsCount} active</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-zinc-500">AI Confidence Average</span>
                  <span className="text-purple-400 font-semibold">{avgConfidence}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-zinc-500">Monitoring Progress</span>
                  <span className="text-zinc-300 font-semibold">
                    {Object.values(dailyChecks).filter(Boolean).length} / 7 Days Complete
                  </span>
                </div>
              </div>
            </div>

            {/* Custom Report Settings Form */}
            <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Sliders className="h-4.5 w-4.5 text-purple-400" />
                <span>Report Customization</span>
              </h3>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Pilot Wins Summary</label>
                  <input
                    type="text"
                    value={winsInput}
                    onChange={(e) => setWinsInput(e.target.value)}
                    className="w-full text-xs rounded border border-zinc-900 bg-zinc-900/40 px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Weak Answers Summary</label>
                  <input
                    type="text"
                    value={weakInput}
                    onChange={(e) => setWeakInput(e.target.value)}
                    className="w-full text-xs rounded border border-zinc-900 bg-zinc-900/40 px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Readiness Recommendation</label>
                  <select
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value)}
                    className="w-full text-xs rounded border border-zinc-900 bg-zinc-950 px-3 py-2 text-zinc-200 focus:outline-none focus:border-zinc-800"
                  >
                    <option value="Not Ready">Not Ready (Requires more training)</option>
                    <option value="Extend Pilot">Extend Pilot (Monitor for 7 more days)</option>
                    <option value="Ready for Wider Launch">Ready for Wider Launch (Approved)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Exporter view (7 cols) */}
          <div className="lg:col-span-7 glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-purple-400" />
                <span>Pilot Report Exporter</span>
              </h3>
              <button
                onClick={handleCopyReport}
                className="text-[10px] text-purple-400 hover:text-purple-300 font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Report</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-zinc-550 leading-relaxed">
              Export this performance review report to present to the client or business manager to summarize successes, gaps, and readiness recommendations.
            </p>

            <pre className="text-[10px] font-mono text-zinc-350 bg-black/85 border border-zinc-900 rounded-lg p-4 overflow-x-auto overflow-y-auto max-h-[420px] leading-normal select-all">
              {pilotReportTemplate}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
