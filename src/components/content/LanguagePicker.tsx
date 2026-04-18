"use client";

import { useProgressContext } from "@/components/layout/ProgressContext";

const LANGUAGES = [
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "es-ES", label: "Spanish (Spain)" },
  { code: "es-MX", label: "Spanish (Mexico)" },
  { code: "fr-FR", label: "French" },
  { code: "fr-CA", label: "French (Canada)" },
  { code: "de-DE", label: "German" },
  { code: "pt-BR", label: "Portuguese (Brazil)" },
  { code: "ja-JP", label: "Japanese" },
  { code: "ko-KR", label: "Korean" },
  { code: "zh-CN", label: "Chinese (Mandarin)" },
  { code: "it-IT", label: "Italian" },
  { code: "hi-IN", label: "Hindi" },
];

export function LanguagePicker() {
  const { progress, updateWorkshopState } = useProgressContext();

  const currentLang = progress.workshopState.language || "en-US";

  function selectLanguage(code: string) {
    updateWorkshopState({ language: code });
  }

  return (
    <div className="rounded-xl border border-navy-border bg-surface-1 p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg bg-twilio-red/15 flex items-center justify-center text-twilio-red">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>
        <span className="text-sm font-mono text-text-primary uppercase tracking-wider">
          Choose a Language
        </span>
      </div>

      <p className="text-sm text-text-muted mb-4">
        Select the language your agent will listen for and speak. This
        configures both speech recognition and text-to-speech.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => selectLanguage(lang.code)}
            className={`text-left p-3 rounded-lg border transition-colors ${
              currentLang === lang.code
                ? "border-twilio-red bg-twilio-red/10"
                : "border-navy-border bg-surface-2 hover:border-text-muted/30"
            }`}
          >
            <div className="text-sm font-medium text-text-primary">
              {lang.label}
            </div>
            <div className="text-xs text-text-muted font-mono">
              {lang.code}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 px-3 py-2 rounded-lg bg-twilio-red/5 border border-twilio-red/20">
        <span className="text-xs text-twilio-red">
          Active:{" "}
          {LANGUAGES.find((l) => l.code === currentLang)?.label || currentLang}
        </span>
      </div>
    </div>
  );
}
