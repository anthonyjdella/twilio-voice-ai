"use client";

import { ProgressProvider } from "@/components/layout/ProgressContext";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function WorkshopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProgressProvider>
      <div className="h-screen flex flex-col bg-navy overflow-hidden">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-8 py-8">{children}</div>
          </main>
        </div>
        <BottomNav />
      </div>
    </ProgressProvider>
  );
}
