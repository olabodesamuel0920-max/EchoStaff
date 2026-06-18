import { test, expect } from "@playwright/test";

const QA_EMAILS = [
  "olabodesamuel0920+echo1@gmail.com",
  "olabodesamuel0920+echo2@gmail.com",
  "olabodesamuel0920+echo3@gmail.com",
  "olabodesamuel0920+echo4@gmail.com"
];

test.describe("Production QA Accounts Onboarding Triggers", () => {
  QA_EMAILS.forEach((email, index) => {
    test(`Trigger Sign Up for account ${index + 1}: ${email}`, async ({ page }) => {
      const targetUrl = process.env.TEST_BASE_URL || "https://echo-staff.vercel.app";
      const qaPassword = process.env.QA_PASSWORD;
      
      if (!qaPassword) {
        test.skip(true, "QA_PASSWORD environment variable is required to run trigger signup tests.");
        return;
      }

      await page.goto(`${targetUrl}/signup`);
      await page.fill("#name", `QA Tester ${index + 1}`);
      await page.fill("#business", `QA Business ${index + 1}`);
      await page.fill("#email", email);
      await page.fill("#password", qaPassword);
      
      await page.click("button[type='submit']");
      
      // We expect either a success message ("Please check your email to confirm registration")
      // or a message stating the user already exists (which is fine if already registered).
      await page.waitForTimeout(3000);
      const textContent = await page.locator("body").innerText();
      
      console.log(`Signup Response for ${email}:`, textContent.slice(0, 300));
      expect(
        textContent.includes("check your email") || 
        textContent.includes("already registered") || 
        textContent.includes("exists") ||
        page.url().includes("/dashboard")
      ).toBeTruthy();
    });
  });
});
