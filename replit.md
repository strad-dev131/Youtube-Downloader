# YT-Downloader Pro

## Overview

YT-Downloader Pro is a production-ready YouTube downloader platform with a modern React frontend and Express.js backend. The application provides a comprehensive API for downloading videos and audio from YouTube and other supported platforms, with special integration for Telegram bots. It features real-time progress tracking, batch downloads, and a complete developer portal with API documentation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: TailwindCSS with shadcn/ui component library for modern, responsive design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **Real-time Updates**: WebSocket integration for live download progress tracking
- **Components**: Modular component structure with reusable UI components, download interface, progress tracker, and API documentation portal

### Backend Architecture
- **Framework**: Express.js with TypeScript for RESTful API endpoints
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Real-time Communication**: WebSocket server for live progress updates
- **File Processing**: Integration with yt-dlp for video/audio downloading from 1000+ sites
- **Rate Limiting**: Express rate limiting middleware for API protection
- **Session Management**: Express session handling with PostgreSQL store

### Database Design
- **Users Table**: User management with API key authentication and plan tracking
- **Downloads Table**: Individual download tracking with status, progress, metadata, and Telegram integration fields
- **Batch Downloads Table**: Batch operation management with progress tracking across multiple items
- **Schema Management**: Drizzle migrations with type-safe schema definitions

### API Structure
- **Download Endpoints**: Single and batch download initiation with format selection
- **Progress Tracking**: Real-time status polling and WebSocket updates
- **Video Information**: Metadata extraction for YouTube videos before download
- **Telegram Integration**: Webhook endpoints for bot integration with automatic file upload
- **Authentication**: API key-based authentication system

### Real-time Features
- **WebSocket Service**: Bidirectional communication for download progress updates
- **Progress Broadcasting**: Live updates sent to connected clients during downloads
- **Error Handling**: Real-time error notifications and status changes
- **Connection Management**: Automatic reconnection with exponential backoff

### File Management
- **Download Storage**: Organized file storage system in downloads directory
- **Format Support**: Multiple output formats (MP4, MP3, WebM) with quality selection
- **Cleanup System**: Automatic file cleanup and storage management
- **Size Optimization**: File compression for Telegram's 50MB limit

## External Dependencies

### Core Services
- **Neon Database**: PostgreSQL hosting service for production database
- **yt-dlp**: Python library for video/audio extraction from streaming platforms
- **WebSocket (ws)**: Real-time bidirectional communication

### Frontend Libraries
- **shadcn/ui**: Complete UI component library built on Radix UI primitives
- **TanStack React Query**: Server state management and caching
- **Wouter**: Lightweight routing library
- **Lucide React**: Icon system
- **React Hook Form**: Form handling with validation

### Backend Dependencies
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL adapter
- **Express Rate Limit**: API rate limiting middleware
- **Connect PG Simple**: PostgreSQL session store for Express
- **Zod**: Runtime type validation

### Development Tools
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Plugins**: Development environment integration with cartographer and dev banner

### Telegram Bot Integration
- **Telegram Bot API**: Direct integration for webhook handling and file uploads
- **Webhook System**: Real-time notifications for download completion
- **File Upload Service**: Automatic media delivery to Telegram chats
- **Size Management**: Intelligent file compression for platform limits