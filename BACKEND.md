# Expense Flow - Backend Setup

This document describes the Supabase backend setup for the Expense Flow application.

## Prerequisites

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project
3. Get your project credentials from the project settings

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Database Setup

### Option 1: Using Supabase MCP

If you're using Supabase MCP, run the migration:

```bash
# Apply the schema
npx supabase migration up
```

### Option 2: Manual SQL Execution

1. Go to your Supabase project's SQL Editor
2. Open `supabase/schema.sql` from this project
3. Run the entire SQL file

## Database Schema

### Tables Created

1. **profiles** - User profiles extending auth.users
2. **workspaces** - Company/team workspaces
3. **workspace_members** - Workspace membership
4. **categories** - Expense categories
5. **expenses** - Individual expenses
6. **expense_reports** - Expense reports
7. **receipts** - Receipt images and OCR data
8. **chats** - Chat conversations
9. **chat_messages** - Individual chat messages
10. **invoices** - Invoices issued
11. **bills** - Bills received
12. **notifications** - User notifications
13. **tags** - Custom expense tags

### Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Workspace data is protected by membership checks
- Authentication is handled by Supabase Auth

## API Routes

### Expenses
- `GET /api/expenses` - List expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses/[id]` - Get expense
- `PATCH /api/expenses/[id]` - Update expense
- `DELETE /api/expenses/[id]` - Delete expense

### Reports
- `GET /api/reports` - List reports
- `POST /api/reports` - Create report
- `GET /api/reports/[id]` - Get report
- `PATCH /api/reports/[id]` - Update report
- `DELETE /api/reports/[id]` - Delete report

### Workspaces
- `GET /api/workspace` - List workspaces
- `POST /api/workspace` - Create workspace
- `GET /api/workspace/[id]` - Get workspace
- `PATCH /api/workspace/[id]` - Update workspace

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category

### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice

### Bills
- `GET /api/bills` - List bills
- `POST /api/bills` - Create bill

## Authentication Flow

1. User signs up/logs in via Supabase Auth
2. Profile is created/updated in the `profiles` table
3. Default workspace is created for new users
4. JWT token is stored in cookies
5. Middleware validates sessions on protected routes
6. API routes use server-side Supabase client

## Client Libraries

- `@supabase/supabase-js` - Main Supabase client
- `@supabase/ssr` - Server-side rendering support

## Client Usage

### Server Components / API Routes
```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
```

### Client Components
```typescript
import { createClient } from '@/lib/supabase/client-browser';

const supabase = createClient();
```

## Features

- ✅ Email/Password authentication
- ✅ Workspace management
- ✅ Expense tracking
- ✅ Expense reports
- ✅ Categories
- ✅ Row Level Security
- ✅ TypeScript types
- ✅ API routes
- ✅ Middleware protection

## Next Steps

1. Set up your Supabase project
2. Add environment variables
3. Run the database schema
4. Test the authentication flow
5. Start using the API!
