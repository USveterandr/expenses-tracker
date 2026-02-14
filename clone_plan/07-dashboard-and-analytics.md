# 07 — Dashboard & Analytics

---

## 🎯 Overview

The dashboard is the first screen users see after login. It provides an at-a-glance view of financial activity, pending actions, and spending insights. This document covers the inbox/home screen, analytics dashboard, and all chart/visualization components.

---

## 📱 Screens

### 7.1 Inbox / Home Screen
**Route:** `/inbox`

This is the primary landing page (mirroring Expensify's chat-first inbox approach).

```
┌─────────────────────────────────────────────────────┐
│  🏠 Inbox                                    🔔 3   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ─── Quick Actions ───                              │
│                                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│  │  📸  │ │  ✍️  │ │  📋  │ │  📊  │              │
│  │ Scan │ │  New │ │ New  │ │Stats │              │
│  │Recpt │ │ Exp  │ │Report│ │      │              │
│  └──────┘ └──────┘ └──────┘ └──────┘              │
│                                                     │
│  ─── Pending Actions ───                            │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │ ⚠️ 3 Expenses need receipts                 │   │
│  │ 📋 2 Reports awaiting your approval          │   │
│  │ 💰 1 Report reimbursed ($456.78)             │   │
│  │ 📨 New comment on "Q4 Travel Report"        │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ─── This Month's Spending ───                      │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │         $2,456.78                           │   │
│  │    ━━━━━━━━━━━━━━━━━━━░░░░  78% of budget   │   │
│  │                                              │   │
│  │  📈 +12% vs last month                      │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ─── Recent Activity ───                            │
│                                                     │
│  Today                                              │
│  • 💳 $23.50 at Uber - Transportation              │
│  • 📸 Receipt scanned: Starbucks $4.85             │
│                                                     │
│  Yesterday                                          │
│  • ✅ Report "Client Lunch" approved                │
│  • 💬 Sarah commented on expense #1234             │
│  • 💳 $89.00 at Amazon - Office Supplies           │
│                                                     │
│  [View All Activity →]                              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 7.2 Analytics Dashboard
**Route:** `/analytics`

```
┌─────────────────────────────────────────────────────────┐
│ 📊 Analytics                [This Month ▾] [Export ▾]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ─── Overview Cards ───                                  │
│                                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│ │ $4,567   │ │ 47       │ │ 3        │ │ $1,234   │   │
│ │Total Spend│ │Expenses  │ │ Reports  │ │Pending   │   │
│ │ ↑ 8%     │ │ ↑ 12     │ │ ↓ 1     │ │Reimburse │   │
│ │ vs prev  │ │ vs prev  │ │ vs prev  │ │ ment     │   │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                         │
│ ─── Spending Over Time ───                              │
│                                                         │
│ ┌───────────────────────────────────────────────────┐  │
│ │ $                                                 │  │
│ │ 2k ─     ╱╲                                       │  │
│ │ 1.5k─   ╱  ╲    ╱╲                               │  │
│ │ 1k ─  ╱╱    ╲╱╱  ╲___╱╲                          │  │
│ │ 500─╱╱                   ╲                        │  │
│ │ ────┬────┬────┬────┬────┬────┬────                │  │
│ │    Jul  Aug  Sep  Oct  Nov  Dec  Jan               │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ ─── Category Breakdown ───       ─── Top Merchants ──── │
│                                                         │
│ ┌────────────────────────┐  ┌──────────────────────┐   │
│ │      🍩 Donut Chart    │  │ 1. Uber    $456.00   │   │
│ │                        │  │ 2. Amazon  $389.50   │   │
│ │  🍽 Dining      35%   │  │ 3. Delta   $378.00   │   │
│ │  🚗 Travel      25%   │  │ 4. Hilton  $289.00   │   │
│ │  🏨 Lodging     20%   │  │ 5. Staples $156.00   │   │
│ │  📦 Supplies    12%   │  │                      │   │
│ │  📱 Other        8%   │  │ [View All →]         │   │
│ └────────────────────────┘  └──────────────────────┘   │
│                                                         │
│ ─── Daily Spending ───                                  │
│                                                         │
│ ┌───────────────────────────────────────────────────┐  │
│ │  Mon ████████████░░░░░░░ $234                     │  │
│ │  Tue ████░░░░░░░░░░░░░░░ $89                      │  │
│ │  Wed ██████████████████░ $378                      │  │
│ │  Thu ██████░░░░░░░░░░░░░ $145                     │  │
│ │  Fri ████████████░░░░░░░ $256                     │  │
│ │  Sat █░░░░░░░░░░░░░░░░░░ $12                      │  │
│ │  Sun ░░░░░░░░░░░░░░░░░░░ $0                       │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ ─── Budget vs Actual ───                                │
│                                                         │
│ ┌───────────────────────────────────────────────────┐  │
│ │ Dining     ████████████████░░░░ $1,200 / $1,500  │  │
│ │ Travel     ███████████████████░ $950 / $1,000     │  │
│ │ Supplies   ████████░░░░░░░░░░░ $400 / $800       │  │
│ │ Lodging    ██████████████████████ $1,100 / $1,000 │  │
│ │                                         ⚠️ Over!  │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Chart Components

### Stat Card Component
```typescript
interface StatCardProps {
  title: string;           // "Total Spend"
  value: string;           // "$4,567.89"
  change: number;          // +8.5 or -3.2
  changeLabel: string;     // "vs last month"
  icon: string;            // Lucide icon name
  color: string;           // Accent color
}
```

**Design:**
- Glassmorphism card with subtle gradient border
- Large value number with currency formatting
- Green up arrow / Red down arrow for change
- Smooth count-up animation on load (framer-motion)
- Subtle hover lift effect

### Spending Over Time (Line Chart)
```typescript
interface SpendingChartProps {
  data: { date: string; amount: number }[];
  period: 'daily' | 'weekly' | 'monthly';
  comparisonData?: { date: string; amount: number }[]; // Previous period
  showGrid: boolean;
  showTooltip: boolean;
}
```

**Design:**
- Smooth gradient fill below line
- Interactive tooltip on hover (date + amount)
- Comparison period as dashed line
- Responsive: compress on mobile, expand on desktop
- Animation: Line draws from left to right on load

### Category Breakdown (Donut Chart)
```typescript  
interface CategoryChartProps {
  data: { category: string; amount: number; color: string; icon: string }[];
  totalAmount: number;
  showLegend: boolean;
}
```

**Design:**
- Animated donut chart (Recharts PieChart)
- Center text: Total amount
- Hover: Segment expands slightly, tooltip shows details
- Legend below chart with icons, names, amounts, percentages
- Smooth entry animation

### Budget Progress Bars
```typescript
interface BudgetBarProps {
  category: string;
  spent: number;
  budget: number;
  color: string;
}
```

**Design:**
- Horizontal bar: Green < 80%, Yellow 80-100%, Red > 100%
- Animated fill on scroll into viewport
- Budget markers with dashed line
- Tooltip: "56% used • $400 remaining"

---

## 📱 Date Range Selector

**Preset Options:**
- Today
- This Week (Mon-Sun)
- This Month
- Last Month
- This Quarter (Q1/Q2/Q3/Q4)
- This Year
- Last Year
- Custom Range (date picker)

**Comparison Toggle:**
- "Compare to previous period" checkbox
- When enabled, shows overlay line on charts

---

## 🔔 Notification System

### Notification Types & Display

```typescript
const NOTIFICATION_CONFIGS = {
  expense_approved: {
    icon: 'check-circle',
    color: '#10B981',
    template: '{{actorName}} approved your expense of {{amount}}'
  },
  expense_rejected: {
    icon: 'x-circle', 
    color: '#EF4444',
    template: '{{actorName}} rejected your expense: "{{reason}}"'
  },
  report_submitted: {
    icon: 'send',
    color: '#3B82F6',
    template: '{{actorName}} submitted {{reportName}} for your approval'
  },
  report_approved: {
    icon: 'check-circle',
    color: '#10B981',
    template: '{{reportName}} has been approved!'
  },
  report_rejected: {
    icon: 'x-circle',
    color: '#EF4444',
    template: '{{reportName}} was rejected: "{{reason}}"'
  },
  chat_message: {
    icon: 'message-circle',
    color: '#8B5CF6',
    template: '{{actorName}}: {{messagePreview}}'
  },
  policy_violation: {
    icon: 'alert-triangle',
    color: '#F59E0B',
    template: 'Policy violation on expense: {{violationType}}'
  },
  invoice_paid: {
    icon: 'dollar-sign',
    color: '#10B981',
    template: 'Invoice #{{invoiceNumber}} paid by {{clientName}}'
  },
  bill_due: {
    icon: 'calendar',
    color: '#EF4444',
    template: 'Bill from {{vendorName}} is due in {{daysUntil}} days'
  }
};
```

### Notification Bell UI
```
┌──────────────────────────────┐
│ 🔔 Notifications       ✓All │
├──────────────────────────────┤
│ Today                        │
│                              │
│ ✅ Sarah approved your       │
│    expense of $45.00         │
│    2 hours ago               │
│                              │
│ 📋 John submitted Q4        │
│    Travel Report ($1,234)    │
│    5 hours ago               │
│                              │
│ Yesterday                    │
│                              │
│ 💬 Mike commented:           │
│    "Can you add the..."     │
│    Yesterday at 3:45 PM      │
│                              │
│ [View All Notifications →]   │
└──────────────────────────────┘
```

---

## 🤖 AI Insights (Concierge)

The dashboard includes AI-powered spending insights:

```typescript
// src/lib/ai/insights.ts

export async function generateSpendingInsights(
  expenses: Expense[], 
  period: string
): Promise<InsightCard[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const prompt = `
Analyze this expense data and provide 3-5 actionable spending insights.
Each insight should be:
- Specific and data-driven
- Actionable (what can the user do)
- Concise (1-2 sentences)

Expense data for ${period}:
${JSON.stringify(expenses.map(e => ({
  merchant: e.merchant,
  amount: e.amount, 
  category: e.categoryName,
  date: e.date
})))}

Return JSON array of insights with: title, body, type (saving/warning/info), icon
`;
  
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}
```

### Insight Cards Display
```
┌─────────────────────────────────────────┐
│ 🤖 AI Insights                         │
├─────────────────────────────────────────┤
│                                         │
│ 💡 Dining Trend Detected                │
│ Your dining expenses increased 34% this │
│ month. Consider meal prepping to save.  │
│                                         │
│ ⚠️ Budget Warning                      │
│ Travel budget is 95% used with 8 days   │
│ remaining this month.                   │
│                                         │
│ 🎯 Savings Opportunity                  │
│ Switching from daily Starbucks to       │
│ office coffee could save ~$85/month.    │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📱 API Endpoints

```
GET /api/analytics/overview           # Stat cards data
GET /api/analytics/spending           # Spending over time chart data
GET /api/analytics/categories         # Category breakdown
GET /api/analytics/merchants          # Top merchants
GET /api/analytics/budget             # Budget vs actual
GET /api/analytics/insights           # AI-generated insights
GET /api/notifications                # List notifications
PUT /api/notifications/:id/read       # Mark as read
PUT /api/notifications/read-all       # Mark all as read
```
