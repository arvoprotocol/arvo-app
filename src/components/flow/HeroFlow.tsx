"use client";

import { motion } from "framer-motion";

const dots = Array.from({ length: 120 }).map((_, i) => {
  const angle = (i / 120) * Math.PI * 2;
  const band = i % 9;
  const radius = 24 + band * 12;

  return {
    x: 450 + Math.cos(angle) * radius,
    y: 450 + Math.sin(angle) * radius,
    delay: (i % 18) * 0.08,
    size: 0.8 + (i % 4) * 0.25,
  };
});

const waves = Array.from({ length: 18 }).map((_, i) => {
  const angle = (i / 18) * Math.PI * 2;
  const r1 = 48 + (i % 4) * 12;
  const r2 = 78 + (i % 5) * 10;

  return {
    x1: 450 + Math.cos(angle) * r1,
    y1: 450 + Math.sin(angle) * r1,
    x2: 450 + Math.cos(angle) * r2,
    y2: 450 + Math.sin(angle) * r2,
    delay: i * 0.08,
  };
});

export function HeroFlow() {
  return (
    <div className="pointer-events-none relative hidden h-[760px] w-full lg:block">
      <svg
        viewBox="0 0 900 900"
        className="absolute left-1/2 top-1/2 h-[980px] w-[980px] -translate-x-1/2 -translate-y-1/2"
      >
        <defs>
          <filter id="heroGlow">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="softHeroGlow">
            <feGaussianBlur stdDeviation="14" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <radialGradient id="core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e2a98e" stopOpacity=".26" />
            <stop offset="48%" stopColor="#8b5cf6" stopOpacity=".10" />
            <stop offset="72%" stopColor="#6C7A89" stopOpacity=".08" />
            <stop offset="100%" stopColor="#07090B" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="450" cy="450" r="285" fill="url(#core)" />
        <circle cx="450" cy="450" r="285" fill="none" stroke="rgba(255,255,255,.09)" strokeWidth="1" />
        <circle cx="450" cy="450" r="220" fill="none" stroke="rgba(255,255,255,.045)" strokeWidth="1" />
        <circle cx="450" cy="450" r="350" fill="none" stroke="rgba(201,143,115,.08)" strokeWidth="1" />

        <motion.g style={{ transformOrigin: "450px 450px" }}>
          <motion.circle
            cx="450"
            cy="450"
            r="132"
            fill="rgba(201,143,115,.04)"
            stroke="rgba(201,143,115,.12)"
            filter="url(#softHeroGlow)"
            animate={{
              r: [118, 142, 126, 154, 118],
              opacity: [0.38, 0.72, 0.5, 0.8, 0.38],
            }}
            transition={{
              duration: 5.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.circle
            cx="450"
            cy="450"
            r="82"
            fill="none"
            stroke="rgba(255,255,255,.08)"
            animate={{
              r: [76, 92, 80, 98, 76],
              opacity: [0.35, 0.8, 0.45, 0.9, 0.35],
            }}
            transition={{
              duration: 3.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {waves.map((wave, i) => (
            <motion.line
              key={i}
              x1={wave.x1}
              y1={wave.y1}
              x2={wave.x2}
              y2={wave.y2}
              stroke="rgba(226,169,142,.28)"
              strokeWidth="1.2"
              strokeLinecap="round"
              filter="url(#heroGlow)"
              animate={{
                opacity: [0.08, 0.7, 0.15],
                scale: [0.85, 1.18, 0.9],
              }}
              transition={{
                duration: 2.4 + (i % 4) * 0.25,
                delay: wave.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                transformOrigin: "450px 450px",
              }}
            />
          ))}

          {dots.map((dot, i) => (
            <motion.circle
              key={i}
              cx={dot.x}
              cy={dot.y}
              r={dot.size}
              fill="rgba(201,143,115,.42)"
              animate={{
                opacity: [0.12, 0.9, 0.18],
                scale: [0.7, 1.75, 0.8],
              }}
              transition={{
                duration: 2.6 + (i % 5) * 0.15,
                delay: dot.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.g>

        <motion.path
          d="M185 450 C215 250 395 160 575 235 C760 312 760 552 600 680 C430 810 235 675 210 520"
          fill="none"
          stroke="rgba(201,143,115,.30)"
          strokeWidth="1.4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.4, ease: "easeOut" }}
        />

        <motion.path
          d="M185 450 C215 250 395 160 575 235 C760 312 760 552 600 680 C430 810 235 675 210 520"
          fill="none"
          stroke="#e2a98e"
          strokeWidth="2.2"
          strokeLinecap="round"
          filter="url(#heroGlow)"
          strokeDasharray="42 680"
          animate={{ strokeDashoffset: [0, -720] }}
          transition={{ duration: 5.6, repeat: Infinity, ease: "linear" }}
        />

        {[
          [185, 450],
          [575, 235],
          [600, 680],
          [210, 520],
        ].map(([x, y], i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.5 + i * 0.12 }}
          >
            <circle cx={x} cy={y} r="42" fill="rgba(255,255,255,.035)" stroke="rgba(255,255,255,.12)" />
            <circle cx={x} cy={y} r="4.5" fill="#e2a98e" filter="url(#heroGlow)" />
          </motion.g>
        ))}
      </svg>
    </div>
  );
}