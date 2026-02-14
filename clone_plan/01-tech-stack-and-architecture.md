# 01 — Technology Stack & Architecture

---

## 🎯 Overview

This document defines the technology stack, project setup, folder structure, and architectural patterns for **ExpenseFlow** (our Expensify clone). The architecture prioritizes:

- **Speed of development** (use managed services where possible)
- **AI integration readiness** (easy to plug in OCR, LLM, etc.)
- **Real-time capabilities** (chat, live dashboards)
- **Scalability** (serverless backend, cloud database)
- **Cross-platform** (single codebase for responsive web)

---

## 🛠 Technology Stack

### Frontend
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Framework** | **Next.js 14+** (App Router) | React-based, SSR/SSG, file-based routing, API routes built-in |
| **Language** | **TypeScript** | Type safety across the entire codebase |
| **Styling** | **Vanilla CSS** with CSS Modules + CSS Custom Properties | Maximum control, no framework dependency, design token system |
| **State Management** | **Zustand** | Lightweight, minimal boilerplate, great TypeScript support |
| **Real-time** | **Firebase Realtime Database** or **Firestore** with subscriptions | Real-time chat and live dashboards |
| **Forms** | **React Hook Form + Zod** | Performant forms with schema-based validation |
| **Charts** | **Recharts** or **Chart.js** | Beautiful, responsive financial charts and dashboards |
| **Date Handling** | **date-fns** | Lightweight, tree-shakable date utilities |
| **Animations** | **Framer Motion** | Production-grade animations for UI transitions |
| **Icons** | **Lucide React** | Clean, consistent icon set |
| **Notifications** | **React Hot Toast** or **Sonner** | Beautiful toast notifications |

### Backend
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Runtime** | **Next.js API Routes** (serverless) | Co-located with frontend, zero CORS issues |
| **Database** | **Firebase Firestore** | Real-time, scalable NoSQL, free tier available |
| **Authentication** | **Firebase Auth** | Google, email/password, SSO support, proven security |
| **File Storage** | **Firebase Storage** (Cloud Storage) | Receipts, invoices, avatars, attachments |
| **Background Jobs** | **Firebase Cloud Functions** (or Vercel Cron) | Scheduled reports, email reminders, batch processing |
| **Email** | **Resend** or **SendGrid** | Transactional emails (report notifications, invoices) |

### AI / Machine Learning
| Feature | Technology | Rationale |
|---------|-----------|-----------|
| **Receipt OCR** | **Google Cloud Vision API** or **Gemini Vision** | Industry-leading OCR accuracy, multi-language support |
| **Expense Categorization** | **Gemini API** (Google AI) | Natural language understanding for smart categorization |
| **Concierge AI Assistant** | **Gemini API** | Conversational AI for expense help, policy Q&A |
| **Data Extraction** | **Structured output from Gemini** | Extract merchant, date, amount, currency from receipts |

### DevOps & Infrastructure
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Hosting** | **Firebase Hosting** or **Vercel** | Global CDN, automatic HTTPS, preview deployments |
| **CI/CD** | **GitHub Actions** | Automated testing, linting, and deployment |
| **Monitoring** | **Firebase Analytics** + **Sentry** | Error tracking and usage analytics |
| **Version Control** | **Git + GitHub** | Standard collaboration workflow |

---

## 📂 Project Folder Structure

```
expense-flow/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint + test on PR
│       └── deploy.yml                # Deploy to production
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── images/
│       └── onboarding/               # Onboarding illustrations
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── (auth)/                    # Auth group (login, signup, forgot-password)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/               # Main app group (requires auth)
│   │   │   ├── layout.tsx             # Sidebar + header layout
│   │   │   ├── inbox/
│   │   │   │   └── page.tsx           # Inbox / Home
│   │   │   ├── expenses/
│   │   │   │   ├── page.tsx           # Expense list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx       # Create new expense
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx       # Expense detail
│   │   │   ├── reports/
│   │   │   │   ├── page.tsx           # Report list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx       # Create new report
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx       # Report detail + approval
│   │   │   ├── scan/
│   │   │   │   └── page.tsx           # Receipt scanner
│   │   │   ├── chat/
│   │   │   │   ├── page.tsx           # Chat list
│   │   │   │   └── [chatId]/
│   │   │   │       └── page.tsx       # Chat thread
│   │   │   ├── invoices/
│   │   │   │   ├── page.tsx           # Invoice list
│   │   │   │   └── new/
│   │   │   │       └── page.tsx       # Create invoice
│   │   │   ├── bills/
│   │   │   │   ├── page.tsx           # Bills list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx       # Bill detail
│   │   │   ├── workspace/
│   │   │   │   ├── page.tsx           # Workspace list
│   │   │   │   └── [workspaceId]/
│   │   │   │       ├── page.tsx       # Workspace settings
│   │   │   │       ├── members/
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── categories/
│   │   │   │       │   └── page.tsx
│   │   │   │       └── rules/
│   │   │   │           └── page.tsx
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx           # Dashboard analytics
│   │   │   └── settings/
│   │   │       ├── page.tsx           # Account settings
│   │   │       ├── profile/
│   │   │       │   └── page.tsx
│   │   │       ├── wallet/
│   │   │       │   └── page.tsx
│   │   │       ├── preferences/
│   │   │       │   └── page.tsx
│   │   │       └── security/
│   │   │           └── page.tsx
│   │   ├── api/                       # Next.js API Routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── expenses/
│   │   │   │   ├── route.ts           # CRUD
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── reports/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       ├── approve/
│   │   │   │       │   └── route.ts
│   │   │   │       └── reject/
│   │   │   │           └── route.ts
│   │   │   ├── receipts/
│   │   │   │   └── scan/
│   │   │   │       └── route.ts       # OCR endpoint
│   │   │   ├── chat/
│   │   │   │   └── route.ts
│   │   │   ├── invoices/
│   │   │   │   └── route.ts
│   │   │   ├── bills/
│   │   │   │   └── route.ts
│   │   │   ├── workspaces/
│   │   │   │   └── route.ts
│   │   │   ├── analytics/
│   │   │   │   └── route.ts
│   │   │   └── ai/
│   │   │       ├── categorize/
│   │   │       │   └── route.ts       # AI categorization
│   │   │       └── concierge/
│   │   │           └── route.ts       # AI assistant
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Landing page (public)
│   │   └── globals.css                # Global styles + design tokens
│   ├── components/                    # Reusable UI components
│   │   ├── ui/                        # Base design system components
│   │   │   ├── Button.tsx
│   │   │   ├── Button.module.css
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ...
│   │   ├── layout/                    # Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── PageHeader.tsx
│   │   ├── expenses/                  # Expense-specific components
│   │   │   ├── ExpenseCard.tsx
│   │   │   ├── ExpenseForm.tsx
│   │   │   ├── ExpenseTable.tsx
│   │   │   ├── ExpenseFilters.tsx
│   │   │   └── ReceiptThumbnail.tsx
│   │   ├── reports/                   # Report-specific components
│   │   │   ├── ReportCard.tsx
│   │   │   ├── ReportTimeline.tsx
│   │   │   └── ApprovalActions.tsx
│   │   ├── chat/                      # Chat components
│   │   │   ├── ChatBubble.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── ChatList.tsx
│   │   │   └── ThreadView.tsx
│   │   ├── scanner/                   # Receipt scanner components
│   │   │   ├── CameraCapture.tsx
│   │   │   ├── ScanPreview.tsx
│   │   │   ├── ScanResult.tsx
│   │   │   └── DragDropUpload.tsx
│   │   ├── invoices/                  # Invoice components
│   │   │   ├── InvoiceForm.tsx
│   │   │   ├── InvoicePreview.tsx
│   │   │   └── InvoiceTable.tsx
│   │   ├── analytics/                 # Dashboard/chart components
│   │   │   ├── SpendChart.tsx
│   │   │   ├── CategoryBreakdown.tsx
│   │   │   ├── TrendLine.tsx
│   │   │   └── StatCard.tsx
│   │   └── workspace/                 # Workspace components
│   │       ├── MemberList.tsx
│   │       ├── PolicyEditor.tsx
│   │       └── CategoryManager.tsx
│   ├── lib/                           # Utility and service layer
│   │   ├── firebase/
│   │   │   ├── config.ts              # Firebase initialization
│   │   │   ├── auth.ts                # Auth helpers
│   │   │   ├── firestore.ts           # Firestore helpers
│   │   │   └── storage.ts             # Storage helpers
│   │   ├── ai/
│   │   │   ├── ocr.ts                 # Receipt OCR service
│   │   │   ├── categorizer.ts         # AI expense categorization
│   │   │   └── concierge.ts           # AI assistant service
│   │   ├── utils/
│   │   │   ├── currency.ts            # Currency formatting + conversion
│   │   │   ├── dates.ts               # Date formatting helpers
│   │   │   ├── validators.ts          # Input validation schemas (Zod)
│   │   │   └── permissions.ts         # Role-based access checks
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useExpenses.ts
│   │   │   ├── useReports.ts
│   │   │   ├── useChat.ts
│   │   │   ├── useWorkspace.ts
│   │   │   └── useAnalytics.ts
│   │   └── stores/                    # Zustand stores
│   │       ├── authStore.ts
│   │       ├── expenseStore.ts
│   │       ├── reportStore.ts
│   │       ├── chatStore.ts
│   │       └── uiStore.ts
│   ├── types/                         # TypeScript type definitions
│   │   ├── expense.ts
│   │   ├── report.ts
│   │   ├── user.ts
│   │   ├── workspace.ts
│   │   ├── chat.ts
│   │   ├── invoice.ts
│   │   └── api.ts
│   └── styles/                        # Additional CSS modules
│       ├── design-tokens.css          # CSS custom property definitions
│       ├── animations.css             # Keyframe animations
│       └── utilities.css              # Utility classes
├── firebase.json                      # Firebase project config
├── firestore.rules                    # Firestore security rules
├── storage.rules                      # Storage security rules
├── next.config.js                     # Next.js configuration
├── tsconfig.json                      # TypeScript config
├── package.json                       # Dependencies
├── .env.local                         # Environment variables (secrets)
├── .env.example                       # Env template for contributors
└── README.md                          # Project readme
```

---

## 🏗 Architecture Patterns

### 1. Feature-Based Organization
Components, hooks, and types are organized by feature (expenses, reports, chat, etc.) rather than by technical layer. This makes it easy to find and modify all code related to a given feature.

### 2. Server Components + Client Components
```
Server Components (default):
  - Data fetching pages (lists, details)
  - Static layout shells
  - SEO-critical content

Client Components ('use client'):
  - Interactive forms
  - Real-time subscriptions (chat, live dashboards)
  - Camera/scanner features
  - Any component with useState, useEffect, event handlers
```

### 3. API Route Pattern
```typescript
// src/app/api/expenses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/firebase/auth';
import { db } from '@/lib/firebase/firestore';

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const expenses = await db.getExpenses(user.uid, req.nextUrl.searchParams);
  return NextResponse.json({ data: expenses });
}

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const body = await req.json();
  // Validate with Zod schema
  // Create expense in Firestore
  // Return created expense
}
```

### 4. Data Flow Pattern
```
User Action → React Component → Zustand Store (optimistic update)
                                        ↓
                                  API Route (validation)
                                        ↓
                                  Firebase Firestore (persistence)
                                        ↓
                                  Real-time Listener (UI update)
```

### 5. AI Integration Pattern
```
Receipt Image → Firebase Storage (upload)
                       ↓
              API Route (/api/receipts/scan)
                       ↓
              Google Vision API (OCR text extraction)
                       ↓
              Gemini API (structured data extraction)
                       ↓
              {merchant, date, amount, currency, category}
                       ↓
              Auto-create Expense (pre-filled form)
```

---

## 🔧 Initial Project Setup Commands

```bash
# 1. Create Next.js project
npx -y create-next-app@latest expense-flow --typescript --app --src-dir --import-alias "@/*" --no-tailwind

# 2. Install core dependencies
npm install firebase zustand react-hook-form @hookform/resolvers zod
npm install recharts date-fns framer-motion lucide-react sonner
npm install @google/generative-ai  # Gemini AI SDK

# 3. Install dev dependencies
npm install -D @types/node prettier eslint-config-prettier

# 4. Initialize Firebase
npx firebase init  # Select Firestore, Storage, Hosting, Functions
```

---

## 🔐 Environment Variables

```env
# .env.local (never commit this file)

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server-side only)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Google AI / Gemini
GEMINI_API_KEY=

# Google Cloud Vision (for OCR)
GOOGLE_CLOUD_VISION_API_KEY=

# Email Service (Resend)
RESEND_API_KEY=

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ExpenseFlow
```

---

## 📐 Key Architectural Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| **Monorepo vs. Separate repos** | Monorepo (single Next.js project) | Simpler setup, co-located API routes, faster development |
| **SQL vs. NoSQL** | NoSQL (Firestore) | Real-time sync, flexible schema, scales automatically, great for chat |
| **REST vs. GraphQL** | REST (API Routes) | Simpler for AI to generate, easier to debug, sufficient for our needs |
| **SSR vs. SPA** | Hybrid (Next.js App Router) | SSR for SEO pages, client-side for interactive dashboards |
| **State management** | Zustand + React Query patterns | Lightweightlocal state + server cache management |
| **CSS approach** | CSS Modules + Custom Properties | Maximum design control, no framework lock-in, excellent performance |
| **AI Provider** | Google Gemini | Multimodal (text + vision), competitive pricing, Firebase ecosystem |
