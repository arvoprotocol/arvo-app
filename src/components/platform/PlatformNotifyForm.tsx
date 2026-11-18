"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  KeyRound,
  Mail,
  Send,
} from "lucide-react";

type SignupType = "email" | "telegram";
type FormMode = "request" | "invitation";

export function PlatformNotifyForm() {
  const [mode, setMode] = useState<FormMode>("request");
  const [type, setType] = useState<SignupType>("email");
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function changeType(nextType: SignupType) {
    setType(nextType);
    setContact("");
    setError("");
    setSuccess(false);
  }

  function changeMode(nextMode: FormMode) {
    setMode(nextMode);
    setContact("");
    setCode("");
    setError("");
    setSuccess(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const endpoint =
        mode === "invitation"
          ? "/api/platform/invitation"
          : "/api/platform/signup";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          contact,
          website,
          ...(mode === "invitation" ? { code } : {}),
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        existing?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ||
            (mode === "invitation"
              ? "Unable to confirm your invitation."
              : "Unable to save your details.")
        );
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save your details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-[#c9846a]/20 bg-white/[0.045] px-6 py-7 text-left backdrop-blur">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#c9846a]/15 text-[#e2a98e]">
            <Check size={17} strokeWidth={2} />
          </div>

          <div>
            <p className="text-base font-semibold text-white">
              {mode === "invitation"
                ? "Access confirmed."
                : "You’re on the waitlist."}
            </p>

            <p className="mt-2 text-sm leading-6 text-white/40">
              {mode === "invitation"
                ? "Your invitation has been registered. You'll receive access to the Arvo app ahead of the public release."
                : "We’ll keep you updated as access to the Arvo app begins to open."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto mt-10 max-w-2xl text-left"
    >
      {mode === "invitation" && (
        <div className="mb-6 text-center">
          <button
            type="button"
            onClick={() => changeMode("request")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/45 transition hover:text-white"
          >
            <ArrowLeft size={13} />
            Join the waitlist instead
          </button>

          <div className="mx-auto mt-5 flex h-10 w-10 items-center justify-center rounded-full border border-[#c9846a]/20 bg-[#c9846a]/10 text-[#e2a98e]">
            <KeyRound size={16} />
          </div>

          <p className="mt-4 text-base font-semibold text-white">
            Enter your invitation code
          </p>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
            Confirm your invitation to receive access to the Arvo app ahead of
            the public release.
          </p>
        </div>
      )}

      <div className="flex justify-center">
        <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.04] p-1">
          <button
            type="button"
            onClick={() => changeType("email")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition ${
              type === "email"
                ? "bg-white text-[#07090b]"
                : "text-white/40 hover:text-white"
            }`}
          >
            <Mail size={13} />
            Email
          </button>

          <button
            type="button"
            onClick={() => changeType("telegram")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition ${
              type === "telegram"
                ? "bg-white text-[#07090b]"
                : "text-white/40 hover:text-white"
            }`}
          >
            <Send size={13} />
            Telegram
          </button>
        </div>
      </div>

      {mode === "invitation" && (
        <div className="mt-5 overflow-hidden rounded-xl border border-white/12 bg-white/[0.055] transition focus-within:border-[#c9846a]/45">
          <input
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Invitation code"
            autoComplete="off"
            required
            className="w-full bg-transparent px-5 py-4 text-sm uppercase text-white outline-none placeholder:normal-case placeholder:text-white/25"
          />
        </div>
      )}

      <div className="mt-5 flex overflow-hidden rounded-xl border border-white/12 bg-white/[0.055] transition focus-within:border-[#c9846a]/45">
        <input
          type={type === "email" ? "email" : "text"}
          value={contact}
          onChange={(event) => setContact(event.target.value)}
          placeholder={type === "email" ? "Email address" : "@username"}
          autoComplete={type === "email" ? "email" : "off"}
          required
          className="min-w-0 flex-1 bg-transparent px-5 py-4 text-sm text-white outline-none placeholder:text-white/25"
        />

        <button
          type="submit"
          disabled={loading}
          className="m-1.5 inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#07090b] transition hover:bg-[#f0d2b0] disabled:cursor-wait disabled:opacity-60 sm:px-5"
        >
          {loading
            ? mode === "invitation"
              ? "Confirming..."
              : "Saving..."
            : mode === "invitation"
              ? "Confirm invitation"
              : "Join the waitlist"}

          {!loading && <ArrowRight size={13} />}
        </button>
      </div>

      <div
        aria-hidden="true"
        className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
      >
        <label>
          Website
          <input
            type="text"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      {error && (
        <p className="mt-3 text-center text-xs text-red-300">
          {error}
        </p>
      )}

      {type === "telegram" && !error && (
        <p className="mt-3 text-center text-xs text-white/45">
          Enter your Telegram username. Usernames must be at least 5
          characters, for example @arvocommunity.
        </p>
      )}

      {mode === "request" && (
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => changeMode("invitation")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/75 transition hover:text-white"
          >
            <KeyRound size={15} />
            <span className="text-white">Have an invitation code?</span>
            <span className="text-[#e2a98e]">Enter code →</span>
          </button>
        </div>
      )}

      <p className="mx-auto mt-5 max-w-2xl text-center text-xs leading-5 text-white/35">
        {mode === "invitation"
          ? "Your contact details will be linked to your invitation."
          : "Early-access invitations will be sent before public release. Vault eligibility, capacity and terms apply."}{" "}
        By submitting your details, you agree to our{" "}
        <Link
          href="/privacy-policy"
          className="text-white/45 underline decoration-white/20 underline-offset-4 transition hover:text-white"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
