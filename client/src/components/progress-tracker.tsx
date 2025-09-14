import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/use-websocket";
import { formatFileSize, youtubeApi } from "@/lib/api";
import { Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Download {
  id: string;
  title?: string;
  status: string;
  progress: number;
  url?: string;
  format?: string;
  type?: string;
  totalItems?: number;
  completedItems?: number;
  error?: string;
}

interface ProgressTrackerProps {
  downloads: Download[];
}

export default function ProgressTracker({ downloads: initialDownloads }: ProgressTrackerProps) {
  const [downloads, setDownloads] = useState<Download[]>(initialDownloads);
  const { lastMessage, isConnected } = useWebSocket();

  useEffect(() => {
    setDownloads(initialDownloads);
  }, [initialDownloads]);

  useEffect(() => {
    if (lastMessage) {
      try {
        const message = JSON.parse(lastMessage);

        if (message.type === "download_progress") {
          setDownloads(prev => prev.map(download => 
            download.id === message.payload.id 
              ? { ...download, ...message.payload }
              : download
          ));
        } else if (message.type === "download_complete") {
          setDownloads(prev => prev.map(download => 
            download.id === message.payload.id 
              ? { ...download, ...message.payload, progress: 100 }
              : download
          ));
        } else if (message.type === "download_error") {
          setDownloads(prev => prev.map(download => 
            download.id === message.payload.id 
              ? { ...download, status: "failed", error: message.payload.error }
              : download
          ));
        } else if (message.type === "batch_progress") {
          setDownloads(prev => prev.map(download => 
            download.id === message.payload.id 
              ? { ...download, ...message.payload }
              : download
          ));
        } else if (message.type === "batch_complete") {
          setDownloads(prev => prev.map(download => 
            download.id === message.payload.id 
              ? { ...download, ...message.payload, progress: 100, status: "completed" }
              : download
          ));
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    }
  }, [lastMessage]);

  if (downloads.length === 0) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "failed": return "bg-red-500";
      case "downloading": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const handleDownloadFile = async (downloadId: string) => {
    try {
      await youtubeApi.downloadFile(downloadId);
      toast({
        title: "Download Started",
        description: "File download has started to your device",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const getStatusText = (download: Download) => {
    if (download.type === "batch") {
      return `${download.completedItems || 0}/${download.totalItems || 0} items`;
    }
    return download.status.charAt(0).toUpperCase() + download.status.slice(1);
  };

  return (
    <div className="mt-8 pt-8 border-t border-border">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-foreground">Download Progress</h4>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-secondary' : 'bg-destructive'}`}></div>
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {downloads.map((download) => (
          <Card key={download.id} className="bg-muted" data-testid={`progress-item-${download.id}`}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{download.title || "Loading..."}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={`text-white ${getStatusColor(download.status)}`}>
                    {download.status}
                  </Badge>
                  {download.status === "completed" && (
                    <Button
                      size="sm"
                      onClick={() => handleDownloadFile(download.id)}
                      className="h-6 px-2 text-xs"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </div>

              <Progress 
                value={download.progress} 
                className="w-full mb-2"
                data-testid={`progress-bar-${download.id}`}
              />

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{download.format?.toUpperCase()}</span>
                <span>{download.progress.toFixed(1)}%</span>
              </div>

              {download.error && (
                <div className="text-xs text-destructive mt-1">
                  Error: {download.error}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}