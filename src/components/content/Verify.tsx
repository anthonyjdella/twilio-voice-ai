"use client";

import { useState } from "react";
import { CheckCircle, Wrench } from "lucide-react";

interface VerifyProps {
  question: string;
  onSuccess?: () => void;
}

export function Verify({ question, onSuccess }: VerifyProps) {
  const [state, setState] = useState<"idle" | "success" | "help">("idle");

  return (
    <div className="rounded-xl border border-navy-border bg-surface-1 p-6 mb-6 text-center">
      <p className="text-sm text-text-secondary mb-4">{question}</p>

      {state === "idle" && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              setState("success");
              onSuccess?.();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-success/10 text-success text-sm font-medium border border-success/20 hover:bg-success/20 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Yes, it worked!
          </button>
          <button
            onClick={() => setState("help")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-2 text-text-secondary text-sm font-medium border border-navy-border hover:bg-surface-3 transition-colors"
          >
            <Wrench className="w-4 h-4" />
            I need help
          </button>
        </div>
      )}

      {state === "success" && (
        <div className="flex items-center justify-center gap-2 text-success animate-scale-in">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Excellent! Moving on.</span>
        </div>
      )}

      {state === "help" && (
        <div className="text-left mt-4 p-4 rounded-lg bg-surface-1 border border-navy-border text-sm text-text-secondary leading-relaxed">
          <p className="font-medium text-text-primary mb-2">Troubleshooting:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Make sure your server is running (<code className="bg-surface-3 px-1 py-0.5 rounded font-mono text-xs">node server.js</code>)</li>
            <li>Check that your Codespace port is set to <strong>Public</strong> visibility</li>
            <li>Verify your <code className="bg-surface-3 px-1 py-0.5 rounded font-mono text-xs">.env</code> file has the correct credentials loaded</li>
            <li>Check the terminal for error messages</li>
          </ul>
          <button
            onClick={() => setState("idle")}
            className="mt-3 text-xs text-twilio-blue hover:underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
