import { Check, User, Briefcase, Clock, Euro, Save, Upload, Trash2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormData } from "@shared/schema";

interface NavigationSidebarProps {
  formData: Partial<FormData>;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onSaveDraft: () => void;
  onClearForm: () => void;
}

export default function NavigationSidebar({
  formData,
  activeSection,
  onSectionChange,
  onSaveDraft,
  onClearForm,
}: NavigationSidebarProps) {
  const sections = [
    {
      id: "stammdaten",
      name: "Stammdaten",
      icon: User,
      completed: formData.masterData?.firstName && formData.masterData?.lastName,
    },
    {
      id: "allgemein",
      name: "1. Allgemeine Angaben",
      icon: Briefcase,
      completed: formData.generalInfo?.activityType,
    },
    {
      id: "arbeitszeit",
      name: "2. Arbeitszeit",
      icon: Clock,
      completed: formData.workingTime?.type,
      badge: formData.workingTime?.type === "variable" ? "Variabel" : undefined,
    },
    {
      id: "einkommen",
      name: "3. Einkommen",
      icon: Euro,
      completed: formData.income?.type,
      badge: formData.income?.type ? "Variabel" : undefined,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-8">
      <div className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Formular-Abschnitte</h2>
        <nav className="space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="mr-3 h-4 w-4" />
                <span className="flex-1 text-left">{section.name}</span>
                {section.completed && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
                {section.badge && (
                  <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                    {section.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
      
      <div className="border-t border-gray-200 p-6">
        <h3 className="font-medium text-gray-900 mb-3">Schnellaktionen</h3>
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={onSaveDraft}
          >
            <Save className="mr-2 h-4 w-4" />
            Entwurf speichern
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
          >
            <Upload className="mr-2 h-4 w-4" />
            Daten importieren
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-600 hover:text-red-700"
            onClick={onClearForm}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Formular zurücksetzen
          </Button>
        </div>
      </div>
    </div>
  );
}
