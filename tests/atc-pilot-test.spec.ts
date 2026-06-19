import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const TEST_QUESTIONS = [
  {
    category: "Greeting & Style Check",
    question: "Hello! Who are you?"
  },
  {
    category: "Product availability (Kaftan)",
    question: "Do you have Kaftans in stock?"
  },
  {
    category: "Product availability (Gowns)",
    question: "What kinds of gowns do you offer?"
  },
  {
    category: "Size check (Standard)",
    question: "What sizes are available in your outfits?"
  },
  {
    category: "Size check (Specific)",
    question: "Do you have a UK size 10 silk Boubou?"
  },
  {
    category: "Custom sizing",
    question: "Can I order a custom size UK 22?"
  },
  {
    category: "Pricing request",
    question: "How much is the Kaftan dress?"
  },
  {
    category: "Pricing request (Discount)",
    question: "Can I get a discount if I buy 3 dresses?"
  },
  {
    category: "Delivery (Lagos)",
    question: "How much is delivery to Lekki, Lagos?"
  },
  {
    category: "Delivery (Abuja)",
    question: "Do you deliver to Abuja, and how much does it cost?"
  },
  {
    category: "Delivery (Interstate)",
    question: "Can you ship to Port Harcourt?"
  },
  {
    category: "Delivery timeline check",
    question: "Will it arrive tomorrow in Abuja if I order now?"
  },
  {
    category: "WhatsApp order flow",
    question: "How do I place an order?"
  },
  {
    category: "Return policy check",
    question: "What is your return policy?"
  },
  {
    category: "Refund policy check",
    question: "Can I get a cash refund if I don't like it?"
  },
  {
    category: "Styling recommendation (Dinner)",
    question: "What would you recommend for a luxury dinner party in Lagos?"
  },
  {
    category: "Styling recommendation (Pairings)",
    question: "What matches well with a gold boubou?"
  },
  {
    category: "Unknown product check",
    question: "Do you sell men's corporate shoes?"
  },
  {
    category: "Payment questions",
    question: "Can you give me your bank account details so I can pay?"
  },
  {
    category: "Handoff check (Complaint)",
    question: "My order was delayed, I am very upset and want a refund."
  }
];

test.describe("ATC Zara Assistant 20-Question Pilot Verification Suite", () => {
  
  test("Run 20-Question Conversation with Zara through Website Widget", async ({ page }) => {
    test.setTimeout(240000); // 4 minutes timeout for 20 LLM rounds
    
    // Log browser console output
    page.on("console", msg => {
      console.log(`[BROWSER CONSOLE][${msg.type()}] ${msg.text()}`);
    });
    page.on("pageerror", err => {
      console.error(`[BROWSER ERROR] ${err.toString()}`);
    });

    const targetUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
    console.log(`Starting E2E validation against target site: ${targetUrl}`);
    
    // Set a test-session ID to bypass anti-abuse message limits in test runs
    await page.addInitScript(() => {
      window.sessionStorage.setItem("echostaff_widget_session_id", `test-session-atc-pilot-${Date.now()}`);
    });

    await page.goto(targetUrl);
    await page.waitForTimeout(6000); // Wait for page hydration and lazy-load scripts
    
    // Check if EchoStaff widget iframe is present
    const widgetIframe = page.locator("#echostaff-widget-iframe");
    await expect(widgetIframe).toBeVisible({ timeout: 25000 });
    
    const frame = page.frameLocator("#echostaff-widget-iframe");
    
    // 1. Open the widget by clicking the floating chat bubble button
    const bubbleBtn = frame.locator("button").first();
    await expect(bubbleBtn).toBeVisible({ timeout: 30000 });
    
    console.log("Clicking chat bubble button...");
    await bubbleBtn.click({ force: true });
    await page.waitForTimeout(2000); // Wait for expand transition

    // Fallback if not opened yet
    const greetingTextLocator = frame.locator("text=Zara").first();
    try {
      await expect(greetingTextLocator).toBeVisible({ timeout: 4000 });
    } catch (e) {
      console.log("Zara text not visible after click, trying dispatch event click...");
      await bubbleBtn.dispatchEvent("click");
      await page.waitForTimeout(2000);
    }
    
    // Confirm greeting is visible
    const greetingText = await greetingTextLocator.innerText();
    console.log("Widget Header/Greeting initialised: ", greetingText);
    
    const conversationLogs: Array<{ question: string; response: string; category: string }> = [];
    
    // 2. Loop through each question sequentially
    for (let i = 0; i < TEST_QUESTIONS.length; i++) {
      const q = TEST_QUESTIONS[i];
      console.log(`\nRound ${i + 1}/${TEST_QUESTIONS.length} [${q.category}]: "${q.question}"`);
      
      const input = frame.locator("input[placeholder*='message'], input[type='text']").first();
      await expect(input).toBeVisible();
      await input.fill(q.question);
      
      const sendBtn = frame.locator("button[type='submit']").first();
      await sendBtn.click();
      
      // Wait for reply to arrive (loading typing bubbles disappears and active loading state is false)
      await page.waitForTimeout(1000); // Wait for typing indicator to show up
      
      // Wait for typing bubbles to disappear (loading ends)
      const typingIndicator = frame.locator(".animate-bounce").first();
      try {
        await typingIndicator.waitFor({ state: "hidden", timeout: 15000 });
      } catch (e) {
        console.warn("Typing indicator hidden timeout, proceeding...");
      }
      
      await page.waitForTimeout(1500); // extra buffer for message rendering
      
      // Retrieve the last reply text in the chat
      const chatBubbles = frame.locator("div.rounded-2xl.px-3\\.5.py-2\\.5");
      const count = await chatBubbles.count();
      
      // The last bubble corresponds to the agent's latest reply
      let reply = "Could not retrieve reply";
      if (count > 0) {
        reply = await chatBubbles.nth(count - 1).innerText();
      }
      
      console.log(`Zara Response: "${reply}"`);
      conversationLogs.push({
        category: q.category,
        question: q.question,
        response: reply
      });
      
      // Perform security and policy audits
      const lowerReply = reply.toLowerCase();
      
      if (q.category === "Custom sizing") {
        expect(lowerReply).toContain("whatsapp");
      }
      if (q.category === "Pricing request") {
        expect(lowerReply).toContain("whatsapp");
      }
      if (q.category === "Payment questions") {
        expect(lowerReply).toContain("whatsapp");
        expect(lowerReply).not.toContain("bank");
        expect(lowerReply).not.toContain("account");
      }
      if (q.category === "Refund policy check") {
        expect(lowerReply).toContain("whatsapp");
        expect(lowerReply).toContain("no");
      }
      if (q.category === "Handoff check (Complaint)") {
        expect(lowerReply).toContain("whatsapp");
      }
    }
    
    // Save transcript logs safely to scratch directory (no private customer details)
    const scratchDir = path.join("C:", "Users", "colds", ".gemini", "antigravity", "brain", "05031b83-2a5f-43a0-b839-18ec37b3bca2", "scratch");
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir, { recursive: true });
    }
    
    const logPath = path.join(scratchDir, "atc_pilot_e2e_transcript.json");
    fs.writeFileSync(logPath, JSON.stringify(conversationLogs, null, 2));
    console.log(`\nSuccess: Transcript logged to ${logPath}`);
  });
});
