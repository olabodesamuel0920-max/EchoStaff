const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

async function rotate() {
  const envPath = path.join('c:', 'Users', 'colds', 'Documents', 'GitHub', 'EchoStaff', 'EchoStaff', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error(`Error: .env.local not found at ${envPath}`);
    process.exit(1);
  }

  // 1. Generate strong QA password
  const randomPart = crypto.randomBytes(12).toString('hex');
  const newPassword = `Pilot_QA_${randomPart}_ES!`;

  // 2. Read and update .env.local
  let envContent = fs.readFileSync(envPath, 'utf8');
  const qaPasswordRegex = /^QA_PASSWORD=.*$/m;

  if (qaPasswordRegex.test(envContent)) {
    envContent = envContent.replace(qaPasswordRegex, `QA_PASSWORD=${newPassword}`);
  } else {
    envContent += `\nQA_PASSWORD=${newPassword}\n`;
  }
  
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log("Successfully updated QA_PASSWORD in .env.local (password value was NOT printed to log).");

  // 3. Parse environment variables for Supabase config
  const lines = envContent.split(/\r?\n/);
  let supabaseUrl = '';
  let serviceRoleKey = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split('=');
    if (parts.length < 2) continue;
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
      supabaseUrl = val;
    } else if (key === 'SUPABASE_SERVICE_ROLE_KEY') {
      serviceRoleKey = val;
    }
  }

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env.local.");
    process.exit(1);
  }

  // 4. Initialize Supabase Client
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });

  const targetEmails = [
    "olabodesamuel0920+echo1@gmail.com",
    "olabodesamuel0920+echo2@gmail.com",
    "olabodesamuel0920+echo3@gmail.com",
    "olabodesamuel0920+echo4@gmail.com"
  ];

  console.log("Fetching users from Supabase Auth...");
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    console.error(`Error listing users: ${usersError.message}`);
    process.exit(1);
  }

  for (const email of targetEmails) {
    const user = usersData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) {
      console.warn(`Warning: User ${email} not found in Supabase Auth.`);
      continue;
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword
    });

    if (updateError) {
      console.error(`Error rotating password for ${email}: ${updateError.message}`);
    } else {
      console.log(`Success: Rotated QA password for ${email} in Supabase Auth.`);
    }
  }
  
  console.log("Rotation complete. All pilot QA user passwords updated successfully.");
}

rotate().catch(err => {
  console.error("Fatal Error during password rotation:", err);
  process.exit(1);
});
