"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Wallet, Smartphone } from "lucide-react";
import { authenticateAdminWallet, waitForLogin, type LoginProvider } from "@/lib/admin/wallet-login";

declare global {
  interface Window {
    ethereum?: LoginProvider;
  }
}

type PhoneProvider = LoginProvider & {
  disconnect(): Promise<void>;
  connect(): Promise<void>;
  on(event: "display_uri", listener: (uri: string) => void): unknown;
  removeListener(event: "display_uri", listener: (uri: string) => void): unknown;
  session?: unknown;
};

export function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrImage, setQrImage] = useState("");
  const [status, setStatus] = useState("");
  const active = useRef<AbortController | null>(null);
  const phoneProvider = useRef<PhoneProvider | null>(null);
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() ?? "";

  function cancel() {
    active.current?.abort();
    active.current = null;
    const provider = phoneProvider.current;
    phoneProvider.current = null;
    if (provider?.session) void provider.disconnect().catch(() => {});
    setLoading(false);
    setQrImage("");
    setStatus("");
  }

  useEffect(() => () => {
    active.current?.abort();
    const provider = phoneProvider.current;
    if (provider?.session) void provider.disconnect().catch(() => {});
  }, []);

  async function signIn(method: "phone" | "browser") {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    const current = () => active.current === controller && !controller.signal.aborted;
    const timeout = window.setTimeout(() => controller.abort(), 180_000);
    let phone: PhoneProvider | undefined;
    let uriListener: ((uri: string) => void) | undefined;
    setLoading(true);
    setError("");
    setQrImage("");
    setStatus(method === "phone" ? "Preparing phone connection..." : "Choose your browser wallet account...");
    try {
      let provider: LoginProvider;
      if (method === "phone") {
        if (!/^[a-f0-9]{32}$/i.test(projectId)) {
          throw new Error("Phone connection is not configured yet. Please use a browser wallet or contact the administrator.");
        }
        const [{ EthereumProvider }, qr] = await waitForLogin(Promise.all([
          import("@walletconnect/ethereum-provider"), import("qrcode"),
        ]), controller.signal);
        // Signing in is independent of the staking deployment. No transaction methods are requested.
        const pendingProvider = EthereumProvider.init({
          projectId,
          optionalChains: [1],
          optionalMethods: ["personal_sign"],
          optionalEvents: ["accountsChanged", "chainChanged"],
          showQrModal: false,
          customStoragePrefix: "arvo-admin-login",
          metadata: {
            name: "Arvo admin", description: "Sign a one-time message to access the Arvo admin console.",
            url: window.location.origin, icons: [new URL("/icon.png", window.location.origin).href],
          },
        });
        // Clean up even if initialization completes after cancellation.
        void pendingProvider.then(p => {
          if (!current() && p.session) void p.disconnect().catch(() => {});
        }, () => {});
        phone = await waitForLogin(pendingProvider, controller.signal) as PhoneProvider;
        phoneProvider.current = phone;
        if (phone.session) await waitForLogin(phone.disconnect(), controller.signal);
        uriListener = (uri: string) => {
          if (!current()) return;
          setStatus("Scan with MetaMask on your phone, then approve the connection.");
          void qr.toDataURL(uri, { width: 280, margin: 3, errorCorrectionLevel: "M" }).then(
            image => { if (current()) setQrImage(image); },
            () => { if (current()) { setError("Unable to generate the connection QR code."); controller.abort(); } },
          );
        };
        phone.on("display_uri", uriListener);
        const connection = phone.connect();
        const connectingPhone = phone;
        void connection.then(() => {
          if (!current() && connectingPhone.session) void connectingPhone.disconnect().catch(() => {});
        }, () => {});
        await waitForLogin(connection, controller.signal);
        provider = phone;
      } else {
        // Read the injected wallet without redeclaring the shared Window.ethereum type.
        const injected = (window as unknown as { ethereum?: LoginProvider }).ethereum;
        if (!injected) throw new Error("No browser wallet detected. Use Connect with phone instead.");
        provider = injected;
        await waitForLogin(provider.request({ method: "eth_requestAccounts" }), controller.signal);
      }
      const accounts = await waitForLogin(provider.request({ method: "eth_accounts" }), controller.signal) as string[];
      const address = accounts?.[0];
      if (!address || !/^0x[0-9a-f]{40}$/i.test(address)) throw new Error("No valid wallet account was selected.");
      setQrImage("");
      await authenticateAdminWallet(provider, address, controller.signal, () => {
        if (current()) setStatus(method === "phone" ? "Approve the login message on your phone..." : "Approve the login message in your wallet...");
      });
      if (current()) window.location.reload();
    } catch (err) {
      if (active.current === controller) {
        const code = typeof err === "object" && err !== null && "code" in err ? (err as { code?: number }).code : undefined;
        setError(controller.signal.aborted ? "Wallet sign-in cancelled or timed out. Please try again." :
          code === 4001 || code === 5000 ? "Wallet request cancelled." :
          err instanceof Error ? err.message : "Unable to authenticate the admin wallet.");
      }
    } finally {
      window.clearTimeout(timeout);
      if (phone && uriListener) phone.removeListener("display_uri", uriListener);
      if (phone?.session) void phone.disconnect().catch(() => {});
      if (phoneProvider.current === phone) phoneProvider.current = null;
      if (active.current === controller) {
        active.current = null;
        setLoading(false);
        setQrImage("");
        setStatus("");
      }
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07090b] px-5 py-12 text-white">
      <div className="w-full max-w-md">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-7 shadow-2xl md:p-9">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#c9846a]/25 bg-[#c9846a]/10 text-[#e2a98e]">
            <ShieldCheck size={21} />
          </div>

          <p className="mt-7 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c9846a]">
            Arvo Protocol
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
            Admin console.
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/45">
            Connect and sign with an authorised wallet to access
            protocol operations and project management.
          </p>

          <div className="mt-7 rounded-2xl border border-white/[0.07] bg-black/20 p-4">
            <div className="flex gap-3">
              <Wallet
                size={16}
                className="mt-0.5 shrink-0 text-white/55"
              />

              <div>
                <p className="text-xs font-semibold">
                  Wallet verification
                </p>

                <p className="mt-1 text-[11px] leading-5 text-white/55">
                  You will be asked to sign a one-time message. This
                  does not submit a blockchain transaction and does
                  not cost gas.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-400/15 bg-red-400/[0.07] px-4 py-3 text-xs leading-5 text-red-200">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={() => void signIn("phone")}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-xs font-semibold text-[#07090b] transition hover:bg-white/90 disabled:cursor-wait disabled:opacity-60"
          >
            <Smartphone size={15} />
            {loading ? "Connecting..." : "Connect with phone"}
          </button>

          {loading && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-center" aria-live="polite">
              {qrImage && <img src={qrImage} width={280} height={280} alt="Scan this WalletConnect QR code using MetaMask on your phone" className="mx-auto mb-3 max-w-full rounded-xl" />}
              <p className="text-xs leading-5 text-white/65">{status}</p>
              <button type="button" onClick={cancel} className="mt-3 rounded-lg border border-white/15 px-4 py-2 text-xs text-white/70">Cancel connection</button>
            </div>
          )}

          <button type="button" onClick={() => void signIn("browser")} disabled={loading}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-xs font-semibold text-white/75 transition hover:bg-white/5 disabled:opacity-50">
            <Wallet size={15} /> Use browser wallet
          </button>
          <p className="mt-3 text-center text-[11px] leading-5 text-white/55">Keep your wallet on your phone. No recovery phrase is needed on this computer.</p>

          <p className="mt-5 text-center text-[10px] leading-4 text-white/50">
            Access is restricted to authorised Arvo administrators.
          </p>
        </div>
      </div>
    </main>
  );
}
