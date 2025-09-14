import { type Download } from "@shared/schema";
import fs from "fs/promises";

export interface TelegramBotConfig {
  botToken: string;
  baseUrl?: string;
}

export interface TelegramFile {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  file_path?: string;
}

export interface TelegramMessage {
  message_id: number;
  chat: {
    id: number;
    type: string;
  };
  from?: {
    id: number;
    username?: string;
    first_name: string;
  };
  text?: string;
  audio?: TelegramFile;
  video?: TelegramFile;
  document?: TelegramFile;
}

export class TelegramService {
  private botToken: string;
  private baseUrl: string;

  constructor(config: TelegramBotConfig) {
    this.botToken = config.botToken;
    this.baseUrl = config.baseUrl || "https://api.telegram.org";
  }

  async sendMessage(chatId: string | number, text: string, options?: any): Promise<TelegramMessage> {
    const url = `${this.baseUrl}/bot${this.botToken}/sendMessage`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.result;
  }

  async sendAudio(chatId: string | number, audioPath: string, options?: any): Promise<TelegramMessage> {
    const formData = new FormData();
    formData.append("chat_id", chatId.toString());
    
    try {
      const audioBuffer = await fs.readFile(audioPath);
      const blob = new Blob([audioBuffer]);
      formData.append("audio", blob, options?.filename || "audio.mp3");
      
      if (options?.caption) {
        formData.append("caption", options.caption);
      }
      
      if (options?.duration) {
        formData.append("duration", options.duration.toString());
      }

      const url = `${this.baseUrl}/bot${this.botToken}/sendAudio`;
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`);
      }

      const result = await response.json();
      return result.result;
    } catch (error) {
      throw new Error(`Failed to send audio: ${error}`);
    }
  }

  async sendVideo(chatId: string | number, videoPath: string, options?: any): Promise<TelegramMessage> {
    const formData = new FormData();
    formData.append("chat_id", chatId.toString());
    
    try {
      const videoBuffer = await fs.readFile(videoPath);
      const blob = new Blob([videoBuffer]);
      formData.append("video", blob, options?.filename || "video.mp4");
      
      if (options?.caption) {
        formData.append("caption", options.caption);
      }
      
      if (options?.duration) {
        formData.append("duration", options.duration.toString());
      }

      if (options?.width) {
        formData.append("width", options.width.toString());
      }

      if (options?.height) {
        formData.append("height", options.height.toString());
      }

      const url = `${this.baseUrl}/bot${this.botToken}/sendVideo`;
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`);
      }

      const result = await response.json();
      return result.result;
    } catch (error) {
      throw new Error(`Failed to send video: ${error}`);
    }
  }

  async sendDocument(chatId: string | number, documentPath: string, options?: any): Promise<TelegramMessage> {
    const formData = new FormData();
    formData.append("chat_id", chatId.toString());
    
    try {
      const documentBuffer = await fs.readFile(documentPath);
      const blob = new Blob([documentBuffer]);
      formData.append("document", blob, options?.filename || "document");
      
      if (options?.caption) {
        formData.append("caption", options.caption);
      }

      const url = `${this.baseUrl}/bot${this.botToken}/sendDocument`;
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`);
      }

      const result = await response.json();
      return result.result;
    } catch (error) {
      throw new Error(`Failed to send document: ${error}`);
    }
  }

  async handleDownloadComplete(download: Download): Promise<void> {
    if (!download.telegramChatId || !download.filePath) {
      return;
    }

    try {
      const stats = await fs.stat(download.filePath);
      const fileSize = stats.size;
      const maxTelegramSize = 50 * 1024 * 1024; // 50MB

      if (fileSize > maxTelegramSize) {
        await this.sendMessage(
          download.telegramChatId,
          `⚠️ File "${download.title}" is too large for Telegram (${Math.round(fileSize / 1024 / 1024)}MB > 50MB). Please download it directly from the web interface.`
        );
        return;
      }

      const caption = `🎵 ${download.title}`;
      
      if (download.format === "mp3" || download.format === "wav") {
        await this.sendAudio(download.telegramChatId, download.filePath, {
          caption,
          filename: `${download.title}.${download.format === "mp3" ? "mp3" : "wav"}`,
        });
      } else {
        await this.sendVideo(download.telegramChatId, download.filePath, {
          caption,
          filename: `${download.title}.mp4`,
        });
      }

      await this.sendMessage(
        download.telegramChatId,
        `✅ Download completed: "${download.title}"`
      );
      
    } catch (error) {
      await this.sendMessage(
        download.telegramChatId,
        `❌ Failed to send file "${download.title}": ${error}`
      );
    }
  }

  async sendProgress(chatId: string, downloadId: string, progress: number, title?: string): Promise<void> {
    const progressBar = "█".repeat(Math.floor(progress / 5)) + "░".repeat(20 - Math.floor(progress / 5));
    const message = `📥 Downloading${title ? ` "${title}"` : ""}...\n\n${progressBar} ${progress.toFixed(1)}%`;
    
    try {
      await this.sendMessage(chatId, message);
    } catch (error) {
      console.error("Failed to send progress update:", error);
    }
  }
}

// Initialize with bot token from environment
const botToken = process.env.TELEGRAM_BOT_TOKEN;
export const telegramService = botToken ? new TelegramService({ botToken }) : null;
