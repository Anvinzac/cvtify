import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Filter, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import stepRecall from "@/assets/step-recall.jpg";
import stepFilter from "@/assets/step-filter.jpg";
import stepGrowth from "@/assets/step-growth.jpg";

const STEPS = [
  {
    icon: BookOpen,
    title: "Recall your experiences",
    desc: "Look back at jobs, projects, volunteering & activities — identify the skills and values you already have.",
    image: stepRecall,
  },
  {
    icon: Filter,
    title: "Filter & focus",
    desc: "Use those skills and values to discover activities, fields, and career paths that truly fit you.",
    image: stepFilter,
  },
  {
    icon: Rocket,
    title: "Build your growth story",
    desc: "Connect the dots into a clear narrative that shows where you've been and where you're heading.",
    image: stepGrowth,
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
        <h1 className="text-2xl font-bold text-foreground leading-tight mb-8">
          Turn past experiences into your future direction
        </h1>

        <div className="relative mb-10">
          {/* Vertical connector line */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="absolute left-5 top-10 bottom-10 w-0.5 bg-border origin-top z-0"
          />

          <div className="space-y-5 relative z-10">
            {STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.25, duration: 0.5, ease: "easeOut" }}
                className="flex gap-4 items-start"
              >
                <div className="shrink-0 w-10 h-10 rounded-xl gradient-warm flex items-center justify-center shadow-sm">
                  <step.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {step.desc}
                  </p>
                  <motion.img
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.25, duration: 0.4 }}
                    src={step.image}
                    alt={step.title}
                    className="mt-2 w-20 h-14 object-cover rounded-lg border border-border shadow-sm"
                  />
                </div>
              </motion.div>
            ))}
          </div>
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
