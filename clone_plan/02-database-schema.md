# 02 — Database Schema Design

---

## 🎯 Overview

This document defines the complete Firestore database schema for ExpenseFlow. Since Firestore is a NoSQL document database, data is organized into **collections** and **subcollections** with denormalized data where appropriate for performance.

---

## 📊 Collection Architecture

```
firestore/
├── users/                    # User profiles and settings
├── workspaces/               # Organizations / companies
│   └── {workspaceId}/
│       ├── members/          # Workspace members (subcollection)
│       ├── categories/       # Expense categories (subcollection)
│       ├── tags/             # Custom tags (subcollection)
│       └── rules/            # Workspace expense rules (subcollection)
├── expenses/                 # All expenses (top-level for cross-workspace queries)
├── reports/                  # Expense reports
├── receipts/                 # Scanned receipt data
├── chats/                    # Chat conversations
│   └── {chatId}/
│       └── messages/         # Chat messages (subcollection)
├── invoices/                 # Invoices
├── bills/                    # Bills to pay
├── notifications/            # User notifications
└── audit_logs/               # Audit trail for compliance
```

---

## 📝 Detailed Schema Definitions

### 1. `users` Collection

```typescript
interface User {
  // Document ID = Firebase Auth UID
  uid: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  phone: string | null;

  // Preferences
  preferences: {
    currency: string;              // Default: "USD"
    locale: string;                // Default: "en-US"
    timezone: string;              // Default: "America/New_York"
    dateFormat: string;            // Default: "MM/DD/YYYY"
    theme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
    pushNotifications: boolean;
  };

  // Payment / wallet info
  wallet: {
    bankAccounts: BankAccount[];
    paymentMethods: PaymentMethod[];
    defaultPaymentMethodId: string | null;
  };

  // Workspace memberships (denormalized for quick access)
  workspaceIds: string[];
  activeWorkspaceId: string | null;

  // Status
  status: 'active' | 'inactive' | 'suspended';
  role: 'user' | 'admin' | 'super_admin';
  onboardingCompleted: boolean;
  lastLoginAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountType: 'checking' | 'savings';
  last4: string;
  routingNumber: string;  // Encrypted
  isDefault: boolean;
  isVerified: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  brand: string;           // "visa", "mastercard", etc.
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}
```

### 2. `workspaces` Collection

```typescript
interface Workspace {
  // Document ID = auto-generated
  id: string;
  name: string;
  description: string;
  logoUrl: string | null;
  type: 'personal' | 'team' | 'corporate';

  // Owner / creator
  ownerId: string;
  ownerEmail: string;

  // Settings
  settings: {
    defaultCurrency: string;
    defaultCategory: string;
    requireReceipts: boolean;
    receiptRequiredAbove: number;        // Amount threshold for mandatory receipt
    maxExpenseAmount: number | null;     // Spending cap per expense
    autoApproveBelow: number | null;     // Auto-approve expenses below this amount
    mileageRate: number;                 // Rate per mile/km
    distanceUnit: 'miles' | 'km';
    allowCashExpenses: boolean;
    allowManualExpenses: boolean;
    fiscalYearStart: number;             // Month (1-12)
  };

  // Approval workflow configuration
  approvalWorkflow: {
    mode: 'submit_close' | 'submit_approve' | 'advanced';
    defaultApproverId: string | null;
    requireSecondApprovalAbove: number | null;
    secondApproverId: string | null;
    enforceWorkflow: boolean;
  };

  // Accounting integration
  integration: {
    provider: 'quickbooks' | 'xero' | 'netsuite' | 'sage' | null;
    connected: boolean;
    lastSyncAt: Timestamp | null;
    config: Record<string, any>;
  };

  // Stats (denormalized, updated via Cloud Functions)
  stats: {
    memberCount: number;
    totalExpenses: number;
    totalSpend: number;
    activeReports: number;
  };

  // Metadata
  plan: 'free' | 'collect' | 'control';
  status: 'active' | 'archived';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3. `workspaces/{workspaceId}/members` Subcollection

```typescript
interface WorkspaceMember {
  // Document ID = user UID
  userId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: 'owner' | 'admin' | 'approver' | 'member' | 'auditor';
  approverId: string | null;          // Who approves this member's reports
  departmentId: string | null;
  employeeId: string | null;
  spendingLimit: number | null;       // Per-member spending cap
  status: 'active' | 'invited' | 'removed';
  invitedAt: Timestamp;
  joinedAt: Timestamp | null;
}
```

### 4. `workspaces/{workspaceId}/categories` Subcollection

```typescript
interface ExpenseCategory {
  // Document ID = auto-generated
  id: string;
  name: string;                       // e.g., "Meals & Entertainment"
  code: string;                       // GL account code, e.g., "6200"
  icon: string;                       // Lucide icon name
  color: string;                      // Hex color for UI
  parentId: string | null;            // For nested categories
  enabled: boolean;
  requireComment: boolean;            // Force comment for this category
  maxAmount: number | null;           // Category-specific spending limit
  taxRate: number | null;             // Tax percentage
  sortOrder: number;
  createdAt: Timestamp;
}
```

### 5. `workspaces/{workspaceId}/tags` Subcollection

```typescript
interface Tag {
  id: string;
  name: string;
  groupName: string;                  // e.g., "Project", "Department", "Client"
  color: string;
  enabled: boolean;
  required: boolean;                  // Must tag all expenses with this group?
  sortOrder: number;
}
```

### 6. `expenses` Collection (Top-Level)

```typescript
interface Expense {
  // Document ID = auto-generated
  id: string;

  // Ownership
  userId: string;                     // Creator
  userEmail: string;                  // Denormalized
  userDisplayName: string;            // Denormalized
  workspaceId: string;

  // Core expense data
  merchant: string;                   // "Starbucks", "Uber", etc.
  description: string;                // User note
  amount: number;                     // Expense amount in original currency
  currency: string;                   // ISO 4217, e.g., "USD"
  convertedAmount: number | null;     // Amount in workspace default currency
  convertedCurrency: string | null;

  // Classification
  categoryId: string | null;
  categoryName: string | null;        // Denormalized
  tagIds: string[];
  tagNames: string[];                 // Denormalized

  // Date
  date: Timestamp;                    // When expense occurred
  createdAt: Timestamp;               // When created in system
  updatedAt: Timestamp;

  // Receipt
  receiptId: string | null;
  receiptUrl: string | null;          // Firebase Storage URL
  receiptThumbnailUrl: string | null;
  hasReceipt: boolean;

  // Source
  source: 'manual' | 'scan' | 'card' | 'email' | 'import';
  cardLast4: string | null;           // If from corporate card

  // Type
  type: 'standard' | 'mileage' | 'per_diem' | 'time';
  mileage: {
    distance: number | null;
    unit: 'miles' | 'km';
    rate: number;
    startLocation: string | null;
    endLocation: string | null;
    routeCoordinates: GeoPoint[] | null;
  } | null;

  // Report association
  reportId: string | null;
  reportName: string | null;          // Denormalized

  // Status
  status: 'unreported' | 'reported' | 'submitted' | 'approved' | 'rejected' | 'reimbursed';

  // Attendees (for meals/events)
  attendees: {
    name: string;
    email: string | null;
  }[];

  // Splits
  splits: {
    userId: string;
    amount: number;
    percentage: number;
  }[] | null;

  // Policy violations
  violations: {
    type: string;                     // "over_limit", "missing_receipt", "duplicate", etc.
    message: string;
    severity: 'warning' | 'error';
  }[];

  // AI metadata
  aiConfidence: number | null;        // 0-1 confidence score from AI categorization
  aiSuggestions: {
    field: string;
    value: string;
    confidence: number;
  }[] | null;

  // Comments thread
  commentCount: number;
  lastCommentAt: Timestamp | null;

  // Flags
  isDuplicate: boolean;
  isBillable: boolean;
  isReimbursable: boolean;
  isRecurring: boolean;
}
```

### 7. `reports` Collection

```typescript
interface ExpenseReport {
  // Document ID = auto-generated
  id: string;
  title: string;                      // "Trip to NYC - Jan 2026"
  description: string;

  // Ownership
  userId: string;                     // Submitter
  userEmail: string;
  userDisplayName: string;
  workspaceId: string;

  // Expenses (denormalized summary)
  expenseIds: string[];
  expenseCount: number;
  totalAmount: number;
  currency: string;

  // Category breakdown (denormalized)
  categoryBreakdown: {
    categoryId: string;
    categoryName: string;
    amount: number;
    count: number;
  }[];

  // Status + workflow
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'processing' | 'reimbursed' | 'closed';

  // Approval chain
  approvals: {
    approverId: string;
    approverName: string;
    approverEmail: string;
    status: 'pending' | 'approved' | 'rejected' | 'held';
    comment: string | null;
    decidedAt: Timestamp | null;
    level: number;                    // 1 = first approver, 2 = second, etc.
  }[];
  currentApprovalLevel: number;

  // Dates
  submittedAt: Timestamp | null;
  approvedAt: Timestamp | null;
  rejectedAt: Timestamp | null;
  reimbursedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Reimbursement
  reimbursement: {
    method: 'ach' | 'card' | 'manual' | null;
    transactionId: string | null;
    amount: number;
    processedAt: Timestamp | null;
  } | null;

  // Violations summary
  violationCount: number;
  hasBlockingViolations: boolean;

  // Chat
  chatId: string | null;             // Associated chat thread
  commentCount: number;
}
```

### 8. `receipts` Collection

```typescript
interface Receipt {
  // Document ID = auto-generated
  id: string;
  expenseId: string;
  userId: string;

  // Storage
  originalUrl: string;               // Original image/PDF URL
  thumbnailUrl: string;              // Auto-generated thumbnail
  fileName: string;
  fileType: string;                  // "image/jpeg", "application/pdf", etc.
  fileSize: number;                  // Bytes

  // OCR Results
  ocrStatus: 'pending' | 'processing' | 'completed' | 'failed';
  ocrRawText: string | null;         // Full OCR text
  ocrExtractedData: {
    merchant: string | null;
    address: string | null;
    date: string | null;
    time: string | null;
    subtotal: number | null;
    tax: number | null;
    tip: number | null;
    total: number | null;
    currency: string | null;
    paymentMethod: string | null;
    items: {
      name: string;
      quantity: number;
      price: number;
    }[] | null;
  } | null;

  // AI Confidence
  confidence: number | null;         // 0-1 overall confidence
  fieldConfidences: Record<string, number> | null;
  needsHumanReview: boolean;

  // Metadata
  processedAt: Timestamp | null;
  createdAt: Timestamp;
}
```

### 9. `chats` Collection

```typescript
interface Chat {
  // Document ID = auto-generated
  id: string;
  type: 'direct' | 'group' | 'expense' | 'report' | 'workspace' | 'invoice';

  // Context
  workspaceId: string | null;
  relatedEntityId: string | null;    // expenseId, reportId, invoiceId
  relatedEntityType: string | null;

  // Participants
  participantIds: string[];
  participantDetails: {
    userId: string;
    displayName: string;
    avatarUrl: string | null;
    lastReadAt: Timestamp;
  }[];

  // Chat metadata
  name: string | null;               // For group chats
  iconUrl: string | null;

  // Last message (denormalized for chat list)
  lastMessage: {
    text: string;
    senderId: string;
    senderName: string;
    sentAt: Timestamp;
    type: 'text' | 'system' | 'attachment';
  } | null;

  // Stats
  messageCount: number;
  unreadCounts: Record<string, number>;  // userId → unread count

  // Settings
  isMuted: Record<string, boolean>;     // userId → muted status
  isPinned: Record<string, boolean>;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 10. `chats/{chatId}/messages` Subcollection

```typescript
interface ChatMessage {
  // Document ID = auto-generated
  id: string;
  chatId: string;

  // Sender
  senderId: string;
  senderName: string;
  senderAvatarUrl: string | null;

  // Content
  type: 'text' | 'system' | 'expense' | 'report' | 'attachment' | 'task';
  text: string;
  html: string | null;               // Rendered HTML with @mentions
  
  // Rich content
  attachments: {
    url: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    thumbnailUrl: string | null;
  }[] | null;

  // @mentions
  mentions: {
    userId: string;
    displayName: string;
    offset: number;                   // Character position in text
  }[] | null;

  // Thread
  parentMessageId: string | null;     // For threaded replies
  threadMessageCount: number;

  // Reactions
  reactions: Record<string, string[]>; // emoji → [userIds]

  // Task (if type === 'task')
  task: {
    title: string;
    assigneeId: string;
    assigneeName: string;
    isCompleted: boolean;
    completedAt: Timestamp | null;
  } | null;

  // Status
  isEdited: boolean;
  isDeleted: boolean;
  editedAt: Timestamp | null;
  sentAt: Timestamp;
}
```

### 11. `invoices` Collection

```typescript
interface Invoice {
  id: string;

  // Issuer
  issuerId: string;
  issuerWorkspaceId: string;
  issuerName: string;
  issuerEmail: string;
  issuerAddress: string;
  issuerLogo: string | null;

  // Recipient
  recipientName: string;
  recipientEmail: string;
  recipientAddress: string;
  recipientPhone: string | null;

  // Invoice details
  invoiceNumber: string;             // Auto-generated, sequential
  purchaseOrderNumber: string | null;
  issueDate: Timestamp;
  dueDate: Timestamp;
  currency: string;

  // Line items
  lineItems: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    taxRate: number;
    taxAmount: number;
    categoryId: string | null;
  }[];

  // Totals
  subtotal: number;
  taxTotal: number;
  discountAmount: number;
  discountType: 'percentage' | 'fixed' | null;
  totalAmount: number;

  // Status
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  paidAt: Timestamp | null;
  paidAmount: number;
  paymentMethod: string | null;

  // Communication
  chatId: string | null;
  notes: string;
  terms: string;

  // Metadata
  sentAt: Timestamp | null;
  viewedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 12. `bills` Collection

```typescript
interface Bill {
  id: string;

  // Workspace
  workspaceId: string;
  uploadedById: string;

  // Vendor info
  vendorName: string;
  vendorEmail: string | null;
  vendorAddress: string | null;

  // Bill details
  billNumber: string | null;
  issueDate: Timestamp;
  dueDate: Timestamp;
  currency: string;
  totalAmount: number;

  // Line items
  lineItems: {
    description: string;
    amount: number;
    categoryId: string | null;
  }[];

  // Status
  status: 'pending' | 'approved' | 'scheduled' | 'paid' | 'overdue' | 'cancelled';

  // Approval
  approverId: string | null;
  approvedAt: Timestamp | null;

  // Payment
  paymentMethod: 'ach' | 'card' | 'manual' | null;
  paymentDate: Timestamp | null;
  paymentReference: string | null;

  // Attachment
  attachmentUrl: string | null;
  ocrExtractedData: Record<string, any> | null;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 13. `notifications` Collection

```typescript
interface Notification {
  id: string;
  userId: string;                    // Recipient
  type: 'expense_approved' | 'expense_rejected' | 'report_submitted' |
        'report_approved' | 'report_rejected' | 'chat_message' |
        'invoice_paid' | 'bill_due' | 'policy_violation' |
        'task_assigned' | 'mention' | 'system';
  title: string;
  body: string;
  data: Record<string, any>;        // Context-specific data (IDs, links)
  
  // Source
  actorId: string | null;           // Who triggered this
  actorName: string | null;
  actorAvatarUrl: string | null;

  // Status
  isRead: boolean;
  readAt: Timestamp | null;

  // Navigation
  actionUrl: string;                 // Deep link to relevant page
  
  createdAt: Timestamp;
}
```

### 14. `audit_logs` Collection

```typescript
interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  workspaceId: string | null;
  
  // Action
  action: string;                    // "expense.created", "report.approved", etc.
  entityType: 'expense' | 'report' | 'invoice' | 'bill' | 'workspace' | 'user';
  entityId: string;
  
  // Changes
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  
  // Context
  ipAddress: string | null;
  userAgent: string | null;
  
  createdAt: Timestamp;
}
```

---

## 🔍 Firestore Indexes

The following composite indexes should be created for common queries:

```
# firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "expenses",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "expenses",
      "fields": [
        { "fieldPath": "workspaceId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "expenses",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "reports",
      "fields": [
        { "fieldPath": "workspaceId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "submittedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "chats",
      "fields": [
        { "fieldPath": "participantIds", "arrayConfig": "CONTAINS" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "notifications",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "isRead", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 🛡 Security Rules Summary

See `firestore.rules` for full rules, but the core principles are:

1. **Users can only read/write their own data** (expenses, reports, notifications)
2. **Workspace members can read workspace data** (categories, tags, rules)
3. **Approvers can read/update reports** assigned to them
4. **Admins/owners can modify workspace settings** and manage members
5. **Chat messages are readable only by participants** of that chat
6. **Audit logs are write-only** (append-only, no deletions)
