import type { Metadata } from "next";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { TransparencyView } from "@/components/protocol/TransparencyView";
import { readTransparency } from "@/lib/protocol/transparency";

export const metadata: Metadata = {
  title: "Transparency & security",
  description: "Arvo's audits, security safeguards, contract addresses and live onchain reserves.",
};
export const dynamic = "force-dynamic";

// Public version (no invite needed). The same content is in the app at /app/transparency.
export default async function TransparencyPage() {
  const t = await readTransparency();
  return <main className="bg-[#07090b] text-white">
    <div className="noise" />
    <Header />
    <section className="pb-16 pt-40">
      <Container>
        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-[#e2a98e]">Arvo</p>
        <h1 className="text-balance text-6xl font-semibold tracking-[-0.07em] md:text-8xl">Transparency</h1>
        <p className="mt-7 max-w-2xl text-xl leading-8 text-white/60">Audits, safeguards, contract addresses and live reserves. Figures below are read directly from {t.network}, not entered by hand.</p>
      </Container>
    </section>
    <TransparencyView t={t} inner="mx-auto w-[min(1440px,calc(100%-64px))]" />
    <Footer />
  </main>;
}
