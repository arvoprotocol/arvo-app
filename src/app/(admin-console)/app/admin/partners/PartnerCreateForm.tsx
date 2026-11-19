"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function PartnerCreateForm() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [wallet, setWallet] = useState("");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/partners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          originalWallet: wallet,
          notes,
        }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok) {
        setError(result.error || "Unable to create partner.");
        return;
      }

      setName("");
      setEmail("");
      setWallet("");
      setNotes("");
      setOpen(false);

      router.refresh();
    } catch {
      setError("Unable to create partner. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#07090b] px-4 py-3 text-xs font-semibold text-white transition hover:bg-black/80"
      >
        <Plus size={14} />
        Add partner
      </button>
    );
  }

  return (
    <div className="w-full md:max-w-xl">
      <form
        onSubmit={submit}
        className="rounded-2xl border border-black/[0.08] bg-white/80 p-5 shadow-sm md:p-6"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a9654f]">
              Strategic partner
            </p>

            <p className="mt-2 text-lg font-semibold tracking-[-0.025em]">
              Add partner
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setError("");
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/[0.08] bg-white text-black/55 transition hover:text-black"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          <Field
            label="Name"
            value={name}
            onChange={setName}
            placeholder="Full name"
            required
          />

          <Field
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="name@example.com"
            type="email"
            required
          />

          <Field
            label="Existing wallet"
            value={wallet}
            onChange={setWallet}
            placeholder="0x..."
            hint="Optional. Use the Ethereum/EVM address already supplied by the partner."
          />

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-black/55">
              Notes
            </span>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Internal notes only"
              className="mt-2 w-full resize-none rounded-xl border border-black/[0.09] bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-black/25 focus:border-black/25"
            />
          </label>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/15 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#07090b] px-4 py-3 text-xs font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={14} />
          {saving ? "Adding..." : "Add partner"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  hint?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-black/55">
        {label}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-black/[0.09] bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-black/25 focus:border-black/25"
      />

      {hint && (
        <span className="mt-1.5 block text-[10px] leading-4 text-black/50">
          {hint}
        </span>
      )}
    </label>
  );
}
