import { type User, type InsertUser, type Download, type InsertDownload, type BatchDownload, type InsertBatchDownload } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByApiKey(apiKey: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserApiKey(id: string, apiKey: string): Promise<void>;
  
  // Download methods
  getDownload(id: string): Promise<Download | undefined>;
  getDownloadsByUser(userId: string): Promise<Download[]>;
  createDownload(download: InsertDownload & { userId?: string }): Promise<Download>;
  updateDownload(id: string, updates: Partial<Download>): Promise<Download | undefined>;
  getActiveDownloads(): Promise<Download[]>;
  
  // Batch download methods
  getBatchDownload(id: string): Promise<BatchDownload | undefined>;
  createBatchDownload(batch: InsertBatchDownload & { userId?: string }): Promise<BatchDownload>;
  updateBatchDownload(id: string, updates: Partial<BatchDownload>): Promise<BatchDownload | undefined>;
  getActiveBatchDownloads(): Promise<BatchDownload[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private downloads: Map<string, Download>;
  private batchDownloads: Map<string, BatchDownload>;

  constructor() {
    this.users = new Map();
    this.downloads = new Map();
    this.batchDownloads = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByApiKey(apiKey: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.apiKey === apiKey,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      apiKey: null,
      plan: "free",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserApiKey(id: string, apiKey: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.apiKey = apiKey;
      this.users.set(id, user);
    }
  }

  async getDownload(id: string): Promise<Download | undefined> {
    return this.downloads.get(id);
  }

  async getDownloadsByUser(userId: string): Promise<Download[]> {
    return Array.from(this.downloads.values()).filter(
      (download) => download.userId === userId,
    );
  }

  async createDownload(downloadData: InsertDownload & { userId?: string }): Promise<Download> {
    const id = randomUUID();
    const download: Download = {
      ...downloadData,
      id,
      title: null,
      status: "pending",
      progress: 0,
      fileSize: null,
      filePath: null,
      userId: downloadData.userId || null,
      telegramChatId: downloadData.telegramChatId || null,
      webhookUrl: downloadData.webhookUrl || null,
      errorMessage: null,
      metadata: null,
      createdAt: new Date(),
      completedAt: null,
    };
    this.downloads.set(id, download);
    return download;
  }

  async updateDownload(id: string, updates: Partial<Download>): Promise<Download | undefined> {
    const download = this.downloads.get(id);
    if (download) {
      const updated = { ...download, ...updates };
      this.downloads.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getActiveDownloads(): Promise<Download[]> {
    return Array.from(this.downloads.values()).filter(
      (download) => download.status === "downloading" || download.status === "pending",
    );
  }

  async getBatchDownload(id: string): Promise<BatchDownload | undefined> {
    return this.batchDownloads.get(id);
  }

  async createBatchDownload(batchData: InsertBatchDownload & { userId?: string }): Promise<BatchDownload> {
    const id = randomUUID();
    const batch: BatchDownload = {
      ...batchData,
      id,
      status: "pending",
      progress: 0,
      totalItems: batchData.urls.length,
      completedItems: 0,
      userId: batchData.userId || null,
      telegramChatId: batchData.telegramChatId || null,
      webhookUrl: batchData.webhookUrl || null,
      createdAt: new Date(),
      completedAt: null,
    };
    this.batchDownloads.set(id, batch);
    return batch;
  }

  async updateBatchDownload(id: string, updates: Partial<BatchDownload>): Promise<BatchDownload | undefined> {
    const batch = this.batchDownloads.get(id);
    if (batch) {
      const updated = { ...batch, ...updates };
      this.batchDownloads.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getActiveBatchDownloads(): Promise<BatchDownload[]> {
    return Array.from(this.batchDownloads.values()).filter(
      (batch) => batch.status === "downloading" || batch.status === "pending",
    );
  }
}

export const storage = new MemStorage();
