# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **LLM Monitoring Dashboard** - a Next.js 14 application that tracks and logs LLM interactions (questions, answers, response times, tokens). It includes user authentication, admin user management, and rich filtering/logging capabilities.

## Commands

```bash
npm run dev          # Start development server on localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Admin scripts
npm run create-admin              # Create single admin user (prompts for details)
npm run create-admin multiple     # Create multiple users from CSV
```

## Architecture

### Stack
- **Framework:** Next.js 14 with App Router
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** Next-Auth.js v4 with Credentials Provider (JWT sessions)
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Alerts:** SweetAlert2

### Data Models

**User** (`models/User.ts`): `email`, `password` (bcrypt hashed), `fullname`, `role` ('user'|'admin'), `isActive`

**Log** (`models/Log.ts`): `requestId`, `applianceId`, `sessionId`, `deviceUDCID`, `homeId`, `prompt`, `response`, `skuNumber`, `timestamp`, `responseTime`, `model`, `tokensUsed`, `error`

### Authentication Flow
1. NextAuth handles sessions with JWT strategy (30-day expiry)
2. Middleware (`middleware.js`) protects `/dashboard/:path*` and `/profile/:path*`
3. Custom `AuthContext` (`context/AuthContext.tsx`) wraps session for login/logout
4. Session contains: `id`, `role`, `email`, `name`

### API Structure
- `/api/auth/[...nextauth]` - NextAuth handlers
- `/api/logs` - GET (fetch with filtering/pagination/sorting), DELETE (admin only)
- `/api/log` - POST (create log entry)
- `/api/users` - GET/PUT (list/update users)
- `/api/admin/users` - GET (admin only)
- `/api/setup` - Initial admin user creation

### Key Paths
- `app/` - Next.js App Router pages and API routes
- `lib/db.ts` - MongoDB connection with caching
- `lib/auth.ts` - NextAuth configuration
- `components/Dashboard.tsx` - Main dashboard component with filtering UI
- `scripts/` - Utility scripts (create-admin, seed-logs, etc.)

### Environment Variables
```
MONGODB_URI=<mongodb connection string>
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<secret>
JWT_SECRET=<secret>
```

### Docker Support
```bash
docker-compose up    # Starts MongoDB on port 27017 and Next.js on port 3000
```
MongoDB credentials: `admin` / `admin123`
