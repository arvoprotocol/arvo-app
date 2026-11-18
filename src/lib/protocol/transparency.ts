import "server-only";
import { createPublicClient, http, isAddress, keccak256, toHex, zeroAddress, type Address } from "viem";
import stakingArtifact from "@/lib/staking/ArvoStaking.abi.json";
import { bonusAddresses } from "@/lib/staking/bonus-config";

const stakingAbi = ((stakingArtifact as { abi?: unknown }).abi ?? stakingArtifact) as readonly unknown[];
const erc20 = [{ type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "a", type: "address" }], outputs: [{ type: "uint256" }] }] as const;
const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

const EXPLORERS: Record<number, { name: string; url: string; network: string }> = {
  4663: { name: "Blockscout", url: "https://robinhoodchain.blockscout.com", network: "Robinhood Chain" },
  46630: { name: "Robinhood testnet explorer", url: "https://explorer.testnet.chain.robinhood.com", network: "Robinhood Chain Testnet" },
};

function envAddress(name: string): Address | null {
  const value = process.env[name]?.trim();
  return value && isAddress(value) && value.toLowerCase() !== zeroAddress ? value as Address : null;
}

export type AddressRow = { label: string; address: Address; note?: string };
export type RoleRow = { role: string; holder: string; address: Address; verified: boolean | null; powers: string };
export type Transparency = {
  network: string; chainId: number; explorer: { name: string; url: string } | null; readAt: string;
  addresses: AddressRow[]; roles: RoleRow[];
  live: null | {
    paused: boolean; arvoSolvent: boolean; usdcSolvent: boolean;
    arvoStaked: bigint; arvoRewardsOwed: bigint; arvoRewardsReserved: bigint; arvoRewardCapacity: bigint; arvoHeld: bigint;
    usdcStaked: bigint; usdcRewardsOwed: bigint; usdcRewardsReserved: bigint; usdcHeld: bigint;
    positions: number; vaults: number;
  };
  error?: string;
};

let cache: { at: number; value: Transparency } | null = null;

/** Live, verifiable protocol data read from chain. Cached for 60 seconds. */
export async function readTransparency(): Promise<Transparency> {
  if (cache && Date.now() - cache.at < 60_000) return cache.value;
  const chainId = Number(process.env.NEXT_PUBLIC_STAKING_CHAIN_ID || 0);
  const rpc = process.env.NEXT_PUBLIC_STAKING_RPC_URL;
  const proxy = envAddress("NEXT_PUBLIC_STAKING_PROXY_ADDRESS");
  const ex = EXPLORERS[chainId] ?? null;
  const base: Transparency = {
    network: ex?.network ?? (chainId ? `Chain ${chainId}` : "Not configured"), chainId,
    explorer: ex ? { name: ex.name, url: ex.url } : null, readAt: new Date().toISOString(), addresses: [], roles: [], live: null,
  };
  const timelock = envAddress("NEXT_PUBLIC_TIMELOCK_ADDRESS");
  const safe = envAddress("NEXT_PUBLIC_GOVERNANCE_SAFE_ADDRESS");
  const pauser = envAddress("NEXT_PUBLIC_PAUSER_ADDRESS");
  const treasury = envAddress("NEXT_PUBLIC_TREASURY_SAFE_ADDRESS");
  const rewardsWallet = envAddress("NEXT_PUBLIC_REWARDS_WALLET_ADDRESS");
  if (!proxy || !rpc) return { ...base, error: "Contract addresses will be published here at deployment." };

  try {
    const client = createPublicClient({ transport: http(rpc, { timeout: 10_000 }) });
    const read = (functionName: string, args: readonly unknown[] = []) =>
      client.readContract({ address: proxy, abi: stakingAbi as never, functionName: functionName as never, args: args as never }) as Promise<unknown>;
    const [arvo, usdc, slot, oracle, escrow] = await Promise.all([
      read("arvo"), read("usdc"), client.getStorageAt({ address: proxy, slot: IMPLEMENTATION_SLOT }), read("priceOracle").catch(() => zeroAddress), read("acquisitionEscrow").catch(() => zeroAddress),
    ]);
    const implementation = slot ? `0x${slot.slice(-40)}` as Address : null;
    const [paused, arvoSolvent, usdcSolvent, arvoStaked, arvoRewardsOwed, arvoRewardsReserved, arvoRewardCapacity, usdcStaked, usdcRewardsOwed, usdcRewardsReserved, nextPosition, nextVault, arvoHeld, usdcHeld] = await Promise.all([
      read("paused"), read("isArvoSolvent"), read("isUsdcSolvent"), read("arvoPrincipalLiability"), read("arvoRewardLiability"),
      read("arvoRewardBudgetReserved"), read("availableArvoRewardCapacity"), read("usdcPrincipalLiability"), read("usdcRewardLiability"),
      read("usdcRewardBudgetReserved"), read("nextPositionId"), read("nextVaultId"),
      client.readContract({ address: arvo as Address, abi: erc20, functionName: "balanceOf", args: [proxy] }),
      client.readContract({ address: usdc as Address, abi: erc20, functionName: "balanceOf", args: [proxy] }),
    ]);

    const addresses: AddressRow[] = [
      { label: "ARVO token", address: arvo as Address },
      { label: "Stablecoin (USDG)", address: usdc as Address, note: "Used by USDG reward vaults" },
      { label: "Staking contract (proxy)", address: proxy, note: "The address users deposit to" },
      ...(implementation && implementation !== zeroAddress ? [{ label: "Staking implementation", address: implementation, note: "Read live from the proxy's EIP-1967 slot" }] : []),
      ...bonusAddresses().map((address, i) => ({ label: `Shared bonus contract${bonusAddresses().length > 1 ? ` ${i + 1}` : ""}`, address, note: "Separate contract; not covered by the Soken audit" })),
      ...(timelock ? [{ label: "Timelock", address: timelock, note: "Delays upgrades and admin changes" }] : []),
      ...(safe ? [{ label: "Governance Safe (2-of-2)", address: safe }] : []),
      ...(treasury ? [{ label: "Treasury Safe", address: treasury }] : []),
      ...(rewardsWallet ? [{ label: "Staking rewards wallet", address: rewardsWallet }] : []),
      ...(oracle !== zeroAddress ? [{ label: "Price oracle", address: oracle as Address }] : []),
      ...(escrow !== zeroAddress ? [{ label: "Acquisition escrow", address: escrow as Address }] : []),
    ];

    const role = (name: string) => keccak256(toHex(name));
    const ADMIN = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const checks: { role: string; hash: `0x${string}`; holder: string; address: Address | null; powers: string }[] = [
      { role: "Default admin", hash: ADMIN, holder: "Timelock", address: timelock, powers: "Grant and revoke roles; unpause" },
      { role: "Upgrader", hash: role("UPGRADER_ROLE"), holder: "Timelock", address: timelock, powers: "Upgrade the staking implementation, after the timelock delay" },
      { role: "Vault manager", hash: role("VAULT_MANAGER_ROLE"), holder: "Governance Safe", address: safe, powers: "Create, open and close vaults" },
      { role: "Reward manager", hash: role("REWARD_MANAGER_ROLE"), holder: "Governance Safe", address: safe, powers: "Fund and reserve reward budgets" },
      { role: "Pauser", hash: role("PAUSER_ROLE"), holder: "Emergency key", address: pauser, powers: "Pause immediately in an emergency" },
    ];
    const roles: RoleRow[] = [];
    for (const c of checks) {
      if (!c.address) continue;
      const verified = await (read("hasRole", [c.hash, c.address]) as Promise<boolean>).catch(() => null);
      roles.push({ role: c.role, holder: c.holder, address: c.address, verified, powers: c.powers });
    }

    const value: Transparency = {
      ...base, addresses, roles,
      live: {
        paused: paused as boolean, arvoSolvent: arvoSolvent as boolean, usdcSolvent: usdcSolvent as boolean,
        arvoStaked: arvoStaked as bigint, arvoRewardsOwed: arvoRewardsOwed as bigint, arvoRewardsReserved: arvoRewardsReserved as bigint,
        arvoRewardCapacity: arvoRewardCapacity as bigint, arvoHeld: arvoHeld as bigint,
        usdcStaked: usdcStaked as bigint, usdcRewardsOwed: usdcRewardsOwed as bigint, usdcRewardsReserved: usdcRewardsReserved as bigint, usdcHeld: usdcHeld as bigint,
        positions: Math.max(0, Number(nextPosition) - 1), vaults: Number(nextVault),
      },
    };
    cache = { at: Date.now(), value };
    return value;
  } catch (error) {
    console.error("Transparency read failed", error);
    return { ...base, error: "Live figures are temporarily unavailable. Contract addresses can be checked on the explorer." };
  }
}
