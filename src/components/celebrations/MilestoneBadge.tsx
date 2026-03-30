"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

// Precomputed particles using deterministic pseudo-random values
// seeded from index to avoid Math.random() in render
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function makeParticles(count: number, spread: number, colors: string[]): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (seededRandom(i * 7 + 1) - 0.5) * spread,
    y: (seededRandom(i * 7 + 2) - 0.5) * (spread * 0.75),
    size: seededRandom(i * 7 + 3) * 6 + 2,
    color: colors[Math.floor(seededRandom(i * 7 + 4) * colors.length)],
    delay: seededRandom(i * 7 + 5) * 0.3,
  }));
}

const STANDARD_PARTICLES = makeParticles(30, 400, ["#EF223A", "#F4B400"]);
const FINAL_PARTICLES = makeParticles(
  60,
  600,
  ["#EF223A", "#F4B400", "#10B981", "#0263E0", "#A855F7"]
);

interface MilestoneBadgeProps {
  show: boolean;
  icon: string;
  title: string;
  subtitle: string;
  onDismiss: () => void;
  isFinal?: boolean;
}

export function MilestoneBadge({
  show,
  icon,
  title,
  subtitle,
  onDismiss,
  isFinal = false,
}: MilestoneBadgeProps) {
  const particles = isFinal ? FINAL_PARTICLES : STANDARD_PARTICLES;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onDismiss}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-navy/80 backdrop-blur-sm" />

          {/* Badge */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.1,
            }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Particles */}
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  opacity: 0,
                  scale: 1,
                }}
                transition={{
                  duration: 1.5,
                  delay: p.delay + 0.3,
                  ease: "easeOut",
                }}
                className="absolute rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                }}
              />
            ))}

            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
                delay: 0.2,
              }}
              className={`text-6xl mb-6 ${isFinal ? "text-7xl" : ""}`}
            >
              {icon}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`font-display font-extrabold text-text-primary text-center ${
                isFinal ? "text-4xl" : "text-2xl"
              }`}
            >
              {title}
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-text-secondary mt-2 text-center"
            >
              {subtitle}
            </motion.p>

            {/* Continue button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={onDismiss}
              className="mt-8 px-6 py-3 rounded-xl bg-twilio-red text-white font-display font-bold text-sm hover:bg-twilio-red/90 transition-colors"
            >
              Continue
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
