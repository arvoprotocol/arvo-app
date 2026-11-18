import "server-only";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

// Crockford-style alphabet without ambiguous characters (no 0/O, 1/I/L).
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** ARVO-XXXXX-XXXXX: 10 random characters (~49 bits), uppercase, unambiguous. */
export function generateInvitationCode() {
  const bytes = randomBytes(10);
  let out = "";
  for (let i = 0; i < 10; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return `ARVO-${out.slice(0, 5)}-${out.slice(5)}`;
}

/** Creates `count` new active codes. Retries on the (unlikely) unique clash. */
export async function createInvitationCodes(count: number, label: string | null, maxUses: number) {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    for (let attempt = 0; ; attempt++) {
      const code = generateInvitationCode();
      try {
        await prisma.invitationCode.create({ data: { code, label, maxUses } });
        codes.push(code);
        break;
      } catch (error) {
        if (attempt >= 4) throw error;
      }
    }
  }
  return codes;
}

/**
 * Personal code for one email recipient. Reuses that recipient's existing active
 * code (label `invite:<email>`), so re-sending an email never issues a second code.
 */
export async function invitationCodeFor(email: string) {
  const label = `invite:${email.trim().toLowerCase()}`;
  const existing = await prisma.invitationCode.findFirst({
    where: { label, isActive: true },
    orderBy: { id: "asc" },
    select: { code: true },
  });
  if (existing) return existing.code;
  const [code] = await createInvitationCodes(1, label, 1);
  return code;
}
