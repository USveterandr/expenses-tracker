// User Types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  phone: string | null;
  preferences: UserPreferences;
  workspaceIds: string[];
  activeWorkspaceId: string | null;
  status: 'active' | 'inactive' | 'suspended';
  role: 'user' | 'admin' | 'super_admin';
  onboardingCompleted: boolean;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  currency: string;
  locale: string;
  timezone: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  pushNotifications: boolean;
}

// Workspace Types
export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  type: 'personal' | 'team' | 'corporate';
  ownerId: string;
  ownerEmail: string;
  settings: WorkspaceSettings;
  approvalWorkflow: ApprovalWorkflow;
  plan: 'free' | 'collect' | 'control';
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceSettings {
  defaultCurrency: string;
  defaultCategory: string;
  requireReceipts: boolean;
  receiptRequiredAbove: number;
  maxExpenseAmount: number | null;
  autoApproveBelow: number | null;
  mileageRate: number;
  distanceUnit: 'miles' | 'km';
  allowCashExpenses: boolean;
  allowManualExpenses: boolean;
  fiscalYearStart: number;
}

export interface ApprovalWorkflow {
  mode: 'submit_close' | 'submit_approve' | 'advanced';
  defaultApproverId: string | null;
  requireSecondApprovalAbove: number | null;
  secondApproverId: string | null;
  enforceWorkflow: boolean;
}

export interface WorkspaceStats {
  memberCount: number;
  totalExpenses: number;
  totalSpend: number;
  activeReports: number;
}

export interface WorkspaceMember {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: 'owner' | 'admin' | 'approver' | 'member' | 'auditor';
  approverId: string | null;
  departmentId: string | null;
  employeeId: string | null;
  spendingLimit: number | null;
  status: 'active' | 'invited' | 'removed';
  invitedAt: Date;
  joinedAt: Date | null;
}

// Expense Types
export type ExpenseStatus = 'unreported' | 'reported' | 'submitted' | 'approved' | 'rejected' | 'reimbursed';
export type ExpenseSource = 'manual' | 'scan' | 'card' | 'email' | 'import';
export type ExpenseType = 'standard' | 'mileage' | 'per_diem' | 'time';

export interface Expense {
  id: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  workspaceId: string;
  merchant: string;
  description: string;
  amount: number;
  currency: string;
  convertedAmount: number | null;
  convertedCurrency: string | null;
  categoryId: string | null;
  categoryName: string | null;
  tagIds: string[];
  tagNames: string[];
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  receiptId: string | null;
  receiptUrl: string | null;
  receiptThumbnailUrl: string | null;
  hasReceipt: boolean;
  source: ExpenseSource;
  cardLast4: string | null;
  type: ExpenseType;
  mileage: MileageData | null;
  reportId: string | null;
  reportName: string | null;
  status: ExpenseStatus;
  attendees: Attendee[];
  splits: Split[] | null;
  violations: Violation[];
  aiConfidence: number | null;
  aiSuggestions: AISuggestion[] | null;
  commentCount: number;
  lastCommentAt: Date | null;
  isDuplicate: boolean;
  isBillable: boolean;
  isReimbursable: boolean;
  isRecurring: boolean;
}

export interface MileageData {
  distance: number | null;
  unit: 'miles' | 'km';
  rate: number;
  startLocation: string | null;
  endLocation: string | null;
  routeCoordinates: GeoPoint[] | null;
}

export interface Attendee {
  name: string;
  email: string | null;
}

export interface Split {
  userId: string;
  amount: number;
  percentage: number;
}

export interface Violation {
  type: string;
  message: string;
  severity: 'warning' | 'error';
}

export interface AISuggestion {
  field: string;
  value: string;
  confidence: number;
}

// Category Types
export interface ExpenseCategory {
  id: string;
  name: string;
  code: string;
  icon: string;
  color: string;
  parentId: string | null;
  enabled: boolean;
  requireComment: boolean;
  maxAmount: number | null;
  taxRate: number | null;
  sortOrder: number;
  createdAt: Date;
}

// Report Types
export type ReportStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'processing' | 'reimbursed' | 'closed';

export interface ExpenseReport {
  id: string;
  title: string;
  description: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  workspaceId: string;
  expenseIds: string[];
  expenseCount: number;
  totalAmount: number;
  currency: string;
  categoryBreakdown: CategoryBreakdown[];
  status: ReportStatus;
  approvals: Approval[];
  currentApprovalLevel: number;
  submittedAt: Date | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  reimbursedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  reimbursement: Reimbursement | null;
  violationCount: number;
  hasBlockingViolations: boolean;
  chatId: string | null;
  commentCount: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  amount: number;
  count: number;
}

export interface Approval {
  approverId: string;
  approverName: string;
  approverEmail: string;
  status: 'pending' | 'approved' | 'rejected' | 'held';
  comment: string | null;
  decidedAt: Date | null;
  level: number;
}

export interface Reimbursement {
  method: 'ach' | 'card' | 'manual' | null;
  transactionId: string | null;
  amount: number;
  processedAt: Date | null;
}

// Chat Types
export type ChatType = 'direct' | 'group' | 'expense' | 'report' | 'workspace' | 'invoice';
export type MessageType = 'text' | 'system' | 'expense' | 'report' | 'attachment' | 'task';

export interface Chat {
  id: string;
  type: ChatType;
  workspaceId: string | null;
  relatedEntityId: string | null;
  relatedEntityType: string | null;
  participantIds: string[];
  participantDetails: ParticipantDetail[];
  name: string | null;
  iconUrl: string | null;
  lastMessage: LastMessage | null;
  messageCount: number;
  unreadCounts: Record<string, number>;
  isMuted: Record<string, boolean>;
  isPinned: Record<string, boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParticipantDetail {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  lastReadAt: Date;
}

export interface LastMessage {
  text: string;
  senderId: string;
  senderName: string;
  sentAt: Date;
  type: 'text' | 'system' | 'attachment';
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string | null;
  type: MessageType;
  text: string;
  html: string | null;
  attachments: Attachment[] | null;
  mentions: Mention[] | null;
  parentMessageId: string | null;
  threadMessageCount: number;
  reactions: Record<string, string[]>;
  task: Task | null;
  isEdited: boolean;
  isDeleted: boolean;
  editedAt: Date | null;
  sentAt: Date;
}

export interface Attachment {
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  thumbnailUrl: string | null;
}

export interface Mention {
  userId: string;
  displayName: string;
  offset: number;
}

export interface Task {
  title: string;
  assigneeId: string;
  assigneeName: string;
  isCompleted: boolean;
  completedAt: Date | null;
}

// Invoice Types
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  issuerId: string;
  issuerWorkspaceId: string;
  issuerName: string;
  issuerEmail: string;
  issuerAddress: string;
  issuerLogo: string | null;
  recipientName: string;
  recipientEmail: string;
  recipientAddress: string;
  recipientPhone: string | null;
  invoiceNumber: string;
  purchaseOrderNumber: string | null;
  issueDate: Date;
  dueDate: Date;
  currency: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxTotal: number;
  discountAmount: number;
  discountType: 'percentage' | 'fixed' | null;
  totalAmount: number;
  status: InvoiceStatus;
  paidAt: Date | null;
  paidAmount: number;
  paymentMethod: string | null;
  chatId: string | null;
  notes: string;
  terms: string;
  sentAt: Date | null;
  viewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate: number;
  taxAmount: number;
  categoryId: string | null;
}

// Bill Types
export type BillStatus = 'pending' | 'approved' | 'scheduled' | 'paid' | 'overdue' | 'cancelled';

export interface Bill {
  id: string;
  workspaceId: string;
  uploadedById: string;
  vendorName: string;
  vendorEmail: string | null;
  vendorAddress: string | null;
  billNumber: string | null;
  issueDate: Date;
  dueDate: Date;
  currency: string;
  totalAmount: number;
  lineItems: BillLineItem[];
  status: BillStatus;
  approverId: string | null;
  approvedAt: Date | null;
  paymentMethod: 'ach' | 'card' | 'manual' | null;
  paymentDate: Date | null;
  paymentReference: string | null;
  attachmentUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillLineItem {
  description: string;
  amount: number;
  categoryId: string | null;
}

// Receipt Types
export interface Receipt {
  id: string;
  expenseId: string;
  userId: string;
  originalUrl: string;
  thumbnailUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  ocrStatus: 'pending' | 'processing' | 'completed' | 'failed';
  ocrRawText: string | null;
  ocrExtractedData: OCRData | null;
  confidence: number | null;
  needsHumanReview: boolean;
  processedAt: Date | null;
  createdAt: Date;
}

export interface OCRData {
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
  items: ReceiptItem[] | null;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

// Notification Types
export type NotificationType = 
  | 'expense_approved' 
  | 'expense_rejected' 
  | 'report_submitted'
  | 'report_approved' 
  | 'report_rejected' 
  | 'chat_message'
  | 'invoice_paid' 
  | 'bill_due' 
  | 'policy_violation'
  | 'task_assigned' 
  | 'mention' 
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  actorId: string | null;
  actorName: string | null;
  actorAvatarUrl: string | null;
  isRead: boolean;
  readAt: Date | null;
  actionUrl: string;
  createdAt: Date;
}

// Helper Types
interface GeoPoint {
  latitude: number;
  longitude: number;
}
