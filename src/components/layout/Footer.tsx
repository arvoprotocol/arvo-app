import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/Container";

const linkGroups = [
  {
    title: "Explore",
    links: [
      ["Treasury", "/treasury"],
      ["Staking", "/staking"],
      ["Roadmap", "/roadmap"],
    ],
  },
  {
    title: "Protocol",
    links: [
      ["Team", "/team"],
      ["Whitepaper", "https://arvo.gitbook.io/arvo"],
      ["FAQ", "/faq"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy Policy", "/privacy-policy"],
      ["Legal & Risk", "/legal"],
    ],
  },
];

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="currentColor"
    >
      <path d="M21.944 2.506a1.5 1.5 0 0 0-1.526-.22L2.933 9.237a1.5 1.5 0 0 0 .087 2.82l4.482 1.493 1.73 5.19a1.5 1.5 0 0 0 2.54.51l2.445-2.445 4.523 3.392a1.5 1.5 0 0 0 2.37-.91l2.83-15.29a1.5 1.5 0 0 0-.996-1.491ZM9.16 12.69l8.777-5.486-7.225 6.99-.57 2.28-.982-3.784Zm9.53 4.846-5.187-3.89 6.798-6.578-1.61 10.468Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#07090b] pb-40 pt-20 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(201,132,106,.12),transparent_30%),radial-gradient(circle_at_84%_18%,rgba(139,92,246,.10),transparent_34%),radial-gradient(circle_at_50%_110%,rgba(201,132,106,.16),transparent_48%)]" />

        <svg
          viewBox="0 0 1600 620"
          preserveAspectRatio="none"
          className="absolute bottom-[-250px] left-1/2 w-[1850px] -translate-x-1/2 opacity-70"
        >
          <path
            d="M0 440 C140 380 260 410 390 340 C540 258 690 310 800 250 C940 175 1120 260 1260 210 C1410 156 1510 188 1600 132"
            fill="none"
            stroke="rgba(226,169,142,.18)"
            strokeWidth="2"
          />

          <path
            d="M0 510 C180 465 330 520 480 455 C640 385 780 450 930 370 C1090 286 1280 370 1600 260"
            fill="none"
            stroke="rgba(139,92,246,.14)"
            strokeWidth="1.5"
          />

          <path
            d="M0 565 C220 525 430 590 650 530 C870 470 1060 545 1240 492 C1410 442 1510 470 1600 420"
            fill="none"
            stroke="rgba(255,255,255,.07)"
            strokeWidth="1"
          />

          {[
            [285, 375],
            [520, 315],
            [790, 260],
            [1030, 350],
            [1260, 220],
            [1435, 185],
          ].map(([x, y], index) => (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="28"
                fill="rgba(255,255,255,.025)"
                stroke="rgba(226,169,142,.16)"
              />
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="rgba(226,169,142,.48)"
              />
            </g>
          ))}

          <path
            d="M250 475 L390 420 L520 455 L650 395 L790 435 L930 380 L1030 425 L1180 360 L1260 390 L1435 320"
            fill="none"
            stroke="rgba(255,255,255,.045)"
            strokeWidth="1"
          />

          <path
            d="M210 520 L330 470 L450 520 L570 462 L690 515 L810 455 L940 505 L1080 440 L1240 500 L1400 435"
            fill="none"
            stroke="rgba(201,132,106,.10)"
            strokeWidth="1"
          />
        </svg>

        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#07090b] to-transparent" />
      </div>

      <Container className="relative z-10">
        <div className="flex flex-col gap-14 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/" className="inline-flex">
              <Image
                src="/arvo_logo.svg"
                alt="Arvo Protocol"
                width={220}
                height={44}
                className="h-11 w-auto"
              />
            </Link>

            <p className="mt-7 max-w-md text-base leading-7 text-white/60">
              Building a treasury through operating businesses and disciplined
              capital allocation.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="https://x.com/arvo_protocol"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Arvo on X"
                className="group inline-flex items-center gap-4 border border-white/12 bg-white/[0.035] px-5 py-4 transition duration-300 hover:border-[#e2a98e]/40 hover:bg-white/[0.06]"
              >
                <span className="flex h-10 w-10 items-center justify-center bg-white text-[#07090b] transition duration-300 group-hover:bg-[#e2a98e]">
                  <XIcon />
                </span>

                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                    Follow Arvo
                  </span>
                  <span className="mt-1 block text-sm font-medium text-white/85">
                    @arvo_protocol
                  </span>
                </span>
              </a>

              <a
                href="https://t.me/arvo_protocol"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join Arvo on Telegram"
                className="group inline-flex items-center gap-4 border border-white/12 bg-white/[0.035] px-5 py-4 transition duration-300 hover:border-[#e2a98e]/40 hover:bg-white/[0.06]"
              >
                <span className="flex h-10 w-10 items-center justify-center bg-white text-[#07090b] transition duration-300 group-hover:bg-[#e2a98e]">
                  <TelegramIcon />
                </span>

                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                    Join Telegram
                  </span>
                  <span className="mt-1 block text-sm font-medium text-white/85">
                    @arvo_protocol
                  </span>
                </span>
              </a>
            </div>

          </div>

          <div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-10 text-[15px] md:grid-cols-3 md:gap-x-16">
              {linkGroups.map((group) => (
                <div key={group.title}>
                  <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
                    {group.title}
                  </p>

                  <div className="flex flex-col gap-4">
                    {group.links.map(([label, href]) => (
                      <Link
                        key={label}
                        href={href}
                        className="text-white/62 transition hover:text-[#e2a98e]"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        <div className="mt-28 border-t border-white/[0.08] pt-7">
          <div className="flex flex-col gap-3 text-sm text-white/38 sm:flex-row sm:items-center sm:justify-between">
            <div>
              © {new Date().getFullYear()} Arvo. All rights reserved.
            </div>

            <div>Arvo · Registered entity 3-102-066975</div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
