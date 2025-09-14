import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Download, List } from "lucide-react";

interface DownloadInterfaceProps {
  onDownloadStart: (downloads: any[]) => void;
}

export default function DownloadInterface({ onDownloadStart }: DownloadInterfaceProps) {
  const [singleUrl, setSingleUrl] = useState("");
  const [singleFormat, setSingleFormat] = useState("mp4");
  const [batchUrls, setBatchUrls] = useState("");
  const [batchFormat, setBatchFormat] = useState("mp3");
  const [batchQuality, setBatchQuality] = useState("best");
  const [isLoading, setIsLoading] = useState(false);

  const handleSingleDownload = async () => {
    if (!singleUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/download", {
        url: singleUrl,
        format: singleFormat,
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Download Started",
          description: `Download ID: ${result.data.id}`,
        });
        
        // Add to active downloads
        onDownloadStart([{
          id: result.data.id,
          url: singleUrl,
          format: singleFormat,
          status: "pending",
          progress: 0,
          title: "Loading...",
        }]);
        
        setSingleUrl("");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchDownload = async () => {
    const urls = batchUrls
      .split("\n")
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (urls.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one YouTube URL",
        variant: "destructive",
      });
      return;
    }

    if (urls.length > 20) {
      toast({
        title: "Error",
        description: "Maximum 20 URLs allowed per batch",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/batch-download", {
        urls,
        format: batchFormat,
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Batch Download Started",
          description: `Processing ${result.data.totalItems} items`,
        });
        
        // Add batch to active downloads
        onDownloadStart([{
          id: result.data.id,
          type: "batch",
          urls,
          format: batchFormat,
          status: "pending",
          progress: 0,
          totalItems: result.data.totalItems,
          completedItems: 0,
        }]);
        
        setBatchUrls("");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Batch Download Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Single Download */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-foreground mb-4">Single Download</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="single-url" className="block text-sm font-medium text-foreground mb-2">
              YouTube URL
            </Label>
            <Input
              id="single-url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={singleUrl}
              onChange={(e) => setSingleUrl(e.target.value)}
              data-testid="input-single-url"
            />
          </div>
          
          <div>
            <Label htmlFor="single-format" className="block text-sm font-medium text-foreground mb-2">
              Format
            </Label>
            <Select value={singleFormat} onValueChange={setSingleFormat}>
              <SelectTrigger data-testid="select-single-format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mp4">MP4 Video (720p)</SelectItem>
                <SelectItem value="mp4-1080">MP4 Video (1080p)</SelectItem>
                <SelectItem value="mp3">MP3 Audio (320kbps)</SelectItem>
                <SelectItem value="wav">WAV Audio</SelectItem>
                <SelectItem value="best">Best Quality</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleSingleDownload}
            disabled={isLoading}
            className="w-full"
            data-testid="button-single-download"
          >
            <Download className="mr-2 h-4 w-4" />
            {isLoading ? "Starting..." : "Download Now"}
          </Button>
        </CardContent>
      </Card>
      
      {/* Batch Download */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-foreground mb-4">Batch Download</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="batch-urls" className="block text-sm font-medium text-foreground mb-2">
              Multiple URLs
            </Label>
            <Textarea
              id="batch-urls"
              placeholder="https://www.youtube.com/watch?v=...&#10;https://www.youtube.com/watch?v=...&#10;..."
              rows={4}
              value={batchUrls}
              onChange={(e) => setBatchUrls(e.target.value)}
              className="resize-none"
              data-testid="input-batch-urls"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="batch-format" className="block text-sm font-medium text-foreground mb-2">
                Format
              </Label>
              <Select value={batchFormat} onValueChange={setBatchFormat}>
                <SelectTrigger data-testid="select-batch-format">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp3">MP3 Audio</SelectItem>
                  <SelectItem value="mp4">MP4 Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="batch-quality" className="block text-sm font-medium text-foreground mb-2">
                Quality
              </Label>
              <Select value={batchQuality} onValueChange={setBatchQuality}>
                <SelectTrigger data-testid="select-batch-quality">
                  <SelectValue placeholder="Quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="best">Best</SelectItem>
                  <SelectItem value="720p">720p</SelectItem>
                  <SelectItem value="480p">480p</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={handleBatchDownload}
            disabled={isLoading}
            className="w-full bg-secondary hover:bg-secondary/90"
            data-testid="button-batch-download"
          >
            <List className="mr-2 h-4 w-4" />
            {isLoading ? "Starting..." : "Start Batch Download"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
