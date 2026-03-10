import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
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
}

export default function ActivityWalkthrough({ category, onComplete, onClose }: ActivityWalkthroughProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [duration, setDuration] = useState("");
  const [taskTypes, setTaskTypes] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [values, setValues] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [isCustomName, setIsCustomName] = useState(false);

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
    <div className="flex flex-col h-full">
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
                    <OptionButton key={ex} label={ex} selected={name === ex} onClick={() => { setName(ex); setIsCustomName(false); }} />
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
                    <OptionButton key={size} label={size} selected={groupSize === size} onClick={() => setGroupSize(size)} />
                  ))}
                </div>
              </StepLayout>
            )}

            {step === 2 && (
              <StepLayout title="How long were you involved?" subtitle="Total duration of this experience">
                <div className="space-y-2">
                  {DURATION_OPTIONS.map((d) => (
                    <OptionButton key={d} label={d} selected={duration === d} onClick={() => setDuration(d)} />
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
                <div className="mb-5">
                  <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SKILLS_OPTIONS.map((s) => (
                      <ChipButton key={s} label={s} selected={skills.includes(s)} onClick={() => toggleItem(skills, setSkills, s)} />
                    ))}
                  </div>
                </div>
                <div className="mb-5">
                  <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Life Values</p>
                  <div className="flex flex-wrap gap-1.5">
                    {VALUES_OPTIONS.map((v) => (
                      <ChipButton key={v} label={v} selected={values.includes(v)} onClick={() => toggleItem(values, setValues, v)} />
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

      {/* Bottom button */}
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

function ChipButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        selected
          ? "gradient-warm text-primary-foreground border-transparent"
          : "bg-card text-foreground border-border hover:border-primary/40"
      }`}
    >
      {label}
    </button>
  );
}
