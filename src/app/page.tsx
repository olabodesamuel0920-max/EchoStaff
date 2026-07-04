"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Brain, 
  UserCheck, 
  Bot, 
  Sparkles, 
  MessageSquare, 
  Database, 
  GitMerge, 
  LineChart, 
  Building2,
  ChevronDown,
  Play,
  Volume2
} from "lucide-react";

export default function LandingPage() {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState(0);

  const roles = [
    {
      title: "Sophia (Aesthetic Specialist)",
      overview: "Converts inquiries, schedules consultations, and guides customers safely.",
      phrase: "Yes, our Botox consultations are $50, fully redeemable against treatments! Would you like Friday at 2pm?"
    },
    {
      title: "Max (B2B Fleet Broker)",
      overview: "Identifies dispatcher issues, addresses objections, and calculates ROI metrics.",
      phrase: "Apex Professional reduces deadhead miles by 18%. Shall I set up a 10-minute demo to see your routes?"
    },
    {
      title: "Julian (Elite Travel Concierge)",
      overview: "Coordinates private aviation logistics, villa leases, and high-end VIP requests.",
      phrase: "I will secure your heavy jet charter options by 3 PM today. Do you require VIP fast-track in Nice?"
    },
    {
      title: "Amina (Catering & Events Coordinator)",
      overview: "Coordinates event catering, lunch delivery packages, and addresses deposit objections.",
      phrase: "Our corporate lunch packages are $18/person, featuring smoky Jollof rice and grilled chicken. Shall we book this for Thursday?"
    }
  ];

  const faqs = [
    {
      q: "How does EchoStaff AI learn about my business?",
      a: "You train your AI staff by creating a 'Brand Brain'. This includes feeding it your business overview, product specifications, pricing guidelines, official policies, custom FAQs, and setting strict 'Do' and 'Don't' rules. The AI will strictly adhere to these limits."
    },
    {
      q: "Can I review and edit the AI's answers?",
      a: "Yes! The Training Center records conversations. Whenever a customer asks something ambiguous, the AI draft is flagged. You can approve, correct, or write rules telling the AI how to answer next time, improving the Training Score."
    },
    {
      q: "Does it require programming or OpenAI keys?",
      a: "No programming is required. For Phase 1 sandbox and local exploration, it runs entirely on our pre-packaged local cognitive mocks. In production, you can easily connect your own OpenAI key for scalable API deployments, or use our managed secure channels."
    },
    {
      q: "What channels does EchoStaff support?",
      a: "We support web chat widgets, WhatsApp Business API, Instagram Direct Messages, Email, Voice/Phone agents, and traditional SMS gateways."
    }
  ];

  return (
    <div className="bg-black min-h-screen text-zinc-200">
      {/* Header / Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-900 bg-black/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 font-bold text-white shadow-md shadow-purple-500/20 glow-text">
              ES
            </div>
            <span className="font-semibold text-lg bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              EchoStaff AI
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-zinc-200 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-zinc-200 transition-colors">How it works</a>
            <a href="#roles" className="hover:text-zinc-200 transition-colors">AI Staff Roles</a>
            <a href="#pricing" className="hover:text-zinc-200 transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-500/10 transition-all"
            >
              Start Training Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]">
        {/* Background Grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#09090b_1px,transparent_1px),linear-gradient(to_bottom,#09090b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1 text-xs font-medium text-purple-400 mb-6 neon-glow">
            <Sparkles className="h-3 w-3" />
            <span>Train your brand’s first AI employee</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent max-w-4xl mx-auto leading-tight md:leading-none">
            Train your brand’s first AI employee.
          </h1>

          {/* Subtext */}
          <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            EchoStaff AI is your brand’s first AI staff that speaks, sells, supports, books, follows up, and learns your business over time.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-purple-500/20 transition-all cursor-pointer"
            >
              <span>Start Private Beta</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link 
              href="/dashboard" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 px-6 py-3.5 text-sm font-medium text-zinc-300 transition-colors cursor-pointer"
            >
              <span>Book Demo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Voice/Chat Preview Section */}
      <section className="py-12 bg-black">
        <div className="max-w-4xl mx-auto px-6">
          <div className="glass-panel border border-zinc-800 rounded-xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500" />
            
            {/* Window bar */}
            <div className="bg-zinc-950 px-4 py-3 flex items-center justify-between border-b border-zinc-900">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
              </div>
              <div className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                <Volume2 className="h-3 w-3 text-purple-400 animate-pulse" />
                <span>Sophia Voice Agent Live Test</span>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>

            {/* Conversation Feed */}
            <div className="p-6 space-y-4 bg-zinc-950/20 min-h-[200px]">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-400">
                  U
                </div>
                <div className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm max-w-[80%] text-zinc-300">
                  Hi, does your HydraFacial deluxe require any downtime? I have sensitive skin.
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <div className="rounded-lg bg-purple-950/20 border border-purple-900/30 px-4 py-2.5 text-sm max-w-[80%] text-zinc-200">
                  <div className="flex items-center gap-1.5 text-purple-400 text-xs font-semibold mb-1">
                    <Sparkles className="h-3 w-3" />
                    <span>Sophia (Empathetic Concierge)</span>
                  </div>
                  Hello! There is absolutely zero downtime for the HydraFacial Deluxe. We adjust the clinical suction and select botanical infusions specifically formulated to soothe sensitive, reactive skin. You will leave glowing and refreshed. Would you like to check consult slots this weekend?
                </div>
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow shadow-purple-500/10">
                  S
                </div>
              </div>
            </div>

            {/* Audio Wave Simulation */}
            <div className="border-t border-zinc-900 bg-zinc-950 px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-zinc-500">Audio Stream Connection Status: Ready</span>
              
              {/* Wave bars */}
              <div className="flex items-end gap-1 h-6">
                <span className="w-1 bg-purple-500 rounded h-3 animate-pulse" />
                <span className="w-1 bg-indigo-500 rounded h-5 animate-pulse" />
                <span className="w-1 bg-purple-400 rounded h-2 animate-pulse" />
                <span className="w-1 bg-indigo-600 rounded h-6 animate-pulse" />
                <span className="w-1 bg-purple-500 rounded h-4 animate-pulse" />
                <span className="w-1 bg-indigo-400 rounded h-1 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features / Use Cases Section */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-6 border-t border-zinc-900">
        <h2 className="text-3xl font-bold text-center tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          Operational Core Capabilities
        </h2>
        <p className="mt-3 text-zinc-500 text-center max-w-xl mx-auto text-sm">
          More than chatbots. Fully-integrated customer engagement nodes that execute operational flows.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-6 glass-card-hover">
            <MessageSquare className="h-8 w-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-zinc-100">Lead Handling & Sales</h3>
            <p className="mt-2 text-zinc-400 text-sm leading-relaxed">
              Engage traffic immediately, qualify interests, handle pricing friction based on approved guides, and direct leads to booking pipelines.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-6 glass-card-hover">
            <UserCheck className="h-8 w-8 text-indigo-400 mb-4" />
            <h3 className="text-lg font-semibold text-zinc-100">Concierge Support & FAQs</h3>
            <p className="mt-2 text-zinc-400 text-sm leading-relaxed">
              Resolve procedural queries, support policies, and service details instantly. The AI strictly respects bounds, avoiding hallucinated data.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-6 glass-card-hover">
            <Brain className="h-8 w-8 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-zinc-100">Continuous Audit Center</h3>
            <p className="mt-2 text-zinc-400 text-sm leading-relaxed">
              Every query we fail to answer goes to the owner. Review, type a correction, and the Brand Brain updates instantly, improving operations.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Industry Blueprints</span>
            <h2 className="text-3xl font-bold tracking-tight text-white mt-2">
              Designed for Small & Medium Businesses
            </h2>
            <p className="mt-4 text-zinc-400 text-sm leading-relaxed">
              EchoStaff AI adapts to your industry's specific workflow, policies, and channels.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 glass-panel">
              <span className="text-xs font-bold text-purple-400">Fashion & Retail</span>
              <h4 className="text-sm font-semibold text-white mt-2">WhatsApp Catalog Funnel</h4>
              <p className="mt-2 text-zinc-400 text-xs leading-relaxed">
                Filter standard sizes and delivery fees, block payment credential exposure, and route high-intent buyers directly to WhatsApp checkout.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 glass-panel">
              <span className="text-xs font-bold text-indigo-400">Salons & Spas</span>
              <h4 className="text-sm font-semibold text-white mt-2">Consultation Bookings</h4>
              <p className="mt-2 text-zinc-400 text-xs leading-relaxed">
                Qualify client concerns, explain custom aesthetic treatments, and coordinate booking deposits securely.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 glass-panel">
              <span className="text-xs font-bold text-emerald-400">Restaurants & Catering</span>
              <h4 className="text-sm font-semibold text-white mt-2">Order Pre-Qualification</h4>
              <p className="mt-2 text-zinc-400 text-xs leading-relaxed">
                Deliver smoky menu details, pricing packages, and deposit policies before transferring orders to your kitchen staff.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 glass-panel">
              <span className="text-xs font-bold text-amber-400">Schools & Academies</span>
              <h4 className="text-sm font-semibold text-white mt-2">Enrollment Guidance</h4>
              <p className="mt-2 text-zinc-400 text-xs leading-relaxed">
                Answer curriculum, tuition, and scheduling questions while booking tours for prospective parents.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 glass-panel">
              <span className="text-xs font-bold text-rose-400">Professional Services</span>
              <h4 className="text-sm font-semibold text-white mt-2">Lead Qualification</h4>
              <p className="mt-2 text-zinc-400 text-xs leading-relaxed">
                Answer basic service capability questions and route hot leads directly to your CRM or scheduling calendars.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-zinc-950/20 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center tracking-tight text-white">
            How EchoStaff AI Works
          </h2>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="h-12 w-12 rounded-full bg-purple-600/10 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400 mb-4 shadow">
                1
              </div>
              <h3 className="text-base font-semibold text-zinc-200">Inject Brand Brain</h3>
              <p className="mt-2 text-zinc-400 text-xs max-w-[200px] leading-relaxed">
                Define your profile, products, pricing notes, and rules.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="h-12 w-12 rounded-full bg-purple-600/10 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400 mb-4 shadow">
                2
              </div>
              <h3 className="text-base font-semibold text-zinc-200">Build AI Staff</h3>
              <p className="mt-2 text-zinc-400 text-xs max-w-[200px] leading-relaxed">
                Name your agent, choose a role, select a tone and personality.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="h-12 w-12 rounded-full bg-purple-600/10 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400 mb-4 shadow">
                3
              </div>
              <h3 className="text-base font-semibold text-zinc-200">Activate Channels</h3>
              <p className="mt-2 text-zinc-400 text-xs max-w-[200px] leading-relaxed">
                Connect the agent to Web Chat, WhatsApp, Instagram, or Voice line.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="h-12 w-12 rounded-full bg-purple-600/10 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400 mb-4 shadow">
                4
              </div>
              <h3 className="text-base font-semibold text-zinc-200">Audit & Optimize</h3>
              <p className="mt-2 text-zinc-400 text-xs max-w-[200px] leading-relaxed">
                Resolve knowledge gaps with simple owner corrections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Brain & AI Roles Showcase */}
      <section id="roles" className="py-20 max-w-7xl mx-auto px-6 border-t border-zinc-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Cognitive Blueprint</span>
            <h2 className="text-3xl font-extrabold text-white mt-2 leading-tight">
              The Brand Brain Architecture
            </h2>
            <p className="text-zinc-400 mt-4 text-sm leading-relaxed">
              Unlike classical GPT scripts that wander, EchoStaff relies on a dual-engine architecture:
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded bg-purple-600/15 border border-purple-500/20 flex items-center justify-center text-purple-400 mt-1">
                  <Database className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-200">Hard constraints (Do/Don't lists)</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Preventing incorrect pricing quotes, medical diagnosis, or unauthorized discounting.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mt-1">
                  <GitMerge className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-200">Contextual Ingestion</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Sourcing specific business policies, details, and products dynamically.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Role Selector */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 shadow-2xl relative">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400 mb-4">
              Preset Brand Agents
            </h3>
            
            <div className="flex flex-col gap-2">
              {roles.map((role, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedRole(idx)}
                  className={`w-full text-left rounded-lg p-3 transition-colors flex flex-col cursor-pointer ${
                    selectedRole === idx 
                      ? "bg-purple-600/10 border border-purple-500/20 text-white" 
                      : "bg-transparent border border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <span className="font-semibold text-sm">{role.title}</span>
                  <span className="text-xs text-zinc-400 mt-1">{role.overview}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-900 bg-black/40 rounded-lg p-4">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block mb-2">
                Simulated response output:
              </span>
              <p className="text-xs italic text-purple-300 leading-relaxed">
                &ldquo;{roles[selectedRole].phrase}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Agency Mode showcase */}
      <section className="py-20 bg-zinc-950/20 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 glass-panel border border-zinc-800 rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
              <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-purple-400" />
                <span>Agency Hub: 3 Active Clients</span>
              </span>
              <span className="rounded-full bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[10px] font-semibold text-purple-400">
                MRR: $4,650
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-zinc-900/40 p-3 border border-zinc-900 flex justify-between items-center">
                <div>
                  <span className="block text-xs font-semibold text-zinc-300">Luna Aesthetics Clinic</span>
                  <span className="text-[10px] text-zinc-500">2 agents | 1,420 msgs</span>
                </div>
                <span className="text-xs font-bold text-purple-400">$1,200/mo</span>
              </div>

              <div className="rounded-lg bg-zinc-900/40 p-3 border border-zinc-900 flex justify-between items-center">
                <div>
                  <span className="block text-xs font-semibold text-zinc-300">Apex SaaS Solutions</span>
                  <span className="text-[10px] text-zinc-500">3 agents | 3,840 msgs</span>
                </div>
                <span className="text-xs font-bold text-purple-400">$2,500/mo</span>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Scalability Layer</span>
            <h2 className="text-3xl font-extrabold text-white mt-2 leading-tight">
              Agency Management Mode
            </h2>
            <div className="space-y-3.5 text-xs text-zinc-400 leading-relaxed">
              <div className="bg-zinc-900/40 border border-zinc-900 p-3 rounded-lg">
                <span className="text-[10px] font-bold text-zinc-500 block mb-1">Customer Query</span>
                <span className="text-zinc-300 font-medium">"do you sell gowns and do you deliver to Abuja?"</span>
              </div>
              <div className="bg-purple-950/10 border border-purple-900/20 p-3 rounded-lg">
                <span className="text-[10px] font-bold text-purple-400 block mb-1">Zara Stylist</span>
                <span className="text-zinc-300">"Yes! We specialize in ready-to-wear premium women's clothing, including gowns. We deliver to Abuja in 3-5 days for ₦4,500. Sizing and payment coordinates are finalized on WhatsApp."</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ATC Storefront Case Study Section */}
      <section id="case-study" className="py-20 bg-black border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Case Study & Proof</span>
              <h2 className="text-3xl font-extrabold text-white mt-2 leading-tight">
                Zara AI Stylist: ATC Storefront Pilot
              </h2>
              <p className="text-zinc-400 mt-4 text-sm leading-relaxed">
                We deployed Zara, an AI Fashion Stylist, as a live web widget on the active ATC Storefront. Over a 7-day validation period, Zara acted as a premium digital concierge, helping customers navigate the catalog and transitioning them to order finalization.
              </p>
              <p className="text-zinc-400 mt-3 text-sm leading-relaxed">
                By enforcing strict Brand Brain guidelines, Zara maintained absolute policy safety while driving high-intent customer handoffs to the business owner.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="rounded-lg bg-zinc-900/50 border border-zinc-900 p-4 min-w-[140px]">
                  <span className="text-2xl font-black text-white block">13</span>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Conversations</span>
                </div>
                <div className="rounded-lg bg-zinc-900/50 border border-zinc-900 p-4 min-w-[140px]">
                  <span className="text-2xl font-black text-purple-400 block">85.7%</span>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">High-Intent Rate</span>
                </div>
                <div className="rounded-lg bg-zinc-900/50 border border-zinc-900 p-4 min-w-[140px]">
                  <span className="text-2xl font-black text-indigo-400 block">71.4%</span>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">WhatsApp Handoff</span>
                </div>
                <div className="rounded-lg bg-zinc-900/50 border border-zinc-900 p-4 min-w-[140px]">
                  <span className="text-2xl font-black text-emerald-400 block">100%</span>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">Safety Score</span>
                </div>
              </div>
            </div>

            <div className="glass-panel border border-purple-500/10 bg-purple-950/5 rounded-xl p-6 shadow-2xl space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400 border-b border-zinc-900 pb-3">
                Key Performance Insights
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-start border-b border-zinc-900/50 pb-2">
                  <span className="text-zinc-300 font-medium">85.7% High-Intent Rate</span>
                  <span className="text-zinc-400 text-right max-w-[200px]">Customers actively asking about specific dresses, sizes, and colors.</span>
                </div>
                <div className="flex justify-between items-start border-b border-zinc-900/50 pb-2">
                  <span className="text-zinc-300 font-medium">71.4% WhatsApp Redirection</span>
                  <span className="text-zinc-400 text-right max-w-[200px]">Customers routed to the owner for order finalization with pre-filled source markers.</span>
                </div>
                <div className="flex justify-between items-start border-b border-zinc-900/50 pb-2">
                  <span className="text-zinc-300 font-medium">Zero Hallucinations</span>
                  <span className="text-zinc-400 text-right max-w-[200px]">Strict Brand Brain restrictions blocked out-of-stock dress claims and price fabrications.</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-zinc-300 font-medium">Zero Policy Failures</span>
                  <span className="text-zinc-400 text-right max-w-[200px]">100% adherence to forbidden claims, keeping the business reputation protected.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 max-w-7xl mx-auto px-6 border-t border-zinc-900">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Pricing Structure</span>
          <h2 className="text-3xl font-bold tracking-tight text-white mt-2">
            Simple Private Beta Pricing Tiers
          </h2>
          <p className="mt-4 text-zinc-400 text-sm leading-relaxed">
            All plans are billed manually during our private beta. Start with a 14-day trial to train your first agent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Plan 1 */}
          <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-6 flex flex-col justify-between relative overflow-hidden">
            <div>
              <h3 className="text-lg font-bold text-zinc-200">Starter AI Staff</h3>
              <p className="mt-2 text-zinc-400 text-xs">For single independent service businesses.</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">$49</span>
                <span className="text-zinc-500 text-xs">/month</span>
              </div>
              <ul className="mt-6 space-y-3 text-xs text-zinc-400 border-t border-zinc-900 pt-6">
                <li className="flex items-center gap-2">✓ 1 Active AI Web Assistant</li>
                <li className="flex items-center gap-2">✓ Brand Brain (Profile & FAQs)</li>
                <li className="flex items-center gap-2">✓ Standard Web Widget Embed</li>
                <li className="flex items-center gap-2">✓ Safe 500 messages/month limit</li>
                <li className="flex items-center gap-2">✓ Local state sandbox access</li>
              </ul>
            </div>
            <Link 
              href="/signup?plan=Starter" 
              className="mt-8 block rounded-lg bg-zinc-900 border border-zinc-800 text-center py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Start Private Beta
            </Link>
          </div>

          {/* Plan 2 */}
          <div className="rounded-xl border border-purple-500/30 bg-purple-950/5 p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl neon-glow">
            <div className="absolute top-0 right-0 bg-purple-600 text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg leading-none">
              Most Popular
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-200">Growth AI Staff</h3>
              <p className="mt-2 text-zinc-400 text-xs">For scaling companies and retail storefronts.</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">$149</span>
                <span className="text-zinc-500 text-xs">/month</span>
              </div>
              <ul className="mt-6 space-y-3 text-xs text-zinc-400 border-t border-zinc-900/50 pt-6">
                <li className="flex items-center gap-2">✓ Multiple Active AI Agents</li>
                <li className="flex items-center gap-2">✓ Advanced Brand Brain (DO/DONT Rules)</li>
                <li className="flex items-center gap-2">✓ Continuous Training Center loop</li>
                <li className="flex items-center gap-2">✓ Expanded 2,000 messages/month limit</li>
                <li className="flex items-center gap-2">✓ Rich Analytics & Lead Classification</li>
              </ul>
            </div>
            <Link 
              href="/signup?plan=Growth" 
              className="mt-8 block rounded-lg bg-purple-600 hover:bg-purple-500 text-center py-2.5 text-xs font-semibold text-white transition-colors"
            >
              Start Private Beta
            </Link>
          </div>

          {/* Plan 3 */}
          <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-6 flex flex-col justify-between relative overflow-hidden">
            <div>
              <h3 className="text-lg font-bold text-zinc-200">Managed AI Staff</h3>
              <p className="mt-2 text-zinc-400 text-xs">For done-for-you corporate setups.</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">$390</span>
                <span className="text-zinc-500 text-xs">/month</span>
              </div>
              <ul className="mt-6 space-y-3 text-xs text-zinc-400 border-t border-zinc-900 pt-6">
                <li className="flex items-center gap-2">✓ Done-for-you setup & ingestion</li>
                <li className="flex items-center gap-2">✓ Monthly training review & optimization</li>
                <li className="flex items-center gap-2">✓ Dedicated account manager</li>
                <li className="flex items-center gap-2">✓ Generous 10,000 messages/month limit</li>
                <li className="flex items-center gap-2">✓ Direct administrative support & SLA</li>
              </ul>
            </div>
            <Link 
              href="/signup?plan=Managed" 
              className="mt-8 block rounded-lg bg-zinc-900 border border-zinc-800 text-center py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Start Private Beta
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-zinc-950/20 border-t border-zinc-900">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center tracking-tight text-white mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-lg border border-zinc-900 bg-zinc-950 overflow-hidden"
              >
                <button
                  onClick={() => setActiveFAQ(activeFAQ === idx ? null : idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between text-sm font-semibold text-zinc-300 hover:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${activeFAQ === idx ? "rotate-180" : ""}`} />
                </button>
                {activeFAQ === idx && (
                  <div className="px-5 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-zinc-900/30 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12 bg-black text-center text-xs text-zinc-600">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-purple-500 to-indigo-600 font-bold text-white text-[10px]">
              ES
            </div>
            <span className="font-semibold text-zinc-400">EchoStaff AI</span>
          </div>
          <span>&copy; 2026 EchoStaff AI. All rights reserved. Platform powered by Antigravity AI.</span>
        </div>
      </footer>
    </div>
  );
}
