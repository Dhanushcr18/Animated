'use client';

import { useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';

// Right-side content panels that scroll while the image stays sticky
const panels = [
  {
    label: '01',
    heading: 'Panoramic Windows',
    body: 'Floor-to-ceiling sapphire glass wraps the cabin, dissolving the boundary between passenger and sky. Watch the world unspool forty-thousand feet below.',
    image: '/images/cabin-1.jpg',
    bg: 'from-slate-950 via-slate-800 to-slate-700',
  },
  {
    label: '02',
    heading: 'Tailored Seating',
    body: 'Every seat is sculpted from memory foam wrapped in full-grain leather. Haptic-touch controls adjust recline, lumbar, and armrests with a whisper.',
    image: '/images/cabin-2.jpg',
    bg: 'from-stone-950 via-zinc-800 to-zinc-600',
  },
  {
    label: '03',
    heading: 'Comfortable Room',
    body: `At 6'4" headroom and 28" of shoulder clearance per seat, the cabin breathes. Arrive as rested as the moment you boarded.`,
    image: '/images/cabin-3.jpg',
    bg: 'from-neutral-950 via-amber-950 to-stone-700',
  },
];

/** Single scrollable right-side text panel */
function TextPanel({
  scrollYProgress,
  inRange: [a, b],
  panel,
}: {
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  inRange: [number, number];
  panel: { label: string; heading: string; body: string };
}) {
  const opacity = useTransform(
    scrollYProgress,
    [Math.max(0, a - 0.05), a, b, Math.min(1, b + 0.05)],
    [0, 1, 1, 0]
  );
  const y = useTransform(
    scrollYProgress,
    [Math.max(0, a - 0.05), a, b, Math.min(1, b + 0.05)],
    [50, 0, 0, -50]
  );
  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex flex-col justify-center px-12 xl:px-20"
    >
      <span className="text-[9px] tracking-[0.55em] text-(--gold) mb-8 uppercase font-light">
        {panel.label} — CABIN
      </span>
      <h3 className="font-display italic font-light text-white leading-tight mb-7
        text-[clamp(2.2rem,4vw,4rem)]">
        {panel.heading}
      </h3>
      <div className="w-10 h-px bg-(--gold) opacity-50 mb-7" />
      <p className="text-white/50 text-sm md:text-base leading-relaxed max-w-sm font-light">
        {panel.body}
      </p>
    </motion.div>
  );
}

/** Single crossfading image panel */
function ImagePanel({
  scrollYProgress,
  inRange: [a, b],
  image,
  gradientClass,
  index,
}: {
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  inRange: [number, number];
  image: string;
  gradientClass: string;
  index: number;
}) {
  const opacity = useTransform(
    scrollYProgress,
    [a - 0.05, a, b, b + 0.05],
    [0, 1, 1, 0]
  );

  return (
    <motion.div
      style={{ opacity }}
      className={`absolute inset-0`}
    >
      {/* Photo background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />
      {/* Fallback gradient (shows if image not found) */}
      <div className={`absolute inset-0 bg-linear-to-br ${gradientClass} opacity-70`} />
      {/* Dark tone overlay for text contrast */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 100%)' }} />
      {/* Ambient gold glow */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(circle at 35% 45%, rgba(201,168,76,0.12) 0%, transparent 60%)' }} />
      {/* Large ghost number */}
      <span className="absolute bottom-10 right-10 text-white/4 font-display italic font-light select-none leading-none"
        style={{ fontSize: 'clamp(8rem,22vw,20rem)' }}>
        {index + 1}
      </span>
    </motion.div>
  );
}

export default function ExpandingImage() {
  const expansionRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<HTMLDivElement>(null);

  // Phase 1: expansion animation
  const { scrollYProgress: expandProgress } = useScroll({
    target: expansionRef,
    offset: ['start start', 'end end'],
  });

  // Phase 2: crossfade images as right content scrolls
  const { scrollYProgress: splitProgress } = useScroll({
    target: splitRef,
    offset: ['start start', 'end end'],
  });

  // --- Phase 1 transforms ---
  const width = useTransform(expandProgress, [0, 1], ['320px', '60vw']);
  const height = useTransform(expandProgress, [0, 1], ['320px', '100vh']);
  const borderRadius = useTransform(
    expandProgress,
    [0, 1],
    ['40px', '20px 0px 0px 20px']
  );
  const left = useTransform(expandProgress, [0, 1], ['50%', '0%']);
  const translateX = useTransform(expandProgress, [0, 1], ['-50%', '0%']);
  const top = useTransform(expandProgress, [0, 1], ['50%', '0%']);
  const translateY = useTransform(expandProgress, [0, 1], ['-50%', '0%']);

  // Panel visibility: each panel occupies 1/3 of splitProgress
  const panelRanges: [number, number][] = [
    [0, 0.33],
    [0.28, 0.66],
    [0.61, 1.0],
  ];

  return (
    <div className="w-full grain" style={{ backgroundColor: '#080808' }}>
      {/* ── Phase 1: expansion ── */}
      <div ref={expansionRef} className="relative h-[150vh] w-full overflow-hidden">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Section label while expanding */}
          <div className="absolute top-8 left-0 right-0 flex justify-center z-20 pointer-events-none">
            <span className="text-(--gold) text-[9px] tracking-[0.55em] font-light opacity-50">02 — INTERIOR</span>
          </div>
          <motion.div
            className="absolute overflow-hidden"
            style={{ width, height, borderRadius, left, top, x: translateX, y: translateY }}
          >
            {/* Real interior background photo */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('/images/interior-bg.jpg')` }}
            />
            {/* Tonal overlay */}
            <div className={`absolute inset-0 bg-linear-to-br ${panels[0].bg} opacity-50`} />
            <div className="absolute inset-0 opacity-20"
              style={{ background: 'radial-gradient(circle at 30% 40%, rgba(201,168,76,0.3) 0%, transparent 60%)' }} />
          </motion.div>
        </div>
      </div>

      {/* ── Phase 2: sticky split-screen ── */}
      <div ref={splitRef} className="relative" style={{ height: `${panels.length * 100}vh` }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden flex">

          {/* Left: sticky image with crossfade */}
          <div className="relative overflow-hidden shrink-0 rounded-[20px] m-6 mr-0" style={{ width: 'calc(58% - 1.5rem)' }}>
            {panels.map((panel, i) => (
              <ImagePanel
                key={i}
                scrollYProgress={splitProgress}
                inRange={panelRanges[i]}
                image={panel.image}
                gradientClass={panel.bg}
                index={i}
              />
            ))}
            {/* Gold edge accent */}
            <div className="absolute top-0 right-0 bottom-0 w-px"
              style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(201,168,76,0.3) 40%, rgba(201,168,76,0.3) 60%, transparent 100%)' }} />
          </div>

          {/* Right: text panels */}
          <div className="flex-1 overflow-hidden relative bg-[#080808]">
            {panels.map((panel, i) => (
              <TextPanel
                key={i}
                scrollYProgress={splitProgress}
                inRange={panelRanges[i]}
                panel={panel}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
