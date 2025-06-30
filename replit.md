# Overview

This is a modern full-stack web application built for form filling and PDF generation. The system features a React-based frontend with a robust form management system and an Express.js backend that handles form data persistence and PDF generation capabilities. The application uses TypeScript throughout for type safety and includes comprehensive UI components built with shadcn/ui.

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
Changelog:
- June 30, 2025. Initial setup
```

# User Preferences

```
Preferred communication style: Simple, everyday language.
```