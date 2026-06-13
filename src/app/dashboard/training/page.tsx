"use client";

import React, { useState, useEffect } from "react";
import { useAppState } from "@/context/state-context";
import { GraduationCap, Sparkles, Check, CheckCircle2, ShieldAlert, AlertTriangle } from "lucide-react";

export default function TrainingCenterPage() {
  const { 
    trainingItems, 
    activeWorkspaceId, 
    activeWorkspace, 
    approveTrainingItem, 
    improveTrainingItem, 
    rejectTrainingItem 
  } = useAppState();

  const workspaceTraining = trainingItems[activeWorkspaceId] || [];
  
  // Track inputs for each card by trainingItem ID
  const [corrections, setCorrections] = useState<Record<string, string>>({});

  useEffect(() => {
    // Populate default corrections from seed if any
    const initialCorr: Record<string, string> = {};
    workspaceTraining.forEach((item) => {
      initialCorr[item.id] = item.ownerCorrection || "";
    });
    setCorrections(initialCorr);
  }, [workspaceTraining, activeWorkspaceId]);

  const handleCorrectionChange = (id: string, text: string) => {
    setCorrections(prev => ({
      ...prev,
      [id]: text
    }));
  };

  const handleImprove = (id: string) => {
    const text = corrections[id];
    if (!text || !text.trim()) return;
    improveTrainingItem(id, text.trim());
  };

  const trainingScore = activeWorkspace?.trainingStatus || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header and score */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-900 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-purple-400" />
            <span>AI Training Center</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Audit AI output logs, write direct owner corrections, and update your Brand Brain.
          </p>
        </div>

        {/* Brain Score Badge */}
        <div className="flex items-center gap-3 bg-zinc-900/40 border border-zinc-900 px-4 py-2 rounded-lg shrink-0">
          <div>
            <span className="block text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Accuracy Score</span>
            <span className="text-sm font-extrabold text-white">{trainingScore}%</span>
          </div>
          <span className="h-7 w-px bg-zinc-850" />
          <span className={`h-2.5 w-2.5 rounded-full ${trainingScore >= 90 ? "bg-emerald-500" : trainingScore >= 75 ? "bg-amber-500" : "bg-rose-500"} animate-pulse-ring`} />
        </div>
      </div>

      {/* Intro prompt */}
      <div className="rounded-lg bg-purple-600/5 border border-purple-500/10 p-4 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-purple-400">Interactive Alignment Protocol</h4>
          <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
            Whenever a customer inquires about sensitive topics (like custom billing, refunds, or pregnancy safety), the AI uses guidelines but drafts a flag. By correcting it below, the correction instantly feeds into the Brand Brain, and teaches the Playground model.
          </p>
        </div>
      </div>

      {/* Cards list */}
      <div className="space-y-6">
        {workspaceTraining.map((item) => (
          <div 
            key={item.id}
            className="glass-panel border border-zinc-900 rounded-xl p-6 shadow-lg space-y-4 relative overflow-hidden"
          >
            {/* Header / Q */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Customer Question:</span>
              <p className="text-sm font-bold text-zinc-200">
                &ldquo;{item.customerQuestion}&rdquo;
              </p>
            </div>

            {/* AI Answer bubble */}
            <div className="rounded-lg bg-zinc-900/30 border border-zinc-900 p-4">
              <span className="block text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-1.5">AI Proposed Answer:</span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {item.aiAnswer}
              </p>
            </div>

            {/* Owner correction input */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                Owner Correction & Instruction:
              </label>
              <textarea
                rows={3}
                value={corrections[item.id] || ""}
                onChange={(e) => handleCorrectionChange(item.id, e.target.value)}
                placeholder="Write the correct, branded answer. (e.g. Chemical peels are contraindicated during pregnancy. We suggest a booking for our pregnancy-safe Hydrafacial instead.)"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>

            {/* Actions panel */}
            <div className="flex flex-wrap justify-between items-center gap-3 border-t border-zinc-900/50 pt-4">
              <div className="flex gap-2">
                <button
                  onClick={() => handleImprove(item.id)}
                  disabled={!corrections[item.id]?.trim()}
                  className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow shadow-purple-500/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Improve Answer & Learn
                </button>
                
                <button
                  onClick={() => approveTrainingItem(item.id)}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/20 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  Approve Draft Answer
                </button>
              </div>

              <button
                onClick={() => rejectTrainingItem(item.id)}
                className="rounded-lg border border-zinc-850 hover:bg-rose-950/20 hover:text-rose-400 hover:border-rose-900/30 px-4 py-2 text-xs font-semibold text-zinc-500 transition-colors cursor-pointer"
              >
                Never Say This
              </button>
            </div>
          </div>
        ))}

        {workspaceTraining.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center border border-dashed border-zinc-900 rounded-xl bg-zinc-950/20 space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-500/20 animate-pulse-ring" />
            <h3 className="text-sm font-bold text-zinc-300">All Answers Aligned</h3>
            <p className="text-xs text-zinc-500 max-w-[250px] leading-relaxed">
              Your AI staff members are currently executing instructions safely with 100% compliance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
