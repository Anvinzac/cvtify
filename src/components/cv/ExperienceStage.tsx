import { motion, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { MapPin } from "lucide-react";
import type { Photo, Stage } from "@/lib/cvData";
import { StickyStage } from "./StickyStage";

/**
 * A single photo in the cycling stack. Fades + scales in across its slice of
 * the stage's scroll progress, then out again — the "animated in and out" beat.
 */
function StagePhoto({
  photo,
  index,
  count,
  progress,
}: {
  photo: Photo;
  index: number;
  count: number;
  progress: MotionValue<number>;
}) {
  const seg = 1 / count;
  const enter = index * seg;
  const exit = enter + seg;
  const fade = seg * 0.28;
  const first = index === 0;
  const last = index === count - 1;

  const opacity = useTransform(
    progress,
    [enter, enter + fade, exit - fade, exit],
    [first ? 1 : 0, 1, 1, last ? 1 : 0],
  );
  const scale = useTransform(progress, [enter, exit], [1.14, 1]);
  const x = useTransform(progress, [enter, exit], [index % 2 === 0 ? "-4%" : "4%", "0%"]);

  return (
    <motion.div className="absolute inset-0" style={{ opacity }}>
      <motion.img
        src={photo.src}
        alt={photo.alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
        style={{ scale, x }}
      />
    </motion.div>
  );
}

/** The pinned frame content: photo stack + legibility overlays + story panel. */
function StageInner({
  stage,
  index,
  total,
  progress,
  accent,
}: {
  stage: Stage;
  index: number;
  total: number;
  progress: MotionValue<number>;
  accent: string;
}) {
  const textY = useTransform(progress, [0, 1], ["7%", "-7%"]);

  return (
    <div className="relative h-full w-full">
      {/* Photo stack */}
      <div className="absolute inset-0">
        {stage.photos.map((p, i) => (
          <StagePhoto key={p.src} photo={p} index={i} count={stage.photos.length} progress={progress} />
        ))}
      </div>

      {/* Legibility overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-background/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />

      {/* Story panel */}
      <motion.div
        style={{ y: textY }}
        className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-between px-5 py-16 sm:px-8 sm:py-20"
      >
        <div className="flex items-start justify-between gap-4">
          <p className="eyebrow" style={{ color: accent }}>
            {stage.chapter}
          </p>
          <p className="font-display text-sm tabular-nums text-foreground/70">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
        </div>

        <div className="max-w-xl">
          <h3 className="line-clamp-3 font-display text-3xl font-semibold leading-[1.05] text-balance sm:text-4xl md:text-5xl">
            {stage.role}
          </h3>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground/90">{stage.org}</span>
            <span aria-hidden>·</span>
            <span className="tabular-nums">{stage.period}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {stage.location}
            </span>
          </div>

          <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-foreground/80 text-pretty sm:mt-4 sm:text-base">
            {stage.summary}
          </p>

          <ul className="mt-3 space-y-1.5 sm:mt-4">
            {stage.highlights.map((h) => (
              <li key={h} className="flex gap-2.5 text-[13px] leading-snug text-foreground/75 sm:text-sm">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full" style={{ background: accent }} />
                {h}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
            {stage.skills.map((s) => (
              <span
                key={s}
                className="rounded-full border border-border/70 bg-background/40 px-3 py-1 text-xs font-medium text-foreground/85 backdrop-blur-sm"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Per-stage scroll progress line */}
      <motion.div
        style={{ scaleX: progress, background: accent }}
        className="absolute bottom-0 left-0 z-20 h-[2px] w-full origin-left"
      />
    </div>
  );
}

/**
 * One chapter of the experience story. Pins a full-viewport frame while its
 * photos animate in and out; falls back to a static stacked layout for
 * reduced motion.
 */
export function ExperienceStage({ stage, index, total }: { stage: Stage; index: number; total: number }) {
  const reduce = useReducedMotion();
  const accent = stage.accent ?? "hsl(var(--primary))";

  if (reduce) {
    return (
      <article className="border-t border-border/50 py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <p className="eyebrow" style={{ color: accent }}>
            {stage.chapter}
          </p>
          <h3 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{stage.role}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {stage.org} · {stage.period} · {stage.location}
          </p>
          <p className="mt-4 max-w-2xl text-foreground/80">{stage.summary}</p>
          <ul className="mt-4 space-y-1.5">
            {stage.highlights.map((h) => (
              <li key={h} className="flex gap-2.5 text-sm text-foreground/75">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full" style={{ background: accent }} />
                {h}
              </li>
            ))}
          </ul>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {stage.photos.map((p) => (
              <img
                key={p.src}
                src={p.src}
                alt={p.alt}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
            ))}
          </div>
        </div>
      </article>
    );
  }

  return (
    <StickyStage heightVh={240} className="border-t border-border/30">
      {(progress) => (
        <StageInner stage={stage} index={index} total={total} progress={progress} accent={accent} />
      )}
    </StickyStage>
  );
}
