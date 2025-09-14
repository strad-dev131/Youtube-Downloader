import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ApiDocumentation() {
  const [activeEndpoint, setActiveEndpoint] = useState("video-info");

  const endpoints = [
    { id: "video-info", name: "Video Info", method: "GET", path: "/api/video/info" },
    { id: "download", name: "Download Video", method: "POST", path: "/api/download" },
    { id: "batch-download", name: "Batch Download", method: "POST", path: "/api/batch-download" },
    { id: "download-status", name: "Download Status", method: "GET", path: "/api/download/:id" },
    { id: "telegram-webhook", name: "Telegram Webhook", method: "POST", path: "/api/telegram/webhook" },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Code example copied successfully",
    });
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "POST":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "PUT":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            API Documentation
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Professional REST API with comprehensive documentation and interactive examples.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24" data-testid="api-navigation">
              <CardHeader>
                <CardTitle className="text-lg">API Endpoints</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  {endpoints.map((endpoint) => (
                    <button
                      key={endpoint.id}
                      onClick={() => setActiveEndpoint(endpoint.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeEndpoint === endpoint.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                      data-testid={`nav-endpoint-${endpoint.id}`}
                    >
                      <div className="flex items-center space-x-2">
                        <Badge className={getMethodColor(endpoint.method)}>
                          {endpoint.method}
                        </Badge>
                        <span className="truncate">{endpoint.name}</span>
                      </div>
                    </button>
                  ))}
                </nav>
                
                <div className="mt-8">
                  <h4 className="font-semibold text-card-foreground mb-4">Quick Links</h4>
                  <div className="space-y-2">
                    <a href="#authentication" className="block text-muted-foreground hover:text-foreground text-sm transition-colors">
                      Authentication
                    </a>
                    <a href="#rate-limits" className="block text-muted-foreground hover:text-foreground text-sm transition-colors">
                      Rate Limits
                    </a>
                    <a href="#error-codes" className="block text-muted-foreground hover:text-foreground text-sm transition-colors">
                      Error Codes
                    </a>
                    <a href="#sdks" className="block text-muted-foreground hover:text-foreground text-sm transition-colors">
                      SDKs
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Documentation Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                {/* Video Info Endpoint */}
                {activeEndpoint === "video-info" && (
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Badge className={getMethodColor("GET")}>GET</Badge>
                      <code className="text-lg font-mono">/api/video/info</code>
                    </div>
                    
                    <h3 className="text-2xl font-semibold text-card-foreground mb-2">Get Video Information</h3>
                    <p className="text-muted-foreground mb-6">
                      Retrieve detailed information about a YouTube video including available formats, duration, and metadata.
                    </p>
                    
                    <Tabs defaultValue="curl" className="mb-6">
                      <TabsList>
                        <TabsTrigger value="curl">cURL</TabsTrigger>
                        <TabsTrigger value="python">Python</TabsTrigger>
                        <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="curl">
                        <div className="bg-muted rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-muted-foreground">cURL</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(`curl -X GET "https://api.ytdownloader.pro/v1/video/info" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -G -d "url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"`)}
                              data-testid="button-copy-curl"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="code-block rounded-md p-4 text-sm overflow-x-auto">
                            <pre>{`curl -X GET "https://api.ytdownloader.pro/v1/video/info" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -G -d "url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"`}</pre>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="python">
                        <div className="bg-muted rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-muted-foreground">Python</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(`import requests

url = "https://api.ytdownloader.pro/v1/video/info"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
params = {
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}

response = requests.get(url, headers=headers, params=params)
data = response.json()`)}
                              data-testid="button-copy-python"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="code-block rounded-md p-4 text-sm overflow-x-auto">
                            <pre>{`import requests

url = "https://api.ytdownloader.pro/v1/video/info"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
params = {
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}

response = requests.get(url, headers=headers, params=params)
data = response.json()`}</pre>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="javascript">
                        <div className="bg-muted rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-muted-foreground">JavaScript</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(`const response = await fetch('https://api.ytdownloader.pro/v1/video/info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();`)}
                              data-testid="button-copy-javascript"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="code-block rounded-md p-4 text-sm overflow-x-auto">
                            <pre>{`const response = await fetch('https://api.ytdownloader.pro/v1/video/info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();`}</pre>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    {/* Response Example */}
                    <div className="mb-6">
                      <h4 className="text-lg font-medium text-card-foreground mb-3">Response</h4>
                      <div className="bg-muted rounded-lg p-4">
                        <div className="code-block rounded-md p-4 text-sm overflow-x-auto">
                          <pre>{`{
  "success": true,
  "data": {
    "id": "dQw4w9WgXcQ",
    "title": "Rick Astley - Never Gonna Give You Up",
    "duration": 213,
    "thumbnail": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    "formats": [
      {
        "format_id": "140",
        "ext": "m4a",
        "acodec": "mp4a.40.2",
        "filesize": 3445532
      }
    ]
  }
}`}</pre>
                        </div>
                      </div>
                    </div>
                    
                    {/* Parameters */}
                    <div>
                      <h4 className="text-lg font-medium text-card-foreground mb-3">Parameters</h4>
                      <div className="bg-muted rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-border">
                            <tr>
                              <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Parameter</th>
                              <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Type</th>
                              <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Required</th>
                              <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            <tr>
                              <td className="px-4 py-3 text-sm font-mono text-primary">url</td>
                              <td className="px-4 py-3 text-sm text-muted-foreground">string</td>
                              <td className="px-4 py-3 text-sm text-foreground">Yes</td>
                              <td className="px-4 py-3 text-sm text-muted-foreground">YouTube video URL</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-3 text-sm font-mono text-primary">format</td>
                              <td className="px-4 py-3 text-sm text-muted-foreground">string</td>
                              <td className="px-4 py-3 text-sm text-foreground">No</td>
                              <td className="px-4 py-3 text-sm text-muted-foreground">Filter formats (video, audio, best)</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Download Endpoint */}
                {activeEndpoint === "download" && (
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Badge className={getMethodColor("POST")}>POST</Badge>
                      <code className="text-lg font-mono">/api/download</code>
                    </div>
                    
                    <h3 className="text-2xl font-semibold text-card-foreground mb-2">Start Download</h3>
                    <p className="text-muted-foreground mb-6">
                      Start downloading a YouTube video or audio file. Returns a download ID for tracking progress.
                    </p>

                    <div className="bg-muted rounded-lg p-4 mb-6">
                      <h4 className="text-lg font-medium text-card-foreground mb-3">Request Body</h4>
                      <div className="code-block rounded-md p-4 text-sm overflow-x-auto">
                        <pre>{`{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "format": "mp3",
  "telegramChatId": "123456789", // Optional
  "webhookUrl": "https://yourbot.com/webhook" // Optional
}`}</pre>
                      </div>
                    </div>

                    <div className="bg-muted rounded-lg p-4">
                      <h4 className="text-lg font-medium text-card-foreground mb-3">Response</h4>
                      <div className="code-block rounded-md p-4 text-sm overflow-x-auto">
                        <pre>{`{
  "success": true,
  "data": {
    "id": "download-uuid",
    "status": "pending",
    "message": "Download started"
  }
}`}</pre>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add other endpoints content here */}
                {activeEndpoint === "batch-download" && (
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Badge className={getMethodColor("POST")}>POST</Badge>
                      <code className="text-lg font-mono">/api/batch-download</code>
                    </div>
                    
                    <h3 className="text-2xl font-semibold text-card-foreground mb-2">Batch Download</h3>
                    <p className="text-muted-foreground mb-6">
                      Download multiple YouTube videos at once. Maximum 20 URLs per batch.
                    </p>

                    <div className="bg-muted rounded-lg p-4">
                      <h4 className="text-lg font-medium text-card-foreground mb-3">Request Body</h4>
                      <div className="code-block rounded-md p-4 text-sm overflow-x-auto">
                        <pre>{`{
  "urls": [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=9bZkp7q19f0"
  ],
  "format": "mp3"
}`}</pre>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
