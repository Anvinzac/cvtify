import { useState, useCallback, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, X, HelpCircle, Sparkles, ChevronDown } from "lucide-react";
import { SKILL_EXPLANATIONS, VALUE_EXPLANATIONS } from "@/lib/explanations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Confetti from "@/components/fx/Confetti";
import SparkleBurst from "@/components/fx/SparkleBurst";
import {
  Category,
  GROUP_SIZES,
  DURATION_OPTIONS,
  TASK_TYPES,
  SKILLS_OPTIONS,
  VALUES_OPTIONS,
  Activity,
} from "@/lib/data";

const STEPS = [
  { label: "Name", icon: "📝" },
  { label: "Team", icon: "👥" },
  { label: "Duration", icon: "⏱" },
  { label: "When", icon: "📅" },
  { label: "Tasks", icon: "🔧" },
  { label: "Discovery", icon: "✨" },
];

const NOW = new Date();
const CURRENT_YEAR = NOW.getFullYear();
const CURRENT_MONTH = NOW.getMonth();
/** 20 years back, newest first. Covers school years through present. */
const PICKER_YEARS = Array.from({ length: 20 }, (_, i) => CURRENT_YEAR - i);
const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface ActivityWalkthroughProps {
  category: Category;
  onComplete: (activity: Activity) => void;
  onClose: () => void;
  initialActivity?: Activity;
}

export default function ActivityWalkthrough({
  category,
  onComplete,
  onClose,
  initialActivity,
}: ActivityWalkthroughProps) {
  const isEditing = !!initialActivity;
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initialActivity?.name ?? "");
  const [groupSize, setGroupSize] = useState(initialActivity?.groupSize ?? "");
  const [duration, setDuration] = useState(initialActivity?.duration ?? "");
  const [taskTypes, setTaskTypes] = useState<string[]>(initialActivity?.taskTypes ?? []);
  const [skills, setSkills] = useState<string[]>(initialActivity?.skills ?? []);
  const [values, setValues] = useState<string[]>(initialActivity?.values ?? []);
  const [notes, setNotes] = useState(initialActivity?.personalNotes ?? "");
  const [occurredAt, setOccurredAt] = useState<number | undefined>(
    initialActivity?.occurredAt
  );
  const [datePrecision, setDatePrecision] = useState<"year" | "month" | undefined>(
    initialActivity?.datePrecision
  );
  const initialDate = initialActivity?.occurredAt
    ? new Date(initialActivity.occurredAt)
    : null;
  const [whenYear, setWhenYear] = useState<number | null>(
    initialDate ? initialDate.getFullYear() : null
  );
  const [whenMonth, setWhenMonth] = useState<number | null>(
    initialDate && initialActivity?.datePrecision !== "year"
      ? initialDate.getMonth()
      : null
  );
  const [isCustomName, setIsCustomName] = useState(
    initialActivity ? !category.examples.includes(initialActivity.name) : false
  );
  const [explainMode, setExplainMode] = useState(false);
  const [explainItem, setExplainItem] = useState<{
    label: string;
    short: string;
    example: string;
  } | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);

  const emitBurst = (e: MouseEvent) => {
    const id = Date.now() + Math.random();
    setBursts((b) => [...b, { id, x: e.clientX, y: e.clientY }]);
  };
  const settleBurst = (id: number) =>
    setBursts((b) => b.filter((bx) => bx.id !== id));

  const autoAdvance = useCallback(
    (nextStep: number) => {
      setTimeout(() => setStep(nextStep), 300);
    },
    []
  );

  const toggleItem = (
    arr: string[],
    setArr: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => setArr(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);

  const canNext = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return groupSize.length > 0;
    if (step === 2) return duration.length > 0;
    if (step === 3) return true; // "When" is optional
    if (step === 4) return taskTypes.length > 0;
    if (step === 5) return skills.length > 0;
    return true;
  };

  const handleFinish = () => {
    setCelebrating(true);
    const activity: Activity = {
      id: initialActivity?.id ?? Date.now().toString(),
      categoryId: category.id,
      name: name.trim(),
      groupSize,
      duration,
      taskTypes,
      skills,
      values,
      personalNotes: notes,
      occurredAt,
      datePrecision,
    };
    setTimeout(() => {
      onComplete(activity);
    }, 800);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="px-5 pt-4 pb-2 flex items-center gap-3">
        <button
          onClick={() => (step === 0 ? onClose() : setStep(step - 1))}
          className="w-9 h-9 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{category.emoji}</span>
            <span className="text-xs text-muted-foreground font-medium">
              {category.name}
            </span>
            {isEditing && (
              <span className="text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded-md font-medium">
                Edit
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Step indicators */}
      <div className="px-5 mb-4">
        <div className="flex items-center gap-1.5 mb-3">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                className={`w-full h-1 rounded-full transition-colors duration-300 ${
                  i < step
                    ? "bg-primary"
                    : i === step
                    ? "bg-primary"
                    : "bg-muted"
                }`}
                animate={{
                  scaleX: i === step ? [1, 1.04, 1] : 1,
                }}
                transition={{ duration: 0.5 }}
              />
              <span
                className={`text-[9px] font-semibold transition-colors duration-300 ${
                  i <= step ? "text-primary" : "text-muted-foreground/40"
                }`}
              >
                {s.icon}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs font-semibold text-muted-foreground text-center">
          Step {step + 1} of {STEPS.length} · {STEPS[step].label}
        </p>
      </div>

      {/* Step content */}
      <div className="flex-1 px-5 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {step === 0 && (
              <StepLayout
                title="What activity were you involved in?"
                subtitle="Pick from common examples or write your own"
              >
                <div className="space-y-2">
                  {category.examples.map((ex) => (
                    <OptionButton
                      key={ex}
                      label={ex}
                      selected={name === ex}
                      onClick={() => {
                        setName(ex);
                        setIsCustomName(false);
                        autoAdvance(1);
                      }}
                    />
                  ))}
                  <OptionButton
                    label="Something else..."
                    selected={isCustomName}
                    onClick={() => {
                      setIsCustomName(true);
                      setName("");
                    }}
                    icon={<Sparkles className="w-3.5 h-3.5" />}
                  />
                </div>
                <AnimatePresence>
                  {isCustomName && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Describe your activity..."
                        className="h-12 text-sm rounded-xl bg-card border-border mt-3 focus:ring-2 focus:ring-primary/20 transition-shadow"
                        maxLength={100}
                        autoFocus
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </StepLayout>
            )}

            {step === 1 && (
              <StepLayout
                title="How big was the team?"
                subtitle="The group you worked with"
              >
                <div className="space-y-2">
                  {GROUP_SIZES.map((size) => (
                    <OptionButton
                      key={size}
                      label={size}
                      selected={groupSize === size}
                      onClick={() => {
                        setGroupSize(size);
                        autoAdvance(2);
                      }}
                    />
                  ))}
                </div>
              </StepLayout>
            )}

            {step === 2 && (
              <StepLayout
                title="How long were you involved?"
                subtitle="Total duration of this experience"
              >
                <div className="space-y-2">
                  {DURATION_OPTIONS.map((d) => (
                    <OptionButton
                      key={d}
                      label={d}
                      selected={duration === d}
                      onClick={() => {
                        setDuration(d);
                        autoAdvance(3);
                      }}
                    />
                  ))}
                </div>
              </StepLayout>
            )}

            {step === 3 && (
              <StepLayout
                title="When did this happen?"
                subtitle="Tap a year to pick a month — optional"
              >
                <div className="rounded-2xl border border-border bg-card overflow-hidden mb-4">
                  <div className="max-h-[58vh] overflow-y-auto divide-y divide-border/60">
                    {PICKER_YEARS.map((y) => {
                      const expanded = whenYear === y;
                      const maxMonth = y === CURRENT_YEAR ? CURRENT_MONTH : 11;
                      return (
                        <div key={y}>
                          <button
                            onClick={() => {
                              if (expanded) {
                                setWhenYear(null);
                              } else {
                                setWhenYear(y);
                                if (whenMonth !== null && whenMonth <= maxMonth) {
                                  setOccurredAt(new Date(y, whenMonth, 1).getTime());
                                } else {
                                  setWhenMonth(null);
                                }
                              }
                            }}
                            className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                              expanded
                                ? "bg-accent/40"
                                : "hover:bg-accent/20"
                            }`}
                          >
                            <span className={`text-base font-bold tracking-tight ${
                              expanded ? "text-primary" : "text-foreground"
                            }`}>
                              {y}
                            </span>
                            <span className="flex items-center gap-2">
                              {y === CURRENT_YEAR && (
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                  This year
                                </span>
                              )}
                              <motion.span
                                animate={{ rotate: expanded ? 180 : 0 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="text-muted-foreground"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </motion.span>
                            </span>
                          </button>
                          <AnimatePresence initial={false}>
                            {expanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.22, ease: [0.22, 0.7, 0.35, 1] }}
                                className="overflow-hidden"
                              >
                                <div className="grid grid-cols-4 gap-1.5 px-3 pb-3 pt-1">
                                  {MONTH_LABELS.map((m, i) => {
                                    const disabled = i > maxMonth;
                                    const selected = whenMonth === i;
                                    return (
                                      <button
                                        key={m}
                                        disabled={disabled}
                                        onClick={() => {
                                          setWhenMonth(i);
                                          setOccurredAt(new Date(y, i, 1).getTime());
                                          setDatePrecision("month");
                                          autoAdvance(4);
                                        }}
                                        className={`py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                                          disabled
                                            ? "bg-muted/30 text-muted-foreground/40 border-transparent cursor-not-allowed"
                                            : selected
                                            ? "gradient-warm text-primary-foreground border-transparent shadow-sm"
                                            : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-accent/30"
                                        }`}
                                      >
                                        {m}
                                      </button>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (whenYear !== null) {
                      // Save year-only: place at Dec 31 so it sorts to the
                      // top of its year section on the timeline.
                      setWhenMonth(null);
                      setOccurredAt(new Date(whenYear, 11, 31).getTime());
                      setDatePrecision("year");
                    } else {
                      setWhenYear(null);
                      setWhenMonth(null);
                      setOccurredAt(undefined);
                      setDatePrecision(undefined);
                    }
                    autoAdvance(4);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
                >
                  {whenYear !== null
                    ? `Just "${whenYear}" — skip month`
                    : "Skip — I'm not sure"}
                </button>
              </StepLayout>
            )}

            {step === 4 && (
              <StepLayout
                title="What kinds of tasks did you do?"
                subtitle="Select all that apply"
              >
                <div className="flex flex-wrap gap-2">
                  {TASK_TYPES.map((t) => (
                    <ChipButton
                      key={t}
                      label={t}
                      selected={taskTypes.includes(t)}
                      onClick={() => toggleItem(taskTypes, setTaskTypes, t)}
                    />
                  ))}
                </div>
              </StepLayout>
            )}

            {step === 5 && (
              <StepLayout
                title="What did you discover about yourself?"
                subtitle="Skills you practiced and values you realized"
              >
                {/* Explain mode toggle */}
                <label className="flex items-center gap-2.5 mb-5 cursor-pointer select-none">
                  <div
                    className={`relative w-10 h-5.5 rounded-full transition-colors duration-300 ${
                      explainMode ? "bg-primary" : "bg-muted"
                    }`}
                    onClick={() => setExplainMode(!explainMode)}
                  >
                    <motion.div
                      className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm"
                      animate={{ left: explainMode ? 21 : 3 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-medium">
                      Explain mode — tap to learn what each skill means
                    </span>
                  </div>
                </label>

                <div className="mb-5">
                  <p className="text-xs font-bold text-foreground mb-2.5 uppercase tracking-wider">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SKILLS_OPTIONS.map((s) => (
                      <ChipButton
                        key={s}
                        label={s}
                        selected={skills.includes(s)}
                        onClick={(e) => {
                          if (explainMode) {
                            const info = SKILL_EXPLANATIONS[s];
                            if (info) setExplainItem({ label: s, ...info });
                          } else {
                            if (!skills.includes(s)) emitBurst(e);
                            toggleItem(skills, setSkills, s);
                          }
                        }}
                        explainMode={explainMode}
                      />
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <p className="text-xs font-bold text-foreground mb-2.5 uppercase tracking-wider">
                    Life values
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {VALUES_OPTIONS.map((v) => (
                      <ChipButton
                        key={v}
                        label={v}
                        selected={values.includes(v)}
                        onClick={(e) => {
                          if (explainMode) {
                            const info = VALUE_EXPLANATIONS[v];
                            if (info) setExplainItem({ label: v, ...info });
                          } else {
                            if (!values.includes(v)) emitBurst(e);
                            toggleItem(values, setValues, v);
                          }
                        }}
                        explainMode={explainMode}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-foreground mb-2.5 uppercase tracking-wider">
                    Personal notes
                  </p>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What else did you learn or discover? Anything memorable?"
                    className="rounded-xl bg-card border-border min-h-[72px] text-sm focus:ring-2 focus:ring-primary/20 transition-shadow resize-none"
                    maxLength={500}
                  />
                </div>
              </StepLayout>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom button */}
      {(step >= 4 || (step === 0 && isCustomName)) && (
        <div className="px-5 py-4 mt-auto">
          <Button
            onClick={step === STEPS.length - 1 ? handleFinish : () => setStep(step + 1)}
            disabled={!canNext()}
            className="w-full h-12 text-sm font-semibold rounded-xl gradient-warm border-0 text-primary-foreground shadow-elevated hover:opacity-95 active:scale-[0.98] transition-all duration-200 disabled:opacity-30 disabled:scale-100"
            size="lg"
          >
            {step === STEPS.length - 1 ? (
              <>
                {isEditing ? "Save changes" : "Complete"}
                <Check className="ml-2 w-4 h-4" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      )}

      {/* Explain popup */}
      <AnimatePresence>
        {explainItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-end justify-center bg-background/60 backdrop-blur-sm"
            onClick={() => setExplainItem(null)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="w-full mx-3 mb-4 bg-card rounded-2xl border border-border shadow-elevated p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-bold text-foreground">
                  {explainItem.label}
                </h3>
                <button
                  onClick={() => setExplainItem(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-foreground mb-3 leading-relaxed">
                {explainItem.short}
              </p>
              <div className="bg-accent/60 rounded-xl p-3.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Student example
                </p>
                <p className="text-sm text-accent-foreground leading-relaxed">
                  {explainItem.example}
                </p>
              </div>
              <Button
                onClick={() => {
                  const label = explainItem.label;
                  if (SKILLS_OPTIONS.includes(label))
                    toggleItem(skills, setSkills, label);
                  else if (VALUES_OPTIONS.includes(label))
                    toggleItem(values, setValues, label);
                  setExplainItem(null);
                }}
                className="w-full mt-4 h-11 text-sm font-semibold rounded-xl gradient-warm border-0 text-primary-foreground"
              >
                Got it — add this
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration overlay */}
      <AnimatePresence>
        {celebrating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm overflow-hidden"
          >
            {/* Expanding ring */}
            <motion.span
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 6, opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute w-32 h-32 rounded-full border-2 border-primary/40"
            />
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-center relative z-10"
            >
              <motion.div
                animate={{ scale: [1, 1.18, 1], rotate: [0, 6, -4, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 rounded-2xl gradient-warm flex items-center justify-center mx-auto mb-4 shadow-glow"
              >
                <Sparkles className="w-10 h-10 text-primary-foreground" />
              </motion.div>
              <motion.p
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-lg font-bold text-foreground"
              >
                {isEditing ? "Updated!" : "Experience captured!"}
              </motion.p>
              <motion.p
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-sm text-muted-foreground mt-1"
              >
                {isEditing ? "Changes saved" : "Adding to your profile..."}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti on completion (not on edit) */}
      {celebrating && !isEditing && (
        <Confetti count={56} />
      )}

      {/* Sparkle bursts for chip selections */}
      <SparkleBurst bursts={bursts} onSettle={settleBurst} />
    </div>
  );
}

function StepLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-1 leading-tight">
        {title}
      </h2>
      <p className="text-sm text-muted-foreground mb-5">{subtitle}</p>
      {children}
    </div>
  );
}

function OptionButton({
  label,
  selected,
  onClick,
  icon,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      className={`w-full text-left p-3.5 rounded-xl border-2 transition-all duration-200 text-sm font-medium group ${
        selected
          ? "border-primary bg-accent/60 text-accent-foreground shadow-sm"
          : "border-border bg-card text-foreground hover:border-primary/30 hover:bg-accent/20"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span>{label}</span>
        </div>
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="w-5 h-5 rounded-full gradient-warm flex items-center justify-center"
          >
            <Check className="w-3 h-3 text-primary-foreground" />
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}

function ChipButton({
  label,
  selected,
  onClick,
  explainMode,
}: {
  label: string;
  selected: boolean;
  onClick: (e: MouseEvent) => void;
  explainMode?: boolean;
}) {
  return (
    <motion.button
      onClick={(e) => onClick(e as unknown as MouseEvent)}
      whileTap={{ scale: 0.94 }}
      className={`px-3.5 py-2 rounded-full text-xs font-medium border transition-all duration-200 ${
        selected
          ? "gradient-warm text-primary-foreground border-transparent shadow-sm"
          : explainMode
          ? "bg-card text-primary border-primary/40 hover:border-primary hover:bg-accent/30"
          : "bg-card text-foreground border-border hover:border-primary/30 hover:bg-accent/20"
      }`}
    >
      {explainMode && <HelpCircle className="w-3 h-3 inline mr-1 -mt-0.5" />}
      {label}
    </motion.button>
  );
}
