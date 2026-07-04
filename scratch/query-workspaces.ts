import { supabaseAdmin } from "../../../../../Documents/GitHub/EchoStaff/EchoStaff/src/lib/supabase/admin";

async function main() {
  if (!supabaseAdmin) {
    console.error("[-] supabaseAdmin is not configured");
    process.exit(1);
  }

  const { data, error } = await supabaseAdmin.from("workspaces").select("*");

  if (error) {
    console.error("[-] Failed to fetch workspaces:", error);
    process.exit(1);
  }

  console.log(`[+] Found ${data.length} workspaces:`);
  data.forEach((w) => {
    console.log(`- ID: ${w.id} | Name: ${w.name} | OwnerID: ${w.owner_id} | Plan: ${w.plan} | Status: ${w.billing_status}`);
  });

  const { data: brains, error: brainsErr } = await supabaseAdmin.from("brand_brains").select("*");
  if (brainsErr) {
    console.error("[-] Failed to fetch brand brains:", brainsErr);
    process.exit(1);
  }
  console.log(`[+] Found ${brains.length} brand brains:`);
  brains.forEach((b) => {
    console.log(`- WorkspaceID: ${b.workspace_id} | Business Overview: ${b.business_overview} | OwnerNotes: ${b.owner_notes}`);
  });
}

main().catch(console.error);
