import { motion } from "framer-motion";

/**
 * Subtle whole-page crossfade + parallax-lift on route entry.
 * Pair with <AnimatePresence mode="wait"> in the router shell.
 */
export default function PageTransition({
  children,
  routeKey,
}: {
  children: React.ReactNode;
  routeKey: string;
}) {
  return (
    <motion.div
      key={routeKey}
      initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
      transition={{ duration: 0.4, ease: [0.22, 0.7, 0.35, 1] }}
      className="contents"
    >
      {children}
    </motion.div>
  );
}
