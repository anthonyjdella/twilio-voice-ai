import type { ReactNode } from "react";

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="text-text-secondary leading-relaxed text-[15px] mb-6 [&_code]:bg-surface-3 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-[13px] [&_code]:text-twilio-blue [&_a]:text-twilio-blue [&_a]:underline [&_a]:underline-offset-2 [&_strong]:text-text-primary [&_strong]:font-bold">
      {children}
    </div>
  );
}

export function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-display font-extrabold text-xl text-text-primary mt-10 mb-4 first:mt-0">
      {children}
    </h2>
  );
}
