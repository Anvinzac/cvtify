import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { cv } from "@/lib/cvData";
import { cn } from "@/lib/utils";

const LINKS = [
  { id: "experience", label: "Experience" },
  { id: "skills", label: "Skills" },
  { id: "story", label: "Story" },
  { id: "contact", label: "Contact" },
];

/** Fixed top navigation: identity mark + jump links with an active indicator. */
export function StageNav() {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState<string>("");

  useMotionValueEvent(scrollY, "change", (y) => setSolid(y > 80));

  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(
      Boolean,
    ) as HTMLElement[];
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const initials = cv.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-[65] transition-colors duration-500",
        solid ? "border-b border-border/60 bg-background/70 backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <nav
        aria-label="Section navigation"
        className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8"
      >
        <a href="#top" className="group flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-border/70 font-display text-sm text-primary transition-colors group-hover:border-primary/60">
            {initials}
          </span>
          <span className="hidden text-sm font-medium tracking-tight sm:block">{cv.name}</span>
        </a>

        <ul className="flex items-center gap-0.5 sm:gap-2">
          {LINKS.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                data-active={active === l.id}
                className={cn(
                  "link-underline px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
                  active === l.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </motion.header>
  );
}
