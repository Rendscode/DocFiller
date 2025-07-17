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

  // Debug route to check file system
  app.get("/api/debug/filesystem", async (req, res) => {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const debugInfo = {
        cwd: process.cwd(),
        dirname: __dirname,
        nodeEnv: process.env.NODE_ENV,
        argv: process.argv,
        cwdContents: [],
        assetsContents: [],
        serverAssetsContents: [],
        possiblePdfPaths: []
      };
      
      // Get current directory contents
      try {
        debugInfo.cwdContents = fs.readdirSync(process.cwd());
      } catch (e) {
        debugInfo.cwdContents = [`Error: ${e.message}`];
      }
      
      // Check assets directory
      const assetsPath = path.join(process.cwd(), 'assets');
      if (fs.existsSync(assetsPath)) {
        try {
          debugInfo.assetsContents = fs.readdirSync(assetsPath);
        } catch (e) {
          debugInfo.assetsContents = [`Error: ${e.message}`];
        }
      }
      
      // Check server/assets directory
      const serverAssetsPath = path.join(process.cwd(), 'server', 'assets');
      if (fs.existsSync(serverAssetsPath)) {
        try {
          debugInfo.serverAssetsContents = fs.readdirSync(serverAssetsPath);
        } catch (e) {
          debugInfo.serverAssetsContents = [`Error: ${e.message}`];
        }
      }
      
      // Check possible PDF paths
      const possiblePaths = [
        path.join(process.cwd(), 'assets', 'original-form.pdf'),
        path.join(process.cwd(), 'server', 'assets', 'original-form.pdf'),
        path.join(__dirname, 'assets', 'original-form.pdf'),
        path.join(__dirname, '..', 'assets', 'original-form.pdf'),
        '/home/runner/workspace/assets/original-form.pdf',
        '/home/runner/workspace/server/assets/original-form.pdf'
      ];
      
      debugInfo.possiblePdfPaths = possiblePaths.map(p => ({
        path: p,
        exists: fs.existsSync(p)
      }));
      
      res.json(debugInfo);
    } catch (error) {
      res.status(500).json({ error: error.message });
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
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('Request body keys:', Object.keys(req.body));
      console.error('Form data type:', typeof req.body.formData);
      res.status(500).json({ 
        message: "PDF generation failed", 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
