import { users, papers, reviews, type User, type InsertUser, type Paper, type InsertPaper, type Review, type InsertReview } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createPaper(userId: number, paper: InsertPaper): Promise<Paper>;
  getPapers(): Promise<Paper[]>;
  getUserPapers(userId: number): Promise<Paper[]>;
  getPaperById(paperId: number): Promise<Paper | undefined>;
  getProfessors(): Promise<User[]>;
  getProfessorPapers(professorId: number): Promise<Paper[]>;
  assignPaperToProfessor(paperId: number, professorId: number): Promise<Paper>;
  updatePaperStatus(paperId: number, status: string, feedback?: string): Promise<Paper>;
  createReview(reviewerId: number, review: InsertReview): Promise<Review>;
  getReviewsByPaperId(paperId: number): Promise<Review[]>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private papers: Map<number, Paper>;
  private reviews: Map<number, Review>;
  private currentUserId: number;
  private currentPaperId: number;
  private currentReviewId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.papers = new Map();
    this.reviews = new Map();
    this.currentUserId = 1;
    this.currentPaperId = 1;
    this.currentReviewId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Add a default professor account for testing
    this.createUser({
      username: "professor",
      password: "password",
      role: "professor",
      institute: "Raincode"
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createPaper(userId: number, paper: InsertPaper): Promise<Paper> {
    const id = this.currentPaperId++;
    const newPaper: Paper = {
      ...paper,
      id,
      userId,
      status: "pending",
      submitted: new Date(),
      assignedTo: null,
      feedback: null,
    };
    this.papers.set(id, newPaper);
    return newPaper;
  }

  async getPapers(): Promise<Paper[]> {
    return Array.from(this.papers.values());
  }

  async getUserPapers(userId: number): Promise<Paper[]> {
    return Array.from(this.papers.values()).filter(paper => paper.userId === userId);
  }
  
  async getPaperById(paperId: number): Promise<Paper | undefined> {
    return this.papers.get(paperId);
  }
  
  async getProfessors(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === "professor");
  }
  
  async getProfessorPapers(professorId: number): Promise<Paper[]> {
    return Array.from(this.papers.values()).filter(paper => paper.assignedTo === professorId);
  }
  
  async assignPaperToProfessor(paperId: number, professorId: number): Promise<Paper> {
    const paper = this.papers.get(paperId);
    if (!paper) {
      throw new Error("Paper not found");
    }
    
    const updatedPaper = { ...paper, assignedTo: professorId };
    this.papers.set(paperId, updatedPaper);
    return updatedPaper;
  }
  
  async updatePaperStatus(paperId: number, status: string, feedback?: string): Promise<Paper> {
    const paper = this.papers.get(paperId);
    if (!paper) {
      throw new Error("Paper not found");
    }
    
    const updatedPaper = { ...paper, status, feedback: feedback || paper.feedback };
    this.papers.set(paperId, updatedPaper);
    return updatedPaper;
  }
  
  async createReview(reviewerId: number, review: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const newReview: Review = {
      ...review,
      id,
      reviewerId,
      submitted: new Date(),
    };
    this.reviews.set(id, newReview);
    
    // Update paper status to reviewed
    const paper = this.papers.get(review.paperId);
    if (paper) {
      this.updatePaperStatus(review.paperId, "reviewed", "Paper has been reviewed");
    }
    
    return newReview;
  }
  
  async getReviewsByPaperId(paperId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.paperId === paperId);
  }
}

export const storage = new MemStorage();