"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status === "sending") return;

    setStatus("sending");
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      subject: String(formData.get("subject") || ""),
      message: String(formData.get("message") || ""),
      website: String(formData.get("website") || ""),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to send message.");
      }

      form.reset();
      setStatus("success");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't send your message. Please try again."
      );
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-y border-black/10 bg-white/40 px-6 md:px-8"
    >
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-6 border-b border-black/10 py-8 md:grid-cols-[0.28fr_0.72fr] md:items-center">
        <label
          htmlFor="name"
          className="text-sm font-semibold uppercase tracking-[0.22em] text-black/40"
        >
          Name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={120}
          autoComplete="name"
          placeholder="Your name"
          className="w-full bg-transparent text-2xl font-semibold tracking-[-0.03em] text-[#07090b] outline-none placeholder:text-black/25"
        />
      </div>

      <div className="grid gap-6 border-b border-black/10 py-8 md:grid-cols-[0.28fr_0.72fr] md:items-center">
        <label
          htmlFor="email"
          className="text-sm font-semibold uppercase tracking-[0.22em] text-black/40"
        >
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full bg-transparent text-2xl font-semibold tracking-[-0.03em] text-[#07090b] outline-none placeholder:text-black/25"
        />
      </div>

      <div className="grid gap-6 border-b border-black/10 py-8 md:grid-cols-[0.28fr_0.72fr] md:items-center">
        <label
          htmlFor="subject"
          className="text-sm font-semibold uppercase tracking-[0.22em] text-black/40"
        >
          Subject
        </label>

        <input
          id="subject"
          name="subject"
          type="text"
          required
          maxLength={200}
          placeholder="What's this about?"
          className="w-full bg-transparent text-2xl font-semibold tracking-[-0.03em] text-[#07090b] outline-none placeholder:text-black/25"
        />
      </div>

      <div className="grid gap-6 border-b border-black/10 py-8 md:grid-cols-[0.28fr_0.72fr]">
        <label
          htmlFor="message"
          className="text-sm font-semibold uppercase tracking-[0.22em] text-black/40"
        >
          Message
        </label>

        <textarea
          id="message"
          name="message"
          rows={6}
          required
          maxLength={5000}
          placeholder="Write your message..."
          className="w-full resize-none bg-transparent text-2xl font-semibold leading-snug tracking-[-0.03em] text-[#07090b] outline-none placeholder:text-black/25"
        />
      </div>

      <div className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div aria-live="polite">
          {status === "success" && (
            <p className="text-sm font-medium text-black/65">
              Thanks. Your message has been sent to the Arvo team.
            </p>
          )}

          {status === "error" && (
            <p className="text-sm font-medium text-red-700">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-[#07090b] px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "sending" ? "Sending..." : "Send message"}
        </button>
      </div>
    </form>
  );
}
