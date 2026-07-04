import { supabaseAdmin } from "../src/lib/supabase/admin";

async function main() {
  if (!supabaseAdmin) {
    console.error("supabaseAdmin is not configured");
    return;
  }
  const { data, error } = await supabaseAdmin.from("workspaces").select("*").limit(1);
  if (error) {
    console.error("Error querying workspaces:", error);
  } else {
    if (data && data.length > 0) {
      console.log("Workspace columns found in database:");
      console.log(Object.keys(data[0]));
      console.log("\nSample workspace data:");
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log("No workspaces found in the database, but the table query succeeded.");
    }
  }
}

main();
