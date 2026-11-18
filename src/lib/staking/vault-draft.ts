import {StakingInputError} from "./input-error";
import { initialValues, initialProducts, preparePool, poolDateSeconds, standardPools, productLabels, type FormValues, type Products, type PoolType, type StandardKind } from "./pool-form";

export type DraftInput = { title: string; poolType: PoolType; standardKind: StandardKind; values: FormValues; products: Products; visibility: "hidden" | "openingSoon"; sortOrder: number };
export type VaultDraft = DraftInput & { id: number; revision: number; updatedAt: string; linkedChainId: number | null; linkedProxy: string | null; linkedPoolId: number | null };
export type DraftPreview = { sortOrder?: number; id: number; title: string; days: number; arvoRate: string; usdcRate: string; minArvo: string; minArvoUsdc: string; minUsdc: string; products: Products; dualBoost: string; boostCap: string; opensAt: string | null; closesAt: string | null; maxArvo: string; maxUsdc: string; mixedShare?: string; acquisition?: boolean; committedUsdc?: string };

export function validateDraft(raw: unknown): DraftInput {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new StakingInputError("Invalid draft.");
  const x = raw as Record<string, unknown>;
  if (typeof x.title !== "string" || !x.title.trim() || x.title.trim().length > 80) throw new StakingInputError("Enter a vault name up to 80 characters.");
  if (x.poolType !== "standard" && x.poolType !== "custom") throw new StakingInputError("Choose Standard or Custom.");
  if (!standardPools.some(p => p.kind === x.standardKind)) throw new StakingInputError("Choose a standard vault preset.");
  if (x.visibility !== "hidden" && x.visibility !== "openingSoon") throw new StakingInputError("Choose Hidden or Opening soon.");
  if (!Number.isInteger(x.sortOrder) || Math.abs(x.sortOrder as number) > 100000) throw new StakingInputError("Display order must be a whole number between -100000 and 100000.");
  const values = {} as FormValues, products = {} as Products;
  if (!x.values || typeof x.values !== "object" || !x.products || typeof x.products !== "object") throw new StakingInputError("Draft terms are missing.");
  for (const key of Object.keys(initialValues) as (keyof FormValues)[]) {
    const value = (x.values as Record<string, unknown>)[key] ?? (key === "mixedShare" ? "50" : key === "committedUsdc" ? "0" : undefined);
    if (typeof value !== "string" || value.length > 96) throw new StakingInputError(`Invalid ${key}.`);
    values[key] = value.trim();
  }
  for (const key of Object.keys(initialProducts) as (keyof Products)[]) {
    const value = (x.products as Record<string, unknown>)[key] ?? (key === "dualMixed" ? false : undefined);
    if (typeof value !== "boolean") throw new StakingInputError(`Invalid ${productLabels[key]} selection.`);
    products[key] = value;
  }
  // Drafts may have no opening date. Economic validation stays shared with on-chain creation.
  if (values.closes && !values.opens) throw new StakingInputError("Set an opening date before a closing date.");
  for (const key of ["opens", "closes"] as const) {
    if (values[key] && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(values[key]) || !Number.isFinite(poolDateSeconds(values[key])))) throw new StakingInputError("Enter valid opening and closing dates.");
  }
  preparePool(x.poolType, x.standardKind as StandardKind, { ...values, opens: values.opens || "2099-01-01T00:00", closes: values.closes }, products, 0);
  return { title: x.title.trim(), poolType: x.poolType, standardKind: x.standardKind as StandardKind, values, products, visibility: x.visibility, sortOrder: x.sortOrder as number };
}

export function draftPreview(draft: DraftInput & { id: number }): DraftPreview {
  const preset = standardPools.find(p => p.kind === draft.standardKind)!;
  const custom = draft.poolType === "custom", v = draft.values;
  return { id: draft.id, sortOrder: draft.sortOrder, title: draft.title, days: custom ? Number(v.duration) : preset.days,
    arvoRate: custom ? v.arvoRate : preset.arvo, usdcRate: custom ? v.usdcRate : preset.usdc,
    minArvo: v.minArvo, minArvoUsdc: v.minArvoUsdc, minUsdc: v.minUsdc,
    opensAt: v.opens ? new Date(poolDateSeconds(v.opens) * 1000).toISOString() : null, closesAt: v.closes ? new Date(poolDateSeconds(v.closes) * 1000).toISOString() : null, maxArvo: v.maxArvo, maxUsdc: v.maxUsdc,
    products: draft.products, dualBoost: custom ? v.dualBoost : "10", boostCap: custom ? v.boostCap : "15", mixedShare: v.mixedShare, committedUsdc: v.committedUsdc || "0" };
}

export function standardDrafts(values: FormValues = initialValues): (DraftInput & { seedKey: string })[] {
  if (!values.minArvo || !values.minArvoUsdc) throw new StakingInputError("Create standard presets using Create vault draft, then set the approved entry minimums. Existing drafts have been preserved.");
  return standardPools.map((preset, index) => ({ title: preset.name, poolType: "standard", standardKind: preset.kind,
    values: { ...values }, products: { ...initialProducts, arvoUsdc: true }, visibility: "openingSoon", sortOrder: index,
    seedKey: `standard-${preset.kind.toLowerCase()}` }));
}
