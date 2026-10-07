import "server-only";
import type { StakingVaultDraft } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validateDraft, draftPreview, type VaultDraft, type DraftInput } from "./vault-draft";
import { stakingConnection, stakingAbi } from "./pool-transactions";
import { preparePool } from "./pool-form";

export function serializeDraft(row: StakingVaultDraft): VaultDraft {
  const terms = validateDraft({ title: row.title, poolType: row.poolType, standardKind: row.standardKind,
    values: JSON.parse(row.valuesJson), products: JSON.parse(row.productsJson), visibility: row.visibility, sortOrder: row.sortOrder });
  return { ...terms, id: row.id, revision: row.revision, updatedAt: row.updatedAt.toISOString(),
    linkedChainId: row.linkedChainId, linkedProxy: row.linkedProxy, linkedPoolId: row.linkedPoolId };
}
export function draftRecord(draft: DraftInput) {
  return { title: draft.title, poolType: draft.poolType, standardKind: draft.standardKind,
    valuesJson: JSON.stringify(draft.values), productsJson: JSON.stringify(draft.products), visibility: draft.visibility, sortOrder: draft.sortOrder };
}
export async function publicDraftPreviews() {
  const rows = await prisma.stakingVaultDraft.findMany({ where: { visibility: "openingSoon", linkedPoolId: null }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }], take: 200 });
  return rows.map(row => draftPreview(serializeDraft(row)));
}
export async function verifyDraftPool(draft: VaultDraft, poolId: number) {
  const c = stakingConnection();
  if (!c) throw new Error("Configure the staking deployment before linking a pool.");
  if (await c.publicClient.getChainId() !== c.chain.id) throw new Error("Staking RPC chain mismatch.");
  const code = await c.publicClient.getCode({ address: c.address });
  if (!code || code === "0x") throw new Error("No staking contract found at the configured proxy.");
  const block = await c.publicClient.getBlock();
  const read = (name: string, args: readonly unknown[] = []) => c.publicClient.readContract({ address: c.address, abi: stakingAbi, functionName: name, args, blockNumber: block.number });
  const count = Number(await read("nextVaultId"));
  if (!Number.isSafeInteger(poolId) || poolId < 0 || poolId > 2147483647 || !Number.isSafeInteger(count) || poolId >= count) throw new Error("That on-chain pool does not exist.");
  const [pool, vault, products, cross] = await Promise.all([read("pool", [poolId]), read("vault", [poolId]), read("poolProducts", [poolId]), read("minArvoForUsdc", [poolId])]);
  const prepared = preparePool(draft.poolType, draft.standardKind, { ...draft.values, opens: draft.values.opens || "2099-01-01T00:00" }, draft.products, 0);
  const expected = prepared.args[1] as Record<string, unknown>, actual = vault as Record<string, unknown>, state = pool as Record<string, unknown>;
  for (const key of Object.keys(expected)) {
    if (String(actual[key]) !== String(expected[key])) throw new Error(`On-chain ${key} differs from the saved draft.`);
  }
  if (Number(state.kind) !== Number(prepared.args[0]) || Number(products) !== Number(prepared.args[6]) || String(cross) !== String(prepared.args[7]) || String(state.maxArvoPrincipal) !== String(prepared.args[4]) || String(state.maxUsdcPrincipal) !== String(prepared.args[5])) throw new Error("On-chain pool type, products, minimums or capacity differ from the saved draft.");
  if (draft.values.opens && (String(state.opensAt) !== String(prepared.args[2]) || String(state.closesAt) !== String(prepared.args[3]))) throw new Error("On-chain opening or closing time differs from the saved draft.");
  return { linkedChainId: c.chain.id, linkedProxy: c.address.toLowerCase(), linkedPoolId: poolId };
}

export async function publicPoolTitles(){
 const c=stakingConnection();if(!c)return [];
 const rows=await prisma.stakingVaultDraft.findMany({where:{linkedChainId:c.chain.id,linkedProxy:c.address.toLowerCase(),linkedPoolId:{not:null}},orderBy:[{sortOrder:"asc"},{id:"asc"}],take:200,select:{linkedPoolId:true,title:true,sortOrder:true}});
 const seen=new Set<number>();return rows.flatMap(row=>{if(row.linkedPoolId===null||seen.has(row.linkedPoolId))return [];seen.add(row.linkedPoolId);return [{poolId:row.linkedPoolId,title:row.title,sortOrder:row.sortOrder}];});
}
