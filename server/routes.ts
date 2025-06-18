import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFormSubmissionSchema } from "@shared/schema";
import { PDFService } from "./pdf-service";
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
      
      if (!formData) {
        return res.status(400).json({ message: "Form data is required" });
      }

      const pdfService = new PDFService();
      const pdfBytes = await pdfService.fillForm(formData);
      
      // Set appropriate headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="erklaerung_selbststaendige_arbeit.pdf"');
      res.setHeader('Content-Length', pdfBytes.length);
      
      // Send the PDF as binary data
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error('PDF generation error:', error);
      res.status(500).json({ 
        message: "PDF generation failed", 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
