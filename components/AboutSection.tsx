"use client";

import { useEffect, useRef, useState } from "react";
import PressButton from "./PressButton";
import SplitText from "./SplitText";

// "Signal" palette — cobalt + amber on soft white (matches VideoSection)
const INK = "#111318"; // headings
const MUTED = "#6B7280"; // secondary text
const COBALT = "#2C5CE8"; // primary accent
const AMBER = "#F5A623"; // secondary accent
const BORDER = "#E5E7EB"; // hairline / glass border

// Neutral graphite tone lifted from the video's own background
const VIDEO_BG = "#B9BCC2";

// Headings the SplitText will loop through
const HEADINGS = [
  "I build interfaces that feel alive",
  "I craft experiences that feel human",
  "I turn ideas into interactive products",
];

const HEADING_HOLD_MS = 3200; // how long each heading stays before switching

export default function AboutSection() {
  const [headingIndex, setHeadingIndex] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeadingIndex((prev) => (prev + 1) % HEADINGS.length);
    }, HEADING_HOLD_MS);

    return () => clearInterval(interval);
  }, []);

  // Make sure the video actually starts looping/playing on mount
  useEffect(() => {
    const vid = videoRef.current;
    if (vid) {
      vid.play().catch(() => {
        // Autoplay was blocked — user interaction will trigger play later
      });
    }
  }, []);

  return (
    <section
      id="about"
      className="relative w-full overflow-hidden"
      style={{ background: "#FAFAFB" }}
    >
      {/* ---------- padding around the whole section + centered container ---------- */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 py-16 md:py-28">
        {/* items-stretch -> both columns share the same height (set by the video) */}
        <div className="relative grid grid-cols-1 md:grid-cols-[minmax(0,42%)_1fr] items-stretch gap-10 md:gap-16">

          {/* LEFT — video panel (this sets the row height on md+) */}
          <div
            className="relative w-full h-[420px] sm:h-[400px] md:h-[480px] lg:h-[700px]
                       overflow-hidden rounded-3xl"
            style={{ background: VIDEO_BG, border: `1px solid ${BORDER}` }}
          >
            <video
              ref={videoRef}
              src="/video/my-about-1.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              aria-label="Portrait video of Jishnu"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Soft gradient so the panel blends instead of ending on a hard edge */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(to top, rgba(17,19,24,0.35), rgba(17,19,24,0) 30%)",
              }}
            />
          </div>

          {/* RIGHT — content: h-full + justify-between spreads the content
              across the SAME height as the video panel */}
          <div className="relative h-full flex flex-col justify-between gap-10 py-2 md:py-4">
            {/* Ambient cobalt/amber glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              
            />

            {/* ---- top group: looping heading ---- */}
            <div className="relative min-h-[5em] md:min-h-[4.6em]">
              <SplitText
                key={headingIndex}
                text={HEADINGS[headingIndex]}
                tag="h2"
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl
                           font-bold tracking-tight leading-[1.05] text-[#111318]"
                textAlign="left"
                splitType="words"
                from={{ opacity: 0, y: 32 }}
                to={{ opacity: 1, y: 0 }}
                duration={1}
                delay={40}
                ease="power3.out"
              />
            </div>

            {/* ---- bottom group: text + facts + CTA ----
                mt-auto keeps this anchored toward the bottom, and the
                space-y utilities give clear gaps between each block */}
            <div className="relative mt-auto space-y-8">
              {/* extra breathing room between heading and this paragraph
                  comes from justify-between + the gap above */}
              <p
                className="text-base md:text-lg leading-relaxed max-w-xl"
                style={{ color: MUTED }}
              >
                I&apos;m Jishnu, a full stack developer who cares as much about how
                a product feels to use as how it&apos;s built underneath. I spend
                my time bridging clean engineering with motion, detail, and
                craft — turning static screens into something that responds to
                you.
              </p>

              {/* Small facts row */}
              <div className="flex flex-wrap gap-8">
                <div>
                  <p className="text-2xl font-bold" style={{ color: INK }}>
                    20+
                  </p>
                  <p className="text-sm" style={{ color: MUTED }}>
                    Projects shipped
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: INK }}>
                    Next.js
                  </p>
                  <p className="text-sm" style={{ color: MUTED }}>
                    Primary stack
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: AMBER }}>
                    Remote
                  </p>
                  <p className="text-sm" style={{ color: MUTED }}>
                    Open to work
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-2">
                <PressButton href="#contact">Let&apos;s work together</PressButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}