import { formatUnits } from "viem";

export function formatAmount(raw: string): string {
  if (!/^\d+(?:\.\d*)?$/.test(raw)) return raw;
  const [whole, fraction] = raw.split(".");
  return whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (fraction === undefined ? "" : `.${fraction}`);
}
export function ungroupAmount(raw: string): string {
  if (!raw.includes(",")) return raw;
  // Reject malformed grouping instead of silently changing the intended amount.
  if (!/^\d{1,3}(?:,\d{3})+(?:\.\d*)?$/.test(raw)) return raw;
  return raw.replaceAll(",", "");
}
export function tokenDisplay(amount: bigint, decimals: number) { return formatAmount(formatUnits(amount, decimals)); }
/** Rounded down to `places` decimals for summaries such as vault capacity, e.g. "3,004,854.89". */
export function tokenDisplayShort(amount: bigint, decimals: number, places = 2): string {
  if (amount < 0n) return "-" + tokenDisplayShort(-amount, decimals, places);
  const scale = 10n ** BigInt(places);
  const scaled = decimals >= places ? amount / 10n ** BigInt(decimals - places) : amount * 10n ** BigInt(places - decimals);
  const whole = formatAmount((scaled / scale).toString());
  const fraction = (scaled % scale).toString().padStart(places, "0");
  return places === 0 || /^0+$/.test(fraction) ? whole : `${whole}.${fraction}`;
}
export function cycleReward(amount: bigint, rateBps: number, boostBps = 0): bigint {
  if (amount < 0n || !Number.isInteger(rateBps) || rateBps < 0 || rateBps > 10000 || !Number.isInteger(boostBps) || boostBps < 0 || boostBps > 5000) throw new Error("Invalid reward terms.");
  return amount * BigInt(rateBps) * BigInt(10000 + boostBps) / 100000000n;
}
export function windowPhase(opensAt: string | null, closesAt: string | null, now: number): "unscheduled" | "upcoming" | "window" | "closed" {
  if (!opensAt) return "unscheduled";
  if (closesAt && now >= Date.parse(closesAt)) return "closed";
  return now < Date.parse(opensAt) ? "upcoming" : "window";
}
export function countdown(target: string, now: number) {
  const seconds = Math.max(0, Math.ceil((Date.parse(target) - now) / 1000));
  const days = Math.floor(seconds / 86400), hours = Math.floor(seconds % 86400 / 3600), minutes = Math.floor(seconds % 3600 / 60), remainder = seconds % 60;
  return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(remainder).padStart(2, "0")}s`;
}
export function dateDisplay(raw: string) { return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" }).format(new Date(raw)) + " UTC"; }

/** "12 months" for 365 days, otherwise "60 days". */
export function termLabel(days: number): string { return days === 365 ? "12 months" : days === 730 ? "24 months" : `${days} days`; }
/** Lock wording shared by vault cards. */
export function lockLabel(days: number): string { return `Locked for ${termLabel(days)} from your deposit`; }
/** "Tue 24 Nov, 12:00 UTC" */
export function shortDate(raw: string) { return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(raw)).replace(/,? (\d{2}:\d{2})$/, ", $1") + " UTC"; }
/** Plain-English vault status for people, from the internal availability reason. */
export function availabilityLabel(reason: string, beforeOpening: boolean): string {
  if (reason === "Vault full") return "Vault full";
  if (reason === "Reward allocation unavailable") return beforeOpening ? "Rewards being funded" : "Rewards fully allocated";
  if (reason === "Product unavailable") return "Not available";
  return reason;
}
