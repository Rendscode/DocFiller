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
  
  // Check if the browser supports downloads
  if (typeof window === 'undefined') {
    console.error('Download not supported: not in browser environment');
    return;
  }
  
  // Try multiple download methods for better browser compatibility
  try {
    // Method 1: Standard download link approach
    const url = URL.createObjectURL(blob);
    console.log('Created blob URL:', url);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Set additional attributes for better compatibility
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    
    // For some browsers, the link needs to be added to the DOM
    document.body.appendChild(link);
    
    console.log('Triggering download...');
    
    // Try multiple trigger methods
    if (link.click) {
      link.click();
    } else {
      // Fallback for older browsers
      const event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      link.dispatchEvent(event);
    }
    
    // Clean up after a delay
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
      console.log('Download cleanup completed');
    }, 1000);
    
    // Additional logging to help debug
    console.log('Download link created and clicked');
    console.log('Check your browser downloads folder or download notification');
    
  } catch (error) {
    console.error('Download failed:', error);
    
    // Method 2: Fallback - open PDF in new tab if download fails
    try {
      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');
      if (newWindow) {
        console.log('PDF opened in new tab - you can save it manually');
      } else {
        console.error('Failed to open PDF in new tab - popup blocked?');
      }
    } catch (fallbackError) {
      console.error('Fallback method also failed:', fallbackError);
    }
  }
}
