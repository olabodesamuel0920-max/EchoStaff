import { supabaseAdmin } from "../../../../../Documents/GitHub/EchoStaff/EchoStaff/src/lib/supabase/admin";

async function main() {
  if (!supabaseAdmin) {
    console.error("[-] supabaseAdmin is not configured");
    process.exit(1);
  }

  console.log("[+] Restoring workspaces to original clean states...");

  // 1. Restore User B's workspace name
  const { error: err1 } = await supabaseAdmin
    .from("workspaces")
    .update({ name: "My First Workspace", industry: "Consulting" })
    .eq("id", "6b901ad6-2592-4462-84fe-c2fa3e2f50a6");

  // Restore User B's Brand Brain Profile to prevent name revert triggers
  await supabaseAdmin
    .from("brand_brains")
    .update({
      owner_notes: JSON.stringify({
        ownerNotes: "",
        profile: {
          name: "My First Workspace",
          industry: "Consulting",
          overview: "General consulting and advisory services.",
          pricingNotes: "",
          policies: "",
          products: []
        }
      })
    })
    .eq("id", "6b901ad6-2592-4462-84fe-c2fa3e2f50a6");

  if (err1) {
    console.error("[-] Failed to restore User B's workspace:", err1);
  } else {
    console.log("[+] Restored User B's workspace to 'My First Workspace'.");
  }

  // 2. Restore User A's ATC workspace name
  const { error: err2 } = await supabaseAdmin
    .from("workspaces")
    .update({ name: "ATC — All-Time Clothing", industry: "Fashion / clothing ecommerce" })
    .eq("id", "1316bbb4-b45f-4299-acc5-f8292179900c");

  // Restore User A's Brand Brain Profile to prevent name revert triggers
  await supabaseAdmin
    .from("brand_brains")
    .update({
      owner_notes: JSON.stringify({
        ownerNotes: "",
        profile: {
          name: "ATC — All-Time Clothing",
          industry: "Fashion / clothing ecommerce",
          overview: "ATC — All-Time Clothing is a luxury Nigerian ecommerce boutique specializing in ready-to-wear premium women's clothing, dresses, gowns, outfits, and fashion pieces.",
          pricingNotes: "Standard shipping is ₦3,500. Next-day delivery inside Lagos is ₦5,000.",
          policies: "Standard exchange policy is 7 days from purchase.",
          products: ["women’s clothing", "dresses", "gowns", "outfits", "fashion pieces"]
        }
      })
    })
    .eq("id", "1316bbb4-b45f-4299-acc5-f8292179900c");

  if (err2) {
    console.error("[-] Failed to restore User A's ATC workspace:", err2);
  } else {
    console.log("[+] Restored User A's ATC workspace to 'ATC — All-Time Clothing'.");
  }

  // 3. Delete additional duplicate workspaces for User A to prevent active workspace confusion
  const { error: err3 } = await supabaseAdmin
    .from("workspaces")
    .delete()
    .eq("id", "00196c11-cf2c-4e20-b033-444dc5af8bc5");

  if (err3) {
    console.error("[-] Failed to delete duplicate workspace:", err3);
  } else {
    console.log("[+] Deleted duplicate workspace '00196c11-cf2c-4e20-b033-444dc5af8bc5'.");
  }

  // 4. Clean up call scenarios and simulations to prevent accumulating duplicate test scenarios
  const qaWorkspaceIds = ["1316bbb4-b45f-4299-acc5-f8292179900c", "6b901ad6-2592-4462-84fe-c2fa3e2f50a6"];
  const { error: errScen } = await supabaseAdmin
    .from("call_scenarios")
    .delete()
    .in("workspace_id", qaWorkspaceIds);

  const { error: errSim } = await supabaseAdmin
    .from("call_simulations")
    .delete()
    .in("workspace_id", qaWorkspaceIds);

  if (errScen || errSim) {
    console.error("[-] Failed to clean call scenarios/simulations:", errScen || errSim);
  } else {
    console.log("[+] Cleaned up call scenarios and simulations for QA workspaces.");
  }
}

main().catch(console.error);
