import { PDFDocument, PDFForm, PDFTextField, PDFCheckBox } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { FormData } from '@shared/schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PDFService {
  private originalPdfPath: string;

  constructor() {
    this.originalPdfPath = path.join(__dirname, 'assets', 'original-form.pdf');
  }

  async fillForm(formData: FormData): Promise<Uint8Array> {
    try {
      console.log('Starting PDF generation...');
      console.log('PDF path:', this.originalPdfPath);
      console.log('File exists:', fs.existsSync(this.originalPdfPath));
      
      // Read the original PDF form
      const existingPdfBytes = fs.readFileSync(this.originalPdfPath);
      console.log('PDF file read, size:', existingPdfBytes.length, 'bytes');
      
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      console.log('PDF document loaded successfully');
      
      // Get the form from the PDF
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      console.log('Form loaded with', fields.length, 'fields');
      
      // Fill master data fields
      console.log('Filling master data...');
      this.fillMasterDataFields(form, formData.masterData);
      
      // Fill general info fields
      console.log('Filling general info...');
      this.fillGeneralInfoFields(form, formData.generalInfo);
      
      // Fill working time fields
      console.log('Filling working time...');
      this.fillWorkingTimeFields(form, formData.workingTime);
      
      // Fill income fields
      console.log('Filling income...');
      this.fillIncomeFields(form, formData.income);
      
      // Mark declaration as confirmed
      console.log('Marking declaration confirmed...');
      if (formData.declarationConfirmed) {
        this.markDeclarationConfirmed(form);
      }
      
      // Flatten the form to prevent further editing
      console.log('Flattening form...');
      form.flatten();
      
      // Save the PDF
      console.log('Saving PDF...');
      const pdfBytes = await pdfDoc.save();
      console.log('PDF generated successfully, size:', pdfBytes.length, 'bytes');
      
      return pdfBytes;
    } catch (error) {
      console.error('PDF generation error:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw new Error('Failed to generate PDF');
    }
  }

  private fillMasterDataFields(form: PDFForm, masterData: any) {
    try {
      // Get all available field names to find correct mappings
      const allFields = form.getFields();
      const fieldNames = allFields.map(field => field.getName());
      console.log('All available PDF field names:', fieldNames);
      
      // Try to find and map fields based on partial name matches
      const findField = (searchTerms: string[]) => {
        return fieldNames.find(name => 
          searchTerms.some(term => name.toLowerCase().includes(term.toLowerCase()))
        );
      };
      
      // Find customer number field
      const customerNumberField = findField(['kundennummer', 'customer']);
      if (customerNumberField && masterData.customerNumber) {
        try {
          const field = form.getField(customerNumberField);
          if (field instanceof PDFTextField) {
            field.setText(String(masterData.customerNumber));
            console.log('Filled customer number field:', customerNumberField);
          }
        } catch (e) {
          console.log('Error filling customer number:', e instanceof Error ? e.message : 'Unknown error');
        }
      }
      
      // Find name field
      const nameField = findField(['name', 'vorname', 'nachname']);
      if (nameField && masterData.firstName && masterData.lastName) {
        try {
          const field = form.getField(nameField);
          if (field instanceof PDFTextField) {
            field.setText(`${masterData.lastName}, ${masterData.firstName}`);
            console.log('Filled name field:', nameField);
          }
        } catch (e) {
          console.log('Error filling name:', e instanceof Error ? e.message : 'Unknown error');
        }
      }
      
      // Find birth date field
      const birthDateField = findField(['geburt', 'birth']);
      if (birthDateField && masterData.birthDate) {
        try {
          const field = form.getField(birthDateField);
          if (field instanceof PDFTextField) {
            field.setText(String(masterData.birthDate));
            console.log('Filled birth date field:', birthDateField);
          }
        } catch (e) {
          console.log('Error filling birth date:', e instanceof Error ? e.message : 'Unknown error');
        }
      }
      
      // Find street/address field
      const streetField = findField(['straße', 'haus', 'street', 'address', 'adresse']);
      if (streetField && masterData.street) {
        try {
          const field = form.getField(streetField);
          if (field instanceof PDFTextField) {
            field.setText(String(masterData.street));
            console.log('Filled street field:', streetField);
          }
        } catch (e) {
          console.log('Error filling street:', e instanceof Error ? e.message : 'Unknown error');
        }
      }
      
      // Find postal code and city field
      const cityField = findField(['postleitzahl', 'wohnort', 'ort', 'city', 'plz']);
      if (cityField && masterData.postalCode && masterData.city) {
        try {
          const field = form.getField(cityField);
          if (field instanceof PDFTextField) {
            field.setText(`${masterData.postalCode} ${masterData.city}`);
            console.log('Filled city field:', cityField);
          }
        } catch (e) {
          console.log('Error filling city:', e instanceof Error ? e.message : 'Unknown error');
        }
      }
    } catch (error) {
      console.error('Error filling master data fields:', error);
    }
  }

  private fillGeneralInfoFields(form: PDFForm, generalInfo: any) {
    try {
      const fieldMappings = {
        'Arbeitsbescheinigung[0].Seite1[0].Allgemeine_Angaben_1[0].Die_Tätigkeit_wird_ausgeübt[0]': generalInfo.activityStartDate,
        'Arbeitsbescheinigung[0].Seite1[0].Allgemeine_Angaben_1[0].voraussichtlich_bis_Datum[0]': generalInfo.isIndefinite ? '' : generalInfo.activityEndDate,
        'Arbeitsbescheinigung[0].Seite1[0].Allgemeine_Angaben_1[0].Ort_der_Taetigkeit[0]': generalInfo.activityLocation,
        'Arbeitsbescheinigung[0].Seite1[0].Allgemeine_Angaben_1[0].Art_der_Taetigkeit[0]': generalInfo.activityType,
      };

      Object.entries(fieldMappings).forEach(([fieldName, value]) => {
        try {
          const field = form.getField(fieldName);
          if (field && value) {
            if (field instanceof PDFTextField) {
              field.setText(String(value));
            }
          }
        } catch (e) {
          console.log(`Field not found or error: ${fieldName}`, e instanceof Error ? e.message : 'Unknown error');
        }
      });

      // Handle checkbox for "bis auf weiteres"
      if (generalInfo.isIndefinite) {
        try {
          const indefiniteField = form.getField('Arbeitsbescheinigung[0].Seite1[0].Allgemeine_Angaben_1[0].Kontrollkaestchen1[0]');
          if (indefiniteField instanceof PDFCheckBox) {
            indefiniteField.check();
          }
        } catch (e) {
          console.log('Indefinite checkbox not found:', e instanceof Error ? e.message : 'Unknown error');
        }
      }
    } catch (error) {
      console.error('Error filling general info fields:', error);
    }
  }

  private fillWorkingTimeFields(form: PDFForm, workingTime: any) {
    try {
      if (workingTime.type === 'constant') {
        // Fill constant working hours checkbox (Ja)
        try {
          const constantField = form.getField('Arbeitsbescheinigung[0].Seite1[0].Angaben_Arbeitszeit_2[0].Ja-Nein-2[0]');
          if (constantField instanceof PDFCheckBox) {
            constantField.check();
          }
          
          const hoursField = form.getField('Arbeitsbescheinigung[0].Seite1[0].Angaben_Arbeitszeit_2[0].Wenn_ja_Stundenzahl_wöchentlich[0]');
          if (hoursField instanceof PDFTextField) {
            hoursField.setText(String(workingTime.constantHours || 0));
          }
        } catch (e) {
          console.log('Error filling constant hours:', e instanceof Error ? e.message : 'Unknown error');
        }
      } else if (workingTime.type === 'variable' && workingTime.calendarWeeks) {
        // Fill variable working hours checkbox (Nein)
        try {
          const variableField = form.getField('Arbeitsbescheinigung[0].Seite1[0].Angaben_Arbeitszeit_2[0].Ja-Nein-2[1]');
          if (variableField instanceof PDFCheckBox) {
            variableField.check();
          }
        } catch (e) {
          console.log('Error checking variable field:', e instanceof Error ? e.message : 'Unknown error');
        }

        // Fill calendar weeks (up to 5) with correct field mapping:
        // S1 = "vom" (start date)
        // S2 = "Kalenderwoche" (calendar week number) 
        // S3 = "Arbeitsstunden insgesamt" (total hours)
        // S4-S10 = daily hours (MO, DI, MI, DO, FR, SA, SO)
        workingTime.calendarWeeks.slice(0, 5).forEach((week: any, index: number) => {
          const rowNum = index + 1;
          try {
            const startDateField = form.getField(`Arbeitsbescheinigung[0].Seite1[0].Angaben_Arbeitszeit_2[0].#area[0].Z${rowNum}S1[0]`);
            const calendarWeekField = form.getField(`Arbeitsbescheinigung[0].Seite1[0].Angaben_Arbeitszeit_2[0].#area[0].Z${rowNum}S2[0]`);
            const totalHoursField = form.getField(`Arbeitsbescheinigung[0].Seite1[0].Angaben_Arbeitszeit_2[0].#area[0].Z${rowNum}S3[0]`);
            
            // Fill start date (S1 - "vom")
            if (startDateField instanceof PDFTextField && week.startDate) {
              startDateField.setText(week.startDate);
            }
            
            // Fill calendar week number (S2 - "Kalenderwoche") 
            if (calendarWeekField instanceof PDFTextField && week.calendarWeek) {
              calendarWeekField.setText(String(week.calendarWeek));
            }

            // Fill daily hours and calculate total
            const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            let totalWeekHours = 0;
            
            dayKeys.forEach((dayKey, dayIndex) => {
              try {
                const columnIndex = 4 + dayIndex; // S4 to S10
                const dayField = form.getField(`Arbeitsbescheinigung[0].Seite1[0].Angaben_Arbeitszeit_2[0].#area[0].Z${rowNum}S${columnIndex}[0]`);
                if (dayField instanceof PDFTextField) {
                  const hours = week.hours[dayKey] || 0;
                  totalWeekHours += hours;
                  if (hours > 0) {
                    dayField.setText(String(hours));
                  }
                }
              } catch (e) {
                // Day field doesn't exist or error
              }
            });
            
            // Fill total hours (S3 - "Arbeitsstunden insgesamt")
            if (totalHoursField instanceof PDFTextField && totalWeekHours > 0) {
              totalHoursField.setText(String(totalWeekHours));
            }
          } catch (e) {
            console.log(`Error filling week ${rowNum}:`, e instanceof Error ? e.message : 'Unknown error');
          }
        });
      }
    } catch (error) {
      console.error('Error filling working time fields:', error);
    }
  }

  private fillIncomeFields(form: PDFForm, income: any) {
    try {
      console.log('=== Filling Income Fields ===');
      console.log('Income data received:', JSON.stringify(income, null, 2));
      
      if (income.type === 'existing' && income.existingActivity) {
        // Section 3.1 - Existing activity
        if (income.existingActivity.scope === 'same') {
          try {
            const sameField = form.getField('Arbeitsbescheinigung[0].Seite1[0].Angaben_Einkommen_3_1[0].Ja-Nein-3-1[0]');
            if (sameField instanceof PDFCheckBox) {
              sameField.check();
            }
          } catch (e) {}
        }

        if (income.existingActivity.isUnchanged) {
          try {
            const unchangedField = form.getField('Arbeitsbescheinigung[0].Seite1[0].Angaben_Einkommen_3_1[0].Ja-Nein-3-1a[0]');
            if (unchangedField instanceof PDFCheckBox) {
              unchangedField.check();
            }
          } catch (e) {}
        }

        if (income.existingActivity.monthlyIncome) {
          try {
            const incomeField = form.getField('Arbeitsbescheinigung[0].Seite1[0].Angaben_Einkommen_3_1[0].Wenn_ja_Höhe_der_Einnahme[0]');
            if (incomeField instanceof PDFTextField) {
              incomeField.setText(String(income.existingActivity.monthlyIncome));
            }
          } catch (e) {}
        }
      } else if (income.type === 'new' && income.newActivity) {
        // Section 3.2 - New activity
        if (income.newActivity.expectedIncome === 'low') {
          try {
            const lowIncomeField = form.getField('Arbeitsbescheinigung[0].Seite2[0].#subform[0].Ja-Nein-4[0]');
            if (lowIncomeField instanceof PDFCheckBox) {
              lowIncomeField.check();
            }
          } catch (e) {}
        } else {
          try {
            const highIncomeField = form.getField('Arbeitsbescheinigung[0].Seite2[0].#subform[0].Ja-Nein-4[1]');
            if (highIncomeField instanceof PDFCheckBox) {
              highIncomeField.check();
            }
          } catch (e) {}
        }
      } else if (income.type === 'detailed' && income.detailedInfo) {
        // Section 3.3 - Detailed income section
        const detailedMappings = {
          'Arbeitsbescheinigung[0].Seite2[0].Einnahme_monatlich-EUR[0]': income.detailedInfo.monthlyIncome,
          'Arbeitsbescheinigung[0].Seite2[0].Betriebsausgaben-EUR[0]': income.detailedInfo.businessExpenses,
          'Arbeitsbescheinigung[0].Seite2[0].Absetzung_fuer_Abnutzung-EUR[0]': income.detailedInfo.depreciation,
          'Arbeitsbescheinigung[0].Seite2[0].Einkommensteuer-EUR[0]': income.detailedInfo.incomeTax,
          'Arbeitsbescheinigung[0].Seite2[0].Kirchensteuer-EUR[0]': income.detailedInfo.churchTax,
          'Arbeitsbescheinigung[0].Seite2[0].Solidaritätszuschlag-EUR[0]': income.detailedInfo.solidarityTax,
        };

        Object.entries(detailedMappings).forEach(([fieldName, value]) => {
          try {
            const field = form.getField(fieldName);
            if (field && value !== null && value !== undefined) {
              if (field instanceof PDFTextField) {
                field.setText(String(value));
                console.log(`✓ Filled ${fieldName}: ${value}`);
              }
            } else {
              console.log(`⚠ Skipped ${fieldName}: field=${!!field}, value=${value}`);
            }
          } catch (e) {
            console.log(`✗ Error filling ${fieldName}:`, e instanceof Error ? e.message : 'Unknown error');
          }
        });

        // Handle expense treatment
        if (income.detailedInfo.expenseTreatment === 'flat') {
          try {
            const flatField = form.getField('Arbeitsbescheinigung[0].Seite2[0].Ja-Nein-5[0]');
            if (flatField instanceof PDFCheckBox) {
              flatField.check();
              console.log('✓ Checked flat expense treatment');
            }
          } catch (e) {}
        } else {
          try {
            const detailedField = form.getField('Arbeitsbescheinigung[0].Seite2[0].Ja-Nein-5[1]');
            if (detailedField instanceof PDFCheckBox) {
              detailedField.check();
              console.log('✓ Checked detailed expense treatment');
            }
          } catch (e) {}
        }

        // Handle tax-related questions
        // Ja-Nein-6: "Der Einkommensteuerbescheid für das Kalenderjahr"
        // Ja-Nein-7: "Die Einkommensteuererklärung für das letzte Kalenderjahr wurde abgegeben."
        // Ja-Nein-8: "Eine Einkommensteuererklärung für das letzte Kalenderjahr ist beigefügt."
        
        // Tax return submitted (Ja-Nein-7)
        if (income.detailedInfo.taxReturnSubmitted) {
          try {
            const taxReturnField = form.getField('Arbeitsbescheinigung[0].Seite2[0].Ja-Nein-7[0]');
            if (taxReturnField instanceof PDFCheckBox) {
              taxReturnField.check();
              console.log('✓ Checked tax return submitted');
            }
          } catch (e) {
            console.log('✗ Error checking tax return submitted:', e instanceof Error ? e.message : 'Unknown error');
          }
        }

        // Tax assessment attached (Ja-Nein-8)
        if (income.detailedInfo.taxAssessmentAttached) {
          try {
            const taxAssessmentField = form.getField('Arbeitsbescheinigung[0].Seite2[0].Ja-Nein-8[0]');
            if (taxAssessmentField instanceof PDFCheckBox) {
              taxAssessmentField.check();
              console.log('✓ Checked tax assessment attached');
            }
          } catch (e) {
            console.log('✗ Error checking tax assessment attached:', e instanceof Error ? e.message : 'Unknown error');
          }
        }
      }
    } catch (error) {
      console.error('Error filling income fields:', error);
    }
  }

  private markDeclarationConfirmed(form: PDFForm) {
    try {
      // Add signature placeholder and date using actual PDF field names
      const today = new Date().toLocaleDateString('de-DE');
      
      try {
        const dateField = form.getField('Arbeitsbescheinigung[0].Seite2[0].Datum-unten[0]');
        if (dateField instanceof PDFTextField) {
          dateField.setText(today);
        }
      } catch (e) {}

      try {
        const locationField = form.getField('Arbeitsbescheinigung[0].Seite2[0].Ort-unten[0]');
        if (locationField instanceof PDFTextField) {
          locationField.setText('[Digitale Bestätigung]');
        }
      } catch (e) {}
    } catch (error) {
      console.error('Error marking declaration confirmed:', error);
    }
  }
}