"use client";

import React, { useState, useEffect } from "react";
import { useAppState } from "@/context/state-context";
import { 
  Rocket, 
  Award, 
  CheckCircle, 
  Copy, 
  Check, 
  Globe, 
  ShieldAlert, 
  ListChecks, 
  UserCheck, 
  Activity, 
  AlertTriangle, 
  HelpCircle,
  FileText,
  UserX,
  RefreshCw,
  Info
} from "lucide-react";

export default function BetaLaunchPage() {
  const { 
    activeWorkspaceId, 
    activeWorkspace,
    brandBrains, 
    agents, 
    conversations, 
    trainingItems,
    widgetConfigs,
    updateHandoffRules,
    isSupabaseConfigured,
    lastSyncTimestamp
  } = useAppState();

  const brain = brandBrains[activeWorkspaceId];
  const workspaceAgents = agents.filter((a) => a.linkedBrainId === activeWorkspaceId);
  const widgetConfig = widgetConfigs[activeWorkspaceId];
  const workspaceConvs = conversations[activeWorkspaceId] || [];
  const workspaceTraining = trainingItems[activeWorkspaceId] || [];

  // Local Form states for Handoff Rules
  const [handoffName, setHandoffName] = useState("");
  const [handoffContact, setHandoffContact] = useState("");
  const [handoffRules, setHandoffRules] = useState("");
  const [handoffSaved, setHandoffSaved] = useState(false);

  // Sync handoff states with brain
  useEffect(() => {
    if (brain) {
      setHandoffName(brain.handoffName || "");
      setHandoffContact(brain.handoffContact || "");
      setHandoffRules(brain.handoffRules || "");
    }
  }, [brain, activeWorkspaceId]);

  // Manual Checklist Items (stored in localStorage)
  const [manualChecks, setManualChecks] = useState({
    embedInstalled: false,
    followUpConfirmed: false,
    conversationReviewed: false,
    monitoringApproved: false,
  });

  const [copied, setCopied] = useState(false);
  const [hostDomain, setHostDomain] = useState("https://echo-staff.vercel.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHostDomain(window.location.origin);
      const stored = localStorage.getItem(`echostaff_beta_manual_${activeWorkspaceId}`);
      if (stored) {
        try {
          setManualChecks(JSON.parse(stored));
        } catch (_) {}
      }
    }
  }, [activeWorkspaceId]);

  const saveManualCheck = (key: keyof typeof manualChecks, value: boolean) => {
    const updated = { ...manualChecks, [key]: value };
    setManualChecks(updated);
    localStorage.setItem(`echostaff_beta_manual_${activeWorkspaceId}`, JSON.stringify(updated));
  };

  const handleSaveHandoff = (e: React.FormEvent) => {
    e.preventDefault();
    updateHandoffRules(handoffName, handoffContact, handoffRules);
    setHandoffSaved(true);
    setTimeout(() => setHandoffSaved(false), 2000);
  };

  // ==========================================
  // Readiness Score & Metrics Computations
  // ==========================================
  const checks = {
    overviewExists: !!brain?.profile?.overview?.trim(),
    faqsCountOk: (brain?.faqs?.length || 0) >= 5,
    productsCountOk: (brain?.profile?.products?.length || 0) >= 3,
    doRulesCountOk: (brain?.doRules?.length || 0) >= 3,
    dontRulesCountOk: (brain?.dontRules?.length || 0) >= 3,
    pricingNotesOk: !!brain?.profile?.pricingNotes?.trim(),
    policiesOk: !!brain?.profile?.policies?.trim(),
    handoffConfigured: !!brain?.handoffName?.trim() && !!brain?.handoffRules?.trim(),
    agentActive: workspaceAgents.some((a) => a.status === "Active"),
    widgetEnabled: !!widgetConfig?.enabled,
    domainConfigured: (widgetConfig?.allowedDomains?.length || 0) > 0,
    widgetTestPassed: workspaceConvs.some((c) => c.channel === "Website Widget"),
  };

  const metChecks = Object.entries(checks).filter(([_, met]) => met);
  const scorePercent = Math.round((metChecks.length / 12) * 100);

  let readinessLabel = "Not Ready";
  let badgeColor = "bg-rose-500/15 border-rose-500/30 text-rose-400";
  if (scorePercent >= 80) {
    readinessLabel = "Ready for Controlled Beta";
    badgeColor = "bg-emerald-500/15 border-emerald-500/30 text-emerald-400";
  } else if (scorePercent >= 50) {
    readinessLabel = "Almost Ready";
    badgeColor = "bg-amber-500/15 border-amber-500/30 text-amber-400";
  }

  // Generate missing items list
  const missingItems: string[] = [];
  if (!checks.overviewExists) missingItems.push("Business Overview is empty");
  if (!checks.faqsCountOk) missingItems.push("At least 5 FAQs required (currently: " + (brain?.faqs?.length || 0) + ")");
  if (!checks.productsCountOk) missingItems.push("At least 3 Products/Services required (currently: " + (brain?.profile?.products?.length || 0) + ")");
  if (!checks.doRulesCountOk) missingItems.push("At least 3 DO rules required (currently: " + (brain?.doRules?.length || 0) + ")");
  if (!checks.dontRulesCountOk) missingItems.push("At least 3 DON'T rules required (currently: " + (brain?.dontRules?.length || 0) + ")");
  if (!checks.pricingNotesOk) missingItems.push("Pricing Notes are missing");
  if (!checks.policiesOk) missingItems.push("Business policies cancellation/bookings are missing");
  if (!checks.handoffConfigured) missingItems.push("Human handoff Rules are incomplete");
  if (!checks.agentActive) missingItems.push("No Active Agent linked to this workspace");
  if (!checks.widgetEnabled) missingItems.push("Website Widget is disabled");
  if (!checks.domainConfigured) missingItems.push("No Allowed Domains configured for the widget");
  if (!checks.widgetTestPassed) missingItems.push("At least 1 test conversation with the widget is required");

  // Determine Next Action
  let nextAction = "Add more FAQs and Business Profile details under Brand Brain.";
  if (missingItems.length === 0) {
    nextAction = "Ready! Embed the widget on the pilot domain and initiate controlled customer beta.";
  } else if (!checks.agentActive) {
    nextAction = "Set at least one agent status to 'Active' in the AI Staff/Agents tab.";
  } else if (!checks.domainConfigured || !checks.widgetEnabled) {
    nextAction = "Configure allowed hosting domains and enable the widget under Website Widget settings.";
  } else if (!checks.widgetTestPassed) {
    nextAction = "Run a test chat session with the widget using the widget preview or the test page.";
  }

  // ==========================================
  // Client Intake Template Generation
  // ==========================================
  const intakeFormTemplate = `==================================================
ECHOSTAFF AI - PILOT CLIENT INTAKE PROFILE TEMPLATE
==================================================

1. BUSINESS GENERALS
- Business Name: ${activeWorkspace?.clientName || "Pilot Client"}
- Industry: ${activeWorkspace?.industry || "Consulting"}
- Website URL: [E.g., https://example.com]
- WhatsApp Contact: [E.g., +1 (555) 000-0000]
- Opening Hours: [E.g., Mon-Fri 9am-6pm]
- Location Address: [E.g., 100 Main St, Suite A]

2. PRODUCTS & SERVICES
${brain?.profile?.products?.map((p, i) => `  - Product ${i+1}: ${p}`).join("\n") || "  - [Enter at least 3 products with prices]"}

3. PRICING & PAYMENT NOTES
- Pricing Details: ${brain?.profile?.pricingNotes || "[Enter pricing details, deposits, card rules]"}
- Payments Accepted: [E.g., Stripe, Cards, Cash]

4. BUSINESS POLICIES
- Booking & Cancellations: ${brain?.profile?.policies || "[Enter policies, refunds, cancellation rules]"}

5. FAQS (CORE KNOWLEDGE BASE)
${brain?.faqs?.map((f, i) => `Q${i+1}: ${f.question}\nA${i+1}: ${f.answer}`).join("\n\n") || "Q1: [Enter common client question]\nA1: [Enter answer]"}

6. TONE & VOCABULARY
- Tone guidelines: ${brain?.toneOfVoice || "Friendly and professional"}
- Words to Avoid: [E.g., cheap, guarantee, absolute]

7. HUMAN HANDOFF RULES
- Handoff Contact: ${handoffName || "[Contact Name]"}
- Handoff WhatsApp/Email: ${handoffContact || "[Contact details]"}
- Situations requiring human handoff:
  ${handoffRules || "pricing negotiation, payment issue, refund request, angry customer, low confidence answer"}

8. OPERATIONAL RULES
- Emergency/Complaint: [How to handle angry complaints]
- Delivery/Booking rule: [Link or process to book appointments]`;

  const handleCopyIntake = () => {
    navigator.clipboard.writeText(intakeFormTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Embed script snippet
  const widgetPublicKey = widgetConfig?.publicKey || "YOUR_PUBLIC_KEY";
  const vercelDomain = "https://echo-staff.vercel.app";
  const embedCodeHtml = `<!-- EchoStaff Chat Widget Embed -->
<script 
  src="${hostDomain.includes("localhost") ? vercelDomain : hostDomain}/widget.js" 
  data-echostaff-widget="${widgetPublicKey}" 
  async>
</script>`;

  // Filter conversations
  const widgetConvs = workspaceConvs.filter(c => c.channel === "Website Widget");
  const hotLeads = widgetConvs.filter(c => c.leadStatus === "Hot").length;
  const followUps = widgetConvs.filter(c => c.needsFollowUp).length;
  
  // Detect low confidence responses: either fallback AI is triggered or keyword flag is found
  const lowConfidence = widgetConvs.filter(c => 
    c.messages.some(m => 
      m.sender === "agent" && 
      (m.text.includes("difficulty connecting") || 
       m.text.includes("fallback") || 
       m.text.includes("having difficulty"))
    )
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Rocket className="h-5 w-5 text-purple-400 animate-pulse" />
            <span>Private Beta Launch Workspace</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Conduct client onboarding, manage intake files, configure fail-safes, and monitor pilot deployment metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {handoffSaved && (
            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-semibold text-emerald-400">
              <Check className="h-3.5 w-3.5" />
              <span>Handoff Saved</span>
            </div>
          )}
          <span className="text-[10px] text-zinc-500 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 uppercase tracking-wider font-semibold">
            {isSupabaseConfigured ? "Database Mode" : "Sandbox Mode"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Metrics, Checklist, Configs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Beta Readiness Score */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Award className="h-4.5 w-4.5 text-purple-400" />
                <span>Beta Launch Readiness Score</span>
              </h3>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${badgeColor}`}>
                {readinessLabel}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-3xl font-black text-white">{scorePercent}%</div>
              <div className="flex-1">
                <div className="h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <div 
                    style={{ width: `${scorePercent}%` }}
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-zinc-950/40 rounded-lg border border-zinc-900 text-xs">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1.5">Missing Setup Items ({missingItems.length})</span>
                {missingItems.length === 0 ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>All criteria met!</span>
                  </span>
                ) : (
                  <ul className="space-y-1 text-zinc-400 list-disc pl-4 leading-relaxed max-h-40 overflow-y-auto">
                    {missingItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-3 bg-zinc-950/40 rounded-lg border border-zinc-900 text-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1.5">Recommended Next Action</span>
                  <p className="text-zinc-300 leading-relaxed font-medium">
                    {nextAction}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Launch Checklist */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <ListChecks className="h-4.5 w-4.5 text-purple-400" />
              <span>Launch Readiness Checklist</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Auto verified Checklist */}
              <div className="space-y-3">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide block mb-1">Auto-Verified Checks</span>
                
                {[
                  { met: checks.overviewExists && checks.productsCountOk && checks.pricingNotesOk, label: "Business Profile Completed" },
                  { met: checks.doRulesCountOk && checks.dontRulesCountOk, label: "Brand Brain Configured" },
                  { met: checks.faqsCountOk, label: "FAQs Ingested (>=5)" },
                  { met: checks.productsCountOk, label: "Products Listed (>=3)" },
                  { met: checks.policiesOk, label: "Policies Added" },
                  { met: checks.agentActive, label: "Active Agent Set" },
                  { met: checks.widgetEnabled, label: "Widget Enabled" },
                  { met: checks.domainConfigured, label: "Allowed Domain Configured" },
                  { met: checks.widgetTestPassed, label: "Test Conversation Logged" },
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

              {/* Manual operational Checklist */}
              <div className="space-y-3 border-t md:border-t-0 md:border-l border-zinc-900 pt-4 md:pt-0 md:pl-6">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide block mb-1">Manual Launch Actions</span>
                
                {[
                  { key: "embedInstalled" as const, label: "Website Embed Installed", desc: "Embed script loaded on staging/prod." },
                  { key: "followUpConfirmed" as const, label: "Owner Handoff Verified", desc: "SMS/Email follow-up routes tested." },
                  { key: "conversationReviewed" as const, label: "Test Conversation Reviewed", desc: "Answers verified for tone match." },
                  { key: "monitoringApproved" as const, label: "Beta Monitoring Approved", desc: "Client agrees to conversation audit." },
                ].map((item) => (
                  <label key={item.key} className="flex items-start gap-2.5 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={manualChecks[item.key]}
                      onChange={(e) => saveManualCheck(item.key, e.target.checked)}
                      className="mt-0.5 rounded border-zinc-800 bg-zinc-950 text-purple-600 focus:ring-purple-650"
                    />
                    <div className="space-y-0.5">
                      <span className={manualChecks[item.key] ? "text-zinc-300 font-semibold block" : "text-zinc-500 block"}>
                        {item.label}
                      </span>
                      <span className="text-[10px] text-zinc-600 block">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Human Handoff Rules */}
          <form onSubmit={handleSaveHandoff} className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <UserCheck className="h-4.5 w-4.5 text-purple-400" />
                <span>Human Handoff & Safety Configuration</span>
              </h3>
              <span title="Configures when the AI agent will suggest routing the customer conversation to the business owner.">
                <Info className="h-4 w-4 text-zinc-650 hover:text-zinc-400 cursor-pointer" />
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Handoff Contact Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jennings"
                  value={handoffName}
                  onChange={(e) => setHandoffName(e.target.value)}
                  className="w-full text-xs rounded-lg border border-zinc-900 bg-zinc-900/40 px-3 py-2.5 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-650"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Handoff WhatsApp / Email</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +1 (555) 123-4567 or help@business.com"
                  value={handoffContact}
                  onChange={(e) => setHandoffContact(e.target.value)}
                  className="w-full text-xs rounded-lg border border-zinc-900 bg-zinc-900/40 px-3 py-2.5 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-650"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Handoff Rules & Triggers</label>
              <textarea
                required
                rows={3}
                placeholder="e.g. pricing negotiation, payment issue, refund request, angry customer, low confidence answer, medical questions"
                value={handoffRules}
                onChange={(e) => setHandoffRules(e.target.value)}
                className="w-full text-xs rounded-lg border border-zinc-900 bg-zinc-900/40 px-3 py-2.5 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-650 leading-relaxed"
              />
            </div>

            <div className="bg-zinc-900/10 border border-zinc-900 p-3 rounded-lg">
              <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Required Safety Escalation Situations:</span>
              <p className="text-[10px] text-zinc-600 leading-relaxed">
                The pilot business should escalate on: <strong className="text-zinc-450">angry customer</strong>, <strong className="text-zinc-450">payment issue</strong>, <strong className="text-zinc-450">refund request</strong>, <strong className="text-zinc-450">custom quote request</strong>, <strong className="text-zinc-450">low confidence answer</strong>, <strong className="text-zinc-450">policy not found</strong>, <strong className="text-zinc-450">legal/medical/financial claims</strong>, and <strong className="text-zinc-450">urgent complaint</strong>.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Save Safety Rules
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Intake, Embed Guide, Monitor (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Section 4: Client Intake File */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-purple-400" />
                <span>Client Intake Template</span>
              </h3>
              <button
                onClick={handleCopyIntake}
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
                    <span>Copy Form</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-zinc-550 leading-relaxed">
              Copy this structured template to collect client policies, opening hours, pricing grids, and brand instructions before training the AI.
            </p>

            <pre className="text-[10px] font-mono text-zinc-400 bg-black/80 border border-zinc-900 rounded-lg p-3 overflow-x-auto overflow-y-auto max-h-60 leading-normal select-all">
              {intakeFormTemplate}
            </pre>
          </div>

          {/* Section 5: Widget Install Guide */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Globe className="h-4.5 w-4.5 text-purple-400" />
              <span>Widget Installation Guide</span>
            </h3>

            <div className="space-y-3.5">
              <pre className="text-[10px] font-mono text-zinc-400 bg-black/80 border border-zinc-900 rounded-lg p-3 overflow-x-auto leading-normal">
                {embedCodeHtml}
              </pre>

              <div className="space-y-2.5 text-xs text-zinc-400 leading-normal">
                <div className="flex gap-2">
                  <span className="text-purple-450 font-bold">HTML:</span>
                  <span>Paste right before the closing <code className="font-mono text-purple-400">&lt;/body&gt;</code> tag of your index page.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-purple-450 font-bold">Next.js:</span>
                  <span>Use Next's <code className="font-mono text-purple-400">&lt;Script&gt;</code> component inside layout.tsx.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-purple-450 font-bold">WP:</span>
                  <span>Insert inside Header/Footer Scripts injection plugins.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-purple-450 font-bold">Framer:</span>
                  <span>Add as custom code integration block inside project settings.</span>
                </div>
              </div>

              <div className="p-3 bg-rose-950/10 border border-rose-950 rounded-lg flex items-start gap-2.5">
                <ShieldAlert className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-[10px] text-rose-350 leading-relaxed font-semibold">
                  WARNING: “Only install on domains listed in Allowed Domains.” Requests from unauthorized origins will be rejected with a 403 Forbidden error.
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Beta Monitoring Panel */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-purple-400" />
              <span>Real-Time Beta Monitoring Panel</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-900">
                <span className="text-[9px] text-zinc-500 block uppercase font-bold">Widget Chats Today</span>
                <span className="text-base font-extrabold text-white block mt-1">{widgetConvs.length}</span>
              </div>
              <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-900">
                <span className="text-[9px] text-zinc-500 block uppercase font-bold">Hot Leads</span>
                <span className="text-base font-extrabold text-amber-400 block mt-1">{hotLeads}</span>
              </div>
              <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-900">
                <span className="text-[9px] text-zinc-500 block uppercase font-bold">Follow-ups Needed</span>
                <span className="text-base font-extrabold text-rose-400 block mt-1">{followUps}</span>
              </div>
              <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-900">
                <span className="text-[9px] text-zinc-500 block uppercase font-bold">Low Confidence Chats</span>
                <span className="text-base font-extrabold text-purple-400 block mt-1">{lowConfidence}</span>
              </div>
            </div>

            <div className="divide-y divide-zinc-900 text-xs">
              <div className="flex justify-between py-2">
                <span className="text-zinc-500">Pending Training Items</span>
                <span className="text-zinc-300 font-semibold">{workspaceTraining.length}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-500">Last Database Sync</span>
                <span className="text-zinc-300 font-semibold truncate max-w-[150px]">
                  {lastSyncTimestamp ? new Date(lastSyncTimestamp).toLocaleTimeString() : "Sandbox Mode"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-500">AI Engine Gateway</span>
                <span className="text-emerald-400 font-semibold">Online (OpenAI Live)</span>
              </div>
            </div>
          </div>

          {/* Section 7: Known Limitations */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-5 shadow-lg space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-purple-400" />
              <span>Client Beta Operational Notice</span>
            </h4>
            <ul className="text-[10px] text-zinc-550 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li><strong>Review Work</strong>: System replies are generated by configured agents. Pilot business owners should review conversations daily.</li>
              <li><strong>First Channel</strong>: Website chat widget is the primary active beta channel. WhatsApp and Instagram routing are not connected in this phase.</li>
              <li><strong>No VoIP line</strong>: Real-time incoming phone line dialing is not active.</li>
              <li><strong>Continuous Training</strong>: Use the Training loop to approve or correct AI answers.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
