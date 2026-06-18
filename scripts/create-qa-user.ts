import { supabaseAdmin, isSupabaseAdminConfigured } from "../src/lib/supabase/admin";

async function main() {
  const email = process.env.QA_EMAIL;
  const password = process.env.QA_PASSWORD;

  if (!email || !password) {
    console.error("Failure: QA_EMAIL and QA_PASSWORD environment variables must be defined in your environment or .env.local file.");
    process.exit(1);
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    console.error("Failure: Supabase Admin client is not configured. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: "QA User",
        business_name: "QA Testing Inc",
      }
    });

    if (error) {
      console.error(`Failure: ${error.message}`);
      process.exit(1);
    }

    console.log("Success: QA User successfully created with email confirmation set to true.");
  } catch (err: any) {
    console.error(`Failure: ${err.message || err}`);
    process.exit(1);
  }
}

main();
