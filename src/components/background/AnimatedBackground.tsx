"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(201,143,115,.22),transparent_38%),linear-gradient(to_bottom,#07090b,#090c11_60%,#0c1016)]" />

      <motion.div
        animate={{ opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:80px_80px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]"
      />

      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.14, 0.22, 0.14] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-[12%] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-[#e2a98e]/20 blur-[150px]"
      />

      <svg className="absolute left-1/2 top-[18%] h-[560px] w-[1100px] -translate-x-1/2 opacity-80" viewBox="0 0 1100 560" fill="none">
        {[
          "M80 390C260 120 430 470 560 250C690 30 840 260 1020 110",
          "M110 230C290 360 380 60 570 210C760 360 820 190 1010 310",
          "M170 470C340 270 460 330 610 160C760 0 900 150 1040 60",
        ].map((d, i) => (
          <motion.path
            key={d}
            d={d}
            stroke={i === 1 ? "rgba(255,255,255,.42)" : "#e2a98e"}
            strokeWidth="1.2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0.35, 0.8, 0.35] }}
            transition={{
              pathLength: { duration: 2.2, delay: i * 0.35, ease: "easeOut" },
              opacity: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            }}
          />
        ))}
      </svg>
    </div>
  );
}
