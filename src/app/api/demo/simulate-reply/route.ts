import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizePhoneE164 } from "@/lib/leads/normalize-phone";
import { getLead } from "@/lib/store/repository";

const Schema = z.object({
  leadId: z.string().uuid(),
  text: z.string().min(1),
});

/** Demo helper: simulate an inbound WhatsApp reply for a lead. */
export async function POST(request: Request) {
  try {
    const parsed = Schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const lead = await getLead(parsed.data.leadId);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const from = lead.phone_e164 ?? normalizePhoneE164(lead.phone);
    if (!from) {
      return NextResponse.json({ error: "Lead phone invalid" }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const res = await fetch(`${origin}/api/whatsapp/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        text: parsed.data.text,
        messageId: `sim-${crypto.randomUUID()}`,
      }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("demo/simulate-reply", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
