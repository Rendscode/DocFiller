# Overview

This is a modern full-stack web application built for automatically filling German employment office forms (Arbeitsamt-Formulare), specifically the "Erklärung zu Einkünften aus selbstständiger Arbeit" form. The system features a React-based frontend with a robust multi-section form management system and an Express.js backend that handles form data persistence and precise PDF generation using the original form template. Version 1.0 includes complete checkbox mapping, conditional logic, and comprehensive field validation.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Styling**: Tailwind CSS with CSS variables for theming

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API structure
- **PDF Processing**: pdf-lib for PDF form filling and generation
- **Session Management**: Built-in session handling for user identification

## Database Strategy
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Centralized schema definitions in shared directory
- **Migrations**: Drizzle Kit for database migrations
- **Current State**: In-memory storage implementation with interface for easy database integration

# Key Components

## Form Management System
- **Multi-step Form**: Progressive form filling with sections for master data, general info, working time, and income
- **Auto-save**: Local storage integration for draft persistence
- **Validation**: Comprehensive Zod schemas for client-side and server-side validation
- **Progress Tracking**: Visual progress indicators and section completion status

## PDF Generation Pipeline
- **Form Filling**: Automated PDF form field population using pdf-lib
- **Template System**: Original PDF form templates with field mapping
- **Generation Service**: Centralized PDF service for consistent document creation
- **Download Management**: Direct PDF download with proper content headers

## UI Component Library
- **Design System**: Complete shadcn/ui implementation with customizable themes
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Accessibility**: ARIA compliant components with keyboard navigation
- **Form Components**: Specialized form controls for different input types

# Data Flow

## Client-Side Flow
1. User loads application and existing data is retrieved from localStorage
2. Form sections are rendered progressively with validation
3. Data changes trigger auto-save to localStorage and optional server sync
4. PDF generation requests are sent to backend with complete form data
5. Generated PDFs are downloaded directly to user's device

## Server-Side Flow
1. API endpoints receive form data and validate against shared schemas
2. Form submissions are stored using the storage interface (currently in-memory)
3. PDF generation service processes form data and fills template documents
4. Completed PDFs are returned as binary streams to the client

## Data Persistence
- **Local Storage**: Draft data persistence for offline capability
- **Server Storage**: Interface-based storage for easy database integration
- **Session Management**: User identification for data association

# External Dependencies

## Core Libraries
- **React Ecosystem**: React, React DOM, React Hook Form
- **UI Framework**: Radix UI primitives, Lucide React icons
- **Validation**: Zod for schema validation
- **HTTP Client**: Native fetch with TanStack Query
- **PDF Processing**: pdf-lib for document manipulation
- **Date Handling**: date-fns for calendar and date utilities

## Build and Development
- **Vite**: Fast build tool with HMR
- **TypeScript**: Type safety across the entire stack
- **ESBuild**: Fast JavaScript bundling
- **PostCSS**: CSS processing with Tailwind
- **Replit Integration**: Development environment plugins

## Database and ORM
- **Drizzle ORM**: Type-safe database queries
- **@neondatabase/serverless**: Serverless database driver
- **PostgreSQL**: Target database system

# Deployment Strategy

## Development
- **Replit Environment**: Optimized for Replit development with specific plugins
- **Hot Reload**: Vite HMR for fast development cycles
- **Error Handling**: Runtime error overlay for debugging
- **Development Server**: Express server with Vite middleware integration

## Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: ESBuild compiles TypeScript server to `dist/index.js`
- **Static Assets**: Frontend assets served by Express in production
- **Environment Variables**: Database URL and other config via environment

## Database Setup
- **Migration System**: Drizzle Kit handles schema migrations
- **Connection**: PostgreSQL via environment variable `DATABASE_URL`
- **Schema**: Centralized in `shared/schema.ts` for type safety

# Changelog

```
Version 1.0 - July 16, 2025
✓ Complete PDF form filling implementation with original form template
✓ Comprehensive checkbox mapping for all Yes/No fields (Ja-Nein-3-1 through Ja-Nein-8)
✓ Conditional logic for section 3.3 based on user selections in sections 3.1 and 3.2
✓ Proper radio button behavior in section 3.2 with exclusive selection
✓ Income field conditional filling based on unchanged status
✓ Location mapping from general info to declaration section
✓ Complete tax-related field mapping with proper conditional logic
✓ Calendar week-based working time input with decimal hour format
✓ Master data persistence for form reuse
✓ Auto-save functionality with localStorage integration

Previous:
- June 30, 2025. Initial setup
```

# User Preferences

```
Preferred communication style: Simple, everyday language.
```