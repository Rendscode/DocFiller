import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utility to inspect PDF form fields
export async function inspectPDFFields() {
  try {
    const pdfPath = path.join(__dirname, 'assets', 'original-form.pdf');
    const existingPdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log('PDF Form Fields Analysis:');
    console.log('=========================');
    console.log('Total fields found:', fields.length);
    
    if (fields.length === 0) {
      console.log('No form fields detected. This might be a non-interactive PDF.');
      return [];
    }
    
    const fieldInfo = fields.map(field => {
      const name = field.getName();
      const type = field.constructor.name;
      return { name, type };
    });
    
    console.log('\nField details:');
    fieldInfo.forEach((field, index) => {
      console.log(`${index + 1}. ${field.name} (${field.type})`);
    });
    
    return fieldInfo;
  } catch (error) {
    console.error('Error inspecting PDF:', error);
    return [];
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  inspectPDFFields();
}