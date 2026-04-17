import Link from "next/link";
import workshopConfig from "@/workshop.config";

/**
 * Segment-scoped 404 for any /workshop/* path. Keeps the workshop layout
 * chrome (TopBar, Sidebar, BottomNav rendered by workshop/layout.tsx) and
 * suggests the first step so the learner doesn't bounce to the site root.
 */
export default function WorkshopNotFound() {
  const first = workshopConfig.chapters[0];
  const firstHref = first?.steps?.[0]
    ? `/workshop/${first.slug}/${first.steps[0].slug}`
    : "/workshop";

  return (
    <div className="text-center py-20">
      <div className="font-mono text-xs text-twilio-red uppercase tracking-wider mb-3">
        404
      </div>
      <h1 className="font-display font-extrabold text-3xl text-text-primary mb-3">
        Step not found
      </h1>
      <p className="text-sm text-text-muted max-w-md mx-auto mb-6">
        We couldn&apos;t find that chapter or step. It may have been renamed,
        or the link is wrong.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          href={firstHref}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-twilio-red text-white font-display font-extrabold text-sm shadow-[0_2px_10px_rgba(239,34,58,0.3)] hover:brightness-110 transition-all"
        >
          Start from the beginning
        </Link>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-surface-2 border border-navy-border text-text-secondary text-sm font-bold hover:bg-surface-3 transition-colors"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
