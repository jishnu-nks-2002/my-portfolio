"use client";



import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "motion/react";
import SplitText from "./SplitText";

/* ---------------- palette ("Signal" — same as AboutSection) ---------------- */
const INK = "#111318";
const MUTED = "#6B7280";
const COBALT = "#2C5CE8";
const AMBER = "#F5A623";
const BORDER = "#E5E7EB";

/* ---------------- looping headings (same effect as AboutSection) ---------------- */
const HEADINGS = [
  "Projects that ship and perform",
  "Ideas turned into real products",
  "Selected work, built with care",
];

const HEADING_HOLD_MS = 3200;

/* ---------------- data ---------------- */
interface Project {
  title: string;
  date: string;          // e.g. "DEC 2025"
  windowLabel: string;   // browser title bar text, e.g. "SOCIAL-ASSETS"
  description: string;   // small blurb shown on the right
  tech: string[];        // tech tags shown on the right
  video: string;         // /public path to the preview video
  link?: string;
}

const PROJECTS: Project[] = [
  {
    title: "E-commerce Storefront",
    date: "JUN 2026",
    windowLabel: "STOREFRONT",
    description:
      "Headless Shopify store with a custom checkout flow and motion-rich product pages.",
    tech: ["Next.js", "Shopify", "Tailwind"],
    video: "/video/projects/p-2.mp4",
    link: "#",
  },
  {
    title: "SaaS Dashboard",
    date: "MAR 2026",
    windowLabel: "DASHBOARD",
    description:
      "Analytics dashboard with real-time charts, role-based auth, and dark mode.",
    tech: ["React", "Node.js", "MongoDB"],
    video: "/video/projects/p-4.mp4",
    link: "#",
  },
  {
    title: "Social Assets",
    date: "DEC 2025",
    windowLabel: "SOCIAL-ASSETS",
    description:
      "Automated social creative pipeline that turns briefs into on-brand asset sets.",
    tech: ["Next.js", "Node.js", "Figma API"],
    video: "/video/projects/p-3.mp4",
    link: "#",
  },
  {
    title: "Booking Platform",
    date: "SEP 2025",
    windowLabel: "PICK-DATE",
    description:
      "Appointment booking app with payments, reminders, and a full admin panel.",
    tech: ["React", "Express", "MySQL"],
    video: "/video/projects/p-1.mp4",
    link: "#",
  },
];

/* ==================================================================
   One 3D card in the stack (video inside a browser-window frame)
   ================================================================== */
function ProjectCard({
  project,
  index,
  total,
  progress,
}: {
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  /* offset: 0 = active/centered, -1 = next (below), +1 = previous (above) */
  const offset = useTransform(progress, (v) => v * (total - 1) - index);

  const y = useTransform(offset, [-1.5, 0, 1.5], ["95%", "0%", "-95%"]);
  const rotateX = useTransform(offset, [-1.5, 0, 1.5], [72, 0, -72]);
  const scale = useTransform(offset, [-1.5, 0, 1.5], [0.7, 1, 0.7]);
  const opacity = useTransform(
    offset,
    [-1.4, -0.85, 0, 0.85, 1.4],
    [0, 0.35, 1, 0.35, 0]
  );

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{ y, rotateX, scale, opacity, transformStyle: "preserve-3d" }}
    >
      <a
        href={project.link ?? "#"}
        className="block w-[88vw] max-w-[600px]"
        aria-label={`View project: ${project.title}`}
      >
        {/* ------- browser window frame ------- */}
        <div
          className="rounded-2xl overflow-hidden bg-white
                     shadow-[0_30px_80px_-20px_rgba(17,19,24,0.28)]"
          style={{ border: `1px solid ${BORDER}` }}
        >
          {/* title bar */}
          <div
            className="relative flex items-center h-10 px-4"
            style={{ borderBottom: `1px solid ${BORDER}` }}
          >
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
              <span className="w-3 h-3 rounded-full bg-[#28C840]" />
            </div>
            <span
              className="absolute left-1/2 -translate-x-1/2 font-mono text-[11px]
                         font-semibold uppercase tracking-[0.35em]"
              style={{ color: MUTED }}
            >
              {project.windowLabel}
            </span>
          </div>

          {/* project VIDEO */}
          <div className="aspect-[16/10] bg-[#F1F2F4]">
            <video
              src={project.video}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </a>
    </motion.div>
  );
}

/* ==================================================================
   Main section
   ================================================================== */
export default function ProjectsShowcase() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [headingIndex, setHeadingIndex] = useState(0);

  /* looping heading — same mechanism as AboutSection */
  useEffect(() => {
    const interval = setInterval(() => {
      setHeadingIndex((prev) => (prev + 1) % HEADINGS.length);
    }, HEADING_HOLD_MS);
    return () => clearInterval(interval);
  }, []);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  /* keep the side panels in sync with the centered card */
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(
      PROJECTS.length - 1,
      Math.max(0, Math.round(v * (PROJECTS.length - 1)))
    );
    if (i !== activeIndex) setActiveIndex(i);
  });

  const active = PROJECTS[activeIndex];

  return (
    <section
      id="projects"
      className="relative w-full"
      style={{ background: "#FAFAFB" }}
    >
      {/* ---------------- heading (AboutSection style, looping) ---------------- */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 pt-16 md:pt-28 pb-4">
        

        {/* fixed min-height so the layout doesn't jump between headings */}
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
          Keep scrolling — each project flips into view.
        </p>
      </div>

      {/* ---------------- scroll track: N x 100vh ---------------- */}
      <div
        ref={trackRef}
        className="relative"
        style={{ height: `${PROJECTS.length * 100}vh` }}
      >
        {/* sticky 3D stage */}
        <div className="sticky top-0 h-screen overflow-hidden">

          {/* -------- LEFT: date + title + progress dots -------- */}
          <div className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 z-20 hidden md:block max-w-[210px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <p
                  className="font-mono text-xs font-semibold uppercase tracking-[0.35em]"
                  style={{ color: MUTED }}
                >
                  {active.date}
                </p>
                <h3
                  className="mt-2 text-xl md:text-2xl font-bold tracking-tight"
                  style={{ color: INK }}
                >
                  {active.title}
                </h3>
              </motion.div>
            </AnimatePresence>

            {/* progress dots */}
            <div className="mt-6 flex flex-col gap-2">
              {PROJECTS.map((p, i) => (
                <span
                  key={p.title}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === activeIndex ? 28 : 12,
                    background: i === activeIndex ? COBALT : BORDER,
                  }}
                />
              ))}
            </div>
          </div>

          {/* -------- RIGHT: small description + tech tags -------- */}
          <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-20 hidden md:block max-w-[240px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
              >
                <p
                  className="font-mono text-xs font-semibold uppercase tracking-[0.35em]"
                  style={{ color: AMBER }}
                >
                  Stack
                </p>

                {/* tech tags */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {active.tech.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        color: INK,
                        background: "rgba(17,19,24,0.04)",
                        border: `1px solid ${BORDER}`,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* small description */}
                <p
                  className="mt-4 text-sm leading-relaxed"
                  style={{ color: MUTED }}
                >
                  {active.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* -------- MOBILE: compact info bar (left/right panels are hidden) -------- */}
          <div className="absolute bottom-6 left-6 right-6 z-20 md:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="rounded-2xl bg-white/90 backdrop-blur px-4 py-3"
                style={{ border: `1px solid ${BORDER}` }}
              >
                <p
                  className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em]"
                  style={{ color: MUTED }}
                >
                  {active.date}
                </p>
                <h3 className="mt-0.5 text-base font-bold" style={{ color: INK }}>
                  {active.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed line-clamp-2" style={{ color: MUTED }}>
                  {active.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {active.tech.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{
                        color: INK,
                        background: "rgba(17,19,24,0.04)",
                        border: `1px solid ${BORDER}`,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* -------- CENTER: 3D card stack -------- */}
          <div className="absolute inset-0" style={{ perspective: "1400px" }}>
            {PROJECTS.map((project, i) => (
              <ProjectCard
                key={project.title}
                project={project}
                index={i}
                total={PROJECTS.length}
                progress={scrollYProgress}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}