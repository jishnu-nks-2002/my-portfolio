"use client";

/*
  FallingTechStack.jsx  (v3)
  --------------------------
  Changes in this version:
  - Icon tiles REMOVED -> bare logos only (circular physics bodies)
  - Looping SplitText heading, left-aligned, now VISIBLE on your white
    background (previous version used white text = invisible on white)
  - White logos (Next.js, Express, GitHub, Vercel) switched to dark
    variants so they show on a light page

  Requires:  npm i matter-js gsap @gsap/react
  Uses your existing ./SplitText component.
*/

import { useRef, useState, useEffect } from 'react';
import Matter from 'matter-js';
import SplitText from './SplitText';

const { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint, Body } = Matter;

const DEFAULT_TECHS = [
  { name: 'React',      slug: 'react',       color: '61DAFB' },
  { name: 'Next.js',    slug: 'nextdotjs',   color: '000000' },
  { name: 'TypeScript', slug: 'typescript',  color: '3178C6' },
  { name: 'JavaScript', slug: 'javascript',  color: 'F7DF1E' },
  { name: 'Node.js',    slug: 'nodedotjs',   color: '5FA04E' },
  { name: 'Express',    slug: 'express',     color: '000000' },
  { name: 'MongoDB',    slug: 'mongodb',     color: '47A248' },
  { name: 'MySQL',      slug: 'mysql',       color: '4479A1' },
  { name: 'PHP',        slug: 'php',         color: '777BB4' },
  { name: 'WordPress',  slug: 'wordpress',   color: '21759B' },
  { name: 'Shopify',    slug: 'shopify',     color: '7AB55C' },
  { name: 'Firebase',   slug: 'firebase',    color: 'DD2C00' },
  { name: 'Redux',      slug: 'redux',       color: '764ABC' },
  { name: 'Tailwind',   slug: 'tailwindcss', color: '06B6D4' },
  { name: 'Bootstrap',  slug: 'bootstrap',   color: '7952B3' },
  { name: 'HTML5',      slug: 'html5',       color: 'E34F26' },
  { name: 'CSS',        slug: 'css',         color: '663399' },
  { name: 'Git',        slug: 'git',         color: 'F05032' },
  { name: 'GitHub',     slug: 'github',      color: '181717' },
  { name: 'Vercel',     slug: 'vercel',      color: '000000' },
  { name: 'Postman',    slug: 'postman',     color: 'FF6C37' },
  { name: 'Figma',      slug: 'figma',       color: 'F24E1E' },
];

/* ==================================================================
   Looping heading — left aligned, replays the SplitText animation
   for each phrase: animate in -> hold -> fade out -> next phrase.
   ================================================================== */
const LoopingHeading = ({
  texts = ['TECH STACK', 'TOOLS I USE', 'BUILD & SHIP'],
  holdTime = 5200,   // ms fully visible
  fadeTime = 500,    // ms fade-out
 headingClassName = 'font-black uppercase leading-none tracking-tight text-[144px] text-black',
  className = '',
}) => {
  const [index, setIndex] = useState(0);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (texts.length <= 1) return;

    const id = setInterval(() => {
      const el = wrapRef.current;
      if (el) {
        el.style.transition = `opacity ${fadeTime}ms ease, transform ${fadeTime}ms ease`;
        el.style.opacity = '0';
        el.style.transform = 'translateY(-24px)';
      }
      setTimeout(() => {
        setIndex((i) => (i + 1) % texts.length);
        if (el) {
          el.style.transition = 'none';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }
      }, fadeTime);
    }, holdTime + fadeTime);

    return () => clearInterval(id);
  }, [texts.length, holdTime, fadeTime]);

  return (
    <div ref={wrapRef} className={className}>
      {/* key={index} remounts SplitText -> the char stagger replays */}
      <SplitText
        key={index}
        text={texts[index]}
        tag="h1"
        splitType="chars"
        delay={40}
        duration={0.8}
        ease="power3.out"
        from={{ opacity: 0, y: 60 }}
        to={{ opacity: 1, y: 0 }}
        threshold={0}
        rootMargin="0px"
        textAlign="left"
        className={headingClassName}
      />
    </div>
  );
};

/* ==================================================================
   Main section
   ================================================================== */
const FallingTechStack = ({
  techs = DEFAULT_TECHS,
  headingTexts = ['TECH STACK', 'TOOLS I USE', 'BUILD & SHIP'],
  /* big watermark heading behind the icons; tweak opacity/color here.
     On a DARK page use e.g. 'text-white/10' instead. */
  headingClassName = 'font-black uppercase leading-none tracking-tight text-[clamp(2.5rem,8vw,7rem)] text-neutral-900/50',
  trigger = 'scroll',            // 'auto' | 'click' | 'hover' | 'scroll'
  gravity = 0.9,
  iconSize = 56,                 // px, logo size (physics circle diameter)
  wireframes = false,
  backgroundColor = 'transparent',
  mouseConstraintStiffness = 0.2,
}) => {
  const containerRef = useRef(null);
  const iconsRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const [effectStarted, setEffectStarted] = useState(false);

  /* ------------------------------------------------ trigger handling */
  useEffect(() => {
    if (trigger === 'auto') {
      setEffectStarted(true);
      return;
    }
    if (trigger === 'scroll' && containerRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setEffectStarted(true);
            observer.disconnect();
          }
        },
        { threshold: 0.2 }
      );
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [trigger]);

  /* ------------------------------------------------ physics world */
  useEffect(() => {
    if (!effectStarted) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;
    if (width <= 0 || height <= 0) return;

    const engine = Engine.create();
    engine.world.gravity.y = gravity;

    const render = Render.create({
      element: canvasContainerRef.current,
      engine,
      options: {
        width,
        height,
        background: backgroundColor,
        wireframes,
      },
    });

    const boundaryOptions = {
      isStatic: true,
      render: { fillStyle: 'transparent' },
    };
    const floor = Bodies.rectangle(width / 2, height + 25, width, 50, boundaryOptions);
    const leftWall = Bodies.rectangle(-25, height / 2, 50, height, boundaryOptions);
    const rightWall = Bodies.rectangle(width + 25, height / 2, 50, height, boundaryOptions);
    const ceiling = Bodies.rectangle(width / 2, -25, width, 50, boundaryOptions);

    /* one CIRCULAR physics body per bare icon */
    const iconElems = iconsRef.current.querySelectorAll('.fts-icon');
    const iconBodies = [...iconElems].map((elem) => {
      const rect = elem.getBoundingClientRect();
      const x = rect.left - containerRect.left + rect.width / 2;
      const y = rect.top - containerRect.top + rect.height / 2;

      const body = Bodies.circle(x, y, rect.width / 2, {
        render: { fillStyle: 'transparent' },
        restitution: 0.7,      // bounciness
        frictionAir: 0.01,
        friction: 0.2,
      });

      Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 4,
        y: 0,
      });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.08);

      return { elem, body };
    });

    /* pin icons to their bodies */
    iconBodies.forEach(({ elem, body }) => {
      elem.style.position = 'absolute';
      elem.style.left = `${body.position.x}px`;
      elem.style.top = `${body.position.y}px`;
      elem.style.transform = 'translate(-50%, -50%)';
    });

    const mouse = Mouse.create(containerRef.current);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: mouseConstraintStiffness,
        render: { visible: false },
      },
    });
    render.mouse = mouse;

    /* let the page still scroll over the section */
    mouse.element.removeEventListener('wheel', mouse.mousewheel);

    World.add(engine.world, [
      floor,
      leftWall,
      rightWall,
      ceiling,
      mouseConstraint,
      ...iconBodies.map((ib) => ib.body),
    ]);

    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    let frameId;
    const updateLoop = () => {
      iconBodies.forEach(({ body, elem }) => {
        const { x, y } = body.position;
        elem.style.left = `${x}px`;
        elem.style.top = `${y}px`;
        elem.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
      });
      frameId = requestAnimationFrame(updateLoop);
    };
    updateLoop();

    /* hover = tiny playful "pop" upward */
    const hoverHandlers = iconBodies.map(({ elem, body }) => {
      const onEnter = () => {
        Body.applyForce(body, body.position, {
          x: (Math.random() - 0.5) * 0.02,
          y: -0.03,
        });
      };
      elem.addEventListener('mouseenter', onEnter);
      return { elem, onEnter };
    });

    return () => {
      cancelAnimationFrame(frameId);
      hoverHandlers.forEach(({ elem, onEnter }) =>
        elem.removeEventListener('mouseenter', onEnter)
      );
      Render.stop(render);
      Runner.stop(runner);
      if (render.canvas && canvasContainerRef.current) {
        canvasContainerRef.current.removeChild(render.canvas);
      }
      World.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [effectStarted, gravity, wireframes, backgroundColor, mouseConstraintStiffness]);

  const handleTrigger = () => {
    if (!effectStarted && (trigger === 'click' || trigger === 'hover')) {
      setEffectStarted(true);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative z-[1] w-full h-full min-h-[480px] cursor-grab active:cursor-grabbing overflow-hidden"
      onClick={trigger === 'click' ? handleTrigger : undefined}
      onMouseEnter={trigger === 'hover' ? handleTrigger : undefined}
    >
      {/* ---------- looping SplitText heading (left-aligned, behind icons) ---------- */}
      <div
        className="pointer-events-none absolute inset-0 z-0 flex items-center"
        aria-hidden="true"
      >
        <LoopingHeading
          texts={headingTexts}
          headingClassName={headingClassName}
          className="pl-6 md:pl-12 w-full"
        />
      </div>

      {/* ---------- bare icons — become physics bodies on start ---------- */}
      <div
        ref={iconsRef}
        className="relative z-[2] flex flex-wrap items-center justify-center gap-6 pt-10 px-6"
      >
        {techs.map((tech) => (
          <div
            key={tech.slug}
            className="fts-icon group relative grid place-items-center rounded-full
                       transition-transform duration-200 ease-out hover:scale-125
                       will-change-transform select-none"
            style={{
              width: iconSize,
              height: iconSize,
              '--glow': `#${tech.color}`,
            }}
          >
            <img
              src={`https://cdn.simpleicons.org/${tech.slug}/${tech.color}`}
              alt={tech.name}
              draggable="false"
              className="pointer-events-none h-full w-full transition-all duration-200
                         "
            />
            {/* tooltip */}
            <span
              className="pointer-events-none absolute -top-9 z-10 whitespace-nowrap rounded-md
                         bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white
                         opacity-0 translate-y-1 transition-all duration-200
                         group-hover:opacity-100 group-hover:translate-y-0"
            >
              {tech.name}
            </span>
          </div>
        ))}
      </div>

      {/* Matter.js canvas (transparent) */}
      <div className="absolute top-0 left-0 z-[1]" ref={canvasContainerRef} />
    </div>
  );
};

export default FallingTechStack;

