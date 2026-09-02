export type LeadStatus =
  | "new"
  | "engaging"
  | "qualifying"
  | "ready"
  | "handed_off"
  | "contacted";

export type ConversationSender = "bot" | "lead" | "agent";

export type TerminalCategory =
  | "exclusive"
  | "pinui_binui"
  | "whatsapp_signal"
  | "general";

export type TerminalUrgency = "low" | "medium" | "high" | "critical";

export type TerminalTier = "pro" | "enterprise";

export interface User {
  id: string;
  email: string;
  subscription_status: boolean;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  location: string;
  exact_address: string | null;
  contact_phone: string | null;
  source_url: string | null;
  price_range: string | null;
  property_type: string | null;
  city: string | null;
  created_at: string;
}

export interface AgentPreferences {
  id: string;
  user_id: string;
  preferred_city: string | null;
  property_type: string | null;
  whatsapp_number: string | null;
  agent_display_name: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  agent_id: string | null;
  full_name: string;
  phone: string;
  phone_e164: string | null;
  property_interest: string | null;
  status: LeadStatus;
  budget: string | null;
  preferred_area: string | null;
  rooms: string | null;
  preferred_contact_time: string | null;
  source: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  lead_id: string;
  sender: ConversationSender;
  message: string;
  external_message_id: string | null;
  created_at: string;
}

export interface TerminalItem {
  id: string;
  title: string;
  raw_content: string | null;
  source_name: string;
  location: string | null;
  price: number | null;
  category: TerminalCategory;
  sentiment_score: number | null;
  urgency: TerminalUrgency;
  created_at: string;
}

export interface TerminalSubscription {
  id: string;
  user_id: string;
  tier: TerminalTier;
  expires_at: string;
  created_at: string;
}

export interface PublicProject extends Project {
  is_locked: boolean;
}

export interface LeadWebhookPayload {
  fullName: string;
  phone: string;
  propertyInterest?: string;
  agentId?: string;
}

export type TerminalFilter =
  | "all"
  | "exclusive"
  | "pinui_binui"
  | "whatsapp_signal";
