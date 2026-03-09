import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Filter, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    icon: BookOpen,
    title: "Recall your experiences",
    desc: "Look back at jobs, projects, volunteering & activities — identify the skills and values you already have.",
  },
  {
    icon: Filter,
    title: "Filter & focus",
    desc: "Use those skills and values to discover activities, fields, and career paths that truly fit you.",
  },
  {
    icon: Rocket,
    title: "Build your growth story",
    desc: "Connect the dots into a clear narrative that shows where you've been and where you're heading.",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[100dvh] flex-col px-6 py-10 gradient-soft">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-sm mx-auto w-full"
      >
        <p className="text-sm font-medium text-primary tracking-wide uppercase mb-2">
          How it works
        </p>
        <h1 className="text-2xl font-bold text-foreground leading-tight mb-6">
          Turn past experiences into your future direction
        </h1>

        <div className="space-y-4 mb-10">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.12 }}
              className="flex gap-4 items-start"
            >
              <div className="shrink-0 w-10 h-10 rounded-xl gradient-warm flex items-center justify-center shadow-sm">
                <step.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm leading-tight">
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <Button
          onClick={() => navigate("/categories")}
          className="w-full h-14 text-base font-semibold rounded-xl gradient-warm border-0 text-primary-foreground shadow-elevated hover:opacity-90 transition-opacity"
          size="lg"
        >
          Let's start
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>

        <p className="text-xs text-muted-foreground mt-5 text-center">
          No account needed — progress is saved automatically
        </p>
      </motion.div>
    </div>
  );
};

export default Index;
