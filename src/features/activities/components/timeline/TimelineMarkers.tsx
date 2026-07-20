/**
 * Timeline spine markers — "Now" pulse and origin label.
 */

/** Animated pulse at the top of the timeline spine. */
export function NowMarker() {
  return (
    <div className="relative h-12 mb-2">
      <div className="absolute left-[10px] top-1 flex items-center gap-2">
        <span className="relative flex w-4 h-4">
          <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
          <span className="relative w-4 h-4 rounded-full gradient-warm shadow-glow" />
        </span>
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Now</span>
      </div>
    </div>
  );
}

/** Label at the bottom of the timeline spine. */
export function OriginMarker() {
  return (
    <div className="relative h-16 mt-2">
      <div className="absolute left-[14px] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
          The beginning
        </span>
      </div>
    </div>
  );
}

/** Year divider between timeline bands. */
export function YearDivider({ year, isFirst }: { year: number; isFirst: boolean }) {
  return (
    <div className={`relative ${isFirst ? "mt-1" : "mt-7"} mb-3 -ml-14 pl-2 flex items-center gap-2`}>
      <span className="text-3xl font-bold leading-none text-gradient-warm-anim tracking-tight">
        {year}
      </span>
      <span className="flex-1 h-px bg-gradient-to-r from-border via-border to-transparent ml-2" />
    </div>
  );
}
