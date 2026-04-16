"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import workshopConfig from "@/workshop.config";
import { AudienceProvider, useAudienceMode } from "@/lib/AudienceContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import { OnboardingModal } from "@/components/layout/OnboardingModal";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } },
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function Home() {
  return (
    <ThemeProvider defaultTheme={workshopConfig.defaultTheme ?? "dark"}>
      <AudienceProvider>
        <HomeContent />
      </AudienceProvider>
    </ThemeProvider>
  );
}

function HomeContent() {
  const { title, hero, chapters, branding, duration } = workshopConfig;
  const { needsOnboarding } = useAudienceMode();
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  function handleStartClick() {
    if (needsOnboarding) {
      setShowModal(true);
    } else {
      router.push("/workshop");
    }
  }

  function handleOnboardingComplete() {
    setShowModal(false);
    router.push("/workshop");
  }

  return (
    <>
    <OnboardingModal open={showModal} onComplete={handleOnboardingComplete} />
    <div className="min-h-screen flex flex-col items-center justify-center bg-navy relative overflow-hidden">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 animate-pulse"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, rgba(${branding.accentColorRgb}, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(${branding.accentColorRgb}, 0.04) 0%, transparent 50%)`,
          animationDuration: "6s",
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] theme-grid"
        style={{
          backgroundSize: "48px 48px",
        }}
      />

      <motion.div
        className="relative z-10 max-w-3xl mx-auto px-6 text-center py-16"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Twilio logo */}
        <motion.div variants={fadeUp} className="mb-10">
          <img
            src="/images/twilio-bug-red.svg"
            alt="Twilio"
            width={56}
            height={56}
            className="mx-auto"
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={fadeUp}
          className="font-display font-extrabold text-5xl md:text-6xl lg:text-7xl text-text-primary leading-[1.1] mb-5 tracking-tight"
        >
          {title}
        </motion.h1>

        {/* Tagline */}
        <motion.p
          variants={fadeUp}
          className="text-xl md:text-2xl text-text-secondary mb-3 font-text"
        >
          {hero.tagline}
        </motion.p>

        {/* Description */}
        <motion.p
          variants={fadeUp}
          className="text-text-muted mb-4 max-w-xl mx-auto leading-relaxed"
        >
          {hero.description}
        </motion.p>

        {/* Duration badge */}
        <motion.div variants={fadeUp} className="mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-3 border border-navy-border text-xs font-mono text-text-muted">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {duration}
          </span>
        </motion.div>

        {/* CTA button */}
        <motion.div variants={fadeUp}>
          <button
            onClick={handleStartClick}
            className="group inline-flex items-center gap-2.5 px-10 py-4 rounded-xl text-white font-display font-bold text-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            style={{
              backgroundColor: branding.accentColor,
              boxShadow: `0 0 40px rgba(${branding.accentColorRgb}, 0.25), 0 4px 20px rgba(0,0,0,0.2)`,
            }}
          >
            {hero.ctaText}
            <svg
              className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </motion.div>

        {/* Chapter grid */}
        <motion.div
          className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-3 text-left"
          variants={stagger}
        >
          {chapters.map((ch) => (
            <motion.div
              key={ch.id}
              variants={cardVariant}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="rounded-xl bg-surface-1 border border-navy-border p-5 hover:bg-surface-3 hover:border-surface-4 transition-colors cursor-default"
            >
              <div className="w-8 h-8 mb-2.5">
                {ch.badgeIcon.startsWith("/") ? (
                  <img src={ch.badgeIcon} alt="" className="w-8 h-8 theme-icon" />
                ) : (
                  <span className="text-2xl">{ch.badgeIcon}</span>
                )}
              </div>
              <div
                className="text-[10px] font-mono mb-1.5 tracking-wide uppercase"
                style={{ color: branding.accentColor }}
              >
                Chapter {ch.id} &middot; {ch.duration}
              </div>
              <div className="font-display font-semibold text-sm text-text-primary leading-snug">
                {ch.title}
              </div>
              <div className="text-xs text-text-muted mt-1.5 leading-relaxed">
                {ch.subtitle}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={fadeUp}
          className="mt-16 flex items-center justify-center gap-2 text-text-muted/50 text-xs"
        >
          <span>Powered by</span>
          <img
            src="/images/twilio-logo-white.svg"
            alt="Twilio"
            width={60}
            height={20}
            className="opacity-40 theme-logo"
          />
        </motion.div>
      </motion.div>
    </div>
    </>
  );
}
