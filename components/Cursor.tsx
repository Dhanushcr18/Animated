'use client';

import { useEffect, useRef } from 'react';

export default function Cursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let rx = 0, ry = 0; // ring position (lagged)
    let mx = 0, my = 0; // mouse position
    let raf: number;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left  = `${mx}px`;
      dot.style.top   = `${my}px`;
    };

    const tick = () => {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      ring.style.left = `${rx}px`;
      ring.style.top  = `${ry}px`;
      raf = requestAnimationFrame(tick);
    };

    const onEnterLink = () => {
      ring.style.transform  = 'translate(-50%, -50%) scale(1.8)';
      ring.style.borderColor = 'rgba(201,168,76,0.9)';
      dot.style.transform   = 'translate(-50%, -50%) scale(0)';
    };
    const onLeaveLink = () => {
      ring.style.transform  = 'translate(-50%, -50%) scale(1)';
      ring.style.borderColor = 'rgba(201,168,76,0.5)';
      dot.style.transform   = 'translate(-50%, -50%) scale(1)';
    };

    document.addEventListener('mousemove', onMove);
    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', onEnterLink);
      el.addEventListener('mouseleave', onLeaveLink);
    });
    raf = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div id="cursor-dot"  ref={dotRef}  />
      <div id="cursor-ring" ref={ringRef} />
    </>
  );
}
