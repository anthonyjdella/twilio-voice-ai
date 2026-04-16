import type { ReactNode } from "react";
import { Lightbulb, AlertTriangle, XCircle, Info } from "lucide-react";

const variants = {
  tip: {
    icon: Lightbulb,
    border: "border-twilio-blue/30",
    bg: "bg-twilio-blue/5",
    iconColor: "text-twilio-blue",
    label: "Tip",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-warning/30",
    bg: "bg-warning/5",
    iconColor: "text-warning",
    label: "Common Mistake",
  },
  error: {
    icon: XCircle,
    border: "border-error/30",
    bg: "bg-error/5",
    iconColor: "text-error",
    label: "Watch Out",
  },
  info: {
    icon: Info,
    border: "border-surface-4",
    bg: "bg-surface-1",
    iconColor: "text-text-secondary",
    label: "Note",
  },
};

interface CalloutProps {
  type: keyof typeof variants;
  children: ReactNode;
}

export function Callout({ type, children }: CalloutProps) {
  const v = variants[type];
  const Icon = v.icon;

  return (
    <div
      className={`rounded-xl border-l-4 ${v.border} ${v.bg} p-4 mb-6`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${v.iconColor} shrink-0 mt-0.5`} />
        <div>
          <div className={`text-xs font-mono ${v.iconColor} uppercase tracking-wider mb-1`}>
            {v.label}
          </div>
          <div className="text-sm text-text-secondary leading-relaxed [&_code]:bg-surface-3 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-[12px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
