# 03 — Authentication & User Management

---

## 🎯 Overview

This document covers the complete authentication system, user registration, profile management, and role-based access control (RBAC) for ExpenseFlow. The system supports email/password login, Google OAuth, and provides a smooth onboarding experience.

---

## 🔐 Authentication Methods

### Supported Auth Providers
| Method | Provider | Priority |
|--------|----------|----------|
| **Email + Password** | Firebase Auth | MVP |
| **Google Sign-In** | Firebase Auth (Google provider) | MVP |
| **Apple Sign-In** | Firebase Auth (Apple provider) | V2 |
| **SAML/SSO** | Firebase Auth (SAML provider) | V3 |
| **Magic Link** | Firebase Auth (email link) | V2 |

---

## 📱 Screens & User Flows

### 3.1 Landing / Marketing Page
**Route:** `/`

- Hero section with tagline: *"AI-Powered Expense Management. Simplified."*
- Feature highlights with animated illustrations
- Pricing section (Free, Pro, Enterprise)
- CTA buttons: "Get Started Free" and "Sign In"
- Footer with links

### 3.2 Sign Up Page
**Route:** `/signup`

**UI Elements:**
- Logo + app name at top
- Google OAuth button (primary): *"Continue with Google"*
- Divider: *"or"*
- Form fields:
  - First Name (required)
  - Last Name (required)
  - Work Email (required, validated)
  - Password (required, 8+ chars, strength indicator)
  - Company Name (optional)
- Checkbox: "I agree to Terms of Service and Privacy Policy"
- Submit button: *"Create Account"*
- Link: *"Already have an account? Sign in"*

**Flow:**
```
1. User fills form → Client-side validation (Zod)
2. Firebase Auth createUser(email, password)
3. Create user document in Firestore (users collection)
4. If company name provided → Create personal workspace
5. Send email verification
6. Redirect to onboarding flow
```

### 3.3 Sign In Page
**Route:** `/login`

**UI Elements:**
- Logo + app name
- Google OAuth button
- Divider
- Email input
- Password input with show/hide toggle
- "Forgot password?" link
- Submit button: *"Sign In"*
- Link: *"Don't have an account? Sign up"*

**Flow:**
```
1. User enters credentials → Firebase Auth signInWithEmailAndPassword()
2. On success → Fetch user profile from Firestore
3. Update lastLoginAt timestamp
4. Redirect to /inbox (or last visited page)
```

### 3.4 Forgot Password Page
**Route:** `/forgot-password`

- Email input
- Submit button: *"Send Reset Link"*
- Success message: *"Check your email for a password reset link"*
- Uses Firebase Auth `sendPasswordResetEmail()`

### 3.5 Onboarding Flow
**Route:** `/onboarding`  
**Shows after first sign up, before main app access**

**Step 1: Welcome**
- Animated welcome screen
- *"Welcome to ExpenseFlow, [First Name]! Let's set you up in 60 seconds."*
- "Get Started" button

**Step 2: Your Role**
- *"How will you use ExpenseFlow?"*
- Options (radio cards):
  - 🧑‍💼 *"I track my own expenses"* (personal/freelancer)
  - 👥 *"I manage a team's expenses"* (manager/admin)
  - 🏢 *"I need company-wide expense management"* (enterprise)
- Selection determines default workspace settings

**Step 3: Currency & Preferences**
- Default currency selector (USD, EUR, GBP, CAD, AUD, etc.)
- Date format preference
- Distance unit (miles vs. km)

**Step 4: Create Your First Workspace**
- Workspace name (pre-filled with company name if provided during signup)
- Option to skip (creates a default "Personal" workspace)

**Step 5: Invite Team Members** *(optional)*
- Email input with "Add more" button
- Send invites now or skip
- *"You can always invite teammates later"*

**Step 6: All Set!**
- Confetti animation 🎉
- Quick action buttons:
  - "Scan your first receipt"
  - "Create an expense"
  - "Explore the dashboard"

---

## 👤 User Profile Settings

**Route:** `/settings/profile`

**Editable fields:**
- Avatar (upload image, crop)
- First Name / Last Name
- Display Name
- Phone Number
- Job Title
- Department
- Employee ID

**Route:** `/settings/preferences`
- Default Currency
- Date Format
- Timezone
- Theme (Light / Dark / System)
- Language
- Email Notification Toggles:
  - Report submitted for approval
  - Report approved/rejected
  - New chat message
  - Invoice paid
  - Bill due reminders
  - Weekly spending summary

**Route:** `/settings/security`
- Change Password
- Two-Factor Authentication (V2)
- Active Sessions
- Delete Account

**Route:** `/settings/wallet`
- Linked Bank Accounts
- Payment Methods
- Transaction History
- Reimbursement Preferences

---

## 🛡 Role-Based Access Control (RBAC)

### Global Roles (across the platform)

| Role | Description | Permissions |
|------|-------------|-------------|
| `super_admin` | Platform administrator | Everything. Manages all workspaces |
| `admin` | System administrator | Manage users, view all workspaces |
| `user` | Standard user | Create/manage own expenses, join workspaces |

### Workspace Roles (per workspace)

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| `owner` | Created the workspace | Full control: settings, members, billing, delete workspace |
| `admin` | Workspace administrator | Manage members, categories, policies. Approve any report |
| `approver` | Expense approver | View/approve/reject reports from assigned members |
| `member` | Standard member | Create expenses, submit reports, view own data |
| `auditor` | Read-only access | View all expenses and reports (no edits). For accountants |

### Permission Matrix

```typescript
const WORKSPACE_PERMISSIONS = {
  // Expense permissions
  'expense:create':       ['owner', 'admin', 'approver', 'member'],
  'expense:read:own':     ['owner', 'admin', 'approver', 'member', 'auditor'],
  'expense:read:all':     ['owner', 'admin', 'auditor'],
  'expense:read:team':    ['owner', 'admin', 'approver'],
  'expense:update:own':   ['owner', 'admin', 'approver', 'member'],
  'expense:delete:own':   ['owner', 'admin', 'approver', 'member'],

  // Report permissions
  'report:create':        ['owner', 'admin', 'approver', 'member'],
  'report:submit':        ['owner', 'admin', 'approver', 'member'],
  'report:approve':       ['owner', 'admin', 'approver'],
  'report:reject':        ['owner', 'admin', 'approver'],
  'report:view:all':      ['owner', 'admin', 'auditor'],
  
  // Workspace management
  'workspace:settings':   ['owner', 'admin'],
  'workspace:members':    ['owner', 'admin'],
  'workspace:categories': ['owner', 'admin'],
  'workspace:policies':   ['owner', 'admin'],
  'workspace:billing':    ['owner'],
  'workspace:delete':     ['owner'],

  // Chat
  'chat:create':          ['owner', 'admin', 'approver', 'member'],
  'chat:read':            ['owner', 'admin', 'approver', 'member', 'auditor'],

  // Invoice/Bill
  'invoice:create':       ['owner', 'admin'],
  'invoice:send':         ['owner', 'admin'],
  'bill:approve':         ['owner', 'admin'],
  'bill:pay':             ['owner', 'admin'],

  // Analytics
  'analytics:personal':   ['owner', 'admin', 'approver', 'member'],
  'analytics:workspace':  ['owner', 'admin', 'auditor'],
};
```

### Permission Check Hook

```typescript
// src/lib/hooks/usePermission.ts
import { useAuth } from './useAuth';
import { useWorkspace } from './useWorkspace';

export function usePermission(permission: string): boolean {
  const { user } = useAuth();
  const { currentWorkspace, memberRole } = useWorkspace();
  
  if (!user || !currentWorkspace || !memberRole) return false;
  
  const allowedRoles = WORKSPACE_PERMISSIONS[permission];
  if (!allowedRoles) return false;
  
  return allowedRoles.includes(memberRole);
}

// Usage in component:
// const canApprove = usePermission('report:approve');
```

---

## 🔗 Auth Implementation Details

### Firebase Auth Setup

```typescript
// src/lib/firebase/auth.ts

import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { app } from './config';

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Helper functions
export async function signUp(email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(credential.user);
  return credential.user;
}

export async function signIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signInWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  return credential.user;
}

export async function logOut() {
  await signOut(auth);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}
```

### Auth State Provider

```typescript
// src/lib/hooks/useAuth.ts
'use client';

import { create } from 'zustand';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase/auth';
import { getUserProfile } from '@/lib/firebase/firestore';
import { User } from '@/types/user';

interface AuthState {
  firebaseUser: FirebaseUser | null;
  userProfile: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  userProfile: null,
  isLoading: true,
  isAuthenticated: false,
  initialize: () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        set({ 
          firebaseUser, 
          userProfile: profile, 
          isAuthenticated: true, 
          isLoading: false 
        });
      } else {
        set({ 
          firebaseUser: null, 
          userProfile: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
      }
    });
  }
}));
```

### Protected Route Middleware

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/forgot-password'];
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];

export function middleware(req: NextRequest) {
  const token = req.cookies.get('__session')?.value;
  const { pathname } = req.nextUrl;

  // If user is authenticated and trying to access auth pages → redirect to inbox
  if (token && AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/inbox', req.url));
  }

  // If user is NOT authenticated and trying to access dashboard → redirect to login
  if (!token && !PUBLIC_ROUTES.some(route => pathname === route)) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```

---

## 📧 User Invitation System

### Invitation Flow
```
1. Admin enters email(s) in workspace invite form
2. System creates invitation documents in `workspaces/{id}/members` with status "invited"
3. Sends invitation email via Resend/SendGrid
4. Email contains link: /join?workspace={id}&token={token}
5. If user has account → Accept invite, add workspace to their profile
6. If new user → Redirect to signup with pre-filled workspace join
7. On acceptance → Update member status to "active"
```

### Invitation Email Template
- From: "ExpenseFlow" <noreply@expenseflow.app>
- Subject: "[Admin Name] invited you to [Workspace Name] on ExpenseFlow"
- Body: Welcome message, workspace details, accept button, expiry notice (7 days)
