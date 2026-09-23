import { useScroll, type MotionValue } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StickyStageProps {
  /** Render prop receiving this stage's scroll progress (0 -> 1). */
  children: (progress: MotionValue<number>) => ReactNode;
  /** Total scroll height of the stage in vh. Larger = more scroll per stage. */
  heightVh?: number;
  className?: string;
  innerClassName?: string;
}

/**
 * A tall scroll region containing a pinned, full-viewport frame. Children read
 * `progress` to animate content in and out while the frame stays fixed.
 */
export function StickyStage({
  children,
  heightVh = 260,
  className,
  innerClassName,
}: StickyStageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <div ref={ref} style={{ height: `${heightVh}vh` }} className={cn("relative", className)}>
      <div className={cn("sticky top-0 h-[100dvh] w-full overflow-hidden", innerClassName)}>
        {children(scrollYProgress)}
      </div>
    </div>
  );
}
