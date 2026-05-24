'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

interface ScrollRevealOptions {
  /** Ratio of element visible before triggering (0-1). Default 0.15 */
  threshold?: number;
  /** Once triggered, stay revealed. Default true */
  once?: boolean;
  /** Root margin for early/late triggering. Default '0px 0px -40px 0px' */
  rootMargin?: string;
}

/**
 * Intersection Observer hook for scroll-triggered reveal animations.
 * Returns a ref to attach and a boolean indicating visibility.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {},
): [RefObject<T | null>, boolean] {
  const { threshold = 0.15, once = true, rootMargin = '0px 0px -40px 0px' } = options;
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once, rootMargin]);

  return [ref, isVisible];
}
