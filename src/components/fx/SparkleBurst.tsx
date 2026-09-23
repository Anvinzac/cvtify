import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Burst {
  id: number;
  x: number;
  y: number;
}

/**
 * Emits a small radial burst of sparkles at a given screen coordinate.
 * Usage: keep an array of bursts in state and render <SparkleBurst bursts={...}/>.
 * Each burst auto-cleans after its animation.
 */
export default function SparkleBurst({
  bursts,
  onSettle,
}: {
  bursts: Burst[];
  onSettle?: (id: number) => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[55]" aria-hidden>
      <AnimatePresence>
        {bursts.map((b) => (
          <SingleBurst key={b.id} burst={b} onSettle={onSettle} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function SingleBurst({ burst, onSettle }: { burst: Burst; onSettle?: (id: number) => void }) {
  const [particles] = useState(() =>
    Array.from({ length: 8 }).map((_, i) => ({
      angle: (Math.PI * 2 * i) / 8 + Math.random() * 0.4,
      dist: 22 + Math.random() * 16,
      size: 3 + Math.random() * 3,
      delay: Math.random() * 0.05,
    }))
  );

  useEffect(() => {
    const t = setTimeout(() => onSettle?.(burst.id), 700);
    return () => clearTimeout(t);
  }, [burst.id, onSettle]);

  return (
    <>
      {particles.map((p, i) => {
        const dx = Math.cos(p.angle) * p.dist;
        const dy = Math.sin(p.angle) * p.dist;
        return (
          <motion.span
            key={i}
            initial={{
              left: burst.x,
              top: burst.y,
              opacity: 1,
              scale: 0,
            }}
            animate={{
              left: burst.x + dx,
              top: burst.y + dy,
              opacity: 0,
              scale: 1,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, delay: p.delay, ease: [0.2, 0.7, 0.35, 1] }}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, hsl(32 95% 60%) 0%, hsl(32 95% 52% / 0) 70%)",
              boxShadow: "0 0 6px hsl(32 95% 60% / 0.8)",
              transform: "translate(-50%,-50%)",
            }}
          />
        );
      })}
      {/* Center ring */}
      <motion.span
        initial={{ left: burst.x, top: burst.y, opacity: 0.6, scale: 0 }}
        animate={{ opacity: 0, scale: 1.4 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        style={{
          position: "absolute",
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "1.5px solid hsl(32 95% 55% / 0.6)",
          transform: "translate(-50%,-50%)",
        }}
      />
    </>
  );
}
