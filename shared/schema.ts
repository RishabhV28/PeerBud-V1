import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
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
  assignedTo: integer("assigned_to"),
  feedback: text("feedback"),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  paperId: integer("paper_id").notNull(),
  reviewerId: integer("reviewer_id").notNull(),
  comment: text("comment").notNull(),
  rating: integer("rating").notNull(),
  submitted: timestamp("submitted").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
}).extend({
  role: z.enum(["user", "professor"]).default("user"),
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

export const insertReviewSchema = createInsertSchema(reviews)
  .pick({
    paperId: true,
    comment: true,
    rating: true,
  })
  .extend({
    rating: z.number().min(1).max(5),
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPaper = z.infer<typeof insertPaperSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type User = typeof users.$inferSelect;
export type Paper = typeof papers.$inferSelect;
export type Review = typeof reviews.$inferSelect;
