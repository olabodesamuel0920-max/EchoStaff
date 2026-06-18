import { test, expect, devices } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// Helper to ensure screenshots directory exists
const ensureScreenshotsDir = () => {
  const dir = path.join(process.cwd(), "public", "screenshots", "production");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const QA_EMAIL_1 = process.env.QA_EMAIL || "olabodesamuel0920+echo1@gmail.com";
const QA_EMAIL_2 = "olabodesamuel0920+echo2@gmail.com";
const QA_PASSWORD = process.env.QA_PASSWORD || "TestQAUserPassword123!";

test.describe("EchoStaff Production QA & RLS Verification Suite", () => {

  test.beforeAll(() => {
    ensureScreenshotsDir();
  });

  test("Case 1: Production Authentication, Session Refresh & Guards", async ({ page }) => {
    test.setTimeout(90000);
    const targetUrl = process.env.TEST_BASE_URL || "https://echo-staff.vercel.app";

    // 1. Guard check: Unauthenticated user should be redirected from dashboard
    await page.goto(`${targetUrl}/dashboard`);
    await page.waitForTimeout(3000); // Wait for redirect check
    expect(page.url()).toContain("/login");

    // 2. Login as QA User 1
    await page.goto(`${targetUrl}/login`);
    await page.fill("#email", QA_EMAIL_1);
    await page.fill("#password", QA_PASSWORD);
    await page.click("button[type='submit']");

    // Wait for redirect to dashboard
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await page.waitForTimeout(2000);
    expect(page.url()).toContain("/dashboard");

    // Verify topbar shows database status (either Connected or Fallback)
    const connectionBadge = page.locator("button:has-text('Connected'), button:has-text('Fallback')").first();
    await expect(connectionBadge).toBeVisible();

    // 3. Refresh preserves session
    await page.reload();
    await page.waitForTimeout(3000);
    expect(page.url()).toContain("/dashboard");
    await expect(connectionBadge).toBeVisible();

    // 4. Logout works
    const logoutBtn = page.locator("button[title='Logout']").first();
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();
    
    await page.waitForURL("**/login", { timeout: 10000 });
    expect(page.url()).toContain("/login");

    // 5. Login works again
    await page.fill("#email", QA_EMAIL_1);
    await page.fill("#password", QA_PASSWORD);
    await page.click("button[type='submit']");
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    expect(page.url()).toContain("/dashboard");
  });

  test("Case 2: Full Production Authenticated Functional Flow", async ({ page }) => {
    test.setTimeout(180000);
    const targetUrl = process.env.TEST_BASE_URL || "https://echo-staff.vercel.app";

    // Login
    await page.goto(`${targetUrl}/login`);
    await page.fill("#email", QA_EMAIL_1);
    await page.fill("#password", QA_PASSWORD);
    await page.click("button[type='submit']");
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await page.waitForTimeout(2000);

    // 1. Update Business Profile & Refresh
    await page.goto(`${targetUrl}/dashboard/business`);
    await page.waitForTimeout(2000);
    const clientNameInput = page.locator("input[placeholder*='e.g. Luna Aesthetics']").first();
    await expect(clientNameInput).toBeVisible();
    
    // Fill custom name
    const testBusinessName = "Eka Kitchen & Catering QA";
    await page.fill("input[placeholder*='e.g. Luna Aesthetics']", testBusinessName);
    await page.fill("textarea[placeholder*='What does your company do']", "Premium catering service in Lagos.");
    await page.fill("input[placeholder='Product description and price']", "Spicy Jollof Rice ($18)");
    await page.click("input[placeholder='Product description and price'] + button");
    
    await page.click("button:has-text('Save Profile Configurations')");
    await page.waitForTimeout(3000); // wait for database write
    
    // Reload and check if persists
    await page.reload();
    await page.waitForTimeout(2000);
    const loadedVal = await clientNameInput.inputValue();
    expect(loadedVal).toBe(testBusinessName);

    // 2. Add FAQs & Do/Don't Rules & Refresh
    await page.goto(`${targetUrl}/dashboard/brand-brain`);
    await page.waitForTimeout(2000);
    
    // Add FAQ
    await page.click("button:has-text('FAQs Builder')");
    await page.waitForTimeout(500);
    await page.fill("input[placeholder*='Botox']", "Do you deliver to Lekki?");
    await page.fill("textarea[placeholder*='response']", "Yes, we deliver to Lekki Phase 1 with a $5 delivery fee.");
    await page.click("button:has-text('Inject FAQ Node')");
    await page.waitForTimeout(1500);
    await expect(page.locator("text=Do you deliver to Lekki?").first()).toBeVisible();

    // Add Do Rule
    await page.click("button:has-text('Guardrails')");
    await page.waitForTimeout(500);
    await page.fill("input[placeholder*='Always emphasize safety']", "Always mention fresh organic ingredients.");
    await page.press("input[placeholder*='Always emphasize safety']", "Enter");
    await page.waitForTimeout(1000);
    await expect(page.locator("text=Always mention fresh organic ingredients.").first()).toBeVisible();

    // Add Don't Rule
    await page.fill("input[placeholder*='Never diagnose skin conditions']", "Never offer discounts without supervisor approval.");
    await page.press("input[placeholder*='Never diagnose skin conditions']", "Enter");
    await page.waitForTimeout(1000);
    await expect(page.locator("text=Never offer discounts without supervisor approval.").first()).toBeVisible();

    // 3. Create Agent & Refresh
    await page.goto(`${targetUrl}/dashboard/agents`);
    await page.waitForTimeout(2000);
    await page.click("button:has-text('Build AI Staff Member')");
    await page.fill("input[placeholder*='Sophia']", "Amina QA");
    await page.fill("input[placeholder*='Sales Consultant']", "Catering Coordinator");
    await page.fill("textarea[placeholder*='behaviors']", "A professional coordinator representing Eka Kitchen QA.");
    await page.click("button:has-text('Configure AI Agent')");
    await page.waitForTimeout(2000);
    await expect(page.locator("text=Amina QA").first()).toBeVisible();

    // 4. Playground Message
    await page.goto(`${targetUrl}/dashboard/playground`);
    await page.waitForTimeout(2000);
    await page.fill("input[placeholder*='Ask']", "Hi Amina, do you deliver to Lekki?");
    await page.click("button[type='submit']");
    await page.waitForTimeout(3000);
    const playgroundText = await page.locator("body").innerText();
    expect(playgroundText.toLowerCase()).toContain("deliver");

    // 5. Call Lab Simulator E2E check
    await page.goto(`${targetUrl}/dashboard/call-lab`);
    await page.waitForTimeout(2000);
    await page.click("button:has-text('Start Simulation call')");
    await page.waitForTimeout(1000);
    await page.click("button:has-text('Accept Call')");
    await page.waitForTimeout(2500);
    
    // Send customer objection text
    await page.fill("input[placeholder*='Type customer reply']", "Can I get a refund or discount for my party?");
    await page.click("button:has-text('Send')");
    await page.waitForTimeout(3000);
    
    // End call and confirm scorecard loads
    await page.click("button:has-text('End Call')");
    await page.waitForTimeout(2000);
    await expect(page.locator("h3:has-text('Call Scorecard')")).toBeVisible();
    await expect(page.locator("button:has-text('Send to Training Center')")).toBeVisible();

    // Send scorecard to training center
    await page.click("button:has-text('Send to Training Center')");
    await page.waitForTimeout(1500);

    // 6. Training Center checking
    await page.goto(`${targetUrl}/dashboard/training`);
    await page.waitForTimeout(2000);
    await expect(page.locator("text=discount").first()).toBeVisible();

    // 7. Website Widget Configuration saving
    await page.goto(`${targetUrl}/dashboard/widget`);
    await page.waitForTimeout(2000);
    await page.fill("textarea[placeholder*='Hello!']", "Welcome to Eka Kitchen QA widget!");
    await page.click("button:has-text('Save Configuration Settings')");
    await page.waitForTimeout(2000);
    const widgetBodyText = await page.locator("body").innerText();
    expect(widgetBodyText.toLowerCase()).toContain("settings saved");

    // 8. Visit all dashboard subpages to verify zero crashes
    const subpages = [
      "/dashboard/analytics",
      "/dashboard/agency",
      "/dashboard/beta",
      "/dashboard/pilot",
      "/dashboard/system-check",
      "/admin"
    ];
    for (const sub of subpages) {
      await page.goto(`${targetUrl}${sub}`);
      await page.waitForTimeout(1500);
      await expect(page.locator("header")).toBeVisible();
    }
  });

  test("Case 3: Tenant RLS Isolation check between User A and User B", async ({ page }) => {
    test.setTimeout(90000);
    const targetUrl = process.env.TEST_BASE_URL || "https://echo-staff.vercel.app";

    // 1. Log in as User B
    await page.goto(`${targetUrl}/login`);
    await page.fill("#email", QA_EMAIL_2);
    await page.fill("#password", QA_PASSWORD);
    await page.click("button[type='submit']");
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await page.waitForTimeout(2000);

    // 2. Go to Business profile and verify it does NOT see User A's updated business name
    await page.goto(`${targetUrl}/dashboard/business`);
    await page.waitForTimeout(2000);
    const loadedVal = await page.locator("input[placeholder*='e.g. Luna Aesthetics']").first().inputValue();
    
    // User B's business profile name should be their own, e.g., "QA Testing Inc" or "Pilot Client",
    // and definitely NOT the "Eka Kitchen & Catering QA" created by User A.
    expect(loadedVal).not.toBe("Eka Kitchen & Catering QA");

    // 3. Go to Agents page and verify Amina QA does NOT exist for User B
    await page.goto(`${targetUrl}/dashboard/agents`);
    await page.waitForTimeout(2000);
    const agentsPageText = await page.locator("body").innerText();
    expect(agentsPageText).not.toContain("Amina QA");
  });

  test("Case 4: Multi-Viewport Mobile Responsive Audit & Screenshot Captures", async ({ page }) => {
    test.setTimeout(180000);
    const targetUrl = process.env.TEST_BASE_URL || "https://echo-staff.vercel.app";

    const viewports = [
      { width: 360, height: 800, name: "Samsung_S8" },
      { width: 375, height: 812, name: "iPhone_X" },
      { width: 390, height: 844, name: "iPhone_13" },
      { width: 412, height: 915, name: "Pixel_7" },
      { width: 768, height: 1024, name: "iPad_Mini" },
    ];

    const mobileRoutes = [
      { path: "/login", name: "login" },
      { path: "/dashboard", name: "dashboard" },
      { path: "/dashboard/business", name: "business" },
      { path: "/dashboard/brand-brain", name: "brand_brain" },
      { path: "/dashboard/agents", name: "agents" },
      { path: "/dashboard/playground", name: "playground" },
      { path: "/dashboard/call-lab", name: "call_lab" },
      { path: "/dashboard/conversations", name: "conversations" },
    ];

    // Login first to set session
    await page.goto(`${targetUrl}/login`);
    await page.fill("#email", QA_EMAIL_1);
    await page.fill("#password", QA_PASSWORD);
    await page.click("button[type='submit']");
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    await page.waitForTimeout(2000);

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      
      for (const route of mobileRoutes) {
        await page.goto(`${targetUrl}${route.path}`);
        await page.waitForTimeout(1000); // Wait for styling rendering

        // Capture screenshot
        const screenshotPath = path.join(
          process.cwd(),
          "public",
          "screenshots",
          "production",
          `${route.name}_${vp.width}x${vp.height}.png`
        );
        await page.screenshot({ path: screenshotPath });

        // Confirm no horizontal page scrolling/overflows
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const windowWidth = await page.evaluate(() => window.innerWidth);
        expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 15);
      }
    }
  });

  test("Case 5: Production Client-Side Security Audits", async ({ page }) => {
    test.setTimeout(60000);
    const targetUrl = process.env.TEST_BASE_URL || "https://echo-staff.vercel.app";

    // Listen to network requests to ensure no service role key or API keys are leaked
    page.on("request", request => {
      const url = request.url();
      const headers = request.headers();
      const postData = request.postData();

      // Check headers and payloads for service role keys (typically start with eyJhbGci)
      for (const [key, value] of Object.entries(headers)) {
        if (value.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppdXh6bGJhY2Jmc2t5cWV0ZmxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIs")) {
          throw new Error(`Security breach: Supabase service_role key leaked in request header ${key}!`);
        }
      }

      if (postData && postData.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppdXh6bGJhY2Jmc2t5cWV0ZmxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIs")) {
        throw new Error(`Security breach: Supabase service_role key leaked in request payload!`);
      }
      
      // Check for OpenAI API keys (typically start with sk-proj-)
      for (const [key, value] of Object.entries(headers)) {
        if (value.startsWith("sk-proj-")) {
          throw new Error(`Security breach: OpenAI API key leaked in request header ${key}!`);
        }
      }

      if (postData && postData.includes("sk-proj-")) {
        throw new Error(`Security breach: OpenAI API key leaked in request payload!`);
      }
    });

    // Login and navigate
    await page.goto(`${targetUrl}/login`);
    await page.fill("#email", QA_EMAIL_1);
    await page.fill("#password", QA_PASSWORD);
    await page.click("button[type='submit']");
    await page.waitForURL("**/dashboard", { timeout: 15000 });
    
    // Visit playground and query AI which triggers backend APIs
    await page.goto(`${targetUrl}/dashboard/playground`);
    await page.waitForTimeout(2000);
    await page.fill("input[placeholder*='Ask']", "Hi");
    await page.click("button[type='submit']");
    await page.waitForTimeout(2500);
    
    // If no error was thrown by request listener, test passes
    expect(true).toBeTruthy();
  });
});
