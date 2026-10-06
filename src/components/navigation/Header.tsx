"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Copy, X } from "lucide-react";
import { Container } from "@/components/layout/Container";

const CONTRACT_ADDRESS = "0x6457dA6FCA3C807b7f430770DbBe8aB5a767234A";
const VIRTUALS_URL = "https://app.virtuals.io/virtuals/139272";
const UNISWAP_URL =
  "https://app.uniswap.org/explore/tokens/robinhood/0x6457dA6FCA3C807b7f430770DbBe8aB5a767234A";

const nav = [
  ["Treasury", "/treasury"],
  ["Roadmap", "/roadmap"],
  ["Team", "/team"],
  ["Token", "/token"],
  ["Vaults", "/vaults"],
  ["FAQ", "/faq"],
];

export function Header({ launch = false }: { launch?: boolean }) {
  const [open, setOpen] = useState(false);
  const [buyOpen, setBuyOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyContract() {
    await navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  useEffect(() => {
    if (!buyOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setBuyOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [buyOpen]);

  function openBuy() {
    setOpen(false);
    setBuyOpen(true);
  }

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50">
        <div className="border-b border-white/10 bg-[#07090b]/90 backdrop-blur-xl">
          <Container>
            <div className="flex items-center justify-between py-5">
              <Link
                href="/"
                className="flex items-center transition-opacity duration-300 hover:opacity-90"
                onClick={() => setOpen(false)}
              >
                <Image
                  src="/arvo_logo.svg"
                  alt="Arvo Protocol"
                  width={200}
                  height={40}
                  priority
                  className="h-10 w-auto"
                />
              </Link>

              <nav className="hidden items-center gap-8 text-[16px] font-medium text-white/72 lg:flex">
                {nav.map(([label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    className="transition hover:text-white"
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              <div className="hidden h-[52px] items-center lg:flex">
                <div className="mr-4 flex h-[52px] items-center">
                  <div className="flex h-[52px] overflow-hidden rounded-xl border border-white/10 bg-white/[0.025]">
                    <a
                      href="https://x.com/arvo_protocol"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Arvo on X"
                      className="group flex h-full w-[48px] items-center justify-center text-white/45 transition duration-300 hover:bg-white/[0.05] hover:text-white/90"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="h-[15px] w-[15px] fill-current transition-transform duration-300 group-hover:-translate-y-px"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
                      </svg>
                    </a>

                    <a
                      href="https://t.me/arvo_protocol"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Arvo on Telegram"
                      className="group flex h-full w-[48px] items-center justify-center border-l border-white/10 text-white/45 transition duration-300 hover:bg-white/[0.05] hover:text-white/90"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="h-[17px] w-[17px] fill-current transition-transform duration-300 group-hover:-translate-y-px"
                      >
                        <path d="M21.944 2.506a1.52 1.52 0 0 0-1.53-.13L2.84 9.18c-1.2.466-1.184 1.166-.218 1.462l4.51 1.407 1.742 5.45c.212.588.107.822.724.822.476 0 .686-.217.952-.476l2.164-2.105 4.502 3.326c.83.458 1.428.22 1.635-.77l2.96-13.946c.303-1.214-.463-1.765-1.867-1.844ZM8.04 11.725l10.168-6.414c.508-.308.974-.142.592.197l-8.39 7.57-.327 3.49-2.043-4.843Z" />
                      </svg>
                    </a>
                  </div>
                </div>

                <div className="flex h-[52px] items-stretch gap-3">
                  <Link
                    href="/platform"
                    className={`inline-flex h-[52px] items-center justify-center rounded-xl border border-white/15 bg-white/[0.035] px-5 text-[14px] font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.06] ${
                      launch ? "" : "hidden xl:inline-flex"
                    }`}
                  >
                    Request app access
                  </Link>

                  <button
                    type="button"
                    onClick={openBuy}
                    className="app-cta-pulse group relative inline-flex h-[52px] items-center justify-center gap-3 rounded-xl bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,.35),transparent_28%),linear-gradient(135deg,#b9775d_0%,#e2a98e_38%,#f0d2b0_58%,#8b5cf6_135%)] px-5 text-[15px] font-semibold text-[#07090b] shadow-[inset_0_1px_0_rgba(255,255,255,.34),0_22px_60px_rgba(201,132,106,.24)] transition duration-300 hover:-translate-y-0.5 hover:brightness-105"
                    aria-haspopup="dialog"
                  >
                    <span>Buy</span>
                    <span
                      aria-hidden="true"
                      className="text-lg leading-none transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 lg:hidden">
                <button
                  type="button"
                  onClick={openBuy}
                  className="inline-flex h-[44px] min-w-[80px] items-center justify-center rounded-xl bg-[linear-gradient(135deg,#b9775d_0%,#e2a98e_45%,#f0d2b0_100%)] px-5 text-[14px] font-semibold text-[#07090b] shadow-[inset_0_1px_0_rgba(255,255,255,.3)] transition active:scale-[0.98]"
                  aria-haspopup="dialog"
                >
                  <span>Buy</span>
                  <span
                    aria-hidden="true"
                    className="ml-3 text-lg leading-none transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </button>

                <button
                  type="button"
                  aria-label={open ? "Close menu" : "Open menu"}
                  aria-expanded={open}
                  onClick={() => setOpen((value) => !value)}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 text-white transition hover:border-white/30 lg:hidden"
              >
                <span className="relative h-4 w-5">
                  <span
                    className={`absolute left-0 top-0 h-px w-5 bg-current transition ${
                      open ? "translate-y-2 rotate-45" : ""
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-2 h-px w-5 bg-current transition ${
                      open ? "opacity-0" : ""
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-4 h-px w-5 bg-current transition ${
                      open ? "-translate-y-2 -rotate-45" : ""
                    }`}
                  />
                </span>
              </button>
              </div>
            </div>
          </Container>

          <div
            className={`overflow-hidden border-t border-white/10 bg-[#07090b]/96 transition-all duration-300 lg:hidden ${
              open ? "h-[calc(100vh-81px)] opacity-100" : "h-0 opacity-0"
            }`}
          >
            <Container>
              <nav className="flex flex-col py-5">
                {nav.map(([label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="border-b border-white/10 py-5 text-2xl font-semibold tracking-[-0.04em] text-white transition hover:text-[#e2a98e]"
                  >
                    {label}
                  </Link>
                ))}

                <div className="pt-6">
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={openBuy}
                      className="group relative block w-full"
                    >
                      <span className="app-cta-pulse relative flex h-[60px] w-full items-center justify-center gap-3 rounded-xl bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,.35),transparent_28%),linear-gradient(135deg,#b9775d_0%,#e2a98e_38%,#f0d2b0_58%,#8b5cf6_135%)] px-6 py-5 text-[16px] font-semibold text-[#07090b]">
                        <span>Buy</span>
                        <span aria-hidden="true" className="text-xl leading-none">
                          →
                        </span>
                      </span>
                    </button>

                    <Link
                      href="/platform"
                      onClick={() => setOpen(false)}
                      className="flex h-[60px] w-full items-center justify-center rounded-xl border border-white/15 bg-white/[0.035] px-6 py-5 text-[16px] font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.06]"
                    >
                      Request app access
                    </Link>
                  </div>

                  <div className="mt-8 flex items-center justify-center gap-6">
                    <a
                      href="https://x.com/arvo_protocol"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Arvo on X"
                      className="flex h-8 w-8 items-center justify-center text-white/50 transition hover:text-[#e2a98e]"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="h-[17px] w-[17px] fill-current"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
                      </svg>
                    </a>

                    <a
                      href="https://t.me/arvo_protocol"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Arvo on Telegram"
                      className="flex h-8 w-8 items-center justify-center text-white/50 transition hover:text-[#e2a98e]"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="h-[19px] w-[19px] fill-current"
                      >
                        <path d="M21.944 2.506a1.52 1.52 0 0 0-1.53-.13L2.84 9.18c-1.2.466-1.184 1.166-.218 1.462l4.51 1.407 1.742 5.45c.212.588.107.822.724.822.476 0 .686-.217.952-.476l2.164-2.105 4.502 3.326c.83.458 1.428.22 1.635-.77l2.96-13.946c.303-1.214-.463-1.765-1.867-1.844ZM8.04 11.725l10.168-6.414c.508-.308.974-.142.592.197l-8.39 7.57-.327 3.49-2.043-4.843Z" />
                      </svg>
                    </a>

                    <span
                      aria-hidden="true"
                      className="h-5 w-px bg-white/10"
                    />

                    <Link
                      href="/contact"
                      onClick={() => setOpen(false)}
                      className="text-sm font-medium text-white transition hover:text-[#e2a98e]"
                    >
                      Contact
                    </Link>

                    <Link
                      href="https://arvo.gitbook.io/arvo"
                      onClick={() => setOpen(false)}
                      className="text-sm font-medium text-white transition hover:text-[#e2a98e]"
                    >
                      Whitepaper
                    </Link>
                  </div>
                </div>
              </nav>
            </Container>
          </div>
        </div>
      </header>

      {buyOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-5 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="buy-arvo-title"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setBuyOpen(false);
          }}
        >
          <div className="relative w-full max-w-[520px] overflow-hidden rounded-3xl border border-white/10 bg-[#0b0e12] p-6 shadow-[0_35px_100px_rgba(0,0,0,.65)] sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(226,169,142,.14),transparent_35%)]" />

            <button
              type="button"
              onClick={() => setBuyOpen(false)}
              aria-label="Close"
              className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/55 transition hover:bg-white/[0.08] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#e2a98e]">
                $ARVO
              </p>

              <h2
                id="buy-arvo-title"
                className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white"
              >
                Buy $ARVO
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/50">
                Choose where you would like to buy ARVO.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <a
                  href={VIRTUALS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-[92px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] px-7 transition duration-300 hover:-translate-y-0.5 hover:border-[#e2a98e]/30 hover:bg-white/[0.06]"
                >
                  <Image
                    src="/virtuals.png"
                    alt="Virtuals Protocol"
                    width={165}
                    height={42}
                    className="h-auto w-[125px] brightness-0 invert opacity-75 transition group-hover:opacity-100"
                  />
                </a>

                <a
                  href={UNISWAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-[92px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] px-7 transition duration-300 hover:-translate-y-0.5 hover:border-[#e2a98e]/30 hover:bg-white/[0.06]"
                >
                  <Image
                    src="/Uniswap_horizontallogo_white.svg"
                    alt="Uniswap"
                    width={165}
                    height={42}
                    className="h-auto w-[140px] opacity-75 transition group-hover:opacity-100"
                  />
                </a>
              </div>

              <div className="mt-4 flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3.5">
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  CA
                </span>

                <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-white/60">
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
          </div>
        </div>
      )}
    </>
  );
}
