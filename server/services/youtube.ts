import { spawn } from "child_process";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

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

export interface DownloadProgress {
  downloadId: string;
  progress: number;
  speed?: string;
  eta?: string;
  fileSize?: number;
  status: "pending" | "downloading" | "completed" | "failed";
  error?: string;
}

export class YouTubeService {
  private downloadsDir: string;

  constructor() {
    this.downloadsDir = path.join(process.cwd(), "downloads");
    this.ensureDownloadsDir();
  }

  private async ensureDownloadsDir() {
    try {
      await fs.access(this.downloadsDir);
    } catch {
      await fs.mkdir(this.downloadsDir, { recursive: true });
    }
  }

  async getVideoInfo(url: string, formatFilter?: string): Promise<VideoInfo> {
    return new Promise((resolve, reject) => {
      const args = [
        "--dump-json",
        "--no-warnings",
        url
      ];

      if (formatFilter) {
        args.push("--format", this.getFormatString(formatFilter));
      }

      const ytdlp = spawn("yt-dlp", args);
      let output = "";
      let error = "";

      ytdlp.stdout.on("data", (data) => {
        output += data.toString();
      });

      ytdlp.stderr.on("data", (data) => {
        error += data.toString();
      });

      ytdlp.on("close", (code) => {
        if (code === 0) {
          try {
            const info = JSON.parse(output);
            resolve({
              id: info.id,
              title: info.title,
              duration: info.duration,
              thumbnail: info.thumbnail,
              description: info.description,
              uploader: info.uploader,
              view_count: info.view_count,
              formats: info.formats?.map((f: any) => ({
                format_id: f.format_id,
                ext: f.ext,
                acodec: f.acodec,
                vcodec: f.vcodec,
                filesize: f.filesize,
                quality: f.quality,
                height: f.height,
                width: f.width,
                fps: f.fps,
              })) || []
            });
          } catch (parseError) {
            reject(new Error(`Failed to parse video info: ${parseError}`));
          }
        } else {
          reject(new Error(`yt-dlp failed: ${error}`));
        }
      });
    });
  }

  async downloadVideo(
    url: string, 
    format: string, 
    downloadId: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const filename = `${downloadId}_%(title)s.%(ext)s`;
      const outputPath = path.join(this.downloadsDir, filename);
      
      const args = [
        "--format", this.getFormatString(format),
        "--output", outputPath,
        "--no-warnings",
        "--newline",
        url
      ];

      const ytdlp = spawn("yt-dlp", args);
      let error = "";

      ytdlp.stdout.on("data", (data) => {
        const lines = data.toString().split("\n");
        for (const line of lines) {
          if (line.includes("[download]")) {
            const progressMatch = line.match(/(\d+\.?\d*)%/);
            const speedMatch = line.match(/(\d+\.?\d*\w+\/s)/);
            const etaMatch = line.match(/ETA (\d+:\d+)/);
            
            if (progressMatch && onProgress) {
              const progress = parseFloat(progressMatch[1]);
              onProgress({
                downloadId,
                progress,
                speed: speedMatch?.[1],
                eta: etaMatch?.[1],
                status: progress >= 100 ? "completed" : "downloading"
              });
            }
          }
        }
      });

      ytdlp.stderr.on("data", (data) => {
        error += data.toString();
      });

      ytdlp.on("close", async (code) => {
        if (code === 0) {
          try {
            // Find the actual downloaded file
            const files = await fs.readdir(this.downloadsDir);
            const downloadedFile = files.find(f => f.startsWith(downloadId));
            
            if (downloadedFile) {
              const fullPath = path.join(this.downloadsDir, downloadedFile);
              resolve(fullPath);
            } else {
              reject(new Error("Downloaded file not found"));
            }
          } catch (fsError) {
            reject(new Error(`File system error: ${fsError}`));
          }
        } else {
          reject(new Error(`Download failed: ${error}`));
        }
      });
    });
  }

  private getFormatString(format: string): string {
    switch (format) {
      case "mp4":
        return "best[ext=mp4][height<=720]";
      case "mp4-1080":
        return "best[ext=mp4][height<=1080]";
      case "mp3":
        return "bestaudio[ext=m4a]/bestaudio/best";
      case "wav":
        return "bestaudio[ext=wav]/bestaudio/best";
      case "best":
        return "best";
      default:
        return "best";
    }
  }

  async getFileSize(filePath: string): Promise<number> {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch {
      // File doesn't exist or can't be deleted
    }
  }
}

export const youtubeService = new YouTubeService();
