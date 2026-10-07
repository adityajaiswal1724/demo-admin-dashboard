export const APPOINTMENT_FEE_PENCE = 1500;
export const DEMO_REFERENCE_DATE = "2026-09-24T08:00:00.000Z";
export const TIME_ZONE = "Europe/London";
export function relativeDate(days: number, hour = 10): string {
  const date = new Date(DEMO_REFERENCE_DATE);
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(hour, 0, 0, 0);
  return date.toISOString();
}
