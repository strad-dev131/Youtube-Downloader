import { apiRequest } from "./queryClient";

export interface VideoInfo {
  id: string;
  title: string;
  duration: number;
  thumbnail: string;
  formats: VideoFormat[];
  description?: string;
  uploader?: string;
  view_count?: number;
}

export interface VideoFormat {
  format_id: string;
  ext: string;
  acodec?: string;
  vcodec?: string;
  filesize?: number;
  quality?: string;
  height?: number;
  width?: number;
  fps?: number;
}

export interface Download {
  id: string;
  url: string;
  title?: string;
  format: string;
  status: "pending" | "downloading" | "completed" | "failed";
  progress: number;
  fileSize?: number;
  filePath?: string;
  userId?: string;
  telegramChatId?: string;
  webhookUrl?: string;
  errorMessage?: string;
  metadata?: any;
  createdAt: Date;
  completedAt?: Date;
}

export interface BatchDownload {
  id: string;
  urls: string[];
  format: string;
  status: "pending" | "downloading" | "completed" | "failed";
  progress: number;
  totalItems: number;
  completedItems: number;
  userId?: string;
  telegramChatId?: string;
  webhookUrl?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class YouTubeApi {
  private baseUrl: string;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  async getVideoInfo(url: string, format?: string): Promise<VideoInfo> {
    const params = new URLSearchParams({ url });
    if (format) {
      params.append("format", format);
    }

    const response = await apiRequest("GET", `${this.baseUrl}/video/info?${params.toString()}`);
    const result: ApiResponse<VideoInfo> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to get video info");
    }

    return result.data;
  }

  async startDownload(options: {
    url: string;
    format: string;
    telegramChatId?: string;
    webhookUrl?: string;
  }): Promise<{ id: string; status: string; message: string }> {
    const response = await apiRequest("POST", `${this.baseUrl}/download`, options);
    const result: ApiResponse<{ id: string; status: string; message: string }> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to start download");
    }

    return result.data;
  }

  async startBatchDownload(options: {
    urls: string[];
    format: string;
    telegramChatId?: string;
    webhookUrl?: string;
  }): Promise<{ id: string; status: string; totalItems: number; message: string }> {
    const response = await apiRequest("POST", `${this.baseUrl}/batch-download`, options);
    const result: ApiResponse<{ id: string; status: string; totalItems: number; message: string }> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to start batch download");
    }

    return result.data;
  }

  async getDownloadStatus(id: string): Promise<Download> {
    const response = await apiRequest("GET", `${this.baseUrl}/download/${id}`);
    const result: ApiResponse<Download> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to get download status");
    }

    return result.data;
  }

  async getBatchDownloadStatus(id: string): Promise<BatchDownload> {
    const response = await apiRequest("GET", `${this.baseUrl}/batch-download/${id}`);
    const result: ApiResponse<BatchDownload> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to get batch download status");
    }

    return result.data;
  }

  async generateApiKey(): Promise<{ apiKey: string }> {
    const response = await apiRequest("POST", `${this.baseUrl}/auth/generate-key`);
    const result: ApiResponse<{ apiKey: string }> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to generate API key");
    }

    return result.data;
  }

  async downloadFile(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/download/${id}/file`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Download failed" }));
      throw new Error(error.error || "Failed to download file");
    }

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `download_${id}`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Create blob and trigger download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async sendTelegramWebhook(message: any): Promise<{ success: boolean }> {
    const response = await apiRequest("POST", `${this.baseUrl}/telegram/webhook`, message);
    const result: ApiResponse<{ success: boolean }> = await response.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to send telegram webhook");
    }

    return result.data || { success: true };
  }
}

// Create a singleton instance
export const youtubeApi = new YouTubeApi();

// Helper functions for common operations
export const downloadFormats = [
  { value: "mp4", label: "MP4 Video (720p)" },
  { value: "mp4-1080", label: "MP4 Video (1080p)" },
  { value: "mp3", label: "MP3 Audio (320kbps)" },
  { value: "wav", label: "WAV Audio" },
  { value: "best", label: "Best Quality" },
];

export const batchFormats = [
  { value: "mp3", label: "MP3 Audio" },
  { value: "mp4", label: "MP4 Video" },
];

export const qualityOptions = [
  { value: "best", label: "Best" },
  { value: "720p", label: "720p" },
  { value: "480p", label: "480p" },
];

export function validateYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/)?([a-zA-Z0-9_-]{11})/;
  return youtubeRegex.test(url);
}

export function extractVideoId(url: string): string | null {
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(youtubeRegex);
  return match ? match[1] : null;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
      return "text-secondary";
    case "failed":
      return "text-destructive";
    case "downloading":
      return "text-primary";
    case "pending":
      return "text-muted-foreground";
    default:
      return "text-muted-foreground";
  }
}

export function getProgressColor(status: string): string {
  switch (status) {
    case "completed":
      return "bg-secondary";
    case "failed":
      return "bg-destructive";
    case "downloading":
      return "bg-primary";
    default:
      return "bg-muted";
  }
}
