import { ClientWorkspace, BrandBrain, Agent, Conversation, TrainingItem, SystemStats, CallScenario } from "./types";

// Seed client workspaces (for switcher and agency view)
export const initialWorkspaces: ClientWorkspace[] = [
  {
    id: "luna-aesthetics",
    clientName: "Luna Aesthetics Clinic",
    industry: "Health & Beauty",
    agentsCount: 2,
    volume: 1420,
    value: 1200,
    trainingStatus: 92,
  },
  {
    id: "apex-saas",
    clientName: "Apex SaaS Solutions",
    industry: "B2B Software",
    agentsCount: 3,
    volume: 3840,
    value: 2500,
    trainingStatus: 78,
  },
  {
    id: "horizon-travel",
    clientName: "Horizon Luxury Travel",
    industry: "Hospitality & Leisure",
    agentsCount: 1,
    volume: 850,
    value: 950,
    trainingStatus: 85,
  },
  {
    id: "eka-kitchen",
    clientName: "Eka Kitchen & Catering",
    industry: "Food & Hospitality",
    agentsCount: 1,
    volume: 920,
    value: 850,
    trainingStatus: 88,
  }
];

// Seed Brand Brains map keyed by Workspace ID
export const initialBrandBrains: Record<string, BrandBrain> = {
  "luna-aesthetics": {
    profile: {
      name: "Luna Aesthetics Clinic",
      industry: "Health & Beauty / Luxury Medical Spa",
      overview: "Luna Aesthetics is a boutique medical spa specializing in non-surgical facial rejuvenation, laser treatments, and advanced clinical skincare. We focus on natural-looking enhancements in a luxurious, serene environment.",
      products: [
        "Botox Cosmestic ($14/unit) - Smooths fine lines and wrinkles. Results last 3-4 months.",
        "Dermal Fillers (Juvederm/Restylane - starting at $650/syringe) - Restores volume, enhances lips and cheeks.",
        "Laser Skin Resurfacing ($450/session) - Targets sun damage, acne scars, and uneven texture.",
        "HydraFacial Deluxe ($225/session) - Deep clean, exfoliation, and intense hydration. Perfect pre-event treatment."
      ],
      pricingNotes: "Consultations are $50, which is fully redeemable against any treatment booked within 30 days. We offer package discounts on Hydrafacials and Laser treatments (buy 5, get 1 free). Payment plans are available via Cherry Financing.",
      policies: "24-hour cancellation policy: Cancellations within 24 hours or no-shows incur a $75 fee. Clients must be at least 18 years old or accompanied by a parent/guardian for consultations. Late arrivals of more than 15 minutes may need to be rescheduled.",
      ownerNotes: "Make sure clients know we only use FDA-approved products and all treatments are performed by board-certified nurse practitioners or licensed aesthetic medical specialists. Never diagnose skin conditions over chat."
    },
    toneOfVoice: "Warm, empathetic, professional, and sophisticated. It should feel like a high-end concierge speaking with a valued guest.",
    doRules: [
      "Always emphasize safety, FDA approval, and the qualifications of our medical staff.",
      "Recommend booking a personalized consultation for specific pricing, as skin needs vary.",
      "Use calming and welcoming language (e.g., 'serene journey', 'natural enhancement', 'customized care').",
      "Mention our $50 consultation fee is redeemable towards any treatment."
    ],
    dontRules: [
      "Never guarantee medical results or promise a specific outcome.",
      "Never prescribe or suggest specific medical treatments for severe skin diseases (e.g., severe cystic acne or skin lesions) - refer to a doctor.",
      "Do not give medical advice. Keep answers beauty and rejuvenation focused.",
      "Never use overly aggressive sales pitches. Luna is a premium luxury brand."
    ],
    faqs: [
      {
        id: "la-faq-1",
        question: "Does Botox hurt?",
        answer: "Most clients describe it as a quick, minor pinch. We use ultra-fine needles and can apply a topical numbing cream or ice to ensure you are completely comfortable during the process."
      },
      {
        id: "la-faq-2",
        question: "How long is recovery time for dermal fillers?",
        answer: "There is minimal downtime. You might experience minor swelling, redness, or bruising at the injection site, which typically resolves in 2 to 7 days. We provide complete post-care instructions to ensure a smooth recovery."
      },
      {
        id: "la-faq-3",
        question: "What is your booking and cancellation policy?",
        answer: "We require a credit card on file to secure your booking. If you need to reschedule or cancel, please let us know at least 24 hours in advance to avoid a $75 late cancellation fee."
      }
    ],
    exampleReplies: [
      "Hello! Welcome to Luna Aesthetics. I'd be absolutely delighted to help you explore our customized skincare and rejuvenation treatments. What treatment goals are you focusing on today?",
      "To give you the most accurate advice, we highly recommend scheduling a consultation. Our board-certified nurse practitioners will analyze your skin profile and design a personalized plan just for you. Shall we look at available spots this week?"
    ]
  },
  "apex-saas": {
    profile: {
      name: "Apex SaaS Solutions",
      industry: "B2B Software / Operations Tech",
      overview: "Apex is an all-in-one operations management platform designed for mid-market logistics and shipping companies. It automates routing, manages fleet scheduling, tracks fuel usage, and integrates directly with major global carriers.",
      products: [
        "Apex Starter ($99/mo per terminal) - Real-time tracking, basic routing, 3 carrier integrations.",
        "Apex Professional ($249/mo per terminal) - AI routing optimization, multi-carrier brokerage, custom reports, API access.",
        "Apex Enterprise (Custom pricing starting at $1,500/mo) - Dedicated server instance, unlimited terminals, custom carrier contracts, 24/7 phone support."
      ],
      pricingNotes: "Annual billing saves 20% on Starter and Professional tiers. Implementation and training are included free on Enterprise accounts, and cost a flat $1,000 on Professional accounts.",
      policies: "Subscriptions are month-to-month or annual. 30-day notice is required for cancellation. We sign standard service-level agreements (SLAs) with Enterprise clients guaranteeing 99.9% uptime.",
      ownerNotes: "Always target logistic managers and dispatch operations leads. Focus on savings (averaging 15% reduction in fuel costs and 22% improvement in fleet utilization)."
    },
    toneOfVoice: "Highly efficient, analytical, direct, and authoritative. Speak with operational confidence, using logistics terminology (fleet efficiency, API integration, routing dispatch).",
    doRules: [
      "Highlight concrete ROI metrics: 15% fuel savings, 22% fleet utilization improvements.",
      "Direct logistics managers to our 'Apex Professional' plan as the best value for fleet automation.",
      "Offer to arrange a screen-share demonstration with an operations engineer."
    ],
    dontRules: [
      "Do not give arbitrary discounts. Our pricing is fixed, except for Enterprise annual commitments.",
      "Do not make promises about carriers we don't integrate with (e.g., regional courier services in niche countries) without checking technical documents.",
      "Avoid conversational fluff. Logistics managers are busy - get straight to the facts."
    ],
    faqs: [
      {
        id: "apex-faq-1",
        question: "Does Apex integrate with QuickBooks?",
        answer: "Yes. Apex Professional and Enterprise tiers feature bi-directional QuickBooks and NetSuite syncing to automate invoices and driver payroll mapping instantly."
      },
      {
        id: "apex-faq-2",
        question: "How long does deployment take?",
        answer: "For Starter and Professional tiers, onboarding takes less than 48 hours. Enterprise deployments average 2-4 weeks, including legacy database ingestion and customized dispatcher training."
      }
    ],
    exampleReplies: [
      "Understood. Let's look at the numbers: Apex Professional optimizes fleet routing in real-time, reducing deadhead miles by an average of 18%. Can I schedule a 10-minute demo to show you how this looks on your local shipping lanes?",
      "For custom integrations, our Enterprise tier offers custom API connectors. What carriers are your dispatchers currently running?"
    ]
  },
  "horizon-travel": {
    profile: {
      name: "Horizon Luxury Travel",
      industry: "Luxury Hospitality & Private Jet Charters",
      overview: "Horizon Luxury Travel curate bespoke global itineraries, luxury villa rentals, private jet charters, and VIP concierge services for high-net-worth individuals and corporate executives.",
      products: [
        "Bespoke Itinerary Planning ($500 planning fee) - Tailored multi-destination trips with luxury accommodations and private transfers.",
        "Private Jet Charter Brokerage (Varies by aircraft, e.g., Light Jet from $5,000/hr) - Direct sourcing of empty legs and heavy jets.",
        "Horizon Elite Membership ($5,000 annual fee) - 24/7 dedicated travel concierge, complimentary room upgrades, and global airport lounge VIP escort."
      ],
      pricingNotes: "The planning fee is non-refundable but is credited toward hotel and villa bookings totaling over $10,000. Membership is billed annually.",
      policies: "All itineraries are subject to individual hotel, villa, and operator cancellation policies. Private jet bookings require wire transfer or pre-authorized credit card prior to takeoff.",
      ownerNotes: "Emphasize absolute discretion, convenience, and unique access (e.g., private viewing of museums, bookings at fully booked Michelin-star restaurants)."
    },
    toneOfVoice: "Refined, discreet, accommodating, and worldly. Express absolute assurance that everything can be arranged.",
    doRules: [
      "Mention our global network of elite hospitality contacts and exclusive amenities.",
      "Ensure the customer feels that their comfort and privacy are our highest priorities.",
      "Position Horizon as the solution to complex, time-sensitive luxury requests."
    ],
    dontRules: [
      "Never disclose the names of other clients or high-profile travelers.",
      "Do not use casual slang. Use formal, polished vocabulary.",
      "Never say 'we can't do that'. Offer a high-end alternative instead."
    ],
    faqs: [
      {
        id: "hz-faq-1",
        question: "Can you arrange last-minute reservations at fully booked restaurants?",
        answer: "Through our preferred relationships and local concierges on the ground, we frequently secure reservations at highly demanded Michelin-starred venues for our Elite members."
      }
    ],
    exampleReplies: [
      "It would be my absolute pleasure to assist in organizing your voyage. We can certainly arrange a private chauffeur and VIP airport fast-track at your destination. How many guests will be traveling in your party?",
      "To ensure we curate an itinerary that perfectly aligns with your preferences, would you be available for a brief introductory call with one of our Senior Travel Advisors?"
    ]
  },
  "eka-kitchen": {
    profile: {
      name: "Eka Kitchen & Catering",
      industry: "Premium West African Dining & Event Catering",
      overview: "Eka Kitchen is a high-end restaurant and bespoke catering brand based in Lagos, offering premium modern West African cuisine. We specialize in corporate event catering, private dining experiences, and premium daily lunch deliveries.",
      products: [
        "Signature Jollof & Grilled Suya Platter ($45/platter) - Serves 3-4. Spicy, smoky, and authentic.",
        "Corporate Lunch Package ($18/person) - Minimum 10 orders. Includes choice of main, sides, and local hibiscus drink (Zobo).",
        "Private Chef Dining Experience (Starting at $350/event) - Custom 5-course curated menu for intimate groups.",
        "Royal Seafood Okra & Poundo ($25/portion) - Premium crabs, prawns, and snails in rich local spices."
      ],
      pricingNotes: "A 50% non-refundable deposit is required to lock in catering dates. Daily lunch deliveries must be ordered before 10:00 AM. Pricing is in USD or equivalent Nigerian Naira (NGN) at our daily commercial rate.",
      policies: "Catering bookings must be finalized at least 7 days before the event. Cancellations within 72 hours of the event forfeit the deposit. Delivery orders have a flat $5 fee within Victoria Island, Ikoyi, and Lekki Phase 1.",
      ownerNotes: "Always emphasize our premium local ingredients, authentic recipes, and top-tier hygiene standards. Do not compromise on spice levels unless requested. Offer the Corporate Lunch Package for group inquiries."
    },
    toneOfVoice: "Warm, vibrant, hospitable, and proud. Express culinary passion, using words like 'savory', 'authentic spices', 'smoky aroma', and 'royal feast'.",
    doRules: [
      "Highlight that all meals are prepared fresh by professional chefs under strict hygiene conditions.",
      "Direct event planners to our Private Chef Dining Experience or Corporate Package.",
      "Politely mention our 50% catering deposit requirement."
    ],
    dontRules: [
      "Never promise last-minute catering bookings (under 48 hours notice) without manager approval.",
      "Do not offer discounts on catering unless the group exceeds 100 people.",
      "Avoid sounding cold or overly transactional; hospitality is our core."
    ],
    faqs: [
      {
        id: "eka-faq-1",
        question: "Do you offer gluten-free West African dishes?",
        answer: "Yes, we do! Many of our traditional dishes, such as our grilled Suya, Seafood Okra, and plantain sides, are naturally gluten-free. We can also prepare gluten-free swallows (like almond flour or plantain flour) upon request."
      },
      {
        id: "eka-faq-2",
        question: "Do you cater for weddings and large events outside Lagos?",
        answer: "Yes, Eka Kitchen caters for events across major Nigerian cities and destination weddings. Out-of-station bookings require travel and logistics accommodation coverage for our culinary team."
      }
    ],
    exampleReplies: [
      "Welcome to Eka Kitchen! 🌶️ It is our absolute pleasure to bring the rich, savory flavors of West Africa to your table. Are you planning an event or ordering lunch today?",
      "For our bespoke catering, we recommend a 50% deposit to secure your date. I'd love to connect you with our events coordinator to finalize your menu. Would you prefer a call or a WhatsApp message?"
    ]
  }
};

// Seed Agents list
export const initialAgents: Agent[] = [
  {
    id: "agent-1",
    name: "Sophia",
    role: "Aesthetic Consultant",
    personality: "Warm, supportive, and knowledgeable beauty guide. She walks clients through complex laser and injection treatments without clinical intimidation.",
    tone: "Empathetic & Sophisticated",
    channels: ["Web chat", "Instagram", "WhatsApp"],
    status: "Active",
    linkedBrainId: "luna-aesthetics",
  },
  {
    id: "agent-2",
    name: "Dr. Marcus (AI Assistant)",
    role: "Clinical FAQs Responder",
    personality: "Precise, professional, and safety-focused assistant. He handles complex questions about post-procedure care and FDA clearance details.",
    tone: "Clinical & Professional",
    channels: ["Web chat", "Email"],
    status: "Training",
    linkedBrainId: "luna-aesthetics",
  },
  {
    id: "agent-3",
    name: "Max",
    role: "Logistics Optimization Rep",
    personality: "Direct, analytical, and metric-driven specialist. Focuses on dispatcher pain points, route efficiencies, and pricing calculations.",
    tone: "Direct & Analytical",
    channels: ["Web chat", "Phone", "WhatsApp"],
    status: "Active",
    linkedBrainId: "apex-saas",
  },
  {
    id: "agent-4",
    name: "Olivia",
    role: "Customer Success Bot",
    personality: "Highly efficient, technical customer care assistant. Resolves fleet integration questions, API errors, and invoices.",
    tone: "Efficient & Clear",
    channels: ["Web chat", "Email"],
    status: "Draft",
    linkedBrainId: "apex-saas",
  },
  {
    id: "agent-5",
    name: "Julian",
    role: "Elite Concierge Advisor",
    personality: "Sophisticated, global jetsetter coordinator. Specializes in matching clients with high-end villas, yachts, and private flights.",
    tone: "Refined & Accommodating",
    channels: ["Web chat", "WhatsApp", "Voice"],
    status: "Active",
    linkedBrainId: "horizon-travel",
  },
  {
    id: "agent-6",
    name: "Amina",
    role: "Catering & Events Coordinator",
    personality: "Vibrant, warm, and highly organized culinary host. She makes party planning easy and gets clients excited about the food journey.",
    tone: "Vibrant & Welcoming",
    channels: ["Web chat", "WhatsApp", "Voice"],
    status: "Active",
    linkedBrainId: "eka-kitchen",
  }
];

// Seed Conversations
export const initialConversations: Record<string, Conversation[]> = {
  "luna-aesthetics": [
    {
      id: "conv-la-1",
      customerName: "Sarah Jenkins",
      channel: "WhatsApp",
      summary: "Inquiring about Botox duration and looking to book first treatment.",
      leadStatus: "Hot",
      date: "2026-06-14T08:15:00Z",
      sentiment: "Positive",
      needsFollowUp: true,
      messages: [
        { id: "m1", sender: "user", text: "Hi, I'm thinking about getting Botox before my wedding in August. How long does it usually last?", timestamp: "08:12" },
        { id: "m2", sender: "agent", text: "Congratulations on your upcoming wedding, Sarah! 🌸 Typically, Botox results last between 3 to 4 months. To ensure your skin looks absolutely radiant and settled for your special day, we usually suggest booking your treatment about 3 to 4 weeks prior to the wedding date. Would you like to check some available times for a consultation with one of our specialized practitioners?", timestamp: "08:13" },
        { id: "m3", sender: "user", text: "That makes sense. Yes, I'd like to look at consultation dates. Do you have any openings this Friday afternoon?", timestamp: "08:14" },
        { id: "m4", sender: "agent", text: "We do have two openings this Friday: one at 2:00 PM and another at 4:30 PM. Just as a quick note, our consultations are $50, which is fully redeemable against the cost of any treatment you book within 30 days. Do either of those times work for your schedule?", timestamp: "08:15" }
      ]
    },
    {
      id: "conv-la-2",
      customerName: "Michael Chang",
      channel: "Web chat",
      summary: "Asking if Hydrafacial deluxe works on sensitive skin.",
      leadStatus: "Warm",
      date: "2026-06-13T19:40:00Z",
      sentiment: "Neutral",
      needsFollowUp: false,
      messages: [
        { id: "m5", sender: "user", text: "Hello, I have very sensitive skin prone to redness. Is the HydraFacial Deluxe safe for me?", timestamp: "19:38" },
        { id: "m6", sender: "agent", text: "Hello Michael! Absolutely. The HydraFacial Deluxe is highly customizable and excellent for sensitive skin. Our clinical aesthetic specialists tailor the treatment by adjusting the suction levels and selecting soothing, hydrating serums containing chamomile and aloe. It deep cleanses and hydrates without the irritation associated with traditional facials.", timestamp: "19:39" },
        { id: "m7", sender: "user", text: "Great to hear. I will think about booking it. Thanks.", timestamp: "19:40" }
      ]
    },
    {
      id: "conv-la-3",
      customerName: "Emma Stone",
      channel: "Instagram",
      summary: "Complained about filler swelling and requested follow-up advice.",
      leadStatus: "New",
      date: "2026-06-14T09:20:00Z",
      sentiment: "Negative",
      needsFollowUp: true,
      messages: [
        { id: "m8", sender: "user", text: "Hi, I had lip fillers done yesterday at your clinic and my lips are super swollen today. Is this normal? It looks a bit scary.", timestamp: "09:18" },
        { id: "m9", sender: "agent", text: "Hello Emma, please rest assured that moderate swelling, redness, and minor bruising are completely normal and very common within the first 24 to 48 hours after lip injections. To help reduce the swelling, you can apply a cold compress gently for 10-15 minutes at a time and keep your head elevated. However, your comfort and safety are our priorities. I will immediately notify our nurse practitioner to check in on you. Can you confirm the best contact number for you?", timestamp: "09:20" }
      ]
    }
  ],
  "apex-saas": [
    {
      id: "conv-apex-1",
      customerName: "Robert Vance (Vance Logistics)",
      channel: "Phone",
      summary: "Looking to connect fleet of 45 vehicles to Apex Pro. Inquired about NetSuite integration.",
      leadStatus: "Hot",
      date: "2026-06-14T07:45:00Z",
      sentiment: "Positive",
      needsFollowUp: true,
      messages: [
        { id: "m10", sender: "user", text: "Hey there, we operate 45 trucks across the Midwest. We need NetSuite integration to sync dispatch payroll. Does the $249/mo plan cover that?", timestamp: "07:40" },
        { id: "m11", sender: "agent", text: "Yes, Robert. The Apex Professional tier at $249/terminal per month supports full bi-directional integration with both NetSuite and QuickBooks. For a fleet of your size, this automation will cut dispatch payroll administration times by approximately 70% and reduce routing overhead. I can set up a live integration screen-share with one of our solutions engineers. Would you be open to a call today at 2:00 PM CST?", timestamp: "07:42" },
        { id: "m12", sender: "user", text: "2:00 PM works. Let's do it. Call my office line.", timestamp: "07:45" }
      ]
    },
    {
      id: "conv-apex-2",
      customerName: "Jane Doe (Pacific Cargo)",
      channel: "Web chat",
      summary: "Objecting to the terminal pricing model. Wants flat fee.",
      leadStatus: "Warm",
      date: "2026-06-13T15:20:00Z",
      sentiment: "Negative",
      needsFollowUp: true,
      messages: [
        { id: "m13", sender: "user", text: "We have 15 terminals. Paying $249 per terminal gets really expensive for us. Can we get a flat rate for our whole team?", timestamp: "15:15" },
        { id: "m14", sender: "agent", text: "Hi Jane. For operations requiring 10+ terminals, we recommend looking into our annual contract option which reduces the rate by 20%, bringing it down to $199 per terminal. Alternatively, our Enterprise tier supports custom volume discounts tailored for larger teams. Let's do a quick calculation of the fleet routing efficiency savings to see how Apex covers its own footprint. Can you share your current monthly fuel expenditure?", timestamp: "15:18" },
        { id: "m15", sender: "user", text: "We spend about $18,000 on fuel. Let me talk to my CFO and I'll get back to you.", timestamp: "15:20" }
      ]
    }
  ],
  "horizon-travel": [
    {
      id: "conv-hz-1",
      customerName: "Arthur Pendelton",
      channel: "WhatsApp",
      summary: "Requested private jet quote from London to Nice.",
      leadStatus: "Hot",
      date: "2026-06-14T09:10:00Z",
      sentiment: "Positive",
      needsFollowUp: true,
      messages: [
        { id: "m16", sender: "user", text: "Hi, I need a private jet charter for 6 guests from London Luton to Nice Cote d'Azur this Thursday. Looking for a midsize jet. Can you check options?", timestamp: "09:05" },
        { id: "m17", sender: "agent", text: "It would be an absolute pleasure to arrange that for you, Mr. Pendelton. I will immediately contact our premium operator network to source options for a midsize cabin (such as a Citation XLS+ or Hawker 800XP) suitable for 6 passengers and luggage. I will compile a formal quote including catering preferences and flight times. May I confirm if you require chauffeur service at Nice airport?", timestamp: "09:10" }
      ]
    }
  ],
  "eka-kitchen": [
    {
      id: "conv-eka-1",
      customerName: "Chinedu Okafor",
      channel: "WhatsApp",
      summary: "Inquiring about corporate lunch packages for a team of 15.",
      leadStatus: "Hot",
      date: "2026-06-14T11:05:00Z",
      sentiment: "Positive",
      needsFollowUp: true,
      messages: [
        { id: "m18", sender: "user", text: "Hello, we have a board meeting this Thursday and want to order lunch for 15 people. Do you have group packages?", timestamp: "11:00" },
        { id: "m19", sender: "agent", text: "Hello Chinedu! We would love to host your board lunch. 🌶️ Our Corporate Lunch Package at $18 per person is perfect for this. It includes a choice of signature mains (like our smoky Jollof rice or fried rice), grilled chicken or fish, sides, and cold Zobo. Shall we lock this in for Thursday?", timestamp: "11:03" },
        { id: "m20", sender: "user", text: "Yes, that sounds perfect. Can we pay via bank transfer?", timestamp: "11:05" }
      ]
    }
  ]
};

// Seed Training Center Items
export const initialTrainingItems: Record<string, TrainingItem[]> = {
  "luna-aesthetics": [
    {
      id: "train-la-1",
      customerQuestion: "I'm pregnant, can I get a chemical peel?",
      aiAnswer: "Yes, chemical peels are perfectly fine because they are applied topically to the skin and don't enter the bloodstream.",
      ownerCorrection: "Absolutely not. Chemical peels (especially with salicylic or glycolic acid) are contraindicated during pregnancy. We advise avoiding them and recommend our pregnancy-safe Hydrafacial instead.",
      status: "Pending"
    },
    {
      id: "train-la-2",
      customerQuestion: "Why is the consultation $50? Can I get it for free?",
      aiAnswer: "The consultation is $50 to pay for our nurse's time. You cannot get it for free.",
      ownerCorrection: "The $50 fee secures your booking with our medical professionals and is fully credited toward any treatment or product purchase you make within 30 days, meaning the consultation is effectively free if you choose to proceed with us.",
      status: "Pending"
    }
  ],
  "apex-saas": [
    {
      id: "train-apex-1",
      customerQuestion: "Can I use Apex to manage deliveries in Australia?",
      aiAnswer: "No, Apex only supports carrier integrations in the United States and Canada.",
      ownerCorrection: "Yes, Apex does support Australian deliveries! We integrate with major carriers in Australia, including Australia Post, Toll, and StarTrack. Routing optimization works globally.",
      status: "Pending"
    },
    {
      id: "train-apex-2",
      customerQuestion: "We need custom API webhooks for fleet triggers. Does that cost extra?",
      aiAnswer: "Yes, custom webhooks are only available on the Enterprise tier which is custom priced.",
      ownerCorrection: "Standard webhooks are included in the Professional tier ($249/mo), but complex custom integrations requiring developer support fall under our Enterprise tier.",
      status: "Pending"
    }
  ],
  "horizon-travel": [
    {
      id: "train-hz-1",
      customerQuestion: "What is your refund policy if the weather cancels the flight?",
      aiAnswer: "If weather cancels the flight, we do not issue refunds as weather is out of our control.",
      ownerCorrection: "If a flight is cancelled due to weather, we work directly with the operator to reschedule the flight at no cost. If rescheduling is impossible, a full refund of the charter cost is returned, minus any positioning costs already incurred.",
      status: "Pending"
    }
  ],
  "eka-kitchen": [
    {
      id: "train-eka-1",
      customerQuestion: "Can we cancel a lunch delivery order after 10:30 AM?",
      aiAnswer: "Yes, you can cancel your delivery order anytime before it arrives.",
      ownerCorrection: "No, lunch delivery orders are prepared fresh and dispatched starting at 10:00 AM. Cancellations or changes are only permitted before 10:00 AM on the day of delivery.",
      status: "Pending"
    }
  ]
};

// Seed admin platform owner stats
export const seedSystemStats: SystemStats = {
  totalUsers: 1420,
  totalBusinesses: 580,
  totalAgents: 890,
  totalConversations: 24500,
  systemHealth: "Optimal",
  activeNodes: 14,
  apiUsagePercent: 64,
  errorsCount: 3
};

export const initialCallScenarios: CallScenario[] = [
  {
    id: "scen-pricing-inquiry",
    title: "Pricing Inquiry",
    persona: "Sarah Jenkins",
    mood: "curious",
    goal: "Understand the pricing for Botox and check if package discounts exist.",
    openingLine: "Hi, I was looking at your services and wanted to know how much you charge for Botox? Do you offer any packages?",
    expectedOutcome: "The agent should explain the $14/unit price, the $50 redeemable consultation fee, and the Cherry Financing option without inventing custom deals.",
    difficulty: "Easy",
    agentId: "agent-1"
  },
  {
    id: "scen-booking-request",
    title: "Booking Request",
    persona: "Robert Chen",
    mood: "calm",
    goal: "Book a Deluxe HydraFacial for this Friday afternoon.",
    openingLine: "Hello! I'd like to schedule a Deluxe HydraFacial for this Friday. Do you have any slots open in the afternoon?",
    expectedOutcome: "The agent should note the request, explain the booking process (credit card on file to secure booking), and advise rescheduling or cancellation policy.",
    difficulty: "Easy",
    agentId: "agent-1"
  },
  {
    id: "scen-complaint",
    title: "Late Fee Objection",
    persona: "Linda Thompson",
    mood: "angry",
    goal: "Complain about a $75 late cancellation charge and demand a waiver.",
    openingLine: "I noticed a $75 charge on my credit card from you guys. I had to cancel late because of a family emergency, and this fee is ridiculous. I want this refunded immediately!",
    expectedOutcome: "The agent should stay empathetic and calm, explain the 24-hour policy, offer to log the dispute, set follow-up to True, and escalate to management.",
    difficulty: "Hard",
    agentId: "agent-1"
  },
  {
    id: "scen-b2b-objection",
    title: "Enterprise ROI Objection",
    persona: "Frank Vance (Logistics Director)",
    mood: "skeptical",
    goal: "Verify if the software supports custom API triggers and challenge the enterprise tier price.",
    openingLine: "We run a fleet of 50 trucks and need custom webhook triggers for dispatch events. The other rep said we have to pay for the Enterprise tier. Why should we pay extra for basic integrations?",
    expectedOutcome: "The agent should explain that standard webhooks are in the Professional tier ($249/mo), but complex customization requires Enterprise, emphasizing the 15% fuel reduction ROI.",
    difficulty: "Medium",
    agentId: "agent-3"
  },
  {
    id: "scen-unknown-question",
    title: "Unknown Medical Objection",
    persona: "Aria Blake",
    mood: "urgent",
    goal: "Ask if Botox is safe to get while having active eczema on the face.",
    openingLine: "Hi, I have a Botox consult scheduled, but I'm having a really bad eczema flare-up on my forehead right now. Is it safe to inject Botox directly into eczema skin?",
    expectedOutcome: "The agent must strictly follow the safety/doctor escalation rule: refuse to give medical advice, politely log the query, and promise a medical practitioner will follow up.",
    difficulty: "Hard",
    agentId: "agent-2"
  },
  {
    id: "scen-eka-catering",
    title: "Catering Deposit Objection",
    persona: "Tunde Alao",
    mood: "skeptical",
    goal: "Inquire about catering deposit and negotiate a lower booking deposit than 50%.",
    openingLine: "Hi, I'm planning an anniversary party for 80 guests. I want to book your catering services, but 50% upfront is too high. Can we do a 10% deposit instead?",
    expectedOutcome: "The agent should explain that the 50% deposit is standard to secure fresh ingredients and lock in the date, but they can offer to split the deposit into two payments (25% now, 25% 30 days before event) with manager approval.",
    difficulty: "Medium",
    agentId: "agent-6"
  }
];
