# 14 — Feature Priority Roadmap

---

## 🎯 Overview

This document organizes all features into phased milestones. Each phase builds on the previous, ensuring a working application at every stage. **Start with Phase 1 (MVP)** and iterate.

---

## 🏗 Phase 1: MVP (Weeks 1-6)

> **Goal:** A working expense tracker with AI receipt scanning, basic reports, and clean UI.
> **Tagline:** "Track expenses, scan receipts, submit reports — done."

### Week 1-2: Foundation
| Task | Priority | Est. Hours |
|------|----------|-----------|
| Project setup (Next.js, TypeScript, Firebase) | 🔴 Critical | 4 |
| Firebase configuration (Auth, Firestore, Storage) | 🔴 Critical | 3 |
| Design system implementation (colors, typography, components) | 🔴 Critical | 8 |
| Landing / marketing page | 🟡 High | 6 |
| Auth: Sign up, Sign in, Forgot password | 🔴 Critical | 8 |
| Auth: Google OAuth | 🟡 High | 3 |
| Basic onboarding flow (3 steps) | 🟡 High | 4 |
| Main app layout: Sidebar + Header + Content area | 🔴 Critical | 6 |
| Mobile-responsive bottom tab navigation | 🔴 Critical | 4 |
| Dark mode support | 🟢 Medium | 3 |

### Week 3-4: Core Expense Management
| Task | Priority | Est. Hours |
|------|----------|-----------|
| Expense list page with filters and search | 🔴 Critical | 8 |
| Create/Edit expense form | 🔴 Critical | 6 |
| Expense detail page | 🔴 Critical | 4 |
| Default expense categories (15 categories) | 🔴 Critical | 2 |
| Receipt upload (drag & drop + file picker) | 🔴 Critical | 4 |
| AI Receipt scanning (OCR + Gemini extraction) | 🔴 Critical | 12 |
| Scan result review UI (confidence scores) | 🔴 Critical | 6 |
| Expense status management | 🟡 High | 3 |
| Basic policy violation detection | 🟡 High | 4 |

### Week 5-6: Reports & Dashboard
| Task | Priority | Est. Hours |
|------|----------|-----------|
| Expense reports: Create, edit, add expenses | 🔴 Critical | 8 |
| Report submission flow | 🔴 Critical | 4 |
| Report approval/rejection (single approver) | 🔴 Critical | 6 |
| Report status timeline | 🟡 High | 3 |
| Inbox / Home dashboard | 🔴 Critical | 6 |
| Analytics: Stat cards (total spend, count, etc.) | 🟡 High | 4 |
| Analytics: Spending over time chart | 🟡 High | 4 |
| Analytics: Category breakdown chart | 🟡 High | 4 |
| Notification system (in-app) | 🟡 High | 6 |
| User profile settings | 🟡 High | 4 |

### MVP Deliverables ✅
- [ ] Users can sign up, log in, manage profile
- [ ] Users can create expenses manually
- [ ] Users can scan receipts and AI extracts data
- [ ] Users can create reports, add expenses, submit for approval
- [ ] Approvers can approve/reject reports
- [ ] Dashboard shows spending overview with charts
- [ ] In-app notifications for key events
- [ ] Responsive design (desktop + mobile)
- [ ] Dark mode

---

## 🚀 Phase 2: Collaboration & Workspaces (Weeks 7-10)

> **Goal:** Multi-user collaboration with workspaces, chat, and advanced policies.
> **Tagline:** "Manage your team's expenses together."

### Week 7-8: Workspaces
| Task | Priority | Est. Hours |
|------|----------|-----------|
| Workspace creation and management | 🔴 Critical | 8 |
| Member invitation and management | 🔴 Critical | 6 |
| Role-based access control (5 roles) | 🔴 Critical | 8 |
| Workspace switching (sidebar dropdown) | 🔴 Critical | 3 |
| Custom categories per workspace | 🟡 High | 4 |
| Custom tags per workspace | 🟡 High | 3 |
| Workspace rules and policies editor | 🟡 High | 6 |
| Advanced approval workflows (multi-level) | 🟡 High | 8 |

### Week 9-10: Chat & Collaboration
| Task | Priority | Est. Hours |
|------|----------|-----------|
| Real-time chat (Firestore subscriptions) | 🔴 Critical | 12 |
| Chat on expenses (comment threads) | 🔴 Critical | 6 |
| Chat on reports | 🔴 Critical | 4 |
| Direct messages | 🟡 High | 4 |
| Group chats | 🟡 High | 4 |
| @Mentions with user picker | 🟡 High | 4 |
| Chat notifications | 🟡 High | 3 |
| Email notifications (Resend integration) | 🟡 High | 4 |
| Batch receipt scanning | 🟡 High | 4 |
| Expense splitting | 🟡 High | 4 |

### Phase 2 Deliverables ✅
- [ ] Multi-workspace support with switching
- [ ] Team member management with roles
- [ ] Real-time chat on expenses and reports
- [ ] Advanced approval workflows
- [ ] Custom categories, tags, and policies per workspace
- [ ] @Mentions and email notifications

---

## 📈 Phase 3: Financial Tools (Weeks 11-14)

> **Goal:** Full financial management with invoicing, bill pay, and advanced analytics.
> **Tagline:** "Your complete financial operations platform."

### Week 11-12: Invoices & Bills
| Task | Priority | Est. Hours |
|------|----------|-----------|
| Invoice creation form | 🟡 High | 8 |
| Invoice preview and PDF generation | 🟡 High | 6 |
| Invoice sending (email) | 🟡 High | 4 |
| Invoice status tracking | 🟡 High | 3 |
| Invoice payment page (for recipients) | 🟡 High | 6 |
| Bill upload and AI scanning | 🟡 High | 6 |
| Bill approval workflow | 🟡 High | 4 |
| Bill payment tracking | 🟡 High | 3 |

### Week 13-14: Advanced Features
| Task | Priority | Est. Hours |
|------|----------|-----------|
| Mileage tracking with map integration | 🟡 High | 8 |
| Trip grouping and travel expense summaries | 🟡 High | 4 |
| AI Concierge assistant | 🟡 High | 8 |
| AI spending insights on dashboard | 🟡 High | 4 |
| Report export (PDF) | 🟡 High | 6 |
| Report export (CSV) | 🟡 High | 2 |
| Advanced analytics: Budget vs. Actual | 🟡 High | 4 |
| Advanced analytics: Merchant trends | 🟡 High | 3 |
| Audit log viewer (for admins) | 🟢 Medium | 4 |
| Per diem rate management | 🟢 Medium | 3 |

### Phase 3 Deliverables ✅
- [ ] Create, send, and track invoices
- [ ] Upload, approve, and pay bills
- [ ] Mileage tracking with route visualization
- [ ] AI concierge for expense help
- [ ] Report PDF/CSV export
- [ ] Budget tracking and advanced analytics

---

## 🔮 Phase 4: Polish & Scale (Weeks 15+)

> **Goal:** Enterprise features, performance optimization, and market readiness.

| Feature | Priority | Category |
|---------|----------|----------|
| Multi-currency conversion | 🟡 High | Financial |
| Recurring expenses auto-detection | 🟡 High | AI |
| AI duplicate detection | 🟡 High | AI |
| Task management in chat | 🟢 Medium | Collaboration |
| Workspace #announce channel | 🟢 Medium | Collaboration |
| Apple Sign-In | 🟢 Medium | Auth |
| Magic link auth | 🟢 Medium | Auth |
| Two-factor authentication | 🟢 Medium | Security |
| SAML/SSO integration | 🟢 Medium | Enterprise |
| QuickBooks integration | 🟢 Medium | Accounting |
| Xero integration | 🟢 Medium | Accounting |
| Webhook system for external triggers | 🟢 Medium | Developer |
| Public API documentation | 🟢 Medium | Developer |
| Email receipt forwarding | 🟢 Medium | Automation |
| Mobile PWA enhancements | 🟢 Medium | Mobile |
| Offline mode | 🔵 Nice | Mobile |
| Credit card linking & auto-import | 🔵 Nice | Financial |
| Virtual cards | 🔵 Nice | Financial |
| Travel booking integration | 🔵 Nice | Travel |
| Time tracking for billable hours | 🔵 Nice | Billing |
| Custom report templates | 🔵 Nice | Reports |
| Performance optimization & caching | 🟡 High | Tech |
| Load testing | 🟡 High | Tech |
| i18n (internationalization) | 🟢 Medium | UX |
| Storybook component library | 🟢 Medium | Dev |

---

## 📊 Milestone Summary

| Phase | Duration | Sprint Focus | Features |
|-------|----------|-------------|----------|
| **Phase 1 (MVP)** | 6 weeks | Core product | Auth, expenses, scanning, reports, dashboard |
| **Phase 2** | 4 weeks | Collaboration | Workspaces, chat, teams, policies |
| **Phase 3** | 4 weeks | Financial | Invoices, bills, mileage, AI assistant |
| **Phase 4** | Ongoing | Scale | Integrations, enterprise, performance |

---

## 🤖 AI Implementation Instructions

When handing each phase to an AI coding assistant, provide:

1. **This plan document** for the relevant section
2. **Database schema** (always include `02-database-schema.md`)
3. **Design system** (always include `12-ui-design-system.md`)
4. **Working context** — What's already been built in previous phases
5. **Specific instructions** like:
   - *"Implement the expense list page following the wireframe in section 4.1"*
   - *"Set up the receipt scanning API endpoint as specified in section 6"*
   - *"Ensure all colors use the CSS custom properties from the design system"*

### Recommended AI Prompting Pattern

```
# Phase [N] — [Feature Name]

## Context
You are building ExpenseFlow, an Expensify clone. 
The project uses Next.js 14 App Router + TypeScript + Firebase + Gemini AI.

## What's Already Built
- [List completed features from previous phases]

## What to Build Now
- [Specific features from this phase]

## Specifications
[Paste relevant section from the plan]

## Design Requirements
[Paste relevant section from 12-ui-design-system.md]

## Database Schema
[Paste relevant types from 02-database-schema.md]

## Requirements
- Use TypeScript strictly (no `any`)
- Follow the folder structure in 01-tech-stack-and-architecture.md
- All styles must use CSS Modules + design token custom properties
- Add loading and error states for all async operations
- Implement responsive design (mobile-first)
- Support dark mode via .dark class
```

---

## ✅ Success Criteria

The clone is considered successful when:

1. ✅ Users can sign up and manage their account
2. ✅ Users can scan receipts and AI accurately extracts 90%+ of data
3. ✅ Users can create, categorize, and track expenses
4. ✅ Users can create reports, submit, and get approval
5. ✅ Dashboard provides meaningful spending insights
6. ✅ Chat enables real-time collaboration on expenses
7. ✅ Workspaces support team expense management
8. ✅ UI is polished, responsive, and feels premium
9. ✅ App performs well (< 3s initial load, < 200ms interactions)
10. ✅ All critical paths have test coverage
