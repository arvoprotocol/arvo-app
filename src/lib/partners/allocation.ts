// Strategic Partner allocations, converted from agreed USD amounts into ARVO.
// Pure helpers shared by the admin pages, the partner allocation page and its API.
//
// Agreed basis (Nov 2026):
// - Each partner’s agreed USD amount converts to ARVO at the first DEX candle's opening
//   price after graduation (ALLOCATION.priceUsd). The ARVO figure is calculated once, when the amount is
//   entered in admin, and stored with the price used; later price changes never alter it.
// - Taken from Strategic Partners & Advisors (10% of supply, 100m ARVO), of which 48.5m was
//   still available when the conversion was agreed.
// - Published vesting for that allocation: 3-month lock from TGE, then linear over 12 months.
//   Releases are sent manually as 12 monthly instalments, the first one month after the lock ends.

export const ALLOCATION = {
  // ARVO graduation price: what ARVO opened at when it graduated to a DEX on 25 Sept 2026.
  priceUsd: "0.0014277",
  cliffMonths: 3,
  releaseMonths: 12,
  totalSupply: 1_000_000_000n,
  bucketArvo: 100_000_000n,
  availableArvo: 48_500_000n,
} as const;

/** ARVO TGE: 25 Sept 2026. ARVO_TGE_DATE (YYYY-MM-DD) overrides it, e.g. for testing. */
export const TGE_DATE = "2026-09-25";

export function tgeDate(): Date | null {
  const raw = (process.env.ARVO_TGE_DATE || TGE_DATE).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const date = new Date(`${raw}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

const USD_PATTERN = /^\d{1,9}(\.\d{1,2})?$/;

/** Normalises an admin-entered USD amount ("9,827.18" → "9827.18"); null if invalid or zero. */
export function parseUsd(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const clean = value.replace(/[,£$\s]/g, "");
  if (!USD_PATTERN.test(clean)) return null;
  const [whole, cents = ""] = clean.split(".");
  const normal = `${BigInt(whole)}.${cents.padEnd(2, "0")}`;
  return normal === "0.00" ? null : normal;
}

/** Whole ARVO for a USD amount at a price (default: the agreed conversion price), rounded down. */
export function arvoForUsd(usd: string, price: string = ALLOCATION.priceUsd): bigint {
  const [whole, cents = ""] = usd.split(".");
  const usdCents = BigInt(whole) * 100n + BigInt(cents.padEnd(2, "0").slice(0, 2));
  const [pw, pf = ""] = price.split(".");
  const scale = 10n ** BigInt(pf.length);
  const priceScaled = BigInt(pw) * scale + BigInt(pf || "0"); // price × 10^decimals
  return (usdCents * scale) / (priceScaled * 100n);
}

function addMonthsUtc(date: Date, months: number) {
  const y = date.getUTCFullYear(), m = date.getUTCMonth() + months, d = date.getUTCDate();
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(d, last), 12));
}

export type Tranche = { tranche: number; due: string | null; amountArvo: string };

/** Twelve monthly instalments; the last one carries any rounding remainder. */
export function releaseSchedule(totalArvo: bigint, tge: Date | null): Tranche[] {
  const n = BigInt(ALLOCATION.releaseMonths), each = totalArvo / n;
  return Array.from({ length: ALLOCATION.releaseMonths }, (_, i) => ({
    tranche: i + 1,
    due: tge ? addMonthsUtc(tge, ALLOCATION.cliffMonths + i + 1).toISOString() : null,
    amountArvo: String(i === ALLOCATION.releaseMonths - 1 ? totalArvo - each * (n - 1n) : each),
  }));
}

export function lockEnds(tge: Date | null) {
  return tge ? addMonthsUtc(tge, ALLOCATION.cliffMonths).toISOString() : null;
}

/** Percentage with two decimals, e.g. pct(30_204_505n, 48_500_000n) → "62.28". */
export function pct(part: bigint, whole: bigint) {
  if (whole === 0n) return "0.00";
  const bp = (part * 1_000_000n) / whole; // 4 decimals of percent
  const rounded = (bp + 50n) / 100n;
  return `${rounded / 100n}.${String(rounded % 100n).padStart(2, "0")}`;
}

export const formatArvo = (value: bigint | string) => BigInt(value).toLocaleString("en-GB");
