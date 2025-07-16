import { pgTable, text, serial, integer, boolean, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const formSubmissions = pgTable("form_submissions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  formData: jsonb("form_data").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertFormSubmissionSchema = createInsertSchema(formSubmissions).pick({
  userId: true,
  formData: true,
});

export type InsertFormSubmission = z.infer<typeof insertFormSubmissionSchema>;
export type FormSubmission = typeof formSubmissions.$inferSelect;

// Form data schemas
export const masterDataSchema = z.object({
  customerNumber: z.string().min(1, "Kundennummer ist erforderlich"),
  firstName: z.string().min(1, "Vorname ist erforderlich"),
  lastName: z.string().min(1, "Nachname ist erforderlich"),
  birthDate: z.string().min(1, "Geburtsdatum ist erforderlich"),
  street: z.string().min(1, "Straße ist erforderlich"),
  postalCode: z.string().min(1, "Postleitzahl ist erforderlich"),
  city: z.string().min(1, "Wohnort ist erforderlich"),
});

export const generalInfoSchema = z.object({
  activityStartDate: z.string().min(1, "Startdatum ist erforderlich"),
  activityEndDate: z.string().optional(),
  isIndefinite: z.boolean().default(false),
  activityLocation: z.string().min(1, "Ort der Tätigkeit ist erforderlich"),
  activityType: z.string().min(1, "Art der Tätigkeit ist erforderlich"),
});

export const workingTimeSchema = z.object({
  type: z.enum(["constant", "variable"]),
  constantHours: z.number().optional(),
  calendarWeeks: z.array(z.object({
    id: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    hours: z.object({
      monday: z.number().min(0).max(24),
      tuesday: z.number().min(0).max(24),
      wednesday: z.number().min(0).max(24),
      thursday: z.number().min(0).max(24),
      friday: z.number().min(0).max(24),
      saturday: z.number().min(0).max(24),
      sunday: z.number().min(0).max(24),
    }),
  })).max(5),
});

export const incomeSchema = z.object({
  type: z.enum(["existing", "new", "detailed"]),
  existingActivity: z.object({
    scope: z.enum(["same", "different"]).optional(),
    monthlyIncome: z.number().optional(),
    isUnchanged: z.boolean().optional(),
  }).optional(),
  newActivity: z.object({
    expectedIncome: z.enum(["low", "high"]).optional(),
  }).optional(),
  detailedInfo: z.object({
    monthlyIncome: z.number().optional(),
    expenseTreatment: z.enum(["flat", "detailed"]),
    businessExpenses: z.number().optional(),
    depreciation: z.number().optional(),
    incomeTax: z.number().optional(),
    churchTax: z.number().optional(),
    solidarityTax: z.number().optional(),
    taxYear: z.number().optional(),
    taxReturnSubmitted: z.boolean().optional(),
    taxReturnAttached: z.boolean().optional(),
    taxAssessmentAttached: z.boolean().optional(),
    taxReturnReason: z.string().optional(),
  }).optional(),
});

export const formDataSchema = z.object({
  masterData: masterDataSchema,
  generalInfo: generalInfoSchema,
  workingTime: workingTimeSchema,
  income: incomeSchema,
  declarationConfirmed: z.boolean().default(false),
});

export type MasterData = z.infer<typeof masterDataSchema>;
export type GeneralInfo = z.infer<typeof generalInfoSchema>;
export type WorkingTime = z.infer<typeof workingTimeSchema>;
export type Income = z.infer<typeof incomeSchema>;
export type FormData = z.infer<typeof formDataSchema>;
