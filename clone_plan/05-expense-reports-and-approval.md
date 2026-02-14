# 05 — Expense Reports & Approval Workflows

---

## 🎯 Overview

Expense Reports are the core organizational unit in Expensify. Users group individual expenses into reports, submit them for approval, and track their progress through configurable approval workflows. This document covers report creation, approval chains, and the entire lifecycle.

---

## 📋 Report Lifecycle

```
┌─────────┐    Submit    ┌───────────┐    Approve   ┌──────────┐   Process   ┌────────────┐
│  DRAFT  │ ──────────→ │ SUBMITTED │ ──────────→ │ APPROVED │ ────────→ │ REIMBURSED │
└─────────┘              └─────┬─────┘              └──────────┘           └────────────┘
                               │                          ▲
                               │ Reject                   │ Resubmit
                               ▼                          │
                         ┌──────────┐                     │
                         │ REJECTED │ ────────────────────┘
                         └──────────┘
                         
Also: PROCESSING (between approved and reimbursed)
      CLOSED (submit & close workflow)
```

---

## 📱 Screens & Components

### 5.1 Report List Page
**Route:** `/reports`

**Layout:**
- Page header: "Reports" title
- Tab bar: "My Reports" | "Awaiting My Approval" | "All" (admin only)
- Action bar: "New Report" button
- Filter chips: Status filters (Draft, Submitted, Approved, Rejected, Reimbursed)
- Report cards/table:

```
┌────────────────────────────────────────────────────┐
│ 📋 NYC Business Trip - January 2026                │
│                                                    │
│ Status: 🟡 Submitted         Submitted: Jan 20     │
│ Expenses: 12 items           Total: $2,847.50      │
│ Violations: 1 warning                              │
│ Approver: Sarah Johnson - ⏳ Pending               │
│                                                    │
│ [View] [Recall]                                    │
└────────────────────────────────────────────────────┘
```

### 5.2 Create/Edit Report Page
**Route:** `/reports/new` or `/reports/[id]`

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ ← Reports                        Save Draft | Submit│
├─────────────────────────────────────────────────────┤
│                                                     │
│ Report Title: [NYC Business Trip - Jan 2026    ]    │
│ Description:  [Business meetings with clients  ]    │
│                                                     │
│ ─────── Expenses ───────                            │
│                                                     │
│ [+ Add Expenses]  [Scan Receipt]                    │
│                                                     │
│ ┌────────────────────────────────────────────┐      │
│ │ ☐ 📷 Jan 15  Starbucks     Dining  $4.85  │      │
│ │ ☐ 📷 Jan 15  Uber          Travel  $23.50 │      │
│ │ ☐ 📷 Jan 16  Hilton Hotel  Lodging $189.00│      │
│ │ ☐ 📷 Jan 16  Client Dinner Dining  $145.00│      │
│ │ ☐    Jan 17  Taxi to Airport Travel $45.00 │      │
│ └────────────────────────────────────────────┘      │
│                                                     │
│ ─────── Summary ───────                             │
│                                                     │
│ ┌──────────────────────┬──────────────────┐         │
│ │ Total Expenses: 5    │ Total: $407.35   │         │
│ │ Categories:          │                  │         │
│ │  🍽 Dining: $149.85  │ Violations: 0    │         │
│ │  🚗 Travel: $68.50   │ Has Receipts: 4/5│         │
│ │  🏨 Lodging: $189.00 │                  │         │
│ └──────────────────────┴──────────────────┘         │
│                                                     │
│ ⚠️ 1 expense is missing a receipt                   │
│                                                     │
│          [Save Draft]    [Submit Report]             │
└─────────────────────────────────────────────────────┘
```

**"Add Expenses" Modal:**
- Shows list of "unreported" expenses for the user
- Allows multi-select with checkboxes
- Search/filter within the modal
- "Add Selected (N)" button
- "Create New Expense" link within modal

### 5.3 Report Detail / Approval Page
**Route:** `/reports/[id]`

**For Submitter:**
- Full report details with expense list
- Status timeline (visual progress indicator)
- Comment thread with approver
- Actions: Edit (if draft), Recall (if submitted), Resubmit (if rejected)

**For Approver:**
```
┌─────────────────────────────────────────────────────┐
│ ← Awaiting Approval                                │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 📋 NYC Business Trip - January 2026                │
│ Submitted by: John Doe • Jan 20, 2026              │
│                                                     │
│ ─────── Approval Timeline ───────                   │
│                                                     │
│ ✅ Created           Jan 18 by John Doe             │
│ ✅ Submitted          Jan 20 by John Doe            │
│ 🔵 Awaiting Approval  You (Level 1)                │
│ ⚪ Level 2 Approval   CFO (if required)            │
│ ⚪ Reimbursement      Processing                   │
│                                                     │
│ ─────── Expenses (5) ───────                        │
│                                                     │
│ [Expandable expense list with receipt previews]     │
│ Each expense shows: ✅ Approve | ⏸ Hold | Details  │
│                                                     │
│ ─────── Summary ───────                             │
│ Total: $407.35 • 5 expenses • 0 violations          │
│                                                     │
│ ─────── Comments ───────                            │
│ [Comment thread between submitter and approver]     │
│ [Type a comment...]                                  │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │ Comment (optional): [__________________]     │   │
│  │                                              │   │
│  │ [❌ Reject Report]  [⏸ Hold]  [✅ Approve] │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## ⚙️ Approval Workflow Modes

### Mode 1: Submit & Close
- **Use case:** Solo users, trust-based teams
- **Flow:** User submits → Report auto-approved and closed
- **Configuration:** No approver needed

### Mode 2: Submit & Approve
- **Use case:** Standard teams
- **Flow:** User submits → Single approver reviews → Approved or Rejected
- **Configuration:** 
  - Default approver per workspace
  - Override per member (assign specific approver)

### Mode 3: Advanced Approval
- **Use case:** Larger organizations with complex hierarchies
- **Features:**
  - Different approvers per department
  - Multi-level approval chains
  - Amount-based routing (reports over $X need second approval)
  - Category-based routing
  - Auto-approve for small amounts

```typescript
// Approval workflow configuration
interface ApprovalWorkflow {
  mode: 'submit_close' | 'submit_approve' | 'advanced';
  
  // Submit & Approve settings
  defaultApproverId: string | null;
  
  // Advanced settings
  rules: ApprovalRule[];
  autoApproveBelow: number | null;     // Auto-approve reports below this $
  requireSecondApprovalAbove: number | null;
}

interface ApprovalRule {
  id: string;
  name: string;
  priority: number;                    // Lower = higher priority
  conditions: {
    field: 'amount' | 'category' | 'department' | 'tag';
    operator: 'gt' | 'lt' | 'eq' | 'in';
    value: any;
  }[];
  approverId: string;
  approverLevel: number;
}

// Example: Route engineering expenses over $1000 to VP
const exampleRule: ApprovalRule = {
  id: 'rule_1',
  name: 'Large engineering expenses',
  priority: 1,
  conditions: [
    { field: 'department', operator: 'eq', value: 'Engineering' },
    { field: 'amount', operator: 'gt', value: 1000 }
  ],
  approverId: 'vp_engineering_uid',
  approverLevel: 2
};
```

---

## 🔔 Notification Triggers

| Event | Notify Who | Channel |
|-------|-----------|---------|
| Report submitted | Approver(s) | In-app + Email |
| Report approved | Submitter | In-app + Email |
| Report rejected | Submitter | In-app + Email |
| Report held | Submitter | In-app + Email |
| Report reimbursed | Submitter | In-app + Email |
| Comment added | All participants | In-app |
| Expense held | Submitter | In-app |
| Approaching deadline | Approver | In-app + Email |

---

## 📊 Report Analytics

Each report auto-generates a summary with:

```typescript
interface ReportSummary {
  // Basics
  expenseCount: number;
  totalAmount: number;
  currency: string;
  dateRange: { start: Date; end: Date };
  
  // Breakdowns
  categoryBreakdown: { category: string; amount: number; count: number }[];
  merchantBreakdown: { merchant: string; amount: number; count: number }[];
  dailyBreakdown: { date: string; amount: number }[];
  
  // Compliance
  violationCount: number;
  missingReceipts: number;
  receiptCoverage: number;            // percentage
  
  // Reimbursement
  reimbursableAmount: number;
  nonReimbursableAmount: number;
  billableAmount: number;
}
```

---

## 📱 API Endpoints

```
GET    /api/reports                    # List user's reports
POST   /api/reports                    # Create new report
GET    /api/reports/:id                # Get report detail
PUT    /api/reports/:id                # Update report (draft only)
DELETE /api/reports/:id                # Delete report (draft only)

POST   /api/reports/:id/submit        # Submit report for approval
POST   /api/reports/:id/recall        # Recall submitted report
POST   /api/reports/:id/approve       # Approve report (approver)
POST   /api/reports/:id/reject        # Reject report (approver)
POST   /api/reports/:id/hold          # Hold report (approver)
POST   /api/reports/:id/reimburse     # Mark as reimbursed

POST   /api/reports/:id/expenses      # Add expenses to report
DELETE /api/reports/:id/expenses/:eid # Remove expense from report
POST   /api/reports/:id/comments      # Add comment to report

GET    /api/reports/pending-approval   # Reports awaiting current user's approval
GET    /api/reports/:id/summary        # Get report summary analytics
GET    /api/reports/:id/export/pdf     # Export report as PDF
GET    /api/reports/:id/export/csv     # Export report as CSV
```

---

## 📄 Report Export

### PDF Export
- Professional layout with company logo
- Expense table with all details
- Category breakdown chart
- Receipt thumbnails grid
- Approval status and sign-offs
- Generated via server-side (using `@react-pdf/renderer` or `puppeteer`)

### CSV Export
- Flat table of all expenses in the report
- All fields included (date, merchant, amount, category, tags, etc.)
- UTF-8 encoded, compatible with Excel and Google Sheets
