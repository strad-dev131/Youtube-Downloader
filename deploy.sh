
#!/bin/bash

echo "🚀 Deploying YouTube Downloader..."

# Pull latest changes
git pull origin main

# Install dependencies
npm ci

# Build the application
npm run build

# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Create logs directory
mkdir -p logs

# Stop existing application
pm2 stop youtube-downloader 2>/dev/null || true

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

echo "✅ Deployment completed!"
echo "🌐 Application is running on port 5000"
