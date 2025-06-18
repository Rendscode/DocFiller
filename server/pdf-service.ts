import { PDFDocument, PDFForm, PDFTextField, PDFCheckBox } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { FormData } from '@shared/schema';

export class PDFService {
  private originalPdfPath: string;

  constructor() {
    this.originalPdfPath = path.join(__dirname, 'assets', 'original-form.pdf');
  }

  async fillForm(formData: FormData): Promise<Uint8Array> {
    try {
      // Read the original PDF form
      const existingPdfBytes = fs.readFileSync(this.originalPdfPath);
      
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      
      // Get the form from the PDF
      const form = pdfDoc.getForm();
      
      // Fill master data fields
      this.fillMasterDataFields(form, formData.masterData);
      
      // Fill general info fields
      this.fillGeneralInfoFields(form, formData.generalInfo);
      
      // Fill working time fields
      this.fillWorkingTimeFields(form, formData.workingTime);
      
      // Fill income fields
      this.fillIncomeFields(form, formData.income);
      
      // Mark declaration as confirmed
      if (formData.declarationConfirmed) {
        this.markDeclarationConfirmed(form);
      }
      
      // Flatten the form to prevent further editing
      form.flatten();
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      return pdfBytes;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  private fillMasterDataFields(form: PDFForm, masterData: any) {
    try {
      // Use actual field names from the PDF form
      const fieldMappings = {
        'Arbeitsbescheinigung[0].Seite1[0].Kundennummer[0]': masterData.customerNumber,
        'Arbeitsbescheinigung[0].Seite1[0].Name_Vorname[0]': `${masterData.lastName}, ${masterData.firstName}`,
        'Arbeitsbescheinigung[0].Seite1[0].Geburtsdatum[0]': masterData.birthDate,
        'Arbeitsbescheinigung[0].Seite1[0].Straße_Haus-Nr\.[0]': masterData.street,
        'Arbeitsbescheinigung[0].Seite1[0].Postleitzahl_Wohnort[0]': `${masterData.postalCode} ${masterData.city}`,
      };

      // Fill fields that exist in the form
      Object.entries(fieldMappings).forEach(([fieldName, value]) => {
        try {
          const field = form.getField(fieldName);
          if (field && value) {
            if (field instanceof PDFTextField) {
              field.setText(String(value));
            }
          }
        } catch (e) {
          console.log(`Field not found or error: ${fieldName}`, e.message);
        }
      });
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
          console.log(`Field not found or error: ${fieldName}`, e.message);
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
          console.log('Indefinite checkbox not found:', e.message);
        }
      }
    } catch (error) {
      console.error('Error filling general info fields:', error);
    }
  }

  private fillWorkingTimeFields(form: PDFForm, workingTime: any) {
    try {
      if (workingTime.type === 'constant') {
        // Fill constant working hours
        try {
          const constantField = form.getField('gleichbleibend_ja');
          if (constantField instanceof PDFCheckBox) {
            constantField.check();
          }
          
          const hoursField = form.getField('Stundenzahl_wöchentlich');
          if (hoursField instanceof PDFTextField) {
            hoursField.setText(String(workingTime.constantHours || 0));
          }
        } catch (e) {
          // Fields don't exist
        }
      } else if (workingTime.type === 'variable' && workingTime.calendarWeeks) {
        // Fill variable working hours
        try {
          const variableField = form.getField('gleichbleibend_nein');
          if (variableField instanceof PDFCheckBox) {
            variableField.check();
          }
        } catch (e) {
          // Field doesn't exist
        }

        // Fill calendar weeks (up to 5)
        workingTime.calendarWeeks.slice(0, 5).forEach((week: any, index: number) => {
          const rowNum = index + 1;
          try {
            // Fill week dates
            const startDateField = form.getField(`vom_${rowNum}`);
            const endDateField = form.getField(`bis_${rowNum}`);
            const calendarWeekField = form.getField(`KW_${rowNum}`);
            
            if (startDateField instanceof PDFTextField) {
              startDateField.setText(week.startDate);
            }
            if (endDateField instanceof PDFTextField) {
              endDateField.setText(week.endDate);
            }
            if (calendarWeekField instanceof PDFTextField) {
              calendarWeekField.setText(String(week.calendarWeek));
            }

            // Fill daily hours
            const days = ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'];
            const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            
            days.forEach((day, dayIndex) => {
              try {
                const dayField = form.getField(`${day}_${rowNum}`);
                if (dayField instanceof PDFTextField) {
                  const hours = week.hours[dayKeys[dayIndex]] || 0;
                  if (hours > 0) {
                    dayField.setText(String(hours));
                  }
                }
              } catch (e) {
                // Day field doesn't exist
              }
            });

            // Calculate and fill total hours
            const totalHours = Object.values(week.hours).reduce((sum: number, h: any) => sum + (h || 0), 0);
            try {
              const totalField = form.getField(`gesamt_${rowNum}`);
              if (totalField instanceof PDFTextField) {
                totalField.setText(String(totalHours));
              }
            } catch (e) {
              // Total field doesn't exist
            }
          } catch (e) {
            console.error(`Error filling week ${rowNum}:`, e);
          }
        });
      }
    } catch (error) {
      console.error('Error filling working time fields:', error);
    }
  }

  private fillIncomeFields(form: PDFForm, income: any) {
    try {
      if (income.type === 'existing' && income.existingActivity) {
        // Fill existing activity section
        if (income.existingActivity.scope === 'same') {
          try {
            const sameField = form.getField('gleicher_Umfang_ja');
            if (sameField instanceof PDFCheckBox) {
              sameField.check();
            }
          } catch (e) {}
        }

        if (income.existingActivity.isUnchanged) {
          try {
            const unchangedField = form.getField('unverändert_ja');
            if (unchangedField instanceof PDFCheckBox) {
              unchangedField.check();
            }
          } catch (e) {}
        }

        if (income.existingActivity.monthlyIncome) {
          try {
            const incomeField = form.getField('Höhe_Einnahmen_monatlich');
            if (incomeField instanceof PDFTextField) {
              incomeField.setText(String(income.existingActivity.monthlyIncome));
            }
          } catch (e) {}
        }
      } else if (income.type === 'new' && income.newActivity) {
        // Fill new activity section
        if (income.newActivity.expectedIncome === 'low') {
          try {
            const lowIncomeField = form.getField('bis_165_ja');
            if (lowIncomeField instanceof PDFCheckBox) {
              lowIncomeField.check();
            }
          } catch (e) {}
        } else {
          try {
            const highIncomeField = form.getField('über_165_ja');
            if (highIncomeField instanceof PDFCheckBox) {
              highIncomeField.check();
            }
          } catch (e) {}
        }
      } else if (income.type === 'detailed' && income.detailedInfo) {
        // Fill detailed income section
        const detailedMappings = {
          'Einnahmen_monatlich': income.detailedInfo.monthlyIncome,
          'Ausgaben': income.detailedInfo.businessExpenses,
          'Abschreibung': income.detailedInfo.depreciation,
          'Einkommensteuer': income.detailedInfo.incomeTax,
          'Kirchensteuer': income.detailedInfo.churchTax,
          'Solidaritätszuschlag': income.detailedInfo.solidarityTax,
        };

        Object.entries(detailedMappings).forEach(([fieldName, value]) => {
          try {
            const field = form.getField(fieldName);
            if (field && value) {
              if (field instanceof PDFTextField) {
                field.setText(String(value));
              }
            }
          } catch (e) {}
        });

        // Handle expense treatment
        if (income.detailedInfo.expenseTreatment === 'flat') {
          try {
            const flatField = form.getField('30_Prozent_ja');
            if (flatField instanceof PDFCheckBox) {
              flatField.check();
            }
          } catch (e) {}
        }
      }
    } catch (error) {
      console.error('Error filling income fields:', error);
    }
  }

  private markDeclarationConfirmed(form: PDFForm) {
    try {
      // Add signature placeholder and date
      const today = new Date().toLocaleDateString('de-DE');
      
      try {
        const dateField = form.getField('Datum');
        if (dateField instanceof PDFTextField) {
          dateField.setText(today);
        }
      } catch (e) {}

      try {
        const signatureField = form.getField('Unterschrift');
        if (signatureField instanceof PDFTextField) {
          signatureField.setText('[Digitale Bestätigung der Richtigkeit]');
        }
      } catch (e) {}
    } catch (error) {
      console.error('Error marking declaration confirmed:', error);
    }
  }
}