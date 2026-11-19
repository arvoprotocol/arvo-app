import "server-only";
import { prisma } from "@/lib/prisma";
import { draftPreview, type DraftPreview } from "./vault-draft";
import { serializeDraft, vaultProjects } from "./vault-draft-data";
import { stakingConnection } from "./pool-transactions";
import { compactAmount, vaultSlug, type ShareInfo } from "./vault-share";

export type SharedVault = ShareInfo & {
  slug: string;
  /** Card anchor on the Stake page. */
  anchor: string;
  live: boolean;
  minimum: string;
  size: string;
  product: string;
  projectSlug: string | null;
};

const isZero = (v: string) => !v || /^0+(?:\.0+)?$/.test(v);

function toShared(p: DraftPreview, live: boolean, anchor: string, projectTitle: string | null): SharedVault {
  const pr = p.products;
  const usdgOnly = pr.usdcUsdc && !pr.arvoArvo && !pr.arvoUsdc;
  const pays: "ARVO" | "USDG" = pr.arvoArvo || (!pr.arvoUsdc && !pr.usdcUsdc && (pr.dualArvo || pr.dualMixed)) ? "ARVO" : "USDG";
  const rate = Number(pays === "ARVO" ? p.arvoRate : p.usdcRate) || 0;
  const minimum = pr.arvoArvo ? `${compactAmount(Number(p.minArvo))} ARVO` : pr.arvoUsdc ? `${compactAmount(Number(p.minArvoUsdc))} ARVO` : pr.usdcUsdc ? `${compactAmount(Number(p.minUsdc))} USDG` : `${compactAmount(Number(p.minArvo))} ARVO`;
  const sizeRaw = usdgOnly ? p.maxUsdc : p.maxArvo;
  return {
    title: p.title, slug: vaultSlug(p.title), anchor, live, days: p.days, rate, asset: pays,
    bonusPct: Number(p.bonusPct || 0), kind: p.explainer || "", projectTitle, projectSlug: p.projectSlug || null,
    opensAt: p.opensAt ? Date.parse(p.opensAt) : null,
    minimum, size: isZero(sizeRaw) ? "No limit" : `${compactAmount(Number(sizeRaw))} ${usdgOnly ? "USDG" : "ARVO"}`,
    product: `Deposit ${usdgOnly ? "USDG" : "ARVO"} · earn ${pays}`,
  };
}

/** Planned vaults shown on the Stake page, plus live vaults that have a named draft. Hidden planned vaults are not shareable. */
export async function shareableVaults(): Promise<SharedVault[]> {
  const c = stakingConnection();
  const rows = await prisma.stakingVaultDraft.findMany({
    where: { OR: [{ visibility: "openingSoon", linkedPoolId: null }, ...(c ? [{ linkedChainId: c.chain.id, linkedProxy: c.address.toLowerCase(), linkedPoolId: { not: null } }] : [])] },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }], take: 200,
  });
  const previews = rows.filter(row => { try { return !(row.linkedPoolId !== null && (JSON.parse(row.valuesJson) as { appHidden?: unknown }).appHidden === "1"); } catch { return true; } }).flatMap(row => { try { return [{ row, p: draftPreview(serializeDraft(row)) }]; } catch { return []; } });
  const projects = await vaultProjects(previews.map(x => x.p.projectSlug));
  const seen = new Set<string>();
  return previews.flatMap(({ row, p }) => {
    const live = row.linkedPoolId !== null;
    const shared = toShared(p, live, live ? `vault-pool-${row.linkedPoolId}` : `vault-preview-${row.id}`, p.projectSlug ? projects.get(p.projectSlug)?.title ?? null : null);
    if (seen.has(shared.slug)) return [];
    seen.add(shared.slug);
    return [shared];
  });
}

export async function sharedVault(slug: string): Promise<SharedVault | null> {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  return (await shareableVaults()).find(v => v.slug === slug) ?? null;
}
