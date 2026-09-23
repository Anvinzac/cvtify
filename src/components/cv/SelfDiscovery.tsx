import { cv } from "@/lib/cvData";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";
import { ParallaxLayer } from "./ParallaxLayer";

/** The "why": values that drive the work, over a faint parallax backdrop. */
export function SelfDiscovery() {
  const bg = cv.gallery[5];

  return (
    <section
      id="story"
      aria-label="Values and self-discovery"
      className="relative overflow-hidden border-t border-border/40 py-24 sm:py-32"
    >
      <div className="absolute inset-0 -z-10">
        <ParallaxLayer speed={0.1} className="h-full w-full">
          <img
            src={bg.src}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="h-[125%] w-full object-cover opacity-[0.12]"
          />
        </ParallaxLayer>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          align="center"
          eyebrow="Self-discovery"
          title={
            <>
              Why I do <span className="text-primary">the work</span>
            </>
          }
          description="Skills open the door; values decide what I do once I'm inside. These principles guide every project."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2">
          {cv.values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08} className="h-full">
              <article className="h-full rounded-2xl border border-border/60 bg-card/40 p-7 backdrop-blur-sm transition-colors hover:border-primary/40">
                <span className="font-display text-sm text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-2xl font-semibold text-foreground">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">{v.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
