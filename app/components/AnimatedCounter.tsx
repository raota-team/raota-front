import { useState, useEffect } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  className?: string;
  shouldStart?: boolean;
}

export default function AnimatedCounter({ 
  value, 
  duration = 1200, 
  suffix = '', 
  className = '', 
  shouldStart = true 
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;
    
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress * (2 - progress); // easeOutQuad
      setCount(Math.floor(easeProgress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration, shouldStart]);

  const formattedCount = count.toLocaleString('ko-KR');

  return <span className={className}>{formattedCount}{suffix}</span>;
}
