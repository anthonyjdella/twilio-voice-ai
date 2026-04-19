"use client";

import { useState } from "react";
import workshopConfig from "@/workshop.config";
import { WorkshopProvider } from "@/lib/WorkshopContext";
import { AudienceProvider, useAudienceMode } from "@/lib/AudienceContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import { ProgressProvider } from "@/components/layout/ProgressContext";
import { AnalyticsProvider } from "@/lib/AnalyticsContext";
import { PageProvider } from "@/lib/PageContext";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { CelebrationManager } from "@/components/celebrations/CelebrationManager";
import { ProgressTracker } from "@/components/layout/ProgressTracker";
import { StorageBanner } from "@/components/layout/StorageBanner";
import { OnboardingModal } from "@/components/layout/OnboardingModal";

/**
 * Deep-link onboarding: a learner who opens `/workshop/...` as their first
 * entry point never passes through the home CTA, so `needsOnboarding` never
 * gets resolved and they land in default-Builder mode without an explicit
 * choice. Render the modal here so it appears regardless of entry point;
 * home-page onboarding still runs on its own because that path renders
 * outside this layout.
 */
function WorkshopShell({ children }: { children: React.ReactNode }) {
  const { needsOnboarding } = useAudienceMode();
  const [dismissed, setDismissed] = useState(false);
  const showOnboarding = needsOnboarding && !dismissed;

  return (
    <div className="h-screen flex flex-col bg-navy overflow-hidden">
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto">
          <StorageBanner />
          <div className="max-w-4xl mx-auto px-8 py-8">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </main>
      </div>
      <BottomNav />
      <ProgressTracker />
      {workshopConfig.features.celebrations && <CelebrationManager />}
      <OnboardingModal
        open={showOnboarding}
        onComplete={() => setDismissed(true)}
      />
    </div>
  );
}

export default function WorkshopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider defaultTheme={workshopConfig.defaultTheme ?? "dark"}>
      <AnalyticsProvider>
        <WorkshopProvider>
          <AudienceProvider>
            <ProgressProvider>
              <PageProvider>
                <WorkshopShell>{children}</WorkshopShell>
              </PageProvider>
            </ProgressProvider>
          </AudienceProvider>
        </WorkshopProvider>
      </AnalyticsProvider>
    </ThemeProvider>
  );
}
