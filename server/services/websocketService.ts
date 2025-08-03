import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { ActivityLog } from "@shared/schema";

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export function initializeWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: "/ws" });
  
  wss.on("connection", (ws: WebSocket) => {
    clients.add(ws);
    
    ws.on("close", () => {
      clients.delete(ws);
    });
    
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      clients.delete(ws);
    });

    // Enviar confirmação de conexão
    ws.send(JSON.stringify({ 
      type: "connected", 
      message: "Conectado aos logs em tempo real" 
    }));
  });

  console.log("WebSocket server initialized");
}

export function broadcastLog(log: ActivityLog) {
  if (!wss || clients.size === 0) return;

  const message = JSON.stringify({
    type: "log",
    data: log
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
      } catch (error) {
        console.error("Error sending log to client:", error);
        clients.delete(client);
      }
    } else {
      clients.delete(client);
    }
  });
}

export function broadcastStats(stats: any) {
  if (!wss || clients.size === 0) return;

  const message = JSON.stringify({
    type: "stats",
    data: stats
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
      } catch (error) {
        console.error("Error sending stats to client:", error);
        clients.delete(client);
      }
    } else {
      clients.delete(client);
    }
  });
}
