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
        "--no-check-certificates",
        "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "--referer", "https://www.youtube.com/",
        "--extractor-retries", "3",
        "--fragment-retries", "3",
        "--retry-sleep", "linear=1::2",
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
      const formatString = this.getFormatString(format);
      let filename: string;
      let args: string[] = [];
      
      if (format === "mp3" || format === "wav") {
        filename = `${downloadId}_%(title)s.${format}`;
        args.push(
          "--extract-audio", 
          "--audio-format", format,
          "--audio-quality", "0", // Best quality
          "--format", "bestaudio/best"
        );
      } else {
        filename = `${downloadId}_%(title)s.%(ext)s`;
        args.push("--format", formatString);
      }
      
      const outputPath = path.join(this.downloadsDir, filename);
      
      args.push(
        "--output", outputPath,
        "--no-warnings",
        "--newline",
        "--no-check-certificates",
        "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "--referer", "https://www.youtube.com/",
        "--extractor-retries", "3",
        "--fragment-retries", "3",
        "--retry-sleep", "linear=1::2",
        "--sleep-interval", "1",
        "--max-sleep-interval", "5",
        "--throttled-rate", "100K",
        url
      );

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
        return "best[height<=720][ext=mp4]/best[height<=720]/bestvideo[height<=720]+bestaudio/best";
      case "mp4-1080":
        return "best[height<=1080][ext=mp4]/best[height<=1080]/bestvideo[height<=1080]+bestaudio/best";
      case "mp3":
        return "bestaudio[ext=m4a]/bestaudio[ext=mp3]/bestaudio/best";
      case "wav":
        return "bestaudio[ext=wav]/bestaudio/best";
      case "best":
        return "bestvideo+bestaudio/best";
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
