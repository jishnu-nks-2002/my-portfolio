"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import RotatingText from "./RotatingText";
import MagicRings from "./MagicRings";

gsap.registerPlugin(ScrollTrigger);

// "Signal" palette — cobalt + amber on soft white
const INK = "#111318"; // headings
const MUTED = "#6B7280"; // secondary text
const COBALT = "#2C5CE8"; // primary accent
const AMBER = "#F5A623"; // secondary accent
const BORDER = "#E5E7EB"; // hairline / glass border

export default function VideoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const ringsRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Tracks whether the video is currently muted, drives the toggle button UI
  const [isMuted, setIsMuted] = useState(true);

  // Tracks pointer position + hover state so the button can act like a
  // custom cursor that follows the mouse while it's over the video
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Tracks whether the video has reached its "expanded / playing" stage at
  // least once, so the IntersectionObserver knows whether it's allowed to
  // resume playback when the section scrolls back into view.
  const hasExpandedRef = useRef(false);

  // Tracks whether the section is currently intersecting the viewport at
  // all, read by the scrub timeline's onComplete so it doesn't auto-play if
  // the user has already scrolled past by the time that callback fires.
  const isInViewRef = useRef(true);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleVideoMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleVideoMouseEnter = () => setIsHovering(true);
  const handleVideoMouseLeave = () => setIsHovering(false);

  useEffect(() => {
    // Smooths out scroll jitter across trackpads / mobile browsers
    ScrollTrigger.normalizeScroll(true);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          // A numeric scrub (instead of `true`) adds inertia: the animation
          // smoothly "catches up" to your scroll position rather than
          // snapping to it instantly. Higher = smoother but more lag.
          scrub: 1,
        },
      });

      // Stage 1 (0 -> 1): hero text card fades/drifts up and out.
      // The rings background is NOT touched here — it stays visible.
      tl.to(
        heroRef.current,
        { opacity: 0, y: -40, duration: 1, ease: "power2.inOut" },
        0
      );

      // Stage 2 (1 -> 2): circular video panel slides up from the bottom,
      // floating over the still-visible rings background.
      tl.fromTo(
        videoWrapRef.current,
        { yPercent: 120, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1, ease: "power2.out" },
        1
      );

      // Stage 3 (2 -> 3): circle grows into a full-bleed rectangle,
      // corners flatten from 50% (circle) to 0 (square).
      // power3.inOut = slow start, fast middle, slow finish — reads as a smooth expand
      // rather than a mechanical, linear resize.
      tl.to(
        videoWrapRef.current,
        {
          width: "100%",
          height: "100%",
          borderRadius: "0px",
          duration: 1,
          ease: "power3.inOut",
          onComplete: () => {
            const video = videoRef.current;
            if (!video) return;
            hasExpandedRef.current = true;
            // Only auto-play if the section is actually still in view —
            // guards against a late-firing onComplete after the user has
            // already scrolled past (the IntersectionObserver below would
            // otherwise get overridden by this play() call).
            if (isInViewRef.current) {
              video.muted = false;
              video.play().catch(() => {});
              setIsMuted(false);
            }
          },
          onReverseComplete: () => {
            const video = videoRef.current;
            if (!video) return;
            video.pause();
            video.currentTime = 0;
            video.muted = true;
            setIsMuted(true);
            hasExpandedRef.current = false;
          },
        },
        2
      );

      // Rings fade out as the video takes over the full screen (same segment as stage 3)
      tl.to(
        ringsRef.current,
        { opacity: 0, duration: 1, ease: "power2.inOut" },
        2
      );

      // Name/role overlay fades in alongside the full-screen expand
      tl.to(
        overlayRef.current,
        { opacity: 1, duration: 1, ease: "power2.inOut" },
        2
      );
    }, containerRef);

    // --- Pause when the section leaves the viewport, resume on return ---
    // Deliberately independent of the scrub timeline/ScrollTrigger above —
    // sharing the same trigger caused a race where scroll inertia (scrub: 1)
    // let the timeline's own play() calls fire right after this paused it.
    // A plain IntersectionObserver has no shared timing with GSAP, so there's
    // no race: it just reflects whether the section is actually on screen.
    const node = containerRef.current;
    let observer: IntersectionObserver | null = null;

    if (node) {
      observer = new IntersectionObserver(
        ([entry]) => {
          isInViewRef.current = entry.isIntersecting;
          const video = videoRef.current;
          if (!video) return;

          if (!entry.isIntersecting) {
            // Section fully out of view (scrolled past, in either direction) — pause, keep position
            if (!video.paused) video.pause();
          } else if (hasExpandedRef.current && video.paused) {
            // Back in view and we'd already reached the expanded/playing stage — resume
            video.play().catch(() => {});
          }
        },
        // threshold: 0 fires as soon as the element is fully gone / just barely visible
        { threshold: 0 }
      );
      observer.observe(node);
    }

    return () => {
      ctx.revert();
      observer?.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-[300vh] bg-[#FAFAFB]">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Persistent background — rings + a full-bleed frosted glass layer over them.
            Both fade out together during stage 3. */}
        <div ref={ringsRef} className="absolute inset-0 z-0 pointer-events-auto">
          <MagicRings
            color={COBALT}
            colorTwo={AMBER}
            followMouse
            opacity={0.5}
            speed={0.35}
            scaleRate={0.06}
            ringCount={5}
            lineThickness={1.6}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "rgba(255,255,255,0.35)",
              backdropFilter: "blur(5px)",
              WebkitBackdropFilter: "blur(0px)",
            }}
          />
        </div>

        {/* Stage 1: hero text, sits directly over the frosted background — no card/box */}
        <div
          ref={heroRef}
          className="absolute inset-0 flex flex-col items-center justify-center gap-5 z-10 pointer-events-none"
        >
          <h1
            className="text-4xl md:text-6xl font-bold tracking-tight text-center px-4"
            style={{ color: INK }}
          >
            Welcome to my portfolio
          </h1>
          <div
            className="flex items-center gap-2 text-xl md:text-3xl font-medium pointer-events-auto"
            style={{ color: MUTED }}
          >
            <span>I&apos;m a</span>
            <RotatingText
              texts={["Full Stack Developer", "Next.js Developer", "UI/UX Enthusiast"]}
              mainClassName="px-3 py-1 rounded-lg overflow-hidden font-semibold"
              style={{
                color: COBALT,
                background: "rgba(44,92,232,0.08)",
                border: `1px solid ${BORDER}`,
              }}
              staggerFrom="last"
              staggerDuration={0.02}
              rotationInterval={2200}
              splitBy="characters"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
            />
          </div>
          <span
            className="block w-12 h-1 rounded-full"
            style={{ background: AMBER }}
          />
        </div>

        {/* Stage 2 & 3: video panel — starts as a bigger circle floating over the rings,
            then grows edge-to-edge into a full-screen rectangle. */}
        <div
          ref={videoWrapRef}
          onMouseMove={handleVideoMouseMove}
          onMouseEnter={handleVideoMouseEnter}
          onMouseLeave={handleVideoMouseLeave}
          onClick={toggleMute}
          className="relative overflow-hidden z-10 cursor-none"
          style={{
            width: "62vh",
            height: "62vh",
            borderRadius: "50%",
            opacity: 0,
            boxShadow: "0 24px 60px rgba(17,19,24,0.18)",
            border: `1px solid ${BORDER}`,
          }}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            src="/video/my-video-1.mp4"
            muted
            loop
            playsInline
          />

          {/* Bottom gradient for general legibility across the whole video */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.55), transparent)",
            }}
          />

          {/* Glassmorphic name/role chip, bottom-left, fades in once full screen */}
          {/* <div
            ref={overlayRef}
            className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-20 opacity-0 px-6 py-4 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            <p className="text-white text-2xl md:text-4xl font-bold tracking-tight">
              Jishnu
            </p>
            <p className="text-white/80 text-sm md:text-lg font-medium">
              Full Stack Developer
            </p>
          </div> */}

          {/* Mute / Unmute pill acting as a custom cursor — follows the mouse
              while it's over the video, hidden otherwise. Click anywhere on
              the video to toggle sound. */}
          <div
            className="absolute z-20 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm md:text-base font-semibold pointer-events-none"
            style={{
              left: cursorPos.x,
              top: cursorPos.y,
              transform: "translate(-50%, -50%)",
              background: "rgba(20,20,24,0.55)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#FFFFFF",
              opacity: isHovering ? 1 : 0,
              transition: "opacity 0.2s ease",
              whiteSpace: "nowrap",
            }}
          >
            {isMuted ? (
              // Play triangle icon — green, matches "Play sound" reference
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="#22C55E"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M1 1.2C1 0.45 1.82 0 2.46 0.4L10.5 5.2C11.1 5.57 11.1 6.43 10.5 6.8L2.46 11.6C1.82 12 1 11.55 1 10.8V1.2Z" />
              </svg>
            ) : (
              // Solid square icon — amber/orange, matches "Mute" reference
              <span
                className="block w-3 h-3 rounded-[2px]"
                style={{ background: AMBER }}
              />
            )}
            <span>{isMuted ? "Play sound" : "Mute"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}