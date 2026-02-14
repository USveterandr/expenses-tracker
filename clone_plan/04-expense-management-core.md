# 04 — Expense Management Core

---

## 🎯 Overview

The expense management system is the heart of ExpenseFlow. This document covers creating, editing, categorizing, filtering, and managing individual expenses — the fundamental building blocks before they are grouped into reports.

---

## 💰 Expense Creation Methods

Users can create expenses in 5 ways:

| Method | Description | Trigger |
|--------|-------------|---------|
| **📸 Receipt Scan** | Photograph/upload a receipt → AI extracts data | Camera button, drag-and-drop |
| **✍️ Manual Entry** | Fill out expense form manually | "New Expense" button |
| **🚗 Mileage** | Log distance traveled with start/end points | "Track Distance" option |
| **💳 Card Import** | Auto-import from linked credit/debit card | Background sync |
| **📧 Email Forward** | Forward receipt emails → auto-create expense | `receipts@expenseflow.app` |

---

## 📱 Screens & Components

### 4.1 Expense List Page
**Route:** `/expenses`

**Layout:**
- Page header: "Expenses" title + filter/sort controls
- Action bar: "New Expense" button + "Scan Receipt" button
- Filter chips: Status (All, Unreported, Reported, Approved, etc.)
- Search bar: Search by merchant, description, amount
- Expense table/list with the following columns:
  - Receipt thumbnail (40x40 preview)
  - Date
  - Merchant
  - Description
  - Category (color-coded badge)
  - Amount (formatted with currency)
  - Status badge (color-coded)
  - Report name (if linked)
  - Actions (⋯ menu)

**Features:**
- Sort by: Date, Amount, Merchant, Status, Category
- Filter by: Date range, Category, Status, Amount range, Tags, Has receipt
- Bulk select: Select multiple → bulk actions (delete, add to report, categorize)
- Pagination or infinite scroll (load 25 per page)
- Empty state: Illustration + "Create your first expense" CTA

**Responsive Behavior:**
- Desktop: Full table view
- Mobile: Card-based list view (stacked layout)

### 4.2 Create/Edit Expense Page
**Route:** `/expenses/new` (create) or `/expenses/[id]` (edit)

**Form Layout:**

```
┌─────────────────────────────────────────────┐
│  ← Back                     Save  |  Discard │
├─────────────────────────────────────────────┤
│                                             │
│  Receipt Preview Area                       │
│  ┌─────────────────────┐                   │
│  │    📷               │   [Upload Receipt] │
│  │  Drop receipt here  │   [Take Photo]     │
│  │  or click to browse │                   │
│  └─────────────────────┘                   │
│                                             │
│  ─────── Expense Details ───────            │
│                                             │
│  Merchant *        [___________________]    │
│  Amount *          [____] Currency [USD ▾]  │
│  Date *            [📅 _______________]     │
│  Category          [Select category  ▾]     │
│  Description       [___________________]    │
│                    [___________________]    │
│  Tags              [+ Add tags        ]     │
│                                             │
│  ─────── Additional Details ───────         │
│                                             │
│  □ Billable                                 │
│  □ Reimbursable                             │
│  Attendees         [+ Add attendees   ]     │
│  Report            [Assign to report  ▾]    │
│                                             │
│  ─────── AI Suggestions ───────             │
│  ┌─────────────────────────────────┐       │
│  │ 🤖 AI detected: Starbucks, $4.85│       │
│  │    Category: Meals & Dining      │       │
│  │    [Accept All] [Edit]           │       │
│  └─────────────────────────────────┘       │
│                                             │
│         [Save Expense]                      │
└─────────────────────────────────────────────┘
```

**Form Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Merchant | Text input with autocomplete | Yes | Max 200 chars |
| Amount | Number input | Yes | > 0, max 2 decimals |
| Currency | Dropdown | Yes | ISO 4217 list, default from workspace |
| Date | Date picker | Yes | Not in the future (configurable) |
| Category | Dropdown | Configurable | From workspace categories |
| Description | Textarea | No | Max 1000 chars |
| Tags | Multi-select chips | Configurable | From workspace tags |
| Billable | Checkbox | No | - |
| Reimbursable | Checkbox | No | Default true |
| Attendees | Multi-input | No | Name + optional email |
| Receipt | File upload | Configurable | Max 10MB, jpg/png/pdf |
| Report | Dropdown | No | User's draft reports |

### 4.3 Expense Detail Page
**Route:** `/expenses/[id]`

**Layout:**
```
┌──────────────────────────────────────────────┐
│  ← Expenses         Edit | Delete | ⋯        │
├──────────────────┬───────────────────────────┤
│                  │                           │
│  Receipt Image   │  Merchant: Starbucks      │
│  (full preview)  │  Amount: $4.85            │
│  [🔍 Zoom]       │  Date: Jan 15, 2026       │
│                  │  Category: 🍽 Dining       │
│                  │  Status: ✅ Approved       │
│                  │  Report: NYC Trip Jan      │
│                  │                           │
│                  │  ─── Details ───          │
│                  │  Description: Coffee      │
│                  │  Tags: Client-Meeting     │
│                  │  Billable: Yes            │
│                  │                           │
│                  │  ─── AI Analysis ───      │
│                  │  Confidence: 97%          │
│                  │  Source: Receipt Scan      │
│                  │                           │
├──────────────────┴───────────────────────────┤
│                                              │
│  💬 Comments (3)                             │
│  ┌──────────────────────────────────────┐   │
│  │ 👤 Manager: Please add description    │   │
│  │ 👤 You: Done! Added details          │   │
│  │ 👤 Manager: Thanks, approved ✅       │   │
│  └──────────────────────────────────────┘   │
│  [Type a comment...]              [Send]     │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 🏷 Category System

### Default Categories (Auto-created per workspace)

```typescript
const DEFAULT_CATEGORIES = [
  { name: 'Meals & Dining', icon: 'utensils', color: '#FF6B35', code: '6200' },
  { name: 'Transportation', icon: 'car', color: '#4ECDC4', code: '6300' },
  { name: 'Lodging', icon: 'bed', color: '#45B7D1', code: '6400' },
  { name: 'Flights', icon: 'plane', color: '#96CEB4', code: '6350' },
  { name: 'Office Supplies', icon: 'pencil', color: '#FFEAA7', code: '6500' },
  { name: 'Software & Subscriptions', icon: 'monitor', color: '#DDA0DD', code: '6550' },
  { name: 'Professional Services', icon: 'briefcase', color: '#98D8C8', code: '6600' },
  { name: 'Entertainment', icon: 'music', color: '#F7DC6F', code: '6700' },
  { name: 'Communication', icon: 'phone', color: '#82E0AA', code: '6800' },
  { name: 'Utilities', icon: 'zap', color: '#F8C471', code: '6900' },
  { name: 'Parking & Tolls', icon: 'square-parking', color: '#AED6F1', code: '6320' },
  { name: 'Fuel', icon: 'fuel', color: '#E59866', code: '6310' },
  { name: 'Training & Education', icon: 'graduation-cap', color: '#C39BD3', code: '7000' },
  { name: 'Medical', icon: 'heart-pulse', color: '#F1948A', code: '7100' },
  { name: 'Other', icon: 'circle-dot', color: '#BDC3C7', code: '9900' },
];
```

### Category Features
- **Customizable**: Admins can add, edit, disable, reorder categories
- **GL Codes**: Each category maps to a General Ledger account code
- **Spend Limits**: Set per-category max amounts
- **Required Comments**: Force users to add comments for specific categories
- **Tax Rates**: Auto-apply tax rates per category
- **Nesting**: Support parent/child category hierarchies
- **AI Mapping**: AI learns which merchants map to which categories over time

---

## 🔄 Expense Status Lifecycle

```
┌────────────┐
│ UNREPORTED │ ← Initial creation
└─────┬──────┘
      │ (added to report)
      ▼
┌────────────┐
│  REPORTED  │ ← Part of a draft report
└─────┬──────┘
      │ (report submitted)
      ▼
┌────────────┐
│ SUBMITTED  │ ← Awaiting approval
└─────┬──────┘
      │
   ┌──┴──┐
   ▼     ▼
┌──────┐ ┌──────────┐
│APPRO-│ │ REJECTED │ → User can edit & resubmit
│VED   │ └──────────┘
└──┬───┘
   │ (payment processed)
   ▼
┌────────────┐
│ REIMBURSED │ ← Final state
└────────────┘
```

---

## 🔍 Expense Filters & Search

### Available Filters
```typescript
interface ExpenseFilters {
  // Text search
  search: string;                    // Searches merchant, description
  
  // Date range
  dateFrom: Date | null;
  dateTo: Date | null;
  datePreset: 'today' | 'this_week' | 'this_month' | 'last_month' | 
              'this_quarter' | 'this_year' | 'custom' | null;
  
  // Amount range
  amountMin: number | null;
  amountMax: number | null;
  
  // Categorical
  status: ExpenseStatus[];
  categories: string[];
  tags: string[];
  
  // Boolean
  hasReceipt: boolean | null;
  isBillable: boolean | null;
  isReimbursable: boolean | null;
  hasViolations: boolean | null;
  
  // Source
  source: ExpenseSource[];
  
  // Report
  isReported: boolean | null;
  reportId: string | null;
  
  // Sort
  sortBy: 'date' | 'amount' | 'merchant' | 'category' | 'createdAt';
  sortDirection: 'asc' | 'desc';
}
```

### Saved Filters
- Users can save custom filter combinations as named presets
- Quick filter chips appear at the top for frequently used filters
- URL-based filter state (shareable filtered views)

---

## ⚠️ Policy Violation Detection

Expenses are automatically checked against workspace policies:

```typescript
interface ViolationCheck {
  type: string;
  check: (expense: Expense, workspace: Workspace) => Violation | null;
}

const VIOLATION_CHECKS: ViolationCheck[] = [
  {
    type: 'over_limit',
    check: (expense, workspace) => {
      if (workspace.settings.maxExpenseAmount && 
          expense.amount > workspace.settings.maxExpenseAmount) {
        return {
          type: 'over_limit',
          message: `Amount $${expense.amount} exceeds limit of $${workspace.settings.maxExpenseAmount}`,
          severity: 'error'
        };
      }
      return null;
    }
  },
  {
    type: 'missing_receipt',
    check: (expense, workspace) => {
      if (workspace.settings.requireReceipts && 
          !expense.hasReceipt &&
          expense.amount > (workspace.settings.receiptRequiredAbove || 0)) {
        return {
          type: 'missing_receipt',
          message: `Receipt required for expenses over $${workspace.settings.receiptRequiredAbove}`,
          severity: 'warning'
        };
      }
      return null;
    }
  },
  {
    type: 'duplicate',
    check: async (expense) => {
      // Check for same merchant + amount + date within 24 hours
      // Return warning if potential duplicate found
    }
  },
  {
    type: 'category_limit',
    check: (expense, workspace) => {
      // Check category-specific spending limits
    }
  },
  {
    type: 'weekend_expense',
    check: (expense) => {
      // Flag expenses on weekends (configurable)
    }
  },
  {
    type: 'future_date',
    check: (expense) => {
      // Flag expenses with dates in the future
    }
  },
];
```

---

## 🔄 Expense Splitting

### Split Types
1. **Equal Split**: Divide amount equally among selected users
2. **Percentage Split**: Assign percentages to each participant
3. **Custom Amount Split**: Manually assign amounts to each participant
4. **By Client/Project**: Split expense across multiple projects or departments

### Split UI Component
```
┌─────────────────────────────────────┐
│ Split Expense: $120.00              │
├─────────────────────────────────────┤
│ Split Type: [Equal ▾]              │
│                                     │
│ 👤 John       $40.00  (33.3%)     │
│ 👤 Sarah      $40.00  (33.3%)     │
│ 👤 Mike       $40.00  (33.3%)     │
│                                     │
│ [+ Add Person]                      │
│                                     │
│ Total: $120.00 ✓ Balanced          │
│                                     │
│         [Apply Split]               │
└─────────────────────────────────────┘
```

---

## 💳 Recurring Expenses

- Users can mark expenses as "recurring"
- System tracks recurring patterns (same merchant, similar amount)
- "Duplicate" action: One-click create a copy with today's date
- Auto-suggestions: *"You usually expense [Merchant] around this time"*

---

## 📱 API Endpoints

```
GET    /api/expenses                  # List expenses (with filters)
POST   /api/expenses                  # Create new expense
GET    /api/expenses/:id              # Get expense detail
PUT    /api/expenses/:id              # Update expense
DELETE /api/expenses/:id              # Delete expense
POST   /api/expenses/:id/receipt      # Upload receipt to expense
POST   /api/expenses/bulk-delete      # Bulk delete
POST   /api/expenses/bulk-categorize  # Bulk update category
POST   /api/expenses/bulk-report      # Add multiple to report
GET    /api/expenses/suggestions      # AI-powered autocomplete suggestions
GET    /api/expenses/duplicates       # Check for duplicate expenses
```
