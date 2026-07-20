import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

interface ConfettiProps {
  /** Number of particles. Default 40. */
  count?: number;
  /** Origin in viewport coords. If omitted, bursts from center. */
  origin?: { x: number; y: number };
  /** Called when all particles finish. */
  onDone?: () => void;
  /** Particle palette. Defaults to warm/teal. */
  palette?: string[];
}

interface Particle {
  id: number;
  angle: number;
  distance: number;
  rotation: number;
  size: number;
  duration: number;
  color: string;
  shape: "square" | "circle" | "triangle";
}

const DEFAULT_PALETTE = [
  "hsl(32 95% 52%)",
  "hsl(22 90% 46%)",
  "hsl(174 55% 40%)",
  "hsl(38 95% 60%)",
  "hsl(0 75% 62%)",
  "hsl(268 60% 60%)",
];

export default function Confetti({
  count = 40,
  origin,
  onDone,
  palette = DEFAULT_PALETTE,
}: ConfettiProps) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      angle: Math.random() * Math.PI * 2,
      distance: 90 + Math.random() * 180,
      rotation: (Math.random() - 0.5) * 1080,
      size: 6 + Math.random() * 8,
      duration: 0.9 + Math.random() * 0.9,
      color: palette[i % palette.length],
      shape: (["square", "circle", "triangle"] as const)[i % 3],
    }));
  }, [count, palette]);

  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    if (origin) return origin;
    return {
      x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
      y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
    };
  });

  useEffect(() => {
    if (origin) setPos(origin);
  }, [origin]);

  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
      aria-hidden
    >
      {particles.map((p) => {
        const dx = Math.cos(p.angle) * p.distance;
        const dy = Math.sin(p.angle) * p.distance - 40;
        return (
          <motion.span
            key={p.id}
            initial={{ x: pos.x, y: pos.y, opacity: 1, rotate: 0, scale: 0.6 }}
            animate={{
              x: pos.x + dx,
              y: pos.y + dy + 240,
              opacity: 0,
              rotate: p.rotation,
              scale: 1,
            }}
            transition={{
              duration: p.duration,
              ease: [0.22, 0.7, 0.35, 1],
            }}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size,
              backgroundColor: p.shape === "triangle" ? "transparent" : p.color,
              borderRadius: p.shape === "circle" ? "50%" : p.shape === "square" ? 2 : 0,
              ...(p.shape === "triangle"
                ? {
                    width: 0,
                    height: 0,
                    backgroundColor: "transparent",
                    borderLeft: `${p.size / 2}px solid transparent`,
                    borderRight: `${p.size / 2}px solid transparent`,
                    borderBottom: `${p.size}px solid ${p.color}`,
                  }
                : null),
            }}
          />
        );
      })}
    </div>
  );
}
