"use client";

/*
  ProjectsSection.jsx
  -------------------
  Projects grid built with your components:
  - SplitText        -> left-aligned section heading
  - RotatingText     -> looping accent word inside the heading
  - TiltedVideoCard  -> 3D-tilt cards playing project VIDEOS on hover
  - PressButton      -> "View all projects" CTA

  Palette + layout match the "Signal" AboutSection (cobalt/amber, #FAFAFB).

  Put your project preview videos in /public/video/projects/ and update
  the PROJECTS array below.
*/

import PressButton from "./PressButton";
import SplitText from "./SplitText";
import RotatingText from "./RotatingText";
import TiltedVideoCard from "./TiltedVideoCard";

// "Signal" palette
const INK = "#111318";
const MUTED = "#6B7280";
const COBALT = "#2C5CE8";
const AMBER = "#F5A623";
const BORDER = "#E5E7EB";

const PROJECTS = [
  {
    title: "E-commerce Storefront",
    description: "Headless Shopify store with custom checkout flow and motion-rich product pages.",
    tech: ["Next.js", "Shopify", "Tailwind"],
    video: "/video/projects/project-1.mp4",
    link: "#",
  },
  {
    title: "SaaS Dashboard",
    description: "Analytics dashboard with real-time charts, role-based auth, and dark mode.",
    tech: ["React", "Node.js", "MongoDB"],
    video: "/video/projects/project-2.mp4",
    link: "#",
  },
  {
    title: "Portfolio Engine",
    description: "CMS-driven portfolio builder for creatives with drag-and-drop sections.",
    tech: ["Next.js", "WordPress", "GSAP"],
    video: "/video/projects/project-3.mp4",
    link: "#",
  },
  {
    title: "Booking Platform",
    description: "Appointment booking app with payments, reminders, and an admin panel.",
    tech: ["React", "Express", "MySQL"],
    video: "/video/projects/project-4.mp4",
    link: "#",
  },
];

export default function ProjectsSection() {
  return (
    <section
      id="projects"
      className="relative w-full overflow-hidden"
      style={{ background: "#FAFAFB" }}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12 py-16 md:py-28">

        {/* ---------------- header row ---------------- */}
        <div className="flex flex-col gap-4 mb-12 md:mb-16">
          <span
            className="inline-block w-fit px-4 py-1.5 rounded-full text-sm font-semibold"
            style={{
              color: COBALT,
              background: "rgba(44,92,232,0.08)",
              border: `1px solid ${BORDER}`,
            }}
          >
            Projects
          </span>

          {/* SplitText heading + RotatingText accent word */}
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <SplitText
              text="Things I've"
              tag="h2"
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] text-[#111318]"
              textAlign="left"
              splitType="words"
              from={{ opacity: 0, y: 32 }}
              to={{ opacity: 1, y: 0 }}
              duration={1}
              delay={40}
              ease="power3.out"
            />
            <RotatingText
              texts={["built", "shipped", "designed", "launched"]}
              rotationInterval={2400}
              staggerDuration={0.02}
              mainClassName="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]
                             px-4 py-1 rounded-xl overflow-hidden"
              style={{ color: "#fff", background: COBALT }}
              splitLevelClassName="overflow-hidden"
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            />
          </div>

          <p className="text-base md:text-lg max-w-xl" style={{ color: MUTED }}>
            A few projects I&apos;m proud of — hover a card to play its preview.
          </p>
        </div>

        {/* ---------------- projects grid ---------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-14">
          {PROJECTS.map((project) => (
            <a
              key={project.title}
              href={project.link}
              className="group block"
              aria-label={`View project: ${project.title}`}
            >
              {/* tilted VIDEO card */}
              <TiltedVideoCard
                videoSrc={project.video}
                captionText={project.title}
                containerHeight="320px"
                containerWidth="100%"
                videoHeight="320px"
                videoWidth="100%"
                rotateAmplitude={10}
                scaleOnHover={1.05}
                playOnHover={true}
                showTooltip={true}
                displayOverlayContent={true}
                overlayContent={
                  /* gradient + title pinned to the card, floats at translateZ(30px) */
                  <div
                    className="w-full h-full rounded-[15px] flex items-end p-5 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(17,19,24,0.55), rgba(17,19,24,0) 45%)",
                    }}
                  >
                    <span className="text-white font-semibold text-lg drop-shadow">
                      {project.title}
                    </span>
                  </div>
                }
              />

              {/* card meta below the video */}
              <div className="mt-5 px-1">
                <div className="flex items-center justify-between gap-4">
                  <h3
                    className="text-xl font-bold tracking-tight transition-colors duration-200 group-hover:text-[#2C5CE8]"
                    style={{ color: INK }}
                  >
                    {project.title}
                  </h3>
                  <span
                    className="text-sm font-semibold shrink-0 translate-x-0 transition-transform duration-200 group-hover:translate-x-1"
                    style={{ color: COBALT }}
                  >
                    View →
                  </span>
                </div>

                <p className="mt-1.5 text-sm md:text-base leading-relaxed" style={{ color: MUTED }}>
                  {project.description}
                </p>

                {/* tech tags */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tech.map((t) => (
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
              </div>
            </a>
          ))}
        </div>

        {/* ---------------- CTA ---------------- */}
        <div className="mt-16 flex justify-center">
          <PressButton href="#contact">
            Have a project in mind?
          </PressButton>
        </div>
      </div>
    </section>
  );
}