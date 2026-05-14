import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, MapPin, DollarSign, CheckCircle2, Circle, Target } from "lucide-react";
import { useAppState } from "@/context/AppContext";
import { SAMPLE_JOBS } from "@/lib/data";
import { BottomNav } from "./ReportCard";

const DreamJobs = () => {
  const navigate = useNavigate();
  const { activities, favoritedJobs, toggleFavoriteJob } = useAppState();

  const userSkills = new Set<string>();
  activities.forEach((a) => a.skills.forEach((s) => userSkills.add(s)));

  return (
    <div className="min-h-[100dvh] flex flex-col gradient-soft">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/categories")}
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Dream jobs</h1>
          <p className="text-xs text-muted-foreground">Map your skills to careers</p>
        </div>
      </div>

      <div className="flex-1 px-5 pb-24 space-y-4 overflow-y-auto">
        {SAMPLE_JOBS.map((job, i) => {
          const isFav = favoritedJobs.includes(job.id);
          const matchedSkills = job.requiredSkills.filter((s) => userSkills.has(s));
          const missingSkills = job.requiredSkills.filter((s) => !userSkills.has(s));
          const matchPercent =
            job.requiredSkills.length > 0
              ? Math.round((matchedSkills.length / job.requiredSkills.length) * 100)
              : 0;

          return (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-card rounded-2xl border border-border shadow-card p-5 hover:border-primary/15 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-sm">{job.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{job.company}</p>
                </div>
                <motion.button
                  onClick={() => toggleFavoriteJob(job.id)}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    isFav
                      ? "text-rose-500 bg-rose-50"
                      : "text-muted-foreground hover:text-rose-400 hover:bg-rose-50/50"
                  }`}
                >
                  <Heart
                    className={`w-4.5 h-4.5 transition-all ${isFav ? "fill-current scale-110" : ""}`}
                  />
                </motion.button>
              </div>

              <p className="text-xs text-foreground leading-relaxed mb-3">{job.description}</p>

              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{job.location}</span>
                <span className="flex items-center gap-1.5"><DollarSign className="w-3 h-3" />{job.salary}</span>
              </div>

              {/* Skill match bar */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3 h-3 text-primary" />
                    <span className="text-xs text-foreground font-semibold">Skill match</span>
                  </div>
                  <motion.span
                    key={matchPercent}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    className="text-xs font-bold text-primary"
                  >
                    {matchPercent}%
                  </motion.span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${matchPercent}%` }}
                    transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                    className="h-full gradient-warm rounded-full"
                  />
                </div>
              </div>

              {/* Skills breakdown */}
              <div className="space-y-1.5">
                {matchedSkills.map((s) => (
                  <div key={s} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0" />
                    <span className="text-foreground font-medium">{s}</span>
                  </div>
                ))}
                {missingSkills.map((s) => (
                  <div key={s} className="flex items-center gap-2 text-xs">
                    <Circle className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                    <span className="text-muted-foreground">{s}</span>
                    {isFav && (
                      <span className="ml-auto px-2 py-0.5 rounded-md text-[9px] font-semibold bg-accent text-accent-foreground">
                        To grow
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Favorited summary */}
      <AnimatePresence>
        {favoritedJobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-5 py-3 bg-accent/50 border-t border-border"
          >
            <p className="text-xs text-accent-foreground font-semibold text-center">
              ❤️ {favoritedJobs.length} dream job{favoritedJobs.length > 1 ? "s" : ""} saved — missing skills added to your growth map
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav navigate={navigate} active="dream-jobs" />
    </div>
  );
};

export default DreamJobs;
