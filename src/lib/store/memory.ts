import type {
  AgentPreferences,
  Conversation,
  Lead,
  Project,
  TerminalItem,
  TerminalSubscription,
  User,
} from "@/lib/types";

export interface MemoryDb {
  users: User[];
  projects: Project[];
  agent_preferences: AgentPreferences[];
  leads: Lead[];
  conversations: Conversation[];
  terminal_items: TerminalItem[];
  terminal_subscriptions: TerminalSubscription[];
  whatsapp_outbox: Array<{
    id: string;
    to: string;
    body: string;
    created_at: string;
  }>;
}

declare global {
  // eslint-disable-next-line no-var
  var __proppulseMemoryDb: MemoryDb | undefined;
}

const DEMO_USER_ID = "11111111-1111-1111-1111-111111111111";

function nowIso(offsetMs = 0) {
  return new Date(Date.now() + offsetMs).toISOString();
}

function seed(): MemoryDb {
  return {
    users: [
      {
        id: DEMO_USER_ID,
        email: "agent@proppulse.co.il",
        subscription_status: false,
        stripe_customer_id: null,
        created_at: nowIso(-86_400_000),
      },
    ],
    projects: [
      {
        id: "22222222-2222-2222-2222-222222222201",
        title: "4 חדרים חדש — רמת גן",
        description: "דירת גן בפרויקט בוטיק, מסירה 2027",
        location: "רמת גן",
        exact_address: "ביאליק 42, רמת גן",
        contact_phone: "052-3456789",
        source_url: "https://example.com/ramat-gan",
        price_range: "₪3.2M–₪3.6M",
        property_type: "apartment",
        city: "רמת גן",
        created_at: nowIso(-3_600_000),
      },
      {
        id: "22222222-2222-2222-2222-222222222202",
        title: "פנטהאוז תל אביב — נווה צדק",
        description: "גג פרטי 40 מ״ר, נוף לים",
        location: "תל אביב",
        exact_address: "שבזי 18, תל אביב",
        contact_phone: "054-9876543",
        source_url: "https://example.com/neve-tzedek",
        price_range: "₪8.5M–₪9.1M",
        property_type: "penthouse",
        city: "תל אביב",
        created_at: nowIso(-7_200_000),
      },
      {
        id: "22222222-2222-2222-2222-222222222203",
        title: "פינוי-בינוי — חולון מרכז",
        description: "זכויות מוגדלות, שלב שיווק ראשוני",
        location: "חולון",
        exact_address: "סוקולוב 105, חולון",
        contact_phone: "050-1122334",
        source_url: "https://example.com/holon-pb",
        price_range: "₪2.1M–₪2.8M",
        property_type: "pinui_binui",
        city: "חולון",
        created_at: nowIso(-10_800_000),
      },
    ],
    agent_preferences: [
      {
        id: "33333333-3333-3333-3333-333333333301",
        user_id: DEMO_USER_ID,
        preferred_city: "תל אביב",
        property_type: "apartment",
        whatsapp_number: "+972521111111",
        agent_display_name: "יוני לוי",
        created_at: nowIso(-86_400_000),
      },
    ],
    leads: [
      {
        id: "44444444-4444-4444-4444-444444444401",
        agent_id: DEMO_USER_ID,
        full_name: "דני כהן",
        phone: "050-5556677",
        phone_e164: "+972505556677",
        property_interest: "דירת 4 חדרים ברמת גן",
        status: "engaging",
        budget: null,
        preferred_area: null,
        rooms: null,
        preferred_contact_time: null,
        source: "seed",
        created_at: nowIso(-1_800_000),
      },
    ],
    conversations: [
      {
        id: "55555555-5555-5555-5555-555555555501",
        lead_id: "44444444-4444-4444-4444-444444444401",
        sender: "bot",
        message:
          "היי דני, ראיתי שהתעניינת בדירת 4 חדרים ברמת גן. אני עוזר ליוני לוי. איזה תקציב אתה מחפש?",
        external_message_id: "mock-seed-1",
        created_at: nowIso(-1_700_000),
      },
    ],
    terminal_items: [
      {
        id: "66666666-6666-6666-6666-666666666601",
        title: "EXCL · דירת גן ר״ג · Off-market",
        raw_content:
          "Exclusive tip: garden apt Ramat Gan, seller wants quiet close within 10 days.",
        source_name: "Broker Network",
        location: "רמת גן",
        price: 3_450_000,
        category: "exclusive",
        sentiment_score: 0.72,
        urgency: "high",
        created_at: nowIso(-120_000),
      },
      {
        id: "66666666-6666-6666-6666-666666666602",
        title: "PB · חולון סוקולוב · שלב שיווק",
        raw_content:
          "Pinui-Binui Holon Sokolov — early marketing, 18 units remaining.",
        source_name: "MCP Scraper",
        location: "חולון",
        price: 2_350_000,
        category: "pinui_binui",
        sentiment_score: 0.41,
        urgency: "medium",
        created_at: nowIso(-300_000),
      },
      {
        id: "66666666-6666-6666-6666-666666666603",
        title: "WA · ליד חם ת״א · 5 חדרים",
        raw_content:
          "WhatsApp group signal: buyer looking for 5BR TLV budget up to 6.5M ASAP.",
        source_name: "WhatsApp Signals",
        location: "תל אביב",
        price: 6_200_000,
        category: "whatsapp_signal",
        sentiment_score: 0.88,
        urgency: "critical",
        created_at: nowIso(-60_000),
      },
      {
        id: "66666666-6666-6666-6666-666666666604",
        title: "GEN · השקעה פתח תקווה",
        raw_content: "2BR investment unit Petah Tikva near light rail.",
        source_name: "Yad2 Watch",
        location: "פתח תקווה",
        price: 1_890_000,
        category: "general",
        sentiment_score: 0.22,
        urgency: "low",
        created_at: nowIso(-900_000),
      },
    ],
    terminal_subscriptions: [],
    whatsapp_outbox: [],
  };
}

export function getMemoryDb(): MemoryDb {
  if (!globalThis.__proppulseMemoryDb) {
    globalThis.__proppulseMemoryDb = seed();
  }
  return globalThis.__proppulseMemoryDb;
}

export function resetMemoryDb() {
  globalThis.__proppulseMemoryDb = seed();
}

export const DEMO_USER = {
  id: DEMO_USER_ID,
  email: "agent@proppulse.co.il",
} as const;
