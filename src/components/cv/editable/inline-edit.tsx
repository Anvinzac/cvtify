import { createElement, useCallback, useEffect, useLayoutEffect, useRef, useState, type ElementType, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { MonthPicker } from "./month-picker";
import { Check, Pencil, X } from "lucide-react";
import { monthLabel } from "@/lib/mediaProject";

type Tag = "span" | "div" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "small" | "b" | "strong" | "em" | "dt" | "dd";

/** Read a contentEditable element's text, normalizing non-breaking spaces. */
export function readText(el: HTMLElement, multiline: boolean) {
  const raw = (multiline ? el.innerText : el.textContent) ?? "";
  return raw.replace(/\u00a0/g, " ");
}
/** Move the caret to the end of an element's content. */
export function placeCaretEnd(el: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}
/** Focus the first editable node inside a container (used after adding list items). */
export function focusElement(id: string) {
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    el?.focus({ preventScroll: false });
    if (el) placeCaretEnd(el);
  });
}

interface InlineTextProps {
  value: string;
  onChange: (value: string) => void;
  as?: Tag;
  className?: string;
  id?: string;
  multiline?: boolean;
  placeholder?: string;
  maxLength?: number;
  ariaLabel?: string;
  disabled?: boolean;
  /** Single-line only: called on Enter instead of blurring. */
  onEnter?: () => void;
  /** The seeded demo text for this field. While the value still equals it, the
   *  field is treated as untouched example content: tapping wipes it, blurring
   *  with nothing typed restores it, and a clear (✕) affordance is offered. */
  sample?: string;
}

/**
 * A tap-to-type field that keeps the document's real typography.
 * React never renders its text child, so live re-renders cannot move the caret;
 * content is synced from `value` only while the field is not focused.
 */
export function InlineText({ value, onChange, as = "span", className = "", id, multiline = false, placeholder, maxLength = 600, ariaLabel, disabled, onEnter, sample }: InlineTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const editing = useRef(false);
  const restoreDemoOnBlur = useRef(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || editing.current) return;
    const next = value ?? "";
    if (readText(el, multiline) !== next) el.textContent = next;
  }, [value, multiline]);

  // Untouched example content only: the field still holds exactly the seeded text.
  const demoed = !!sample && sample.length > 0 && value === sample;

  const emit = useCallback((text: string) => {
    const clamped = maxLength && text.length > maxLength ? text.slice(0, maxLength) : text;
    if (clamped !== text && ref.current) { ref.current.textContent = clamped; placeCaretEnd(ref.current); }
    onChange(clamped);
  }, [maxLength, onChange]);

  function handleInput() {
    if (!ref.current) return;
    emit(readText(ref.current, multiline));
  }
  function handleFocus() {
    editing.current = true;
    restoreDemoOnBlur.current = demoed;
    // Wipe the example text so the first keystroke is the user's own.
    if (demoed && ref.current) { ref.current.textContent = ""; placeCaretEnd(ref.current); }
  }
  function handleBlur() {
    editing.current = false;
    if (!ref.current) return;
    const text = readText(ref.current, multiline);
    // Tapped a demo field, entered nothing, moved on → restore the example text.
    if (restoreDemoOnBlur.current && !text.trim()) {
      ref.current.textContent = sample ?? "";
      restoreDemoOnBlur.current = false;
      return;
    }
    restoreDemoOnBlur.current = false;
    let next = text;
    if (!multiline) next = next.replace(/\s+/g, " ").trim();
    ref.current.textContent = next;
    if (next !== value) onChange(next.slice(0, maxLength));
  }
  function handlePaste(event: React.ClipboardEvent) {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, multiline ? text : text.replace(/\s+/g, " "));
  }
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") { (event.target as HTMLElement).blur(); return; }
    if (event.key !== "Enter") return;
    if (multiline) { if (event.metaKey || event.ctrlKey) { event.preventDefault(); (event.target as HTMLElement).blur(); } return; }
    event.preventDefault();
    if (onEnter) onEnter();
    else (event.target as HTMLElement).blur();
  }
  function clearField() {
    const el = ref.current;
    if (!el) return;
    restoreDemoOnBlur.current = demoed;
    editing.current = true;
    el.textContent = "";
    el.focus();
    placeCaretEnd(el);
    onChange("");
  }

  const editable = createElement(as, {
    ref, id, className: `cv-editable ${className}`.trim(), contentEditable: !disabled, suppressContentEditableWarning: true,
    role: "textbox", tabIndex: disabled ? -1 : 0, "aria-multiline": multiline ? "true" : "false", "aria-label": ariaLabel,
    "data-placeholder": placeholder, "data-empty": !value ? "true" : undefined, spellCheck: true, enterKeyHint: multiline ? "enter" : "done",
    onInput: handleInput, onBlur: handleBlur, onFocus: handleFocus, onPaste: handlePaste, onKeyDown: handleKeyDown,
  } as Record<string, unknown>);

  // Show clear (✕) on any non-empty field, positioned at the right edge
  const showClear = !disabled && value.length > 0;
  if (!showClear && !sample) return editable;
  return (
    <div className="cv-demo-field" data-demoed={demoed && !disabled ? "true" : undefined}>
      {editable}
      {showClear && (
        <button type="button" className="cv-field-clear" aria-label="Xóa nội dung"
          onPointerDown={(event) => event.preventDefault()} onClick={clearField}><X size={13} /></button>
      )}
    </div>
  );
}
interface InlineListProps {
  value: string;
  onChange: (value: string) => void;
  separator: "\n" | ", ";
  variant: "bullets" | "chips";
  id?: string;
  className?: string;
  itemPlaceholder?: string;
  addLabel?: string;
  maxLength?: number;
  ariaLabel?: string;
  disabled?: boolean;
  /** Seeded demo text for the whole list; while value still equals it a clear (✕) is offered. */
  sample?: string;
  /** Predefined suggestions to pick from (for chips variant). Opens a modal picker. */
  suggestions?: string[];
  pickerTitle?: string;
}

/** An editable list (one result per line, or comma-separated skill chips). */
export function InlineList({ value, onChange, separator, variant, id, className = "", itemPlaceholder, addLabel = "Thêm", maxLength = 2000, ariaLabel, disabled, sample, suggestions, pickerTitle }: InlineListProps) {
  const delimiter = separator === "\n" ? "\n" : ",";
  const split = (raw: string) => raw.split(delimiter).map((s) => s.trim()).filter(Boolean);
  const [items, setItems] = useState<string[]>(() => split(value));
  const lastEmitted = useRef(items.join(separator));
  const [pickerOpen, setPickerOpen] = useState(false);

  useLayoutEffect(() => {
    if (value !== lastEmitted.current) { setItems(split(value)); lastEmitted.current = value; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const demoed = !!sample && sample.length > 0 && value === sample;

  function emit(next: string[]) {
    const joined = next.filter(Boolean).join(separator).slice(0, maxLength);
    lastEmitted.current = joined;
    setItems(next);
    onChange(joined);
  }
  function patch(index: number, text: string) {
    const next = [...items];
    next[index] = text;
    // Auto-append: if the last item is now non-empty, add a new empty row
    if (index === next.length - 1 && text.trim() && !disabled) {
      next.push("");
    }
    emit(next);
  }
  function remove(index: number) {
    const next = items.filter((_, i) => i !== index);
    // Ensure at least one empty row remains
    if (next.length === 0 || (next.length === 1 && !next[0].trim())) next.length = 0;
    emit(next.length ? next : [""]);
    focusElement(`${id}-item-0`);
  }
  function clearDemo() {
    emit([""]);
    focusElement(`${id}-item-0`);
  }
  function openPicker() {
    setPickerOpen(true);
  }
  function handlePickerConfirm(selected: string[]) {
    // Always keep one empty row at the end for typing
    emit([...selected, ""]);
    setPickerOpen(false);
  }

  // Always show one empty row at the bottom for direct typing (when not disabled)
  const displayItems = disabled ? items : [...items, ...items[items.length - 1]?.trim() ? [""] : []];
  const rows = displayItems.length ? displayItems : [""];
  const showPenButton = !disabled && suggestions && suggestions.length > 0 && variant === "chips";

  return (
    <div className={`cv-list cv-list-${variant} ${className}`.trim()} id={id} role="group" aria-label={ariaLabel}>
      {showPenButton && (
        <button type="button" className="cv-chips-edit" aria-label="Chỉnh sửa kỹ năng" onClick={openPicker}>
          <Pencil size={14} />
        </button>
      )}
      {rows.map((item, i) => (
        <span
          className={`cv-list-item ${!item.trim() && i === rows.length - 1 && !disabled ? "cv-list-item-empty" : ""}`}
          key={i}
          onClick={variant === "chips" && !disabled && suggestions && item.trim() ? openPicker : undefined}
          style={variant === "chips" && !disabled && suggestions && item.trim() ? { cursor: "pointer" } : undefined}
        >
          {variant === "chips" && <span className="cv-chip-bullet" aria-hidden="true" />}
          <InlineText id={`${id}-item-${i}`} value={item} onChange={(text) => patch(i, text)} className="cv-list-text"
            placeholder={item && item.length ? undefined : itemPlaceholder} maxLength={200} disabled={disabled}
            ariaLabel={`${ariaLabel ?? "Item"} ${i + 1}`} onEnter={() => focusElement(`${id}-item-${i + 1}`)} />
          {!disabled && item.trim() && variant !== "chips" && <button type="button" className="cv-list-remove" aria-label={`Remove ${item || "item"}`} onClick={() => remove(i)}><X size={12} /></button>}
        </span>
      ))}
      {demoed && !disabled && (
        <button type="button" className="cv-demo-clear-inline" aria-label="Xóa ví dụ và thêm nội dung của bạn" onClick={clearDemo}><X size={12} /> Xóa ví dụ</button>
      )}
      {pickerOpen && suggestions && (
        <ChipPicker
          suggestions={suggestions}
          selected={items.filter(Boolean)}
          onConfirm={handlePickerConfirm}
          onClose={() => setPickerOpen(false)}
          title={pickerTitle ?? "Chọn kỹ năng"}
        />
      )}
    </div>
  );
}

interface InlinePeriodProps {
  id: string;
  start: string;
  end: string;
  current: boolean;
  onChange: (fields: { start?: string; end?: string; current?: boolean }) => void;
  disabled?: boolean;
  /** Education has no "still here" state, and its onChange ignores `current`. */
  allowCurrent?: boolean;
}

/**
 * A month range picked from a two-step grid: years, then months.
 *
 * The panel is ANCHORED TO THE DATE — it opens right under (or above) the text
 * you tapped. That is the whole difference from the panel this replaced, which
 * was pinned to the bottom of the viewport on phones and so appeared hundreds
 * of pixels from the thing it was editing. It cannot be laid out in flow: the
 * period column is 140–180px wide and a 3×4 grid needs ~250px.
 */
export function InlinePeriod({ id, start, end, current, onChange, disabled, allowCurrent = true }: InlinePeriodProps) {
  const [open, setOpen] = useState(false);
  const [field, setField] = useState<"start" | "end">("start");
  const wrap = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => wrap.current?.querySelector<HTMLButtonElement>(".cv-period-trigger")?.focus());
  }, []);

  /**
   * Position the panel against the trigger, in viewport coordinates.
   *
   * It is rendered through a portal to <body> because the spotlight deck
   * scrolls its card, and an absolutely-positioned popover cannot escape a
   * scroll container — on a phone the lower half of the grid was clipped away
   * and unclickable. A body portal also leaves `.grad-document`'s
   * `isolation: isolate` behind, so the panel can simply out-stack the sticky
   * toolbar instead of nudging the page out from under it.
   */
  const place = useCallback(() => {
    const el = panel.current;
    const anchor = wrap.current;
    if (!el || !anchor) return;
    const a = anchor.getBoundingClientRect();
    const margin = 8;
    // What the sticky chrome needs at the top — the same figure the rest of the
    // app scrolls by.
    const safeTop = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const h = el.offsetHeight;
    const w = el.offsetWidth;

    let top = a.bottom + 6;
    const noRoomBelow = top + h > window.innerHeight - margin;
    if (noRoomBelow && a.top - 6 - h >= safeTop) top = a.top - 6 - h;
    top = Math.max(safeTop, Math.min(top, Math.max(safeTop, window.innerHeight - h - margin)));

    const left = Math.max(margin, Math.min(a.left, window.innerWidth - w - margin));

    el.style.top = `${Math.round(top)}px`;
    el.style.left = `${Math.round(left)}px`;
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      // The panel is portalled out of `wrap`, so both have to be consulted.
      if (wrap.current?.contains(target) || panel.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    // Capture, so a scroll inside the deck's card re-places it too.
    window.addEventListener("scroll", place, { passive: true, capture: true });
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", place, { capture: true } as EventListenerOptions);
      window.removeEventListener("resize", place);
    };
  }, [open, close, place]);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    // Re-place once the grid has painted, when its real height is known.
    const frame = requestAnimationFrame(place);
    return () => cancelAnimationFrame(frame);
  }, [open, field, place]);

  const label = `${monthLabel(start)} — ${current ? "Nay" : monthLabel(end)}`;
  const target = field === "start" ? start : end;

  return (
    <span className="cv-period" ref={wrap} data-editing={open ? "true" : undefined}>
      <button
        type="button" id={id} className="cv-editable cv-period-trigger media-date" disabled={disabled}
        aria-haspopup="dialog" aria-expanded={open}
        aria-label={`Sửa thời gian: ${label}`}
        onClick={() => { setField("start"); setOpen((o) => !o); }}
      >
        {label}
      </button>

      {open && createPortal(
        <div className="cv-cal-panel" ref={panel} role="dialog" aria-label="Chọn thời gian">
          <div className="cv-cal-tabs" role="tablist" aria-label="Mốc thời gian">
            <button
              type="button" role="tab" className="cv-cal-tab" aria-selected={field === "start"}
              onClick={() => setField("start")}
            >
              Bắt đầu<small>{monthLabel(start) || "—"}</small>
            </button>
            <button
              type="button" role="tab" className="cv-cal-tab" aria-selected={field === "end"}
              disabled={current}
              onClick={() => setField("end")}
            >
              Kết thúc<small>{current ? "Nay" : monthLabel(end) || "—"}</small>
            </button>
          </div>

          {/* Keyed by field: switching which end you are setting restarts the
              picker on the years, rather than leaving it deep in the months of
              the date you were just editing. */}
          <MonthPicker
            key={field}
            value={target}
            min={field === "end" ? start : undefined}
            ariaLabel={field === "start" ? "Tháng bắt đầu" : "Tháng kết thúc"}
            // One pass through the range: the start month hands over to the end
            // tab, and the end month is the last thing there is to choose, so it
            // dismisses the picker rather than leaving it open over the CV.
            onPick={(value) => {
              if (field === "start") {
                onChange({ start: value });
                if (!current) setField("end");
              } else {
                onChange({ end: value });
                close();
              }
            }}
          />

          {allowCurrent && (
            <label className="cv-cal-current">
              <input
                type="checkbox" checked={current}
                onChange={(event) => {
                  const next = event.target.checked;
                  onChange({ current: next });
                  if (next) setField("start");
                }}
              />
              Đến nay
            </label>
          )}
        </div>,
        document.body,
      )}
    </span>
  );
}

/** A translucent modal overlay for picking from a predefined list of chips. */
interface ChipPickerProps {
  suggestions: string[];
  selected: string[];
  onConfirm: (selected: string[]) => void;
  onClose: () => void;
  title?: string;
}

export function ChipPicker({ suggestions, selected, onConfirm, onClose, title = "Chọn" }: ChipPickerProps) {
  const [picks, setPicks] = useState<Set<string>>(() => new Set(selected));

  function toggle(item: string) {
    const next = new Set(picks);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    setPicks(next);
  }

  function confirm() {
    onConfirm(Array.from(picks));
    onClose();
  }

  return (
    <div className="cv-chip-picker-overlay" onClick={onClose}>
      <div className="cv-chip-picker" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="cv-chip-picker-header">
          <h3>{title}</h3>
          <button type="button" className="cv-chip-picker-close" aria-label="Đóng" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="cv-chip-picker-grid">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              className={`cv-chip-picker-item ${picks.has(item) ? "selected" : ""}`}
              onClick={() => toggle(item)}
            >
              {item}
              {picks.has(item) && <Check size={14} />}
            </button>
          ))}
        </div>
        <div className="cv-chip-picker-actions">
          <button type="button" className="cv-chip-picker-cancel" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="cv-chip-picker-confirm" onClick={confirm}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
