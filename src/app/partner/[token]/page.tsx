import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";

import { PartnerRegistrationForm } from "./PartnerRegistrationForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Partner Wallet Registration",
  description: "Secure wallet registration for Arvo Strategic Partners.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function PartnerRegistrationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    notFound();
  }

  const partner = await prisma.strategicPartner.findUnique({
    where: {
      registrationToken: token,
    },
  });

  if (!partner) {
    notFound();
  }

  return (
    <main>
      <div className="noise" />
      <Header />

      <section className="relative overflow-hidden bg-[#07090b] pb-24 pt-44 text-white md:pb-28 md:pt-52">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_20%,rgba(201,143,115,.18),transparent_32%),radial-gradient(circle_at_20%_40%,rgba(139,92,246,.08),transparent_28%),linear-gradient(to_bottom,#07090b,#090d12_60%,#0c1016)]" />

        <Container className="relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.045] px-3 py-2">
              <ShieldCheck
                size={13}
                className="text-[#e2a98e]"
              />

              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/55">
                Strategic Partner registration
              </span>
            </div>

            <h1 className="mt-7 text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.05em] md:text-7xl">
              Register your wallet for Arvo.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/58">
              Confirm the wallet associated with your Strategic Partner
              allocation and make sure it is ready for Robinhood Chain.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-[#fbf4ef] py-16 text-[#07090b] md:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[.32fr_.68fr] lg:gap-16">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/35">
                Before you begin
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
                Your wallet remains yours.
              </h2>

              <p className="mt-5 text-sm leading-6 text-black/55">
                Registration only records the public wallet address to be
                associated with your Arvo allocation. It does not give Arvo
                access to your wallet or funds.
              </p>

              <div className="mt-7 border-t border-black/10 pt-6">
                <p className="text-xs font-semibold">
                  We will never ask for:
                </p>

                <div className="mt-3 space-y-2 text-xs leading-5 text-black/45">
                  <p>Seed phrase</p>
                  <p>Private key</p>
                  <p>Wallet password</p>
                  <p>Transfer of funds to verify ownership</p>
                </div>
              </div>
            </div>

            <PartnerRegistrationForm
              token={partner.registrationToken}
              name={partner.name}
              originalWallet={partner.originalWallet}
              registeredWallet={partner.registeredWallet}
              initialWalletType={partner.walletType}
              initialStatus={partner.status}
            />
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
