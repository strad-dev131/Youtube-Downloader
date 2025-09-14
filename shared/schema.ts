import { z } from "zod";

// Download schemas
export const insertDownloadSchema = z.object({
  url: z.string().url(),
  format: z.enum(["mp4", "mp4-1080", "mp3", "wav", "best"]),
  telegramChatId: z.string().optional(),
  webhookUrl: z.string().url().optional(),
});

export const insertBatchDownloadSchema = z.object({
  urls: z.array(z.string().url()).min(1).max(20),
  format: z.enum(["mp4", "mp4-1080", "mp3", "wav", "best"]),
  telegramChatId: z.string().optional(),
  webhookUrl: z.string().url().optional(),
});

export const videoInfoSchema = z.object({
  url: z.string().url(),
  format: z.enum(["mp4", "mp4-1080", "mp3", "wav", "best"]).optional(),
});

// Type definitions
export interface Download {
  id: string;
  url: string;
  format: "mp4" | "mp4-1080" | "mp3" | "wav" | "best";
  status: "pending" | "downloading" | "completed" | "failed";
  progress: number;
  title?: string;
  filePath?: string;
  fileSize?: number;
  errorMessage?: string;
  telegramChatId?: string;
  webhookUrl?: string;
  metadata?: any;
  createdAt: Date;
  completedAt?: Date;
}

export interface BatchDownload {
  id: string;
  urls: string[];
  format: "mp4" | "mp4-1080" | "mp3" | "wav" | "best";
  status: "pending" | "downloading" | "completed" | "failed";
  progress: number;
  totalItems: number;
  completedItems: number;
  telegramChatId?: string;
  webhookUrl?: string;
  createdAt: Date;
  completedAt?: Date;
}