"use client";

import React, { useState, useEffect } from "react";
import { useAppState } from "@/context/state-context";
import { Building, Tag, FileText, Check, Plus, Trash2 } from "lucide-react";

export default function BusinessProfilePage() {
  const { brandBrains, activeWorkspaceId, updateBusinessProfile } = useAppState();
  
  const brain = brandBrains[activeWorkspaceId];
  const profile = brain?.profile;

  // Local Form state
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [overview, setOverview] = useState("");
  const [pricingNotes, setPricingNotes] = useState("");
  const [policies, setPolicies] = useState("");
  const [ownerNotes, setOwnerNotes] = useState("");
  const [products, setProducts] = useState<string[]>([]);
  const [newProduct, setNewProduct] = useState("");
  const [saved, setSaved] = useState(false);

  // Sync state with active workspace change
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setIndustry(profile.industry || "");
      setOverview(profile.overview || "");
      setPricingNotes(profile.pricingNotes || "");
      setPolicies(profile.policies || "");
      setOwnerNotes(profile.ownerNotes || "");
      setProducts(profile.products || []);
    }
  }, [profile, activeWorkspaceId]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile({
      name,
      industry,
      overview,
      pricingNotes,
      products,
      policies,
      ownerNotes,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddProduct = () => {
    if (!newProduct.trim()) return;
    setProducts([...products, newProduct.trim()]);
    setNewProduct("");
  };

  const handleRemoveProduct = (index: number) => {
    setProducts(products.filter((_, idx) => idx !== index));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building className="h-5 w-5 text-purple-400" />
            <span>Business Profile</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Configure the metadata and inventory context for your AI employee.
          </p>
        </div>

        {saved && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
            <Check className="h-3.5 w-3.5" />
            <span>Profile Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Metadata */}
        <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Company Metadata
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Business Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Luna Aesthetics"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Industry Sector
              </label>
              <input
                type="text"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Business Overview & Value Proposition
            </label>
            <textarea
              required
              rows={4}
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              placeholder="What does your company do? What is the core mission?"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-purple-600"
            />
          </div>
        </div>

        {/* Catalog & Inventory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Products / Services List */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-2">
              <Tag className="h-4 w-4 text-purple-400" />
              <span>Products & Services</span>
            </h3>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Product description and price"
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
              <button
                type="button"
                onClick={handleAddProduct}
                className="rounded-lg bg-purple-600 hover:bg-purple-500 px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {products.length === 0 ? (
                <p className="text-xs text-zinc-600 italic">No products listed yet.</p>
              ) : (
                products.map((prod, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-zinc-900/30 border border-zinc-900 p-2.5 rounded-lg">
                    <span className="text-xs text-zinc-300 leading-normal">{prod}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(idx)}
                      className="rounded p-1 text-zinc-500 hover:text-rose-400 hover:bg-zinc-900/60 transition-colors shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pricing Policy Rules */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-400" />
              <span>Pricing & Onboarding Notes</span>
            </h3>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                Consultation charges, package notes, deposits
              </label>
              <textarea
                rows={6}
                value={pricingNotes}
                onChange={(e) => setPricingNotes(e.target.value)}
                placeholder="Include setup fees, trial parameters, consultation details, and refund policy constraints."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>
          </div>
        </div>

        {/* Policies & Owner Notes Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Policies */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-400" />
              <span>Business Policies</span>
            </h3>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                Refunds, cancellations, age limits, standard policies
              </label>
              <textarea
                rows={5}
                value={policies}
                onChange={(e) => setPolicies(e.target.value)}
                placeholder="Describe cancellation notice requirements, fee models, minimum age, or procedure limits."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>
          </div>

          {/* Owner Notes */}
          <div className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-400" />
              <span>Owner Notes & Directives</span>
            </h3>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                Special internal guidance for agent behavior
              </label>
              <textarea
                rows={5}
                value={ownerNotes}
                onChange={(e) => setOwnerNotes(e.target.value)}
                placeholder="Include key highlights, nurse certification details, or specific restrictions to avoid."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex justify-end pt-4 border-t border-zinc-900">
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-all shadow-md shadow-purple-500/10 cursor-pointer"
          >
            Save Profile Configurations
          </button>
        </div>
      </form>
    </div>
  );
}
