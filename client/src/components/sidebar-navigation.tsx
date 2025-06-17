import { CheckCircle, User, Briefcase, Clock, Euro, Save, Upload, Trash2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ElementType;
  completed?: boolean;
  variant?: boolean;
}

interface SidebarNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  completedSections: string[];
}

export default function SidebarNavigation({ 
  activeSection, 
  onSectionChange, 
  completedSections 
}: SidebarNavigationProps) {
  const navigationItems: NavigationItem[] = [
    { id: 'stammdaten', label: 'Stammdaten', icon: User, completed: completedSections.includes('stammdaten') },
    { id: 'allgemein', label: '1. Allgemeine Angaben', icon: Briefcase, completed: completedSections.includes('allgemein') },
    { id: 'arbeitszeit', label: '2. Arbeitszeit', icon: Clock, variant: true },
    { id: 'einkommen', label: '3. Einkommen', icon: Euro, variant: true },
  ];

  return (
    <Card className="sticky top-8">
      <CardContent className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Formular-Abschnitte</h2>
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
                {item.completed && (
                  <CheckCircle className="ml-auto h-4 w-4 text-green-500" />
                )}
                {item.variant && (
                  <span className="ml-auto text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                    Variabel
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </CardContent>
      
      <div className="border-t border-gray-200 p-6">
        <h3 className="font-medium text-gray-900 mb-3">Schnellaktionen</h3>
        <div className="space-y-2">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Save className="mr-2 h-4 w-4" />
            Entwurf speichern
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Upload className="mr-2 h-4 w-4" />
            Daten importieren
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Trash2 className="mr-2 h-4 w-4" />
            Formular zurücksetzen
          </Button>
        </div>
      </div>
    </Card>
  );
}
