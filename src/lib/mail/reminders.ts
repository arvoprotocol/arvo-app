import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Signed links for maturity reminders (confirm / stop). Uses the independent
// EMAIL_UNSUBSCRIBE_SECRET with a distinct prefix so tokens are not interchangeable.
function secret() {
  const value = process.env.EMAIL_UNSUBSCRIBE_SECRET;
  if (!value || value.length < 32) throw new Error("EMAIL_UNSUBSCRIBE_SECRET is not configured securely.");
  return value;
}
export type ReminderAction = "confirm" | "stop";

export function reminderToken(action: ReminderAction, email: string, wallet: string) {
  return createHmac("sha256", secret()).update(`arvo-reminder-v1:${action}:${email.toLowerCase()}:${wallet.toLowerCase()}`).digest("base64url");
}
export function verifyReminderToken(action: ReminderAction, email: string, wallet: string, token: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return false;
  const a = Buffer.from(reminderToken(action, email, wallet)), b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}
export function reminderLink(action: ReminderAction, email: string, wallet: string) {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://arvoprotocol.com").replace(/\/+$/, "");
  const q = new URLSearchParams({ a: action, e: email.toLowerCase(), w: wallet.toLowerCase(), t: reminderToken(action, email, wallet) });
  return action === "confirm" ? `${site}/api/platform/reminders?${q}` : `${site}/reminders?${q}`;
}
