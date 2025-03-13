import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const papers = pgTable("papers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  abstract: text("abstract").notNull(),
  filePath: text("file_path").notNull(),
  userId: integer("user_id").notNull(),
  price: integer("price").notNull(),
  status: text("status").notNull().default("pending"),
  submitted: timestamp("submitted").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertPaperSchema = createInsertSchema(papers)
  .pick({
    title: true,
    abstract: true,
    filePath: true,
    price: true,
  })
  .extend({
    price: z.number().min(1000).max(3000),
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPaper = z.infer<typeof insertPaperSchema>;
export type User = typeof users.$inferSelect;
export type Paper = typeof papers.$inferSelect;
