import { useEffect, useRef } from "react";

/**
 * Soft cursor-following glow attached to <body>. Cheap: only updates two
 * CSS variables. Pointer-events: none so it never intercepts clicks.
 * Desktop only (hidden on touch/coarse pointers).
 */
export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      el.style.setProperty("--cx", `${e.clientX}px`);
      el.style.setProperty("--cy", `${e.clientY}px`);
      el.style.opacity = "1";
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[5] cursor-glow opacity-0 transition-opacity duration-200 hidden md:block"
    />
  );
}
