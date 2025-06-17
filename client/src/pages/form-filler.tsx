import { useState } from "react";
import { FileText, Download, Eye, Save, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useFormData } from "@/hooks/use-form-data";
import { generatePDF, downloadPDF } from "@/lib/pdf-utils";
import { clearAllData } from "@/lib/storage-utils";
import NavigationSidebar from "@/components/navigation-sidebar";
import ProgressBar from "@/components/progress-bar";
import MasterDataForm from "@/components/master-data-form";
import GeneralInfoForm from "@/components/general-info-form";
import WorkingTimeForm from "@/components/working-time-form";
import IncomeForm from "@/components/income-form";
import { FormData, MasterData, GeneralInfo, WorkingTime, Income } from "@shared/schema";

export default function FormFiller() {
  const [activeSection, setActiveSection] = useState("stammdaten");
  const [declarationConfirmed, setDeclarationConfirmed] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const { formData, updateFormData, saveForm, isLoading, isSaving } = useFormData();
  const { toast } = useToast();

  const handleMasterDataSubmit = (data: MasterData) => {
    updateFormData({ masterData: data });
    toast({
      title: "Stammdaten gespeichert",
      description: "Ihre Stammdaten wurden erfolgreich gespeichert.",
    });
  };

  const handleGeneralInfoSubmit = (data: GeneralInfo) => {
    updateFormData({ generalInfo: data });
    toast({
      title: "Allgemeine Angaben gespeichert",
      description: "Die allgemeinen Angaben zur Tätigkeit wurden gespeichert.",
    });
  };

  const handleWorkingTimeSubmit = (data: WorkingTime) => {
    updateFormData({ workingTime: data });
    toast({
      title: "Arbeitszeit gespeichert",
      description: "Die Arbeitszeitangaben wurden gespeichert.",
    });
  };

  const handleIncomeSubmit = (data: Income) => {
    updateFormData({ income: data });
    toast({
      title: "Einkommensangaben gespeichert",
      description: "Die Einkommensangaben wurden gespeichert.",
    });
  };

  const handleSaveDraft = async () => {
    try {
      await saveForm();
      toast({
        title: "Entwurf gespeichert",
        description: "Ihr Formular-Entwurf wurde erfolgreich gespeichert.",
      });
    } catch (error) {
      toast({
        title: "Fehler beim Speichern",
        description: "Der Entwurf konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const handleClearForm = () => {
    if (confirm("Möchten Sie wirklich alle Daten löschen? Diese Aktion kann nicht rückgängig gemacht werden.")) {
      clearAllData();
      window.location.reload();
    }
  };

  const handleGeneratePDF = async () => {
    if (!declarationConfirmed) {
      toast({
        title: "Bestätigung erforderlich",
        description: "Bitte bestätigen Sie die Richtigkeit Ihrer Angaben.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.masterData || !formData.generalInfo) {
      toast({
        title: "Unvollständige Angaben",
        description: "Bitte füllen Sie mindestens die Stammdaten und allgemeinen Angaben aus.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const completeFormData: FormData = {
        masterData: formData.masterData,
        generalInfo: formData.generalInfo,
        workingTime: formData.workingTime || { type: "constant", constantHours: 0, calendarWeeks: [] },
        income: formData.income || { type: "existing" },
        declarationConfirmed,
      };

      const pdfBlob = await generatePDF(completeFormData);
      downloadPDF(pdfBlob);
      
      toast({
        title: "PDF erstellt",
        description: "Das ausgefüllte Formular wurde erfolgreich heruntergeladen.",
      });
    } catch (error) {
      toast({
        title: "PDF-Erstellung fehlgeschlagen",
        description: "Es gab einen Fehler beim Erstellen des PDFs.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePreview = () => {
    // TODO: Implement preview functionality
    toast({
      title: "Vorschau",
      description: "Die Vorschau-Funktion wird in einer zukünftigen Version verfügbar sein.",
    });
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Formular wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">DocFiller</h1>
              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                Erklärung selbstständige Arbeit
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <HelpCircle className="mr-1 h-4 w-4" />
                Hilfe
              </Button>
              <Button onClick={handleGeneratePDF} disabled={isGeneratingPDF}>
                <Download className="mr-2 h-4 w-4" />
                {isGeneratingPDF ? "PDF wird erstellt..." : "PDF Erstellen"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <NavigationSidebar
              formData={formData}
              activeSection={activeSection}
              onSectionChange={scrollToSection}
              onSaveDraft={handleSaveDraft}
              onClearForm={handleClearForm}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Progress Bar */}
            <ProgressBar formData={formData} />

            {/* Form Sections */}
            <MasterDataForm
              data={formData.masterData}
              onSubmit={handleMasterDataSubmit}
              onAutoSave={(data) => updateFormData({ masterData: data })}
            />

            <GeneralInfoForm
              data={formData.generalInfo}
              onSubmit={handleGeneralInfoSubmit}
            />

            <WorkingTimeForm
              data={formData.workingTime}
              onSubmit={handleWorkingTimeSubmit}
            />

            <IncomeForm
              data={formData.income}
              onSubmit={handleIncomeSubmit}
            />

            {/* Final Actions */}
            <div className="form-section">
              <div className="form-section-content">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <Checkbox
                        checked={declarationConfirmed}
                        onCheckedChange={setDeclarationConfirmed}
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Ich versichere die Richtigkeit meiner Angaben
                      </span>
                    </label>
                  </div>
                  <div className="flex space-x-3">
                    <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? "Speichert..." : "Entwurf speichern"}
                    </Button>
                    <Button variant="outline" onClick={handlePreview}>
                      <Eye className="mr-2 h-4 w-4" />
                      Vorschau
                    </Button>
                    <Button onClick={handleGeneratePDF} disabled={isGeneratingPDF} className="bg-green-600 hover:bg-green-700">
                      <Download className="mr-2 h-4 w-4" />
                      {isGeneratingPDF ? "PDF wird erstellt..." : "PDF Erstellen"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
