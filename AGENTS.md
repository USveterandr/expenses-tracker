# AGENTS.md

## Project: Expense Flow

An expense tracking application built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19, TypeScript 5
- **Styling**: Tailwind CSS 4, CSS Modules
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod 4
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Database**: Supabase (PostgreSQL)

## Build/Lint Commands

- `npm run dev` - Start development server (Turbopack enabled)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint -- --fix` - Auto-fix ESLint issues
- `npm run pages:build` - Build for Cloudflare Pages
- `npm run pages:deploy` - Deploy to Cloudflare Pages

## Code Style Guidelines

### TypeScript

- Enable `strict` mode (already configured in tsconfig.json)
- Use explicit return types on exported functions
- Prefer `interface` over `type` for object definitions
- Use PascalCase for types/interfaces, camelCase for variables/functions
- Avoid `any` - use `unknown` with type guards instead

### Imports

- Use `@/` path alias for imports from `src/`
- Group imports: React/Next → third-party → local modules → styles
- Use named exports for components, default exports for pages
- Import React hooks explicitly: `import { useState } from 'react'`

### Components

- Use function components with explicit props interface
- Add `'use client'` directive for client components
- Props interface should be named `{ComponentName}Props`
- Destructure props with defaults in function signature
- Use CSS Modules for component styles: `import styles from './Button.module.css'`

### Naming Conventions

- Components: PascalCase (e.g., `Button.tsx`)
- Files: PascalCase for components, camelCase for utilities
- Hooks: camelCase prefixed with `use` (e.g., `useAuthStore`)
- Stores: camelCase suffixed with `Store` (e.g., `authStore`)
- API routes: kebab-case (e.g., `route.ts` in `expenses/[id]/`)
- Types/Interfaces: PascalCase (e.g., `Expense`, `UserPreferences`)
- Constants: UPPER_SNAKE_CASE for true constants

### Error Handling

- Use try/catch for async operations
- Always handle Supabase errors explicitly
- Use early returns to reduce nesting
- Throw descriptive errors with context
- Never log secrets or API keys

### Styling

- Use Tailwind CSS utility classes for layout/styling
- Import design tokens: `@import "../styles/design-tokens.css"`
- Use CSS variables from design-tokens.css for consistency
- CSS Modules for component-specific styles
- Tailwind v4 syntax: `@import "tailwindcss"` in globals.css

### Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Auth routes (login, signup, forgot-password)
│   ├── (dashboard)/       # Dashboard routes (expenses, bills, etc.)
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/
│   ├── layout/            # Layout components (Header, Sidebar)
│   ├── providers/         # Context providers
│   └── ui/                # UI components (Button, Input, Card)
├── lib/                   # Utilities and stores
│   ├── stores/            # Zustand stores
│   ├── supabase/          # Supabase clients
│   └── utils/             # Helper functions
├── styles/                # Global styles and design tokens
└── types/                 # TypeScript types
```

### Supabase Clients

- **Server**: `src/lib/supabase/server.ts` - For API routes and server components
- **Browser**: `src/lib/supabase/client-browser.ts` - For client components
- **Middleware**: `src/lib/supabase/middleware.ts` - For auth middleware

### Database Tables

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

### Environment Variables

Copy `.env.local.example` to `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Security Best Practices

- Never expose service role key in client code
- Use CSP headers configured in next.config.ts
- Validate all inputs with Zod schemas
- Use Row Level Security (RLS) in Supabase
- Sanitize user inputs before rendering

### Performance

- Use React Server Components by default
- Add `'use client'` only when needed (hooks, browser APIs)
- Use `dynamic` imports for code splitting
- Prefer native CSS animations over JS when possible
- Use Next.js Image component for optimized images
