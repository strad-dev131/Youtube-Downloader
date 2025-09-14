
FROM node:18-alpine

# Install yt-dlp and other dependencies
RUN apk add --no-cache python3 py3-pip ffmpeg && \
    pip3 install yt-dlp

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Build the application
RUN npm run build

# Create downloads directory
RUN mkdir -p downloads

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
