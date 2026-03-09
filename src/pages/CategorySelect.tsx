import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/data";
import { useAppState } from "@/context/AppContext";

const CategorySelect = () => {
  const navigate = useNavigate();
  const { selectedCategories, setSelectedCategories } = useAppState();
  const [selected, setSelected] = useState<string[]>(selectedCategories);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const handleContinue = () => {
    setSelectedCategories(selected);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col px-5 py-8 gradient-soft">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-sm font-medium text-primary mb-2 tracking-wide uppercase">
          Step 1 of 3
        </p>
        <h1 className="text-2xl font-bold text-foreground leading-tight mb-2">
          Have you ever participated in…?
        </h1>
        <p className="text-muted-foreground text-sm">
          Select all categories that you've had experiences in. You can always add more later.
        </p>
      </motion.div>

      <div className="flex-1 grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat, i) => {
          const isSelected = selected.includes(cat.id);
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => toggle(cat.id)}
              className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-200 relative ${
                isSelected
                  ? "border-primary bg-accent shadow-card"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-base bg-muted rounded-lg px-2 py-0.5">{cat.emoji}</span>
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="w-5 h-5 rounded-full gradient-warm flex items-center justify-center flex-shrink-0"
                    >
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <h3 className="font-semibold text-foreground text-xs leading-tight">
                {cat.name}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-1 leading-snug">
                {cat.examples.join(" · ")}
              </p>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: selected.length > 0 ? 1 : 0.4 }}
        className="pt-6 pb-2"
      >
        <Button
          onClick={handleContinue}
          disabled={selected.length === 0}
          className="w-full h-14 text-base font-semibold rounded-xl gradient-warm border-0 text-primary-foreground shadow-elevated hover:opacity-90 transition-opacity disabled:opacity-30"
          size="lg"
        >
          Continue with {selected.length} {selected.length === 1 ? "category" : "categories"}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
};

export default CategorySelect;
