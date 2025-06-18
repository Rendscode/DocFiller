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
  const response = await fetch('/api/generate-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ formData, options }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'PDF generation failed');
  }

  // Return the PDF blob directly from the server response
  return await response.blob();
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
