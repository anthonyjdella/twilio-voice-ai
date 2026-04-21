import { createServer } from "node:http";
import next from "next";
import { WebSocketServer } from "ws";
import { handleConversationRelayConnection } from "./voice-agent/handler.mjs";
import { recordEvent, wipeAllEvents } from "./analytics/db.mjs";
import { getAllMetrics } from "./analytics/queries.mjs";
import { renderAdminPage } from "./analytics/admin-html.mjs";
import { generateReport } from "./analytics/report-pdf.mjs";

const port = parseInt(process.env.PORT || "8080", 10);
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev, hostname: "0.0.0.0", port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const { pathname } = new URL(req.url || "/", `http://${req.headers.host}`);

    if (pathname === "/api/events" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const { sessionId, events } = JSON.parse(body);
          if (sessionId && Array.isArray(events)) {
            for (const e of events) {
              if (e.type) recordEvent(sessionId, e.type, e.payload ?? null);
            }
          }
        } catch {}
        res.writeHead(204).end();
      });
      return;
    }

    // Admin-only: wipe every event in the analytics database so the next run
    // starts from a clean slate. Meant for pre-workshop testing; the UI shows
    // a double-confirm. No auth here because the whole /admin surface is
    // expected to sit behind an upstream gate in production.
    if (pathname === "/admin/reset-all" && req.method === "POST") {
      try {
        const removed = wipeAllEvents();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true, removed }));
      } catch (err) {
        console.error("[admin] reset-all error:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: String(err?.message ?? err) }));
      }
      return;
    }

    if (pathname === "/admin/report") {
      try {
        const data = getAllMetrics();
        const doc = generateReport(data);
        const filename = `workshop-analytics-${new Date().toISOString().slice(0, 10)}.pdf`;
        res.writeHead(200, {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
        });
        doc.pipe(res);
      } catch (err) {
        console.error("[admin] PDF report error:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Failed to generate report");
      }
      return;
    }

    const cleanPath = pathname.replace(/\/+$/, "");
    if (cleanPath === "/admin" || cleanPath === "/admin/data") {
      try {
        const data = getAllMetrics();
        if (cleanPath === "/admin/data") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(data));
        } else {
          const html = renderAdminPage(data);
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(html);
        }
      } catch (err) {
        console.error("[admin] Analytics error:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal analytics error");
      }
      return;
    }

    handle(req, res);
  });

  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws) => {
    handleConversationRelayConnection(ws);
  });

  server.on("upgrade", (req, socket, head) => {
    const { pathname } = new URL(req.url || "/", `http://${req.headers.host}`);
    if (pathname === "/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    } else if (!dev) {
      socket.destroy();
    }
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(
      `> Server listening on http://0.0.0.0:${port} (${dev ? "development" : "production"})`
    );
    console.log(`> WebSocket endpoint: ws://0.0.0.0:${port}/ws`);
  });
});
