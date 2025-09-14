import { WebSocketServer, WebSocket } from "ws";
import { type Server } from "http";
import { type Download, type BatchDownload } from "@shared/schema";

export interface WebSocketMessage {
  type: "download_progress" | "download_complete" | "download_error" | "batch_progress" | "batch_complete" | "connection";
  payload: any;
}

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Set<WebSocket>;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.clients = new Set();
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.wss.on("connection", (ws: WebSocket) => {
      this.clients.add(ws);
      console.log("WebSocket client connected");

      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error("Invalid WebSocket message:", error);
        }
      });

      ws.on("close", () => {
        this.clients.delete(ws);
        console.log("WebSocket client disconnected");
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
        this.clients.delete(ws);
      });

      // Send connection confirmation
      this.sendToClient(ws, {
        type: "connection",
        payload: { status: "connected" }
      });
    });
  }

  private handleMessage(ws: WebSocket, message: any) {
    // Handle client messages if needed
    console.log("Received message:", message);
  }

  private sendToClient(ws: WebSocket, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error("Failed to send WebSocket message:", error);
      }
    }
  }

  public broadcast(message: WebSocketMessage) {
    this.clients.forEach((client) => {
      this.sendToClient(client, message);
    });
  }

  public sendDownloadProgress(download: Download) {
    this.broadcast({
      type: "download_progress",
      payload: {
        id: download.id,
        url: download.url,
        title: download.title,
        progress: download.progress,
        status: download.status,
        format: download.format,
      }
    });
  }

  public sendDownloadComplete(download: Download) {
    this.broadcast({
      type: "download_complete",
      payload: {
        id: download.id,
        url: download.url,
        title: download.title,
        status: download.status,
        filePath: download.filePath,
        fileSize: download.fileSize,
      }
    });
  }

  public sendDownloadError(download: Download) {
    this.broadcast({
      type: "download_error",
      payload: {
        id: download.id,
        url: download.url,
        status: download.status,
        error: download.errorMessage,
      }
    });
  }

  public sendBatchProgress(batch: BatchDownload) {
    this.broadcast({
      type: "batch_progress",
      payload: {
        id: batch.id,
        progress: batch.progress,
        status: batch.status,
        totalItems: batch.totalItems,
        completedItems: batch.completedItems,
      }
    });
  }

  public sendBatchComplete(batch: BatchDownload) {
    this.broadcast({
      type: "batch_complete",
      payload: {
        id: batch.id,
        status: batch.status,
        totalItems: batch.totalItems,
        completedItems: batch.completedItems,
      }
    });
  }
}

let wsService: WebSocketService | null = null;

export function initializeWebSocket(server: Server): WebSocketService {
  wsService = new WebSocketService(server);
  return wsService;
}

export function getWebSocketService(): WebSocketService | null {
  return wsService;
}
import { Server } from "http";
import WebSocket from "ws";
import type { Download, BatchDownload } from "@shared/schema";

export interface WebSocketService {
  sendDownloadProgress: (download: Download) => void;
  sendDownloadComplete: (download: Download) => void;
  sendDownloadError: (download: Download) => void;
  sendBatchProgress: (batch: BatchDownload) => void;
  sendBatchComplete: (batch: BatchDownload) => void;
}

let wsService: WebSocketService | null = null;

export function initializeWebSocket(server: Server): WebSocketService {
  const wss = new WebSocket.Server({ server });
  const clients = new Set<WebSocket>();

  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    clients.add(ws);

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
      clients.delete(ws);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      clients.delete(ws);
    });
  });

  const broadcast = (message: any) => {
    const data = JSON.stringify(message);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };

  wsService = {
    sendDownloadProgress: (download: Download) => {
      broadcast({
        type: "download_progress",
        payload: download,
      });
    },

    sendDownloadComplete: (download: Download) => {
      broadcast({
        type: "download_complete",
        payload: download,
      });
    },

    sendDownloadError: (download: Download) => {
      broadcast({
        type: "download_error",
        payload: download,
      });
    },

    sendBatchProgress: (batch: BatchDownload) => {
      broadcast({
        type: "batch_progress",
        payload: batch,
      });
    },

    sendBatchComplete: (batch: BatchDownload) => {
      broadcast({
        type: "batch_complete",
        payload: batch,
      });
    },
  };

  return wsService;
}

export function getWebSocketService(): WebSocketService | null {
  return wsService;
}
