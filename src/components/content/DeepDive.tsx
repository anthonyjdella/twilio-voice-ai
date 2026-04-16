"use client";

import { useState } from "react";
import { GraduationCap, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

interface DeepDiveProps {
  title?: string;
  children: ReactNode;
}

export function DeepDive({ title = "Deep Dive", children }: DeepDiveProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-navy-border bg-surface-1 overflow-hidden mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-1 transition-colors"
      >
        <GraduationCap className="w-5 h-5 text-twilio-gold shrink-0" />
        <span className="text-sm font-medium text-text-secondary flex-1">
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0 text-sm text-text-secondary leading-relaxed border-t border-navy-border mt-0 pt-4 [&_code]:bg-surface-3 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-[12px]">
          {children}
        </div>
      )}
    </div>
  );
}
