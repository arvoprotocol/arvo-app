"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

const phases = [
  ["Foundation", "Legal structure, token infrastructure and Treasury framework."],
  ["First business", "Land acquisition, subdivision and auction-led sales model."],
  ["Treasury growth", "Operating profits support reserves, liquidity and future investment capacity."],
  ["Expansion", "Additional real estate ventures, software, AI and digital infrastructure."],
  ["Maturity", "Governance, reporting, staking and portfolio transparency."],
];

export function RoadmapPreview() {
  return (
    <section
      id="roadmap"
      className="relative overflow-hidden bg-[#fff9f5] py-36 text-[#07090b]"
    >
      <Container>
        <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.22em] text-black/45">
              Roadmap
            </p>

            <h2 className="text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.04em] md:text-7xl">
              A staged path, built with discipline.
            </h2>

            <p className="mt-7 max-w-xl text-xl leading-8 text-black/60">
              Arvo begins with a proven real estate operating model, then expands as the Treasury, governance and operating portfolio mature.
            </p>

            <div className="mt-10">
              <Button href="/roadmap" variant="dark">
                View roadmap
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-[10px] top-2 h-[calc(100%-16px)] w-px bg-black/12" />

            <div className="space-y-10">
              {phases.map(([title, text], index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: 32 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: 0.65,
                    delay: index * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="relative pl-14"
                >
                  <div className="absolute left-0 top-2 h-5 w-5 rounded-full border border-black/20 bg-[#fff9f5]">
                    <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c9846a]" />
                  </div>

                  <div className="text-sm font-medium text-black/35">
                    Phase {index + 1}
                  </div>

                  <h3 className="mt-2 text-3xl font-semibold tracking-[-0.015em]">
                    {title}
                  </h3>

                  <p className="mt-3 max-w-2xl text-base leading-7 text-black/56">
                    {text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}