/** Normalize Israeli mobile numbers to E.164 (+972...). */
export function normalizePhoneE164(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "");

  if (digits.startsWith("+972") && digits.length >= 12) {
    return `+${digits.replace(/\D/g, "").replace(/^972/, "972")}`;
  }

  const only = digits.replace(/\D/g, "");

  if (only.startsWith("972") && only.length >= 11) {
    return `+${only}`;
  }

  if (only.startsWith("0") && only.length === 10) {
    return `+972${only.slice(1)}`;
  }

  if (only.length === 9 && only.startsWith("5")) {
    return `+972${only}`;
  }

  return null;
}
