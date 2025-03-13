import { users, papers, type User, type InsertUser, type Paper, type InsertPaper } from "@shared/schema";
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
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private papers: Map<number, Paper>;
  private currentUserId: number;
  private currentPaperId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.papers = new Map();
    this.currentUserId = 1;
    this.currentPaperId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
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
}

export const storage = new MemStorage();