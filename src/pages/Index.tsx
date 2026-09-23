import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Compass, Sparkles, Target, Zap } from "lucide-react";
import Aurora from "@/components/fx/Aurora";
import MagneticButton from "@/components/fx/MagneticButton";
import CountUp from "@/components/fx/CountUp";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
});

const VALUE_PROPS = [
  {
    icon: Target,
    valueNumber: 6000,
    valueSuffix: "+ careers matched",
    sub: "Based on real skill data",
  },
  {
    icon: Sparkles,
    valueNumber: 3,
    valueSuffix: "-minute setup",
    sub: "No account needed",
  },
  {
    icon: Zap,
    valueNumber: null as number | null,
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
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative min-h-[100dvh] flex flex-col overflow-hidden gradient-hero">
      {/* Aurora mesh */}
      <Aurora />

      {/* Floating background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={prefersReducedMotion ? undefined : { y: [-12, 12, -12], x: [-8, 6, -8] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] -right-16 w-64 h-64 rounded-full bg-[hsl(32_95%_52%/0.08)] blur-3xl"
        />
        <motion.div
          animate={prefersReducedMotion ? undefined : { y: [10, -15, 10], x: [6, -8, 6] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] -left-20 w-80 h-80 rounded-full bg-[hsl(28_90%_50%/0.07)] blur-3xl"
        />
        <motion.div
          animate={prefersReducedMotion ? undefined : { y: [-6, 14, -6] }}
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
          <motion.div
            whileHover={{ rotate: [0, -12, 12, -8, 8, 0], transition: { duration: 0.6 } }}
            className="w-9 h-9 rounded-xl gradient-warm flex items-center justify-center shadow-glow animate-pulse-glow cursor-pointer"
          >
            <Compass className="w-5 h-5 text-primary-foreground" />
          </motion.div>
          <span className="text-sm font-bold text-foreground tracking-tight">
            SkillCompass
          </span>
        </motion.div>

        {/* Hero text */}
        <motion.div {...fadeUp(0.1)} className="mb-8">
          <h1 className="text-4xl font-bold text-foreground leading-[1.1] tracking-tight mb-4">
            Your experiences.
            <br />
            <span className="text-gradient-warm-anim">Your direction.</span>
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
              key={vp.sub}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.12, duration: 0.4 }}
              whileHover={{ y: -3, transition: { duration: 0.18 } }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border/60 shadow-card hover:shadow-elevated transition-shadow"
            >
              <vp.icon className="w-3.5 h-3.5 text-primary" />
              <div>
                <p className="text-xs font-semibold text-foreground leading-tight">
                  {vp.valueNumber !== null && vp.valueNumber !== undefined ? (
                    <>
                      <CountUp
                        to={vp.valueNumber}
                        formatted={vp.valueNumber >= 1000}
                        duration={vp.valueNumber >= 1000 ? 1600 : 900}
                        delay={400 + i * 120}
                      />
                      {vp.valueSuffix}
                    </>
                  ) : (
                    vp.label
                  )}
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
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-4 relative inline-block overflow-hidden underline-sweep pr-2">
            How it works
          </p>
          <div className="space-y-4">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.15, duration: 0.5, ease: "easeOut" }}
                whileHover={{ x: 4, transition: { duration: 0.18 } }}
                className="flex gap-4 items-start group cursor-default"
              >
                <div className="shrink-0 w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-accent-foreground font-bold text-sm group-hover:gradient-warm group-hover:text-primary-foreground group-hover:shadow-glow transition-all duration-300">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground leading-tight mb-0.5 group-hover:text-primary transition-colors">
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
          <MagneticButton
            onClick={() => navigate("/categories")}
            strength={10}
            className="w-full h-14 text-base font-semibold rounded-2xl gradient-warm text-primary-foreground shadow-elevated shadow-glow"
          >
            <span className="inline-flex items-center">
              Start discovering
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex"
              >
                <ArrowRight className="ml-2 w-5 h-5" />
              </motion.span>
            </span>
          </MagneticButton>
          <p className="text-[11px] text-muted-foreground mt-3 text-center">
            No account needed — your progress is saved automatically
          </p>
        </motion.div>
      </div>
    </div>
  );
}
