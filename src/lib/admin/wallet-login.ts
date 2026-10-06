import { stringToHex } from "viem";

export type LoginProvider = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
};

export function waitForLogin<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const abort = () => reject(new Error("Wallet sign-in cancelled or timed out. Please try again."));
    promise.then(resolve, reject).finally(() => signal.removeEventListener("abort", abort));
    if (signal.aborted) { abort(); return; }
    signal.addEventListener("abort", abort, { once: true });
  });
}

export async function authenticateAdminWallet(
  provider: LoginProvider,
  address: string,
  signal: AbortSignal,
  onSigning: () => void,
) {
  const response = await fetch("/api/admin/auth/challenge", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }), signal,
  });
  const challenge = await response.json() as { address?: string; message?: string; error?: string };
  if (!response.ok || !challenge.address || !challenge.message) {
    throw new Error(challenge.error ?? "Unable to create login challenge.");
  }
  if (challenge.address.toLowerCase() !== address.toLowerCase()) {
    throw new Error("The login challenge returned a different wallet address.");
  }
  const accounts = await waitForLogin(provider.request({ method: "eth_accounts" }), signal) as string[];
  if (accounts?.[0]?.toLowerCase() !== address.toLowerCase()) {
    throw new Error("Wallet account changed. Please sign in again.");
  }
  onSigning();
  const signature = await waitForLogin(provider.request({
    method: "personal_sign", params: [stringToHex(challenge.message), challenge.address],
  }), signal);
  if (typeof signature !== "string" || !/^0x[0-9a-f]+$/i.test(signature)) {
    throw new Error("The wallet did not return a valid signature.");
  }
  if (signal.aborted) throw new Error("Wallet sign-in cancelled.");
  const verified = await fetch("/api/admin/auth/verify", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: challenge.address, message: challenge.message, signature }), signal,
  });
  const result = await verified.json() as { authenticated?: boolean; error?: string };
  if (!verified.ok || !result.authenticated) {
    throw new Error(result.error ?? "Admin authentication failed.");
  }
}
