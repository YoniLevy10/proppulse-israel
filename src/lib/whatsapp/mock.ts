import { pushWhatsAppOutbox } from "@/lib/store/repository";
import type { WhatsAppProvider, WhatsAppSendResult } from "@/lib/whatsapp/types";

export class MockWhatsAppProvider implements WhatsAppProvider {
  async sendText(toE164: string, body: string): Promise<WhatsAppSendResult> {
    const row = await pushWhatsAppOutbox(toE164, body);
    return { messageId: row.id, provider: "mock" };
  }
}
