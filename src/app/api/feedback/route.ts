import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  let body: {
    nps?: number;
    comment?: string;
    name?: string;
    email?: string;
    sessionId?: string;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const nps = Number(body.nps);
  if (!Number.isInteger(nps) || nps < 0 || nps > 10) {
    return Response.json(
      { error: "nps must be an integer between 0 and 10" },
      { status: 400 }
    );
  }

  const comment = typeof body.comment === "string" ? body.comment.trim().slice(0, 2000) : "";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) : "";
  const email = typeof body.email === "string" ? body.email.trim().slice(0, 320) : "";
  const sessionId = typeof body.sessionId === "string" && body.sessionId
    ? body.sessionId
    : "anonymous";

  try {
    const { recordEvent } = await import("../../../../analytics/db.mjs");
    recordEvent(sessionId, "feedback", {
      nps,
      comment: comment || undefined,
      name: name || undefined,
      email: email || undefined,
    });
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/feedback] Failed to record feedback:", message);
    return Response.json({ error: "Failed to record feedback" }, { status: 500 });
  }
}
