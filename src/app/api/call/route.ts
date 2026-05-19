import { NextRequest } from "next/server";
import twilio from "twilio";

export async function POST(request: NextRequest) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !twilioPhoneNumber) {
    return Response.json(
      { error: "Server is missing Twilio credentials" },
      { status: 500 }
    );
  }

  let body: {
    phoneNumber?: string;
    twimlUrl?: string;
    sessionId?: string;
    agentConfig?: {
      agentName?: string;
      voice?: string;
      ttsProvider?: string;
      language?: string;
      personality?: string;
      welcomeGreeting?: string;
      enabledTools?: string;
      handoffEnabled?: string;
    };
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const phoneNumber = body.phoneNumber?.trim();
  if (!phoneNumber) {
    return Response.json(
      { error: "phoneNumber is required" },
      { status: 400 }
    );
  }

  if (!/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
    return Response.json(
      { error: "phoneNumber must be in E.164 format (e.g. +15551234567)" },
      { status: 400 }
    );
  }

  let twimlUrl: string;
  if (body.twimlUrl && isValidHttpUrl(body.twimlUrl)) {
    // Builder track: hand Twilio the user's own /twiml endpoint so their
    // server.js owns the entire TwiML response (voice, greeting, language,
    // ConversationRelay attributes, custom parameters, the WebSocket URL).
    // The website never wraps or rewrites it.
    twimlUrl = body.twimlUrl;
  } else {
    // Explorer track (or Builder using the built-in server): the website
    // builds the TwiML, forwarding the picker selections as query params.
    const host = request.headers.get("host") || "localhost:8080";
    const protocol = host.includes("localhost") ? "http" : "https";
    const twimlBaseUrl = `${protocol}://${host}/api/twiml`;

    const twimlParams = new URLSearchParams();
    if (body.agentConfig?.voice) twimlParams.set("voice", body.agentConfig.voice);
    if (body.agentConfig?.ttsProvider)
      twimlParams.set("ttsProvider", body.agentConfig.ttsProvider);
    if (body.agentConfig?.language)
      twimlParams.set("language", body.agentConfig.language);
    if (body.agentConfig?.agentName)
      twimlParams.set("agentName", body.agentConfig.agentName);
    if (body.agentConfig?.personality)
      twimlParams.set("personality", body.agentConfig.personality);
    if (body.agentConfig?.welcomeGreeting)
      twimlParams.set("welcomeGreeting", body.agentConfig.welcomeGreeting);
    if (body.agentConfig?.enabledTools)
      twimlParams.set("enabledTools", body.agentConfig.enabledTools);
    if (body.agentConfig?.handoffEnabled)
      twimlParams.set("handoffEnabled", body.agentConfig.handoffEnabled);

    const qs = twimlParams.toString();
    twimlUrl = qs ? `${twimlBaseUrl}?${qs}` : twimlBaseUrl;
  }

  try {
    const client = twilio(accountSid, authToken);
    const call = await client.calls.create({
      to: phoneNumber,
      from: twilioPhoneNumber,
      url: twimlUrl,
      method: "POST",
    });

    if (body.sessionId) {
      try {
        const { recordEvent } = await import("../../../../analytics/db.mjs");
        recordEvent(body.sessionId, "call_initiated", {
          callSid: call.sid,
          agentName: body.agentConfig?.agentName,
          voice: body.agentConfig?.voice,
          language: body.agentConfig?.language,
          ttsProvider: body.agentConfig?.ttsProvider,
        });
      } catch { /* analytics best-effort */ }
    }

    return Response.json({ callSid: call.sid, status: call.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/call] Failed to create call:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
