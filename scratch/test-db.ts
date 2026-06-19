import { supabaseAdmin } from "../src/lib/supabase/admin";

async function main() {
  if (!supabaseAdmin) {
    console.error("supabaseAdmin is not configured");
    return;
  }
  const { data, error } = await supabaseAdmin.from("profiles").select("*").limit(1);
  if (error) {
    console.error("Error querying profiles:", error);
  } else {
    console.log("Profiles queried successfully:", data);
  }
}

main();
