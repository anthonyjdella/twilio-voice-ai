import { NextResponse } from "next/server";

interface EventPayload {
  sessionId: string;
  events: Array<{ type: string; payload?: Record<string, unknown> }>;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EventPayload;
    if (!body.sessionId || !Array.isArray(body.events)) {
      return new NextResponse(null, { status: 204 });
    }

    const { recordEvent } = await import("../../../../analytics/db.mjs");
    for (const event of body.events) {
      if (event.type) {
        recordEvent(body.sessionId, event.type, event.payload ?? null);
      }
    }
  } catch {
    // Analytics must never break the workshop
  }
  return new NextResponse(null, { status: 204 });
}
