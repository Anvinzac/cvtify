import { motion, useReducedMotion } from "framer-motion";
import { cv } from "@/lib/cvData";
import { SectionHeading } from "./SectionHeading";
import { ParallaxLayer } from "./ParallaxLayer";
import { Reveal } from "./Reveal";

function Bar({ name, level, delay }: { name: string; level: number; delay: number }) {
  const reduce = useReducedMotion();
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-foreground/90">{name}</span>
        <span className="font-display text-xs tabular-nums text-muted-foreground">{level}</span>
      </div>
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={reduce ? false : { width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

/** Grouped, animated skill bars beside a parallax photo collage. */
export function Skills() {
  const collage = [cv.gallery[0], cv.gallery[3], cv.gallery[4]];

  return (
    <section
      id="skills"
      aria-label="Skills"
      className="relative overflow-hidden border-t border-border/40 py-24 sm:py-32"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        {/* Collage */}
        <Reveal className="order-2 lg:order-1">
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <ParallaxLayer speed={0.06} className="relative">
              <img
                src={collage[0].src}
                alt={collage[0].alt}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full rounded-xl object-cover"
              />
            </ParallaxLayer>
            <ParallaxLayer speed={0.14} className="absolute -bottom-8 -right-3 w-2/5 sm:-right-6">
              <img
                src={collage[1].src}
                alt={collage[1].alt}
                loading="lazy"
                decoding="async"
                className="aspect-square w-full rounded-xl object-cover shadow-elevated"
              />
            </ParallaxLayer>
            <ParallaxLayer speed={0.1} className="absolute -left-3 top-10 w-1/3 sm:-left-6">
              <img
                src={collage[2].src}
                alt={collage[2].alt}
                loading="lazy"
                decoding="async"
                className="aspect-[3/4] w-full rounded-xl object-cover shadow-elevated"
              />
            </ParallaxLayer>
          </div>
        </Reveal>

        {/* Skill groups */}
        <div className="order-1 lg:order-2">
          <SectionHeading
            eyebrow="Capabilities"
            title={
              <>
                What I <span className="text-primary">bring</span>
              </>
            }
            description="A blend of design craft, technical fluency and leadership — the toolkit behind the work."
          />
          <div className="mt-10 space-y-9">
            {cv.skillGroups.map((group, gi) => (
              <Reveal key={group.title} delay={gi * 0.05}>
                <div>
                  <h3 className="eyebrow mb-4">{group.title}</h3>
                  <div className="space-y-4">
                    {group.items.map((s, si) => (
                      <Bar key={s.name} name={s.name} level={s.level} delay={si * 0.06} />
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
