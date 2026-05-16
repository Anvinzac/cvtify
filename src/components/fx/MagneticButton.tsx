import { useRef, useState, MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface MagneticButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  /** Maximum pixel offset the button drifts toward the cursor. */
  strength?: number;
  /** Disable the magnetic pull (still keeps press feedback). */
  disabled?: boolean;
}

/**
 * Wraps a button with a subtle magnetic pull toward the cursor and a
 * press-ripple on tap. The content also reads the same motion values to
 * achieve a slight parallax — the icon lags the body for a tactile feel.
 */
export default function MagneticButton({
  children,
  className = "",
  strength = 14,
  disabled,
  onClick,
  ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(my, { stiffness: 220, damping: 18, mass: 0.4 });
  const childX = useTransform(x, (v) => v * 0.45);
  const childY = useTransform(y, (v) => v * 0.45);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    mx.set((dx / (rect.width / 2)) * strength);
    my.set((dy / (rect.height / 2)) * strength);
  };

  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      const id = Date.now() + Math.random();
      setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
      setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 700);
    }
    onClick?.(e);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      whileTap={{ scale: 0.97 }}
      className={`relative overflow-hidden ${className}`}
      {...(rest as object)}
    >
      <motion.span
        style={{ x: childX, y: childY }}
        className="relative z-10 flex items-center justify-center w-full h-full"
      >
        {children}
      </motion.span>
      {/* Hover sheen */}
      <span className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_var(--mx,50%)_var(--my,50%),rgba(255,255,255,0.25),transparent_60%)]" />
      {/* Press ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute rounded-full bg-white/40 animate-ripple"
          style={{ left: r.x, top: r.y, width: 12, height: 12, transform: "translate(-50%,-50%)" }}
        />
      ))}
    </motion.button>
  );
}
