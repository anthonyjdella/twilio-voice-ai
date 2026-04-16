"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import workshopConfig from "@/workshop.config";

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
  const { title, hero, chapters, branding, duration } = workshopConfig;

  return (
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
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
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
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
            style={{ backgroundColor: branding.accentColor }}
          >
            <Image
              src="/images/twilio-bug-white.svg"
              alt="Twilio"
              width={28}
              height={28}
            />
          </div>
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-navy-border text-xs font-mono text-text-muted">
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
          <Link
            href="/workshop"
            className="group inline-flex items-center gap-2.5 px-10 py-4 rounded-xl text-white font-display font-bold text-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
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
          </Link>
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
              className="rounded-xl bg-white/[0.03] border border-navy-border p-5 hover:bg-white/[0.06] hover:border-white/[0.08] transition-colors cursor-default"
            >
              <div className="w-8 h-8 mb-2.5">
                {ch.badgeIcon.startsWith("/") ? (
                  <img src={ch.badgeIcon} alt="" className="w-8 h-8" />
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
          <Image
            src="/images/twilio-logo-white.svg"
            alt="Twilio"
            width={60}
            height={20}
            className="opacity-40"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
