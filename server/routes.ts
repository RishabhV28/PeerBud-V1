import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertPaperSchema, insertReviewSchema } from "@shared/schema";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

// Helper function to check if user is a professor
function isProfessor(req: any): boolean {
  return req.isAuthenticated() && req.user?.role === "professor";
}

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
  
  // Professor API routes
  app.get("/api/professor/papers", async (req, res) => {
    if (!isProfessor(req)) return res.sendStatus(403);
    const papers = await storage.getProfessorPapers(req.user!.id);
    res.json(papers);
  });
  
  app.get("/api/professor/pending-papers", async (req, res) => {
    if (!isProfessor(req)) return res.sendStatus(403);
    // Get all papers that are pending and not assigned
    const allPapers = await storage.getPapers();
    const pendingPapers = allPapers.filter(paper => 
      paper.status === "pending" && !paper.assignedTo
    );
    res.json(pendingPapers);
  });
  
  app.post("/api/professor/assign-paper/:id", async (req, res) => {
    if (!isProfessor(req)) return res.sendStatus(403);
    
    try {
      const paperId = parseInt(req.params.id);
      const paper = await storage.assignPaperToProfessor(paperId, req.user!.id);
      res.json(paper);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  app.post("/api/professor/review-paper/:id", async (req, res) => {
    if (!isProfessor(req)) return res.sendStatus(403);
    
    try {
      const paperId = parseInt(req.params.id);
      const paper = await storage.getPaperById(paperId);
      
      if (!paper) {
        return res.status(404).json({ error: "Paper not found" });
      }
      
      if (paper.assignedTo !== req.user!.id) {
        return res.status(403).json({ error: "This paper is not assigned to you" });
      }
      
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        paperId,
        rating: parseInt(req.body.rating),
      });
      
      const review = await storage.createReview(req.user!.id, reviewData);
      
      // Update paper status
      await storage.updatePaperStatus(
        paperId, 
        "reviewed", 
        req.body.feedback || "Paper has been reviewed"
      );
      
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });
  
  app.get("/api/paper/:id/reviews", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const paperId = parseInt(req.params.id);
      const paper = await storage.getPaperById(paperId);
      
      if (!paper) {
        return res.status(404).json({ error: "Paper not found" });
      }
      
      // Only allow the paper owner or assigned professor to see reviews
      if (paper.userId !== req.user!.id && paper.assignedTo !== req.user!.id) {
        return res.status(403).json({ error: "You don't have permission to view these reviews" });
      }
      
      const reviews = await storage.getReviewsByPaperId(paperId);
      res.json(reviews);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
