import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { youtubeService } from "./services/youtube";
import { telegramService } from "./services/telegram";
import { initializeWebSocket, getWebSocketService } from "./services/websocket";
import { 
  insertDownloadSchema, 
  insertBatchDownloadSchema, 
  videoInfoSchema,
  type Download,
  type BatchDownload 
} from "@shared/schema";
import { randomUUID } from "crypto";
import rateLimit from "express-rate-limit";

// Rate limiting
const downloadLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 downloads per windowMs
  message: { error: "Too many download requests, please try again later." }
});

const apiLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many API requests, please try again later." }
});

// Auth middleware
async function authenticateApiKey(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "API key required" });
  }

  const apiKey = authHeader.substring(7);
  const user = await storage.getUserByApiKey(apiKey);

  if (!user) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  (req as any).user = user;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Initialize WebSocket
  const wsService = initializeWebSocket(httpServer);

  // Apply rate limiting to API routes
  app.use("/api", apiLimit);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Video info endpoint
  app.get("/api/video/info", async (req, res) => {
    try {
      const { url, format } = videoInfoSchema.parse(req.query);
      const info = await youtubeService.getVideoInfo(url, format);
      res.json({ success: true, data: info });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Invalid request" 
      });
    }
  });

  // Start download
  app.post("/api/download", downloadLimit, async (req, res) => {
    try {
      const downloadData = insertDownloadSchema.parse(req.body);

      // Create download record
      const download = await storage.createDownload(downloadData);

      // Start download process asynchronously
      processDownload(download.id).catch(console.error);

      res.json({ 
        success: true, 
        data: { 
          id: download.id, 
          status: download.status,
          message: "Download started" 
        } 
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Invalid request" 
      });
    }
  });

  // Batch download
  app.post("/api/batch-download", downloadLimit, async (req, res) => {
    try {
      const batchData = insertBatchDownloadSchema.parse(req.body);

      if (batchData.urls.length > 20) {
        return res.status(400).json({
          success: false,
          error: "Maximum 20 URLs allowed per batch"
        });
      }

      const batch = await storage.createBatchDownload(batchData);

      // Start batch download process asynchronously
      processBatchDownload(batch.id).catch(console.error);

      res.json({ 
        success: true, 
        data: { 
          id: batch.id, 
          status: batch.status,
          totalItems: batch.totalItems,
          message: "Batch download started" 
        } 
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Invalid request" 
      });
    }
  });

  // Get download status
  app.get("/api/download/:id", async (req, res) => {
    try {
      const download = await storage.getDownload(req.params.id);
      if (!download) {
        return res.status(404).json({ success: false, error: "Download not found" });
      }

      res.json({ success: true, data: download });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Internal server error" 
      });
    }
  });

  // Get batch download status
  app.get("/api/batch-download/:id", async (req, res) => {
    try {
      const batch = await storage.getBatchDownload(req.params.id);
      if (!batch) {
        return res.status(404).json({ success: false, error: "Batch download not found" });
      }

      res.json({ success: true, data: batch });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Internal server error" 
      });
    }
  });

  // Telegram webhook endpoint
  app.post("/api/telegram/webhook", async (req, res) => {
    try {
      const { message } = req.body;

      if (message?.text?.startsWith("/download")) {
        const parts = message.text.split(" ");
        if (parts.length < 2) {
          return res.json({ success: true });
        }

        const url = parts[1];
        const format = parts[2] || "mp3";

        const download = await storage.createDownload({
          url,
          format,
          telegramChatId: message.chat.id.toString(),
        });

        if (telegramService) {
          await telegramService.sendMessage(
            message.chat.id,
            `🎵 Download started for: ${url}\nFormat: ${format}\nDownload ID: ${download.id}`
          );
        }

        processDownload(download.id).catch(console.error);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Telegram webhook error:", error);
      res.status(500).json({ success: false, error: "Webhook processing failed" });
    }
  });

  // Download file endpoint
  app.get("/api/download/:id/file", async (req, res) => {
    try {
      const download = await storage.getDownload(req.params.id);
      if (!download) {
        return res.status(404).json({ success: false, error: "Download not found" });
      }

      if (!download.filePath || download.status !== "completed") {
        return res.status(400).json({ 
          success: false, 
          error: "Download not completed or file not available" 
        });
      }

      // Check if file exists
      try {
        await require("fs").promises.access(download.filePath);
      } catch {
        return res.status(404).json({ 
          success: false, 
          error: "File not found on server" 
        });
      }

      // Get file stats for proper headers
      const stats = await require("fs").promises.stat(download.filePath);
      const filename = require("path").basename(download.filePath);
      const ext = require("path").extname(filename).toLowerCase();

      // Determine proper content type based on format
      let contentType = 'application/octet-stream';
      if (ext === '.mp4') {
        contentType = 'video/mp4';
      } else if (ext === '.mp3') {
        contentType = 'audio/mpeg';
      } else if (ext === '.wav') {
        contentType = 'audio/wav';
      } else if (ext === '.webm') {
        contentType = 'video/webm';
      }

      // Set appropriate headers for download
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'no-cache');

      // Stream the file to response
      const fileStream = require("fs").createReadStream(download.filePath);
      
      fileStream.on('error', (error) => {
        console.error('File stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ success: false, error: "File streaming error" });
        }
      });

      fileStream.on('end', async () => {
        // Clean up file after download (optional - you can remove this if you want to keep files)
        try {
          await youtubeService.deleteFile(download.filePath);
          console.log(`Cleaned up file: ${download.filePath}`);
        } catch (error) {
          console.error(`Failed to clean up file: ${error}`);
        }
      });

      fileStream.pipe(res);

    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Internal server error" 
      });
    }
  });

  // Generate API key (for authenticated users)
  app.post("/api/auth/generate-key", authenticateApiKey, async (req, res) => {
    try {
      const apiKey = `ytdl_${randomUUID()}`;
      await storage.updateUserApiKey((req as any).user.id, apiKey);

      res.json({ success: true, data: { apiKey } });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Failed to generate API key" 
      });
    }
  });

  // Download processing function
  async function processDownload(downloadId: string) {
    try {
      const download = await storage.getDownload(downloadId);
      if (!download) return;

      // Update status to downloading
      await storage.updateDownload(downloadId, { status: "downloading" });
      wsService?.sendDownloadProgress(download);

      // Get video info first
      const info = await youtubeService.getVideoInfo(download.url);
      await storage.updateDownload(downloadId, { 
        title: info.title,
        metadata: info 
      });

      // Start download in background with retry logic
      let filePath: string;
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        try {
          filePath = await youtubeService.downloadVideo(
            download.url, 
            download.format, 
            downloadId,
            (progress) => {
              storage.updateDownload(downloadId, { 
                progress: progress.progress,
                status: progress.status 
              });
              wsService?.sendDownloadProgress({...download, ...progress});
            }
          );
          break; // Success, exit retry loop
        } catch (error: any) {
          retryCount++;
          console.log(`Download attempt ${retryCount} failed: ${error.message}`);

          if (retryCount > maxRetries) {
            throw error; // Re-throw after max retries
          }

          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        }
      }

      // Get file size
      const fileSize = await youtubeService.getFileSize(filePath);

      // Update download as completed
      const completedDownload = await storage.updateDownload(downloadId, {
        status: "completed",
        progress: 100,
        filePath,
        fileSize,
        completedAt: new Date(),
      });

      if (completedDownload) {
        wsService?.sendDownloadComplete(completedDownload);

        // Send file to Telegram if chat ID is provided
        if (download.telegramChatId && telegramService) {
          await telegramService.handleDownloadComplete(completedDownload);
        }

        // Send webhook notification if URL is provided
        if (download.webhookUrl) {
          await sendWebhookNotification(download.webhookUrl, completedDownload);
        }
      }

    } catch (error) {
      console.error("Download error:", error);

      const failedDownload = await storage.updateDownload(downloadId, {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });

      if (failedDownload) {
        wsService?.sendDownloadError(failedDownload);

        if (failedDownload?.telegramChatId && telegramService) {
          await telegramService.sendMessage(
            failedDownload.telegramChatId,
            `❌ Download failed: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }
    }
  }

  // Batch download processing function
  async function processBatchDownload(batchId: string) {
    try {
      const batch = await storage.getBatchDownload(batchId);
      if (!batch) return;

      await storage.updateBatchDownload(batchId, { status: "downloading" });

      let completedItems = 0;

      for (let i = 0; i < batch.urls.length; i++) {
        const url = batch.urls[i];

        try {
          const download = await storage.createDownload({
            url,
            format: batch.format as "mp4" | "mp4-1080" | "mp3" | "wav" | "best",
            telegramChatId: batch.telegramChatId,
            webhookUrl: batch.webhookUrl,
          });

          await processDownload(download.id);
          completedItems++;

          const progress = Math.round((completedItems / batch.totalItems) * 100);
          const updatedBatch = await storage.updateBatchDownload(batchId, {
            progress,
            completedItems,
          });

          if (updatedBatch) {
            wsService?.sendBatchProgress(updatedBatch);
          }

        } catch (error) {
          console.error(`Failed to process URL ${url}:`, error);
        }
      }

      const completedBatch = await storage.updateBatchDownload(batchId, {
        status: "completed",
        progress: 100,
        completedAt: new Date(),
      });

      if (completedBatch) {
        wsService?.sendBatchComplete(completedBatch);
      }

    } catch (error) {
      console.error("Batch download error:", error);
      await storage.updateBatchDownload(batchId, { status: "failed" });
    }
  }

  // Webhook notification function
  async function sendWebhookNotification(webhookUrl: string, download: Download) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "download_complete",
          download: {
            id: download.id,
            url: download.url,
            title: download.title,
            status: download.status,
            filePath: download.filePath,
            fileSize: download.fileSize,
            format: download.format,
            completedAt: download.completedAt,
          },
        }),
      });
    } catch (error) {
      console.error("Webhook notification failed:", error);
    }
  }

  return httpServer;
}