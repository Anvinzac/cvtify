/**
 * Typewriter placeholder cycle for StoryTextarea when empty and unfocused.
 *
 * Exports: useStoryTextareaTypewriter
 */

import { useEffect, useRef, useState } from "react";

/** Rotating typewriter placeholder while the field is empty and not focused. */
export function useStoryTextareaTypewriter(
  rotatingPlaceholders: string[],
  value: string,
  focused: boolean
): string {
  const [placeholder, setPlaceholder] = useState(rotatingPlaceholders[0] ?? "");
  const phIndex = useRef(0);
  const charIndex = useRef(0);
  const direction = useRef<"typing" | "deleting" | "pausing">("typing");

  useEffect(() => {
    if (!rotatingPlaceholders.length) return;
    if (value.length > 0 || focused) return;

    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const target = rotatingPlaceholders[phIndex.current] ?? "";
      const len = charIndex.current;

      if (direction.current === "typing") {
        if (len < target.length) {
          charIndex.current = len + 1;
          setPlaceholder(target.slice(0, charIndex.current));
          timer = setTimeout(tick, 38 + Math.random() * 30);
        } else {
          direction.current = "pausing";
          timer = setTimeout(tick, 1600);
        }
      } else if (direction.current === "pausing") {
        direction.current = "deleting";
        timer = setTimeout(tick, 60);
      } else {
        if (len > 0) {
          charIndex.current = len - 1;
          setPlaceholder(target.slice(0, charIndex.current));
          timer = setTimeout(tick, 16);
        } else {
          phIndex.current = (phIndex.current + 1) % rotatingPlaceholders.length;
          direction.current = "typing";
          timer = setTimeout(tick, 200);
        }
      }
    };
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, [rotatingPlaceholders, value, focused]);

  return placeholder;
}
