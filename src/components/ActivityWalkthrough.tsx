import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, X, HelpCircle } from "lucide-react";
import { SKILL_EXPLANATIONS, VALUE_EXPLANATIONS } from "@/lib/explanations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  "Activity Name",
  "Group Size",
  "Duration",
  "Task Types",
  "Skills & Values",
];

interface ActivityWalkthroughProps {
  category: Category;
  onComplete: (activity: Activity) => void;
  onClose: () => void;
  initialActivity?: Activity;
}

export default function ActivityWalkthrough({ category, onComplete, onClose, initialActivity }: ActivityWalkthroughProps) {
  const isEditing = !!initialActivity;
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initialActivity?.name ?? "");
  const [groupSize, setGroupSize] = useState(initialActivity?.groupSize ?? "");
  const [duration, setDuration] = useState(initialActivity?.duration ?? "");
  const [taskTypes, setTaskTypes] = useState<string[]>(initialActivity?.taskTypes ?? []);
  const [skills, setSkills] = useState<string[]>(initialActivity?.skills ?? []);
  const [values, setValues] = useState<string[]>(initialActivity?.values ?? []);
  const [notes, setNotes] = useState(initialActivity?.personalNotes ?? "");
  const [isCustomName, setIsCustomName] = useState(initialActivity ? !category.examples.includes(initialActivity.name) : false);
  const [explainMode, setExplainMode] = useState(false);
  const [explainItem, setExplainItem] = useState<{ label: string; short: string; example: string } | null>(null);

  const autoAdvance = useCallback((nextStep: number) => {
    setTimeout(() => setStep(nextStep), 350);
  }, []);

  const toggleItem = (arr: string[], setArr: React.Dispatch<React.SetStateAction<string[]>>, item: string) =>
    setArr(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);

  const canNext = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return groupSize.length > 0;
    if (step === 2) return duration.length > 0;
    if (step === 3) return taskTypes.length > 0;
    if (step === 4) return skills.length > 0;
    return true;
  };

  const handleFinish = () => {
    const activity: Activity = {
      id: Date.now().toString(),
      categoryId: category.id,
      name: name.trim(),
      groupSize,
      duration,
      taskTypes,
      skills,
      values,
      personalNotes: notes,
    };
    onComplete(activity);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center gap-3">
        <button
          onClick={() => (step === 0 ? onClose() : setStep(step - 1))}
          className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">{category.emoji} {category.name}</p>
          <p className="text-sm font-semibold text-foreground">
            Step {step + 1} of {STEPS.length}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-5 mb-5">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-warm rounded-full"
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 px-5 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && (
              <StepLayout title="What activity were you involved in?" subtitle="Pick one or describe your own">
                <div className="space-y-2">
                  {category.examples.map((ex) => (
                    <OptionButton key={ex} label={ex} selected={name === ex} onClick={() => { setName(ex); setIsCustomName(false); autoAdvance(1); }} />
                  ))}
                  <OptionButton label="Other…" selected={isCustomName} onClick={() => { setIsCustomName(true); setName(""); }} />
                </div>
                <AnimatePresence>
                  {isCustomName && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Describe your activity" className="h-12 text-sm rounded-xl bg-card border-border mt-3" maxLength={100} autoFocus />
                    </motion.div>
                  )}
                </AnimatePresence>
              </StepLayout>
            )}

            {step === 1 && (
              <StepLayout title="How big was the team?" subtitle="The group you worked with">
                <div className="space-y-2">
                  {GROUP_SIZES.map((size) => (
                    <OptionButton key={size} label={size} selected={groupSize === size} onClick={() => { setGroupSize(size); autoAdvance(2); }} />
                  ))}
                </div>
              </StepLayout>
            )}

            {step === 2 && (
              <StepLayout title="How long were you involved?" subtitle="Total duration of this experience">
                <div className="space-y-2">
                  {DURATION_OPTIONS.map((d) => (
                    <OptionButton key={d} label={d} selected={duration === d} onClick={() => { setDuration(d); autoAdvance(3); }} />
                  ))}
                </div>
              </StepLayout>
            )}

            {step === 3 && (
              <StepLayout title="What types of tasks did you do?" subtitle="Select all that apply">
                <div className="flex flex-wrap gap-2">
                  {TASK_TYPES.map((t) => (
                    <ChipButton key={t} label={t} selected={taskTypes.includes(t)} onClick={() => toggleItem(taskTypes, setTaskTypes, t)} />
                  ))}
                </div>
              </StepLayout>
            )}

            {step === 4 && (
              <StepLayout title="What did you discover?" subtitle="Skills & values you realized">
                {/* Explain mode toggle */}
                <label className="flex items-center gap-2 mb-4 cursor-pointer select-none">
                  <div className={`w-9 h-5 rounded-full transition-colors relative ${explainMode ? 'bg-primary' : 'bg-muted'}`} onClick={() => setExplainMode(!explainMode)}>
                    <motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-primary-foreground shadow-sm" animate={{ left: explainMode ? 18 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                  </div>
                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Explain mode — tap any item to learn what it means</span>
                </label>

                <div className="mb-5">
                  <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SKILLS_OPTIONS.map((s) => (
                      <ChipButton
                        key={s}
                        label={s}
                        selected={skills.includes(s)}
                        onClick={() => {
                          if (explainMode) {
                            const info = SKILL_EXPLANATIONS[s];
                            if (info) setExplainItem({ label: s, ...info });
                          } else {
                            toggleItem(skills, setSkills, s);
                          }
                        }}
                        explainMode={explainMode}
                      />
                    ))}
                  </div>
                </div>
                <div className="mb-5">
                  <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Life Values</p>
                  <div className="flex flex-wrap gap-1.5">
                    {VALUES_OPTIONS.map((v) => (
                      <ChipButton
                        key={v}
                        label={v}
                        selected={values.includes(v)}
                        onClick={() => {
                          if (explainMode) {
                            const info = VALUE_EXPLANATIONS[v];
                            if (info) setExplainItem({ label: v, ...info });
                          } else {
                            toggleItem(values, setValues, v);
                          }
                        }}
                        explainMode={explainMode}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Notes</p>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What else did you learn?" className="rounded-xl bg-card border-border min-h-[60px] text-sm" maxLength={500} />
                </div>
              </StepLayout>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom button — only show on multi-select steps (3, 4) or custom name on step 0 */}
      {(step >= 3 || (step === 0 && isCustomName)) && (
        <div className="px-5 py-4 mt-auto">
          <Button
            onClick={step === STEPS.length - 1 ? handleFinish : () => setStep(step + 1)}
            disabled={!canNext()}
            className="w-full h-12 text-sm font-semibold rounded-xl gradient-warm border-0 text-primary-foreground shadow-elevated hover:opacity-90 transition-opacity disabled:opacity-30"
            size="lg"
          >
            {step === STEPS.length - 1 ? (
              <>Done <Check className="ml-2 w-4 h-4" /></>
            ) : (
              <>Continue <ArrowRight className="ml-2 w-4 h-4" /></>
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
                <h3 className="text-base font-bold text-foreground">{explainItem.label}</h3>
                <button onClick={() => setExplainItem(null)} className="text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-foreground mb-2">{explainItem.short}</p>
              <div className="bg-accent rounded-xl p-3">
                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Example for students</p>
                <p className="text-sm text-accent-foreground">{explainItem.example}</p>
              </div>
              <button
                onClick={() => {
                  const label = explainItem.label;
                  // Also select the item when tapping "Got it"
                  if (SKILLS_OPTIONS.includes(label)) toggleItem(skills, setSkills, label);
                  else if (VALUES_OPTIONS.includes(label)) toggleItem(values, setValues, label);
                  setExplainItem(null);
                }}
                className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold gradient-warm text-primary-foreground"
              >
                Got it — select this
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-0.5">{title}</h2>
      <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>
      {children}
    </div>
  );
}

function OptionButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border-2 transition-all text-sm font-medium ${
        selected
          ? "border-primary bg-accent text-accent-foreground"
          : "border-border bg-card text-foreground hover:border-primary/40"
      }`}
    >
      <div className="flex items-center justify-between">
        {label}
        {selected && (
          <div className="w-5 h-5 rounded-full gradient-warm flex items-center justify-center">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
      </div>
    </button>
  );
}

function ChipButton({ label, selected, onClick, explainMode }: { label: string; selected: boolean; onClick: () => void; explainMode?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        selected
          ? "gradient-warm text-primary-foreground border-transparent"
          : explainMode
            ? "bg-card text-primary border-primary/40 hover:border-primary"
            : "bg-card text-foreground border-border hover:border-primary/40"
      }`}
    >
      {explainMode && <HelpCircle className="w-3 h-3 inline mr-1 -mt-0.5" />}
      {label}
    </button>
  );
}
