'use client';

import { useEffect, useRef, useState } from 'react';

export default function GlobalScrollIndicator() {
  const [thumb, setThumb] = useState({ height: 0, top: 0, visible: false });
  const hideTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const updateThumb = (shouldShow: boolean) => {
      const doc = document.documentElement;
      const scrollableDistance = doc.scrollHeight - window.innerHeight;

      if (scrollableDistance <= 0) {
        setThumb({ height: 0, top: 0, visible: false });
        return;
      }

      const verticalInset = 8;
      const trackHeight = window.innerHeight - verticalInset * 2;
      const thumbHeight = Math.max(40, Math.round((window.innerHeight / doc.scrollHeight) * trackHeight));
      const thumbTravel = Math.max(0, trackHeight - thumbHeight);
      const thumbTop = verticalInset + Math.round((window.scrollY / scrollableDistance) * thumbTravel);

      setThumb({ height: thumbHeight, top: thumbTop, visible: shouldShow });
    };

    const handleScroll = () => {
      updateThumb(true);

      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }

      hideTimeoutRef.current = window.setTimeout(() => {
        setThumb((current) => ({ ...current, visible: false }));
      }, 900);
    };

    const handleResize = () => updateThumb(false);

    updateThumb(false);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);

      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  if (thumb.height <= 0) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed right-1 top-0 z-[9998] w-1.5 rounded-full bg-stone-500/70 transition-opacity duration-200 ${
        thumb.visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        height: thumb.height,
        transform: `translateY(${thumb.top}px)`,
      }}
    />
  );
}
