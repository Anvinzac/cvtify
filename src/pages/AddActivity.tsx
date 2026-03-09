import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CATEGORIES,
  GROUP_SIZES,
  DURATION_OPTIONS,
  TASK_TYPES,
  SKILLS_OPTIONS,
  VALUES_OPTIONS,
  Activity,
} from "@/lib/data";
import { useAppState } from "@/context/AppContext";

const STEPS = [
  "Activity Name",
  "Group Size",
  "Duration",
  "Task Types",
  "Skills & Values",
];

const AddActivity = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { addActivity } = useAppState();
  const category = CATEGORIES.find((c) => c.id === categoryId);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [duration, setDuration] = useState("");
  const [taskTypes, setTaskTypes] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [values, setValues] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

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
      categoryId: categoryId!,
      name: name.trim(),
      groupSize,
      duration,
      taskTypes,
      skills,
      values,
      personalNotes: notes,
    };
    addActivity(activity);
    navigate("/dashboard");
  };

  if (!category) return null;

  return (
    <div className="min-h-[100dvh] flex flex-col gradient-soft">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => (step === 0 ? navigate(-1) : setStep(step - 1))}
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">{category.emoji} {category.name}</p>
          <p className="text-sm font-semibold text-foreground">
            Step {step + 1} of {STEPS.length}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 mb-6">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-warm rounded-full"
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 px-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 && (
              <StepLayout
                title="What activity were you involved in?"
                subtitle="Give it a short, descriptive name"
              >
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Summer marketing internship"
                  className="h-14 text-base rounded-xl bg-card border-border"
                  maxLength={100}
                  autoFocus
                />
              </StepLayout>
            )}

            {step === 1 && (
              <StepLayout
                title="How big was the team?"
                subtitle="The group, team, or company you worked with"
              >
                <div className="space-y-2">
                  {GROUP_SIZES.map((size) => (
                    <OptionButton
                      key={size}
                      label={size}
                      selected={groupSize === size}
                      onClick={() => setGroupSize(size)}
                    />
                  ))}
                </div>
              </StepLayout>
            )}

            {step === 2 && (
              <StepLayout
                title="How long were you involved?"
                subtitle="The total duration of this experience"
              >
                <div className="space-y-2">
                  {DURATION_OPTIONS.map((d) => (
                    <OptionButton
                      key={d}
                      label={d}
                      selected={duration === d}
                      onClick={() => setDuration(d)}
                    />
                  ))}
                </div>
              </StepLayout>
            )}

            {step === 3 && (
              <StepLayout
                title="What types of tasks did you do?"
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

            {step === 4 && (
              <StepLayout
                title="What did you discover about yourself?"
                subtitle="Skills you developed & values you realized"
              >
                <div className="mb-6">
                  <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS_OPTIONS.map((s) => (
                      <ChipButton
                        key={s}
                        label={s}
                        selected={skills.includes(s)}
                        onClick={() => toggleItem(skills, setSkills, s)}
                      />
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Life Values</p>
                  <div className="flex flex-wrap gap-2">
                    {VALUES_OPTIONS.map((v) => (
                      <ChipButton
                        key={v}
                        label={v}
                        selected={values.includes(v)}
                        onClick={() => toggleItem(values, setValues, v)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Personal Notes</p>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What else did you learn about yourself?"
                    className="rounded-xl bg-card border-border min-h-[80px]"
                    maxLength={500}
                  />
                </div>
              </StepLayout>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom button */}
      <div className="px-5 py-6">
        <Button
          onClick={step === STEPS.length - 1 ? handleFinish : () => setStep(step + 1)}
          disabled={!canNext()}
          className="w-full h-14 text-base font-semibold rounded-xl gradient-warm border-0 text-primary-foreground shadow-elevated hover:opacity-90 transition-opacity disabled:opacity-30"
          size="lg"
        >
          {step === STEPS.length - 1 ? (
            <>
              Save Activity <Check className="ml-2 w-5 h-5" />
            </>
          ) : (
            <>
              Continue <ArrowRight className="ml-2 w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

function StepLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>
      {children}
    </div>
  );
}

function OptionButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all text-sm font-medium ${
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

export default AddActivity;
