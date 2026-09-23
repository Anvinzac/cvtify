import { motion } from "framer-motion";

/**
 * Slow-drifting conic-gradient mesh layered behind the hero.
 * Pure CSS animation — no JS rAF cost.
 */
export default function Aurora({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
        className="absolute -inset-[20%] aurora-blob aurora-blob-a"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.9 }}
        transition={{ duration: 1.6, delay: 0.15, ease: "easeOut" }}
        className="absolute -inset-[25%] aurora-blob aurora-blob-b"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.75 }}
        transition={{ duration: 1.6, delay: 0.3, ease: "easeOut" }}
        className="absolute -inset-[18%] aurora-blob aurora-blob-c"
      />
      {/* Soft grain wash to break up the gradient banding */}
      <div className="absolute inset-0 grain-overlay" />
    </div>
  );
}
