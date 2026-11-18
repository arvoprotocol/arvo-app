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

/** Lock wording shared by vault cards. 365 days reads as 12 months. */
export function lockLabel(days: number): string { return `${days === 365 ? "12-month" : `${days}-day`} lock from your deposit · no early withdrawal`; }
