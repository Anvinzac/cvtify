import { forwardRef, MouseEvent, useRef } from "react";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Spotlight radius in px. */
  radius?: number;
  /** Maximum tilt in degrees. Set to 0 to disable tilt. */
  tilt?: number;
}

/**
 * Card wrapper that paints a cursor-tracking radial highlight via CSS
 * custom properties and optionally tilts on hover for a subtle 3D feel.
 * No re-renders — all updates flow through CSS variables.
 */
const SpotlightCard = forwardRef<HTMLDivElement, SpotlightCardProps>(
  ({ children, className = "", radius = 220, tilt = 4, onMouseMove, onMouseLeave, ...rest }, _ref) => {
    const innerRef = useRef<HTMLDivElement>(null);

    const handleMove = (e: MouseEvent<HTMLDivElement>) => {
      const el = innerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      el.style.setProperty("--sx", `${px}px`);
      el.style.setProperty("--sy", `${py}px`);
      if (tilt > 0) {
        const rx = ((py / rect.height) - 0.5) * -2 * tilt;
        const ry = ((px / rect.width) - 0.5) * 2 * tilt;
        el.style.setProperty("--rx", `${rx}deg`);
        el.style.setProperty("--ry", `${ry}deg`);
      }
      onMouseMove?.(e);
    };

    const handleLeave = (e: MouseEvent<HTMLDivElement>) => {
      const el = innerRef.current;
      if (el) {
        el.style.setProperty("--rx", `0deg`);
        el.style.setProperty("--ry", `0deg`);
      }
      onMouseLeave?.(e);
    };

    return (
      <div
        ref={innerRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className={`spotlight-card ${className}`}
        style={{
          // @ts-expect-error custom CSS var
          "--spot-r": `${radius}px`,
        }}
        {...rest}
      >
        {children}
        <div className="spotlight-layer pointer-events-none" aria-hidden />
      </div>
    );
  }
);
SpotlightCard.displayName = "SpotlightCard";
export default SpotlightCard;
