"use client";

import React, { useState, useEffect } from "react";
import { useAppState } from "@/context/state-context";
import { 
  Brain, 
  Sparkles, 
  ShieldAlert, 
  MessageSquare, 
  HelpCircle, 
  Check, 
  Plus, 
  Trash2,
  AlertOctagon,
  Award
} from "lucide-react";

export default function BrandBrainPage() {
  const { 
    brandBrains, 
    activeWorkspaceId, 
    updateToneOfVoice,
    addFAQ,
    removeFAQ,
    addDoRule,
    removeDoRule,
    addDontRule,
    removeDontRule
  } = useAppState();

  const brain = brandBrains[activeWorkspaceId];

  const [activeTab, setActiveTab] = useState<"guidelines" | "guardrails" | "faqs">("guidelines");
  
  // Local states
  const [tone, setTone] = useState("");
  const [newDo, setNewDo] = useState("");
  const [newDont, setNewDont] = useState("");
  const [faqQ, setFaqQ] = useState("");
  const [faqA, setFaqA] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (brain) {
      setTone(brain.toneOfVoice || "");
    }
  }, [brain, activeWorkspaceId]);

  const handleSaveTone = (e: React.FormEvent) => {
    e.preventDefault();
    updateToneOfVoice(tone);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddDo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDo.trim()) return;
    addDoRule(newDo.trim());
    setNewDo("");
  };

  const handleAddDont = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDont.trim()) return;
    addDontRule(newDont.trim());
    setNewDont("");
  };

  const handleAddFAQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQ.trim() || !faqA.trim()) return;
    addFAQ({ question: faqQ.trim(), answer: faqA.trim() });
    setFaqQ("");
    setFaqA("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            <span>Brand Brain Control</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Build your AI's core cognitive database, constraints, and vocabulary.
          </p>
        </div>

        {saved && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
            <Check className="h-3.5 w-3.5" />
            <span>Rules Updated</span>
          </div>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-zinc-900 gap-1 bg-zinc-900/10 p-1 rounded-lg max-w-sm">
        <button
          onClick={() => setActiveTab("guidelines")}
          className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            activeTab === "guidelines" 
              ? "bg-purple-600 text-white shadow shadow-purple-500/10" 
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Guidelines
        </button>
        <button
          onClick={() => setActiveTab("guardrails")}
          className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            activeTab === "guardrails" 
              ? "bg-purple-600 text-white shadow shadow-purple-500/10" 
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Guardrails
        </button>
        <button
          onClick={() => setActiveTab("faqs")}
          className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            activeTab === "faqs" 
              ? "bg-purple-600 text-white shadow shadow-purple-500/10" 
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          FAQs Builder
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "guidelines" && (
        <div className="space-y-6">
          {/* Tone Form */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>Tone of Voice Guidelines</span>
            </h3>
            
            <form onSubmit={handleSaveTone} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                  How should your AI employees speak with customers?
                </label>
                <textarea
                  rows={4}
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="e.g. Friendly, highly structured, empathetic, using beauty/health terms, avoiding corporate jargon..."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-750 focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Update Tone Guidelines
                </button>
              </div>
            </form>
          </div>

          {/* Seed Examples (Read Only for Demo representation) */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-400" />
              <span>Example Welcomes & Responses</span>
            </h3>
            <div className="space-y-3">
              {brain?.exampleReplies && brain.exampleReplies.length > 0 ? (
                brain.exampleReplies.map((reply, idx) => (
                  <div key={idx} className="rounded-lg bg-zinc-900/20 border border-zinc-900 p-3 text-xs italic text-zinc-400">
                    &ldquo;{reply}&rdquo;
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-600 italic">No custom examples defined for this workspace.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "guardrails" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Do Rules */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-400" />
              <span>DO Rules (Constraints)</span>
            </h3>

            <form onSubmit={handleAddDo} className="flex gap-2">
              <input
                type="text"
                placeholder="Rule (e.g. Always emphasize safety)"
                value={newDo}
                onChange={(e) => setNewDo(e.target.value)}
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {brain?.doRules?.map((rule, idx) => (
                <div key={idx} className="flex justify-between items-center bg-zinc-900/10 border border-zinc-900 p-2.5 rounded-lg">
                  <span className="text-xs text-zinc-300">{rule}</span>
                  <button
                    type="button"
                    onClick={() => removeDoRule(rule)}
                    className="rounded p-1 text-zinc-500 hover:text-rose-400 hover:bg-zinc-900/60 transition-colors shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Don't Rules */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-rose-400" />
              <span>DON'T Rules (Guardrails)</span>
            </h3>

            <form onSubmit={handleAddDont} className="flex gap-2">
              <input
                type="text"
                placeholder="Rule (e.g. Never diagnose skin conditions)"
                value={newDont}
                onChange={(e) => setNewDont(e.target.value)}
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
              <button
                type="submit"
                className="rounded-lg bg-rose-600 hover:bg-rose-500 px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {brain?.dontRules?.map((rule, idx) => (
                <div key={idx} className="flex justify-between items-center bg-zinc-900/10 border border-zinc-900 p-2.5 rounded-lg">
                  <span className="text-xs text-zinc-300">{rule}</span>
                  <button
                    type="button"
                    onClick={() => removeDontRule(rule)}
                    className="rounded p-1 text-zinc-500 hover:text-rose-400 hover:bg-zinc-900/60 transition-colors shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "faqs" && (
        <div className="space-y-6">
          {/* Add FAQ form */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-purple-400" />
              <span>Add FAQ Node</span>
            </h3>
            
            <form onSubmit={handleAddFAQ} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Customer Question</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Does Botox hurt?"
                  value={faqQ}
                  onChange={(e) => setFaqQ(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">AI Verified Answer</label>
                <textarea
                  rows={2}
                  required
                  placeholder="The exact branded, accurate response."
                  value={faqA}
                  onChange={(e) => setFaqA(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Inject FAQ Node
                </button>
              </div>
            </form>
          </div>

          {/* Active FAQs list */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
              Configured FAQs ({brain?.faqs?.length || 0})
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {brain?.faqs?.map((faq) => (
                <div key={faq.id} className="bg-zinc-900/25 border border-zinc-900 rounded-lg p-4 relative flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <span className="block text-xs font-bold text-zinc-200">Q: {faq.question}</span>
                    <span className="block text-xs text-zinc-400 leading-relaxed">A: {faq.answer}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFAQ(faq.id)}
                    className="rounded p-1 text-zinc-500 hover:text-rose-400 hover:bg-zinc-900/60 transition-colors shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
