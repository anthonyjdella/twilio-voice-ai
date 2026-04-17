"use client";

import { useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import type { WorkshopConfig } from "@/lib/workshop-config";

interface MilestoneBadgeProps {
  show: boolean;
  icon: string;
  title: string;
  subtitle: string;
  onDismiss: () => void;
  isFinal?: boolean;
  particleColor?: string;
  sharing?: WorkshopConfig["sharing"];
  workshopTitle?: string;
  totalChapters?: number;
}

// ─── Confetti orchestration ────────────────────────────────────────

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function fireChapterConfetti(particleColor?: string) {
  if (prefersReducedMotion()) return () => {};
  const colors = ["#EF223A", "#F4B400", "#10B981", particleColor ?? "#0263E0"];
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const intervals = new Set<ReturnType<typeof setInterval>>();
  const track = (id: ReturnType<typeof setTimeout>) => {
    timers.add(id);
    return id;
  };

  // Wave 1: Dual cannons from bottom corners
  confetti({ particleCount: 80, spread: 80, origin: { x: 0.15, y: 0.9 }, colors, startVelocity: 60, ticks: 300, angle: 70 });
  confetti({ particleCount: 80, spread: 80, origin: { x: 0.85, y: 0.9 }, colors, startVelocity: 60, ticks: 300, angle: 110 });

  // Wave 2: Center fountain (delayed)
  track(setTimeout(() => {
    confetti({ particleCount: 60, spread: 100, origin: { x: 0.5, y: 0.7 }, colors, startVelocity: 50, ticks: 250, gravity: 0.9 });
  }, 400));

  // Wave 3: Side streams
  const stream = setInterval(() => {
    confetti({ particleCount: 3, angle: 60, spread: 40, origin: { x: 0, y: 0.5 }, colors, ticks: 180 });
    confetti({ particleCount: 3, angle: 120, spread: 40, origin: { x: 1, y: 0.5 }, colors, ticks: 180 });
  }, 200);
  intervals.add(stream);
  track(setTimeout(() => {
    clearInterval(stream);
    intervals.delete(stream);
  }, 3000));

  return () => {
    timers.forEach(clearTimeout);
    intervals.forEach(clearInterval);
    timers.clear();
    intervals.clear();
  };
}

function fireFinalConfetti() {
  if (prefersReducedMotion()) return () => {};
  const colors = ["#EF223A", "#F4B400", "#10B981", "#0263E0", "#A855F7", "#F59E0B", "#EC4899", "#FFFFFF"];
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const intervals = new Set<ReturnType<typeof setInterval>>();
  const track = (id: ReturnType<typeof setTimeout>) => {
    timers.add(id);
    return id;
  };

  // WAVE 1: Massive dual cannon salvo
  for (let i = 0; i < 3; i++) {
    track(setTimeout(() => {
      confetti({ particleCount: 120, spread: 90, origin: { x: 0.1, y: 0.9 }, colors, startVelocity: 70, ticks: 400, angle: 75 });
      confetti({ particleCount: 120, spread: 90, origin: { x: 0.9, y: 0.9 }, colors, startVelocity: 70, ticks: 400, angle: 105 });
    }, i * 300));
  }

  // WAVE 2: Center eruption
  track(setTimeout(() => {
    confetti({ particleCount: 200, spread: 180, origin: { x: 0.5, y: 0.5 }, colors, startVelocity: 55, gravity: 0.6, ticks: 500, scalar: 1.2 });
  }, 600));

  // WAVE 3: Firework pops at random positions
  const fireworkPositions = [
    { x: 0.2, y: 0.3 }, { x: 0.8, y: 0.2 }, { x: 0.5, y: 0.15 },
    { x: 0.3, y: 0.4 }, { x: 0.7, y: 0.35 }, { x: 0.15, y: 0.2 },
    { x: 0.85, y: 0.4 }, { x: 0.4, y: 0.25 }, { x: 0.6, y: 0.3 },
  ];
  fireworkPositions.forEach((pos, i) => {
    track(setTimeout(() => {
      confetti({ particleCount: 40, spread: 360, origin: pos, colors, startVelocity: 30, ticks: 200, gravity: 0.5, scalar: 0.8 });
    }, 1000 + i * 250));
  });

  // WAVE 4: Continuous rainbow rain
  const rain = setInterval(() => {
    confetti({ particleCount: 6, angle: 60, spread: 50, origin: { x: 0, y: 0.3 }, colors, ticks: 250, startVelocity: 40 });
    confetti({ particleCount: 6, angle: 120, spread: 50, origin: { x: 1, y: 0.3 }, colors, ticks: 250, startVelocity: 40 });
    confetti({ particleCount: 4, angle: 90, spread: 60, origin: { x: Math.random(), y: 0 }, colors, ticks: 300, gravity: 1.2 });
  }, 120);
  intervals.add(rain);
  track(setTimeout(() => {
    clearInterval(rain);
    intervals.delete(rain);
  }, 7000));

  // WAVE 5: Grand finale burst at 3 seconds
  track(setTimeout(() => {
    for (let i = 0; i < 5; i++) {
      track(setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 360,
          origin: { x: 0.2 + Math.random() * 0.6, y: 0.3 + Math.random() * 0.3 },
          colors,
          startVelocity: 35,
          ticks: 250,
          gravity: 0.5,
          shapes: ["circle", "square"],
          scalar: 1.1,
        });
      }, i * 150));
    }
  }, 3000));

  // WAVE 6: Slow golden star fall
  track(setTimeout(() => {
    const starFall = setInterval(() => {
      confetti({
        particleCount: 2,
        angle: 90,
        spread: 120,
        origin: { x: Math.random(), y: -0.1 },
        colors: ["#F4B400", "#FFD700", "#FFC107"],
        startVelocity: 5,
        ticks: 400,
        gravity: 0.4,
        scalar: 1.5,
        drift: (Math.random() - 0.5) * 2,
      });
    }, 100);
    intervals.add(starFall);
    track(setTimeout(() => {
      clearInterval(starFall);
      intervals.delete(starFall);
    }, 4000));
  }, 4000));

  return () => {
    timers.forEach(clearTimeout);
    intervals.forEach(clearInterval);
    timers.clear();
    intervals.clear();
  };
}

// ─── Share URL builders ───────────────────────────────────────────

function buildXShareUrl(
  config: NonNullable<NonNullable<WorkshopConfig["sharing"]>["platforms"]["x"]>,
  workshopTitle: string,
  eventName?: string,
  shareUrl?: string,
) {
  const text = config.message
    .replace(/\{title\}/g, workshopTitle)
    .replace(/\{event\}/g, eventName ?? "");
  const params = new URLSearchParams({ text });
  if (shareUrl) params.set("url", shareUrl);
  if (config.hashtags?.length) params.set("hashtags", config.hashtags.join(","));
  return `https://x.com/intent/tweet?${params.toString()}`;
}

function buildLinkedInShareUrl(
  config: NonNullable<NonNullable<WorkshopConfig["sharing"]>["platforms"]["linkedin"]>,
  workshopTitle: string,
  eventName?: string,
  shareUrl?: string,
) {
  // LinkedIn's share-offsite widget supports a URL. The text goes into
  // the user's compose box when they share from their feed.
  const text = config.message
    .replace(/\{title\}/g, workshopTitle)
    .replace(/\{event\}/g, eventName ?? "");
  const params = new URLSearchParams();
  if (shareUrl) params.set("url", shareUrl);
  // LinkedIn doesn't officially support pre-filled text in share-offsite,
  // but we can use the summary param as a fallback description
  params.set("summary", text);
  params.set("title", workshopTitle);
  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
}

// ─── Component ─────────────────────────────────────────────────────

export function MilestoneBadge({
  show,
  icon,
  title,
  subtitle,
  onDismiss,
  isFinal = false,
  particleColor,
  sharing,
  workshopTitle = "",
  totalChapters,
}: MilestoneBadgeProps) {
  const [count, setCount] = useState(0);
  const targetCount = isFinal ? 100 : 0;

  const launchConfetti = useCallback(() => {
    return isFinal ? fireFinalConfetti() : fireChapterConfetti(particleColor);
  }, [isFinal, particleColor]);

  useEffect(() => {
    if (!show) return;
    const cleanup = launchConfetti();
    return cleanup;
  }, [show, launchConfetti]);

  // Animated counter for final celebration
  useEffect(() => {
    if (!show || !isFinal) return;
    setCount(0);
    const duration = 1500;
    const steps = 60;
    const increment = targetCount / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetCount) {
        setCount(targetCount);
        clearInterval(timer);
      } else {
        setCount(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [show, isFinal, targetCount]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onDismiss}
          role="alertdialog"
          aria-live="assertive"
          aria-atomic="true"
          aria-labelledby="milestone-badge-title"
          aria-describedby="milestone-badge-subtitle"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-navy/90 backdrop-blur-lg"
          />

          {/* Animated background rays (final only) */}
          {isFinal && (
            <motion.div
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 0.15, rotate: 360 }}
              transition={{ opacity: { delay: 0.3, duration: 1 }, rotate: { duration: 30, repeat: Infinity, ease: "linear" } }}
              className="absolute w-[800px] h-[800px]"
              style={{
                background: "conic-gradient(from 0deg, transparent, rgba(244,180,0,0.3), transparent, rgba(239,34,58,0.3), transparent, rgba(16,185,129,0.3), transparent, rgba(165,85,247,0.3), transparent)",
              }}
            />
          )}

          {/* Badge card */}
          <motion.div
            initial={{ scale: 0.2, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.15,
            }}
            className="relative z-10 flex flex-col items-center max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Multi-layer glow */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.4 }}
              transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
              className={`absolute rounded-full ${isFinal ? "w-96 h-96" : "w-72 h-72"}`}
              style={{
                background: isFinal
                  ? "radial-gradient(circle, rgba(244,180,0,0.5) 0%, rgba(239,34,58,0.3) 30%, rgba(165,85,247,0.15) 60%, transparent 80%)"
                  : "radial-gradient(circle, rgba(239,34,58,0.4) 0%, rgba(239,34,58,0.1) 50%, transparent 75%)",
                filter: "blur(40px)",
              }}
            />

            {/* Orbiting rings */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 0.4, 0.15], scale: 1, rotate: 360 }}
                transition={{
                  opacity: { delay: 0.3 + i * 0.15, duration: 1 },
                  scale: { delay: 0.3 + i * 0.15, type: "spring", stiffness: 200, damping: 20 },
                  rotate: { duration: 8 + i * 4, repeat: Infinity, ease: "linear", delay: 0.5 },
                }}
                className="absolute rounded-full border"
                style={{
                  width: `${(isFinal ? 180 : 140) + i * 50}px`,
                  height: `${(isFinal ? 180 : 140) + i * 50}px`,
                  borderColor: i === 0 ? "rgba(239,34,58,0.4)" : i === 1 ? "rgba(244,180,0,0.3)" : "rgba(16,185,129,0.2)",
                  transform: `rotate(${i * 30}deg)`,
                }}
              />
            ))}

            {/* Badge icon */}
            <motion.div
              initial={{ scale: 0, rotate: -360 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 10,
                delay: 0.3,
              }}
              className={`relative mb-8 ${isFinal ? "w-32 h-32" : "w-24 h-24"}`}
            >
              {/* Pulsing glow behind icon */}
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-[-12px] rounded-full"
                style={{
                  background: isFinal
                    ? "radial-gradient(circle, rgba(244,180,0,0.6) 0%, transparent 70%)"
                    : "radial-gradient(circle, rgba(239,34,58,0.5) 0%, transparent 70%)",
                }}
              />

              {/* Second pulse ring */}
              <motion.div
                animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute inset-[-8px] rounded-full border-2"
                style={{ borderColor: isFinal ? "rgba(244,180,0,0.5)" : "rgba(239,34,58,0.4)" }}
              />

              <div className="w-full h-full flex items-center justify-center relative">
                {icon.startsWith("/") ? (
                  <motion.img
                    src={icon}
                    alt=""
                    className="w-full h-full"
                    style={{ filter: `drop-shadow(0 0 30px ${isFinal ? "rgba(244,180,0,0.7)" : "rgba(239,34,58,0.6)"})` }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                ) : (
                  <motion.span
                    className={isFinal ? "text-9xl" : "text-7xl"}
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {icon}
                  </motion.span>
                )}
              </div>
            </motion.div>

            {/* "CHAPTER COMPLETE" / "WORKSHOP COMPLETE" label */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.55, type: "spring", stiffness: 300, damping: 20 }}
              className={`font-mono uppercase tracking-[0.35em] mb-4 px-4 py-1.5 rounded-full border ${
                isFinal
                  ? "text-sm text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
                  : "text-xs text-twilio-red border-twilio-red/30 bg-twilio-red/10"
              }`}
            >
              {isFinal ? "Workshop Complete!" : "Chapter Complete"}
            </motion.div>

            {/* Title */}
            <motion.h2
              id="milestone-badge-title"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className={`font-display font-extrabold text-text-primary text-center leading-tight ${
                isFinal ? "text-5xl" : "text-3xl"
              }`}
            >
              {title}
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              id="milestone-badge-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
              className="text-text-secondary mt-3 text-center text-lg"
            >
              {subtitle}
            </motion.p>

            {/* Animated counter (final only) */}
            {isFinal && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mt-6 flex items-center gap-6"
              >
                <div className="text-center">
                  <div className="text-3xl font-display font-extrabold text-twilio-red">{count}%</div>
                  <div className="text-xs text-text-muted mt-1">Complete</div>
                </div>
                <div className="w-px h-10 bg-navy-border" />
                <div className="text-center">
                  <div className="text-3xl font-display font-extrabold text-yellow-400">
                    {totalChapters ? `${totalChapters}/${totalChapters}` : ""}
                  </div>
                  <div className="text-xs text-text-muted mt-1">Chapters</div>
                </div>
                <div className="w-px h-10 bg-navy-border" />
                <div className="text-center">
                  <motion.div
                    className="text-3xl font-display font-extrabold text-emerald-400"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ delay: 2, duration: 0.5 }}
                  >
                    MVP
                  </motion.div>
                  <div className="text-xs text-text-muted mt-1">Status</div>
                </div>
              </motion.div>
            )}

            {/* Continue button */}
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isFinal ? 1.3 : 0.95 }}
              whileHover={{ scale: 1.08, boxShadow: "0 0 40px rgba(239,34,58,0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={onDismiss}
              className={`mt-8 rounded-xl text-white font-display font-bold transition-colors ${
                isFinal
                  ? "px-12 py-4 text-lg bg-gradient-to-r from-twilio-red via-red-500 to-orange-500 shadow-[0_8px_30px_rgba(239,34,58,0.5)]"
                  : "px-8 py-3.5 text-sm bg-twilio-red hover:bg-twilio-red/90 shadow-[0_4px_20px_rgba(239,34,58,0.4)]"
              }`}
            >
              {isFinal ? "You Did It!" : "Keep Going!"}
            </motion.button>

            {/* Social sharing buttons (final celebration only) */}
            {isFinal && sharing?.enabled && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 }}
                className="mt-6 flex flex-col items-center gap-3"
              >
                <div className="text-xs font-mono text-text-muted uppercase tracking-wider">
                  Share your achievement
                </div>
                <div className="flex items-center gap-3">
                  {sharing.platforms.x && (
                    <a
                      href={buildXShareUrl(
                        sharing.platforms.x,
                        workshopTitle,
                        sharing.eventName,
                        sharing.shareUrl,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-4 border border-surface-5 hover:bg-surface-5 hover:border-surface-5 transition-all duration-200 group"
                    >
                      {/* X / Twitter icon */}
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-text-secondary group-hover:text-white transition-colors" aria-hidden="true">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      <span className="text-sm font-medium text-text-secondary group-hover:text-white transition-colors">
                        Post on X
                      </span>
                    </a>
                  )}
                  {sharing.platforms.linkedin && (
                    <a
                      href={buildLinkedInShareUrl(
                        sharing.platforms.linkedin,
                        workshopTitle,
                        sharing.eventName,
                        sharing.shareUrl,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-4 border border-surface-5 hover:bg-surface-5 hover:border-surface-5 transition-all duration-200 group"
                    >
                      {/* LinkedIn icon */}
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-text-secondary group-hover:text-[#0A66C2] transition-colors" aria-hidden="true">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      <span className="text-sm font-medium text-text-secondary group-hover:text-white transition-colors">
                        Share on LinkedIn
                      </span>
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
