import { z } from 'zod';

export const masterDataSchema = z.object({
  customerNumber: z.string().min(1, 'Kundennummer ist erforderlich'),
  firstName: z.string().min(1, 'Vorname ist erforderlich'),
  lastName: z.string().min(1, 'Nachname ist erforderlich'),
  birthDate: z.string().min(1, 'Geburtsdatum ist erforderlich'),
  street: z.string().min(1, 'Straße ist erforderlich'),
  postalCode: z.string().min(1, 'Postleitzahl ist erforderlich'),
  city: z.string().min(1, 'Wohnort ist erforderlich'),
});

export const generalInfoSchema = z.object({
  activityStartDate: z.string().optional(),
  activityEndDate: z.string().optional(),
  activityLocationValue: z.string().optional(),
  activityType: z.string().optional(),
  activityUntilFurtherNotice: z.boolean().default(false),
});

export const workingTimeSchema = z.object({
  workingTimeType: z.enum(['constant', 'variable']),
  constantWeeklyHours: z.number().min(0).max(168).optional(),
});

export const incomeSchema = z.object({
  incomeType: z.enum(['existing', 'new', 'detailed']),
  existingActivityScope: z.enum(['same', 'different']).optional(),
  existingIncomeUnchanged: z.boolean().default(false),
  existingMonthlyIncome: z.number().min(0).optional(),
  newActivityIncomeLevel: z.enum(['low', 'high']).optional(),
  monthlyRevenue: z.number().min(0).optional(),
  expenseTreatment: z.enum(['flat', 'detailed']).default('flat'),
  businessExpenses: z.number().min(0).optional(),
  depreciation: z.number().min(0).optional(),
  incomeTax: z.number().min(0).optional(),
  churchTax: z.number().min(0).optional(),
  solidarityTax: z.number().min(0).optional(),
  taxReturnSubmitted: z.boolean().default(false),
  taxAssessmentAttached: z.boolean().default(false),
  taxAssessmentYear: z.number().optional(),
});

export const calendarWeekSchema = z.object({
  startDate: z.string().min(1, 'Startdatum ist erforderlich'),
  endDate: z.string().min(1, 'Enddatum ist erforderlich'),
  mondayHours: z.number().min(0).max(24).default(0),
  tuesdayHours: z.number().min(0).max(24).default(0),
  wednesdayHours: z.number().min(0).max(24).default(0),
  thursdayHours: z.number().min(0).max(24).default(0),
  fridayHours: z.number().min(0).max(24).default(0),
  saturdayHours: z.number().min(0).max(24).default(0),
  sundayHours: z.number().min(0).max(24).default(0),
});

export function calculateIncome(revenue: number, expenseTreatment: string, expenses?: number): number {
  if (expenseTreatment === 'flat') {
    return revenue * 0.7; // 30% expenses deduction
  }
  return revenue - (expenses || 0);
}
