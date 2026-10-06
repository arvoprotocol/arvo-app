"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleHelp,
  ExternalLink,
  Wallet,
} from "lucide-react";

type WalletType =
  | "metamask"
  | "self_custody"
  | "exchange"
  | "unsure";

type RegistrationStatus =
  | "awaiting"
  | "confirmed"
  | "change_requested"
  | "needs_help";

type Props = {
  token: string;
  name: string;
  originalWallet: string | null;
  registeredWallet: string | null;
  initialWalletType: WalletType | null;
  initialStatus: RegistrationStatus;
};

export function PartnerRegistrationForm({
  token,
  name,
  originalWallet,
  registeredWallet,
  initialWalletType,
  initialStatus,
}: Props) {
  const [walletType, setWalletType] =
    useState<WalletType | "">(initialWalletType ?? "");

  const [mode, setMode] =
    useState<"choose" | "confirm" | "change">("choose");

  const [newWallet, setNewWallet] =
    useState(registeredWallet ?? "");

  const [changeReason, setChangeReason] = useState("");
  const [chainConfirmed, setChainConfirmed] = useState(false);

  const [status, setStatus] =
    useState<RegistrationStatus>(initialStatus);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(payload: Record<string, unknown>) {
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/partner/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        status?: RegistrationStatus;
        error?: string;
      };

      if (!response.ok || !result.ok || !result.status) {
        setError(result.error || "Unable to save your registration.");
        return;
      }

      setStatus(result.status);
    } catch {
      setError("Unable to save your registration. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function routeHelp(type: WalletType) {
    setWalletType(type);

    await submit({
      walletType: type,
    });
  }

  if (status === "confirmed") {
    return (
      <SuccessState
        title="Wallet confirmed."
        copy="Your wallet has been registered for your Arvo Strategic Partner allocation. We'll follow up shortly with access to your partner dashboard, where you'll be able to view your $ARVO allocation, vesting schedule, vested and available tokens, and distribution history. There's nothing else you need to do at this stage."
        wallet={registeredWallet ?? originalWallet}
      />
    );
  }

  if (status === "change_requested") {
    return (
      <SuccessState
        title="Wallet change submitted."
        copy="Your new wallet has been sent to the Arvo team for review. Once approved, we'll confirm the change by email. We'll follow up shortly with access to your partner dashboard, where you'll be able to view your $ARVO allocation, vesting schedule and token distribution details."
        wallet={registeredWallet}
      />
    );
  }

  if (status === "needs_help") {
    return (
      <SuccessState
        title="We'll help you set this up."
        copy="Your registration has been flagged for assistance. The Arvo team will contact you to help confirm a compatible wallet. Once your wallet is registered, we'll follow up with access to your partner dashboard where you'll be able to view your $ARVO allocation, vesting schedule and token distribution details."
      />
    );
  }

  return (
    <div className="border border-black/10 bg-white/75 p-6 md:p-8">
      <div className="flex h-11 w-11 items-center justify-center border border-[#c9846a]/25 bg-[#c9846a]/10 text-[#b9775d]">
        <Wallet size={20} strokeWidth={1.6} />
      </div>

      <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-black/35">
        Wallet registration
      </p>

      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
        Hi {firstName(name)}, confirm your wallet.
      </h2>

      <p className="mt-4 max-w-xl text-sm leading-6 text-black/55">
        $ARVO operates on Robinhood Chain. Please tell us what type of
        wallet you use so we can make sure your allocation is registered
        to an address you can access on the network.
      </p>

      <div className="mt-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-black/35">
          What type of wallet do you use?
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <WalletChoice
            active={walletType === "metamask"}
            title="MetaMask"
            copy="I use MetaMask and control the wallet."
            onClick={() => {
              setWalletType("metamask");
              setMode("choose");
              setError("");
            }}
          />

          <WalletChoice
            active={walletType === "self_custody"}
            title="Another self-custody wallet"
            copy="I control the wallet and its recovery method."
            onClick={() => {
              setWalletType("self_custody");
              setMode("choose");
              setError("");
            }}
          />

          <WalletChoice
            active={walletType === "exchange"}
            title="Exchange account"
            copy="The address was supplied by an exchange."
            onClick={() => routeHelp("exchange")}
          />

          <WalletChoice
            active={walletType === "unsure"}
            title="I'm not sure"
            copy="I'm unsure what type of wallet I have."
            onClick={() => routeHelp("unsure")}
          />
        </div>
      </div>

      {(walletType === "metamask" ||
        walletType === "self_custody") && (
        <div className="mt-8 border-t border-black/10 pt-8">
          {originalWallet ? (
            <>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-black/35">
                Wallet currently on record
              </p>

              <div className="mt-3 break-all border border-black/10 bg-black/[0.025] p-4 font-mono text-xs leading-6 text-black/65">
                {originalWallet}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("confirm");
                    setError("");
                  }}
                  className={`flex items-center justify-between border px-4 py-4 text-left text-sm font-semibold transition ${
                    mode === "confirm"
                      ? "border-[#c9846a] bg-[#c9846a]/7"
                      : "border-black/10 bg-white hover:border-black/20"
                  }`}
                >
                  Confirm this wallet
                  <Check size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("change");
                    setNewWallet("");
                    setError("");
                  }}
                  className={`flex items-center justify-between border px-4 py-4 text-left text-sm font-semibold transition ${
                    mode === "change"
                      ? "border-[#c9846a] bg-[#c9846a]/7"
                      : "border-black/10 bg-white hover:border-black/20"
                  }`}
                >
                  Use a different wallet
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-3 border border-amber-500/20 bg-amber-50/70 p-4">
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0 text-amber-700"
                />

                <p className="text-xs leading-5 text-amber-950/70">
                  We do not currently have a wallet address recorded for
                  you. Enter the self-custody wallet you would like to
                  register.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMode("change");
                  setNewWallet("");
                }}
                className="mt-4 flex w-full items-center justify-between border border-black/10 bg-white px-4 py-4 text-left text-sm font-semibold transition hover:border-black/20"
              >
                Register a wallet
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>
      )}

      {mode === "confirm" &&
        originalWallet &&
        (walletType === "metamask" ||
          walletType === "self_custody") && (
          <div className="mt-6 border border-black/10 bg-black/[0.018] p-5">
            <p className="text-sm font-semibold">
              Robinhood Chain access
            </p>

            <p className="mt-2 text-xs leading-5 text-black/50">
              The same self-custody EVM address can be used across
              compatible EVM networks, but your wallet must be able to
              access Robinhood Chain.
            </p>

            {walletType === "metamask" && (
              <div className="mt-4 border-l-2 border-[#c9846a] pl-4">
                <p className="text-xs font-semibold">
                  Using MetaMask?
                </p>

                <p className="mt-1.5 text-xs leading-5 text-black/48">
                  Make sure Robinhood Chain has been added to MetaMask
                  before confirming. Your 0x wallet address itself does
                  not change.
                </p>
              </div>
            )}

            <label className="mt-5 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={chainConfirmed}
                onChange={(event) =>
                  setChainConfirmed(event.target.checked)
                }
                className="mt-0.5 h-4 w-4"
              />

              <span className="text-xs leading-5 text-black/60">
                I confirm I control this wallet and can use it with
                Robinhood Chain.
              </span>
            </label>

            <button
              type="button"
              disabled={saving || !chainConfirmed}
              onClick={() =>
                submit({
                  walletType,
                  action: "confirm",
                  robinhoodConfirmed: chainConfirmed,
                })
              }
              className="mt-5 flex w-full items-center justify-center gap-2 bg-[#07090b] px-5 py-4 text-xs font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <CheckCircle2 size={15} />
              {saving ? "Confirming..." : "Confirm wallet"}
            </button>
          </div>
        )}

      {mode === "change" &&
        (walletType === "metamask" ||
          walletType === "self_custody") && (
          <div className="mt-6 border border-black/10 bg-black/[0.018] p-5">
            <p className="text-sm font-semibold">
              {originalWallet
                ? "Request a wallet change"
                : "Register your wallet"}
            </p>

            <p className="mt-2 text-xs leading-5 text-black/50">
              Enter the self-custody EVM wallet you want associated with
              your Arvo allocation. The Arvo team will review the address
              before it is approved.
            </p>

            <label className="mt-5 block">
              <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-black/35">
                New wallet address
              </span>

              <input
                value={newWallet}
                onChange={(event) =>
                  setNewWallet(event.target.value)
                }
                placeholder="0x..."
                autoComplete="off"
                spellCheck={false}
                className="mt-2 w-full border border-black/10 bg-white px-4 py-3.5 font-mono text-xs outline-none transition placeholder:text-black/25 focus:border-black/30"
              />
            </label>

            {originalWallet && (
              <label className="mt-4 block">
                <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-black/35">
                  Reason for change
                </span>

                <textarea
                  value={changeReason}
                  onChange={(event) =>
                    setChangeReason(event.target.value)
                  }
                  rows={3}
                  placeholder="Optional"
                  className="mt-2 w-full resize-none border border-black/10 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-black/25 focus:border-black/30"
                />
              </label>
            )}

            <button
              type="button"
              disabled={saving || !newWallet.trim()}
              onClick={() =>
                submit({
                  walletType,
                  action: "change",
                  wallet: newWallet,
                  changeReason,
                })
              }
              className="mt-5 flex w-full items-center justify-center gap-2 bg-[#07090b] px-5 py-4 text-xs font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ArrowRight size={15} />
              {saving
                ? "Submitting..."
                : originalWallet
                  ? "Submit wallet change"
                  : "Submit wallet"}
            </button>
          </div>
        )}

      {error && (
        <div className="mt-5 flex gap-3 border border-red-500/15 bg-red-50 p-4 text-xs leading-5 text-red-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="mt-8 flex items-start gap-3 border-t border-black/10 pt-6">
        <CircleHelp
          size={16}
          className="mt-0.5 shrink-0 text-black/30"
        />

        <p className="text-[11px] leading-5 text-black/40">
          Never share your seed phrase, private key or wallet password.
          Arvo will never ask you for them during registration.
        </p>
      </div>
    </div>
  );
}

function WalletChoice({
  active,
  title,
  copy,
  onClick,
}: {
  active: boolean;
  title: string;
  copy: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border p-4 text-left transition ${
        active
          ? "border-[#c9846a] bg-[#c9846a]/7"
          : "border-black/10 bg-white hover:border-black/20"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold">{title}</p>

        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
            active
              ? "border-[#c9846a] bg-[#c9846a] text-white"
              : "border-black/15"
          }`}
        >
          {active && <Check size={11} />}
        </span>
      </div>

      <p className="mt-2 text-xs leading-5 text-black/45">
        {copy}
      </p>
    </button>
  );
}

function SuccessState({
  title,
  copy,
  wallet,
}: {
  title: string;
  copy: string;
  wallet?: string | null;
}) {
  return (
    <div className="border border-black/10 bg-white/75 p-7 md:p-9">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700">
        <CheckCircle2 size={22} />
      </div>

      <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a9654f]">
        Registration received
      </p>

      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
        {title}
      </h2>

      <p className="mt-4 max-w-xl text-sm leading-6 text-black/55">
        {copy}
      </p>

      {wallet && (
        <div className="mt-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-black/30">
            Wallet
          </p>

          <p className="mt-2 break-all border border-black/10 bg-black/[0.025] p-4 font-mono text-xs leading-6 text-black/60">
            {wallet}
          </p>
        </div>
      )}

      <a
        href="/"
        className="mt-8 inline-flex items-center gap-2 text-xs font-semibold text-black/55 transition hover:text-black"
      >
        Arvo Protocol
        <ExternalLink size={12} />
      </a>
    </div>
  );
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}
