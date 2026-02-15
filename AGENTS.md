# AGENTS.md

## Project: Expense Flow

An expense tracking application built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: Sonner

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Auth routes (login, signup, forgot-password)
│   └── (dashboard)/       # Dashboard routes (expenses, bills, etc.)
├── components/
│   ├── layout/            # Layout components (Header, Sidebar)
│   └── ui/                # UI components (Button, Input, Card, etc.)
├── lib/                   # Utilities and stores
├── styles/                # Global styles and design tokens
└── types/                 # TypeScript types
```

## Code Style

- Use TypeScript for all files
- Follow existing component patterns
- Use CSS modules for component-specific styles
- Import design tokens from `styles/design-tokens.css`

## Database

Using Supabase for backend (PostgreSQL).

### Setup
1. Copy `.env.local.example` to `.env.local`
2. Add your Supabase credentials
3. Run `supabase/schema.sql` in Supabase SQL Editor

### Tables
- profiles (extends auth.users)
- workspaces
- workspace_members
- expenses
- expense_reports
- categories
- receipts
- invoices
- bills
- chats
- notifications

## API Routes

- `/api/expenses` - CRUD operations for expenses
- `/api/reports` - Expense reports
- `/api/workspace` - Workspace management
- `/api/categories` - Expense categories
- `/api/invoices` - Invoice management
- `/api/bills` - Bill management

## Supabase Clients

- **Server**: `src/lib/supabase/server.ts` - For API routes and server components
- **Browser**: `src/lib/supabase/client-browser.ts` - For client components
- **Middleware**: `src/lib/supabase/middleware.ts` - For auth middleware

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
