'use client';

import { useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';

const phrases = [
  { text: 'Spacious Comfort',      sub: 'Unmatched cabin volume at every altitude.' },
  { text: 'Seamless Journey',       sub: 'From departure to arrival — effortlessly.' },
  { text: 'All-electric Flight',    sub: 'Zero emissions. Infinite possibility.' },
];

function SequenceWord({
  scrollYProgress,
  entry: [e0, e1],
  focus: [f0, f1],
  exit: [x0, x1],
  index,
  children,
  sub,
}: {
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  entry: [number, number];
  focus: [number, number];
  exit: [number, number];
  index: number;
  children: React.ReactNode;
  sub: string;
}) {
  const opacity = useTransform(scrollYProgress, [e0, e1, f0, f1, x0, x1], [0, 1, 1, 1, 1, 0]);
  const y       = useTransform(scrollYProgress, [e0, e1, f0, f1, x0, x1], [80, 0, 0, 0, 0, -80]);
  const scale   = useTransform(scrollYProgress, [e0, e1, f0, f1, x0, x1], [0.88, 1, 1, 1, 1, 0.96]);
  const subOpacity = useTransform(scrollYProgress, [e1, e1 + 0.04, x0, x1], [0, 1, 1, 0]);

  return (
    <motion.div
      style={{ opacity, y, scale }}
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6"
    >
      {/* Index counter */}
      <motion.span
        style={{ opacity: subOpacity }}
        className="font-sans text-[10px] tracking-[0.5em] text-(--gold) mb-8 block"
      >
        0{index + 1} / 03
      </motion.span>

      {/* Main phrase */}
      <span className="font-display italic font-light text-white leading-none text-center select-none
        text-[clamp(3rem,9vw,9rem)] drop-shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
        {children}
      </span>

      {/* Thin divider */}
      <motion.div
        className="w-16 h-px mt-10 mb-6"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.6), transparent)', opacity: subOpacity }}
      />

      {/* Subtitle */}
      <motion.p
        style={{ opacity: subOpacity }}
        className="text-white/40 font-sans font-light text-xs md:text-sm tracking-[0.25em] text-center uppercase"
      >
        {sub}
      </motion.p>
    </motion.div>
  );
}

function ProgressBar({
  scrollYProgress,
  seg,
  index,
}: {
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  seg: number;
  index: number;
}) {
  const a = index * seg + 0.04;
  const b = (index + 1) * seg - 0.04;
  const w = useTransform(scrollYProgress, [a, b], ['0%', '100%']);
  return (
    <div className="relative h-px w-16 bg-white/10 overflow-hidden">
      <motion.div className="absolute inset-y-0 left-0 bg-(--gold)" style={{ width: w }} />
    </div>
  );
}

export default function TypographySequence() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const seg = 1 / phrases.length;

  const windows = phrases.map((_, i) => {
    const start    = i * seg;
    const end      = start + seg;
    const entryLen = 0.08;
    const exitLen  = 0.08;
    return {
      entry: [start, start + entryLen] as [number, number],
      focus: [start + entryLen, end - exitLen] as [number, number],
      exit:  [end - exitLen, end] as [number, number],
    };
  });
  windows[2].exit = [0.92, 1.0];

  return (
    <section ref={containerRef} className="relative h-[300vh] w-full">
      <div className="sticky top-0 h-screen w-full overflow-hidden grain"
        style={{
          background: 'radial-gradient(ellipse 120% 90% at 50% 60%, #0d2882 0%, #050e2e 55%, #020510 100%)',
        }}
      >
        {/* Subtle vignette */}
        <div className="absolute inset-0 pointer-events-none z-10"
          style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)' }}
        />

        {/* Fine dot grid */}
        <div className="absolute inset-0 z-0 opacity-[0.06]" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* Section label */}
        <div className="absolute top-8 left-0 right-0 flex justify-center z-20">
          <span className="text-(--gold) text-[9px] tracking-[0.55em] font-light opacity-60">01 — EXPERIENCE</span>
        </div>

        {/* Phrases */}
        {phrases.map((phrase, i) => (
          <SequenceWord
            key={phrase.text}
            scrollYProgress={scrollYProgress}
            entry={windows[i].entry}
            focus={windows[i].focus}
            exit={windows[i].exit}
            index={i}
            sub={phrase.sub}
          >
            {phrase.text}
          </SequenceWord>
        ))}

        {/* Bottom progress strip */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-3 z-20">
          {phrases.map((_, i) => (
            <ProgressBar key={i} scrollYProgress={scrollYProgress} seg={seg} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
