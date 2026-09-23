import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  formatted?: boolean;
  delay?: number;
  className?: string;
}

/**
 * Eased number counter. Starts immediately on mount (after `delay`).
 * Robust to StrictMode double-mounts via a ref-cancelled rAF loop.
 */
export default function CountUp({
  to,
  suffix,
  prefix,
  duration = 1200,
  formatted,
  delay = 0,
  className,
}: CountUpProps) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const begin = () => {
      const startTime = performance.now();
      const tick = (now: number) => {
        const t = Math.max(0, Math.min(1, (now - startTime) / duration));
        const eased = 1 - Math.pow(1 - t, 4);
        setValue(Math.round(to * eased));
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    if (delay > 0) {
      timeoutRef.current = setTimeout(begin, delay);
    } else {
      begin();
    }

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, [to, duration, delay]);

  const display = formatted ? value.toLocaleString() : value.toString();
  return (
    <span className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
