
# Technische Dokumentation: Document Automator

## 1. App-Zweck und Zielgruppe

### Zweck
Diese Web-Anwendung automatisiert das Ausfüllen des deutschen Arbeitsamt-Formulars "Erklärung zu Einkünften aus selbstständiger Arbeit". Die App ermöglicht es Benutzern, ihre Daten in einem benutzerfreundlichen Web-Interface einzugeben und automatisch ein korrekt ausgefülltes PDF-Dokument zu generieren.

### Zielgruppe
- Selbstständige, die dem Arbeitsamt Einkünfte melden müssen
- Personen mit begrenzten PDF-Bearbeitungskenntnissen
- Nutzer, die Zeit beim Ausfüllen von Behördenformularen sparen möchten

### Hauptfunktionen
- Mehrstufiges Formular mit Validierung
- Automatische PDF-Generierung aus Originaldokument
- Lokale Datenspeicherung (Auto-Save)
- Responsive Design für Desktop und Mobile

## 2. Verwendete Technologien

### Frontend
- **React 18** - Moderne JavaScript-Bibliothek für Benutzeroberflächen
- **TypeScript** - Typsichere JavaScript-Entwicklung
- **Vite** - Schnelles Build-Tool und Entwicklungsserver
- **Tailwind CSS** - Utility-First CSS-Framework
- **shadcn/ui** - Komponentenbibliothek basierend auf Radix UI
- **React Hook Form** - Formular-Management
- **Zod** - Schema-Validierung
- **TanStack Query** - Server-State Management
- **Wouter** - Leichtgewichtiges Routing

### Backend
- **Node.js** - JavaScript-Laufzeitumgebung
- **Express.js** - Web-Framework für Node.js
- **TypeScript** - Typsichere Backend-Entwicklung
- **pdf-lib** - PDF-Manipulation und -Generierung

### Build & Development
- **ESBuild** - Schneller JavaScript-Bundler
- **PostCSS** - CSS-Verarbeitung
- **Drizzle ORM** - Typ-sichere Datenbankabfragen (vorbereitet)

### Deployment
- **Replit** - Cloud-Entwicklung und Hosting
- **PostgreSQL** - Datenbank (konfiguriert, aber noch nicht aktiv genutzt)

## 3. Projektstruktur

```
document-automator/
├── client/                 # Frontend-Anwendung
│   ├── src/
│   │   ├── components/     # React-Komponenten
│   │   │   ├── ui/        # Basis-UI-Komponenten (shadcn/ui)
│   │   │   ├── *-form.tsx # Formular-Abschnitte
│   │   │   └── navigation-sidebar.tsx
│   │   ├── hooks/         # Custom React Hooks
│   │   ├── lib/           # Utility-Funktionen
│   │   ├── pages/         # Seiten-Komponenten
│   │   ├── types/         # TypeScript-Typdefinitionen
│   │   ├── App.tsx        # Haupt-App-Komponente
│   │   └── main.tsx       # App-Einstiegspunkt
│   └── index.html         # HTML-Template
├── server/                # Backend-Anwendung
│   ├── assets/           # Server-seitige Assets (PDF-Vorlagen)
│   ├── index.ts          # Server-Einstiegspunkt
│   ├── routes.ts         # API-Routen
│   ├── pdf-service.ts    # PDF-Generierungslogik
│   ├── storage.ts        # Datenspeicherung (Interface)
│   └── vite.ts           # Vite-Integration
├── shared/               # Geteilte Typen und Schemas
│   └── schema.ts         # Zod-Schemas für Validierung
├── assets/               # Statische Assets (PDF-Vorlagen)
└── Konfigurationsdateien (.replit, package.json, etc.)
```

### Wichtige Dateien
- **`server/index.ts`** - Server-Startup und Middleware-Konfiguration
- **`server/routes.ts`** - API-Endpunkte für Formular und PDF-Generierung
- **`server/pdf-service.ts`** - Kernlogik für PDF-Bearbeitung
- **`shared/schema.ts`** - Zentrale Datenvalidierung
- **`client/src/App.tsx`** - Frontend-Routing und Layout

## 4. Funktionen & Logik

### Frontend-Komponenten

#### `client/src/App.tsx`
- **Zweck**: Haupt-App-Komponente mit Routing
- **Funktionen**: 
  - Client-seitiges Routing mit Wouter
  - Basis-Layout und Navigation
  - TanStack Query Provider Setup

#### `client/src/pages/form-filler.tsx`
- **Zweck**: Hauptseite mit mehrstufigem Formular
- **Funktionen**:
  - Steuerung der Formular-Abschnitte
  - Auto-Save in LocalStorage
  - PDF-Generierung triggern

#### Formular-Komponenten
- **`master-data-form.tsx`** - Persönliche Daten (Name, Adresse, etc.)
- **`general-info-form.tsx`** - Allgemeine Tätigkeitsinformationen
- **`working-time-form.tsx`** - Arbeitszeiten (konstant oder variabel)
- **`income-form.tsx`** - Einkommensangaben mit automatischen Berechnungen

#### `navigation-sidebar.tsx`
- **Zweck**: Seitennavigation mit Fortschrittsanzeige
- **Funktionen**:
  - Abschnitts-Navigation
  - Validierungsstatus-Anzeige
  - Aktionen (Speichern, PDF generieren)

### Backend-Logik

#### `server/routes.ts`
- **API-Endpunkte**:
  - `GET /api/form/:userId` - Formulardaten abrufen
  - `POST /api/form` - Formulardaten speichern/aktualisieren
  - `POST /api/generate-pdf` - PDF generieren
  - `GET /api/debug/filesystem` - Debug-Informationen

#### `server/pdf-service.ts`
- **Zweck**: PDF-Manipulation mit pdf-lib
- **Funktionen**:
  - PDF-Vorlage laden
  - Formularfelder automatisch ausfüllen
  - Berechnungen (Einkommen, Steuern)
  - PDF-Bytes zurückgeben

#### `server/storage.ts`
- **Zweck**: Daten-Persistierung Interface
- **Aktuell**: In-Memory-Speicherung
- **Geplant**: PostgreSQL-Integration

### Validierung & Schemas

#### `shared/schema.ts`
- **Zweck**: Zentrale Datenvalidierung mit Zod
- **Schemas**:
  - `masterDataSchema` - Persönliche Daten
  - `generalInfoSchema` - Tätigkeitsinformationen
  - `workingTimeSchema` - Arbeitszeiten
  - `incomeSchema` - Einkommensangaben
  - `formDataSchema` - Gesamtes Formular

## 5. Datenmodell

### Formulardaten-Struktur

```typescript
interface FormData {
  masterData: {
    customerNumber: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    street: string;
    postalCode: string;
    city: string;
  };
  generalInfo: {
    activityStartDate: string;
    activityEndDate?: string;
    isIndefinite: boolean;
    activityLocation: string;
    activityType: string;
  };
  workingTime: {
    type: "constant" | "variable";
    constantHours?: number;
    calendarWeeks?: Array<CalendarWeek>;
  };
  income: {
    type: "existing" | "new" | "detailed";
    // Verschiedene Sub-Objekte je nach Typ
  };
}
```

### Datenspeicherung

#### Aktuelle Implementierung
- **Client-seitig**: LocalStorage für Auto-Save
- **Server-seitig**: In-Memory-Speicher (temporär)

#### Geplante Datenbank-Struktur
```sql
-- Tabelle: form_submissions
id: serial (Primärschlüssel)
user_id: text (Benutzer-ID)
form_data: jsonb (Komplette Formulardaten)
created_at: text (Erstellungsdatum)
updated_at: text (Änderungsdatum)
```

### API-Datenfluss
1. **Speichern**: `POST /api/form` → Validierung → Storage
2. **Laden**: `GET /api/form/:userId` → Storage → JSON
3. **PDF**: `POST /api/generate-pdf` → PDF-Service → Binary Data

## 6. Integrationen

### PDF-Generierung
- **Bibliothek**: pdf-lib
- **Prozess**:
  1. Original-PDF laden (`assets/original-form.pdf`)
  2. Formularfelder identifizieren
  3. Daten in Felder eintragen
  4. PDF als Byte-Array zurückgeben

### Geplante Integrationen
- **Replit Auth** - Benutzerauthentifizierung
- **PostgreSQL** - Persistente Datenspeicherung
- **Email-Service** - PDF-Versand per E-Mail

### Externe Dependencies
- **Keine aktuellen API-Integrationen**
- **Offline-fähig** (außer PDF-Generierung)

## 7. Besonderheiten und Erweiterungsmöglichkeiten

### Aktuelle Besonderheiten
- **Responsive Design** - Mobile-first Ansatz
- **Auto-Save** - Automatische Speicherung in LocalStorage
- **Typsicherheit** - Vollständige TypeScript-Abdeckung
- **Modulare Architektur** - Einfache Erweiterbarkeit

### Mögliche Erweiterungen

#### Kurzfristig
- **Benutzerauthentifizierung** mit Replit Auth
- **Datenbank-Integration** (PostgreSQL)
- **Verbessertes Error-Handling**
- **PDF-Vorschau** vor Download

#### Mittelfristig
- **Mehrere Formular-Templates**
- **E-Mail-Versand** von PDFs
- **Daten-Export** (JSON, CSV)
- **Formulare teilen** zwischen Benutzern

#### Langfristig
- **KI-gestützte Datenvalidierung**
- **Automatische Steuerberechnung** mit aktuellen Sätzen
- **Integration mit Buchhaltungssoftware**
- **Mobile App** (React Native)

### Code-Qualität
- **ESLint** - Code-Qualitätsprüfung
- **TypeScript** - Statische Typenprüfung
- **Zod** - Runtime-Validierung
- **Konsistente Namenskonventionen**

## 8. Hinweise zur lokalen Weiterentwicklung

### Entwicklungsumgebung Setup

#### Voraussetzungen
- **Node.js** (Version 18+)
- **npm** oder **yarn**
- **Git** (für Versionskontrolle)

#### Erste Schritte auf Replit
1. **Projekt forken** oder öffnen
2. **Dependencies installieren**: `npm install`
3. **Entwicklungsserver starten**: `npm run dev`
4. **App aufrufen**: Port 5000 wird automatisch weitergeleitet

#### Lokale Entwicklung (außerhalb Replit)
```bash
# Repository klonen
git clone <repository-url>
cd document-automator

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev

# Production Build
npm run build
npm run start
```

### Wichtige Entwicklungs-Commands

```bash
# Entwicklung
npm run dev          # Start development server

# Build
npm run build        # Build für Production
npm run start        # Start production server

# Code-Qualität
npm run lint         # ESLint prüfen
npm run type-check   # TypeScript prüfen
```

### Datei-Bearbeitung Workflow

#### Neue Formular-Komponente hinzufügen
1. **Komponente erstellen**: `client/src/components/new-section-form.tsx`
2. **Schema erweitern**: `shared/schema.ts`
3. **Hauptformular anpassen**: `client/src/pages/form-filler.tsx`
4. **PDF-Service erweitern**: `server/pdf-service.ts`

#### API-Endpunkt hinzufügen
1. **Route definieren**: `server/routes.ts`
2. **Schema validieren**: `shared/schema.ts`
3. **Frontend-Integration**: Hook in `client/src/hooks/`

#### PDF-Feld mapping erweitern
1. **PDF analysieren**: `server/pdf-inspector.ts` nutzen
2. **Mapping hinzufügen**: `server/pdf-service.ts`
3. **Testen**: Debug-Route `/api/debug/filesystem` nutzen

### Debugging-Tipps

#### Entwicklungstools
- **Browser DevTools** - Console, Network, Elements
- **React DevTools** - Komponenten-State inspizieren
- **Replit Console** - Server-Logs anzeigen

#### Häufige Probleme
- **PDF-Pfad-Probleme**: Debug-Route nutzen
- **Validierungsfehler**: Console-Logs prüfen
- **Build-Fehler**: TypeScript-Fehler beheben

#### Debugging-Routes
- `/api/debug/filesystem` - Dateisystem-Informationen
- Browser Network-Tab für API-Calls

### Best Practices

#### Code-Organisation
- **Komponenten klein halten** (Single Responsibility)
- **Typen zentral definieren** (`shared/schema.ts`)
- **Konsistente Namenskonventionen** verwenden
- **Comments für komplexe Logik** schreiben

#### Performance
- **React.memo** für aufwendige Komponenten
- **useMemo/useCallback** für teure Berechnungen
- **Code-Splitting** für große Komponenten

#### Sicherheit
- **Input-Validierung** auf Client und Server
- **Keine sensiblen Daten** in LocalStorage
- **HTTPS** in Production (automatisch auf Replit)

### Hilfreiche Ressourcen
- **React Dokumentation**: https://react.dev
- **TypeScript Handbook**: https://typescriptlang.org
- **Tailwind CSS**: https://tailwindcss.com
- **pdf-lib Dokumentation**: https://pdf-lib.js.org
- **Replit Docs**: https://docs.replit.com

---

*Diese Dokumentation wurde automatisch generiert und sollte bei größeren Änderungen am Projekt aktualisiert werden.*
