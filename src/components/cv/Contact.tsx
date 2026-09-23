import { ArrowUpRight, Mail } from "lucide-react";
import { cv } from "@/lib/cvData";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

/** Closing call-to-action, contact links and footer. */
export function Contact() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="relative overflow-hidden border-t border-border/40">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[50vh] w-[80vw] -translate-x-1/2 rounded-full opacity-[0.12] blur-[130px]"
        style={{ background: "hsl(var(--primary))" }}
      />

      <div className="mx-auto max-w-4xl px-5 py-28 text-center sm:px-8 sm:py-36">
        <Reveal>
          <p className="eyebrow mb-6">Let's talk</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="font-display text-4xl font-semibold leading-[1.05] text-balance sm:text-6xl">
            Have a role worth <span className="text-primary">telling?</span>
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
            {cv.availability}. I read every message — email is the fastest way to reach me.
          </p>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`mailto:${cv.contact.email}`}
              className={cn(buttonVariants({ size: "lg" }), "gradient-warm rounded-full px-7 text-primary-foreground shadow-elevated")}
            >
              <Mail className="mr-1.5 h-4 w-4" /> {cv.contact.email}
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            {cv.contact.links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer noopener"
                className="link-underline inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label} <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </Reveal>
      </div>

      <div className="border-t border-border/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:px-8">
          <p>
            © {year} {cv.name}. Built as a scroll-driven media CV.
          </p>
          <a href="#top" className="link-underline transition-colors hover:text-foreground">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
