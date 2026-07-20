/**
 * Shared bottom navigation for insights and activity flows.
 *
 * Exports: BottomNav
 */

import {
  BarChart3,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  Sparkles,
} from "lucide-react";

interface BottomNavProps {
  navigate: (path: string) => void;
  active: string;
}

/** Fixed bottom tab bar linking activities, timeline, report, and recommendations. */
export function BottomNav({ navigate, active }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/85 backdrop-blur-xl border-t border-border/60 px-1 py-1.5 flex justify-around z-40">
      <NavBtn
        icon={<ClipboardList className="w-5 h-5" />}
        label="Activities"
        active={active === "dashboard"}
        onClick={() => navigate("/categories")}
      />
      <NavBtn
        icon={<CalendarClock className="w-5 h-5" />}
        label="Timeline"
        active={active === "timeline"}
        onClick={() => navigate("/timeline")}
      />
      <NavBtn
        icon={<BarChart3 className="w-5 h-5" />}
        label="Report"
        active={active === "report"}
        onClick={() => navigate("/report")}
      />
      <NavBtn
        icon={<Sparkles className="w-5 h-5" />}
        label="For You"
        active={active === "recommendations"}
        onClick={() => navigate("/recommendations")}
      />
      <NavBtn
        icon={<ChevronRight className="w-5 h-5" />}
        label="Dream Jobs"
        active={active === "dream-jobs"}
        onClick={() => navigate("/dream-jobs")}
      />
    </div>
  );
}

function NavBtn({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}
