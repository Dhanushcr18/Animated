'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useScroll, useTransform, useMotionValueEvent, motion, MotionValue } from 'framer-motion';
import { useImagePreloader } from '@/hooks/useImagePreloader';
import { FRAMES, TOTAL_FRAMES } from '@/lib/frames';

function ScrollText({
  scrollYProgress,
  fadeIn,
  fadeOut,
  align = 'right',
  children,
}: {
  scrollYProgress: MotionValue<number>;
  fadeIn: [number, number];
  fadeOut: [number, number];
  align?: 'left' | 'right';
  children: React.ReactNode;
}) {
  const opacity = useTransform(
    scrollYProgress,
    [fadeIn[0], fadeIn[1], fadeOut[0], fadeOut[1]],
    [0, 1, 1, 0]
  );
  const y = useTransform(
    scrollYProgress,
    [fadeIn[0], fadeIn[1], fadeOut[0], fadeOut[1]],
    [30, 0, 0, -20]
  );
  return (
    <motion.div
      style={{ opacity, y }}
      className={`absolute inset-0 flex flex-col ${align === 'right' ? 'items-end text-right' : 'items-start text-left'} justify-end pb-20 px-10 md:px-16 pointer-events-none z-20`}
    >
      {children}
    </motion.div>
  );
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasW: number,
  canvasH: number
) {
  const imgAspect = img.naturalWidth / img.naturalHeight;
  const canvasAspect = canvasW / canvasH;
  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
  if (imgAspect > canvasAspect) {
    sw = img.naturalHeight * canvasAspect;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / canvasAspect;
    sy = (img.naturalHeight - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvasW, canvasH);
}

export default function PlaneMorph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentFrameRef = useRef(TOTAL_FRAMES - 1);

  const getPath = useCallback((i: number) => FRAMES[i] ?? FRAMES[TOTAL_FRAMES - 1], []);
  const { images, eagerReady } = useImagePreloader(getPath, TOTAL_FRAMES, 10);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Reverse playback for morphing feel
  const frameIndex = useTransform(scrollYProgress, [0, 1], [TOTAL_FRAMES - 1, 0]);

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = images.current[Math.round(index)];
    if (!img || !img.complete || img.naturalWidth === 0) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    }
    ctx.clearRect(0, 0, w, h);
    drawImageCover(ctx, img, w, h);
  }, [images]);

  useMotionValueEvent(frameIndex, 'change', (latest) => {
    currentFrameRef.current = latest;
    drawFrame(latest);
  });

  useEffect(() => {
    if (eagerReady) drawFrame(TOTAL_FRAMES - 1);
  }, [eagerReady, drawFrame]);

  useEffect(() => {
    const handleResize = () => drawFrame(currentFrameRef.current);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawFrame]);

  return (
    <section ref={containerRef} className="relative" style={{ height: '400vh' }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ display: eagerReady ? 'block' : 'none' }}
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40 pointer-events-none z-10" />

        {/* Section label */}
        <div className="absolute top-0 left-0 right-0 z-20 px-10 pt-7 flex items-center gap-3">
          <div className="gold-line" />
          <span className="text-[var(--gold)] tracking-[0.4em] text-[9px] font-light">02 — DESIGN</span>
        </div>

        {/* Block 1 */}
        <ScrollText scrollYProgress={scrollYProgress} fadeIn={[0, 0.08]} fadeOut={[0.28, 0.38]} align="right">
          <p className="text-[var(--gold)] tracking-[0.4em] text-[9px] font-light mb-3 flex items-center gap-3 justify-end">AERODYNAMICS <span className="gold-line" /></p>
          <h2 className="font-display text-4xl md:text-5xl font-light leading-tight text-white mb-3">FORM MEETS<br /><span className="shimmer-text italic">FUNCTION.</span></h2>
          <p className="text-white/45 text-xs font-light tracking-wide max-w-xs leading-relaxed">Aerodynamic perfection tailored for<br />the urban skies.</p>
        </ScrollText>

        {/* Block 2 */}
        <ScrollText scrollYProgress={scrollYProgress} fadeIn={[0.38, 0.48]} fadeOut={[0.65, 0.75]} align="right">
          <p className="text-[var(--gold)] tracking-[0.4em] text-[9px] font-light mb-3 flex items-center gap-3 justify-end">SPECIFICATIONS <span className="gold-line" /></p>
          <h2 className="font-display text-4xl md:text-5xl font-light leading-tight text-white mb-4">BUILT FOR<br /><span className="shimmer-text italic">EXCELLENCE.</span></h2>
          <div className="flex gap-4 flex-wrap justify-end mt-2">
            {[{ label: 'MAX SPEED', value: '650 KM/H' }, { label: 'RANGE', value: '3,200 KM' }, { label: 'CAPACITY', value: '12 PAX' }].map((spec) => (
              <div key={spec.label} className="border border-white/10 px-4 py-3 text-left backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="text-[var(--gold)] text-[8px] tracking-[0.3em] mb-1">{spec.label}</div>
                <div className="text-white text-base font-light tracking-widest">{spec.value}</div>
              </div>
            ))}
          </div>
        </ScrollText>

        {/* Block 3 */}
        <ScrollText scrollYProgress={scrollYProgress} fadeIn={[0.75, 0.83]} fadeOut={[0.93, 1.0]} align="right">
          <p className="text-[var(--gold)] tracking-[0.4em] text-[9px] font-light mb-3 flex items-center gap-3 justify-end">INTERIOR <span className="gold-line" /></p>
          <h2 className="font-display text-4xl md:text-5xl font-light leading-tight text-white mb-3">AGILITY AND<br /><span className="shimmer-text italic">COMFORT.</span></h2>
          <p className="text-white/45 text-xs font-light tracking-wide max-w-xs leading-relaxed">Seamless fusion of performance<br />and absolute luxury within.</p>
        </ScrollText>
      </div>
    </section>
  );
}
