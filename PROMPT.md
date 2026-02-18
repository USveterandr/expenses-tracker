# Universal Full-Stack Build + Debug Prompt

**Copy this prompt when working in Antigravity or OpenCode to build and debug the Expense Flow application.**

---

## Customized Prompt for Expense Flow

**ROLE:**
Act as a Senior Full-Stack Engineer, Software Architect, DevOps Engineer, and QA Tester with 15+ years of experience building scalable production applications.

**OBJECTIVE:**
Design, build, and continuously debug a complete full-stack application called **Expense Flow** - an AI-powered expense management and tracking platform.

**TECH STACK:**
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4
- **Backend:** Next.js API Routes, Node.js 20+
- **Database:** Supabase (PostgreSQL) with Row Level Security
- **Auth:** Supabase Auth (email/password, magic link, OAuth)
- **Hosting/Infra:** Cloudflare Pages
- **Payments:** None (internal expense tool)
- **AI/3rd-party APIs:**
  - Recharts (data visualization)
  - Framer Motion (animations)
  - Sonner (notifications)
  - Lucide React (icons)
  - React Hook Form + Zod 4 (forms & validation)
  - Zustand (state management)

**SUPABASE PROJECT:**
- **Project Name:** expense-tracker-budgetwise
- **Project URL:** https://fcnkgpnfixuombrqsdyt.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/fcnkgpnfixuombrqsdyt

---

### PHASE 1 – SYSTEM ARCHITECTURE

1. Define folder structure following AGENTS.md conventions.
2. Define database schema for: profiles, workspaces, workspace_members, expenses, expense_reports, categories, receipts, invoices, bills, chats, notifications.
3. Define API routes and contracts (RESTful under /api/*).
4. Define environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`=https://fcnkgpnfixuombrqsdyt.supabase.co
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`=[from Supabase dashboard > Settings > API]
   - `SUPABASE_SERVICE_ROLE_KEY`=[from Supabase dashboard > Settings > API - keep secret]
5. Define security model (RLS policies, JWT tokens, workspace-based access control, roles: owner/admin/approver/member/auditor).
6. Output diagrams in ASCII if needed.

---

### PHASE 2 – IMPLEMENTATION

* Generate production-ready code.
* Use strict TypeScript with explicit return types.
* Add inline comments only where logic is complex.
* Avoid placeholders unless explicitly necessary.
* Follow AGENTS.md code style (PascalCase components, camelCase utilities, `@/` imports).
* Use CSS Modules for component-specific styles.
* Implement proper error handling with early returns.
* Never expose service role keys in client code.

---

### PHASE 3 – DEBUGGING & VALIDATION

For every feature created:

1. Identify potential runtime errors (null checks, async failures, type mismatches).
2. Identify edge cases (empty states, permission boundaries, concurrent edits).
3. Add validation and error handling (Zod schemas, try/catch blocks).
4. Provide test scenarios (happy path, error cases, unauthorized access).
5. Suggest logging points (audit trails for expense changes, auth events).
6. Suggest performance optimizations (React Server Components, dynamic imports, memoization).

---

### PHASE 4 – DEPLOYMENT READINESS

* Environment setup checklist:
   - Copy `.env.local.example` to `.env.local`
   - Set `NEXT_PUBLIC_SUPABASE_URL=https://fcnkgpnfixuombrqsdyt.supabase.co`
   - Add anon key and service role key from Supabase dashboard
* Build commands: `npm run build`, `npm run lint`, `npm run pages:build`.
* CI/CD suggestions (GitHub Actions for lint + build checks).
* Secrets management (never commit .env.local, use Cloudflare secrets).
* Monitoring and analytics recommendations (Supabase logs, Vercel Analytics if applicable).

---

### PHASE 5 – CONTINUOUS DEBUG MODE

Whenever I paste code or errors:

* Explain the root cause.
* Provide the minimal fix.
* Provide the improved best-practice version.
* State why the bug occurred.
* Suggest prevention patterns.

---

### CONSTRAINTS

* Do not skip steps.
* Do not output pseudo-code unless requested.
* Prefer modular, reusable functions.
* Ensure mobile responsiveness (Tailwind responsive prefixes).
* Optimize for scalability and maintainability.
* Follow existing code patterns in the codebase.
* Always check AGENTS.md for project-specific conventions.

---

### OPTIONAL ADD-ONS

* Generate unit tests (if testing framework is added).
* Generate API documentation.
* Generate ER diagrams for database relationships.
* Suggest caching strategies (React Query, SWR, or Next.js caching).
* Suggest rate limiting and security headers (already configured in next.config.ts).

---

## Why This Works

* Forces the AI into multi-role thinking (architect + coder + tester).
* Separates build from debug instead of mixing them.
* Encourages proactive error detection instead of reactive fixing.
* Produces production-grade output rather than demo code.

---

## Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server with Turbopack

# Build & Deploy
npm run build           # Production build
npm run lint            # ESLint check
npm run lint -- --fix   # Auto-fix lint issues
npm run pages:build     # Build for Cloudflare Pages
npm run pages:deploy    # Deploy to Cloudflare Pages
```

## Project Context Files

- `AGENTS.md` - Code style, conventions, and project structure
- `BACKEND.md` - Backend and API documentation (if exists)
- `src/types/index.ts` - TypeScript type definitions
- `src/lib/supabase/` - Supabase client configurations
- `src/styles/design-tokens.css` - CSS variables and design system

---

*Use this prompt for all new features, debugging sessions, and architecture decisions in the Expense Flow codebase.*
