"use client";

import React, { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard-topbar";
import { useAppState } from "@/context/state-context";
import { RefreshCw, LogOut, AlertOctagon } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { onboardingError, retryOnboarding, authLoading, logout } = useAppState();

  if (onboardingError) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center bg-black text-white relative overflow-hidden p-6">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full filter blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-md bg-zinc-950/80 border border-red-900/30 rounded-2xl p-8 shadow-2xl relative z-10 backdrop-blur-xl">
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-xl bg-red-950/30 border border-red-800/40 flex items-center justify-center text-red-500 mb-4 animate-pulse">
              <AlertOctagon className="h-6 w-6" />
            </div>
            
            <h2 className="text-xl font-bold tracking-tight text-zinc-100">
              Workspace Setup Failed
            </h2>
            
            <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
              We couldn't set up your default workspace automatically. This might be due to a database connection hiccup or configuration mismatch.
            </p>

            <div className="mt-4 w-full rounded-lg bg-zinc-900/50 border border-zinc-800/50 p-3 text-left">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Error Details</p>
              <p className="mt-1 text-xs text-red-400 font-mono break-words leading-tight">{onboardingError}</p>
            </div>

            <div className="mt-8 flex flex-col gap-3 w-full">
              <button
                onClick={retryOnboarding}
                disabled={authLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {authLoading ? "Initializing..." : "Retry Onboarding"}
              </button>

              <button
                onClick={logout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/80 px-4 py-3 text-sm font-semibold text-zinc-400 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Logout to Demo Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-zinc-950 overflow-hidden">
      {/* Sidebar Navigation */}
      <DashboardSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Viewport Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar Operations */}
        <DashboardTopbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto bg-zinc-950/20 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
