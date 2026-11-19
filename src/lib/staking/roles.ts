// Live role checks on the staking contract. The contract cannot list role holders, so we check
// specific addresses: saved governance addresses, the connected wallet, or one typed in.
import { getAddress, isAddress, type Address, type Hex } from "viem";
import { stakingAbi, stakingConnection } from "./pool-transactions";

export const ROLES = [
  { key: "VAULT_MANAGER_ROLE", label: "Vault manager", does: "Create vaults, show or hide them, close deposits, protocol allocation" },
  { key: "REWARD_MANAGER_ROLE", label: "Reward manager", does: "Fund rewards and reserve vault reward budgets" },
  { key: "PAUSER_ROLE", label: "Pauser", does: "Pause the protocol immediately in an emergency" },
  { key: "UPGRADER_ROLE", label: "Upgrader", does: "Upgrade the contract, through the timelock delay" },
  { key: "DEFAULT_ADMIN_ROLE", label: "Admin", does: "Grant or remove roles and unpause, through the timelock delay" },
] as const;
export type RoleKey = typeof ROLES[number]["key"];
export type SavedAddress = { label: string; address: Address };

/** NEXT_PUBLIC_GOVERNANCE_ADDRESSES="Governance Safe=0x…,Timelock=0x…,Emergency wallet=0x…" (public addresses only). */
export function savedGovernanceAddresses(raw = process.env.NEXT_PUBLIC_GOVERNANCE_ADDRESSES ?? ""): SavedAddress[] {
  return raw.split(",").flatMap(part => {
    const at = part.lastIndexOf("=");
    if (at <= 0) return [];
    const label = part.slice(0, at).trim().slice(0, 40), address = part.slice(at + 1).trim();
    return label && isAddress(address) ? [{ label, address: getAddress(address) }] : [];
  }).slice(0, 12);
}

let roleIds: Promise<Record<RoleKey, Hex>> | null = null;
async function ids(): Promise<Record<RoleKey, Hex>> {
  const c = stakingConnection();
  if (!c) throw new Error("The staking contract is not configured.");
  roleIds ??= Promise.all(ROLES.map(r => c.publicClient.readContract({ address: c.address, abi: stakingAbi, functionName: r.key, args: [] }) as Promise<Hex>))
    .then(values => Object.fromEntries(ROLES.map((r, i) => [r.key, values[i]])) as Record<RoleKey, Hex>)
    .catch(e => { roleIds = null; throw e; });
  return roleIds;
}

/** Which roles each address holds right now. */
export async function rolesHeld(addresses: Address[]): Promise<Map<Address, RoleKey[]>> {
  const c = stakingConnection();
  if (!c) throw new Error("The staking contract is not configured.");
  const roleMap = await ids();
  const unique = [...new Set(addresses.map(a => getAddress(a)))];
  const results = await Promise.all(unique.map(async address => {
    const held = await Promise.all(ROLES.map(r => c.publicClient.readContract({ address: c.address, abi: stakingAbi, functionName: "hasRole", args: [roleMap[r.key], address] }) as Promise<boolean>));
    return [address, ROLES.filter((_, i) => held[i]).map(r => r.key)] as const;
  }));
  return new Map(results);
}

export async function isPaused(): Promise<boolean> {
  const c = stakingConnection();
  if (!c) throw new Error("The staking contract is not configured.");
  return await c.publicClient.readContract({ address: c.address, abi: stakingAbi, functionName: "paused", args: [] }) as boolean;
}

export async function isContract(address: Address): Promise<boolean> {
  const c = stakingConnection();
  if (!c) return false;
  const code = await c.publicClient.getCode({ address });
  return Boolean(code && code !== "0x");
}
