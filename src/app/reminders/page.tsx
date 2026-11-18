import type { Metadata } from "next";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = { title: "Maturity reminders", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function RemindersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const p = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || "";
  const status = one(p.status);
  const stop = one(p.a) === "stop";
  const action = `/api/platform/reminders?${new URLSearchParams({ a: "stop", e: one(p.e).slice(0, 254), w: one(p.w).slice(0, 42), t: one(p.t).slice(0, 64) })}`;
  const copy = status === "confirmed" ? ["Reminders are on.", "We'll email you before your positions mature and when they're ready to claim."]
    : status === "stopped" ? ["Reminders stopped.", "You won't receive any more maturity reminders for that wallet."]
    : status === "invalid" ? ["Link not valid.", "Use the link from your latest Arvo reminder email."]
    : stop ? ["Stop maturity reminders?", "You'll no longer get emails before your positions mature."]
    : ["Maturity reminders", "Manage reminders from your portfolio in the Arvo app."];
  return <>
    <Header />
    <main className="bg-[#07090b] pb-24 pt-40 text-white"><Container>
      <div className="mx-auto max-w-xl rounded-[28px] border border-white/10 bg-white/[0.035] p-8 md:p-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#e2a98e]">Email preferences</p>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">{copy[0]}</h1>
        <p className="mt-4 text-sm leading-7 text-white/60">{copy[1]}</p>
        {stop && !status && <form method="post" action={action} className="mt-7"><button type="submit" className="rounded-xl bg-[#f8f2ed] px-5 py-3 text-sm font-semibold text-[#07090b]">Stop reminders</button></form>}
      </div>
    </Container></main>
    <Footer />
  </>;
}
