import { NextResponse } from "next/server";
import { z } from "zod";
import { qualifyLeadReply } from "@/lib/ai/qualify-lead";
import { normalizePhoneE164 } from "@/lib/leads/normalize-phone";
import {
  addConversation,
  findLeadByPhoneE164,
  getAgentPreferences,
  listConversations,
  updateLead,
} from "@/lib/store/repository";
import { getWhatsAppProvider } from "@/lib/whatsapp/provider";

const Schema = z.object({
  from: z.string().min(8),
  text: z.string().min(1),
  messageId: z.string().optional(),
  data: z
    .object({
      key: z
        .object({
          remoteJid: z.string().optional(),
          id: z.string().optional(),
        })
        .optional(),
      message: z
        .object({
          conversation: z.string().optional(),
          extendedTextMessage: z
            .object({ text: z.string().optional() })
            .optional(),
        })
        .optional(),
    })
    .optional(),
});

function extractInbound(body: z.infer<typeof Schema>) {
  if (body.from && body.text) {
    return {
      from: body.from,
      text: body.text,
      messageId: body.messageId,
    };
  }

  const jid = body.data?.key?.remoteJid ?? "";
  const digits = jid.replace(/@.*/, "").replace(/\D/g, "");
  const text =
    body.data?.message?.conversation ||
    body.data?.message?.extendedTextMessage?.text ||
    "";

  return {
    from: digits ? `+${digits}` : body.from,
    text,
    messageId: body.data?.key?.id ?? body.messageId,
  };
}

export async function POST(request: Request) {
  try {
    const parsed = Schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const inbound = extractInbound(parsed.data);
    if (!inbound.text?.trim()) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    const phoneE164 = normalizePhoneE164(inbound.from);
    if (!phoneE164) {
      return NextResponse.json({ error: "Invalid from phone" }, { status: 400 });
    }

    const lead = await findLeadByPhoneE164(phoneE164);
    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found for phone", phoneE164 },
        { status: 404 },
      );
    }

    await addConversation({
      lead_id: lead.id,
      sender: "lead",
      message: inbound.text,
      external_message_id: inbound.messageId ?? null,
    });

    const history = await listConversations(lead.id);
    const result = await qualifyLeadReply(
      lead,
      inbound.text,
      history.map((h) => ({ sender: h.sender, message: h.message })),
    );

    const updated = await updateLead(lead.id, {
      budget: result.budget,
      preferred_area: result.preferredArea,
      rooms: result.rooms,
      preferred_contact_time: result.preferredContactTime,
      status: result.readyForHandoff ? "handed_off" : result.nextStatus,
    });

    const wa = getWhatsAppProvider();
    const sent = await wa.sendText(phoneE164, result.replyHebrew);

    await addConversation({
      lead_id: lead.id,
      sender: "bot",
      message: result.replyHebrew,
      external_message_id: sent.messageId,
    });

    let agentNotify: { messageId: string } | null = null;
    if (result.readyForHandoff && lead.agent_id) {
      const prefs = await getAgentPreferences(lead.agent_id);
      if (prefs?.whatsapp_number) {
        const summary = `ליד מוכן: ${lead.full_name} (${lead.phone}). תקציב: ${result.budget ?? "—"}. אזור: ${result.preferredArea ?? "—"}. חדרים: ${result.rooms ?? "—"}. זמן: ${result.preferredContactTime ?? "—"}.`;
        const notify = await wa.sendText(prefs.whatsapp_number, summary);
        agentNotify = { messageId: notify.messageId };
        await addConversation({
          lead_id: lead.id,
          sender: "agent",
          message: `[handoff notify] ${summary}`,
          external_message_id: notify.messageId,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      lead: updated,
      reply: result.replyHebrew,
      whatsapp: sent,
      agentNotify,
      qualification: result,
    });
  } catch (error) {
    console.error("whatsapp/webhook", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
