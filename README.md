
# YouTube Downloader

A powerful YouTube video and audio downloader with real-time progress tracking, built with Express.js, React, and TypeScript.

## Features

- Download YouTube videos in multiple formats (MP4, MP3, WAV)
- Real-time progress tracking via WebSocket
- Batch download support
- Telegram bot integration
- RESTful API with rate limiting
- Modern React frontend with TypeScript

## Quick Start

### Development

```bash
npm install
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

## Deployment Options

### 1. VPS Deployment

#### Prerequisites
- Node.js 18+
- Python 3.x
- FFmpeg

#### Setup
1. Clone the repository:
```bash
git clone https://github.com/strad-dev131/Youtube-Downloader.git
cd Youtube-Downloader
```

2. Install dependencies:
```bash
npm install
```

3. Install yt-dlp:
```bash
pip install yt-dlp
```

4. Make deployment script executable and run:
```bash
chmod +x deploy.sh
./deploy.sh
```

#### Manual VPS Setup
```bash
# Install dependencies
npm ci

# Build the application
npm run build

# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup auto-start on boot
pm2 startup
```

### 2. Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build and run manually
docker build -t youtube-downloader .
docker run -p 5000:5000 -v $(pwd)/downloads:/app/downloads youtube-downloader
```

### 3. Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

**Note**: Vercel has limitations for file downloads due to serverless nature. VPS deployment is recommended for full functionality.

## Environment Variables

- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 5000)

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/video/info` - Get video information
- `POST /api/download` - Start download
- `GET /api/download/:id` - Get download status
- `GET /api/download/:id/file` - Download file

## License

MIT License
