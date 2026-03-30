"use client";

import { CopyButton } from "./CopyButton";

interface JsonMessageProps {
  direction: "inbound" | "outbound";
  type: string;
  code: string;
}

export function JsonMessage({ direction, type, code }: JsonMessageProps) {
  const isInbound = direction === "inbound";

  return (
    <div className="rounded-xl overflow-hidden mb-6 border border-navy-border">
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 ${
          isInbound
            ? "bg-twilio-blue/10 border-b border-twilio-blue/20"
            : "bg-success/10 border-b border-success/20"
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className={isInbound ? "text-twilio-blue" : "text-success"}>
            {isInbound ? "\u2190 FROM TWILIO" : "\u2192 TO TWILIO"}
          </span>
          <span className="text-text-muted">{type}</span>
        </div>
        <CopyButton text={code} />
      </div>

      {/* Code */}
      <pre className="p-4 bg-navy-light text-[13px] leading-relaxed font-mono overflow-x-auto">
        <code className="text-text-primary/80">{code}</code>
      </pre>
    </div>
  );
}
