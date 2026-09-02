import { getEnv } from "@/lib/env";
import { MockWhatsAppProvider } from "@/lib/whatsapp/mock";
import type { WhatsAppProvider, WhatsAppSendResult } from "@/lib/whatsapp/types";

class EvolutionWhatsAppProvider implements WhatsAppProvider {
  async sendText(toE164: string, body: string): Promise<WhatsAppSendResult> {
    const env = getEnv();
    if (!env.evolutionApiUrl || !env.evolutionApiKey) {
      return new MockWhatsAppProvider().sendText(toE164, body);
    }

    const res = await fetch(
      `${env.evolutionApiUrl}/message/sendText/${env.evolutionInstance}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: env.evolutionApiKey,
        },
        body: JSON.stringify({
          number: toE164.replace(/\D/g, ""),
          text: body,
        }),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Evolution API error: ${res.status} ${text}`);
    }

    const data = (await res.json()) as { key?: { id?: string } };
    return {
      messageId: data.key?.id ?? crypto.randomUUID(),
      provider: "evolution",
    };
  }
}

export function getWhatsAppProvider(): WhatsAppProvider {
  const env = getEnv();
  if (env.whatsappProvider === "evolution") {
    return new EvolutionWhatsAppProvider();
  }
  return new MockWhatsAppProvider();
}
