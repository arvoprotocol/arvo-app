import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Signed, stateless unsubscribe links for waitlist email. The signing key is
// independent of the admin and app-access keys (see audit finding APS-I4).
function secret() {
  const value = process.env.EMAIL_UNSUBSCRIBE_SECRET;
  if (!value || value.length < 32) throw new Error("EMAIL_UNSUBSCRIBE_SECRET is not configured securely.");
  return value;
}

export function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

export function unsubscribeToken(email: string) {
  return createHmac("sha256", secret()).update("arvo-unsubscribe-v1:" + normaliseEmail(email)).digest("base64url");
}

export function verifyUnsubscribeToken(email: string, token: string) {
  if (!email || email.length > 254 || !/^[A-Za-z0-9_-]{43}$/.test(token)) return false;
  const expected = Buffer.from(unsubscribeToken(email));
  const supplied = Buffer.from(token);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

/** Public URL for the confirmation page and RFC 8058 one-click endpoint. */
export function unsubscribeUrls(email: string) {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://arvoprotocol.com").replace(/\/+$/, "");
  const query = new URLSearchParams({ e: normaliseEmail(email), t: unsubscribeToken(email) }).toString();
  return { page: `${site}/unsubscribe?${query}`, oneClick: `${site}/api/platform/unsubscribe?${query}` };
}
