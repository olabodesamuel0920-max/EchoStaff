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
  const companyName = brain.profile.name;
  
  // 1. Keyword check for FAQs
  for (const faq of brain.faqs) {
    // Simple overlap check
    const words = faq.question.toLowerCase().replace(/[?.,]/g, "").split(" ");
    const matchCount = words.filter(word => word.length > 3 && query.includes(word)).length;
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
