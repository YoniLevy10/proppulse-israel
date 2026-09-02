import type { TerminalCategory, TerminalUrgency } from "@/lib/types";

export interface ParsedTerminalPayload {
  title: string;
  raw_content: string | null;
  source_name: string;
  location: string | null;
  price: number | null;
  category: TerminalCategory;
  sentiment_score: number | null;
  urgency: TerminalUrgency;
}

function detectCategory(text: string): TerminalCategory {
  const t = text.toLowerCase();
  if (/פינוי.?בינוי|pinui|binui|pb\b/.test(t)) return "pinui_binui";
  if (/whatsapp|וואטסאפ|wa\b|signal/.test(t)) return "whatsapp_signal";
  if (/exclusive|בלעדי|off[- ]?market/.test(t)) return "exclusive";
  return "general";
}

function detectUrgency(text: string): TerminalUrgency {
  const t = text.toLowerCase();
  if (/asap|מיידי|דחוף|critical|היום/.test(t)) return "critical";
  if (/10 days|שבוע|hot|חם|high/.test(t)) return "high";
  if (/low|רגוע/.test(t)) return "low";
  return "medium";
}

function extractPrice(text: string): number | null {
  const m =
    text.match(/₪\s*([\d,.]+)\s*([Mmמ])?/) ||
    text.match(/([\d,.]+)\s*(מיליון|m)\b/i) ||
    text.match(/price[:\s]+([\d,.]+)/i);
  if (!m) return null;
  const num = Number(m[1].replace(/,/g, ""));
  if (Number.isNaN(num)) return null;
  if (m[2] && /m|מ|מיליון/i.test(m[2])) return num * 1_000_000;
  if (num < 100) return num * 1_000_000;
  return num;
}

function extractLocation(text: string): string | null {
  const cities = [
    "תל אביב",
    "רמת גן",
    "גבעתיים",
    "חולון",
    "בת ים",
    "הרצליה",
    "רעננה",
    "פתח תקווה",
    "ירושלים",
    "חיפה",
    "TLV",
    "Tel Aviv",
    "Ramat Gan",
    "Holon",
  ];
  for (const city of cities) {
    if (text.includes(city)) return city;
  }
  return null;
}

export function parseTerminalIngest(body: Record<string, unknown>): ParsedTerminalPayload {
  const raw =
    typeof body.raw_content === "string"
      ? body.raw_content
      : typeof body.rawContent === "string"
        ? body.rawContent
        : typeof body.content === "string"
          ? body.content
          : typeof body.text === "string"
            ? body.text
            : "";

  const title =
    (typeof body.title === "string" && body.title) ||
    raw.slice(0, 80) ||
    "Untitled terminal item";

  const source_name =
    (typeof body.source_name === "string" && body.source_name) ||
    (typeof body.sourceName === "string" && body.sourceName) ||
    (typeof body.source === "string" && body.source) ||
    "MCP";

  const combined = `${title}\n${raw}`;
  const category =
    (body.category as TerminalCategory | undefined) ?? detectCategory(combined);
  const urgency =
    (body.urgency as TerminalUrgency | undefined) ?? detectUrgency(combined);

  const price =
    typeof body.price === "number"
      ? body.price
      : typeof body.price === "string"
        ? Number(body.price) || extractPrice(combined)
        : extractPrice(combined);

  const location =
    (typeof body.location === "string" && body.location) ||
    extractLocation(combined);

  const sentiment_score =
    typeof body.sentiment_score === "number"
      ? body.sentiment_score
      : typeof body.sentimentScore === "number"
        ? body.sentimentScore
        : null;

  return {
    title,
    raw_content: raw || null,
    source_name,
    location,
    price,
    category,
    sentiment_score,
    urgency,
  };
}
