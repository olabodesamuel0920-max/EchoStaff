import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const qaEmail = process.env.QA_EMAIL!;
const qaPassword = process.env.QA_PASSWORD!;
const WORKSPACE_ID = "1316bbb4-b45f-4299-acc5-f8292179900c";

async function main() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });

  console.log(`[+] Signing in as ${qaEmail}...`);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: qaEmail,
    password: qaPassword
  });

  if (authError) {
    console.error("[-] Authentication failed:", authError);
    process.exit(1);
  }

  console.log("[+] Auth successful. User ID:", authData.user.id);

  console.log(`[+] Attempting to update workspace name for ${WORKSPACE_ID}...`);
  const { data: updateData, error: updateError } = await supabase
    .from("workspaces")
    .update({
      name: "Eka Kitchen & Catering QA",
      industry: "Fashion / clothing ecommerce",
      updated_at: new Date().toISOString()
    })
    .eq("id", WORKSPACE_ID)
    .select();

  if (updateError) {
    console.error("[-] Update failed with database error:");
    console.error(JSON.stringify(updateError, null, 2));
  } else {
    console.log("[+] Update succeeded! Returned data:");
    console.log(JSON.stringify(updateData, null, 2));
  }
}

main().catch(console.error);
