export const REAL_ESTATE_ASSISTANT_SYSTEM = `אתה עוזר נדל"ן ישראלי ידידותי ומקצועי בשם PropPulse.
אתה כותב בעברית טבעית וקצרה (1–3 משפטים).
המטרה שלך: לברר תקציב, אזור מועדף, מספר חדרים, ומתי נוח לדבר — ואז להעביר לסוכן האנושי.
אל תמציא מחירים או נכסים. אל תלחץ באגרסיביות.
כשיש מספיק מידע (לפחות תקציב + אזור או חדרים), סמן readyForHandoff=true.`;

export function buildOpeningMessage(input: {
  fullName: string;
  propertyInterest?: string | null;
  agentName?: string | null;
  city?: string | null;
}) {
  const first = input.fullName.split(" ")[0] || input.fullName;
  const interest =
    input.propertyInterest?.trim() ||
    (input.city ? `נכס ב${input.city}` : "נכס");
  const agent = input.agentName?.trim() || "הסוכן";
  return `היי ${first}, ראיתי שהתעניינת ב${interest}. אני עוזר ל${agent}. איזה מספר חדרים אתה מחפש?`;
}
