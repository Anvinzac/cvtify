import { createElement, useCallback, useEffect, useLayoutEffect, useRef, useState, type ElementType, type KeyboardEvent } from "react";
import { Check, X } from "lucide-react";
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
        <button type="button" className="cv-field-clear" aria-label="Clear this field"
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
export function InlineList({ value, onChange, separator, variant, id, className = "", itemPlaceholder, addLabel = "Add", maxLength = 2000, ariaLabel, disabled, sample, suggestions, pickerTitle }: InlineListProps) {
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
    const joined = next.join(separator).slice(0, maxLength);
    lastEmitted.current = joined;
    setItems(next);
    onChange(joined);
  }
  function patch(index: number, text: string) {
    const next = [...items];
    next[index] = text;
    emit(next);
  }
  function add(after?: number) {
    const next = [...items];
    const at = after === undefined ? next.length : after + 1;
    next.splice(at, 0, "");
    setItems(next);
    focusElement(`${id}-item-${at}`);
  }
  function remove(index: number) {
    const next = items.filter((_, i) => i !== index);
    emit(next);
    focusElement(`${id}-add`);
  }
  function clearDemo() {
    emit([]);
    focusElement(`${id}-add`);
  }
  function openPicker() {
    setPickerOpen(true);
  }
  function handlePickerConfirm(selected: string[]) {
    emit(selected);
    setPickerOpen(false);
  }

  const rows = items.length ? items : [""];
  return (
    <div className={`cv-list cv-list-${variant} ${className}`.trim()} id={id} role="group" aria-label={ariaLabel}>
      {rows.map((item, i) => (
        <span className="cv-list-item" key={i}>
          {variant === "chips" && <span className="cv-chip-bullet" aria-hidden="true" />}
          <InlineText id={`${id}-item-${i}`} value={item} onChange={(text) => patch(i, text)} className="cv-list-text"
            placeholder={item && item.length ? undefined : itemPlaceholder} maxLength={200} disabled={disabled}
            ariaLabel={`${ariaLabel ?? "Item"} ${i + 1}`} onEnter={() => add(i)} />
          {!disabled && items.length > 0 && <button type="button" className="cv-list-remove" aria-label={`Remove ${item || "item"}`} onClick={() => remove(i)}><X size={12} /></button>}
        </span>
      ))}
      {demoed && !disabled && (
        <button type="button" className="cv-demo-clear-inline" aria-label="Clear these examples and add your own" onClick={clearDemo}><X size={12} /> Clear examples</button>
      )}
      {!disabled && suggestions && suggestions.length > 0 && variant === "chips" && (
        <button type="button" className="cv-list-pick" onClick={openPicker}>
          <Check size={12} aria-hidden="true" /> Pick from list
        </button>
      )}
      {!disabled && (items.length > 0 || variant === "bullets") && (
        <button type="button" id={`${id}-add`} className="cv-list-add" onClick={() => add()}>
          {variant === "chips" ? <span aria-hidden="true">＋</span> : <Check size={12} aria-hidden="true" />}{addLabel}
        </button>
      )}
      {pickerOpen && suggestions && (
        <ChipPicker
          suggestions={suggestions}
          selected={items}
          onConfirm={handlePickerConfirm}
          onClose={() => setPickerOpen(false)}
          title={pickerTitle ?? "Select skills"}
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
}

/** A compact month-range popover so dates stay structured (YYYY-MM) yet editable in place. */
export function InlinePeriod({ id, start, end, current, onChange, disabled }: InlinePeriodProps) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => { if (wrap.current && !wrap.current.contains(event.target as Node)) setOpen(false); };
    const onKey = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const label = `${monthLabel(start)} — ${current ? "Present" : monthLabel(end)}`;
  return (
    <span className="cv-period" ref={wrap}>
      <button type="button" id={id} className="cv-editable cv-period-trigger media-date" disabled={disabled}
        aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{label}</button>
      {open && (
        <span className="cv-popover" role="dialog" aria-label="Edit dates">
          <label className="cv-pop-field"><span>Start month</span>
            <input type="month" value={start} min="1000-01" max="9999-12" autoFocus onChange={(e) => onChange({ start: e.target.value })} /></label>
          <label className="cv-pop-field"><span>End month</span>
            <input type="month" value={end} disabled={current} min={start || "1000-01"} max="9999-12" onChange={(e) => onChange({ end: e.target.value })} /></label>
          <label className="cv-check"><input type="checkbox" checked={current} onChange={(e) => onChange({ current: e.target.checked })} /> I currently work here</label>
          <span className="cv-pop-actions"><button type="button" className="cv-pop-done" onClick={() => setOpen(false)}>Done</button></span>
        </span>
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

export function ChipPicker({ suggestions, selected, onConfirm, onClose, title = "Select options" }: ChipPickerProps) {
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
          <button type="button" className="cv-chip-picker-close" aria-label="Close" onClick={onClose}>
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
            Cancel
          </button>
          <button type="button" className="cv-chip-picker-confirm" onClick={confirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
