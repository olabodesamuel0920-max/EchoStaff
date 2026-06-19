import { supabaseAdmin } from "../src/lib/supabase/admin";

async function main() {
  if (!supabaseAdmin) {
    console.error("Supabase admin client not initialized.");
    return;
  }
  
  console.log("Querying profiles table...");
  const { data, error } = await supabaseAdmin.from("profiles").select("id").limit(1);
  if (error) {
    console.error("Query failed with error:", error);
  } else {
    console.log("Query succeeded! Data:", data);
  }
}

main();
