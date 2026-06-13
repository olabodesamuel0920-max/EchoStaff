"use client";

import React, { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard-topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
