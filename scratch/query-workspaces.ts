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
}

main().catch(console.error);
