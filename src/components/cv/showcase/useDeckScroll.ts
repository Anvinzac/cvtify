import { useEffect, useRef, useState } from "react";

/**
 * How much room the sticky chrome needs at the top of the viewport.
 *
 * The root's scroll-padding-top is already the app's statement of exactly that
 * (set in editable-cv.css), so the deck reads it rather than hard-coding a
 * toolbar height — the bar wraps to a second row on phones.
 */
function offsetTop() {
  if (typeof document === "undefined") return 0;
  return parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
}

/**
 * Derives which entry is in the spotlight from the page's scroll position.
 *
 * The active index is a PURE FUNCTION of where the page is scrolled — never an
 * append-only log of what has been passed. That is what makes scrolling back up
 * un-dock entries correctly: there is no state to rewind, only a number
 * recomputed from the section's position in the viewport.
 *
 * Reads are rAF-batched and the listener is passive, so this costs one layout
 * read per frame while scrolling and nothing at all when the page is still.
 */
export function useDeckScroll(count: number, enabled: boolean) {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  /** Set while a field inside the spotlight has focus — see freeze() below. */
  const frozen = useRef(false);

  useEffect(() => {
    if (!enabled || count <= 0) return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;

      // Publish the chrome offset to CSS, which uses it to stick the stage
      // below the toolbar instead of behind it.
      const offset = offsetTop();
      section.style.setProperty("--deck-offset", `${offset}px`);
      if (frozen.current) return;

      const rect = section.getBoundingClientRect();
      // The stage sticks for the section's whole length, so the distance
      // available for stepping through entries is the section's height minus
      // that stage — a viewport less the chrome above it.
      const total = rect.height - (window.innerHeight - offset);
      if (total <= 0) return;

      const travelled = Math.min(Math.max(offset - rect.top, 0), total);
      const next = Math.min(count - 1, Math.floor((travelled / total) * count));
      setActive((current) => (current === next ? current : next));
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [count, enabled]);

  /** Page offset at which `index` holds the spotlight — the middle of its step. */
  const offsetFor = (index: number) => {
    const section = sectionRef.current;
    if (!section) return null;
    const offset = offsetTop();
    const rect = section.getBoundingClientRect();
    const total = rect.height - (window.innerHeight - offset);
    if (total <= 0) return null;
    const top = rect.top + window.scrollY - offset;
    return top + (total * (index + 0.5)) / count;
  };

  const jumpTo = (index: number) => {
    const offset = offsetFor(index);
    if (offset === null) return;
    window.scrollTo({ top: offset, behavior: "smooth" });
  };

  /**
   * Holds the spotlight still while someone is typing in it.
   *
   * Without this, any scroll during editing — the browser's own scroll-into-view
   * when a caret moves, or the page settling after a field grows a line — would
   * advance the deck out from under them mid-sentence.
   */
  const freeze = (value: boolean) => {
    frozen.current = value;
  };

  return { sectionRef, active, jumpTo, freeze };
}

export default useDeckScroll;
