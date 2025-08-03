# Cron Task Management System

## Overview

This is a full-stack web application for managing cron tasks with real-time monitoring capabilities. The system provides a dashboard for creating, scheduling, and monitoring automated tasks with comprehensive logging and statistics. Built with modern web technologies, it features a React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Real-time Communication**: WebSocket server for live updates
- **Task Scheduling**: node-cron for cron job management
- **Authentication**: API key-based authentication middleware

### Database Design
- **Database**: PostgreSQL with Neon serverless driver
- **Schema Management**: Drizzle Kit for migrations
- **Tables**: 
  - Users table for authentication
  - Cron tasks table for job definitions and metadata
  - Activity logs table for execution history and events
- **Relationships**: Foreign key relationships between tasks and logs

### Key Features
- **Task Management**: CRUD operations for cron tasks with validation
- **Real-time Monitoring**: WebSocket connections for live log streaming
- **Dashboard Statistics**: Real-time metrics for active/paused tasks and execution counts
- **Activity Logging**: Comprehensive logging of task events and execution results
- **Responsive Design**: Mobile-friendly interface with adaptive layouts

### Security & API Design
- **API Protection**: All endpoints protected with API key authentication
- **Input Validation**: Zod schemas for request/response validation
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **CORS**: Configured for cross-origin requests

### Development Features
- **Hot Reloading**: Vite development server with HMR
- **Type Safety**: End-to-end TypeScript with shared types
- **Code Quality**: ESLint and TypeScript strict mode
- **Build System**: Separate build processes for client and server

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18 with hooks, React DOM, React Router (Wouter)
- **Backend Framework**: Express.js with TypeScript support
- **Build Tools**: Vite for frontend, esbuild for backend bundling

### Database & ORM
- **Database Driver**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Connection Pooling**: Built-in connection pooling with Neon

### UI & Styling
- **Component Library**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with PostCSS processing
- **Icons**: Font Awesome (referenced in components)
- **Animations**: Class Variance Authority for component variants

### State Management & Data Fetching
- **Server State**: TanStack React Query for API state management
- **Form Management**: React Hook Form with Hookform Resolvers
- **Validation**: Zod for schema validation and type inference

### Real-time & Task Scheduling
- **WebSockets**: ws library for WebSocket server implementation
- **Cron Scheduling**: node-cron for job scheduling
- **Date Utilities**: date-fns for date manipulation

### Development & Deployment
- **TypeScript**: Full TypeScript support across the stack
- **Session Management**: connect-pg-simple for PostgreSQL session store
- **Development Tools**: Replit-specific plugins for enhanced development experience