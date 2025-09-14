import { useState } from "react";
import Navigation from "@/components/navigation";
import DownloadInterface from "@/components/download-interface";
import ProgressTracker from "@/components/progress-tracker";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Rocket, BarChart3, MessageCircle, Shield, Code2 } from "lucide-react";

export default function Home() {
  const [activeDownloads, setActiveDownloads] = useState<any[]>([]);

  const features = [
    {
      icon: <Rocket className="text-primary text-xl" />,
      title: "yt-dlp Integration",
      description: "Latest yt-dlp backend with support for 1000+ sites, format selection, and quality options."
    },
    {
      icon: <BarChart3 className="text-secondary text-xl" />,
      title: "Real-time Progress",
      description: "WebSocket updates and status polling for live download progress tracking and queue management."
    },
    {
      icon: <MessageCircle className="text-accent text-xl" />,
      title: "Telegram Bot API",
      description: "Complete webhook integration with automatic media upload and file size optimization."
    },
    {
      icon: <Download className="text-primary text-xl" />,
      title: "Batch Processing",
      description: "Concurrent downloads with intelligent queue management and progress tracking per item."
    },
    {
      icon: <Shield className="text-secondary text-xl" />,
      title: "Production Ready",
      description: "Rate limiting, input validation, error handling, and VPS deployment configurations."
    },
    {
      icon: <Code2 className="text-accent text-xl" />,
      title: "Developer Portal",
      description: "Comprehensive API documentation with code examples in Python, Node.js, and cURL."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section id="downloader" className="py-16 gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Professional YouTube Downloader
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Download YouTube videos and audio with yt-dlp integration. Complete with Telegram Bot API, 
              real-time progress tracking, and comprehensive developer documentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-white text-primary hover:bg-white/90 px-8 py-3"
                data-testid="button-try-free"
              >
                Try Free Download
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3"
                data-testid="button-view-docs"
              >
                View API Docs
              </Button>
            </div>
          </div>
          
          {/* Download Interface */}
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-2xl">
              <CardContent className="p-8">
                <DownloadInterface onDownloadStart={setActiveDownloads} />
                <ProgressTracker downloads={activeDownloads} />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Features for Developers
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Built for scale with professional APIs, real-time updates, and seamless Telegram integration.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-sm border border-border" data-testid={`card-feature-${index}`}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the plan that fits your needs. All plans include full API access and documentation.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <Card className="border border-border p-8 relative" data-testid="card-plan-free">
              <CardContent className="p-0">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-semibold text-card-foreground mb-2">Free</h3>
                  <div className="text-4xl font-bold text-foreground mb-1">$0</div>
                  <p className="text-muted-foreground">Perfect for testing</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-card-foreground">
                    <span className="text-secondary mr-3">✓</span>
                    100 downloads/month
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <span className="text-secondary mr-3">✓</span>
                    Basic API access
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <span className="text-secondary mr-3">✓</span>
                    MP3 & MP4 formats
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <span className="text-muted-foreground mr-3">✗</span>
                    No Telegram integration
                  </li>
                </ul>
                
                <Button variant="outline" className="w-full" data-testid="button-plan-free">
                  Get Started Free
                </Button>
              </CardContent>
            </Card>
            
            {/* Pro Plan */}
            <Card className="border border-primary p-8 relative transform scale-105" data-testid="card-plan-pro">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              
              <CardContent className="p-0">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-semibold text-card-foreground mb-2">Pro</h3>
                  <div className="text-4xl font-bold text-foreground mb-1">$29</div>
                  <p className="text-muted-foreground">per month</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-card-foreground">
                    <span className="text-secondary mr-3">✓</span>
                    10,000 downloads/month
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <span className="text-secondary mr-3">✓</span>
                    Full API access
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <span className="text-secondary mr-3">✓</span>
                    All formats
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <span className="text-secondary mr-3">✓</span>
                    Telegram integration
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <span className="text-secondary mr-3">✓</span>
                    Batch downloads
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <span className="text-secondary mr-3">✓</span>
                    Priority support
                  </li>
                </ul>
                
                <Button className="w-full" data-testid="button-plan-pro">
                  Start Pro Trial
                </Button>
              </CardContent>
            </Card>
            
            {/* Enterprise Plan */}
            <Card className="border border-border p-8 relative" data-testid="card-plan-enterprise">
              <CardContent className="p-0">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-semibold text-card-foreground mb-2">Enterprise</h3>
                  <div className="text-4xl font-bold text-foreground mb-1">$99</div>
                  <p className="text-muted-foreground">per month</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-card-foreground">
                    <span className="text-secondary mr-3">✓</span>
                    Unlimited downloads
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <span className="text-secondary mr-3">✓</span>
                    White-label API
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <span className="text-secondary mr-3">✓</span>
                    Custom integrations
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <span className="text-secondary mr-3">✓</span>
                    SLA guarantee
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <span className="text-secondary mr-3">✓</span>
                    Dedicated support
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <span className="text-secondary mr-3">✓</span>
                    On-premise option
                  </li>
                </ul>
                
                <Button variant="outline" className="w-full" data-testid="button-plan-enterprise">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Download className="text-primary-foreground text-sm" />
                </div>
                <span className="text-xl font-bold text-card-foreground">YT-Downloader Pro</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Professional YouTube downloader with yt-dlp integration, real-time progress tracking, 
                and comprehensive Telegram Bot API for developers.
              </p>
              <p className="text-sm text-muted-foreground">
                Developed by <span className="font-semibold text-card-foreground">Siddhartha Abhimanyu</span>
              </p>
            </div>
            
            {/* API Links */}
            <div>
              <h3 className="font-semibold text-card-foreground mb-4">API</h3>
              <ul className="space-y-2">
                <li><a href="/api-docs" className="text-muted-foreground hover:text-card-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-card-foreground transition-colors">API Reference</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-card-foreground transition-colors">SDKs</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-card-foreground transition-colors">Status Page</a></li>
              </ul>
            </div>
            
            {/* Support Links */}
            <div>
              <h3 className="font-semibold text-card-foreground mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-card-foreground transition-colors">Help Center</a></li>
                <li><a href="/telegram-guide" className="text-muted-foreground hover:text-card-foreground transition-colors">Telegram Guide</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-card-foreground transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-card-foreground transition-colors">Discord</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2024 YT-Downloader Pro. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-card-foreground transition-colors">Privacy</a>
              <a href="#" className="text-muted-foreground hover:text-card-foreground transition-colors">Terms</a>
              <a href="#" className="text-muted-foreground hover:text-card-foreground transition-colors">
                <Code2 className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
