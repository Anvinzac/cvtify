import { useMemo, useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { CalendarClock, Sparkles, X, Edit3, Users, Clock } from "lucide-react";
import { Activity, CATEGORIES, DURATION_OPTIONS } from "@/lib/data";

const CATEGORY_COLORS: Record<string, { bar: string; ring: string; text: string; soft: string }> = {
  "home-business": { bar: "bg-amber-400", ring: "ring-amber-400/40", text: "text-amber-700", soft: "bg-amber-50" },
  "social-works": { bar: "bg-rose-400", ring: "ring-rose-400/40", text: "text-rose-700", soft: "bg-rose-50" },
  "part-time": { bar: "bg-sky-400", ring: "ring-sky-400/40", text: "text-sky-700", soft: "bg-sky-50" },
  "projects-internship": { bar: "bg-emerald-400", ring: "ring-emerald-400/40", text: "text-emerald-700", soft: "bg-emerald-50" },
  "extra-curriculum": { bar: "bg-violet-400", ring: "ring-violet-400/40", text: "text-violet-700", soft: "bg-violet-50" },
  professional: { bar: "bg-slate-400", ring: "ring-slate-400/40", text: "text-slate-700", soft: "bg-slate-50" },
  "supplemental-education": { bar: "bg-indigo-400", ring: "ring-indigo-400/40", text: "text-indigo-700", soft: "bg-indigo-50" },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface TimelineBand {
  key: string;
  year: number;
  month: number;
  monthLabel: string;
  items: Activity[];
}

function getActivityDate(act: Activity): Date {
  if (typeof act.occurredAt === "number") return new Date(act.occurredAt);
  const ts = Number(act.id);
  return Number.isFinite(ts) ? new Date(ts) : new Date();
}

function groupByMonth(activities: Activity[]): TimelineBand[] {
  const sorted = [...activities].sort(
    (a, b) => getActivityDate(b).getTime() - getActivityDate(a).getTime()
  );
  const map = new Map<string, TimelineBand>();
  for (const act of sorted) {
    const d = getActivityDate(act);
    const y = d.getFullYear();
    const m = d.getMonth();
    const key = `${y}-${m}`;
    if (!map.has(key)) {
      map.set(key, {
        key,
        year: y,
        month: m,
        monthLabel: `${MONTHS[m]} ${y}`,
        items: [],
      });
    }
    map.get(key)!.items.push(act);
  }
  return Array.from(map.values());
}

const DURATION_WEIGHT: Record<string, number> = {
  "Less than a month": 0.15,
  "1-3 months": 0.35,
  "3-6 months": 0.55,
  "6-12 months": 0.78,
  "More than a year": 1,
};

interface TimelineViewProps {
  activities: Activity[];
  onEdit?: (activity: Activity) => void;
  onRemove?: (id: string) => void;
  /** When true, omit the empty-state — useful when the parent renders its own. */
  hideEmptyState?: boolean;
}

export default function TimelineView({
  activities,
  onEdit,
  onRemove,
  hideEmptyState,
}: TimelineViewProps) {
  const bands = useMemo(() => groupByMonth(activities), [activities]);
  const containerRef = useRef<HTMLDivElement>(null);

  if (activities.length === 0 && !hideEmptyState) {
    return <TimelineEmpty />;
  }

  return (
    <div ref={containerRef} className="relative pl-14 pr-1 pb-32">
      {/* Vertical spine */}
      <div
        aria-hidden
        className="absolute left-[26px] top-2 bottom-24 w-px"
        style={{
          background:
            "linear-gradient(to bottom, transparent, hsl(32 95% 60% / 0.4) 8%, hsl(174 55% 50% / 0.4) 60%, transparent)",
        }}
      />

      {/* "Now" pulse at top */}
      <NowMarker />

      {bands.map((band, bi) => {
        const prev = bands[bi - 1];
        const showYearDivider = !prev || prev.year !== band.year;
        return (
          <div key={band.key}>
            {showYearDivider && <YearDivider year={band.year} isFirst={bi === 0} />}
            <BandSection
              band={band}
              isFirst={bi === 0}
              onEdit={onEdit}
              onRemove={onRemove}
            />
          </div>
        );
      })}

      {/* Origin marker at the bottom */}
      <OriginMarker />
    </div>
  );
}

function YearDivider({ year, isFirst }: { year: number; isFirst: boolean }) {
  return (
    <div className={`relative ${isFirst ? "mt-1" : "mt-7"} mb-3 -ml-14 pl-2 flex items-center gap-2`}>
      <span className="text-3xl font-bold leading-none text-gradient-warm-anim tracking-tight">
        {year}
      </span>
      <span className="flex-1 h-px bg-gradient-to-r from-border via-border to-transparent ml-2" />
    </div>
  );
}

function NowMarker() {
  return (
    <div className="relative h-12 mb-2">
      <div className="absolute left-[10px] top-1 flex items-center gap-2">
        <span className="relative flex w-4 h-4">
          <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
          <span className="relative w-4 h-4 rounded-full gradient-warm shadow-glow" />
        </span>
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
          Now
        </span>
      </div>
    </div>
  );
}

function OriginMarker() {
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

function BandSection({
  band,
  isFirst,
  onEdit,
  onRemove,
}: {
  band: TimelineBand;
  isFirst: boolean;
  onEdit?: (a: Activity) => void;
  onRemove?: (id: string) => void;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  // Year label scales subtly when band is mid-view
  const labelScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1.06, 0.94]);
  const labelOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.5, 1, 1, 0.5]);

  return (
    <div ref={sectionRef} className="relative mb-6">
      {/* Sticky band label */}
      <div className="sticky top-2 z-10 -ml-14 mb-3 flex items-center gap-3 pointer-events-none">
        <motion.div
          style={{ scale: labelScale, opacity: labelOpacity }}
          className="ml-2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/85 backdrop-blur-xl border border-border/60 shadow-card pointer-events-auto"
        >
          <CalendarClock className="w-3 h-3 text-primary" />
          <span className="text-[11px] font-bold text-foreground tracking-wide">
            {band.monthLabel}
          </span>
          <span className="text-[10px] text-muted-foreground font-semibold">
            · {band.items.length}
          </span>
        </motion.div>
      </div>

      <div className="space-y-3">
        {band.items.map((act, i) => (
          <TimelineCard
            key={act.id}
            activity={act}
            index={i}
            isLatest={isFirst && i === 0}
            onEdit={onEdit}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}

function TimelineCard({
  activity,
  index,
  isLatest,
  onEdit,
  onRemove,
}: {
  activity: Activity;
  index: number;
  isLatest: boolean;
  onEdit?: (a: Activity) => void;
  onRemove?: (id: string) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const cat = CATEGORIES.find((c) => c.id === activity.categoryId);
  const colors = CATEGORY_COLORS[activity.categoryId] ?? CATEGORY_COLORS.professional;
  const date = getActivityDate(activity);
  const dayLabel = activity.occurredAt
    ? `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
    : `${MONTHS[date.getMonth()]} ${date.getDate()}`;
  const spanWeight = DURATION_WEIGHT[activity.duration] ?? 0.4;

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 14, x: -8 }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 0.7, 0.35, 1] }}
      className="relative"
    >
      {/* Dot on spine */}
      <motion.div
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ delay: index * 0.06 + 0.1, type: "spring", stiffness: 320, damping: 18 }}
        className="absolute -left-[34px] top-5 flex items-center justify-center"
      >
        <span
          className={`relative inline-flex w-3.5 h-3.5 rounded-full ${colors.bar} ring-4 ring-background shadow-sm`}
        >
          {isLatest && (
            <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
          )}
        </span>
      </motion.div>

      {/* Connector tick */}
      <div
        aria-hidden
        className="absolute -left-[22px] top-[26px] h-px w-4 bg-border"
      />

      {/* Card */}
      <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden hover:shadow-elevated transition-shadow">
        {/* Top color bar */}
        <div className={`h-0.5 w-full ${colors.bar}`} />

        <div className="p-3.5">
          {/* Header */}
          <div className="flex items-start gap-2.5 mb-2">
            <span className="text-lg leading-none mt-0.5">{cat?.emoji}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm leading-tight">
                {activity.name}
              </h3>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                {cat?.name} · {dayLabel}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(activity)}
                  className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center justify-center"
                  aria-label="Edit activity"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              )}
              {onRemove && (
                <button
                  onClick={() => onRemove(activity.id)}
                  className="w-7 h-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center"
                  aria-label="Remove activity"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Meta + duration span */}
          <div className="flex items-center gap-2 mb-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {compactGroup(activity.groupSize)}
            </span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {activity.duration}
            </span>
          </div>

          {/* Duration span bar */}
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${spanWeight * 100}%` } : {}}
                  transition={{ duration: 0.9, delay: index * 0.06 + 0.2, ease: [0.22, 0.7, 0.35, 1] }}
                  className={`h-full ${colors.bar} rounded-full`}
                />
              </div>
              <span className="text-[9px] font-bold text-muted-foreground/70 tabular-nums">
                {durationShort(activity.duration)}
              </span>
            </div>
          </div>

          {/* Skills */}
          {activity.skills.length > 0 && (
            <div className="mb-2">
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-primary" />
                Skills built
              </p>
              <div className="flex flex-wrap gap-1">
                {activity.skills.map((s, i) => (
                  <motion.span
                    key={s}
                    initial={{ opacity: 0, y: 4 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: index * 0.06 + 0.3 + i * 0.03, duration: 0.3 }}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent/70 text-accent-foreground"
                  >
                    {s}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {activity.taskTypes.length > 0 && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Strengths discovered
              </p>
              <div className="flex flex-wrap gap-1">
                {activity.taskTypes.map((t, i) => (
                  <motion.span
                    key={t}
                    initial={{ opacity: 0, y: 4 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: index * 0.06 + 0.45 + i * 0.03, duration: 0.3 }}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${colors.soft} ${colors.text}`}
                  >
                    {t}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TimelineEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <CalendarClock className="w-7 h-7 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">
        Your timeline starts here
      </p>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
        Add an activity and it'll appear on your journey — with the skills and
        strengths you discovered.
      </p>
    </div>
  );
}

function compactGroup(g: string): string {
  if (g.startsWith("Solo")) return "Solo";
  if (g.startsWith("Small")) return "Small";
  if (g.startsWith("Medium")) return "Medium";
  if (g.startsWith("Large")) return "Large";
  if (g.startsWith("Organization")) return "Org";
  return g;
}

function durationShort(d: string): string {
  const idx = DURATION_OPTIONS.indexOf(d);
  if (idx === 0) return "<1mo";
  if (idx === 1) return "1-3mo";
  if (idx === 2) return "3-6mo";
  if (idx === 3) return "6-12mo";
  if (idx === 4) return "1y+";
  return d;
}
