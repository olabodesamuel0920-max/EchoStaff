import { BrandBrain, Agent } from "./types";

/**
 * Generates a realistic, branded AI response based on the active Brand Brain, Agent settings, and user input.
 * In Phase 2, this function will make a POST request to an API route interfacing with OpenAI's Chat Completion.
 */
export function generateMockBrandedResponse(
  userInput: string,
  agent: Agent,
  brain: BrandBrain
): string {
  const query = userInput.toLowerCase().trim();
  const companyName = "ATC — All-Time Clothing";
  const isATC = brain.profile.overview.includes("ATC") || brain.profile.overview.includes("All-Time Clothing") || agent.name === "Zara";
  
  // Dedicated mock logic for ATC storefront pilot testing
  if (isATC) {
    if (query.includes("who are you") || query.includes("hello")) {
      return formatResponseWithTone("Hello! I am Zara, your fashion stylist at ATC — All-Time Clothing. I can help you recommend styles and find the perfect outfit!", agent, brain);
    }
    if (query.includes("recommend") || query.includes("dinner") || query.includes("party")) {
      return formatResponseWithTone("For a luxury dinner party, I highly recommend our Emerald Royal Kaftan or a classic silk Boubou for premium elegance!", agent, brain);
    }
    if (query.includes("gold") || query.includes("matches")) {
      return formatResponseWithTone("A gold boubou matches beautifully with neutral heels, gold statement earrings, or a luxury matching clutch.", agent, brain);
    }
    if (query.includes("custom size") || query.includes("uk 22")) {
      return formatResponseWithTone("Custom sizing is handled on a case-by-case basis. Please click the WhatsApp button to contact the owner directly to verify.", agent, brain);
    }
    if (query.includes("bank") || query.includes("account") || query.includes("pay")) {
      return formatResponseWithTone("For security, we never share details of this nature on this chat. Please contact the owner on WhatsApp to get official coordinates.", agent, brain);
    }
    if (query.includes("refund")) {
      return formatResponseWithTone("No cash refunds are allowed. Please contact the owner on WhatsApp to check options.", agent, brain);
    }
    if (query.includes("return policy") || query.includes("return")) {
      return formatResponseWithTone("We accept exchanges within 7 days of delivery. No cash refunds. Please contact the owner on WhatsApp to confirm style exchange options.", agent, brain);
    }
    if (query.includes("delayed") || query.includes("upset") || query.includes("complaint")) {
      return formatResponseWithTone("I apologize for the delay. Please click the WhatsApp button to reach the owner directly so they can resolve this complaint for you.", agent, brain);
    }
    if (query.includes("how much") || query.includes("price") || query.includes("kaftan dress")) {
      return formatResponseWithTone("For prices, please click the WhatsApp button to check with the owner directly. We do not list or invent prices on this chat.", agent, brain);
    }
    if (query.includes("discount") || query.includes("buy 3")) {
      return formatResponseWithTone("For discount requests or bulk orders, please click the WhatsApp button to speak with the owner.", agent, brain);
    }
    if (query.includes("tomorrow") || query.includes("arrive")) {
      return formatResponseWithTone("We never guarantee next-day delivery timelines here. Please contact us on WhatsApp to verify shipping timelines.", agent, brain);
    }
    if (query.includes("delivery") || query.includes("shipping") || query.includes("lagos") || query.includes("lekki") || query.includes("abuja") || query.includes("port harcourt")) {
      return formatResponseWithTone("We deliver across Nigeria: Lagos standard is ₦2,500, Abuja standard is ₦4,500, Interstate is ₦6,000. All delivery coordinates must be finalized with the owner on WhatsApp.", agent, brain);
    }
    if (query.includes("order") || query.includes("place")) {
      return formatResponseWithTone("We use a WhatsApp-first ordering process. Please add items to your cart, click checkout, and you will be directed to our WhatsApp channel to complete your order.", agent, brain);
    }
    if (query.includes("sizes") && query.includes("available")) {
      return formatResponseWithTone("We offer standard UK sizes from UK 8 to UK 18. Please contact us on WhatsApp to confirm size availability.", agent, brain);
    }
    if (query.includes("uk size 10") || query.includes("boubou")) {
      return formatResponseWithTone("Please click the WhatsApp button to verify if the UK size 10 silk Boubou is in stock.", agent, brain);
    }
    if (query.includes("kaftan") && (query.includes("stock") || query.includes("have"))) {
      return formatResponseWithTone("We have beautiful luxury Kaftans! Please click our WhatsApp button to confirm stock availability and sizing.", agent, brain);
    }
    if (query.includes("gown") || query.includes("what kinds")) {
      return formatResponseWithTone("We offer ready-to-wear gowns, dresses, and kaftans. Sizing and stock availability must be confirmed on WhatsApp.", agent, brain);
    }
    if (query.includes("men") || query.includes("shoes")) {
      return formatResponseWithTone("No, we specialize in ready-to-wear women's clothing. For custom or other styles, please click the WhatsApp button to inquire.", agent, brain);
    }
  }

  // 1. Keyword check for FAQs
  const stopWords = new Set(["what", "your", "have", "with", "that", "this", "from", "they", "them", "these", "those"]);
  for (const faq of brain.faqs) {
    // Simple overlap check excluding stop words
    const words = faq.question.toLowerCase().replace(/[?.,]/g, "").split(" ");
    const matchCount = words.filter(word => word.length > 3 && !stopWords.has(word) && query.includes(word)).length;
    if (matchCount >= 2 || query.includes(faq.question.toLowerCase().replace(/[?]/g, ""))) {
      return formatResponseWithTone(faq.answer, agent, brain);
    }
  }

  // 2. Keyword check for Pricing / Products
  if (query.includes("pricing") || query.includes("cost") || query.includes("price") || query.includes("how much") || query.includes("rate") || query.includes("fee")) {
    let response = `For ${companyName}, we offer several options. `;
    if (brain.profile.products && brain.profile.products.length > 0) {
      response += "Our main offerings are:\n" + brain.profile.products.map(p => `- ${p}`).join("\n") + "\n";
    }
    if (brain.profile.pricingNotes) {
      response += `\nNote: ${brain.profile.pricingNotes}`;
    }
    return formatResponseWithTone(response, agent, brain);
  }

  // 3. Keyword check for Policies
  if (query.includes("policy") || query.includes("cancel") || query.includes("late") || query.includes("refund") || query.includes("no show")) {
    if (brain.profile.policies) {
      return formatResponseWithTone(`Here is our policy: ${brain.profile.policies}`, agent, brain);
    }
  }

  // 4. Default dynamic response depending on tone & personality
  let defaultBase = "";
  
  if (agent.tone.toLowerCase().includes("empathetic") || agent.tone.toLowerCase().includes("sophisticated") || agent.tone.toLowerCase().includes("warm")) {
    defaultBase = `Thank you so much for reaching out to us here at ${companyName}. I want to make sure we address your needs perfectly. Based on our focus on ${brain.profile.overview.slice(0, 80)}..., I recommend scheduling a custom consultation so we can tailor a plan specifically for you. Is there a particular day this week that suits you?`;
  } else if (agent.tone.toLowerCase().includes("direct") || agent.tone.toLowerCase().includes("analytical") || agent.tone.toLowerCase().includes("efficient")) {
    defaultBase = `At ${companyName}, our operations are optimized for high efficiency. Regarding your question, we utilize integrated logistics mapping to solve this. Our data shows a typical 15% reduction in fuel consumption and a 22% improvement in routing times. I suggest we schedule a brief 10-minute screen-share demonstration with an integration engineer. What is your availability?`;
  } else if (agent.tone.toLowerCase().includes("refined") || agent.tone.toLowerCase().includes("accommodating")) {
    defaultBase = `It is my absolute privilege to assist you. At ${companyName}, we specialize in curating bespoke experiences of the highest caliber. I will personally coordinate with our global contacts to ensure your requests are fulfilled seamlessly. Shall I have a travel concierge call you directly to discuss the fine details?`;
  } else {
    defaultBase = `Hello! I'm ${agent.name}, the ${agent.role} at ${companyName}. ${brain.profile.overview} We would love to discuss how we can help you with our products and services. Let me know if you would like to book a call or have any other questions.`;
  }

  // Inject a "Do Rule" into the default response if available to make it look smart
  if (brain.doRules && brain.doRules.length > 0) {
    const randomDoRule = brain.doRules[0]; // grab the first rule
    // Softly mix it in or append
    if (!defaultBase.includes(randomDoRule)) {
      defaultBase += `\n\n(We always ensure that: ${randomDoRule.replace(/\.$/, "")})`;
    }
  }

  return formatResponseWithTone(defaultBase, agent, brain);
}

/**
 * Formats a raw answer base to match the agent's tone and personality guidelines.
 */
function formatResponseWithTone(text: string, agent: Agent, brain: BrandBrain): string {
  // Let's add prefix/suffix wrapping to simulate the agent speaking
  const tone = agent.tone.toLowerCase();
  
  if (tone.includes("empathetic") || tone.includes("concierge") || tone.includes("sophisticated")) {
    return `Hello! ✨ \n\n${text}\n\nWarmly, \n${agent.name} (Your ${agent.role})`;
  }
  
  if (tone.includes("direct") || tone.includes("analytical")) {
    return `[System: Dispatch Route Analysis Enabled]\n\n${text}\n\nRegards,\n${agent.name}\n${agent.role}`;
  }

  if (tone.includes("clinical") || tone.includes("professional")) {
    return `Greetings. This is ${agent.name}, ${agent.role} at ${brain.profile.name}. \n\n${text}\n\nPlease review our post-procedure instructions. Let us know if you require further assistance.`;
  }

  return `[${agent.name} - ${agent.role}]:\n\n${text}`;
}
