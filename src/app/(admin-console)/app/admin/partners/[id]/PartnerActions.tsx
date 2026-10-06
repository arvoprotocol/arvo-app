"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clipboard,
  Mail,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

export function PartnerActions({
  partnerId,
  registrationUrl,
  canApprove,
  sentBefore,
}: {
  partnerId: number;
  registrationUrl: string;
  canApprove: boolean;
  sentBefore: boolean;
}) {
  const router = useRouter();

  const [sending, setSending] = useState(false);
  const [approving, setApproving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(registrationUrl);
      setError("");
      setMessage("Secure registration link copied.");
    } catch {
      setMessage("");
      setError("Unable to copy the link. Copy it manually below.");
    }
  }

  async function sendEmail() {
    setSending(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/admin/partners/${partnerId}/send`,
        { method: "POST" }
      );

      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        setError(result.error || "Unable to send email.");
        return;
      }

      setMessage("Registration email sent.");
      router.refresh();
    } catch {
      setError("Unable to send email.");
    } finally {
      setSending(false);
    }
  }

  async function approve() {
    if (
      !window.confirm(
        "Approve this wallet change and mark the wallet as confirmed?"
      )
    ) {
      return;
    }

    setApproving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/admin/partners/${partnerId}/approve`,
        { method: "POST" }
      );

      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        emailWarning?: string;
      };

      if (!response.ok || !result.ok) {
        setError(result.error || "Unable to approve wallet.");
        return;
      }

      setMessage(
        result.emailWarning ||
          "Wallet approved and confirmation email sent."
      );

      router.refresh();
    } catch {
      setError("Unable to approve wallet.");
    } finally {
      setApproving(false);
    }
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={sendEmail}
          disabled={sending}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#07090b] px-4 py-3 text-xs font-semibold text-white transition hover:bg-black/80 disabled:opacity-40"
        >
          {sentBefore ? <RefreshCw size={14} /> : <Mail size={14} />}
          {sending
            ? "Sending..."
            : sentBefore
              ? "Resend registration email"
              : "Send registration email"}
        </button>

        <button
          type="button"
          onClick={copyLink}
          className="flex items-center justify-center gap-2 rounded-xl border border-black/[0.09] bg-white px-4 py-3 text-xs font-semibold transition hover:border-black/20"
        >
          <Clipboard size={14} />
          Copy secure link
        </button>
      </div>

      {canApprove && (
        <button
          type="button"
          onClick={approve}
          disabled={approving}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-600/20 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-40"
        >
          <CheckCircle2 size={14} />
          {approving ? "Approving..." : "Approve wallet change"}
        </button>
      )}

      {message && (
        <div className="mt-4 rounded-xl border border-emerald-500/15 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/15 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
