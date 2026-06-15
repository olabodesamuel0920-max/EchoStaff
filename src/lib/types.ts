export interface BusinessProfile {
  name: string;
  industry: string;
  overview: string;
  products: string[];
  pricingNotes: string;
  policies: string;
  ownerNotes: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface BrandBrain {
  profile: BusinessProfile;
  faqs: FAQ[];
  toneOfVoice: string;
  doRules: string[];
  dontRules: string[];
  exampleReplies: string[];
  handoffName?: string;
  handoffContact?: string;
  handoffRules?: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  personality: string;
  tone: string;
  channels: string[]; // e.g. "Web chat", "Voice", "WhatsApp", "Phone", "Instagram", "Email"
  status: "Draft" | "Training" | "Active";
  linkedBrainId: string; // references a workspace/client ID
  callReadiness?: number;
  lastSimulationResult?: string;
  needsTraining?: boolean;
}

export interface Message {
  id: string;
  sender: "user" | "agent" | "system";
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  customerName: string;
  channel: string; // "Web chat" | "WhatsApp" | "Instagram" etc.
  summary: string;
  leadStatus: "New" | "Hot" | "Warm" | "Cold" | "Converted";
  date: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  needsFollowUp: boolean;
  messages: Message[];
}

export interface TrainingItem {
  id: string;
  customerQuestion: string;
  aiAnswer: string;
  ownerCorrection?: string;
  status: "Pending" | "Approved" | "Improved";
}

export interface ClientWorkspace {
  id: string;
  clientName: string;
  industry: string;
  agentsCount: number;
  volume: number;
  value: number; // e.g. monthly contract value
  trainingStatus: number; // percentage (e.g. 85%)
}

export interface SystemStats {
  totalUsers: number;
  totalBusinesses: number;
  totalAgents: number;
  totalConversations: number;
  systemHealth: "Optimal" | "Degraded" | "Critical";
  activeNodes: number;
  apiUsagePercent: number;
  errorsCount: number;
}

export interface CallScenario {
  id: string;
  title: string;
  persona: string;
  mood: "calm" | "curious" | "skeptical" | "urgent" | "angry";
  goal: string;
  openingLine: string;
  expectedOutcome: string;
  difficulty: "Easy" | "Medium" | "Hard";
  agentId: string;
}

export interface CallScorecard {
  qualityScore: number;
  toneMatchScore: number;
  policySafetyScore: number;
  missingKnowledge?: string;
  recommendedTrainingAction?: string;
  detectedIntent: string;
  leadStatus: "Cold" | "Warm" | "Hot" | "Converted";
  confidenceScore: number;
  suggestedFollowUp: boolean;
}

export interface CallSimulation {
  id: string;
  scenarioId: string;
  agentId: string;
  durationSeconds: number;
  scorecard?: CallScorecard;
  conversationId: string;
  date: string;
  status: "ringing" | "connected" | "ended" | "analyzing";
}

export interface WidgetConfig {
  id: string;
  workspaceId: string;
  agentId: string;
  publicKey: string;
  enabled: boolean;
  greeting: string;
  accentColor: string;
  displayName: string;
  allowedDomains: string[];
}

