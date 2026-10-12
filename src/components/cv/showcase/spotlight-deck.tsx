import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { InlineList, InlineText, InlinePeriod } from "../editable/inline-edit";
import { budgetFor, PhotoTrack, type MediaBudget } from "../editable/inline-media";
import { AIAssistButton } from "../editable/AIAssistButton";
import {
  emptyEntry, journeyEntries, lines, monthLabel,
  type EntryBucketKey, type EntryItem, type GradProject, type JourneyEntry,
} from "@/lib/mediaProject";
import { useDeckScroll, type DeckFrame } from "./useDeckScroll";
import "./spotlight-deck.css";

/**
 * SpotlightDeck — the three experience buckets as one scroll-driven conveyor.
 *
 *   dock      every entry already passed, as chips, laid out HORIZONTALLY and
 *             scrolled sideways: a phone has no vertical room to stack them.
 *   spotlight the entry being read, whose detail stages in bit by bit.
 *   queue     the bottom half: every entry still to come, titles only.
 *
 * HOW THE MOTION WORKS
 *
 * Nothing here runs on a timeline. Every moving thing is a function of a single
 * smoothed scroll figure (see useDeckScroll), so the whole choreography plays
 * backwards when you scroll back up, and stops exactly where you stop.
 *
 * Three cards are mounted at once — leaving, spotlit, arriving — and their
 * transforms are written straight to the DOM from the frame callback. React
 * state changes only when the active index does, six times in the whole
 * section, so scrolling never triggers a render. Only `transform`, `opacity`
 * and custom properties are touched: no layout, no paint, all compositor.
 *
 * Within a card, detail is staged by a single `--reveal` custom property that
 * CSS windows per element, so the lead, then the location, then each highlight,
 * then the photos arrive one after another as you keep scrolling — rather than
 * the card appearing all at once.
 */

/**
 * How far a card travels per unit of distance from the spotlight, as a
 * fraction of the spotlight's height (clamped, so it stays sane on any screen).
 *
 * This has to be large. At a short travel the outgoing and incoming cards sit
 * on top of each other through the handover and their titles cross-fade
 * superimposed, which reads as a rendering glitch rather than as motion. Paired
 * with the steep opacity curve below, a card is well clear of the frame before
 * the next one is legible.
 */
const TRAVEL_RATIO = 0.46;
const TRAVEL_MIN = 150;
const TRAVEL_MAX = 280;
/** Opaque until this far from centre, invisible beyond OPACITY_TO. */
const OPACITY_FROM = 0.12;
const OPACITY_TO = 0.6;
/** Depth cue: layers behind the cards move at a fraction of their rate. */
const GHOST_RATE = 0.38;
const QUEUE_RATE = 0.12;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
/** Hermite ease, mirrored so a larger input means a smaller output. */
const falloff = (value: number) => {
  const t = clamp01((value - OPACITY_TO) / (OPACITY_FROM - OPACITY_TO));
  return t * t * (3 - 2 * t);
};

interface SpotlightDeckProps {
  project: GradProject;
  /** Seeded demo content, so untouched example text is recognisable. */
  samples?: GradProject;
  onChange?: (updater: (draft: GradProject) => GradProject) => void;
  editable?: boolean;
  number?: string;
  title?: string;
  /**
   * Bring this entry into the spotlight and focus its title. Only a window of
   * cards is mounted, so a field in a distant entry cannot simply be focused by
   * id — the deck has to scroll to it first.
   */
  focusEntryId?: string;
  onFocusHandled?: () => void;
}

export function SpotlightDeck({
  project, samples, onChange, editable = false, number = "02", title = "Hành Trình",
  focusEntryId, onFocusHandled,
}: SpotlightDeckProps) {
  const reduced = useReducedMotion();
  const items = useMemo(() => journeyEntries(project), [project]);
  // "Tĩnh" and prefers-reduced-motion both mean: no conveyor at all. The deck
  // falls back to a plain linear list, which is also the complete reading for
  // anyone the scroll choreography would not serve.
  const still = project.settings.motion === "still" || !!reduced;
  const live = !still && items.length > 0;

  const stageRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const queueRef = useRef<HTMLOListElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const cards = useRef(new Map<number, HTMLElement>());
  /** Measured once per layout, so the frame loop never reads geometry. */
  const spotHeight = useRef(0);
  const spotRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState<string | undefined>();

  /**
   * The per-frame DOM write. Deliberately imperative: putting this through
   * React state would re-render three card subtrees sixty times a second.
   */
  const onFrame = useCallback((f: DeckFrame) => {
    const travel = Math.max(TRAVEL_MIN, Math.min(TRAVEL_MAX, (spotHeight.current || 420) * TRAVEL_RATIO));
    cards.current.forEach((el, index) => {
      const d = index - f.pos;
      const away = Math.abs(d);
      // Arriving cards rise from below and settle; leaving cards lift away.
      const y = d * travel;
      const scale = 1 - 0.06 * Math.min(away, 1.6);
      el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
      el.style.opacity = falloff(away).toFixed(3);
      // Past the fade-out distance a card is represented by its chip or its
      // queue row instead; hiding it also takes it out of the tab order.
      el.style.visibility = away >= OPACITY_TO ? "hidden" : "visible";
      el.style.zIndex = String(20 - Math.round(away * 10));
      // Detail staging: only the spotlit card stages. Cards already passed stay
      // fully open so they do not appear to close as they leave.
      el.style.setProperty("--reveal", index === f.index ? f.reveal.toFixed(3) : index < f.index ? "1" : "0");
    });

    const stage = stageRef.current;
    if (stage) stage.style.setProperty("--deck-progress", f.progress.toFixed(4));
    // Parallax: each layer moves at its own rate, which is what reads as depth.
    if (ghostRef.current) {
      ghostRef.current.style.transform = `translate3d(0, ${(-f.pos * travel * GHOST_RATE).toFixed(2)}px, 0)`;
      ghostRef.current.style.opacity = (0.05 + 0.05 * (1 - Math.abs(f.u - 0.5) * 2)).toFixed(3);
    }
    if (queueRef.current) {
      queueRef.current.style.transform = `translate3d(0, ${(f.u * travel * QUEUE_RATE).toFixed(2)}px, 0)`;
    }
  }, []);

  const { sectionRef, active, jumpTo, freeze, refresh } = useDeckScroll(items.length, live, onFrame);
  const budget: MediaBudget = useMemo(() => budgetFor(project), [project]);

  /** Place newly mounted cards before paint, so an arriving card never flashes
      at its untransformed position for a frame. */
  useLayoutEffect(() => {
    if (!live) return;
    spotHeight.current = spotRef.current?.clientHeight ?? 0;
    refresh();
  }, [active, live, refresh]);

  // Travel distance is derived from the stage, so it has to be re-measured when
  // the stage changes size — reading it inside the frame loop would force a
  // layout every frame.
  useEffect(() => {
    if (!live) return;
    const measure = () => {
      spotHeight.current = spotRef.current?.clientHeight ?? 0;
      refresh();
    };
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [live, refresh]);

  // Keep the newest chip in view as the dock fills. Horizontal only — the dock
  // never grows a second row.
  useEffect(() => {
    dockRef.current?.scrollTo({ left: dockRef.current.scrollWidth, behavior: "smooth" });
  }, [active]);

  useEffect(() => {
    const wanted = focusEntryId ?? pending;
    if (!wanted) return;
    const index = items.findIndex((item) => item.entry.id === wanted);
    if (index < 0) return;
    if (live) jumpTo(index);
    const frame = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        document.getElementById(`${wanted}-title`)?.focus({ preventScroll: true });
        setPending(undefined);
        onFocusHandled?.();
      }),
    );
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusEntryId, pending]);

  const patch = (bucket: EntryBucketKey, id: string, fields: Partial<EntryItem>) =>
    onChange?.((draft) => ({
      ...draft,
      [bucket]: draft[bucket].map((e) => (e.id === id ? { ...e, ...fields } : e)),
    }) as GradProject);

  const remove = (bucket: EntryBucketKey, id: string) =>
    onChange?.((draft) => ({ ...draft, [bucket]: draft[bucket].filter((e) => e.id !== id) }) as GradProject);

  const add = () => {
    // Built outside the updater so the new entry's id is known here and can be
    // handed straight to the focus effect above.
    const entry = emptyEntry();
    onChange?.((draft) => ({ ...draft, activities: [...draft.activities, entry] }));
    setPending(entry.id);
  };

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    const keys: Record<string, number> = {
      ArrowRight: active + 1, ArrowDown: active + 1,
      ArrowLeft: active - 1, ArrowUp: active - 1,
      Home: 0, End: items.length - 1,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    jumpTo(Math.min(Math.max(next, 0), items.length - 1));
  }

  const header = (
    <div className="grad-section-header">
      <span className="grad-section-number" aria-hidden="true">{number}</span>
      <h2 className="grad-heading" data-section-heading>{title}</h2>
    </div>
  );

  if (!live) {
    return (
      <section className="grad-section grad-deck-static" data-section="journey" data-deck="static">
        {header}
        <div className="grad-entries">
          {items.map((item) => (
            <div className="grad-entry" key={item.entry.id} data-entry-card>
              <Card
                item={item} editable={editable} samples={samples} budget={budget}
                onPatch={(fields) => patch(item.bucket, item.entry.id, fields)}
                onRemove={() => remove(item.bucket, item.entry.id)}
                onFreeze={freeze}
              />
            </div>
          ))}
          {editable && <button type="button" className="cv-add-entry" onClick={add}>+ Thêm mục</button>}
        </div>
      </section>
    );
  }

  const passed = items.slice(0, active);
  const upcoming = items.slice(active + 1);
  // Leaving, spotlit, arriving. Mounting only these three keeps the heavy
  // editable subtrees (photo tracks, inline lists) to a workable number while
  // still giving every transition both of its cards.
  const window3 = items
    .map((item, index) => ({ item, index }))
    .filter(({ index }) => Math.abs(index - active) <= 1);

  return (
    <section
      className="grad-section grad-deck"
      data-section="journey"
      data-deck="live"
      ref={sectionRef}
      style={{ "--deck-count": items.length } as CSSProperties}
      onKeyDown={onKeyDown}
    >
      <div className="grad-deck-stage" ref={stageRef}>
        <div className="grad-deck-head">
          {header}
          <span className="grad-deck-count" aria-hidden="true">{active + 1}/{items.length}</span>
        </div>

        {/* Dock — passed entries, horizontal, review only. */}
        <div
          className="grad-deck-dock" ref={dockRef} role="list"
          aria-label="Các mục đã xem"
          data-empty={passed.length === 0 ? "true" : undefined}
        >
          <AnimatePresence initial={false}>
            {passed.map((item, index) => (
              <motion.button
                type="button" role="listitem" key={item.entry.id}
                className="grad-deck-chip"
                layout
                initial={{ opacity: 0, scale: 0.7, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: "auto" }}
                exit={{ opacity: 0, scale: 0.7, width: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.7 }}
                onClick={() => jumpTo(index)}
              >
                <span className="grad-deck-chip-kicker">{item.bucketLabel}</span>
                <span className="grad-deck-chip-title">{item.entry.title || "Chưa đặt tên"}</span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Spotlight — a stack of absolutely positioned cards moved by the frame
            callback. The ghost numeral behind them is the slowest layer. */}
        <div className="grad-deck-spot" ref={spotRef}>
          <div className="grad-deck-ghost" aria-hidden="true" ref={ghostRef}>
            {String(active + 1).padStart(2, "0")}
          </div>
          {window3.map(({ item, index }) => (
            <div
              className="grad-deck-slot"
              key={item.entry.id}
              data-card-index={index}
              ref={(el) => {
                if (el) cards.current.set(index, el);
                else cards.current.delete(index);
              }}
            >
              <Card
                item={item} editable={editable} samples={samples} budget={budget} spotlight
                onPatch={(fields) => patch(item.bucket, item.entry.id, fields)}
                onRemove={() => remove(item.bucket, item.entry.id)}
                onFreeze={freeze}
              />
            </div>
          ))}
        </div>

        {/* Queue — the bottom half: everything still to come. */}
        <ol className="grad-deck-queue" ref={queueRef} aria-label="Các mục tiếp theo">
          <AnimatePresence initial={false}>
            {upcoming.map((item, index) => (
              <motion.li
                key={item.entry.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12, height: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 36, mass: 0.7 }}
              >
                <button type="button" className="grad-deck-queue-row" onClick={() => jumpTo(active + 1 + index)}>
                  <span className="grad-deck-queue-kicker">{item.bucketLabel}</span>
                  <span className="grad-deck-queue-title">{item.entry.title || "Chưa đặt tên"}</span>
                  <span className="grad-deck-queue-period">
                    {item.entry.startDate ? monthLabel(item.entry.startDate) : ""}
                  </span>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
          {editable && (
            <li>
              <button type="button" className="grad-deck-queue-row is-add" onClick={add}>+ Thêm mục</button>
            </li>
          )}
        </ol>
      </div>
    </section>
  );
}

interface CardProps {
  item: JourneyEntry;
  editable: boolean;
  samples?: GradProject;
  budget: MediaBudget;
  spotlight?: boolean;
  onPatch: (fields: Partial<EntryItem>) => void;
  onRemove: () => void;
  onFreeze: (value: boolean) => void;
}

/**
 * One entry.
 *
 * `deck-part` marks everything that stages in on scroll. Each part declares the
 * window of `--reveal` it occupies; CSS does the interpolation, so adding a
 * part is a one-line change and costs no JavaScript.
 */
const part = (from: number, span = 0.3): CSSProperties =>
  ({ "--from": from, "--span": span }) as CSSProperties;

function Card({ item, editable, samples, budget, spotlight, onPatch, onRemove, onFreeze }: CardProps) {
  const { entry, bucket, bucketLabel, indexInBucket } = item;
  const sample = samples?.[bucket]?.[indexInBucket];
  const highlights = lines(entry.highlights).filter(Boolean);
  const period = `${monthLabel(entry.startDate)} — ${entry.current ? "Nay" : monthLabel(entry.endDate)}`;

  return (
    <article
      className="grad-deck-card"
      data-spotlight={spotlight ? "true" : undefined}
      // Freezing on focusin and thawing on focusout is what keeps the conveyor
      // from advancing out from under someone mid-sentence.
      onFocus={editable ? () => onFreeze(true) : undefined}
      onBlur={editable ? (event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) onFreeze(false);
      } : undefined}
    >
      {/* The head rides the card's own entrance — it is the entry's identity,
          so it is never staged behind a scroll window. */}
      <header className="grad-deck-card-head">
        <span className="grad-deck-kicker">{bucketLabel}</span>
        {editable ? (
          <InlinePeriod
            id={`${entry.id}-period`}
            start={entry.startDate} end={entry.endDate} current={entry.current}
            onChange={({ start, end, current }) =>
              onPatch({
                ...(start !== undefined ? { startDate: start } : {}),
                ...(end !== undefined ? { endDate: end } : {}),
                ...(current !== undefined ? { current } : {}),
              })
            }
          />
        ) : (
          <span className="grad-entry-period-text">{period}</span>
        )}
        {editable && (
          <button type="button" className="cv-list-remove" onClick={onRemove} aria-label="Xóa mục">×</button>
        )}
      </header>

      {editable ? (
        <>
          <InlineText as="h3" className="grad-entry-title" id={`${entry.id}-title`}
            value={entry.title} onChange={(v) => onPatch({ title: v })}
            sample={sample?.title} placeholder="Tên vị trí / hoạt động" ariaLabel="Tên vị trí" maxLength={200} />
          <InlineText as="span" className="grad-entry-org" id={`${entry.id}-organization`}
            value={entry.organization} onChange={(v) => onPatch({ organization: v })}
            sample={sample?.organization} placeholder="Tổ chức" ariaLabel="Tổ chức" maxLength={200} />
          <div className="deck-part" style={part(0, 0.3)}>
            <InlineText as="span" className="grad-entry-lead" id={`${entry.id}-description`}
              value={entry.description} onChange={(v) => onPatch({ description: v })}
              sample={sample?.description} placeholder="Một dòng mô tả ngắn gọn..." ariaLabel="Mô tả ngắn"
              multiline maxLength={2000} />
            <AIAssistButton context="summary" currentValue={entry.description} role={entry.title}
              organization={entry.organization} onApply={(description) => onPatch({ description })} />
          </div>
        </>
      ) : (
        <>
          <h3 className="grad-entry-title">{entry.title}</h3>
          <span className="grad-entry-org">{entry.organization}</span>
          {entry.description && (
            <span className="grad-entry-lead deck-part" style={part(0, 0.3)}>{entry.description}</span>
          )}
        </>
      )}

      <div className="grad-deck-card-detail">
        {editable ? (
          <>
            <div className="deck-part" style={part(0.18, 0.26)}>
              <InlineText as="span" className="grad-entry-location" id={`${entry.id}-location`}
                value={entry.location} onChange={(v) => onPatch({ location: v })}
                sample={sample?.location} placeholder="Địa điểm" ariaLabel="Địa điểm" maxLength={200} />
            </div>
            <div className="deck-part" style={part(0.3, 0.34)}>
              <InlineList
                value={entry.highlights} onChange={(v) => onPatch({ highlights: v })}
                separator={"\n"} variant="bullets"
                itemPlaceholder="Thêm điểm nổi bật..." addLabel="+ Thêm"
                className="grad-entry-highlights" id={`${entry.id}-highlights`}
                sample={sample?.highlights} ariaLabel="Điểm nổi bật" maxLength={4000}
              />
              <AIAssistButton context="highlights" currentValue={entry.highlights} role={entry.title}
                organization={entry.organization} onApply={(h) => onPatch({ highlights: h })} />
            </div>
            <div className="deck-part" style={part(0.62, 0.34)}>
              <PhotoTrack
                id={`photos-${entry.id}`} photos={entry.photos}
                onChange={(photos) => onPatch({ photos })}
                maxPhotos={4} budget={budget} label="Thêm ảnh"
              />
            </div>
          </>
        ) : (
          <>
            {entry.location && (
              <span className="grad-entry-location deck-part" style={part(0.18, 0.26)}>{entry.location}</span>
            )}
            {highlights.length > 0 && (
              <ul className="grad-entry-highlights">
                {highlights.map((h, i) => (
                  // Each bullet gets its own window, so they land one after
                  // another instead of as a block.
                  <li key={i} className="deck-part" style={part(0.3 + i * 0.08, 0.3)}>{h}</li>
                ))}
              </ul>
            )}
            {entry.photos.length > 0 && (
              <div className="grad-entry-photos deck-part" style={part(0.66, 0.34)}>
                {entry.photos.map((photo) => (
                  <img key={photo.id} src={photo.src} alt={photo.alt || photo.caption || ""}
                    style={{ objectPosition: photo.position }} width={photo.width} height={photo.height}
                    loading="lazy" decoding="async" />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
}

export default SpotlightDeck;
