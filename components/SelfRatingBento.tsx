"use client";

/*
  SelfRatingBento.tsx
  -------------------
  "How I rate myself" section built on the MagicBento effect system
  (particles, global spotlight, border glow, tilt, magnetism, click
  ripple) but fully re-themed to your "Signal" palette and typography
  from ProjectsShowcase / AboutSection:

  - Light #FAFAFB section, white cards, hairline #E5E7EB borders
  - Cobalt (#2C5CE8) glow/spotlight/particles, amber accents
  - Same looping SplitText heading effect + pill badge
  - Each card = a skill with a big score, star row, description,
    and an animated progress bar that fills when the card scrolls in

  Requires: gsap (already installed) + your ./SplitText component.
*/

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import { gsap } from "gsap";
import SplitText from "./SplitText";

/* ---------------- palette ("Signal") ---------------- */
const INK = "#111318";
const MUTED = "#6B7280";
const COBALT = "#2C5CE8";
const AMBER = "#F5A623";
const BORDER = "#E5E7EB";

/* cobalt as "r, g, b" for the glow system */
const GLOW_RGB = "44, 92, 232";

const DEFAULT_PARTICLE_COUNT = 10;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const MOBILE_BREAKPOINT = 768;

/* ---------------- looping headings (same effect as ProjectsShowcase) ---------------- */
const HEADINGS = [
  "How I rate myself",
  "Honest scores, no fluff",
  "What I bring to the table",
];
const HEADING_HOLD_MS = 3200;

/* ---------------- data: my self-ratings ---------------- */
interface RatingCard {
  label: string;        // eyebrow, e.g. "CORE"
  title: string;        // skill name
  description: string;  // one-liner
  score: number;        // 0–100
}

const RATINGS: RatingCard[] = [
  {
    label: "Core",
    title: "Frontend Development",
    description: "React, Next.js, TypeScript — pixel-accurate and fast.",
    score: 95,
  },
  {
    label: "Server",
    title: "Backend & APIs",
    description: "Node.js, Express, REST — clean, documented endpoints.",
    score: 88,
  },
  {
    label: "Craft",
    title: "UI/UX & Motion",
    description:
      "GSAP, Motion, micro-interactions — interfaces that feel alive, not just look good.",
    score: 92,
  },
  {
    label: "Commerce",
    title: "Shopify & WordPress",
    description:
      "Headless storefronts, custom themes, and CMS builds that clients can actually manage themselves.",
    score: 90,
  },
  {
    label: "Data",
    title: "Databases",
    description: "MongoDB, MySQL — schemas that scale with the product.",
    score: 85,
  },
  {
    label: "Human",
    title: "Communication",
    description: "Clear updates, honest estimates, no surprises.",
    score: 96,
  },
];

/* ---------------- score -> star count (out of 5) ---------------- */
const toStars = (score: number) => Math.round((score / 100) * 10) / 2; // e.g. 4.5

/* ==================================================================
   helpers (adapted from MagicBento)
   ================================================================== */
const createParticleElement = (x: number, y: number): HTMLDivElement => {
  const el = document.createElement("div");
  el.className = "particle";
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${GLOW_RGB}, 1);
    box-shadow: 0 0 6px rgba(${GLOW_RGB}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75,
});

const updateCardGlowProperties = (
  card: HTMLElement,
  mouseX: number,
  mouseY: number,
  glow: number,
  radius: number
) => {
  const rect = card.getBoundingClientRect();
  card.style.setProperty("--glow-x", `${((mouseX - rect.left) / rect.width) * 100}%`);
  card.style.setProperty("--glow-y", `${((mouseY - rect.top) / rect.height) * 100}%`);
  card.style.setProperty("--glow-intensity", glow.toString());
  card.style.setProperty("--glow-radius", `${radius}px`);
};

/* ==================================================================
   ParticleCard (hover particles + tilt + magnetism + click ripple)
   ================================================================== */
const ParticleCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  disableAnimations?: boolean;
  style?: React.CSSProperties;
  particleCount?: number;
  enableTilt?: boolean;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}> = ({
  children,
  className = "",
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = true,
  clickEffect = true,
  enableMagnetism = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef<HTMLDivElement[]>([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;
    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height)
    );
    particlesInitialized.current = true;
  }, [particleCount]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => particle.parentNode?.removeChild(particle),
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;
    if (!particlesInitialized.current) initializeParticles();

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const clone = particle.cloneNode(true) as HTMLDivElement;
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(
          clone,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
        );
        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: "none",
          repeat: -1,
          yoyo: true,
        });
        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
        });
      }, index * 100);

      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;
    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();
      if (enableTilt) {
        gsap.to(element, {
          rotateX: 4,
          rotateY: 4,
          duration: 0.3,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();
      if (enableTilt) {
        gsap.to(element, { rotateX: 0, rotateY: 0, duration: 0.3, ease: "power2.out" });
      }
      if (enableMagnetism) {
        gsap.to(element, { x: 0, y: 0, duration: 0.3, ease: "power2.out" });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!enableTilt && !enableMagnetism) return;
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        gsap.to(element, {
          rotateX: ((y - centerY) / centerY) * -8,
          rotateY: ((x - centerX) / centerX) * 8,
          duration: 0.1,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }
      if (enableMagnetism) {
        magnetismAnimationRef.current = gsap.to(element, {
          x: (x - centerX) * 0.05,
          y: (y - centerY) * 0.05,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!clickEffect) return;
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${GLOW_RGB}, 0.30) 0%, rgba(${GLOW_RGB}, 0.15) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;
      element.appendChild(ripple);
      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        { scale: 1, opacity: 0, duration: 0.8, ease: "power2.out", onComplete: () => ripple.remove() }
      );
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("click", handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("click", handleClick);
      clearAllParticles();
    };
  }, [animateParticles, clearAllParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect]);

  return (
    <div
      ref={cardRef}
      className={`${className} relative overflow-hidden`}
      style={{ ...style, position: "relative", overflow: "hidden" }}
    >
      {children}
    </div>
  );
};

/* ==================================================================
   GlobalSpotlight (cobalt, tuned for a LIGHT background)
   ================================================================== */
const GlobalSpotlight: React.FC<{
  gridRef: React.RefObject<HTMLDivElement | null>;
  disableAnimations?: boolean;
  spotlightRadius?: number;
}> = ({ gridRef, disableAnimations = false, spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS }) => {
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current) return;

    const spotlight = document.createElement("div");
    spotlight.style.cssText = `
      position: fixed;
      width: 700px;
      height: 700px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${GLOW_RGB}, 0.10) 0%,
        rgba(${GLOW_RGB}, 0.05) 25%,
        rgba(${GLOW_RGB}, 0.02) 45%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current || !gridRef.current) return;

      const section = gridRef.current.closest(".rating-bento-section");
      const rect = section?.getBoundingClientRect();
      const mouseInside =
        rect &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      const cards = gridRef.current.querySelectorAll(".card");

      if (!mouseInside) {
        gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: "power2.out" });
        cards.forEach((card) =>
          (card as HTMLElement).style.setProperty("--glow-intensity", "0")
        );
        return;
      }

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach((card) => {
        const cardElement = card as HTMLElement;
        const cardRect = cardElement.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(e.clientX - centerX, e.clientY - centerY) -
          Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);
        minDistance = Math.min(minDistance, effectiveDistance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) glowIntensity = 1;
        else if (effectiveDistance <= fadeDistance)
          glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);

        updateCardGlowProperties(cardElement, e.clientX, e.clientY, glowIntensity, spotlightRadius);
      });

      gsap.to(spotlightRef.current, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.1,
        ease: "power2.out",
      });

      const targetOpacity =
        minDistance <= proximity
          ? 0.9
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.9
            : 0;

      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.5,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gridRef.current
        ?.querySelectorAll(".card")
        .forEach((card) => (card as HTMLElement).style.setProperty("--glow-intensity", "0"));
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: "power2.out" });
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations, spotlightRadius]);

  return null;
};

/* ==================================================================
   Animated progress bar (fills to the score when scrolled into view)
   ================================================================== */
const ScoreBar: React.FC<{ score: number }> = ({ score }) => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(el, { width: `${score}%`, duration: 1.2, ease: "power3.out", delay: 0.15 });
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [score]);

  return (
    <div
      className="w-full h-1.5 rounded-full overflow-hidden"
      style={{ background: "rgba(17,19,24,0.06)" }}
    >
      <div
        ref={barRef}
        className="h-full rounded-full"
        style={{
          width: "0%",
          background: `linear-gradient(90deg, ${COBALT}, ${AMBER})`,
        }}
      />
    </div>
  );
};

/* ---------------- star row ---------------- */
const Stars: React.FC<{ score: number }> = ({ score }) => {
  const stars = toStars(score); // e.g. 4.5
  return (
    <div className="flex gap-0.5" aria-label={`${stars} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.floor(stars);
        const half = !filled && i - 0.5 <= stars;
        return (
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <defs>
              <linearGradient id={`half-${i}-${score}`}>
                <stop offset="50%" stopColor={AMBER} />
                <stop offset="50%" stopColor="rgba(17,19,24,0.12)" />
              </linearGradient>
            </defs>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"
              fill={filled ? AMBER : half ? `url(#half-${i}-${score})` : "rgba(17,19,24,0.12)"}
            />
          </svg>
        );
      })}
    </div>
  );
};

/* ---------------- mobile detection ---------------- */
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return isMobile;
};

/* ==================================================================
   Main section
   ================================================================== */
export default function SelfRatingBento() {
  const gridRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileDetection();
  const disableAnimations = isMobile;

  const [headingIndex, setHeadingIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setHeadingIndex((prev) => (prev + 1) % HEADINGS.length);
    }, HEADING_HOLD_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="ratings"
      className="rating-bento-section relative w-full overflow-hidden"
      style={{ background: "#FAFAFB" }}
    >
      <style>{`
        .rating-bento-grid {
          --glow-x: 50%;
          --glow-y: 50%;
          --glow-intensity: 0;
          --glow-radius: 200px;
        }
        .rating-bento-grid .card--border-glow::after {
          content: '';
          position: absolute;
          inset: 0;
          padding: 5px;
          background: radial-gradient(var(--glow-radius) circle at var(--glow-x) var(--glow-y),
              rgba(${GLOW_RGB}, calc(var(--glow-intensity) * 0.7)) 0%,
              rgba(${GLOW_RGB}, calc(var(--glow-intensity) * 0.35)) 30%,
              transparent 60%);
          border-radius: inherit;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          pointer-events: none;
          transition: opacity 0.3s ease;
          z-index: 1;
        }
        .rating-bento-grid .card--border-glow:hover {
          box-shadow: 0 10px 30px rgba(17,19,24,0.08), 0 0 30px rgba(${GLOW_RGB}, 0.12);
        }
        .rating-bento-grid .card {
          grid-column: span 12;
        }
        @media (min-width: 640px) {
          .rating-bento-grid .card { grid-column: span 6; }
        }
        @media (min-width: 1024px) {
          /* bento pattern that fills every 12-col row completely — no gaps:
             row 1: 8 + 4  |  row 2: 4 + 8  |  row 3: 6 + 6 */
          .rating-bento-grid .card:nth-child(1) { grid-column: span 8; }
          .rating-bento-grid .card:nth-child(2) { grid-column: span 4; }
          .rating-bento-grid .card:nth-child(3) { grid-column: span 4; }
          .rating-bento-grid .card:nth-child(4) { grid-column: span 8; }
          .rating-bento-grid .card:nth-child(5) { grid-column: span 6; }
          .rating-bento-grid .card:nth-child(6) { grid-column: span 6; }
        }
      `}</style>

      <GlobalSpotlight gridRef={gridRef} disableAnimations={disableAnimations} />

      <div className="mx-auto max-w-7xl px-6 md:px-12 py-16 md:py-28">

        {/* ---------------- heading (ProjectsShowcase style, looping) ---------------- */}
        <div className="mb-12 md:mb-16">
         
          <div className="relative mt-4 min-h-[2.4em] md:min-h-[2.3em]">
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

          <p className="mt-3 text-base md:text-lg max-w-xl" style={{ color: MUTED }}>
            My honest self-assessment — hover a card and watch it come alive.
          </p>
        </div>

        {/* ---------------- bento grid ---------------- */}
        <div ref={gridRef} className="rating-bento-grid grid grid-cols-12 gap-4 md:gap-5">
          {RATINGS.map((card) => (
            <ParticleCard
              key={card.title}
              disableAnimations={disableAnimations}
              className="card card--border-glow flex flex-col justify-between min-h-[210px] p-6 rounded-[20px] bg-white
                         transition-all duration-300 ease-in-out hover:-translate-y-0.5"
              style={{
                border: `1px solid ${BORDER}`,
                boxShadow: "0 4px 16px rgba(17,19,24,0.04)",
              }}
            >
              {/* header: eyebrow + stars */}
              <div className="relative z-[2] flex items-start justify-between gap-3">
                <span
                  className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em]"
                  style={{ color: MUTED }}
                >
                  {card.label}
                </span>
                <Stars score={card.score} />
              </div>

              {/* body: big score + title + description + bar */}
              <div className="relative z-[2] mt-6">
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-4xl md:text-5xl font-bold tracking-tight"
                    style={{ color: INK }}
                  >
                    {card.score}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: COBALT }}>
                    / 100
                  </span>
                </div>

                <h3
                  className="mt-2 text-lg md:text-xl font-bold tracking-tight"
                  style={{ color: INK }}
                >
                  {card.title}
                </h3>

                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: MUTED }}>
                  {card.description}
                </p>

                <div className="mt-4">
                  <ScoreBar score={card.score} />
                </div>
              </div>
            </ParticleCard>
          ))}
        </div>
      </div>
    </section>
  );
}