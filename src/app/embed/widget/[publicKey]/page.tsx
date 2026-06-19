import React from "react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { headers } from "next/headers";
import WidgetClient from "./widget-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ publicKey: string }>;
  searchParams: Promise<{
    greeting?: string;
    color?: string;
    name?: string;
    enabled?: string;
    agentId?: string;
  }>;
}

export default async function WidgetEmbedPage({
  params,
  searchParams,
}: PageProps) {
  const { publicKey } = await params;
  const sParams = await searchParams;

  const headersList = await headers();
  const referer = headersList.get("referer") || "";

  let config = null;
  const isPreview = publicKey === "preview";

  if (isPreview) {
    config = {
      id: "preview-widget",
      workspaceId: "preview-workspace",
      agentId: sParams.agentId || "",
      publicKey: "preview",
      enabled: sParams.enabled !== "false",
      greeting: sParams.greeting || "Hello! How can we help you today?",
      accentColor: sParams.color ? decodeURIComponent(sParams.color) : "#10b981",
      displayName: sParams.name || "AI Assistant",
      allowedDomains: [],
    };
  } else {
    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from("widget_configs")
          .select("*")
          .eq("public_key", publicKey)
          .single();
        if (data && !error) {
          config = {
            id: data.id,
            workspaceId: data.workspace_id,
            agentId: data.agent_id || "",
            publicKey: data.public_key,
            enabled: data.enabled,
            greeting: data.greeting || "Hello! How can we help you today?",
            accentColor: data.accent_color || "#10b981",
            displayName: data.display_name || "AI Assistant",
            allowedDomains: Array.isArray(data.allowed_domains) ? data.allowed_domains : [],
          };
        }
      } catch (e) {
        console.error("Widget Loader: Error reading widget config from Supabase Admin", e);
      }
    }
  }

  return <WidgetClient initialConfig={config} isPreview={isPreview} publicKey={publicKey} parentDomain={referer} />;
}
