import { createServer } from "node:http";
import next from "next";
import { WebSocketServer } from "ws";
import { handleConversationRelayConnection } from "./voice-agent/handler.mjs";

const port = parseInt(process.env.PORT || "8080", 10);
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev, hostname: "0.0.0.0", port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
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
