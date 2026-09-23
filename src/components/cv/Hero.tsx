import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { ArrowDown, ArrowUpRight, Download, MapPin } from "lucide-react";
import { cv } from "@/lib/cvData";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * The at-a-glance opening: everything an employer needs in ~5 seconds,
 * over a full-bleed parallax portrait.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const bgY = useSpring(useTransform(scrollYProgress, [0, 1], ["0%", "18%"]), {
    stiffness: 100,
    damping: 30,
    mass: 0.4,
  });
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.2]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const topSkills = cv.skillGroups
    .flatMap((g) => g.items)
    .sort((a, b) => b.level - a.level)
    .slice(0, 6)
    .map((s) => s.name);

  return (
    <section id="top" ref={ref} className="relative min-h-[100dvh] w-full overflow-hidden">
      {/* Parallax background portrait */}
      <motion.div className="absolute inset-0 -z-10" style={reduce ? undefined : { y: bgY }}>
        <motion.img
          src={cv.heroPhoto.src}
          alt={cv.heroPhoto.alt}
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover"
          style={reduce ? undefined : { scale: bgScale }}
        />
      </motion.div>
      {/* Left scrim keeps text legible while the portrait stays visible on the right */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/75 to-transparent" />
      {/* Bottom scrim for the lower text and scroll cue */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/10 to-transparent" />

      {/* Foreground content */}
      <motion.div
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex min-h-[100dvh] max-w-6xl flex-col justify-center px-5 pb-24 pt-28 sm:px-8 sm:pb-28 sm:pt-32"
      >
        <motion.div variants={container} initial={reduce ? false : "hidden"} animate="show">
          <motion.div variants={item} className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/40 px-3.5 py-1.5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-medium tracking-wide text-foreground/90">{cv.availability}</span>
          </motion.div>

          <motion.h1
            variants={item}
            className="font-display text-5xl font-semibold leading-[0.95] tracking-tight text-balance sm:text-7xl md:text-8xl"
          >
            {cv.name}
          </motion.h1>

          <motion.p variants={item} className="mt-4 text-lg font-medium text-primary sm:text-2xl">
            {cv.role}
          </motion.p>

          <motion.p variants={item} className="mt-5 max-w-xl text-base leading-relaxed text-foreground/75 text-pretty sm:text-lg">
            {cv.tagline}
          </motion.p>

          <motion.div variants={item} className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {cv.location}
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />
            <span>{cv.focus}</span>
          </motion.div>

          {/* Stats */}
          <motion.div variants={item} className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:mt-10 sm:grid-cols-4 sm:gap-y-6">
            {cv.stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-3xl font-semibold text-foreground sm:text-4xl">{s.value}</p>
                <p className="eyebrow mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Signature skills */}
          <motion.div variants={item} className="mt-6 flex flex-wrap gap-2 sm:mt-8">
            {topSkills.map((s) => (
              <span key={s} className="rounded-full border border-border/70 bg-background/30 px-3 py-1 text-xs font-medium text-foreground/85 backdrop-blur-sm">
                {s}
              </span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10">
            <a href="#contact" className={cn(buttonVariants({ size: "lg" }), "gradient-warm rounded-full px-6 text-primary-foreground shadow-elevated")}>
              Get in touch <ArrowUpRight className="ml-1 h-4 w-4" />
            </a>
            <a
              href={cv.contact.resumeHref}
              download
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full border-border/70 bg-background/20 px-6 text-foreground backdrop-blur-sm hover:bg-background/40 hover:text-foreground")}
            >
              <Download className="mr-1 h-4 w-4" /> Download CV
            </a>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      {!reduce && (
        <motion.a
          href="#intro"
          aria-label="Scroll to introduction"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1.5"
          >
            <span className="text-[10px] uppercase tracking-[0.25em]">Scroll</span>
            <ArrowDown className="h-4 w-4" />
          </motion.span>
        </motion.a>
      )}
    </section>
  );
}
