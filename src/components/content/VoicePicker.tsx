"use client";

import { useProgressContext } from "@/components/layout/ProgressContext";

const VOICE_OPTIONS = [
  {
    provider: "ElevenLabs",
    voices: [
      { id: "021ab406-5679-4e42-8a9c-ee245e67b2b5", name: "Rachel", desc: "Warm, female" },
      { id: "29vD33N1tVWHNs5r4Cb8kLJR", name: "Drew", desc: "Confident, male" },
      { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", desc: "Soft, female" },
      { id: "ErXwobaYiN019PkySvjV", name: "Antoni", desc: "Friendly, male" },
      { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli", desc: "Youthful, female" },
    ],
  },
  {
    provider: "Google",
    voices: [
      { id: "en-US-Neural2-C", name: "Neural2-C", desc: "Female" },
      { id: "en-US-Neural2-D", name: "Neural2-D", desc: "Male" },
      { id: "en-US-Studio-O", name: "Studio-O", desc: "Female, studio quality" },
      { id: "en-US-Studio-Q", name: "Studio-Q", desc: "Male, studio quality" },
    ],
  },
  {
    provider: "Amazon Polly",
    voices: [
      { id: "Joanna", name: "Joanna", desc: "Female, neural" },
      { id: "Matthew", name: "Matthew", desc: "Male, neural" },
      { id: "Amy", name: "Amy", desc: "Female, British" },
    ],
  },
];

export function VoicePicker() {
  const { progress, updateWorkshopState } = useProgressContext();

  const currentVoice = progress.workshopState.voice || "";
  const currentProvider = progress.workshopState.ttsProvider || "ElevenLabs";

  function selectVoice(
    voiceId: string,
    provider: string,
    voiceName: string
  ) {
    updateWorkshopState({
      voice: voiceId,
      ttsProvider: provider,
      voiceLabel: voiceName,
    });
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
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </div>
        <span className="text-sm font-mono text-text-primary uppercase tracking-wider">
          Choose a Voice
        </span>
      </div>

      <p className="text-sm text-text-muted mb-4">
        Select the voice your agent will use when it speaks. This takes effect
        on your next call.
      </p>

      <div className="space-y-4">
        {VOICE_OPTIONS.map((group) => (
          <div key={group.provider}>
            <div className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2">
              {group.provider}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {group.voices.map((voice) => {
                const isActive =
                  currentVoice === voice.id &&
                  currentProvider === group.provider;
                return (
                  <button
                    key={voice.id}
                    onClick={() =>
                      selectVoice(voice.id, group.provider, voice.name)
                    }
                    className={`text-left p-3 rounded-lg border transition-colors ${
                      isActive
                        ? "border-twilio-red bg-twilio-red/10"
                        : "border-navy-border bg-surface-2 hover:border-text-muted/30"
                    }`}
                  >
                    <div className="text-sm font-medium text-text-primary">
                      {voice.name}
                    </div>
                    <div className="text-xs text-text-muted">{voice.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {currentVoice && (
        <div className="mt-4 px-3 py-2 rounded-lg bg-twilio-red/5 border border-twilio-red/20">
          <span className="text-xs text-twilio-red">
            Active: {progress.workshopState.voiceLabel || currentVoice} ({currentProvider})
          </span>
        </div>
      )}
    </div>
  );
}
