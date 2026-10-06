import {getWalletProvider} from "@/lib/wallet/client";
import { createPublicClient, createWalletClient, custom, defineChain, encodeFunctionData, decodeEventLog, http, isAddress, zeroAddress, type Abi, type Address, type EIP1193Provider, type Hash } from "viem";
import stakingArtifact from "./ArvoStaking.abi.json";
import type { PreparedPool } from "./pool-form";
export const stakingAbi = stakingArtifact as Abi;
export function stakingConnection() {
  const id = Number(process.env.NEXT_PUBLIC_STAKING_CHAIN_ID);
  const rpc = process.env.NEXT_PUBLIC_STAKING_RPC_URL;
  const address = process.env.NEXT_PUBLIC_STAKING_PROXY_ADDRESS;
  if (!Number.isSafeInteger(id) || id <= 0 || !rpc || !address || !isAddress(address) || address.toLowerCase() === zeroAddress) return null;
  let url: URL;
  try { url = new URL(rpc); } catch { return null; }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const chain = defineChain({ id, name: id === 4663 ? "Robinhood Mainnet" : id === 46630 ? "Robinhood Testnet" : `Arvo staking · chain ${id}`, nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }, rpcUrls: { default: { http: [rpc] } } });
  return { address: address as Address, chain, publicClient: createPublicClient({ chain, transport: http(rpc) }) };
}
export function poolCalldata(pool: PreparedPool) {
  return encodeFunctionData({ abi: stakingAbi, functionName: pool.functionName, args: pool.args });
}
export async function submitPool(pool: PreparedPool, onHash: (hash: Hash) => void) {
  const connection = stakingConnection();
  if (!connection) throw new Error("Testnet chain, RPC and staking proxy are not configured yet.");
  const provider = getWalletProvider();
  if (!provider) throw new Error("Open this page with your admin wallet available.");
  const { publicClient, chain, address } = connection;
  const rpcChain = await publicClient.getChainId();
  if (rpcChain !== chain.id) throw new Error("Configured RPC does not match the staking chain ID.");
  const code = await publicClient.getCode({ address });
  if (!code || code === "0x") throw new Error("No staking contract was found at the configured proxy address.");
  const accounts = await provider.request({ method: "eth_requestAccounts" }) as string[];
  if (!accounts[0] || !isAddress(accounts[0])) throw new Error("No wallet account was selected.");
  const account = accounts[0] as Address;
  const walletChain = await provider.request({ method: "eth_chainId" }) as string;
  if (Number(BigInt(walletChain)) !== chain.id) throw new Error(`Switch your wallet to chain ${chain.id}, then retry.`);
  const role = await publicClient.readContract({ address, abi: stakingAbi, functionName: "VAULT_MANAGER_ROLE" });
  const authorised = await publicClient.readContract({ address, abi: stakingAbi, functionName: "hasRole", args: [role, account] });
  if (authorised !== true) throw new Error("This wallet does not hold the contract's vault manager role. Admin website access alone does not grant pool creation permission.");
  if (Number(pool.args[0]) !== 4) {
    const standard = await publicClient.readContract({ address, abi: stakingAbi, functionName: "standardVaultConfig", args: [pool.args[0]] }) as { duration: number; arvoRewardBps: number; usdcRewardBps: number; dualBoostBps: number; combinedBoostCapBps: number; minArvo: bigint; minUsdc: bigint };
    const summary = Object.fromEntries(pool.summary);
    if (standard.duration !== Number(summary.Duration.split(" ")[0]) * 86400 || standard.arvoRewardBps !== Number(summary["ARVO cycle reward"].replace("%", "")) * 100 || standard.usdcRewardBps !== Number(summary["USDC cycle reward"].replace("%", "")) * 100 || standard.dualBoostBps !== 1000 || standard.combinedBoostCapBps !== 1500 || standard.minArvo !== BigInt("100000") * BigInt("10") ** BigInt("18") || standard.minUsdc !== BigInt("1000") * BigInt("10") ** BigInt("6")) throw new Error("On-chain standard pool terms differ from the reviewed terms. Update the deployment configuration before creating this pool.");
  }
  const { request } = await publicClient.simulateContract({ address, abi: stakingAbi, functionName: pool.functionName, args: pool.args, account });
  const latestAccounts = await provider.request({ method: "eth_accounts" }) as string[];
  const latestChain = await provider.request({ method: "eth_chainId" }) as string;
  if (getWalletProvider() !== provider || latestAccounts[0]?.toLowerCase() !== account.toLowerCase() || Number(BigInt(latestChain)) !== chain.id) throw new Error("Wallet account or network changed. Review and retry.");
  const walletClient = createWalletClient({ account, chain, transport: custom(provider as EIP1193Provider) });
  const hash = await walletClient.writeContract(request);
  onHash(hash);
  return confirmPoolTransaction(hash);
}
export async function confirmPoolTransaction(hash: Hash) {
  const connection = stakingConnection();
  if (!connection) throw new Error("Staking connection is not configured.");
  const { publicClient, address } = connection;
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") throw new Error("Pool creation transaction reverted. No pool was created.");
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== address.toLowerCase()) continue;
    try {
      const decoded = decodeEventLog({ abi: stakingAbi, data: log.data, topics: log.topics, eventName: "PoolCreated" });
      const args = decoded.args as unknown as { poolId: number | bigint };
      return { hash, poolId: String(args.poolId) };
    } catch { /* Other events emitted by this transaction. */ }
  }
  return { hash, poolId: null };
}
