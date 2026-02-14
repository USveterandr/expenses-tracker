# 09 — Workspaces & Policies

---

## 🎯 Overview

Workspaces are the organizational unit in ExpenseFlow (equivalent to Expensify's "workspaces" / formerly "policies"). Each workspace represents a company, team, or project and defines the rules for how expenses are tracked, categorized, approved, and reported.

---

## 📱 Screens

### 9.1 Workspace List Page
**Route:** `/workspace`

```
┌─────────────────────────────────────────────┐
│ 🏢 Workspaces                    [+ New]    │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────────────────────────────────────────┐│
│ │ 🟢 Acme Corporation                    ││
│ │ Corporate • 24 members • Owner         ││
│ │ $12,456 this month                     ││
│ │ [Settings] [Members] [Categories]      ││
│ └─────────────────────────────────────────┘│
│                                             │
│ ┌─────────────────────────────────────────┐│
│ │ 🔵 Personal                            ││
│ │ Personal • 1 member • Owner            ││
│ │ $890 this month                        ││
│ │ [Settings]                             ││
│ └─────────────────────────────────────────┘│
│                                             │
│ ┌─────────────────────────────────────────┐│
│ │ 🟣 Freelance Project                   ││
│ │ Team • 3 members • Admin              ││
│ │ $2,345 this month                      ││
│ │ [Settings] [Members]                   ││
│ └─────────────────────────────────────────┘│
│                                             │
└─────────────────────────────────────────────┘
```

### 9.2 Workspace Settings Page
**Route:** `/workspace/[workspaceId]`

**Tab Navigation:**
- General | Members | Categories & Tags | Rules | Approval | Integrations

**General Tab:**
```
┌─────────────────────────────────────────────┐
│ ⚙️ General Settings                        │
├─────────────────────────────────────────────┤
│                                             │
│ Workspace Name    [Acme Corporation     ]   │
│ Description       [Main company workspace]  │
│ Logo              [📷 Upload] [Remove]      │
│ Type              [Corporate ▾]             │
│                                             │
│ ─── Defaults ───                            │
│                                             │
│ Default Currency  [USD ▾]                   │
│ Date Format       [MM/DD/YYYY ▾]            │
│ Distance Unit     [Miles ▾]                 │
│ Mileage Rate      [$0.67 per mile    ]      │
│ Fiscal Year Start [January ▾]               │
│                                             │
│ ─── Expense Settings ───                    │
│                                             │
│ □ Allow manual expenses                     │
│ □ Allow cash expenses                       │
│ Max expense amount [$_________] (0 = no cap)│
│                                             │
│        [Save Changes]                       │
│                                             │
│ ─── Danger Zone ───                         │
│ [Archive Workspace] [Delete Workspace]      │
│                                             │
└─────────────────────────────────────────────┘
```

### 9.3 Members Tab
**Route:** `/workspace/[workspaceId]/members`

```
┌─────────────────────────────────────────────────┐
│ 👥 Members (24)              [+ Invite Members] │
├─────────────────────────────────────────────────┤
│ 🔍 Search members...                            │
│                                                 │
│ Name              Email              Role       │
│ ─────────────────────────────────────────────── │
│ 👤 John Doe       john@acme.com      Owner      │
│ 👤 Sarah Johnson  sarah@acme.com     Admin      │
│ 👤 Mike Williams  mike@acme.com      Approver   │
│ 👤 Lisa Anderson  lisa@acme.com      Member     │
│ 👤 Tom Brown      tom@acme.com       Member     │
│ 👤 Amy Davis      amy@acme.com       Auditor    │
│ 📧 pending@new.com                   Invited    │
│                                                 │
│ [Each row has: Role dropdown, Remove button,    │
│  Set Approver button]                           │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 9.4 Categories & Tags Tab
**Route:** `/workspace/[workspaceId]/categories`

```
┌─────────────────────────────────────────────────┐
│ 🏷 Categories              [+ Add Category]     │
├─────────────────────────────────────────────────┤
│                                                 │
│ Drag to reorder ↕                               │
│                                                 │
│ ☰ 🍽 Meals & Dining        6200   ✅ Enabled   │
│ ☰ 🚗 Transportation        6300   ✅ Enabled   │
│ ☰ 🏨 Lodging               6400   ✅ Enabled   │
│ ☰ ✈️ Flights               6350   ✅ Enabled   │
│ ☰ 📦 Office Supplies       6500   ✅ Enabled   │
│ ☰ 💻 Software             6550   ✅ Enabled   │
│ ☰ 🎭 Entertainment        6700   ❌ Disabled  │
│                                                 │
│ [Click any category to edit: name, code,        │
│  icon, color, limits, tax rate, etc.]           │
│                                                 │
│ ─────────────────────────────────────           │
│ 🏷 Tags                    [+ Add Tag Group]    │
│                                                 │
│ Department:  Engineering | Marketing | Sales    │
│ Project:     Alpha | Beta | Gamma               │
│ Client:      Acme Co | Widget Inc               │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 9.5 Rules Tab
**Route:** `/workspace/[workspaceId]/rules`

```
┌─────────────────────────────────────────────────┐
│ 📏 Workspace Rules              [+ Add Rule]    │
├─────────────────────────────────────────────────┤
│                                                 │
│ ─── Receipt Policy ───                          │
│                                                 │
│ □ Require receipts for all expenses             │
│ □ Require receipts above $ [25.00    ]          │
│                                                 │
│ ─── Spending Limits ───                         │
│                                                 │
│ Default per-expense limit: $ [500.00  ]         │
│ Category limits:                                │
│   Dining:     $150 per expense                  │
│   Flights:    $2,000 per expense                │
│   Lodging:    $300 per night                    │
│                                                 │
│ ─── Compliance Rules ───                        │
│                                                 │
│ □ Flag weekend expenses                         │
│ □ Flag expenses with no description             │
│ □ Block future-dated expenses                   │
│ □ Auto-detect duplicates                        │
│ □ Require attendee list for meals > $75         │
│                                                 │
│ ─── Auto-Categorization ───                     │
│                                                 │
│ □ Enable AI auto-categorization                 │
│ □ Allow members to override AI categories       │
│                                                 │
│         [Save Rules]                            │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## ⚙️ Workspace Configuration Model

```typescript
interface WorkspaceConfig {
  // General
  name: string;
  description: string;
  type: 'personal' | 'team' | 'corporate';
  logoUrl: string | null;
  
  // Defaults
  defaultCurrency: string;
  dateFormat: string;
  distanceUnit: 'miles' | 'km';
  mileageRate: number;
  fiscalYearStart: number;
  
  // Expense rules
  rules: {
    receipts: {
      requireForAll: boolean;
      requireAboveAmount: number | null;
    };
    spending: {
      maxPerExpense: number | null;
      categoryLimits: Record<string, number>;
      memberLimits: Record<string, number>;
    };
    compliance: {
      flagWeekendExpenses: boolean;
      flagNoDescription: boolean;
      blockFutureDates: boolean;
      detectDuplicates: boolean;
      requireAttendeesAbove: number | null;
    };
    automation: {
      enableAICategorization: boolean;
      allowCategoryOverride: boolean;
      autoApproveBelow: number | null;
    };
  };
  
  // Approval
  approval: {
    mode: 'submit_close' | 'submit_approve' | 'advanced';
    defaultApprover: string | null;
    rules: ApprovalRule[];
  };
  
  // Integrations
  integrations: {
    accounting: AccountingIntegration | null;
    cards: CardIntegration[];
  };
}
```

---

## 🔗 Workspace Switching

The sidebar includes a workspace switcher dropdown:

```
┌──────────────────────────────┐
│ Current Workspace:           │
│ ┌────────────────────────┐  │
│ │ 🏢 Acme Corporation ▾  │  │
│ └────────────────────────┘  │
│                              │
│ Your Workspaces:             │
│  🟢 Acme Corporation ✓      │
│  🔵 Personal                │
│  🟣 Freelance Project       │
│                              │
│  [+ Create New Workspace]   │
└──────────────────────────────┘
```

When switching:
1. Update `activeWorkspaceId` on user profile
2. Reload expense/report data for new workspace
3. Update sidebar categories and navigation
4. Persist selection in localStorage

---

## 📱 API Endpoints

```
GET    /api/workspaces                          # List user's workspaces
POST   /api/workspaces                          # Create workspace
GET    /api/workspaces/:id                      # Get workspace details
PUT    /api/workspaces/:id                      # Update workspace settings
DELETE /api/workspaces/:id                      # Delete workspace
PUT    /api/workspaces/:id/archive              # Archive workspace

# Members
GET    /api/workspaces/:id/members              # List members
POST   /api/workspaces/:id/members              # Invite member(s)
PUT    /api/workspaces/:id/members/:uid         # Update member role
DELETE /api/workspaces/:id/members/:uid         # Remove member
POST   /api/workspaces/:id/members/resend-invite # Resend invitation

# Categories
GET    /api/workspaces/:id/categories           # List categories
POST   /api/workspaces/:id/categories           # Create category
PUT    /api/workspaces/:id/categories/:cid      # Update category
DELETE /api/workspaces/:id/categories/:cid      # Delete category
PUT    /api/workspaces/:id/categories/reorder   # Reorder categories

# Tags
GET    /api/workspaces/:id/tags                 # List tags
POST   /api/workspaces/:id/tags                 # Create tag
PUT    /api/workspaces/:id/tags/:tid            # Update tag
DELETE /api/workspaces/:id/tags/:tid            # Delete tag

# Rules
GET    /api/workspaces/:id/rules                # Get workspace rules
PUT    /api/workspaces/:id/rules                # Update workspace rules
```
