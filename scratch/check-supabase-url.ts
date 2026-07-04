import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on("request", (req) => {
    const url = req.url();
    if (url.includes("supabase.co") || url.includes("supabase")) {
      console.log(`[Request to Supabase]: ${url}`);
    }
  });

  console.log("Navigating to login page on Vercel...");
  await page.goto("https://echo-staff.vercel.app/login");
  await page.fill("#email", "olabodesamuel0920+echo1@gmail.com");
  await page.fill("#password", "SomeDummyPassword123!");
  await page.click("button[type='submit']");
  await page.waitForTimeout(3000);
  await browser.close();
  console.log("Done.");
}

main().catch(console.error);
