import { FormData } from "@shared/schema";

export interface PDFGenerationOptions {
  includeCalculations: boolean;
  includeTimestamp: boolean;
}

export async function generatePDF(
  formData: FormData,
  options: PDFGenerationOptions = {
    includeCalculations: true,
    includeTimestamp: true,
  }
): Promise<Blob> {
  // This would integrate with pdf-lib to fill out the actual PDF form
  // For now, return a mock implementation
  
  const response = await fetch('/api/generate-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ formData, options }),
  });

  if (!response.ok) {
    throw new Error('PDF generation failed');
  }

  // In a real implementation, this would return the PDF blob
  // For now, create a mock PDF with form data as text
  const pdfContent = createMockPDFContent(formData);
  return new Blob([pdfContent], { type: 'application/pdf' });
}

function createMockPDFContent(formData: FormData): string {
  return `
DocFiller - Erklärung zu Einkünften aus selbstständiger Arbeit
Generated on: ${new Date().toLocaleString('de-DE')}

STAMMDATEN:
Kundennummer: ${formData.masterData.customerNumber}
Name: ${formData.masterData.firstName} ${formData.masterData.lastName}
Geburtsdatum: ${formData.masterData.birthDate}
Adresse: ${formData.masterData.street}, ${formData.masterData.postalCode} ${formData.masterData.city}

ALLGEMEINE ANGABEN:
Tätigkeit ab: ${formData.generalInfo.activityStartDate}
Tätigkeit bis: ${formData.generalInfo.activityEndDate || 'bis auf weiteres'}
Ort: ${formData.generalInfo.activityLocation}
Art: ${formData.generalInfo.activityType}

ARBEITSZEIT:
Typ: ${formData.workingTime.type === 'constant' ? 'Gleichbleibend' : 'Variabel'}
${formData.workingTime.type === 'constant' 
  ? `Stunden/Woche: ${formData.workingTime.constantHours}`
  : `Kalenderwochen: ${formData.workingTime.calendarWeeks?.length || 0}`
}

EINKOMMEN:
Typ: ${formData.income.type}
${formData.income.detailedInfo?.monthlyIncome 
  ? `Monatliche Einnahmen: ${formData.income.detailedInfo.monthlyIncome} EUR`
  : ''
}

Ich versichere die Richtigkeit meiner Angaben: ${formData.declarationConfirmed ? 'Ja' : 'Nein'}
  `;
}

export function downloadPDF(blob: Blob, filename: string = 'erklaerung_selbststaendige_arbeit.pdf'): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
