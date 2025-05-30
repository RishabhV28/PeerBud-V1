import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertPaperSchema, insertReviewSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { extractTextFromPDF } from "./pdf-utils";

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
    // Get all papers that are pending, not assigned, and match the professor's institute
    const allPapers = await storage.getPapers();
    const pendingPapers = allPapers.filter(paper => 
      paper.status === "pending" && 
      !paper.assignedTo && 
      paper.institute === req.user!.institute
    );
    res.json(pendingPapers);
  });
  
  app.post("/api/professor/assign-paper/:id", async (req, res) => {
    if (!isProfessor(req)) return res.sendStatus(403);
    
    try {
      const paperId = parseInt(req.params.id);
      const paper = await storage.getPaperById(paperId);
      
      if (!paper) {
        return res.status(404).json({ error: "Paper not found" });
      }
      
      // Ensure professor can only assign papers from their institute
      if (paper.institute !== req.user!.institute) {
        return res.status(403).json({ error: "You can only review papers from your institute" });
      }
      
      const updatedPaper = await storage.assignPaperToProfessor(paperId, req.user!.id);
      res.json(updatedPaper);
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

  // Grammar and format checking API endpoints
  app.post("/api/papers/check-grammar", upload.single("file"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.file) return res.status(400).send("No file uploaded");
    
    try {
      // Extract text from PDF
      const extractedText = await extractTextFromPDF(req.file.path);
      
      // We'll simulate grammar checking on the server side
      // In a production app, you might want to do this on the client
      // or use a more sophisticated NLP service
      const results = {
        text: extractedText.substring(0, 500) + "...", // Return a preview
        wordCount: extractedText.split(/\s+/).length,
        sentenceCount: extractedText.split(/[.!?]+/).length - 1,
        paragraphCount: extractedText.split(/\n\s*\n/).length,
        errors: [
          {
            type: "grammar",
            line: 2,
            suggestion: "Consider revising this sentence for clarity"
          },
          {
            type: "spelling",
            line: 5,
            suggestion: "Check spelling of technical terms"
          }
        ],
        score: 85 // Simulated grammar score
      };
      
      // Delete the temporary file after processing
      fs.unlinkSync(req.file.path);
      
      res.json(results);
    } catch (error) {
      console.error("Error checking grammar:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });
  
  app.post("/api/papers/check-format", upload.single("file"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.file) return res.status(400).send("No file uploaded");
    
    try {
      // Extract text from PDF
      const extractedText = await extractTextFromPDF(req.file.path);
      
      // Simulated format checking
      const results = {
        sections: [
          { name: "Abstract", found: true },
          { name: "Introduction", found: true },
          { name: "Literature Review", found: true },
          { name: "Methodology", found: true },
          { name: "Results", found: true },
          { name: "Discussion", found: true },
          { name: "Conclusion", found: true },
          { name: "References", found: true }
        ],
        citationStyle: "APA",
        formatScore: 90,
        suggestions: [
          "Ensure all figures have proper captions",
          "Consider adding keywords section after abstract"
        ]
      };
      
      // Delete the temporary file after processing
      fs.unlinkSync(req.file.path);
      
      res.json(results);
    } catch (error) {
      console.error("Error checking format:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Serve PDF files to authenticated users
  // Debugging endpoint to check if file exists
  app.get("/api/papers/:id/check", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const paperId = parseInt(req.params.id);
      const paper = await storage.getPaperById(paperId);
      
      if (!paper) {
        return res.status(404).json({ error: "Paper not found", id: paperId });
      }
      
      const filePath = paper.filePath;
      const fileExists = fs.existsSync(filePath);
      
      res.json({
        paperId,
        filePath,
        fileExists,
        fileSize: fileExists ? fs.statSync(filePath).size : 0
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Serve PDF files to authenticated users
  app.get("/api/papers/:id/pdf", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const paperId = parseInt(req.params.id);
      const paper = await storage.getPaperById(paperId);
      
      if (!paper) {
        return res.status(404).json({ error: "Paper not found" });
      }
      
      // For professors, they can access if they have the same institute or if the paper is assigned to them
      const isProfessorWithAccess = 
        req.user!.role === "professor" && 
        (paper.institute === req.user!.institute || paper.assignedTo === req.user!.id);
        
      // Only allow the paper owner or authorized professors to see the PDF
      if (paper.userId !== req.user!.id && !isProfessorWithAccess) {
        return res.status(403).json({ error: "You don't have permission to view this paper" });
      }
      
      const filePath = paper.filePath;
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return res.status(404).json({ error: "PDF file not found" });
      }
      
      // Set appropriate headers for PDF delivery with CORS headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="paper-${paperId}.pdf"`);
      
      // Add CORS headers to allow viewing PDFs in iframe
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      
      // Create read stream and pipe to response
      const fileStream = fs.createReadStream(filePath);
      fileStream.on('error', (err) => {
        console.error('Error reading file:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error reading PDF file" });
        }
      });
      
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error serving PDF:', error);
      res.status(400).json({ error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
