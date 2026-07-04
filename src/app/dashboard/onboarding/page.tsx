"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/context/state-context";
import { 
  createWorkspace, 
  upsertBrandBrain, 
  insertAgent, 
  upsertWidgetConfig 
} from "@/lib/supabase/db-service";
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Check, 
  Building2, 
  ShoppingBag, 
  ShieldCheck, 
  Bot, 
  ArrowRight, 
  Globe, 
  FileText,
  AlertCircle
} from "lucide-react";

interface ProductInput {
  name: string;
  price: string;
  description: string;
}

interface FAQInput {
  question: string;
  answer: string;
}

export default function OnboardingWizard() {
  const router = useRouter();
  const { user, refetchData, setActiveWorkspaceId, shouldUseSupabase } = useAppState();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: General
    businessName: "",
    industry: "Fashion & Retail",
    domain: "",
    overview: "",

    // Step 2: Products & Pricing
    products: [
      { name: "Signature Silk Boubou Gown", price: "₦45,000", description: "Elegant free-flowing premium silk boubou dress." },
      { name: "Classic Linen Loungewear Set", price: "₦32,000", description: "Breathable linen matching top and trouser set." }
    ] as ProductInput[],
    pricingNotes: "Delivery within Lagos takes 1-2 days (₦3,500). Nationwide delivery takes 3-5 days (₦6,000).",

    // Step 3: Policies & Rules
    policies: "No refunds on custom-tailored alterations. Returns accepted within 3 days for store credit only if unworn.",
    doRules: [
      "Always suggest viewing our latest dress collection",
      "Route high-intent buyers to our WhatsApp channel to complete payment"
    ],
    dontRules: [
      "Never promise same-day delivery unless explicitly authorized",
      "Never offer discounts beyond official seasonal sales"
    ],
    faqs: [
      { question: "Do you deliver to Abuja?", answer: "Yes! We deliver nationwide to Abuja within 3-5 business days for a flat rate of ₦6,000." },
      { question: "Can I customize the sizing?", answer: "Yes, custom sizing is available for our premium range. Please provide your measurements when redirected to our styling team on WhatsApp." }
    ] as FAQInput[],

    // Step 4: Agent & Handoff
    agentName: "Zara",
    agentRole: "Fashion Stylist & Brand Concierge",
    agentPersonality: "Zara is warm, stylish, highly professional, and extremely knowledgeable about fabrics and sizing.",
    agentTone: "Empathetic, sophisticated, and direct",
    handoffName: "Store Manager",
    handoffContact: "+234 801 234 5678",
    handoffRules: "Transfer to WhatsApp once the customer has selected a dress type and specified their size."
  });

  // Helper inputs for dynamic arrays
  const [newDoRule, setNewDoRule] = useState("");
  const [newDontRule, setNewDontRule] = useState("");
  const [newProduct, setNewProduct] = useState<ProductInput>({ name: "", price: "", description: "" });
  const [newFaq, setNewFaq] = useState<FAQInput>({ question: "", answer: "" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Product actions
  const addProduct = () => {
    if (newProduct.name && newProduct.price) {
      setFormData(prev => ({ ...prev, products: [...prev.products, newProduct] }));
      setNewProduct({ name: "", price: "", description: "" });
    }
  };

  const removeProduct = (idx: number) => {
    setFormData(prev => ({ ...prev, products: prev.products.filter((_, i) => i !== idx) }));
  };

  // Rule actions
  const addDoRule = () => {
    if (newDoRule.trim()) {
      setFormData(prev => ({ ...prev, doRules: [...prev.doRules, newDoRule.trim()] }));
      setNewDoRule("");
    }
  };

  const addDontRule = () => {
    if (newDontRule.trim()) {
      setFormData(prev => ({ ...prev, dontRules: [...prev.dontRules, newDontRule.trim()] }));
      setNewDontRule("");
    }
  };

  // FAQ actions
  const addFaq = () => {
    if (newFaq.question && newFaq.answer) {
      setFormData(prev => ({ ...prev, faqs: [...prev.faqs, newFaq] }));
      setNewFaq({ question: "", answer: "" });
    }
  };

  const removeFaq = (idx: number) => {
    setFormData(prev => ({ ...prev, faqs: prev.faqs.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!formData.businessName.trim()) {
        throw new Error("Business Name is required.");
      }

      if (shouldUseSupabase && user) {
        // 1. Create Workspace
        const ws = await createWorkspace(user.id, formData.businessName, formData.industry);
        if (!ws) throw new Error("Failed to create workspace.");

        // 2. Format and Upsert Brand Brain
        const brain = {
          profile: {
            name: formData.businessName,
            industry: formData.industry,
            overview: formData.overview,
            products: formData.products.map(p => `${p.name} - ${p.price}: ${p.description}`),
            pricingNotes: formData.pricingNotes,
            policies: formData.policies,
            ownerNotes: "Configured via Client Onboarding Wizard.",
          },
          toneOfVoice: formData.agentTone,
          doRules: formData.doRules.filter(r => r.trim() !== ""),
          dontRules: formData.dontRules.filter(r => r.trim() !== ""),
          faqs: formData.faqs.map((f, idx) => ({ id: `faq-${idx}-${Date.now()}`, question: f.question, answer: f.answer })),
          exampleReplies: [`Hello! I am ${formData.agentName}, your personal stylist. How can I help you today?`],
          handoffName: formData.handoffName,
          handoffContact: formData.handoffContact,
          handoffRules: formData.handoffRules,
        };
        await upsertBrandBrain(ws.id, brain);

        // 3. Create Agent
        const agent = {
          id: `agent-${Date.now()}`,
          name: formData.agentName,
          role: formData.agentRole,
          personality: formData.agentPersonality,
          tone: formData.agentTone,
          channels: ["Web chat"],
          status: "Active" as const,
          linkedBrainId: ws.id,
          callReadiness: 90,
          lastSimulationResult: "",
          needsTraining: false,
        };
        const newAgent = await insertAgent(agent);
        if (!newAgent) throw new Error("Failed to create agent.");

        // 4. Create Widget Config
        const widgetConfig = {
          id: `widget-${Date.now()}`,
          workspaceId: ws.id,
          agentId: newAgent.id,
          publicKey: `pk_${ws.id.replace(/-/g, "").substring(0, 16)}_${Date.now().toString().slice(-4)}`,
          enabled: true,
          greeting: `Hello! Welcome to ${formData.businessName}. I am ${formData.agentName}, your AI assistant. How can I assist you with our catalog today?`,
          accentColor: "#8b5cf6",
          displayName: formData.agentName,
          allowedDomains: formData.domain ? [formData.domain] : [],
        };
        await upsertWidgetConfig(widgetConfig);

        // 5. Synchronize React Context State
        await refetchData();
        setActiveWorkspaceId(ws.id);
      } else {
        // Mock / Sandbox Mode Fallback
        throw new Error("SaaS Onboarding requires an active cloud database connection. Please log in first.");
      }

      setStep(5); // Go to Success Screen
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during onboarding.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !formData.businessName.trim()) {
      setError("Please enter your Business Name.");
      return;
    }
    setError(null);
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setError(null);
    setStep(prev => prev - 1);
  };

  return (
    <div className="bg-black min-h-screen text-zinc-200 p-6 md:p-12 relative overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full filter blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-6 gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-400" />
              <span>SaaS Client Onboarding Wizard</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Initialize a fully functional AI employee, Brand Brain, and web chat widget in minutes.
            </p>
          </div>
          
          {step <= 4 && (
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className={`h-2 w-12 rounded-full transition-colors ${
                    step === i 
                      ? "bg-purple-600 shadow-lg shadow-purple-500/20" 
                      : step > i 
                        ? "bg-purple-950" 
                        : "bg-zinc-800"
                  }`}
                />
              ))}
              <span className="text-xs font-bold text-purple-400 ml-2">Step {step} of 4</span>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-rose-400">Onboarding Warning</h4>
              <p className="text-xs text-rose-300 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Step 1: General Business Details */}
        {step === 1 && (
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 md:p-8 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-900 pb-3">
              <Building2 className="h-5 w-5 text-purple-400" />
              <span>General Business Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase">Business Name *</label>
                <input 
                  type="text" 
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="e.g. Luna Aesthetics Clinic"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase">Industry Category</label>
                <select 
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 focus:border-purple-500 focus:outline-none"
                >
                  <option value="Fashion & Retail">Fashion & Retail</option>
                  <option value="Salons & Spas">Salons & Spas</option>
                  <option value="Restaurants & Catering">Restaurants & Catering</option>
                  <option value="Schools & Academies">Schools & Academies</option>
                  <option value="Professional Services">Professional Services</option>
                  <option value="Other">Other Category</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  <span>Allowed Domain (Widget Security)</span>
                </label>
                <input 
                  type="text" 
                  name="domain"
                  value={formData.domain}
                  onChange={handleInputChange}
                  placeholder="e.g. lunaspa.com"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 focus:border-purple-500 focus:outline-none"
                />
                <span className="block text-[10px] text-zinc-500">Limits the web widget to load only on your official website. Leave blank to allow any referrer domain during sandbox testing.</span>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-zinc-400 uppercase">Business Overview / Core Pitch</label>
                <textarea 
                  name="overview"
                  rows={4}
                  value={formData.overview}
                  onChange={handleInputChange}
                  placeholder="Provide a detailed overview of your business, value proposition, location, and operating hours..."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-900">
              <button 
                onClick={nextStep}
                className="rounded-lg bg-purple-600 hover:bg-purple-500 px-5 py-2.5 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Continue to Products</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Product Catalog & Pricing */}
        {step === 2 && (
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 md:p-8 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-900 pb-3">
              <ShoppingBag className="h-5 w-5 text-purple-400" />
              <span>Product Catalog & Pricing Guide</span>
            </h3>

            {/* Existing products list */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-400 uppercase block">Active Catalog Items</label>
              {formData.products.length === 0 ? (
                <div className="text-center py-6 bg-zinc-950/40 rounded-lg border border-dashed border-zinc-800 text-xs text-zinc-500">
                  No products added yet. Add items below to populate the Brand Brain.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {formData.products.map((prod, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-zinc-900/20 border border-zinc-900 rounded-lg p-3">
                      <div>
                        <span className="text-xs font-bold text-zinc-200 block">{prod.name}</span>
                        <span className="text-[10px] text-zinc-500 block mt-0.5">{prod.description}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-purple-400">{prod.price}</span>
                        <button 
                          onClick={() => removeProduct(idx)}
                          className="text-zinc-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add product form */}
            <div className="bg-zinc-950/60 border border-zinc-900 rounded-lg p-4 space-y-3">
              <span className="text-xs font-bold text-zinc-300 block">Add Catalog Product/Service</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input 
                  type="text" 
                  placeholder="Product Name (e.g. Classic Silk Dress)"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs focus:border-purple-500 focus:outline-none"
                />
                <input 
                  type="text" 
                  placeholder="Price (e.g. ₦45,000 or $120)"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs focus:border-purple-500 focus:outline-none"
                />
                <button 
                  onClick={addProduct}
                  className="rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-center py-2 text-xs font-bold text-zinc-200 transition-colors flex justify-center items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add to List</span>
                </button>
              </div>
              <input 
                type="text" 
                placeholder="Brief description of fabrics, inclusions, or variations..."
                value={newProduct.description}
                onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Pricing notes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Payment & Delivery Policy Notes</label>
              <textarea 
                name="pricingNotes"
                rows={3}
                value={formData.pricingNotes}
                onChange={handleInputChange}
                placeholder="Describe shipping rates, deposit requirements, or payment terms..."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-zinc-900">
              <button 
                onClick={prevStep}
                className="rounded-lg border border-zinc-800 hover:bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <button 
                onClick={nextStep}
                className="rounded-lg bg-purple-600 hover:bg-purple-500 px-5 py-2.5 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Continue to Policies</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Policies & Forbidden Claims */}
        {step === 3 && (
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 md:p-8 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-900 pb-3">
              <ShieldCheck className="h-5 w-5 text-purple-400" />
              <span>Policies & Forbidden Claims</span>
            </h3>

            {/* Policies */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">Return & Booking Policies</label>
              <textarea 
                name="policies"
                rows={3}
                value={formData.policies}
                onChange={handleInputChange}
                placeholder="State your cancellation, return, or consultation deposit rules..."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 focus:border-purple-500 focus:outline-none resize-none"
              />
            </div>

            {/* Guidelines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Do Rules */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-emerald-400 uppercase block">AI Do Rules (Strict Prompts)</label>
                <div className="bg-zinc-900/10 border border-zinc-900 rounded-lg p-3 space-y-2 max-h-[160px] overflow-y-auto">
                  {formData.doRules.map((rule, idx) => (
                    <div key={idx} className="text-xs text-zinc-400 flex gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Add operational do-rule..."
                    value={newDoRule}
                    onChange={(e) => setNewDoRule(e.target.value)}
                    className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs focus:border-purple-500 focus:outline-none"
                  />
                  <button 
                    onClick={addDoRule}
                    className="rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Dont Rules */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-rose-400 uppercase block">AI Forbidden Claims (Don't Rules)</label>
                <div className="bg-zinc-900/10 border border-zinc-900 rounded-lg p-3 space-y-2 max-h-[160px] overflow-y-auto">
                  {formData.dontRules.map((rule, idx) => (
                    <div key={idx} className="text-xs text-zinc-400 flex gap-1.5">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Add forbidden claim restriction..."
                    value={newDontRule}
                    onChange={(e) => setNewDontRule(e.target.value)}
                    className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs focus:border-purple-500 focus:outline-none"
                  />
                  <button 
                    onClick={addDontRule}
                    className="rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* FAQs */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-zinc-400 uppercase block">Frequently Asked Questions (Faqs)</label>
              {formData.faqs.length > 0 && (
                <div className="space-y-2">
                  {formData.faqs.map((faq, idx) => (
                    <div key={idx} className="bg-zinc-900/20 border border-zinc-900 rounded-lg p-3 flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-zinc-300 block">Q: {faq.question}</span>
                        <span className="text-[11px] text-zinc-400 block mt-1">A: {faq.answer}</span>
                      </div>
                      <button 
                        onClick={() => removeFaq(idx)}
                        className="text-zinc-500 hover:text-rose-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 space-y-3">
                <span className="text-xs font-bold text-zinc-300 block">Add Structured FAQ</span>
                <div className="grid grid-cols-1 gap-3">
                  <input 
                    type="text" 
                    placeholder="Question (e.g. Do you open on Sundays?)"
                    value={newFaq.question}
                    onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs focus:border-purple-500 focus:outline-none"
                  />
                  <textarea 
                    rows={2}
                    placeholder="Answer (e.g. Yes, our Lagos showroom is open on Sundays from 12 PM to 5 PM.)"
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs focus:border-purple-500 focus:outline-none resize-none"
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={addFaq}
                      className="rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-4 py-2 text-xs font-bold text-zinc-300 transition-colors cursor-pointer"
                    >
                      Add FAQ
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-zinc-900">
              <button 
                onClick={prevStep}
                className="rounded-lg border border-zinc-800 hover:bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <button 
                onClick={nextStep}
                className="rounded-lg bg-purple-600 hover:bg-purple-500 px-5 py-2.5 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Continue to Stylist Details</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: AI Agent & Handoff Details */}
        {step === 4 && (
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 md:p-8 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-900 pb-3">
              <Bot className="h-5 w-5 text-purple-400" />
              <span>AI Employee Config & Handoff Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase">Assistant Name</label>
                <input 
                  type="text" 
                  name="agentName"
                  value={formData.agentName}
                  onChange={handleInputChange}
                  placeholder="e.g. Zara"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase">Role Description</label>
                <input 
                  type="text" 
                  name="agentRole"
                  value={formData.agentRole}
                  onChange={handleInputChange}
                  placeholder="e.g. Fashion Stylist & Brand Concierge"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-zinc-400 uppercase">Personality & Guidelines</label>
                <textarea 
                  name="agentPersonality"
                  rows={2}
                  value={formData.agentPersonality}
                  onChange={handleInputChange}
                  placeholder="Zara is friendly, loves color matching, and has a premium vocabulary..."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-zinc-400 uppercase">Tone & Mannerisms</label>
                <input 
                  type="text" 
                  name="agentTone"
                  value={formData.agentTone}
                  onChange={handleInputChange}
                  placeholder="e.g. Professional & sophisticated"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-200 focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Handoff Details */}
              <div className="md:col-span-2 border-t border-zinc-900 pt-4 space-y-4">
                <h4 className="text-xs font-bold uppercase text-purple-400 tracking-wider">Order Handoff Target</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Recipient Name</label>
                    <input 
                      type="text" 
                      name="handoffName"
                      value={formData.handoffName}
                      onChange={handleInputChange}
                      placeholder="e.g. Samuel (Business Owner)"
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs text-zinc-200 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">WhatsApp Link / Contact</label>
                    <input 
                      type="text" 
                      name="handoffContact"
                      value={formData.handoffContact}
                      onChange={handleInputChange}
                      placeholder="e.g. +234 801 234 5678"
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs text-zinc-200 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Handoff Triggers / Rules</label>
                  <textarea 
                    name="handoffRules"
                    rows={2}
                    value={formData.handoffRules}
                    onChange={handleInputChange}
                    placeholder="e.g. When the user wants to buy, select size, or asks for payment coordinates..."
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs text-zinc-200 focus:border-purple-500 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-zinc-900">
              <button 
                onClick={prevStep}
                className="rounded-lg border border-zinc-800 hover:bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-lg bg-purple-600 hover:bg-purple-500 px-6 py-2.5 text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-lg shadow-purple-500/10 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Provisioning Node...</span>
                ) : (
                  <>
                    <span>Submit & Provision AI Agent</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Success & Checklist */}
        {step === 5 && (
          <div className="glass-panel border border-zinc-900 rounded-xl p-8 md:p-10 space-y-6 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 animate-pulse">
              <Check className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Workspace Node Provisioned!</h2>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                Your Brand Brain and AI stylist <strong>{formData.agentName}</strong> are active. The web widget is configured and ready for embed.
              </p>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-900 rounded-lg p-6 max-w-xl mx-auto text-left space-y-4">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest block border-b border-zinc-900 pb-2">
                Initial Testing Checklist
              </span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Test your new assistant in the <strong>Agent Playground</strong> with the following queries to verify safety thresholds and knowledge bounds:
              </p>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold mt-0.5">1.</span>
                  <span><strong>Catalog Check:</strong> &ldquo;What dresses do you sell and what are their prices?&rdquo; (Should list the products you added).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold mt-0.5">2.</span>
                  <span><strong>Boundary Test:</strong> &ldquo;Do you sell shoes?&rdquo; (Should refuse gracefully without hallucinating).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold mt-0.5">3.</span>
                  <span><strong>Handoff Test:</strong> &ldquo;I want to buy the Signature Gown, how do I pay?&rdquo; (Should guide you to WhatsApp).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold mt-0.5">4.</span>
                  <span><strong>Policy Adherence:</strong> &ldquo;Can I get a refund if I alter the gown?&rdquo; (Should state the no-refund rule).</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 flex justify-center gap-4">
              <button 
                onClick={() => router.push("/dashboard/playground")}
                className="rounded-lg bg-purple-600 hover:bg-purple-500 px-6 py-3 text-xs font-bold text-white transition-all shadow-lg shadow-purple-500/20 cursor-pointer"
              >
                Go to Agent Playground
              </button>
              <button 
                onClick={() => router.push("/dashboard")}
                className="rounded-lg border border-zinc-800 hover:bg-zinc-900 px-6 py-3 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                Go to Dashboard Overview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
