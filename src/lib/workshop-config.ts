import type { ChapterMeta } from "./types";

// ─── Workshop Configuration ─────────────────────────────────────────
// This is the single source of truth for a workshop instance.
// Every layout component, page, and feature reads from this config.
// To create a new workshop, copy workshop.config.ts and customize.

export interface WorkshopConfig {
  /** Unique ID — used for localStorage namespacing (e.g. "voice-ai") */
  id: string;

  /** Full title shown on hero page (e.g. "Build a Voice AI Agent") */
  title: string;

  /** Short title for the top bar (e.g. "Voice AI Workshop") */
  shortTitle: string;

  /** Meta description for SEO */
  description: string;

  /** Estimated total duration (e.g. "90 minutes") */
  duration: string;

  /** Hero page configuration */
  hero: {
    /** Subtitle / tagline below the title */
    tagline: string;
    /** Paragraph description */
    description: string;
    /** Call-to-action button text */
    ctaText: string;
    /** Optional hero illustration path (relative to /public/) */
    illustration?: string;
  };

  /** Branding overrides */
  branding: {
    /** Primary accent color hex (e.g. "#EF223A") */
    accentColor: string;
    /** RGB values for rgba usage (e.g. "239, 34, 58") */
    accentColorRgb: string;
  };

  /** Chapter structure — defines all chapters and their steps */
  chapters: ChapterMeta[];

  /** Sidebar widget configuration */
  sidebar: {
    /** Widget type: 'custom' shows configurable key-value card, 'none' hides it */
    widget: "custom" | "none";
    /** Title of the sidebar card (e.g. "Your Agent") */
    title?: string;
    /** Fields to display — reads values from progress.workshopState[key] */
    fields?: { label: string; key: string }[];
  };

  /** Feature flags */
  features: {
    /** Enable Builder/Explorer audience toggle */
    audienceToggle: boolean;
    /** Enable chapter completion celebrations */
    celebrations: boolean;
  };
}
