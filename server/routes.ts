import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertPaperSchema } from "@shared/schema";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.post("/api/papers", upload.single("file"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.file) return res.status(400).send("No file uploaded");

    try {
      const paperData = insertPaperSchema.parse({
        ...req.body,
        filePath: req.file.path,
        price: parseInt(req.body.price),
      });

      const paper = await storage.createPaper(req.user!.id, paperData);
      res.status(201).json(paper);
    } catch (error) {
      res.status(400).json(error);
    }
  });

  app.get("/api/papers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const papers = await storage.getUserPapers(req.user!.id);
    res.json(papers);
  });

  app.get("/api/papers/all", async (_req, res) => {
    const papers = await storage.getPapers();
    res.json(papers);
  });

  const httpServer = createServer(app);
  return httpServer;
}
