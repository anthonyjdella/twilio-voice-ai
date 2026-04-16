"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Sparkles, Star } from "lucide-react";
import confetti from "canvas-confetti";

interface StepCelebrationProps {
  show: boolean;
  onDismiss: () => void;
}

function fireStepConfetti() {
  // Quick little pop — not a full cannon, just a celebratory burst
  confetti({
    particleCount: 30,
    spread: 60,
    origin: { x: 0.5, y: 0.85 },
    colors: ["#10B981", "#34D399", "#F4B400", "#FFFFFF"],
    startVelocity: 30,
    ticks: 120,
    gravity: 1.2,
    scalar: 0.8,
  });
}

export function StepCelebration({ show, onDismiss }: StepCelebrationProps) {
  useEffect(() => {
    if (!show) return;
    fireStepConfetti();
    const timer = setTimeout(onDismiss, 2500);
    return () => clearTimeout(timer);
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 350, damping: 22 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
        >
          <div className="relative flex items-center gap-3 px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_10px_40px_rgba(16,185,129,0.45)] border border-white/25">
            {/* Sparkle particles */}
            {SPARKLES.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.2, 0],
                  x: s.x,
                  y: s.y,
                }}
                transition={{ duration: 0.9, delay: s.delay, ease: "easeOut" }}
                className="absolute"
                style={{ left: s.originX, top: s.originY }}
              >
                {s.id % 2 === 0 ? (
                  <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                ) : (
                  <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                )}
              </motion.div>
            ))}

            {/* Checkmark icon with bounce */}
            <motion.div
              initial={{ rotate: -360, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.05 }}
            >
              <CheckCircle className="w-7 h-7 text-white drop-shadow-md" />
            </motion.div>

            {/* Text */}
            <motion.span
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 }}
              className="text-white font-display font-bold text-base whitespace-nowrap drop-shadow-sm"
            >
              Step complete!
            </motion.span>

            {/* Shine sweep */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "300%" }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeInOut" }}
              className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
            >
              <div className="h-full w-1/4 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Precomputed sparkle positions — more of them, wider spread
const SPARKLES = [
  { id: 0, x: -40, y: -30, delay: 0.05, originX: "15%", originY: "50%" },
  { id: 1, x: 30, y: -35, delay: 0.12, originX: "45%", originY: "50%" },
  { id: 2, x: 50, y: -18, delay: 0.03, originX: "75%", originY: "50%" },
  { id: 3, x: -25, y: 25, delay: 0.18, originX: "25%", originY: "50%" },
  { id: 4, x: 45, y: 22, delay: 0.1, originX: "65%", originY: "50%" },
  { id: 5, x: -55, y: -12, delay: 0.22, originX: "5%", originY: "50%" },
  { id: 6, x: 60, y: -25, delay: 0.14, originX: "90%", originY: "50%" },
  { id: 7, x: 0, y: -40, delay: 0.06, originX: "50%", originY: "20%" },
  { id: 8, x: -35, y: -40, delay: 0.2, originX: "30%", originY: "30%" },
  { id: 9, x: 40, y: -42, delay: 0.16, originX: "70%", originY: "25%" },
  { id: 10, x: -50, y: 18, delay: 0.08, originX: "10%", originY: "60%" },
  { id: 11, x: 55, y: 15, delay: 0.24, originX: "85%", originY: "55%" },
];
