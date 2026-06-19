import { supabaseAdmin, isSupabaseAdminConfigured } from "../src/lib/supabase/admin";

async function main() {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    console.error("Failure: Supabase Admin client is not configured. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  const ownerEmail = "olabodesamuel0920+echo1@gmail.com";
  console.log(`Locating owner account: ${ownerEmail}...`);

  // Find owner user ID
  const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
  if (usersError) {
    console.error(`Failure: Could not list users. ${usersError.message}`);
    process.exit(1);
  }

  const owner = usersData.users.find(u => u.email?.toLowerCase() === ownerEmail.toLowerCase());
  if (!owner) {
    console.error(`Failure: Owner account (${ownerEmail}) not found.`);
    process.exit(1);
  }

  const ownerId = owner.id;
  console.log(`Found owner user. ID: ${ownerId}`);

  // Seeding configurations
  const configs = [
    {
      workspaceName: "ATC — All-Time Clothing",
      isDev: false,
      publicKey: "atc_live_c425917797623b8473c0057a4ad5731e",
      allowedDomains: ["atc-iota.vercel.app", "www.atc-iota.vercel.app"]
    },
    {
      workspaceName: "ATC — All-Time Clothing [DEV/TEST]",
      isDev: true,
      publicKey: "atc_dev_c425917797623b8473c0057a4ad5731e",
      allowedDomains: ["localhost", "127.0.0.1"]
    }
  ];

  for (const config of configs) {
    console.log(`\n=========================================`);
    console.log(`Seeding workspace: "${config.workspaceName}"...`);
    console.log(`=========================================`);

    // 1. Create or Find Workspace
    const { data: existingWS, error: wsFetchError } = await supabaseAdmin
      .from("workspaces")
      .select("*")
      .eq("owner_id", ownerId)
      .eq("name", config.workspaceName);

    if (wsFetchError) {
      console.error(`Failure: Error checking workspace. ${wsFetchError.message}`);
      continue;
    }

    let workspace;
    if (existingWS && existingWS.length > 0) {
      workspace = existingWS[0];
      console.log(`Found existing workspace. ID: ${workspace.id}`);
    } else {
      const { data: newWS, error: wsCreateError } = await supabaseAdmin
        .from("workspaces")
        .insert({
          owner_id: ownerId,
          name: config.workspaceName,
          industry: "Fashion / clothing ecommerce",
          overview: `ATC — All-Time Clothing is a luxury Nigerian ecommerce boutique specializing in ready-to-wear premium women's clothing, dresses, gowns, outfits, and fashion pieces.${config.isDev ? " [Development Sandbox]" : ""}`
        })
        .select()
        .single();

      if (wsCreateError) {
        console.error(`Failure: Could not create workspace. ${wsCreateError.message}`);
        continue;
      }
      workspace = newWS;
      console.log(`Created new workspace. ID: ${workspace.id}`);
    }

    const workspaceId = workspace.id;

    // 2. Create or Update Brand Brain
    console.log("Checking/creating Brand Brain...");
    const { data: existingBrain, error: brainFetchError } = await supabaseAdmin
      .from("brand_brains")
      .select("*")
      .eq("workspace_id", workspaceId);

    if (brainFetchError) {
      console.error(`Failure: Error checking brand brains. ${brainFetchError.message}`);
      continue;
    }

    const atcProducts = ["women’s clothing", "dresses", "gowns", "outfits", "fashion pieces"];
    const atcPolicies = [
      "ordering channel: WhatsApp-first ordering. Checkout links redirect to WhatsApp.",
      "delivery: Lagos, Abuja, and interstate delivery.",
      "never invent unavailable sizes, prices, delivery time, or stock availability."
    ];

    const atcFAQs = [
      {
        question: "How do I order from ATC?",
        answer: "We run a WhatsApp-first ordering process. You browse our ready-to-wear styles on the website, add your items to the cart, and click checkout. This will generate an order summary and direct you to our WhatsApp channel to complete size availability, delivery details, and payment coordinates."
      },
      {
        question: "What are your delivery locations and fees?",
        answer: "We deliver across Nigeria: Lagos Standard Delivery (1-3 days) is ₦2,500; Abuja Delivery (3-5 days) is ₦4,500; Interstate Delivery (4-7 days) is ₦6,000; International Shipping (7-14 days) is ₦25,000. All delivery coordinates must be finalized with our showroom representative on WhatsApp."
      },
      {
        question: "Can I get custom sizing or alter the length?",
        answer: "We offer standard sizes from UK 8 to UK 18. Custom sizing options, fabric adjustments, or length alterations are handled on a case-by-case basis. I will direct you to our WhatsApp button so you can speak directly with the owner to confirm if custom tailoring is available for your selected piece."
      },
      {
        question: "What is your return and exchange policy?",
        answer: "We accept exchanges for alternative sizes or styles within 7 days of delivery, provided the item is unworn, in pristine condition, and all tags are intact. Please contact the owner on WhatsApp to check style exchange options. No cash refunds are permitted."
      },
      {
        question: "How do I make a payment?",
        answer: "For your security, we do not share banking credentials or payment links on this chat widget. Payment coordinates must be confirmed directly with the owner on WhatsApp before any funds are sent."
      }
    ];

    const atcDoRules = [
      "Be warm, stylish, confident, helpful, and speak in a premium boutique tone.",
      "Guide customers to checkout and order via the official WhatsApp channel.",
      "Always state that sizing, pricing, and stock must be confirmed on WhatsApp.",
      "Suggest fashionable style pairings and occasion styling recommendations."
    ];

    const atcDontRules = [
      "Never invent or guess prices, sizes, stock availability, or delivery timelines.",
      "Never invent payment coordinates, bank account details, or refund promises.",
      "Never share direct payment coordinates on this widget; direct the customer to WhatsApp.",
      "Do not make promises regarding fabric availability without owner confirmation."
    ];

    const handoffNotes = JSON.stringify({
      ownerNotes: "Ensure all pricing discrepancies, payment verifications, and custom requests are sent directly to WhatsApp.",
      handoffName: "ATC Owner",
      handoffContact: "WhatsApp Button",
      handoffRules: "Send customer to owner for payment, custom sizing, unavailable products, complaints, refunds, or uncertain answers."
    });

    const brainData = {
      workspace_id: workspaceId,
      tone_of_voice: "warm, stylish, confident, helpful, premium boutique style",
      business_overview: "ATC — All-Time Clothing is a luxury Nigerian ecommerce boutique specializing in ready-to-wear premium women's clothing, dresses, gowns, outfits, and fashion pieces.",
      products_services: atcProducts,
      pricing_notes: "Standard pricing applies. Check WhatsApp channel for exact pricing. Confirm with owner before final payment details.",
      faqs: atcFAQs,
      do_rules: atcDoRules,
      dont_rules: atcDontRules,
      policies: atcPolicies,
      owner_notes: handoffNotes
    };

    let brainId;
    if (existingBrain && existingBrain.length > 0) {
      const { data: updatedBrain, error: brainUpdateError } = await supabaseAdmin
        .from("brand_brains")
        .update(brainData)
        .eq("workspace_id", workspaceId)
        .select()
        .single();

      if (brainUpdateError) {
        console.error(`Failure: Could not update Brand Brain. ${brainUpdateError.message}`);
        continue;
      }
      brainId = updatedBrain.id;
      console.log(`Updated existing Brand Brain. ID: ${brainId}`);
    } else {
      const { data: newBrain, error: brainCreateError } = await supabaseAdmin
        .from("brand_brains")
        .insert(brainData)
        .select()
        .single();

      if (brainCreateError) {
        console.error(`Failure: Could not create Brand Brain. ${brainCreateError.message}`);
        continue;
      }
      brainId = newBrain.id;
      console.log(`Created new Brand Brain. ID: ${brainId}`);
    }

    // 3. Create or Update Zara Agent
    console.log("Checking/creating Zara Agent...");
    const { data: existingAgent, error: agentFetchError } = await supabaseAdmin
      .from("agents")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("name", "Zara");

    if (agentFetchError) {
      console.error(`Failure: Error checking agents. ${agentFetchError.message}`);
      continue;
    }

    const agentData = {
      workspace_id: workspaceId,
      brand_brain_id: brainId,
      name: "Zara",
      role: "Fashion Sales Assistant",
      personality: "warm, stylish, confident, helpful, premium boutique style",
      tone: "warm, stylish, confident, helpful, premium boutique style",
      channels: ["Web chat"],
      status: "Active"
    };

    let agent;
    if (existingAgent && existingAgent.length > 0) {
      const { data: updatedAgent, error: agentUpdateError } = await supabaseAdmin
        .from("agents")
        .update(agentData)
        .eq("workspace_id", workspaceId)
        .eq("name", "Zara")
        .select()
        .single();

      if (agentUpdateError) {
        console.error(`Failure: Could not update Zara Agent. ${agentUpdateError.message}`);
        continue;
      }
      agent = updatedAgent;
      console.log(`Updated existing Zara Agent. ID: ${agent.id}`);
    } else {
      const { data: newAgent, error: agentCreateError } = await supabaseAdmin
        .from("agents")
        .insert(agentData)
        .select()
        .single();

      if (agentCreateError) {
        console.error(`Failure: Could not create Zara Agent. ${agentCreateError.message}`);
        continue;
      }
      agent = newAgent;
      console.log(`Created new Zara Agent. ID: ${agent.id}`);
    }

    // 4. Create or Update Website Widget Config
    console.log("Checking/creating Website Widget Config...");
    const { data: existingWidget, error: widgetFetchError } = await supabaseAdmin
      .from("widget_configs")
      .select("*")
      .eq("workspace_id", workspaceId);

    if (widgetFetchError) {
      console.error(`Failure: Error checking widget configs. ${widgetFetchError.message}`);
      continue;
    }

    const widgetData = {
      workspace_id: workspaceId,
      agent_id: agent.id,
      enabled: true,
      greeting: "Welcome to ATC — All-Time Clothing! I am Zara, your fashion sales assistant. How can I help you find the perfect outfit today?",
      accent_color: "#C5A880", // Luxury Gold
      display_name: "Zara | Fashion Stylist",
      allowed_domains: config.allowedDomains
    };

    if (existingWidget && existingWidget.length > 0) {
      const { data: updatedWidget, error: widgetUpdateError } = await supabaseAdmin
        .from("widget_configs")
        .update({
          ...widgetData,
          public_key: config.publicKey
        })
        .eq("workspace_id", workspaceId)
        .select()
        .single();

      if (widgetUpdateError) {
        console.error(`Failure: Could not update Widget Config. ${widgetUpdateError.message}`);
        continue;
      }
      console.log(`Success: Updated Widget Config for ATC. Public Key: ${updatedWidget.public_key}`);
    } else {
      const { data: newWidget, error: widgetCreateError } = await supabaseAdmin
        .from("widget_configs")
        .insert({
          ...widgetData,
          public_key: config.publicKey
        })
        .select()
        .single();

      if (widgetCreateError) {
        console.error(`Failure: Could not create Widget Config. ${widgetCreateError.message}`);
        continue;
      }
      console.log(`Success: Created Widget Config for ATC. Public Key: ${newWidget.public_key}`);
    }
  }

  console.log("\nATC Workspaces, Agents, and Widget Configurations successfully seeded!");
}

main();
