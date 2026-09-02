export interface WhatsAppSendResult {
  messageId: string;
  provider: "mock" | "evolution";
}

export interface WhatsAppProvider {
  sendText(toE164: string, body: string): Promise<WhatsAppSendResult>;
}

export interface InboundWhatsAppMessage {
  from: string;
  text: string;
  messageId?: string;
}
