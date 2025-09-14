import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, CheckCircle, Upload, Zap, BarChart3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function TelegramIntegration() {
  const [activeTab, setActiveTab] = useState("python");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Code example copied successfully",
    });
  };

  const steps = [
    {
      number: 1,
      title: "Get API Key",
      description: "Register for an API key and configure your webhook URL for real-time notifications.",
      code: `webhook_url = "https://yourbot.com/webhook/downloads"`
    },
    {
      number: 2,
      title: "Configure Bot Commands",
      description: "Set up your bot to handle YouTube URLs and download requests.",
      code: `/download <youtube_url> - Download video/audio
/quality <format> - Set default quality`
    },
    {
      number: 3,
      title: "Handle Responses",
      description: "Process download completion webhooks and automatically send files to users."
    }
  ];

  const features = [
    {
      icon: <Upload className="text-secondary" />,
      title: "Auto File Upload",
      description: "Downloaded files are automatically sent to the requesting user's chat."
    },
    {
      icon: <Zap className="text-secondary" />,
      title: "File Size Optimization",
      description: "Automatic compression for Telegram's 50MB file size limit."
    },
    {
      icon: <BarChart3 className="text-secondary" />,
      title: "Progress Updates",
      description: "Real-time progress messages sent to users during download."
    }
  ];

  const benefits = [
    "Auto file upload",
    "Size optimization", 
    "Progress tracking",
    "Error handling"
  ];

  return (
    <section className="py-16 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Telegram Bot Integration
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete guide to integrate YT-Downloader Pro with your Telegram music bot.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Integration Steps */}
          <div>
            <h3 className="text-2xl font-semibold text-foreground mb-6">Integration Steps</h3>
            
            <div className="space-y-6">
              {steps.map((step) => (
                <div key={step.number} className="flex items-start space-x-4" data-testid={`step-${step.number}`}>
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-foreground mb-2">{step.title}</h4>
                    <p className="text-muted-foreground mb-3">{step.description}</p>
                    {step.code && (
                      <Card>
                        <CardContent className="p-4">
                          <code className="text-sm text-primary whitespace-pre-line">
                            {step.code}
                          </code>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Benefits */}
            <div className="mt-12">
              <h3 className="text-xl font-semibold text-foreground mb-4">Benefits</h3>
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="text-secondary h-4 w-4" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Code Examples */}
          <div>
            <h3 className="text-2xl font-semibold text-foreground mb-6">Code Examples</h3>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="python" data-testid="tab-python">Python</TabsTrigger>
                <TabsTrigger value="nodejs" data-testid="tab-nodejs">Node.js</TabsTrigger>
                <TabsTrigger value="curl" data-testid="tab-curl">cURL</TabsTrigger>
              </TabsList>
              
              <TabsContent value="python" className="mt-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Python Telegram Bot</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`import requests
import telegram

class TelegramMusicBot:
    def __init__(self, bot_token, api_key):
        self.bot = telegram.Bot(token=bot_token)
        self.api_key = api_key
        self.base_url = "https://api.ytdownloader.pro/v1"

    def download_audio(self, youtube_url, chat_id):
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "url": youtube_url,
            "format": "mp3",
            "telegram_chat_id": chat_id,
            "webhook_url": "https://yourbot.com/webhook"
        }

        response = requests.post(
            f"{self.base_url}/download",
            json=payload,
            headers=headers
        )

        return response.json()`)}
                      data-testid="button-copy-python-example"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="code-block rounded-lg p-4 text-sm overflow-x-auto">
                      <pre>{`import requests
import telegram

class TelegramMusicBot:
    def __init__(self, bot_token, api_key):
        self.bot = telegram.Bot(token=bot_token)
        self.api_key = api_key
        self.base_url = "https://api.ytdownloader.pro/v1"

    def download_audio(self, youtube_url, chat_id):
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "url": youtube_url,
            "format": "mp3",
            "telegram_chat_id": chat_id,
            "webhook_url": "https://yourbot.com/webhook"
        }

        response = requests.post(
            f"{self.base_url}/download",
            json=payload,
            headers=headers
        )

        return response.json()`}</pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="nodejs" className="mt-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Node.js Telegram Bot</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

class TelegramMusicBot {
    constructor(botToken, apiKey) {
        this.bot = new TelegramBot(botToken, { polling: true });
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.ytdownloader.pro/v1';
    }

    async downloadAudio(youtubeUrl, chatId) {
        const headers = {
            'Authorization': \`Bearer \${this.apiKey}\`,
            'Content-Type': 'application/json'
        };

        const payload = {
            url: youtubeUrl,
            format: 'mp3',
            telegram_chat_id: chatId,
            webhook_url: 'https://yourbot.com/webhook'
        };

        try {
            const response = await axios.post(
                \`\${this.baseUrl}/download\`,
                payload,
                { headers }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}`)}
                      data-testid="button-copy-nodejs-example"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="code-block rounded-lg p-4 text-sm overflow-x-auto">
                      <pre>{`const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

class TelegramMusicBot {
    constructor(botToken, apiKey) {
        this.bot = new TelegramBot(botToken, { polling: true });
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.ytdownloader.pro/v1';
    }

    async downloadAudio(youtubeUrl, chatId) {
        const headers = {
            'Authorization': \`Bearer \${this.apiKey}\`,
            'Content-Type': 'application/json'
        };

        const payload = {
            url: youtubeUrl,
            format: 'mp3',
            telegram_chat_id: chatId,
            webhook_url: 'https://yourbot.com/webhook'
        };

        try {
            const response = await axios.post(
                \`\${this.baseUrl}/download\`,
                payload,
                { headers }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}`}</pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="curl" className="mt-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">cURL Command</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`curl -X POST "https://api.ytdownloader.pro/v1/download" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "format": "mp3",
    "telegram_chat_id": "123456789",
    "webhook_url": "https://yourbot.com/webhook"
  }'`)}
                      data-testid="button-copy-curl-example"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="code-block rounded-lg p-4 text-sm overflow-x-auto">
                      <pre>{`curl -X POST "https://api.ytdownloader.pro/v1/download" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "format": "mp3",
    "telegram_chat_id": "123456789",
    "webhook_url": "https://yourbot.com/webhook"
  }'`}</pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            {/* Features List */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Telegram Features</h4>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <Card key={index} data-testid={`feature-${index}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-card-foreground">{feature.title}</span>
                        {feature.icon}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
