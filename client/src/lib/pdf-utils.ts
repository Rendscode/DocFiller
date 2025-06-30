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
  console.log('Starting PDF generation request...');
  
  const response = await fetch('/api/generate-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ formData, options }),
  });

  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('PDF generation failed:', errorData);
    throw new Error(errorData.message || 'PDF generation failed');
  }

  // Return the PDF blob directly from the server response
  const blob = await response.blob();
  console.log('PDF blob created, size:', blob.size, 'type:', blob.type);
  return blob;
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
  console.log('Starting PDF download...');
  console.log('Blob size:', blob.size, 'bytes');
  console.log('Blob type:', blob.type);
  
  // Create a temporary URL for the blob
  const url = URL.createObjectURL(blob);
  console.log('Created blob URL:', url);
  
  // Create a temporary anchor element to trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  // Add to DOM, click, then remove
  document.body.appendChild(link);
  console.log('Triggering download...');
  link.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('Download cleanup completed');
  }, 100);
}
