"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";

const steps = [
  ["Operating Businesses", "Generate operating profit"],
  ["Treasury", "Receives distributable profits"],
  ["Capital Allocation", "Funds acquisitions, liquidity and staking"],
  ["Future Investments", "Expands the operating portfolio"],
];

const points = [
  [145, 345],
  [430, 115],
  [715, 345],
  [430, 575],
];

const labelOffsets = [
  [0, 118],
  [0, 118],
  [0, 118],
  [0, 118],
];

const path =
  "M145 345 C145 135 430 115 430 115 C650 115 715 220 715 345 C715 520 560 575 430 575 C255 575 145 500 145 345Z";

export function Flywheel() {
  return (
    <section
      id="flywheel"
      className="relative overflow-hidden bg-[#fbf4ef] py-28 text-[#07090b] md:py-44"
    >
      <style jsx>{`
        @keyframes flywheelOrbit {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -798;
          }
        }

        @keyframes flywheelPulse {
          0%,
          100% {
            opacity: 0.72;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.06);
          }
        }

        .flywheel-orbit {
          animation: flywheelOrbit 7.5s linear infinite;
        }

        .flywheel-core {
          transform-box: fill-box;
          transform-origin: center;
          animation: flywheelPulse 5.5s ease-in-out infinite;
        }
      `}</style>

      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_45%,rgba(201,132,106,.10),transparent_36%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_50%,rgba(139,92,246,.07),transparent_34%)]" />
      </div>

      <Container className="relative z-10">
        <div className="grid items-center gap-14 lg:grid-cols-[0.34fr_0.66fr] lg:gap-16">
          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-black/45 md:mb-6">
              Investment Process
            </p>

            <h2 className="text-balance text-4xl font-semibold tracking-[-0.04em] md:text-7xl">
              The capital cycle.
            </h2>

            <p className="mt-6 max-w-md text-lg leading-8 text-black/60 md:mt-8 md:text-xl">
             Capital is allocated into operating businesses. Distributable profits strengthen the Treasury and can be used for future investments, liquidity, staking rewards and token buybacks.
            </p>
          </div>

          {/* Mobile flywheel */}
          <div className="relative lg:hidden">
            <div className="absolute left-6 top-8 h-[calc(100%-72px)] w-px bg-black/10" />

            <div className="space-y-5">
              {steps.map(([title, text], i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="relative pl-16"
                >
                  <div className="absolute left-0 top-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/55 shadow-[0_16px_45px_rgba(7,9,11,.08)]">
                    <motion.span
                      className="h-2.5 w-2.5 rounded-full bg-[#cf9578]"
                      animate={{ scale: [1, 1.45, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeInOut",
                      }}
                    />
                  </div>

                  <div className="rounded-[28px] border border-white/70 bg-white/50 p-6 shadow-[0_20px_70px_rgba(7,9,11,.08)] backdrop-blur">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-black/35">
                      Step {i + 1}
                    </div>
                    <h3 className="text-2xl font-semibold tracking-[-0.02em]">
                      {title}
                    </h3>
                    <p className="mt-2 text-base leading-7 text-black/58">
                      {text}
                    </p>
                  </div>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: 0.34 }}
                className="relative pl-16"
              >
                <div className="rounded-[28px] border border-[#cf9578]/20 bg-[#cf9578]/10 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-black/45">
                    Ongoing Growth
                  </p>
                  <p className="mt-2 text-lg font-medium leading-7 text-black/70">
                    Profits strengthen the Treasury, creating more capital for
                    future acquisitions and long-term allocation.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Desktop flywheel */}
          <div className="relative hidden min-h-[760px] lg:block lg:min-h-[840px]">
            <svg
              viewBox="0 0 860 720"
              className="absolute inset-0 h-full w-full overflow-visible"
            >
              <defs>
                <radialGradient id="flywheelCore" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#cf9578" stopOpacity="0.16" />
                  <stop offset="55%" stopColor="#8b5cf6" stopOpacity="0.07" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
              </defs>

              <circle
                cx="430"
                cy="360"
                r="165"
                fill="url(#flywheelCore)"
                className="flywheel-core"
              />

              <path
                d={path}
                fill="none"
                stroke="rgba(7,9,11,.14)"
                strokeWidth="2"
              />

              <path
                d={path}
                fill="none"
                stroke="#cf9578"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeDasharray="38 760"
                className="flywheel-orbit"
              />

              {steps.map(([title, text], i) => {
                const [x, y] = points[i];
                const [labelX, labelY] = labelOffsets[i];

                return (
                  <g key={title}>
                    <circle cx={x} cy={y} r="108" fill="#cf9578" opacity="0.055" />

                    <circle
                      cx={x}
                      cy={y}
                      r="74"
                      fill="rgba(255,255,255,.34)"
                      stroke="rgba(255,255,255,.9)"
                      strokeWidth="1.5"
                    />

                    <circle
                      cx={x}
                      cy={y}
                      r="48"
                      fill="rgba(255,255,255,.88)"
                    />

                    <circle
                      cx={x}
                      cy={y}
                      r="22"
                      fill="rgba(255,255,255,.74)"
                    />

                    <circle cx={x} cy={y} r="6" fill="#cf9578" opacity="0.9" />

                    <rect
                      x={x + labelX - 165}
                      y={y + labelY - 38}
                      width="330"
                      height="92"
                      rx="22"
                      fill="#fbf4ef"
                      opacity="0.94"
                    />

                    <text
                      x={x + labelX}
                      y={y + labelY}
                      textAnchor="middle"
                      fontSize="24"
                      fontWeight="700"
                      fill="#07090b"
                    >
                      {title}
                    </text>

                    <text
                      x={x + labelX}
                      y={y + labelY + 30}
                      textAnchor="middle"
                      fontSize="14"
                      fill="rgba(7,9,11,.56)"
                    >
                      {text}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </Container>
    </section>
  );
}