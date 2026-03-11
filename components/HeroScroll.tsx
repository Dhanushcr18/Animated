'use client';

import { useRef, useCallback, useEffect } from 'react';
import {
  useScroll,
  useTransform,
  useMotionValueEvent,
  motion,
  MotionValue,
} from 'framer-motion';
import { useImagePreloader } from '@/hooks/useImagePreloader';
import { FRAMES, TOTAL_FRAMES } from '@/lib/frames';

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

// Animated text block that fades in then fades out as user scrolls
function ScrollText({
  scrollYProgress,
  fadeIn,
  fadeOut,
  children,
}: {
  scrollYProgress: MotionValue<number>;
  fadeIn: [number, number];
  fadeOut: [number, number];
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
    <motion.div style={{ opacity, y }} className="absolute inset-0 flex flex-col items-start justify-end pb-20 px-10 md:px-16 pointer-events-none z-20">
      {children}
    </motion.div>
  );
}

export default function HeroScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentFrameRef = useRef(0);

  const getPath = useCallback((i: number) => FRAMES[i] ?? FRAMES[0], []);
  const { images, eagerReady } = useImagePreloader(getPath, TOTAL_FRAMES, 15);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, TOTAL_FRAMES - 1]);

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
    if (eagerReady) drawFrame(0);
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

        {/* Loading overlay */}
        {!eagerReady && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#050505]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-px bg-[var(--gold)] animate-pulse" />
              <span className="text-white/20 text-[9px] tracking-[0.5em]">LOADING</span>
            </div>
          </div>
        )}

        {/* Dark gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/75 pointer-events-none z-10" />

        {/* --- Scroll-linked text blocks --- */}

        {/* Block 1: Hero title — visible 0%→25%, fades out by 35% */}
        <ScrollText scrollYProgress={scrollYProgress} fadeIn={[0, 0.05]} fadeOut={[0.22, 0.32]}>
          <p className="text-[var(--gold)] tracking-[0.4em] text-[9px] font-light mb-3 flex items-center gap-3">
            <span className="gold-line" />
            THE FUTURE OF PRIVATE AVIATION
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-light leading-tight text-white mb-3">
            ELEVATE YOUR<br />
            <span className="shimmer-text italic">HORIZONS.</span>
          </h1>
          <p className="text-white/45 text-xs font-light tracking-wide max-w-xs leading-relaxed">
            The pinnacle of electric aviation. Silent,<br />zero-emissions, uncompromising luxury.
          </p>
        </ScrollText>

        {/* Block 3: Final — visible 70%→90%, fades as section ends */}
        <ScrollText scrollYProgress={scrollYProgress} fadeIn={[0.70, 0.78]} fadeOut={[0.90, 1.0]}>
          <p className="text-[var(--gold)] tracking-[0.4em] text-[9px] font-light mb-3 flex items-center gap-3">
            <span className="gold-line" />
            EXPERIENCE AWAITS
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-light leading-tight text-white mb-3">
            YOUR JOURNEY.<br />
            <span className="shimmer-text italic">YOUR RULES.</span>
          </h2>
          <p className="text-white/45 text-xs font-light tracking-wide max-w-xs leading-relaxed">
            Depart on demand. Arrive in style.<br />No gates, no queues, no compromises.
          </p>
        </ScrollText>

        {/* Scroll indicator — fades out early */}
        <motion.div
          style={{ opacity: useTransform(scrollYProgress, [0, 0.06], [1, 0]) }}
          className="absolute bottom-7 right-10 z-20 flex flex-col items-center gap-2"
        >
          <span className="text-white/20 text-[9px] tracking-[0.4em] mb-3">SCROLL</span>
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
