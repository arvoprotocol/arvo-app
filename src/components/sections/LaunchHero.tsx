"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/animations/Reveal";
import { HeroFlow } from "@/components/flow/HeroFlow";
import { AnimatedHeadline } from "@/components/animations/AnimatedHeadline";

const CONTRACT_ADDRESS = "0x6457dA6FCA3C807b7f430770DbBe8aB5a767234A";
const VIRTUALS_URL = "https://app.virtuals.io/virtuals/139272";
const ROBINHOOD_URL = "https://robinscan.io/token/0x6457da6fca3c807b7f430770dbbe8ab5a767234a";
const UNISWAP_URL = "https://app.uniswap.org/explore/tokens/robinhood/0x6457dA6FCA3C807b7f430770DbBe8aB5a767234A";
const COINGECKO_URL = "https://www.coingecko.com/en/coins/arvo";
const DEXSCREENER_URL = "https://dexscreener.com/robinhood/0xb9b1139C812F4c9d0F3eC1dd502560777118E0E0";

const credibilityItems = [
  {
    name: "Virtuals Protocol",
    src: "/virtuals.png",
    subtitle: "Available on",
    href: VIRTUALS_URL,
    imageWidth: 165,
  },
  {
    name: "Robinhood Chain",
    src: "/robinhood-chain-white.svg",
    subtitle: "Live on",
    href: ROBINHOOD_URL,
    imageWidth: 165,
  },
  {
    name: "Uniswap",
    src: "/Uniswap_horizontallogo_white.svg",
    subtitle: "Available on",
    href: UNISWAP_URL,
    imageWidth: 165,
  },
  {
    name: "CoinGecko",
    src: "/coingecko-wordmark-official-white.svg",
    subtitle: "Listed on",
    href: COINGECKO_URL,
    imageWidth: 190,
  },
  {
    name: "DEX Screener",
    src: "/dexscreener-official-white.png",
    subtitle: "Track on",
    href: DEXSCREENER_URL,
    imageWidth: 195,
  },
  {
    name: "RWA.io",
    src: "/rwa.svg",
    subtitle: "Member of RWA.io",
    href: "https://www.rwa.io/",
    imageWidth: 165,
  },
  {
    name: "Business Insider",
    src: "/business-insider.png",
    subtitle: "Featured In",
    imageWidth: 165,
  },
  {
    name: "GLC Legal",
    src: "/glc-legal-logo.svg",
    subtitle: "Appointed Legal Partner",
    href: "https://glclegal.com/",
    imageWidth: 170,
  },
  {
    name: "CUK Group",
    src: "/CUK-Group-Logo.png",
    subtitle: "Existing Operating Business",
    href: "https://connectukgroup.co.uk/",
    imageWidth: 125,
  },
];



export function LaunchHero() {
  const [copied, setCopied] = useState(false);

  async function copyContract() {
    await navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#07090b] pt-40 sm:pt-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_42%,rgba(201,143,115,.18),transparent_32%),radial-gradient(circle_at_68%_52%,rgba(82,105,128,.22),transparent_34%),radial-gradient(circle_at_18%_28%,rgba(255,255,255,.055),transparent_28%),linear-gradient(to_bottom,#07090b,#080b0f_58%,#0c1016)]" />
      <div className="absolute inset-0 opacity-[0.15] [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:80px_80px]" />

      <Container className="relative z-10">
        <div className="grid min-h-[calc(100vh-150px)] items-center gap-x-10 gap-y-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative z-10 min-w-0">
            <Reveal>
              <Link
                href={VIRTUALS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group mb-7 inline-flex items-center gap-2.5 rounded-full border border-[#e2a98e]/20 bg-[#e2a98e]/[0.06] px-4 py-2 transition hover:border-[#e2a98e]/35 hover:bg-[#e2a98e]/[0.1]"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e2a98e] opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#e2a98e]" />
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e2a98e]">
                  Arvo is live
                </span>
                <ExternalLink className="h-3 w-3 text-[#e2a98e]/55 transition group-hover:text-[#e2a98e]" />
              </Link>
            </Reveal>

            <AnimatedHeadline />

            <Reveal delay={0.16}>
              <p className="mt-8 max-w-2xl text-xl leading-8 text-white/64">
                Arvo is now live on Robinhood Chain, bringing established businesses
                <span className="hidden lg:inline">
                  <br />
                </span>{" "}
                and on-chain participation together through the Arvo protocol.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-8 w-full max-w-[400px]">
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={VIRTUALS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Buy ARVO on Virtuals Protocol"
                    className="group flex h-[74px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] px-5 transition duration-300 hover:-translate-y-0.5 hover:border-[#e2a98e]/30 hover:bg-white/[0.06]"
                  >
                    <Image
                      src="/virtuals.png"
                      alt="Virtuals Protocol"
                      width={165}
                      height={42}
                      className="h-auto w-[102px] brightness-0 invert opacity-75 transition duration-300 group-hover:opacity-100 sm:w-[110px]"
                    />
                  </a>

                  <a
                    href={UNISWAP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Buy ARVO on Uniswap"
                    className="group flex h-[74px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] px-5 transition duration-300 hover:-translate-y-0.5 hover:border-[#e2a98e]/30 hover:bg-white/[0.06]"
                  >
                    <Image
                      src="/Uniswap_horizontallogo_white.svg"
                      alt="Uniswap"
                      width={165}
                      height={42}
                      className="h-auto w-[108px] opacity-75 transition duration-300 group-hover:opacity-100 sm:w-[116px]"
                    />
                  </a>
                </div>

                <div className="mt-3 flex h-[52px] min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4">
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    CA
                  </span>

                  <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-white/60 sm:text-xs">
                    {CONTRACT_ADDRESS}
                  </span>

                  <button
                    type="button"
                    onClick={copyContract}
                    className="shrink-0 text-white/40 transition hover:text-white"
                    aria-label="Copy contract address"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-[#e2a98e]" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </Reveal>

          </div>

          <Reveal delay={0.2}>
            <HeroFlow />
          </Reveal>

          <Reveal delay={0.34} className="mt-6 min-w-0 lg:col-span-2 lg:mt-10">
            <div className="group/ticker relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] py-5 backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#0a0d11] to-transparent sm:w-20" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#0a0d11] to-transparent sm:w-20" />

              <div className="launch-logo-track flex w-max items-stretch group-hover/ticker:[animation-play-state:paused]">
                {[...credibilityItems, ...credibilityItems].map((item, index) => {
                  const content = (
                    <>
                      <div className="mb-4 flex h-10 w-full items-center justify-center">
                        <div className="mx-auto flex h-full w-[190px] shrink-0 items-center justify-center text-center">
                          <Image
                            src={item.src}
                            alt={item.name}
                            width={item.imageWidth}
                            height={42}
                            className={`mx-auto block object-contain opacity-60 transition-all duration-300 group-hover:opacity-90 ${
                              item.name === "Virtuals Protocol"
                                ? "h-auto w-[128px] brightness-0 invert"
                                : item.name === "CoinGecko"
                                  ? "h-auto w-[140px]"
                                  : item.name === "DEX Screener"
                                    ? "h-auto w-[168px]"
                                    : item.name === "Uniswap"
                                      ? "h-auto w-[150px]"
                                      : "max-h-8 w-auto max-w-[165px] brightness-0 invert"
                            }`}
                          />
                        </div>
                      </div>

                      <p className="text-center text-[10px] font-medium uppercase tracking-[0.15em] text-white/40">
                        {item.subtitle}
                      </p>
                    </>
                  );

                  return (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex w-[50vw] max-w-[220px] shrink-0 items-center justify-center border-r border-white/10 px-5 sm:w-[220px] lg:w-[240px] lg:max-w-none"
                    >
                      {item.href ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex min-h-[82px] w-full flex-col items-center justify-center"
                        >
                          {content}
                        </a>
                      ) : (
                        <div className="group flex min-h-[82px] w-full flex-col items-center justify-center">
                          {content}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <style jsx>{`
              @keyframes launch-logo-scroll {
                from {
                  transform: translateX(0);
                }
                to {
                  transform: translateX(-50%);
                }
              }

              .launch-logo-track {
                animation: launch-logo-scroll 32s linear infinite;
              }

              @media (max-width: 639px) {
                .launch-logo-track {
                  animation-duration: 26s;
                }
              }

              @media (prefers-reduced-motion: reduce) {
                .launch-logo-track {
                  animation: none;
                }
              }
            `}</style>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
