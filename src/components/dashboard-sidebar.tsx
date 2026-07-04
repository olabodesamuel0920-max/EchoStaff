"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppState } from "@/context/state-context";
import { 
  LayoutDashboard, 
  Brain, 
  UserCheck, 
  Play, 
  MessageSquare, 
  GraduationCap, 
  BarChart3, 
  Building2, 
  ShieldAlert,
  Building,
  Menu,
  X,
  Phone,
  Globe,
  Activity,
  Rocket,
  Flag,
  Sparkles
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardSidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { trainingItems, activeWorkspaceId } = useAppState();

  const pendingTrainingCount = trainingItems[activeWorkspaceId]?.length || 0;

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const menuItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "SaaS Onboarding", href: "/dashboard/onboarding", icon: Sparkles },
    { name: "Business Profile", href: "/dashboard/business", icon: Building },
    { name: "Brand Brain", href: "/dashboard/brand-brain", icon: Brain },
    { name: "AI Staff / Agents", href: "/dashboard/agents", icon: UserCheck },
    { name: "Agent Playground", href: "/dashboard/playground", icon: Play },
    { name: "Call Lab", href: "/dashboard/call-lab", icon: Phone },
    { 
      name: "Conversations", 
      href: "/dashboard/conversations", 
      icon: MessageSquare 
    },
    { 
      name: "Training Center", 
      href: "/dashboard/training", 
      icon: GraduationCap,
      badge: pendingTrainingCount > 0 ? pendingTrainingCount : undefined
    },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Website Widget", href: "/dashboard/widget", icon: Globe },
    { name: "System Diagnostics", href: "/dashboard/system-check", icon: Activity },
    { name: "Beta Launch", href: "/dashboard/beta", icon: Rocket },
    { name: "Pilot Launch", href: "/dashboard/pilot", icon: Flag },
    { name: "Agency Mode", href: "/dashboard/agency", icon: Building2 },
  ];

  const adminItem = { name: "System Admin", href: "/admin", icon: ShieldAlert };

  const linkClass = (href: string) => {
    const isActive = pathname === href;
    return `flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
      isActive 
        ? "bg-purple-600/15 text-purple-400 border-l-2 border-purple-500 bg-gradient-to-r from-purple-950/20 to-transparent" 
        : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
    }`;
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col justify-between p-4">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-2 px-3 py-2 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 font-bold text-white shadow-md shadow-purple-500/20 glow-text">
            ES
          </div>
          <div>
            <span className="font-semibold text-lg bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              EchoStaff AI
            </span>
            <span className="block text-[10px] text-zinc-500 font-normal">
              v1.0 SaaS Foundation
            </span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-2">
            Workspace
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={linkClass(item.href)}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="rounded-full bg-purple-600 px-2 py-0.5 text-[10px] font-bold text-white leading-none">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Admin / Footer Section */}
      <div className="border-t border-zinc-900 pt-4">
        <Link
          href={adminItem.href}
          onClick={onClose}
          className={`${linkClass(adminItem.href)} mb-4`}
        >
          <div className="flex items-center gap-3">
            <adminItem.icon className="h-4 w-4 text-purple-400" />
            <span>{adminItem.name}</span>
          </div>
        </Link>
        
        <div className="rounded-lg bg-zinc-900/40 border border-zinc-900/60 p-3 text-center">
          <span className="block text-[11px] text-zinc-500">Logged in as Owner</span>
          <span className="block text-xs font-semibold text-zinc-300 truncate">admin@echostaff.ai</span>
          <div className="mt-2 flex items-center justify-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-ring" />
            <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Local Mock Mode</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside 
        className={`fixed bottom-0 top-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-900 transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute top-4 right-4 md:hidden">
          <button 
            onClick={onClose} 
            className="rounded-lg p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <SidebarContent />
      </aside>
    </>
  );
};
