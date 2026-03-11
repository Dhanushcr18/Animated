import { useEffect, useRef, useState } from 'react';

export function useImagePreloader(
  getPath: (i: number) => string,
  totalFrames: number,
  eagerFrames = 10
) {
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [eagerReady, setEagerReady] = useState(false);
  const [allReady, setAllReady] = useState(false);

  useEffect(() => {
    imagesRef.current = new Array(totalFrames);
    let eagerLoaded = 0;

    const loadImage = (index: number): Promise<void> =>
      new Promise((resolve) => {
        const img = new window.Image();
        img.src = getPath(index);
        img.onload = () => {
          imagesRef.current[index] = img;
          resolve();
        };
        img.onerror = () => resolve(); // skip broken frames
      });

    // Load first N frames eagerly
    const eagerPromises = Array.from({ length: Math.min(eagerFrames, totalFrames) }, (_, i) =>
      loadImage(i).then(() => {
        eagerLoaded++;
        if (eagerLoaded >= Math.min(eagerFrames, totalFrames)) setEagerReady(true);
      })
    );

    Promise.all(eagerPromises).then(() => {
      // Lazy load remaining frames in background
      const rest = Array.from({ length: totalFrames - eagerFrames }, (_, i) =>
        loadImage(i + eagerFrames)
      );
      Promise.all(rest).then(() => setAllReady(true));
    });
  }, [getPath, totalFrames, eagerFrames]);

  return { images: imagesRef, eagerReady, allReady };
}
