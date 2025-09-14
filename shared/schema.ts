import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  apiKey: text("api_key").unique(),
  plan: text("plan").default("free"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const downloads = pgTable("downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  title: text("title"),
  format: text("format").notNull(),
  status: text("status").notNull().default("pending"), // pending, downloading, completed, failed
  progress: integer("progress").default(0),
  fileSize: integer("file_size"),
  filePath: text("file_path"),
  userId: varchar("user_id"),
  telegramChatId: text("telegram_chat_id"),
  webhookUrl: text("webhook_url"),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const batchDownloads = pgTable("batch_downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  urls: text("urls").array().notNull(),
  format: text("format").notNull(),
  status: text("status").notNull().default("pending"),
  progress: integer("progress").default(0),
  totalItems: integer("total_items").notNull(),
  completedItems: integer("completed_items").default(0),
  userId: varchar("user_id"),
  telegramChatId: text("telegram_chat_id"),
  webhookUrl: text("webhook_url"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDownloadSchema = createInsertSchema(downloads).pick({
  url: true,
  format: true,
  telegramChatId: true,
  webhookUrl: true,
}).extend({
  url: z.string().url("Invalid YouTube URL"),
  format: z.enum(["mp4", "mp4-1080", "mp3", "wav", "best"]),
});

export const insertBatchDownloadSchema = createInsertSchema(batchDownloads).pick({
  urls: true,
  format: true,
  telegramChatId: true,
  webhookUrl: true,
}).extend({
  urls: z.array(z.string().url("Invalid YouTube URL")),
  format: z.enum(["mp4", "mp4-1080", "mp3", "wav", "best"]),
});

export const videoInfoSchema = z.object({
  url: z.string().url("Invalid YouTube URL"),
  format: z.enum(["video", "audio", "best"]).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDownload = z.infer<typeof insertDownloadSchema>;
export type Download = typeof downloads.$inferSelect;
export type InsertBatchDownload = z.infer<typeof insertBatchDownloadSchema>;
export type BatchDownload = typeof batchDownloads.$inferSelect;
export type VideoInfoRequest = z.infer<typeof videoInfoSchema>;
