import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ParallaxLayerProps {
  children: ReactNode;
  className?: string;
  /** Travel as a fraction of element height. 0.15 => moves -15%..15%. */
  speed?: number;
  axis?: "y" | "x";
}

/**
 * Translates children at a different rate than the page scroll to create
 * parallax depth. Becomes a static wrapper when reduced motion is requested.
 */
export function ParallaxLayer({
  children,
  className,
  speed = 0.15,
  axis = "y",
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const raw = useTransform(scrollYProgress, [0, 1], [`${speed * 100}%`, `${-speed * 100}%`]);
  const value = useSpring(raw, { stiffness: 90, damping: 24, mass: 0.4 });

  const style = reduce ? undefined : axis === "y" ? { y: value } : { x: value };

  return (
    <motion.div ref={ref} className={cn("will-change-transform", className)} style={style}>
      {children}
    </motion.div>
  );
}
