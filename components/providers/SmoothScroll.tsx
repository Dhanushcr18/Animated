'use client';

import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    let raf: number;
    function raf_fn(time: number) {
      lenis.raf(time);
      raf = requestAnimationFrame(raf_fn);
    }
    raf = requestAnimationFrame(raf_fn);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
