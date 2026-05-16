import { useEffect, useRef } from "react";

/**
 * Slim top progress bar that reflects the scroll position of either the
 * window or a given scrollable element. Updates via a single CSS variable
 * — no React re-renders.
 */
export default function ScrollProgress({
  target,
  className = "",
}: {
  target?: React.RefObject<HTMLElement>;
  className?: string;
}) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = target?.current ?? null;
    const getProgress = () => {
      if (el) {
        const max = el.scrollHeight - el.clientHeight;
        if (max <= 0) return 0;
        return el.scrollTop / max;
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return 0;
      return window.scrollY / max;
    };
    const update = () => {
      const p = Math.max(0, Math.min(1, getProgress()));
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${p})`;
      }
    };
    update();
    const src = el ?? window;
    src.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      src.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [target]);

  return (
    <div
      className={`fixed top-0 left-0 right-0 h-[3px] z-[80] pointer-events-none ${className}`}
      aria-hidden
    >
      <div
        ref={barRef}
        className="h-full origin-left gradient-warm shadow-glow"
        style={{ transform: "scaleX(0)", transition: "transform 80ms linear" }}
      />
    </div>
  );
}
