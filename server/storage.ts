import { randomUUID } from "crypto";
import type { Download, BatchDownload } from "@shared/schema";

interface User {
  id: string;
  apiKey?: string;
  plan: string;
  createdAt: Date;
}

// In-memory storage (for development - replace with actual database in production)
const downloads = new Map<string, Download>();
const batchDownloads = new Map<string, BatchDownload>();
const users = new Map<string, User>();

// Create default user for API key authentication
const defaultUser: User = {
  id: "default-user",
  apiKey: "ytdl_default_api_key",
  plan: "free",
  createdAt: new Date()
};
users.set(defaultUser.id, defaultUser);

export const storage = {
  // Download operations
  async createDownload(data: Omit<Download, 'id' | 'status' | 'progress' | 'createdAt'>): Promise<Download> {
    const download: Download = {
      id: randomUUID(),
      status: "pending" as const,
      progress: 0,
      createdAt: new Date(),
      ...data
    };
    downloads.set(download.id, download);
    return download;
  },

  async getDownload(id: string): Promise<Download | null> {
    return downloads.get(id) || null;
  },

  async updateDownload(id: string, updates: Partial<Download>): Promise<Download | null> {
    const download = downloads.get(id);
    if (!download) return null;

    const updated = { ...download, ...updates };
    downloads.set(id, updated);
    return updated;
  },

  // Batch download operations
  async createBatchDownload(data: Omit<BatchDownload, 'id' | 'status' | 'progress' | 'completedItems' | 'createdAt' | 'totalItems'>): Promise<BatchDownload> {
    const batch: BatchDownload = {
      id: randomUUID(),
      status: "pending" as const,
      progress: 0,
      completedItems: 0,
      totalItems: data.urls.length,
      createdAt: new Date(),
      ...data
    };
    batchDownloads.set(batch.id, batch);
    return batch;
  },

  async getBatchDownload(id: string): Promise<BatchDownload | null> {
    return batchDownloads.get(id) || null;
  },

  async updateBatchDownload(id: string, updates: Partial<BatchDownload>): Promise<BatchDownload | null> {
    const batch = batchDownloads.get(id);
    if (!batch) return null;

    const updated = { ...batch, ...updates };
    batchDownloads.set(id, updated);
    return updated;
  },

  // User operations
  async getUserByApiKey(apiKey: string): Promise<User | null> {
    for (const user of users.values()) {
      if (user.apiKey === apiKey) {
        return user;
      }
    }
    return null;
  },

  async updateUserApiKey(userId: string, apiKey: string): Promise<void> {
    const user = users.get(userId);
    if (user) {
      user.apiKey = apiKey;
      users.set(userId, user);
    }
  }
};