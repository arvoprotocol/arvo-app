import type { Metadata } from "next";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || "";
  const done = one(params.done) === "1";
  const email = one(params.e).slice(0, 254);
  const token = one(params.t).slice(0, 64);
  const action = `/api/platform/unsubscribe?${new URLSearchParams({ e: email, t: token }).toString()}`;

  return <>
    <Header />
    <main className="bg-[#07090b] pb-24 pt-40 text-white">
      <Container>
        <div className="mx-auto max-w-xl rounded-[28px] border border-white/10 bg-white/[0.035] p-8 md:p-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#e2a98e]">Email preferences</p>
          {done ? <>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight">You’re unsubscribed.</h1>
            <p className="mt-4 text-sm leading-7 text-white/60">You will no longer receive Arvo waitlist emails. Messages about support tickets you open are separate.</p>
          </> : email && token ? <>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight">Unsubscribe from Arvo emails?</h1>
            <p className="mt-4 break-words text-sm leading-7 text-white/60">Stop waitlist and update emails to <span className="font-semibold text-white">{email}</span>.</p>
            <form method="post" action={action} className="mt-7">
              <button type="submit" className="rounded-xl bg-[#f8f2ed] px-5 py-3 text-sm font-semibold text-[#07090b] transition hover:bg-white">Unsubscribe</button>
            </form>
          </> : <>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight">Link incomplete.</h1>
            <p className="mt-4 text-sm leading-7 text-white/60">Use the unsubscribe link from the bottom of an Arvo email.</p>
          </>}
        </div>
      </Container>
    </main>
    <Footer />
  </>;
}
