// Shared (client and server): readable vault share links and share text.
// A vault named "First Edition" is shared as /vaults/first-edition.

export type ShareInfo = {
  title: string;
  days: number;
  /** Fixed reward for the term, in percent. */
  rate: number;
  asset: "ARVO" | "USDG";
  bonusPct?: number;
  /** "plotSale" | "fullSite" | "" (see pool-form explainerKinds). */
  kind?: string;
  projectTitle?: string | null;
  /** Deposit opening time in milliseconds, if scheduled. */
  opensAt?: number | null;
};

export function vaultSlug(title: string): string {
  const slug = title.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80).replace(/-+$/, "");
  return slug || "vault";
}

export function siteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://arvoprotocol.com";
  try { return new URL(raw).origin; } catch { return "https://arvoprotocol.com"; }
}

export function vaultShareUrl(title: string): string { return `${siteOrigin()}/vaults/${vaultSlug(title)}`; }

export function shareTerm(days: number): string {
  if (days === 365) return "12 months";
  if (days > 0 && days % 365 === 0) return `${days / 365} years`;
  if (days >= 360 && days % 30 === 0) return `${days / 30} months`;
  return `${days} days`;
}

export function sharePercent(n: number): string {
  return `${Number.isInteger(n) ? n : Number(n.toFixed(2))}%`;
}

export function compactAmount(value: number): string {
  if (!Number.isFinite(value)) return "–";
  if (value < 10_000) return new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 }).format(value);
  return new Intl.NumberFormat("en-GB", { notation: "compact", maximumFractionDigits: 1 }).format(value).toLowerCase();
}

export function shareOpening(opensAt: number | null | undefined, now = Date.now()): string | null {
  if (!opensAt || opensAt <= now) return null;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(opensAt);
}

/** One line on where the rewards come from, matching the card's "What am I staking in?". */
export function shareBacking(info: Pick<ShareInfo, "kind" | "projectTitle">): string {
  if (info.kind === "plotSale") return `Rewards funded by a real plot sale${info.projectTitle ? ` at ${info.projectTitle}` : ""}.`;
  if (info.kind === "fullSite") return "Back the purchase of a whole site, subdivided into plots and sold at auction.";
  return "Rewards backed by real land sales.";
}

/** Confident, factual share text built only from the vault's own terms. */
export function vaultShareText(info: ShareInfo, now = Date.now()): string {
  const bonus = info.bonusPct && info.bonusPct > 0 ? `, plus a share of a ${sharePercent(info.bonusPct)} bonus pot` : "";
  const opens = shareOpening(info.opensAt, now);
  return `${info.title} on Arvo: ${sharePercent(info.rate)} fixed ${info.asset} reward over ${shareTerm(info.days)}${bonus}. ${shareBacking(info)}${opens ? ` Opens ${opens}.` : ""} Smart contracts audited by Soken.`;
}
