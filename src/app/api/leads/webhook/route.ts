import { NextResponse } from "next/server";
import { z } from "zod";
import { buildOpeningMessage } from "@/lib/ai/prompts";
import { normalizePhoneE164 } from "@/lib/leads/normalize-phone";
import { DEMO_USER } from "@/lib/store/memory";
import {
  addConversation,
  createLead,
  findLeadByPhoneE164,
  getAgentPreferences,
  updateLead,
} from "@/lib/store/repository";
import { getWhatsAppProvider } from "@/lib/whatsapp/provider";

const Schema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(8),
  propertyInterest: z.string().optional(),
  agentId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  try {
    const parsed = Schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { fullName, phone, propertyInterest, agentId } = parsed.data;
    const phoneE164 = normalizePhoneE164(phone);
    if (!phoneE164) {
      return NextResponse.json(
        { error: "Invalid Israeli phone number" },
        { status: 400 },
      );
    }

    const existing = await findLeadByPhoneE164(phoneE164);
    if (existing) {
      return NextResponse.json({ ok: true, deduped: true, lead: existing });
    }

    const resolvedAgentId = agentId ?? DEMO_USER.id;
    const prefs = await getAgentPreferences(resolvedAgentId);

    const lead = await createLead({
      agent_id: resolvedAgentId,
      full_name: fullName,
      phone,
      phone_e164: phoneE164,
      property_interest: propertyInterest ?? null,
      budget: null,
      preferred_area: null,
      rooms: null,
      preferred_contact_time: null,
      source: "webhook",
    });

    const opening = buildOpeningMessage({
      fullName,
      propertyInterest,
      agentName: prefs?.agent_display_name,
      city: prefs?.preferred_city,
    });

    const wa = getWhatsAppProvider();
    const sent = await wa.sendText(phoneE164, opening);

    await addConversation({
      lead_id: lead.id,
      sender: "bot",
      message: opening,
      external_message_id: sent.messageId,
    });

    const updated = await updateLead(lead.id, { status: "engaging" });

    return NextResponse.json(
      {
        ok: true,
        lead: updated,
        whatsapp: sent,
        openingMessage: opening,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("leads/webhook", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
