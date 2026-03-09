import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 gradient-soft">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-sm mx-auto"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-2xl gradient-warm flex items-center justify-center mx-auto mb-8 shadow-elevated"
        >
          <Compass className="w-10 h-10 text-primary-foreground" />
        </motion.div>

        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
          SkillCompass
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed mb-10">
          Discover your hidden skills, values & strengths from past experiences — 
          then find activities that grow you toward your dream career.
        </p>

        <Button
          onClick={() => navigate("/categories")}
          className="w-full h-14 text-base font-semibold rounded-xl gradient-warm border-0 text-primary-foreground shadow-elevated hover:opacity-90 transition-opacity"
          size="lg"
        >
          Start Exploring
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>

        <p className="text-xs text-muted-foreground mt-6">
          No account needed — your progress is saved automatically
        </p>
      </motion.div>
    </div>
  );
};

export default Index;
