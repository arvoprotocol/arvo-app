"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { sendEmailBatches } from "@/lib/admin/email-batches";
import {
  Check,
  Eye,
  Mail,
  Plus,
  Send,
  TestTube2,
  Users,
  X,
} from "lucide-react";

type Partner = {
  id: number;
  name: string;
  email: string;
};

type Recipient = {
  email: string;
  name: string;
};

const INITIAL_SUBJECT = "An update on LandFi and Arvo";

const INITIAL_BODY = `Hi [First name],

We wanted to send a quick update as some of you may not yet be aware of the changes we've made over the past few months.

## Project update

LandFi was closed down and we have since launched Arvo, a new venture built around the same underlying approach but with a much broader scope.

One of the main reasons for the change was that we didn't want to remain restricted solely to land. Arvo gives us the ability to build around established, revenue-generating businesses across different sectors, with land and real estate forming the first part of that model.

We've now also launched Arvo through Virtuals Protocol, using their token launch and tokenomics framework.

## Your allocation

As we've always said, the allocation previously agreed with you has not been forgotten. This is being recognised within Arvo and we'll now be formalising each allocation and its vesting arrangements.

## What happens next

You will shortly receive a separate email from us asking you to confirm the wallet address you would like associated with your allocation.

This will allow us to set up your individual partner record and, shortly afterwards, give you access to a dashboard where you'll be able to view your $ARVO allocation, vesting schedule, available tokens and distribution history.

Please look out for that email and check your spam or junk folder if you don't see it.

[Visit Arvo]

We're excited about where we're taking Arvo and appreciate your continued support as we move into this next stage.

The Arvo Team`;

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function EmailComposer({
  partners, initialRecipients = [], initialSubject = INITIAL_SUBJECT,
  initialBody = INITIAL_BODY, audienceLabel = "selected recipients", onBusyChange, audience,
}: {
  partners: Partner[];
  initialRecipients?: Recipient[];
  initialSubject?: string;
  initialBody?: string;
  audienceLabel?: string;
  onBusyChange?: (busy: boolean) => void;
  /** "waitlist" adds unsubscribe links and skips unsubscribed contacts. */
  audience?: "waitlist";
}) {
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [recipients, setRecipients] = useState<Recipient[]>(initialRecipients);
  const [manualEmail, setManualEmail] = useState("");
  const [manualName, setManualName] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [testName, setTestName] = useState("Marc");
  const [preview, setPreview] = useState(false);
  const [sending, setSending] = useState<"test" | "send" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const sendLock = useRef(false);
  useEffect(() => {
    if (!sending) return;
    function warn(event: BeforeUnloadEvent) { event.preventDefault(); event.returnValue = ""; }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [sending]);

  const previewBody = useMemo(
    () =>
      body.replace(
        /\[First name\]/gi,
        recipients[0]?.name?.split(/\s+/)[0] || "First name"
      ),
    [body, recipients]
  );

  function addAllPartners() {
    setRecipients((current) => {
      const map = new Map(
        current.map((recipient) => [
          recipient.email.toLowerCase(),
          recipient,
        ])
      );

      for (const partner of partners) {
        map.set(partner.email.toLowerCase(), {
          email: partner.email,
          name: partner.name,
        });
      }

      return Array.from(map.values());
    });

    setMessage("");
    setError("");
  }

  function addManualRecipient() {
    const email = manualEmail.trim().toLowerCase();

    if (!isEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (
      recipients.some(
        (recipient) => recipient.email.toLowerCase() === email
      )
    ) {
      setError("That recipient has already been added.");
      return;
    }

    setRecipients((current) => [
      ...current,
      {
        email,
        name: manualName.trim(),
      },
    ]);

    setManualEmail("");
    setManualName("");
    setError("");
  }

  function removeRecipient(email: string) {
    setRecipients((current) =>
      current.filter((recipient) => recipient.email !== email)
    );
  }

  async function send(mode: "test" | "send") {
    if (sendLock.current) return;
    setError("");
    setMessage("");
    if (!subject.trim() || !body.trim()) {
      setError("Add a subject and email content first."); return;
    }
    if (mode === "test" && !isEmail(testEmail.trim())) {
      setError("Enter a valid test email address."); return;
    }
    if (mode === "send" && !recipients.length) {
      setError("Add at least one recipient."); return;
    }
    if (mode === "send" && !window.confirm(
      `Send this email to ${recipients.length} recipient${recipients.length === 1 ? "" : "s"}?`
    )) return;
    const sendSubject = subject.trim(), sendBody = body.trim();
    const sendRecipients = recipients.map(recipient => ({ ...recipient }));
    sendLock.current = true;
    setSending(mode);
    onBusyChange?.(true);
    try {
      if (mode === "send") {
        const result = await sendEmailBatches({
          subject: sendSubject, body: sendBody, recipients: sendRecipients, audience,
          onConfirmed: setRecipients,
          onProgress: progress => setMessage(progress.waiting
            ? `Sent ${progress.sent} of ${progress.total}. Waiting for the email sending limit to reset. Keep this tab open.`
            : `Sent ${progress.sent} of ${progress.total}. Keep this tab open until finished.`),
        });
        setRecipients(result.remaining);
        setMessage(result.sent ? `The mail server accepted email for ${result.sent} recipient${result.sent === 1 ? "" : "s"}.` : "");
        if (result.error) setError(result.error + (result.uncertain.length
          ? ` Delivery unconfirmed for: ${result.uncertain.map(r => r.email).join(", ")}. These addresses have been removed from the next send to prevent accidental duplicates.` : ""));
        if (!result.error) setMessage(`The mail server accepted email for all ${result.sent} recipients. See Email history for the send record.`);
      } else {
        const response = await fetch("/api/admin/emails", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode, subject: sendSubject, body: sendBody, testEmail: testEmail.trim(), testName: testName.trim(), audience }),
        });
        const result = await response.json();
        if (!response.ok || !result.ok || result.failed?.length) throw new Error(result.error || "Unable to send the test email.");
        setMessage(`Test email sent to ${testEmail.trim()}.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send the email. Check Email history before retrying.");
    } finally {
      sendLock.current = false;
      setSending(null);
      onBusyChange?.(false);
    }
  }

  return (
    <fieldset disabled={sending !== null} className="min-w-0 space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm md:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
              <Mail size={17} />
            </div>

            <div>
              <h2 className="text-lg font-semibold">Compose email</h2>
              <p className="mt-0.5 text-xs text-black/55">
                Create a branded Arvo email for {audienceLabel}. Keep this tab open while sending. Each recipient receives a separate email.
              </p>
            </div>
          </div>

          <div className="mt-7">
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-black/55">
              Subject
            </label>

            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="mt-2 w-full rounded-xl border border-black/10 bg-[#fbfaf9] px-4 py-3 text-sm outline-none transition focus:border-black/30"
            />
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-4">
              <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-black/55">
                Email content
              </label>

              <span className="text-[10px] text-black/50">
                Use [First name] to personalise
              </span>
            </div>

            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={22}
              className="mt-2 w-full resize-y rounded-xl border border-black/10 bg-[#fbfaf9] px-4 py-4 text-sm leading-6 outline-none transition focus:border-black/30"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setPreview((value) => !value)}
              className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold transition hover:border-black/25"
            >
              <Eye size={15} />
              {preview ? "Hide preview" : "Preview"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Users size={16} />
              <h2 className="font-semibold">Recipients</h2>
            </div>

            {partners.length > 0 && <button
              type="button"
              onClick={addAllPartners}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#07090b] px-4 py-3 text-sm font-semibold text-white"
            >
              <Users size={15} />
              Add all Strategic Partners
            </button>}

            <div className="my-5 border-t border-black/[0.07]" />

            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-black/55">
              Add manually
            </p>

            <input
              value={manualName}
              onChange={(event) => setManualName(event.target.value)}
              placeholder="Name (optional)"
              className="mt-3 w-full rounded-xl border border-black/10 bg-[#fbfaf9] px-3.5 py-3 text-sm outline-none"
            />

            <input
              value={manualEmail}
              onChange={(event) => setManualEmail(event.target.value)}
              placeholder="Email address"
              className="mt-2 w-full rounded-xl border border-black/10 bg-[#fbfaf9] px-3.5 py-3 text-sm outline-none"
            />

            <button
              type="button"
              onClick={addManualRecipient}
              className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-black/55"
            >
              <Plus size={14} />
              Add recipient
            </button>

            <div className="mt-5 space-y-2">
              {recipients.length === 0 ? (
                <div className="rounded-xl border border-dashed border-black/10 px-4 py-5 text-center text-xs text-black/55">
                  No recipients added yet.
                </div>
              ) : (
                recipients.map((recipient) => (
                  <div
                    key={recipient.email}
                    className="flex items-center gap-3 rounded-xl border border-black/[0.07] bg-[#fbfaf9] px-3 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      {recipient.name && (
                        <p className="truncate text-xs font-semibold">
                          {recipient.name}
                        </p>
                      )}
                      <p className="truncate text-[11px] text-black/55">
                        {recipient.email}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeRecipient(recipient.email)
                      }
                      className="text-black/50 transition hover:text-red-600"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <p className="mt-3 text-[11px] text-black/55">
              {recipients.length} recipient
              {recipients.length === 1 ? "" : "s"} selected
            </p>
          </div>

          <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <TestTube2 size={16} />
              <h2 className="font-semibold">Test email</h2>
            </div>

            <p className="mt-2 text-xs leading-5 text-black/55">
              Send the finished branded email to yourself before sending it to the real list.
            </p>

            <input
              value={testName}
              onChange={(event) => setTestName(event.target.value)}
              placeholder="Test first name"
              className="mt-4 w-full rounded-xl border border-black/10 bg-[#fbfaf9] px-3.5 py-3 text-sm outline-none"
            />

            <input
              value={testEmail}
              onChange={(event) => setTestEmail(event.target.value)}
              placeholder="Test email address"
              className="mt-2 w-full rounded-xl border border-black/10 bg-[#fbfaf9] px-3.5 py-3 text-sm outline-none"
            />

            <button
              type="button"
              disabled={sending !== null}
              onClick={() => send("test")}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold disabled:opacity-50"
            >
              <TestTube2 size={15} />
              {sending === "test" ? "Sending..." : "Send test"}
            </button>
          </div>

          <button
            type="button"
            disabled={sending !== null || recipients.length === 0}
            onClick={() => send("send")}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#07090b] px-5 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={16} />
            {sending === "send"
              ? "Sending..."
              : `Send to ${recipients.length} recipient${
                  recipients.length === 1 ? "" : "s"
                }`}
          </button>

          {message && (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-600/15 bg-emerald-600/[0.06] p-4 text-xs leading-5 text-emerald-800">
              <Check size={15} className="mt-0.5 shrink-0" />
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-600/15 bg-red-600/[0.05] p-4 text-xs leading-5 text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>

      {preview && (
        <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm md:p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-black/55">
                Email preview
              </p>
              <p className="mt-1 text-sm font-semibold">{subject}</p>
            </div>
          </div>

          <div className="mx-auto max-w-[680px] overflow-hidden rounded-2xl bg-[#111113] p-7 text-white md:p-10">
            <img
              src="/arvo-email-logo.png"
              alt="Arvo"
              className="h-8 w-auto"
            />

            <div className="mt-8 text-[11px] font-bold uppercase tracking-[0.2em] text-[#d9997b]">
              Arvo update
            </div>

            <div className="mt-5 space-y-4 text-[14px] leading-7 text-white/60">
              {previewBody.split(/\n{2,}/).map((block, index) => {
                const trimmed = block.trim();

                if (trimmed.startsWith("## ")) {
                  return (
                    <div
                      key={index}
                      className="pt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#d9997b]"
                    >
                      {trimmed.slice(3)}
                    </div>
                  );
                }

                if (trimmed === "[Visit Arvo]") {
                  return (
                    <div key={index} className="py-2">
                      <span className="inline-flex rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-[#07090b]">
                        Visit Arvo
                      </span>
                    </div>
                  );
                }

                return (
                  <p key={index} className="whitespace-pre-wrap">
                    {trimmed}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </fieldset>
  );
}
