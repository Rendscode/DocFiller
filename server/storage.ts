import { FormSubmission, InsertFormSubmission } from "@shared/schema";

export interface IStorage {
  getFormSubmission(userId: string): Promise<FormSubmission | undefined>;
  createFormSubmission(submission: InsertFormSubmission): Promise<FormSubmission>;
  updateFormSubmission(userId: string, formData: any): Promise<FormSubmission | undefined>;
}

export class MemStorage implements IStorage {
  private submissions: Map<string, FormSubmission>;
  private currentId: number;

  constructor() {
    this.submissions = new Map();
    this.currentId = 1;
  }

  async getFormSubmission(userId: string): Promise<FormSubmission | undefined> {
    return Array.from(this.submissions.values()).find(
      (submission) => submission.userId === userId
    );
  }

  async createFormSubmission(insertSubmission: InsertFormSubmission): Promise<FormSubmission> {
    const id = this.currentId++;
    const submission: FormSubmission = {
      ...insertSubmission,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.submissions.set(submission.userId, submission);
    return submission;
  }

  async updateFormSubmission(userId: string, formData: any): Promise<FormSubmission | undefined> {
    const existing = await this.getFormSubmission(userId);
    if (existing) {
      const updated: FormSubmission = {
        ...existing,
        formData,
        updatedAt: new Date().toISOString(),
      };
      this.submissions.set(userId, updated);
      return updated;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
