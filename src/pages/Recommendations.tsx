import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Clock, User, Calendar } from "lucide-react";
import { useAppState } from "@/context/AppContext";
import { SAMPLE_JOBS, SAMPLE_EVENTS } from "@/lib/data";
import { BottomNav } from "./ReportCard";

const Recommendations = () => {
  const navigate = useNavigate();
  const { activities, hobbies } = useAppState();

  // Collect user skills for matching
  const userSkills = new Set<string>();
  const userValues = new Set<string>();
  activities.forEach((a) => {
    a.skills.forEach((s) => userSkills.add(s));
    a.values.forEach((v) => userValues.add(v));
  });

  // Score jobs by skill/value match
  const scoredJobs = SAMPLE_JOBS.map((job) => {
    const skillMatch = job.requiredSkills.filter((s) => userSkills.has(s)).length;
    const valueMatch = job.values.filter((v) => userValues.has(v)).length;
    return { ...job, score: skillMatch + valueMatch };
  }).sort((a, b) => b.score - a.score);

  // Score events
  const scoredEvents = SAMPLE_EVENTS.map((evt) => {
    const tagMatch = evt.tags.filter((t) => userSkills.has(t) || userValues.has(t) || hobbies.some((h) => t.toLowerCase().includes(h.toLowerCase().split(" ")[0]))).length;
    return { ...evt, score: tagMatch };
  }).sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-[100dvh] flex flex-col gradient-soft">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Recommended For You</h1>
      </div>

      <div className="flex-1 px-5 pb-4 space-y-6 overflow-y-auto">
        {/* Jobs */}
        <section>
          <h2 className="font-bold text-foreground mb-3 text-sm uppercase tracking-wide">Jobs & Internships</h2>
          <div className="space-y-3">
            {scoredJobs.slice(0, 4).map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl border border-border shadow-card p-4"
              >
                <h3 className="font-semibold text-foreground text-sm">{job.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{job.company}</p>
                <p className="text-xs text-foreground mt-2 leading-relaxed">{job.description}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{job.salary}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {job.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent text-accent-foreground">
                      {tag}
                    </span>
                  ))}
                  {job.requiredSkills.filter((s) => userSkills.has(s)).map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-medium gradient-warm text-primary-foreground">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Events & Activities */}
        <section>
          <h2 className="font-bold text-foreground mb-3 text-sm uppercase tracking-wide">Events & Activities</h2>
          <div className="space-y-3">
            {scoredEvents.map((evt, i) => (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                className="bg-card rounded-xl border border-border shadow-card p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{evt.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{evt.host}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    evt.type === "event" ? "bg-accent text-accent-foreground" : "gradient-teal text-secondary-foreground"
                  }`}>
                    {evt.type === "event" ? "Event" : "Project"}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{evt.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{evt.time}</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />{evt.location}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {evt.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent text-accent-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      <BottomNav navigate={navigate} active="recommendations" />
    </div>
  );
};

export default Recommendations;
