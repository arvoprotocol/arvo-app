"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./story.css";

gsap.registerPlugin(ScrollTrigger);

export default function Story() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const businessRef = useRef<HTMLDivElement>(null);
  const treasuryRef = useRef<HTMLDivElement>(null);
  const chainRef = useRef<HTMLDivElement>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const pulseRef = useRef<SVGCircleElement>(null);

  const paragraphRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.set(
        [
          treasuryRef.current,
          chainRef.current,
          paragraphRef.current,
        ],
        {
          opacity: 0,
          y: 60,
        }
      );

      gsap.set(svgRef.current, {
        opacity: 0,
      });

      // Timeline added in Part 2

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="story">

      <div className="story-background" />

      <div ref={wrapperRef} className="story-wrapper">

        <div className="story-heading">

          <div ref={businessRef} className="story-word">
            <h2>Businesses</h2>
            <p>Create value.</p>
          </div>

          <div ref={treasuryRef} className="story-word">
            <h2>Treasury</h2>
            <p>Compounds value.</p>
          </div>

          <div ref={chainRef} className="story-word">
            <h2>Blockchain</h2>
            <p>Makes it transparent.</p>
          </div>

        </div>

        <svg
          ref={svgRef}
          className="story-line"
          viewBox="0 0 1200 220"
          preserveAspectRatio="none"
        >
          <path
            ref={pathRef}
            d="
              M120 110
              C260 110 260 110 420 110
              S580 110 720 110
              S880 110 1080 110
            "
          />

          <circle
            ref={pulseRef}
            r="7"
            cx="120"
            cy="110"
          />
        </svg>

        <p
          ref={paragraphRef}
          className="story-paragraph"
        >
          Arvo combines productive businesses, disciplined capital allocation and
          transparent blockchain infrastructure into one long-term investment
          model.
        </p>

      </div>

    </section>
  );
}