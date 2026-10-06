"use client";

import { motion } from "framer-motion";

const lines = ["A Treasury", "Built on Real", "Businesses."];

export function AnimatedHeadline() {
  return (
    <h1 className="text-balance text-[4.25rem] font-semibold leading-[0.9] tracking-[-0.04em] md:text-[6.75rem] xl:text-[7.15rem]">
      {lines.map((line, index) => (
        <span key={line} className="block overflow-visible pb-2">
          <motion.span
            className="block origin-left"
            initial={{ y: 34, opacity: 0, filter: "blur(8px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            transition={{
              duration: 0.9,
              delay: 0.18 + index * 0.14,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </h1>
  );
}