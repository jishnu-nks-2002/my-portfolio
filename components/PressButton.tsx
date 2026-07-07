"use client";

import React from "react";

interface PressButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  type?: "button" | "submit";
  className?: string;
}

/**
 * A "pressable" glass button — adapted from the Uiverse.io skeuomorphic
 * button by FColombati, re-themed with a frosted glass surface and the
 * cobalt/amber "Signal" palette instead of the original black/chrome look.
 * Renders as an <a> when `href` is passed, otherwise a <button>.
 */
export default function PressButton({
  children,
  onClick,
  href,
  type = "button",
  className = "",
}: PressButtonProps) {
  const Tag = (href ? "a" : "button") as React.ElementType;
  const tagProps = href ? { href } : { type, onClick };

  return (
    <Tag className={`glass-press-button ${className}`} {...tagProps}>
      <span className="button-outer">
        <span className="button-inner">
          <span>{children}</span>
        </span>
      </span>

      <style jsx>{`
        .glass-press-button {
          all: unset;
          cursor: pointer;
          -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
          position: relative;
          display: inline-block;
          border-radius: 100em;
          background: rgba(44, 92, 232, 0.18);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: -0.15em -0.15em 0.15em -0.075em rgba(5, 5, 5, 0.2),
            0.0375em 0.0375em 0.0675em 0 rgba(5, 5, 5, 0.08);
        }
        .glass-press-button::after {
          content: "";
          position: absolute;
          z-index: 0;
          width: calc(100% + 0.3em);
          height: calc(100% + 0.3em);
          top: -0.15em;
          left: -0.15em;
          border-radius: inherit;
          background: linear-gradient(
            -135deg,
            rgba(255, 255, 255, 0.55),
            transparent 20%,
            transparent 100%
          );
          filter: blur(0.0125em);
          opacity: 0.35;
          mix-blend-mode: overlay;
          pointer-events: none;
        }
        .button-outer {
          position: relative;
          z-index: 1;
          display: block;
          border-radius: inherit;
          transition: box-shadow 300ms ease;
          will-change: box-shadow;
          box-shadow: 0 0.05em 0.05em -0.01em rgba(5, 5, 5, 0.35),
            0 0.01em 0.01em -0.01em rgba(5, 5, 5, 0.18),
            0.15em 0.3em 0.1em -0.01em rgba(5, 5, 5, 0.15);
        }
        .glass-press-button:hover .button-outer {
          box-shadow: 0 0 0 0 rgba(5, 5, 5, 1), 0 0 0 0 rgba(5, 5, 5, 0.5),
            0 0 0 0 rgba(5, 5, 5, 0.25);
        }
        .button-inner {
          position: relative;
          z-index: 1;
          display: block;
          border-radius: inherit;
          padding: 0.9em 1.9em;
          background: rgba(255, 255, 255, 0.22);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          transition: box-shadow 300ms ease, clip-path 250ms ease,
            background 250ms ease, transform 250ms ease;
          will-change: box-shadow, clip-path, background, transform;
          overflow: clip;
          clip-path: inset(0 0 0 0 round 100em);
          box-shadow: 0 0 0 0 inset rgba(5, 5, 5, 0.1),
            -0.05em -0.05em 0.05em 0 inset rgba(255, 255, 255, 0.5),
            0 0 0 0 inset rgba(5, 5, 5, 0.1),
            0 0 0.05em 0.2em inset rgba(255, 255, 255, 0.25),
            0.025em 0.05em 0.1em 0 inset rgba(255, 255, 255, 0.9),
            0.12em 0.12em 0.12em inset rgba(255, 255, 255, 0.25),
            -0.075em -0.25em 0.25em 0.1em inset rgba(44, 92, 232, 0.3);
        }
        .glass-press-button:hover .button-inner {
          clip-path: inset(
            clamp(1px, 0.0625em, 2px) clamp(1px, 0.0625em, 2px)
              clamp(1px, 0.0625em, 2px) clamp(1px, 0.0625em, 2px) round 100em
          );
          box-shadow: 0.1em 0.15em 0.05em 0 inset rgba(44, 92, 232, 0.55),
            -0.025em -0.03em 0.05em 0.025em inset rgba(5, 5, 5, 0.3),
            0.25em 0.25em 0.2em 0 inset rgba(5, 5, 5, 0.3),
            0 0 0.05em 0.5em inset rgba(255, 255, 255, 0.15),
            0 0 0 0 inset rgba(255, 255, 255, 1),
            0.12em 0.12em 0.12em inset rgba(255, 255, 255, 0.25),
            -0.075em -0.12em 0.2em 0.1em inset rgba(44, 92, 232, 0.3);
        }
        .button-inner span {
          position: relative;
          z-index: 4;
          font-family: "Inter", sans-serif;
          letter-spacing: -0.02em;
          font-weight: 600;
          font-size: 1rem;
          color: #111318;
          transition: transform 250ms ease;
          display: block;
          will-change: transform;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        .glass-press-button:hover .button-inner span {
          transform: scale(0.975);
        }
        .glass-press-button:active .button-inner {
          transform: scale(0.975);
        }
      `}</style>
    </Tag>
  );
}