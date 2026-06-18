import { supabaseAdmin, isSupabaseAdminConfigured } from "../src/lib/supabase/admin";

async function main() {
  const password = process.env.QA_PASSWORD;
  const emailEnv = process.env.QA_EMAIL;

  if (!password) {
    console.error("Failure: QA_PASSWORD environment variable must be defined in your environment or .env.local file.");
    process.exit(1);
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    console.error("Failure: Supabase Admin client is not configured. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    process.exit(1);
  }

  const targetEmails = [
    "olabodesamuel0920+echo1@gmail.com",
    "olabodesamuel0920+echo2@gmail.com",
    "olabodesamuel0920+echo3@gmail.com",
    "olabodesamuel0920+echo4@gmail.com"
  ];
  if (emailEnv && !targetEmails.includes(emailEnv)) {
    targetEmails.push(emailEnv);
  }

  console.log(`Verifying/Creating ${targetEmails.length} QA users...`);

  for (const email of targetEmails) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: `QA User ${email.split("+")[1]?.split("@")[0] || ""}`,
          business_name: "QA Testing Inc",
        }
      });

      if (error) {
        const errMsg = error.message.toLowerCase();
        if (errMsg.includes("already exists") || errMsg.includes("email_exists") || error.status === 422) {
          // List users to locate the existing user's ID
          const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
          if (listError) {
            console.error(`Failure for ${email}: ${listError.message}`);
            continue;
          }
          const existingUser = listData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
          if (!existingUser) {
            console.error(`Failure for ${email}: User already exists but could not be found in user list.`);
            continue;
          }

          // Update the password and confirm their email
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
            password,
            email_confirm: true,
          });

          if (updateError) {
            console.error(`Failure for ${email}: ${updateError.message}`);
            continue;
          }

          console.log(`Success: QA User (${email}) already exists. Password successfully updated and email confirmed.`);
          continue;
        }

        console.error(`Failure for ${email}: ${error.message}`);
        continue;
      }

      console.log(`Success: QA User (${email}) successfully created with email confirmation set to true.`);
    } catch (err: any) {
      console.error(`Failure for ${email}: ${err.message || err}`);
    }
  }
}

main();
