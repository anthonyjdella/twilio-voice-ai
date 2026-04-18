import { createServer } from "node:http";
import next from "next";
import { WebSocketServer } from "ws";
import { handleConversationRelayConnection } from "./voice-agent/handler.mjs";
import { getAllMetrics } from "./analytics/queries.mjs";
import { renderAdminPage } from "./analytics/admin-html.mjs";

const port = parseInt(process.env.PORT || "8080", 10);
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev, hostname: "0.0.0.0", port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const { pathname } = new URL(req.url || "/", `http://${req.headers.host}`);

    if (pathname === "/admin" || pathname === "/admin/data") {
      const adminKey = process.env.ADMIN_KEY;
      if (adminKey) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        if (url.searchParams.get("key") !== adminKey) {
          res.writeHead(401, { "Content-Type": "text/plain" });
          res.end("Unauthorized");
          return;
        }
      }

      try {
        const data = getAllMetrics();
        if (pathname === "/admin/data") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(data));
        } else {
          const html = renderAdminPage(data, adminKey);
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
