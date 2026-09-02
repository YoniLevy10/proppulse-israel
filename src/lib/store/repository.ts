import { hasSupabase as supabaseConfigured } from "@/lib/env";
import { DEMO_USER, getMemoryDb } from "@/lib/store/memory";
import type {
  AgentPreferences,
  Conversation,
  ConversationSender,
  Lead,
  LeadStatus,
  Project,
  PublicProject,
  TerminalCategory,
  TerminalFilter,
  TerminalItem,
  TerminalSubscription,
  TerminalUrgency,
  User,
} from "@/lib/types";

function uid() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

export async function getDemoUser(): Promise<User> {
  const db = getMemoryDb();
  const user = db.users.find((u) => u.id === DEMO_USER.id);
  if (!user) throw new Error("Demo user missing");
  return user;
}

export async function upgradeDemoUser(tier: "pro" | "enterprise" = "pro") {
  const db = getMemoryDb();
  const user = db.users.find((u) => u.id === DEMO_USER.id);
  if (!user) throw new Error("Demo user missing");

  user.subscription_status = true;
  user.stripe_customer_id =
    user.stripe_customer_id ?? `cus_mock_${Date.now()}`;

  const expires = new Date();
  expires.setMonth(expires.getMonth() + 1);

  const existing = db.terminal_subscriptions.find((s) => s.user_id === user.id);
  if (existing) {
    existing.tier = tier;
    existing.expires_at = expires.toISOString();
  } else {
    db.terminal_subscriptions.push({
      id: uid(),
      user_id: user.id,
      tier,
      expires_at: expires.toISOString(),
      created_at: now(),
    });
  }

  return { user, subscription: getTerminalSubscription(user.id) };
}

export function getTerminalSubscription(
  userId: string,
): TerminalSubscription | null {
  const db = getMemoryDb();
  const sub = db.terminal_subscriptions.find((s) => s.user_id === userId);
  if (!sub) return null;
  if (new Date(sub.expires_at).getTime() < Date.now()) return null;
  return sub;
}

export function maskProject(
  project: Project,
  subscribed: boolean,
): PublicProject {
  if (subscribed) return { ...project, is_locked: false };
  return {
    ...project,
    exact_address: null,
    contact_phone: null,
    is_locked: true,
  };
}

export async function listProjectsForUser(
  subscribed: boolean,
): Promise<PublicProject[]> {
  const db = getMemoryDb();
  return [...db.projects]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((p) => maskProject(p, subscribed));
}

export async function createProject(
  input: Omit<Project, "id" | "created_at">,
): Promise<Project> {
  const db = getMemoryDb();
  const project: Project = { ...input, id: uid(), created_at: now() };
  db.projects.unshift(project);
  return project;
}

export async function getAgentPreferences(
  userId: string,
): Promise<AgentPreferences | null> {
  const db = getMemoryDb();
  return db.agent_preferences.find((p) => p.user_id === userId) ?? null;
}

export async function createLead(
  input: Omit<Lead, "id" | "created_at" | "status"> & { status?: LeadStatus },
): Promise<Lead> {
  const db = getMemoryDb();
  const lead: Lead = {
    ...input,
    id: uid(),
    status: input.status ?? "new",
    created_at: now(),
  };
  db.leads.unshift(lead);
  return lead;
}

export async function updateLead(
  leadId: string,
  patch: Partial<Lead>,
): Promise<Lead | null> {
  const db = getMemoryDb();
  const lead = db.leads.find((l) => l.id === leadId);
  if (!lead) return null;
  Object.assign(lead, patch);
  return lead;
}

export async function findLeadByPhoneE164(
  phoneE164: string,
): Promise<Lead | null> {
  const db = getMemoryDb();
  return db.leads.find((l) => l.phone_e164 === phoneE164) ?? null;
}

export async function getLead(leadId: string): Promise<Lead | null> {
  return getMemoryDb().leads.find((l) => l.id === leadId) ?? null;
}

export async function listLeads(agentId?: string): Promise<Lead[]> {
  const db = getMemoryDb();
  return db.leads
    .filter((l) => (agentId ? l.agent_id === agentId : true))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function addConversation(input: {
  lead_id: string;
  sender: ConversationSender;
  message: string;
  external_message_id?: string | null;
}): Promise<Conversation> {
  const db = getMemoryDb();
  const row: Conversation = {
    id: uid(),
    lead_id: input.lead_id,
    sender: input.sender,
    message: input.message,
    external_message_id: input.external_message_id ?? null,
    created_at: now(),
  };
  db.conversations.push(row);
  return row;
}

export async function listConversations(
  leadId: string,
): Promise<Conversation[]> {
  return getMemoryDb()
    .conversations.filter((c) => c.lead_id === leadId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export async function listTerminalItems(
  filter: TerminalFilter = "all",
): Promise<TerminalItem[]> {
  const db = getMemoryDb();
  return db.terminal_items
    .filter((item) =>
      filter === "all" ? true : item.category === (filter as TerminalCategory),
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getTerminalItem(
  itemId: string,
): Promise<TerminalItem | null> {
  return getMemoryDb().terminal_items.find((i) => i.id === itemId) ?? null;
}

export async function createTerminalItem(input: {
  title: string;
  raw_content?: string | null;
  source_name: string;
  location?: string | null;
  price?: number | null;
  category?: TerminalCategory;
  sentiment_score?: number | null;
  urgency?: TerminalUrgency;
}): Promise<TerminalItem> {
  const db = getMemoryDb();
  const item: TerminalItem = {
    id: uid(),
    title: input.title,
    raw_content: input.raw_content ?? null,
    source_name: input.source_name,
    location: input.location ?? null,
    price: input.price ?? null,
    category: input.category ?? "general",
    sentiment_score: input.sentiment_score ?? null,
    urgency: input.urgency ?? "medium",
    created_at: now(),
  };
  db.terminal_items.unshift(item);
  return item;
}

export async function pushWhatsAppOutbox(to: string, body: string) {
  const db = getMemoryDb();
  const row = { id: uid(), to, body, created_at: now() };
  db.whatsapp_outbox.unshift(row);
  return row;
}

export async function listWhatsAppOutbox(limit = 20) {
  return getMemoryDb().whatsapp_outbox.slice(0, limit);
}

export function usingSupabaseBackend() {
  return supabaseConfigured();
}
