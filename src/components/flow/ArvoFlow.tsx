"use client";

import { motion } from "framer-motion";

const nodes = [
  { label: "Businesses", x: 120, y: 250 },
  { label: "Treasury", x: 390, y: 90 },
  { label: "Allocation", x: 670, y: 250 },
  { label: "Growth", x: 390, y: 420 },
];

const paths = [
  "M160 235 C230 120 300 90 350 90",
  "M435 105 C520 110 600 170 635 225",
  "M640 280 C570 380 485 420 430 420",
  "M350 405 C260 385 190 320 155 275",
];

export function ArvoFlow() {
  return (
    <div className="relative mx-auto mt-16 w-full max-w-5xl">
      <svg viewBox="0 0 800 520" className="h-auto w-full overflow-visible">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {paths.map((d, index) => (
          <g key={d}>
            <motion.path
              d={d}
              fill="none"
              stroke="rgba(255,255,255,.16)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, delay: index * 0.25, ease: "easeOut" }}
            />
            <motion.path
              d={d}
              fill="none"
              stroke="#e2a98e"
              strokeWidth="1.6"
              strokeLinecap="round"
              filter="url(#glow)"
              strokeDasharray="30 420"
              animate={{ strokeDashoffset: [0, -450] }}
              transition={{ duration: 4.8, delay: index * 0.35, repeat: Infinity, ease: "linear" }}
            />
          </g>
        ))}

        {nodes.map((node, index) => (
          <motion.g
            key={node.label}
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.5 + index * 0.12 }}
          >
            <circle cx={node.x} cy={node.y} r="54" fill="rgba(255,255,255,.045)" stroke="rgba(255,255,255,.14)" />
            <circle cx={node.x} cy={node.y} r="4" fill="#e2a98e" />
            <text
              x={node.x}
              y={node.y + 82}
              textAnchor="middle"
              fill="rgba(255,255,255,.78)"
              fontSize="16"
              fontWeight="600"
            >
              {node.label}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
