import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, MapPin, DollarSign, CheckCircle2, Circle } from "lucide-react";
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
          onClick={() => navigate("/dashboard")}
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Dream Jobs</h1>
          <p className="text-xs text-muted-foreground">Map your skills to careers you love</p>
        </div>
      </div>

      <div className="flex-1 px-5 pb-4 space-y-4 overflow-y-auto">
        {SAMPLE_JOBS.map((job, i) => {
          const isFav = favoritedJobs.includes(job.id);
          const matchedSkills = job.requiredSkills.filter((s) => userSkills.has(s));
          const missingSkills = job.requiredSkills.filter((s) => !userSkills.has(s));
          const matchPercent = job.requiredSkills.length > 0
            ? Math.round((matchedSkills.length / job.requiredSkills.length) * 100)
            : 0;

          return (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl border border-border shadow-card p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-foreground">{job.title}</h3>
                  <p className="text-xs text-muted-foreground">{job.company}</p>
                </div>
                <button
                  onClick={() => toggleFavoriteJob(job.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    isFav ? "text-destructive bg-destructive/10" : "text-muted-foreground hover:text-destructive"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFav ? "fill-current" : ""}`} />
                </button>
              </div>

              <p className="text-xs text-foreground leading-relaxed mb-3">{job.description}</p>

              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{job.salary}</span>
              </div>

              {/* Skill match bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground font-medium">Skill Match</span>
                  <span className="text-primary font-bold">{matchPercent}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${matchPercent}%` }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="h-full gradient-warm rounded-full"
                  />
                </div>
              </div>

              {/* Skills breakdown */}
              <div className="space-y-1">
                {matchedSkills.map((s) => (
                  <div key={s} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
                    <span className="text-foreground">{s}</span>
                  </div>
                ))}
                {missingSkills.map((s) => (
                  <div key={s} className="flex items-center gap-2 text-xs">
                    <Circle className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">{s}</span>
                    {isFav && (
                      <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-medium bg-accent text-accent-foreground">
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
      {favoritedJobs.length > 0 && (
        <div className="px-5 py-3 bg-accent/50 border-t border-border">
          <p className="text-xs text-accent-foreground font-medium text-center">
            ❤️ {favoritedJobs.length} dream job{favoritedJobs.length > 1 ? "s" : ""} saved — missing skills added to your growth map
          </p>
        </div>
      )}

      <BottomNav navigate={navigate} active="dream-jobs" />
    </div>
  );
};

export default DreamJobs;
