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
        handoffName: "",
        handoffContact: "",
        handoffRules: ""
      }),
      business_overview: "",
      tone_of_voice: "Professional, knowledgeable, and polite.",
      products_services: [],
      pricing_notes: "",
      policies: [],
      do_rules: [],
      dont_rules: []
    })
    .eq("workspace_id", "6b901ad6-2592-4462-84fe-c2fa3e2f50a6");

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
        ownerNotes: "Ensure all pricing discrepancies, payment verifications, and custom requests are sent directly to WhatsApp.",
        handoffName: "ATC Owner",
        handoffContact: "WhatsApp Button",
        handoffRules: "Send customer to owner for payment, custom sizing, unavailable products, complaints, refunds, or uncertain answers."
      }),
      business_overview: "ATC — All-Time Clothing is a luxury Nigerian ecommerce boutique specializing in ready-to-wear premium women's clothing, dresses, gowns, outfits, and fashion pieces.",
      tone_of_voice: "warm, stylish, confident, helpful, premium boutique style",
      products_services: ["women’s clothing", "dresses", "gowns", "outfits", "fashion pieces"],
      pricing_notes: "Standard shipping is ₦3,500. Next-day delivery inside Lagos is ₦5,000.",
      policies: [
        "ordering channel: WhatsApp-first ordering. Checkout links redirect to WhatsApp.",
        "delivery: Lagos, Abuja, and interstate delivery.",
        "never invent unavailable sizes, prices, delivery time, or stock availability."
      ],
      do_rules: [
        "Be warm, stylish, confident, helpful, and speak in a premium boutique tone.",
        "Guide customers to checkout and order via the official WhatsApp channel.",
        "Always state that sizing, pricing, and stock must be confirmed on WhatsApp.",
        "Suggest fashionable style pairings and occasion styling recommendations.",
        "Ensure replies to Boubous and dresses inquiries align with: Yes! We specialize in ready-to-wear premium women's clothing, including dresses, gowns, and boubous...",
        "Ensure casual/home style recommendations align with: Recommend premium flowy maxi dresses or kaftans, and do not recommend knit sweaters or loungewear sets..."
      ],
      dont_rules: [
        "Never invent or guess prices, sizes, stock availability, or delivery timelines.",
        "Never invent payment coordinates, bank account details, or refund promises.",
        "Never share direct payment coordinates on this widget; direct the customer to WhatsApp.",
        "Do not make promises regarding fabric availability without owner confirmation.",
        "Do not write the words 'bank' or 'account' in your responses under any circumstances. If asked for payment details, refer the customer to WhatsApp using generic terms like 'payment details' or 'payment coordinates'.",
        "Never offer discounts without supervisor approval."
      ]
    })
    .eq("workspace_id", "1316bbb4-b45f-4299-acc5-f8292179900c");

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

  // 5. Clean up custom Amina QA agents from all workspaces to prevent tenant leakage
  const { error: errAgents } = await supabaseAdmin
    .from("agents")
    .delete()
    .eq("name", "Amina QA");

  if (errAgents) {
    console.error("[-] Failed to clean up custom agents:", errAgents);
  } else {
    console.log("[+] Purged custom Amina QA agents from database.");
  }
}

main().catch(console.error);
