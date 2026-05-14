import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Compass, Sparkles, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
});

const VALUE_PROPS = [
  {
    icon: Target,
    label: "6,000+ careers matched",
    sub: "Based on real skill data",
  },
  {
    icon: Sparkles,
    label: "3-minute setup",
    sub: "No account needed",
  },
  {
    icon: Zap,
    label: "AI-powered insights",
    sub: "Personalized for you",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Recall what you've done",
    desc: "Look back at jobs, projects, volunteering & activities — identify the skills and values you've already built.",
  },
  {
    step: "02",
    title: "See where you fit",
    desc: "We map your experiences to careers, industries, and growth paths that actually match who you are.",
  },
  {
    step: "03",
    title: "Build your future",
    desc: "Get a clear, personalized roadmap that connects where you've been to where you're going.",
  },
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-[100dvh] flex flex-col overflow-hidden gradient-hero">
      {/* Floating background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [-12, 12, -12], x: [-8, 6, -8] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] -right-16 w-64 h-64 rounded-full bg-[hsl(32_95%_52%/0.08)] blur-3xl"
        />
        <motion.div
          animate={{ y: [10, -15, 10], x: [6, -8, 6] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] -left-20 w-80 h-80 rounded-full bg-[hsl(28_90%_50%/0.07)] blur-3xl"
        />
        <motion.div
          animate={{ y: [-6, 14, -6] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[50%] left-[30%] w-48 h-48 rounded-full bg-[hsl(174_55%_40%/0.06)] blur-3xl"
        />
      </div>

      <div className="relative z-10 flex flex-col flex-1 max-w-lg mx-auto w-full px-6 pt-16 pb-10">
        {/* Brand mark */}
        <motion.div
          {...fadeUp(0)}
          className="flex items-center gap-2.5 mb-10"
        >
          <div className="w-9 h-9 rounded-xl gradient-warm flex items-center justify-center shadow-glow animate-pulse-glow">
            <Compass className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold text-foreground tracking-tight">
            SkillCompass
          </span>
        </motion.div>

        {/* Hero text */}
        <motion.div {...fadeUp(0.1)} className="mb-8">
          <h1 className="text-4xl font-bold text-foreground leading-[1.1] tracking-tight mb-4">
            Your experiences.
            <br />
            <span className="text-gradient-warm">Your direction.</span>
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-sm">
            Turn everything you've done — jobs, projects, clubs, volunteering — into a clear picture of who you are and where you're headed.
          </p>
        </motion.div>

        {/* Value prop pills */}
        <motion.div
          {...fadeUp(0.25)}
          className="flex flex-wrap gap-3 mb-12"
        >
          {VALUE_PROPS.map((vp, i) => (
            <motion.div
              key={vp.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.12, duration: 0.4 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/60 shadow-card"
            >
              <vp.icon className="w-3.5 h-3.5 text-primary" />
              <div>
                <p className="text-xs font-semibold text-foreground leading-tight">
                  {vp.label}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {vp.sub}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* How it works */}
        <motion.div {...fadeUp(0.4)} className="mb-10">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4">
            How it works
          </p>
          <div className="space-y-4">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.15, duration: 0.5, ease: "easeOut" }}
                className="flex gap-4 items-start group"
              >
                <div className="shrink-0 w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-accent-foreground font-bold text-sm group-hover:gradient-warm group-hover:text-primary-foreground transition-all duration-300">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground leading-tight mb-0.5">
                    {s.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Spacer to push CTA down */}
        <div className="flex-1" />

        {/* CTA */}
        <motion.div
          {...fadeUp(0.65)}
          className="sticky bottom-6"
        >
          <Button
            onClick={() => navigate("/categories")}
            className="w-full h-14 text-base font-semibold rounded-2xl gradient-warm border-0 text-primary-foreground shadow-elevated shadow-glow hover:opacity-95 active:scale-[0.98] transition-all duration-200"
            size="lg"
          >
            Start discovering
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="text-[11px] text-muted-foreground mt-3 text-center">
            No account needed — your progress is saved automatically
          </p>
        </motion.div>
      </div>
    </div>
  );
}
