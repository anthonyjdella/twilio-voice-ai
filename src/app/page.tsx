import Link from "next/link";
import { chapters } from "@/content/chapters";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-navy relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,34,58,0.08)_0%,transparent_70%)]" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        {/* Twilio logo mark */}
        <div className="w-16 h-16 rounded-2xl bg-twilio-red flex items-center justify-center mx-auto mb-8">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="8" cy="8" r="2.5" fill="white" />
            <circle cx="16" cy="8" r="2.5" fill="white" />
            <circle cx="8" cy="16" r="2.5" fill="white" />
            <circle cx="16" cy="16" r="2.5" fill="white" />
          </svg>
        </div>

        <h1 className="font-display font-extrabold text-5xl md:text-6xl text-text-primary leading-tight mb-4">
          Build a Voice AI Agent
        </h1>

        <p className="text-xl text-text-secondary mb-3 font-text">
          A 90-minute guided workshop with{" "}
          <span className="text-twilio-red font-semibold">
            Twilio ConversationRelay
          </span>
        </p>

        <p className="text-text-muted mb-10 max-w-lg mx-auto">
          By the end of this workshop, you&apos;ll have a working voice AI agent
          that callers can talk to over the phone &mdash; with a custom persona,
          voice, tool calling, and more.
        </p>

        <Link
          href="/workshop"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-twilio-red text-white font-display font-bold text-lg hover:bg-twilio-red/90 transition-all duration-200 shadow-[0_0_30px_rgba(239,34,58,0.3)] hover:shadow-[0_0_40px_rgba(239,34,58,0.5)]"
        >
          Start Workshop
          <svg
            width="20"
            height="20"
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

        {/* Chapter preview */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-3 text-left">
          {chapters.map((ch) => (
            <div
              key={ch.id}
              className="rounded-xl bg-white/[0.03] border border-navy-border p-4 hover:bg-white/[0.05] transition-colors"
            >
              <div className="text-2xl mb-2">{ch.badgeIcon}</div>
              <div className="text-xs font-mono text-twilio-red mb-1">
                Chapter {ch.id} &middot; {ch.duration}
              </div>
              <div className="font-display font-semibold text-sm text-text-primary">
                {ch.title}
              </div>
              <div className="text-xs text-text-muted mt-1">{ch.subtitle}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
