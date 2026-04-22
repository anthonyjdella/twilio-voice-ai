"use client";

import { useState, useEffect } from "react";
import { Phone, PhoneOff, Loader2 } from "lucide-react";
import { useAudienceMode } from "@/lib/AudienceContext";
import { useProgressContext } from "@/components/layout/ProgressContext";
import { useAnalyticsContext } from "@/lib/AnalyticsContext";

type CallStatus = "idle" | "calling" | "connected" | "ended" | "error";

const WS_URL_KEY = "workshop-builder-ws-url";

export function CallMe() {
  const { isBuilder } = useAudienceMode();
  const { progress, incrementCalls, updateWorkshopState } =
    useProgressContext();
  const { sessionId } = useAnalyticsContext();

  const [phoneNumber, setPhoneNumber] = useState(
    () => progress.workshopState.phoneNumber || ""
  );
  const [wsUrl, setWsUrl] = useState("");
  const [useBuiltIn, setUseBuiltIn] = useState(false);
  const [status, setStatus] = useState<CallStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [callSid, setCallSid] = useState("");

  useEffect(() => {
    if (isBuilder) {
      const stored = localStorage.getItem(WS_URL_KEY) || "";
      queueMicrotask(() => setWsUrl(stored));
    }
  }, [isBuilder]);

  useEffect(() => {
    if (isBuilder && wsUrl) {
      localStorage.setItem(WS_URL_KEY, wsUrl);
    }
  }, [isBuilder, wsUrl]);

  async function handleCall() {
    if (!phoneNumber.trim()) return;

    setStatus("calling");
    setErrorMessage("");
    setCallSid("");

    updateWorkshopState({ phoneNumber: phoneNumber.trim() });

    const body: Record<string, unknown> = {
      phoneNumber: phoneNumber.trim(),
      sessionId: sessionId.current || undefined,
      agentConfig: {
        agentName: progress.workshopState.agentName || undefined,
        voice: progress.workshopState.voice || undefined,
        ttsProvider: progress.workshopState.ttsProvider || undefined,
        language: progress.workshopState.language || undefined,
        personality: progress.workshopState.personality || undefined,
        welcomeGreeting: progress.workshopState.welcomeGreeting || undefined,
        enabledTools: progress.workshopState.enabledTools || undefined,
        handoffEnabled: progress.workshopState.handoffEnabled || undefined,
      },
    };

    if (isBuilder && wsUrl && !useBuiltIn) {
      body.wsUrl = wsUrl;
    }

    try {
      const res = await fetch("/api/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error || "Call failed");
        return;
      }

      setCallSid(data.callSid);
      setStatus("connected");
      incrementCalls();

      setTimeout(() => setStatus("idle"), 30000);
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Network error"
      );
    }
  }

  const isDisabled = status === "calling" || !phoneNumber.trim();

  return (
    <div className="rounded-xl border border-navy-border bg-surface-1 p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Phone className="w-5 h-5 text-twilio-red" />
        <span className="text-sm font-mono text-text-primary uppercase tracking-wider">
          Call Me
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <label
            htmlFor="phone-number"
            className="block text-xs text-text-muted mb-1"
          >
            Your phone number (E.164 format)
          </label>
          <input
            id="phone-number"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+15551234567"
            className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-navy-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-twilio-red/50"
          />
        </div>

        {isBuilder && (
          <div>
            <label
              htmlFor="ws-url"
              className="block text-xs text-text-muted mb-1"
            >
              Your WebSocket URL
            </label>
            <input
              id="ws-url"
              type="url"
              value={wsUrl}
              onChange={(e) => setWsUrl(e.target.value)}
              placeholder="wss://your-codespace-url.app.github.dev/ws"
              disabled={useBuiltIn}
              className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-navy-border text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-twilio-red/50 disabled:opacity-50"
            />
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useBuiltIn}
                onChange={(e) => setUseBuiltIn(e.target.checked)}
                className="rounded border-navy-border"
              />
              <span className="text-xs text-text-muted">
                Use the built-in server instead
              </span>
            </label>
          </div>
        )}

        <button
          onClick={handleCall}
          disabled={isDisabled}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isDisabled
              ? "bg-surface-3 text-text-muted cursor-not-allowed"
              : "bg-twilio-red text-white hover:bg-twilio-red/90 active:bg-twilio-red/80"
          }`}
        >
          {status === "calling" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Calling...
            </>
          ) : (
            <>
              <Phone className="w-4 h-4" />
              Call Me
            </>
          )}
        </button>

        {status === "connected" && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 border border-success/20">
            <Phone className="w-4 h-4 text-success animate-pulse" />
            <span className="text-xs text-success">
              Your phone is ringing — pick up and say hi
            </span>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-error/10 border border-error/20">
            <PhoneOff className="w-4 h-4 text-error" />
            <span className="text-xs text-error">{errorMessage}</span>
          </div>
        )}

        {callSid && (
          <div className="text-[11px] text-text-muted font-mono truncate">
            Call SID: {callSid}
          </div>
        )}
      </div>
    </div>
  );
}
