import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Available institutes for selection
export const INSTITUTES = [
  "Raincode",
  "IIT Delhi",
  "IIT Bombay",
  "IIT Madras",
  "IIT Kanpur",
  "IIT Kharagpur",
  "IIM Ahmedabad",
  "IIM Bangalore",
  "IIM Calcutta"
];

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  institute: text("institute"),
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
  institute: text("institute").notNull(),
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
  institute: true,
}).extend({
  role: z.enum(["user", "professor"]).default("user"),
  institute: z.string().optional(),
});

export const insertPaperSchema = createInsertSchema(papers)
  .pick({
    title: true,
    abstract: true,
    filePath: true,
    price: true,
    institute: true,
  })
  .extend({
    price: z.number().min(1000).max(3000),
    institute: z.string(),
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
