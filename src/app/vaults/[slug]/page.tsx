import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { appUrl } from "@/lib/protocol/app-url";
import { sharedVault } from "@/lib/staking/vault-share-data";
import { shareBacking, shareOpening, sharePercent, shareTerm, siteOrigin, vaultShareText } from "@/lib/staking/vault-share";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const vault = await sharedVault((await params).slug);
  if (!vault) return { title: "Vault not found", robots: { index: false } };
  const origin = siteOrigin(), url = `${origin}/vaults/${vault.slug}`, image = `${url}/og`;
  const title = `${vault.title}: ${sharePercent(vault.rate)} fixed ${vault.asset} reward`;
  const description = vaultShareText(vault);
  return {
    title, description, alternates: { canonical: url },
    openGraph: { type: "website", url, siteName: "Arvo", title: `${title} | Arvo`, description, images: [{ url: image, width: 1200, height: 630, alt: `${vault.title} vault on Arvo` }] },
    twitter: { card: "summary_large_image", title: `${title} | Arvo`, description, images: [image] },
  };
}

export default async function SharedVaultPage({ params }: { params: Promise<{ slug: string }> }) {
  const vault = await sharedVault((await params).slug);
  if (!vault) notFound();
  const opens = shareOpening(vault.opensAt);
  const stats = [["Minimum", vault.minimum], ["Vault size", vault.size], ["Reward in", vault.asset]];
  return <>
    <Header />
    <main className="bg-[#f6f2ec] pb-20 pt-32 md:pt-40">
      <Container>
        <section className="relative mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0a09] p-7 text-white md:p-10">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#c9846a]/20 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#e2a98e]"><span className="h-1.5 w-1.5 rounded-full bg-[#e2a98e]" />{vault.live ? "Live vault" : opens ? `Opens ${opens}` : "Coming soon"}</p>
            {vault.bonusPct ? <span className="rounded-full bg-[linear-gradient(110deg,#c9846a,#f0d2b0,#bba0ce)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#07090b]">+{sharePercent(vault.bonusPct)} bonus</span> : null}
          </div>
          <h1 className="relative mt-5 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">{vault.title}</h1>
          <p className="relative mt-2 text-sm text-white/70">{vault.product} · locked for {shareTerm(vault.days)} from your deposit</p>
          <p className="relative mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-1"><span className="text-6xl font-semibold tracking-[-0.04em]">{sharePercent(vault.rate)}</span><span className="text-lg text-[#e2a98e]">fixed {vault.asset} reward{vault.bonusPct ? " + bonus" : ""}</span><span className="text-lg text-white/70">over {shareTerm(vault.days)}</span></p>
          <dl className="relative mt-7 grid grid-cols-3 gap-2">{stats.map(([label, value]) => <div key={label} className="rounded-xl bg-white/[0.06] px-3 py-3"><dt className="text-[11px] text-white/65">{label}</dt><dd className="mt-1 text-sm font-semibold">{value}</dd></div>)}</dl>
          <p className="relative mt-7 text-sm leading-6 text-white/75">{shareBacking(vault)} Your position and its fixed reward are set when you deposit, and the staking contracts are audited by Soken.</p>
          <div className="relative mt-8 flex flex-wrap items-center gap-4">
            <a href={appUrl(`/app/stake#${vault.anchor}`)} className="rounded-xl bg-[#f8f2ed] px-5 py-3 text-sm font-semibold text-[#07090b] hover:bg-white">Open in the Arvo app →</a>
            <Link href="/vaults" className="text-sm font-semibold text-[#e2a98e] hover:text-white">All vaults</Link>
          </div>
          <p className="relative mt-8 border-t border-white/10 pt-4 text-[11px] leading-5 text-white/50">Rewards are fixed per position under the vault’s published terms. Staking involves risk, does not give ownership of land or any project, and is not financial advice.</p>
        </section>
      </Container>
    </main>
    <Footer />
  </>;
}
