import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { getEnv } from "@/lib/env";
import { REAL_ESTATE_ASSISTANT_SYSTEM } from "@/lib/ai/prompts";
import type { Lead, LeadStatus } from "@/lib/types";

const QualificationSchema = z.object({
  replyHebrew: z.string(),
  budget: z.string().nullable(),
  preferredArea: z.string().nullable(),
  rooms: z.string().nullable(),
  preferredContactTime: z.string().nullable(),
  readyForHandoff: z.boolean(),
  nextStatus: z.enum(["engaging", "qualifying", "ready", "handed_off"]),
});

export type QualificationResult = z.infer<typeof QualificationSchema>;

function heuristicQualify(lead: Lead, inbound: string): QualificationResult {
  const text = inbound.trim();
  const lower = text.toLowerCase();

  let budget = lead.budget;
  let preferredArea = lead.preferred_area;
  let rooms = lead.rooms;
  let preferredContactTime = lead.preferred_contact_time;

  const budgetMatch = text.match(
    /(\d+(?:\.\d+)?)\s*(מיליון|מ['׳']|m|אלף|k)?/i,
  );
  if (budgetMatch) budget = budgetMatch[0];
  if (/תקציב|עד\s*\d/.test(text)) budget = budget ?? text;

  const roomMatch = text.match(/(\d(?:\.\d)?)\s*חדר/);
  if (roomMatch) rooms = roomMatch[1];
  else if (/חדר/.test(text) && !rooms) rooms = text;

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
  ];
  for (const city of cities) {
    if (text.includes(city)) {
      preferredArea = city;
      break;
    }
  }

  if (/בוקר|צהריים|ערב|מחר|היום|בשעה/.test(text)) {
    preferredContactTime = text;
  }

  let nextStatus: Extract<
    LeadStatus,
    "engaging" | "qualifying" | "ready" | "handed_off"
  > = "engaging";
  let replyHebrew = "";
  let readyForHandoff = false;

  if (!rooms) {
    nextStatus = "engaging";
    replyHebrew = "מעולה, תודה! כמה חדרים אתה מחפש בערך?";
  } else if (!budget) {
    nextStatus = "qualifying";
    replyHebrew = "מעולה. ומה התקציב המשוער שלך?";
  } else if (!preferredArea) {
    nextStatus = "qualifying";
    replyHebrew = "הבנתי. באיזה אזור אתה מעדיף לחפש?";
  } else if (!preferredContactTime) {
    nextStatus = "qualifying";
    replyHebrew =
      "יש לי את הפרטים. מתי נוח לך לדבר עם הסוכן — בוקר, צהריים או ערב?";
  } else {
    nextStatus = "ready";
    readyForHandoff = true;
    replyHebrew =
      "תודה רבה! מעביר אותך עכשיו לסוכן שלנו שיחזור אליך בהקדם. יום נעים 🙂";
  }

  if (
    [budget, preferredArea, rooms, preferredContactTime].filter(Boolean)
      .length >= 3 &&
    /כן|בטח|אשמח|מוכן/.test(lower)
  ) {
    readyForHandoff = true;
    nextStatus = "ready";
    replyHebrew =
      "מעולה — מעביר את הפרטים לסוכן. הוא ייצור איתך קשר בקרוב.";
  }

  return {
    replyHebrew,
    budget,
    preferredArea,
    rooms,
    preferredContactTime,
    readyForHandoff,
    nextStatus,
  };
}

export async function qualifyLeadReply(
  lead: Lead,
  inbound: string,
  history: Array<{ sender: string; message: string }>,
): Promise<QualificationResult> {
  const env = getEnv();
  if (!env.openaiApiKey) return heuristicQualify(lead, inbound);

  try {
    const openai = createOpenAI({ apiKey: env.openaiApiKey });
    const historyText = history
      .slice(-8)
      .map((m) => `${m.sender}: ${m.message}`)
      .join("\n");

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: QualificationSchema,
      system: REAL_ESTATE_ASSISTANT_SYSTEM,
      prompt: `ליד נוכחי:
שם: ${lead.full_name}
עניין: ${lead.property_interest ?? "לא ידוע"}
תקציב: ${lead.budget ?? "אין"}
אזור: ${lead.preferred_area ?? "אין"}
חדרים: ${lead.rooms ?? "אין"}
זמן שיחה: ${lead.preferred_contact_time ?? "אין"}

היסטוריה:
${historyText}

הודעה חדשה מהליד:
${inbound}

החזר תשובה בעברית ועדכון שדות אם הוזכרו.`,
    });

    return object;
  } catch {
    return heuristicQualify(lead, inbound);
  }
}
