-- Enable Row Level Security
-- Note: Row Level Security is enabled per table below

-- Create custom types
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');
CREATE TYPE workspace_type AS ENUM ('personal', 'team', 'corporate');
CREATE TYPE workspace_status AS ENUM ('active', 'archived');
CREATE TYPE workspace_plan AS ENUM ('free', 'collect', 'control');
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'approver', 'member', 'auditor');
CREATE TYPE member_status AS ENUM ('active', 'invited', 'removed');
CREATE TYPE expense_status AS ENUM ('unreported', 'reported', 'submitted', 'approved', 'rejected', 'reimbursed');
CREATE TYPE expense_source AS ENUM ('manual', 'scan', 'card', 'email', 'import');
CREATE TYPE expense_type AS ENUM ('standard', 'mileage', 'per_diem', 'time');
CREATE TYPE report_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'processing', 'reimbursed', 'closed');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'held');
CREATE TYPE chat_type AS ENUM ('direct', 'group', 'expense', 'report', 'workspace', 'invoice');
CREATE TYPE message_type AS ENUM ('text', 'system', 'expense', 'report', 'attachment', 'task');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled');
CREATE TYPE bill_status AS ENUM ('pending', 'approved', 'scheduled', 'paid', 'overdue', 'cancelled');
CREATE TYPE ocr_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE notification_type AS ENUM (
  'expense_approved', 'expense_rejected', 'report_submitted', 'report_approved', 
  'report_rejected', 'chat_message', 'invoice_paid', 'bill_due', 'policy_violation',
  'task_assigned', 'mention', 'system'
);

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  preferences JSONB DEFAULT '{
    "currency": "USD",
    "locale": "en-US",
    "timezone": "America/New_York",
    "dateFormat": "MM/DD/YYYY",
    "theme": "light",
    "emailNotifications": true,
    "pushNotifications": true
  }'::jsonb,
  status user_status DEFAULT 'active',
  role user_role DEFAULT 'user',
  onboarding_completed BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspaces table
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  type workspace_type DEFAULT 'personal',
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  owner_email TEXT NOT NULL,
  settings JSONB DEFAULT '{
    "defaultCurrency": "USD",
    "defaultCategory": "uncategorized",
    "requireReceipts": false,
    "receiptRequiredAbove": null,
    "maxExpenseAmount": null,
    "autoApproveBelow": null,
    "mileageRate": 0.65,
    "distanceUnit": "miles",
    "allowCashExpenses": true,
    "allowManualExpenses": true,
    "fiscalYearStart": 1
  }'::jsonb,
  approval_workflow JSONB DEFAULT '{
    "mode": "submit_close",
    "defaultApproverId": null,
    "requireSecondApprovalAbove": null,
    "secondApproverId": null,
    "enforceWorkflow": false
  }'::jsonb,
  plan workspace_plan DEFAULT 'free',
  status workspace_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace members table
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  role member_role DEFAULT 'member',
  approver_id UUID,
  department_id UUID,
  employee_id TEXT,
  spending_limit NUMERIC(12,2),
  status member_status DEFAULT 'invited',
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  UNIQUE(workspace_id, email)
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  icon TEXT DEFAULT 'receipt',
  color TEXT DEFAULT '#6B7280',
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  enabled BOOLEAN DEFAULT true,
  require_comment BOOLEAN DEFAULT false,
  max_amount NUMERIC(12,2),
  tax_rate NUMERIC(5,4),
  sort_order INTEGER DEFAULT 0,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_display_name TEXT NOT NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  merchant TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  converted_amount NUMERIC(12,2),
  converted_currency TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  category_name TEXT,
  tag_ids UUID[] DEFAULT '{}',
  tag_names TEXT[] DEFAULT '{}',
  date DATE NOT NULL,
  receipt_id UUID,
  receipt_url TEXT,
  receipt_thumbnail_url TEXT,
  has_receipt BOOLEAN DEFAULT false,
  source expense_source DEFAULT 'manual',
  card_last4 TEXT,
  type expense_type DEFAULT 'standard',
  mileage JSONB,
  report_id UUID,
  report_name TEXT,
  status expense_status DEFAULT 'unreported',
  attendees JSONB DEFAULT '[]'::jsonb,
  splits JSONB,
  violations JSONB DEFAULT '[]'::jsonb,
  ai_confidence NUMERIC(3,2),
  ai_suggestions JSONB,
  comment_count INTEGER DEFAULT 0,
  last_comment_at TIMESTAMPTZ,
  is_duplicate BOOLEAN DEFAULT false,
  is_billable BOOLEAN DEFAULT false,
  is_reimbursable BOOLEAN DEFAULT true,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense reports table
CREATE TABLE expense_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_display_name TEXT NOT NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  expense_ids UUID[] DEFAULT '{}',
  expense_count INTEGER DEFAULT 0,
  total_amount NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  category_breakdown JSONB DEFAULT '[]'::jsonb,
  status report_status DEFAULT 'draft',
  approvals JSONB DEFAULT '[]'::jsonb,
  current_approval_level INTEGER DEFAULT 1,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  reimbursed_at TIMESTAMPTZ,
  reimbursement JSONB,
  violation_count INTEGER DEFAULT 0,
  has_blocking_violations BOOLEAN DEFAULT false,
  chat_id UUID,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receipts table
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID REFERENCES expenses(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  ocr_status ocr_status DEFAULT 'pending',
  ocr_raw_text TEXT,
  ocr_extracted_data JSONB,
  confidence NUMERIC(3,2),
  needs_human_review BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chats table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type chat_type DEFAULT 'direct',
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  related_entity_id UUID,
  related_entity_type TEXT,
  participant_ids UUID[] DEFAULT '{}',
  participant_details JSONB DEFAULT '[]'::jsonb,
  name TEXT,
  icon_url TEXT,
  last_message JSONB,
  message_count INTEGER DEFAULT 0,
  unread_counts JSONB DEFAULT '{}'::jsonb,
  is_muted JSONB DEFAULT '{}'::jsonb,
  is_pinned JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_avatar_url TEXT,
  type message_type DEFAULT 'text',
  text TEXT NOT NULL,
  html TEXT,
  attachments JSONB,
  mentions JSONB,
  parent_message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  thread_message_count INTEGER DEFAULT 0,
  reactions JSONB DEFAULT '{}'::jsonb,
  task JSONB,
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issuer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  issuer_workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  issuer_name TEXT NOT NULL,
  issuer_email TEXT NOT NULL,
  issuer_address TEXT,
  issuer_logo TEXT,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_address TEXT,
  recipient_phone TEXT,
  invoice_number TEXT NOT NULL,
  purchase_order_number TEXT,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  currency TEXT DEFAULT 'USD',
  line_items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC(12,2) DEFAULT 0,
  tax_total NUMERIC(12,2) DEFAULT 0,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  discount_type TEXT,
  total_amount NUMERIC(12,2) DEFAULT 0,
  status invoice_status DEFAULT 'draft',
  paid_at TIMESTAMPTZ,
  paid_amount NUMERIC(12,2) DEFAULT 0,
  payment_method TEXT,
  chat_id UUID,
  notes TEXT,
  terms TEXT,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bills table
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  uploaded_by_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vendor_name TEXT NOT NULL,
  vendor_email TEXT,
  vendor_address TEXT,
  bill_number TEXT,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  currency TEXT DEFAULT 'USD',
  total_amount NUMERIC(12,2) NOT NULL,
  line_items JSONB DEFAULT '[]'::jsonb,
  status bill_status DEFAULT 'pending',
  approver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  payment_method TEXT,
  payment_date DATE,
  payment_reference TEXT,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_name TEXT,
  actor_avatar_url TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, name)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can read their own profile and workspace members
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Workspaces: Members can read their workspaces
CREATE POLICY "Workspace members can read" ON workspaces
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_id = id AND user_id = auth.uid() AND status = 'active'
    ) OR owner_id = auth.uid()
  );

CREATE POLICY "Users can create workspaces" ON workspaces
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Workspace owners and admins can update" ON workspaces
  FOR UPDATE USING (
    owner_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_id = id AND user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- Workspace Members: Users can manage their own memberships
CREATE POLICY "Users can read own memberships" ON workspace_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own memberships" ON workspace_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Workspace owners can manage members" ON workspace_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspaces 
      WHERE id = workspace_id AND owner_id = auth.uid()
    )
  );

-- Expenses: Users can CRUD their own expenses
CREATE POLICY "Users can read own expenses" ON expenses
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create expenses" ON expenses
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (user_id = auth.uid());

-- Expense Reports: Users can CRUD their own reports
CREATE POLICY "Users can read own reports" ON expense_reports
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create reports" ON expense_reports
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reports" ON expense_reports
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own reports" ON expense_reports
  FOR DELETE USING (user_id = auth.uid());

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to handle new user signup - creates profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, first_name, last_name, status, role, onboarding_completed)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'active',
    'user',
    false
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to create profile on auth user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expense_reports_updated_at BEFORE UPDATE ON expense_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default system categories
INSERT INTO categories (name, code, icon, color, is_system, enabled) VALUES
  ('Meals & Entertainment', 'meals', 'utensils', '#F59E0B', true, true),
  ('Transportation', 'transportation', 'car', '#3B82F6', true, true),
  ('Lodging', 'lodging', 'bed', '#8B5CF6', true, true),
  ('Office Supplies', 'office', 'paperclip', '#10B981', true, true),
  ('Software & Tools', 'software', 'laptop', '#6366F1', true, true),
  ('Marketing', 'marketing', 'megaphone', '#EC4899', true, true),
  ('Professional Services', 'professional', 'briefcase', '#14B8A6', true, true),
  ('Utilities', 'utilities', 'zap', '#F97316', true, true),
  ('Uncategorized', 'uncategorized', 'circle', '#6B7280', true, true);
