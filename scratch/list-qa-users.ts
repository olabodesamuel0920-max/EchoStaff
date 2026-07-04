import { supabaseAdmin } from "../../../../../Documents/GitHub/EchoStaff/EchoStaff/src/lib/supabase/admin";

async function main() {
  if (!supabaseAdmin) {
    console.error("[-] supabaseAdmin is not configured");
    process.exit(1);
  }

  console.log("[+] Fetching users from Supabase Auth...");
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    console.error("[-] Failed to list users:", error);
    process.exit(1);
  }

  console.log(`[+] Found ${data.users.length} users:`);
  data.users.forEach((u) => {
    console.log(`- Email: ${u.email} | ID: ${u.id} | Created: ${u.created_at} | Confirmed: ${!!u.email_confirmed_at}`);
  });
}

main().catch(console.error);
