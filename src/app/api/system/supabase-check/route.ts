import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const headers = {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  };

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const envDetected = !!url;
    const anonKeyDetected = !!anonKey;
    const serviceRoleKeyDetected = !!serviceRoleKey;
    const adminClientInitialized = isSupabaseAdminConfigured && !!supabaseAdmin;

    let databaseReachable = false;
    let profilesReachable = false;
    let workspacesReachable = false;
    let brandBrainsReachable = false;
    let agentsReachable = false;
    let conversationsReachable = false;
    let widgetConfigsReachable = false;
    let message = "Diagnostics executed.";

    if (adminClientInitialized && supabaseAdmin) {
      try {
        // Query profiles
        const { error: pError } = await supabaseAdmin.from("profiles").select("id").limit(1);
        profilesReachable = !pError;
        
        // If we can query profiles, database is reachable
        databaseReachable = true;

        // Query workspaces
        const { error: wError } = await supabaseAdmin.from("workspaces").select("id").limit(1);
        workspacesReachable = !wError;

        // Query brand_brains
        const { error: bError } = await supabaseAdmin.from("brand_brains").select("id").limit(1);
        brandBrainsReachable = !bError;

        // Query agents
        const { error: aError } = await supabaseAdmin.from("agents").select("id").limit(1);
        agentsReachable = !aError;

        // Query conversations
        const { error: cError } = await supabaseAdmin.from("conversations").select("id").limit(1);
        conversationsReachable = !cError;

        // Query widget_configs
        const { error: wcError } = await supabaseAdmin.from("widget_configs").select("id").limit(1);
        widgetConfigsReachable = !wcError;

        if (pError || wError || bError || aError || cError || wcError) {
          const failed = [];
          if (pError) failed.push("profiles");
          if (wError) failed.push("workspaces");
          if (bError) failed.push("brand_brains");
          if (aError) failed.push("agents");
          if (cError) failed.push("conversations");
          if (wcError) failed.push("widget_configs");
          message = `Some tables unreachable: ${failed.join(", ")}. Check migrations and schema.`;
        } else {
          message = "All tables reachable and database is fully online.";
        }
      } catch (dbErr: any) {
        message = "Failed to query database. Connection or schema error.";
      }
    } else {
      message = "Supabase Admin client not configured. Set environment variables.";
    }

    return NextResponse.json(
      {
        envDetected,
        anonKeyDetected,
        serviceRoleKeyDetected,
        adminClientInitialized,
        databaseReachable,
        profilesReachable,
        workspacesReachable,
        brandBrainsReachable,
        agentsReachable,
        conversationsReachable,
        widgetConfigsReachable,
        message,
      },
      { headers }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        envDetected: false,
        anonKeyDetected: false,
        serviceRoleKeyDetected: false,
        adminClientInitialized: false,
        databaseReachable: false,
        profilesReachable: false,
        workspacesReachable: false,
        brandBrainsReachable: false,
        agentsReachable: false,
        conversationsReachable: false,
        widgetConfigsReachable: false,
        message: "An unexpected server error occurred during diagnostics.",
      },
      { status: 500, headers }
    );
  }
}
