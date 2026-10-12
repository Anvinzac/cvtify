import { useCallback, useEffect, useRef, useState } from "react";

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

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Hermite ease between two thresholds — flat outside, smooth in between. */
export function smoothstep(from: number, to: number, value: number) {
  const t = clamp01((value - from) / (to - from || 1));
  return t * t * (3 - 2 * t);
}

/**
 * Where each entry's segment of scroll goes.
 *
 * DWELL is the point: a reader needs the card to hold still long enough to
 * read it, so most of a segment is spent stationary and the handover to the
 * next card is squeezed into the tail. Without this the spotlight would be at
 * centre for an instant and the whole section would read as a blur.
 */
const HANDOVER_FROM = 0.68; // positional handover starts here, within a segment
const REVEAL_FROM = 0.03; // detail begins staging in almost immediately…
const REVEAL_TO = 0.44; //  …and is complete well before the handover

export interface DeckFrame {
  /** Continuous position in entries, including the handover ramp. */
  pos: number;
  /** Index of the entry holding the spotlight. */
  index: number;
  /** 0→1 through that entry's own segment. */
  u: number;
  /** 0→1 staging signal for the active card's detail. */
  reveal: number;
  /** 0→1 across the whole section, for section-wide parallax. */
  progress: number;
  /**
   * 0→1 as the section travels up into the viewport, before its stage sticks.
   *
   * Separate from `progress`, which is still 0 for the whole of that approach.
   * This is what the queue staggers its rows against: a mount-time entrance
   * would be useless here, because the section is in the DOM from page load and
   * the cascade would play off-screen long before anyone scrolled to it.
   */
  enter: number;
}

/**
 * Drives the conveyor from scroll position.
 *
 * Everything is a PURE FUNCTION of where the page is scrolled — never an
 * append-only log of what has been passed — so scrolling back up runs the whole
 * choreography backwards with no state to rewind.
 *
 * The raw scroll figure is smoothed toward its target each frame, which is what
 * gives the motion weight instead of tracking the wheel 1:1. `onFrame` is called
 * with the derived signals and is expected to write transforms directly to the
 * DOM; React state changes only when the active index does (six times), so a
 * scroll never triggers a re-render.
 */
export function useDeckScroll(count: number, enabled: boolean, onFrame?: (frame: DeckFrame) => void) {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const frozen = useRef(false);
  /** Smoothed position, in entries. */
  const scaled = useRef(0);
  const frame = useRef(0);
  const settled = useRef(true);
  const render = useRef(onFrame);
  render.current = onFrame;
  /** Recompute and paint immediately — used when the mounted cards change. */
  const refresh = useRef(() => {});

  /** How far the section has risen into the viewport, 0→1, before it sticks. */
  const enter = useRef(0);

  /** Raw, unsmoothed target derived from the section's position in the viewport. */
  const targetScaled = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return null;
    const offset = offsetTop();
    section.style.setProperty("--deck-offset", `${offset}px`);
    const rect = section.getBoundingClientRect();
    enter.current = clamp01(1 - (rect.top - offset) / Math.max(1, window.innerHeight - offset));
    const total = rect.height - (window.innerHeight - offset);
    if (total <= 0) return null;
    const travelled = Math.min(Math.max(offset - rect.top, 0), total);
    return (travelled / total) * count;
  }, [count]);

  const emit = useCallback(() => {
    const value = scaled.current;
    const index = Math.min(count - 1, Math.max(0, Math.floor(value)));
    const u = clamp01(value - index);
    render.current?.({
      pos: index + smoothstep(HANDOVER_FROM, 1, u),
      index,
      u,
      reveal: smoothstep(REVEAL_FROM, REVEAL_TO, u),
      progress: clamp01(value / Math.max(count, 1)),
      enter: enter.current,
    });
    setActive((current) => (current === index ? current : index));
  }, [count]);

  useEffect(() => {
    if (!enabled || count <= 0) return;

    const step = () => {
      frame.current = 0;
      const target = targetScaled();
      if (target === null) return;
      if (frozen.current) {
        // Hold where it is while someone types in it; the next release picks the
        // target up again from wherever the page now sits.
        settled.current = true;
        return;
      }
      const delta = target - scaled.current;
      // Below a frame's worth of movement, land exactly and stop the loop — an
      // idle rAF that never settles is a battery leak.
      scaled.current = Math.abs(delta) < 0.0004 ? target : scaled.current + delta * 0.18;
      settled.current = Math.abs(target - scaled.current) < 0.0004;
      emit();
      if (!settled.current) schedule();
    };

    const schedule = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(step);
    };

    const kick = () => {
      settled.current = false;
      schedule();
    };

    // Snap, then paint, rather than animating in from zero.
    refresh.current = () => {
      const target = targetScaled();
      if (target !== null) scaled.current = target;
      settled.current = true;
      emit();
    };
    refresh.current();

    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
    };
  }, [count, enabled, emit, targetScaled]);

  /** Page offset at which `index` sits mid-dwell, fully revealed. */
  const offsetFor = (index: number) => {
    const section = sectionRef.current;
    if (!section) return null;
    const offset = offsetTop();
    const rect = section.getBoundingClientRect();
    const total = rect.height - (window.innerHeight - offset);
    if (total <= 0) return null;
    const top = rect.top + window.scrollY - offset;
    return top + (total * (index + (REVEAL_TO + HANDOVER_FROM) / 2)) / count;
  };

  const jumpTo = (index: number) => {
    const offset = offsetFor(index);
    if (offset === null) return;
    window.scrollTo({ top: offset, behavior: "smooth" });
  };

  /**
   * Holds the conveyor still while someone is typing in it.
   *
   * Without this, any scroll during editing — the browser's own scroll-into-view
   * when a caret moves, or the page settling as a field grows a line — would
   * advance the deck out from under them mid-sentence.
   */
  const freeze = (value: boolean) => {
    frozen.current = value;
    if (!value) refresh.current();
  };

  return { sectionRef, active, jumpTo, freeze, refresh: () => refresh.current() };
}

export default useDeckScroll;
