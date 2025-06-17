import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFormSubmissionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get form data for a user
  app.get("/api/form/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const submission = await storage.getFormSubmission(userId);
      
      if (!submission) {
        return res.status(404).json({ message: "Form data not found" });
      }
      
      res.json(submission);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Save form data
  app.post("/api/form", async (req, res) => {
    try {
      const validatedData = insertFormSubmissionSchema.parse(req.body);
      
      const existing = await storage.getFormSubmission(validatedData.userId);
      
      if (existing) {
        const updated = await storage.updateFormSubmission(
          validatedData.userId,
          validatedData.formData
        );
        res.json(updated);
      } else {
        const created = await storage.createFormSubmission(validatedData);
        res.json(created);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid form data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Generate PDF
  app.post("/api/generate-pdf", async (req, res) => {
    try {
      const { formData } = req.body;
      
      // TODO: Implement PDF generation using pdf-lib
      // For now, return a mock response
      res.json({ 
        success: true, 
        message: "PDF generation would be implemented here",
        downloadUrl: "/api/download-pdf/mock-id"
      });
    } catch (error) {
      res.status(500).json({ message: "PDF generation failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
