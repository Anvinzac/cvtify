import { cv } from "@/lib/cvData";
import { ParallaxLayer } from "./ParallaxLayer";
import { Reveal } from "./Reveal";

/** Full-bleed montage: columns of photos drifting at different scroll speeds. */
export function Gallery() {
  return (
    <section id="gallery" aria-label="Gallery" className="relative border-t border-border/40 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow mb-3">In frames</p>
          <h2 className="font-display text-3xl font-semibold text-balance sm:text-4xl">
            Moments along the way
          </h2>
        </Reveal>
      </div>

      <div className="mx-auto mt-12 max-w-6xl columns-2 gap-3 px-5 sm:columns-3 sm:gap-4 sm:px-8">
        {cv.gallery.map((p, i) => (
          <ParallaxLayer
            key={p.src}
            speed={(i % 2 === 0 ? 1 : -1) * (0.04 + (i % 3) * 0.02)}
            className="mb-3 break-inside-avoid sm:mb-4"
          >
            <img
              src={p.src}
              alt={p.alt}
              loading="lazy"
              decoding="async"
              className="w-full rounded-lg object-cover"
            />
          </ParallaxLayer>
        ))}
      </div>
    </section>
  );
}
