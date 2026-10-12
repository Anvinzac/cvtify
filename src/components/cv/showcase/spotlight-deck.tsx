import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useReducedMotion } from "framer-motion";
import { InlineList, InlineText, InlinePeriod } from "../editable/inline-edit";
import { budgetFor, PhotoTrack, type MediaBudget } from "../editable/inline-media";
import { AIAssistButton } from "../editable/AIAssistButton";
import {
  emptyEntry, journeyEntries, lines, monthLabel,
  type EntryBucketKey, type EntryItem, type GradProject, type JourneyEntry,
} from "@/lib/mediaProject";
import { useDeckScroll } from "./useDeckScroll";
import "./spotlight-deck.css";

/**
 * SpotlightDeck — the three experience buckets as one scroll-driven conveyor.
 *
 *   dock      every entry already passed, as chips, laid out HORIZONTALLY and
 *             scrolled sideways: a phone has no vertical room to stack them.
 *   spotlight the entry currently being read, expanded.
 *   queue     the bottom half: every entry still to come, titles only.
 *
 * Scrolling moves entries queue → spotlight → dock. Nothing here is animated by
 * a timeline: the whole arrangement is a function of the active index, which is
 * itself a function of scroll position (see useDeckScroll), so scrolling back up
 * runs the conveyor backwards for free.
 *
 * `editable` turns the spotlight card's text into the same inline editors the
 * rest of the editor uses; the read-only mode renders the identical layout
 * without them.
 */

interface SpotlightDeckProps {
  project: GradProject;
  /** Seeded demo content, so untouched example text is recognisable. */
  samples?: GradProject;
  onChange?: (updater: (draft: GradProject) => GradProject) => void;
  editable?: boolean;
  number?: string;
  title?: string;
  /**
   * Bring this entry into the spotlight and focus its title. Only the active
   * entry's card is rendered, so a field in any other entry cannot simply be
   * focused by id — the deck has to scroll to it first. Used by the toolbar's
   * "Thêm" menu and by the deck's own add button.
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

  const { sectionRef, active, jumpTo, freeze } = useDeckScroll(items.length, live);
  const dockRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState<string | undefined>();
  const budget: MediaBudget = useMemo(() => budgetFor(project), [project]);

  // Keep the newest chip in view as the dock fills. Horizontal only — the dock
  // never grows a second row.
  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;
    dock.scrollTo({ left: dock.scrollWidth, behavior: "smooth" });
  }, [active]);

  // Scroll the requested entry into the spotlight, then focus its title once
  // the card has actually rendered.
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

  const current = items[Math.min(active, items.length - 1)];
  const passed = items.slice(0, active);
  const upcoming = items.slice(active + 1);

  return (
    <section
      className="grad-section grad-deck"
      data-section="journey"
      data-deck="live"
      ref={sectionRef}
      style={{ "--deck-count": items.length } as React.CSSProperties}
      onKeyDown={onKeyDown}
    >
      <div className="grad-deck-stage">
        <div className="grad-deck-head">
          {header}
          <span className="grad-deck-count" aria-hidden="true">
            {active + 1}/{items.length}
          </span>
        </div>

        {/* Dock — passed entries, horizontal, review only. */}
        <div
          className="grad-deck-dock" ref={dockRef} role="list"
          aria-label="Các mục đã xem"
          data-empty={passed.length === 0 ? "true" : undefined}
        >
          {passed.map((item, index) => (
            <button
              type="button" role="listitem" key={item.entry.id}
              className="grad-deck-chip"
              onClick={() => jumpTo(index)}
            >
              <span className="grad-deck-chip-kicker">{item.bucketLabel}</span>
              <span className="grad-deck-chip-title">{item.entry.title || "Chưa đặt tên"}</span>
            </button>
          ))}
        </div>

        {/* Spotlight — the entry being read. */}
        <div className="grad-deck-spot" key={current.entry.id}>
          <Card
            item={current} editable={editable} samples={samples} budget={budget} spotlight
            onPatch={(fields) => patch(current.bucket, current.entry.id, fields)}
            onRemove={() => remove(current.bucket, current.entry.id)}
            onFreeze={freeze}
          />
        </div>

        {/* Queue — the bottom half: everything still to come. */}
        <ol className="grad-deck-queue" aria-label="Các mục tiếp theo">
          {upcoming.map((item, index) => (
            <li key={item.entry.id}>
              <button type="button" className="grad-deck-queue-row" onClick={() => jumpTo(active + 1 + index)}>
                <span className="grad-deck-queue-kicker">{item.bucketLabel}</span>
                <span className="grad-deck-queue-title">{item.entry.title || "Chưa đặt tên"}</span>
                <span className="grad-deck-queue-period">
                  {item.entry.startDate ? monthLabel(item.entry.startDate) : ""}
                </span>
              </button>
            </li>
          ))}
          {editable && (
            <li>
              <button type="button" className="grad-deck-queue-row is-add" onClick={add}>
                + Thêm mục
              </button>
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

/** One entry, rendered the same whether it is in the spotlight or in the static fallback. */
function Card({ item, editable, samples, budget, spotlight, onPatch, onRemove, onFreeze }: CardProps) {
  const { entry, bucket, bucketLabel, indexInBucket } = item;
  const sample = samples?.[bucket]?.[indexInBucket];
  const highlights = lines(entry.highlights).filter(Boolean);
  const period = `${monthLabel(entry.startDate)} — ${entry.current ? "Nay" : monthLabel(entry.endDate)}`;

  return (
    <article
      className="grad-deck-card"
      data-spotlight={spotlight ? "true" : undefined}
      // Freezing on focusin / thawing on focusout is what keeps the conveyor
      // from advancing out from under someone mid-sentence.
      onFocus={editable ? () => onFreeze(true) : undefined}
      onBlur={editable ? (event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) onFreeze(false);
      } : undefined}
    >
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
          <InlineText as="span" className="grad-entry-lead" id={`${entry.id}-description`}
            value={entry.description} onChange={(v) => onPatch({ description: v })}
            sample={sample?.description} placeholder="Một dòng mô tả ngắn gọn..." ariaLabel="Mô tả ngắn"
            multiline maxLength={2000} />
          <AIAssistButton context="summary" currentValue={entry.description} role={entry.title}
            organization={entry.organization} onApply={(description) => onPatch({ description })} />
        </>
      ) : (
        <>
          <h3 className="grad-entry-title">{entry.title}</h3>
          <span className="grad-entry-org">{entry.organization}</span>
          {entry.description && <span className="grad-entry-lead">{entry.description}</span>}
        </>
      )}

      <div className="grad-deck-card-detail">
        {editable ? (
          <>
            <InlineText as="span" className="grad-entry-location" id={`${entry.id}-location`}
              value={entry.location} onChange={(v) => onPatch({ location: v })}
              sample={sample?.location} placeholder="Địa điểm" ariaLabel="Địa điểm" maxLength={200} />
            <InlineList
              value={entry.highlights} onChange={(v) => onPatch({ highlights: v })}
              separator={"\n"} variant="bullets"
              itemPlaceholder="Thêm điểm nổi bật..." addLabel="+ Thêm"
              className="grad-entry-highlights" id={`${entry.id}-highlights`}
              sample={sample?.highlights} ariaLabel="Điểm nổi bật" maxLength={4000}
            />
            <AIAssistButton context="highlights" currentValue={entry.highlights} role={entry.title}
              organization={entry.organization} onApply={(h) => onPatch({ highlights: h })} />
            <PhotoTrack
              id={`photos-${entry.id}`} photos={entry.photos}
              onChange={(photos) => onPatch({ photos })}
              maxPhotos={4} budget={budget} label="Thêm ảnh"
            />
          </>
        ) : (
          <>
            {entry.location && <span className="grad-entry-location">{entry.location}</span>}
            {highlights.length > 0 && (
              <ul className="grad-entry-highlights">
                {highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            )}
            {entry.photos.length > 0 && (
              <div className="grad-entry-photos">
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
