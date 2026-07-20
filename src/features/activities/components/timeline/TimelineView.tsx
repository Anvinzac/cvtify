/**
 * Chronological activity timeline — orchestrator component.
 */

import { useMemo, useRef } from "react";
import type { Activity } from "@/features/activities/types";
import { groupByMonth } from "./lib/grouping";
import { TimelineEmpty } from "./TimelineEmpty";
import { NowMarker, OriginMarker, YearDivider } from "./TimelineMarkers";
import { BandSection } from "./BandSection";

interface TimelineViewProps {
  activities: Activity[];
  onEdit?: (activity: Activity) => void;
  onRemove?: (id: string) => void;
  /** When true, omit the empty-state — useful when the parent renders its own. */
  hideEmptyState?: boolean;
}

/** Scrollable vertical timeline of captured activities. */
export default function TimelineView({
  activities,
  onEdit,
  onRemove,
  hideEmptyState,
}: TimelineViewProps) {
  const bands = useMemo(() => groupByMonth(activities), [activities]);
  const containerRef = useRef<HTMLDivElement>(null);

  if (activities.length === 0 && !hideEmptyState) {
    return <TimelineEmpty />;
  }

  return (
    <div ref={containerRef} className="relative pl-14 pr-1 pb-32">
      <div
        aria-hidden
        className="absolute left-[26px] top-2 bottom-24 w-px"
        style={{
          background:
            "linear-gradient(to bottom, transparent, hsl(32 95% 60% / 0.4) 8%, hsl(174 55% 50% / 0.4) 60%, transparent)",
        }}
      />

      <NowMarker />

      {bands.map((band, bi) => {
        const prev = bands[bi - 1];
        const showYearDivider = !prev || prev.year !== band.year;
        return (
          <div key={band.key}>
            {showYearDivider && <YearDivider year={band.year} isFirst={bi === 0} />}
            <BandSection
              band={band}
              isFirst={bi === 0}
              onEdit={onEdit}
              onRemove={onRemove}
            />
          </div>
        );
      })}

      <OriginMarker />
    </div>
  );
}
