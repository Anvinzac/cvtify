import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cv } from "@/lib/cvData";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035 } },
};

const word: Variants = {
  hidden: { opacity: 0.18 },
  show: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

/**
 * The short version: an editorial statement that illuminates word by word
 * as it scrolls into view. Sets the self-discovery tone.
 */
export function Manifesto() {
  const reduce = useReducedMotion();
  const words = cv.manifesto.split(" ");

  return (
    <section id="intro" aria-label="Introduction" className="relative overflow-hidden py-28 sm:py-40">
      {/* Ambient accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.15] blur-[120px]"
        style={{ background: "hsl(var(--primary))" }}
      />

      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <p className="eyebrow mb-8">The short version</p>

        <motion.p
          variants={reduce ? undefined : container}
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          className="font-display text-2xl font-normal leading-[1.35] text-pretty sm:text-4xl md:text-[2.75rem] md:leading-[1.28]"
        >
          {words.map((w, i) => (
            <motion.span key={i} variants={word} className="mr-[0.28em] inline-block">
              {w}
            </motion.span>
          ))}
        </motion.p>

        <div className="mt-12 flex items-center gap-4">
          <span className="h-px w-16 bg-border" />
          <span className="font-display text-lg text-foreground/80">{cv.name}</span>
        </div>
      </div>
    </section>
  );
}
