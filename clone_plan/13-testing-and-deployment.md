# 13 — Testing & Deployment

---

## 🎯 Overview

This document covers the testing strategy, CI/CD pipeline, deployment configuration, and launch checklist for ExpenseFlow.

---

## 🧪 Testing Strategy

### Testing Pyramid

```
          ╱ E2E Tests ╲           ← Few (critical user flows)
         ╱──────────────╲
        ╱ Integration    ╲        ← Some (API routes, Firebase)
       ╱──────────────────╲
      ╱  Unit Tests        ╲      ← Many (utils, hooks, logic)
     ╱──────────────────────╲
```

### Testing Tools

| Layer | Tool | What to Test |
|-------|------|-------------|
| **Unit** | **Vitest** + **React Testing Library** | Utility functions, hooks, components in isolation |
| **Integration** | **Vitest** + **MSW** (Mock Service Worker) | API routes, Firebase interaction, form submissions |
| **E2E** | **Playwright** | Critical user flows end-to-end |
| **Visual** | **Storybook** + **Chromatic** (optional) | Component visual regression |

### What to Test

**Unit Tests (target: 80%+ coverage on business logic)**
```
✅ Currency formatting and conversion utilities
✅ Date formatting helpers
✅ Expense validation schemas (Zod)
✅ Permission checks (RBAC logic)
✅ Policy violation detection functions
✅ Report total calculations
✅ Category mapping logic
✅ Expense status transitions
✅ Split calculation logic
✅ Search and filter functions
```

**Integration Tests**
```
✅ API routes return correct data
✅ Authentication flow (sign up, sign in, sign out)
✅ Expense CRUD operations
✅ Report submission and approval workflow
✅ Receipt upload and OCR processing
✅ Chat message sending and receiving
✅ Workspace creation and member management
✅ Firestore security rules
```

**E2E Tests (Critical Paths)**
```
✅ User registration → onboarding → first expense
✅ Scan receipt → review → create expense → add to report
✅ Create report → submit → approve → mark reimbursed
✅ Create invoice → send → mark paid
✅ Workspace admin: create workspace → invite members → set policies
✅ Chat: send message → receive notification
✅ Dashboard loads with correct data
```

### Example Test Files

```typescript
// __tests__/utils/currency.test.ts
import { formatCurrency, convertCurrency } from '@/lib/utils/currency';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });
  
  it('formats EUR correctly', () => {
    expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
  });
  
  it('handles zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });
  
  it('handles negative values', () => {
    expect(formatCurrency(-50.00, 'USD')).toBe('-$50.00');
  });
});
```

```typescript
// __tests__/api/expenses.test.ts
import { POST } from '@/app/api/expenses/route';
import { NextRequest } from 'next/server';

describe('POST /api/expenses', () => {
  it('creates an expense with valid data', async () => {
    const req = new NextRequest('http://localhost/api/expenses', {
      method: 'POST',
      body: JSON.stringify({
        merchant: 'Starbucks',
        amount: 4.85,
        currency: 'USD',
        date: '2026-01-15',
        categoryId: 'cat_dining'
      })
    });
    
    const res = await POST(req);
    expect(res.status).toBe(201);
    
    const data = await res.json();
    expect(data.expense.merchant).toBe('Starbucks');
    expect(data.expense.amount).toBe(4.85);
  });
  
  it('rejects expense without required fields', async () => {
    const req = new NextRequest('http://localhost/api/expenses', {
      method: 'POST',
      body: JSON.stringify({ merchant: 'Test' }) // Missing amount, date
    });
    
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    needs: lint-and-type-check
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test -- --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v4

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
```

---

## 🚀 Deployment Configuration

### Firebase Hosting Setup

```json
// firebase.json
{
  "hosting": {
    "source": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "frameworksBackend": {
      "region": "us-east1"
    }
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

### Environment Configuration

| Environment | Purpose | URL |
|------------|---------|-----|
| **Development** | Local dev | `http://localhost:3000` |
| **Staging** | Pre-production testing | `staging.expenseflow.app` |
| **Production** | Live app | `app.expenseflow.app` |

### Firebase Emulators (Local Development)
```bash
# Start all emulators
firebase emulators:start

# Available emulators:
# - Auth:      localhost:9099
# - Firestore: localhost:8080
# - Storage:   localhost:9199
# - Functions: localhost:5001
```

---

## 🔒 Security Checklist

- [ ] All API routes validate authentication token
- [ ] Firestore security rules tested and deployed
- [ ] Storage security rules restrict upload types and sizes
- [ ] Environment variables are NOT committed to Git
- [ ] CORS configured correctly for API routes
- [ ] Rate limiting on scan/AI endpoints
- [ ] Input sanitization on all user inputs
- [ ] XSS protection (React handles by default, but check dangerouslySetInnerHTML)
- [ ] CSRF protection (use SameSite cookies)
- [ ] File upload validation (type, size, content inspection)
- [ ] SQL injection prevention (N/A with Firestore, but still sanitize)
- [ ] Audit logging enabled for sensitive actions

---

## 📋 Launch Checklist

### Pre-Launch
- [ ] All MVP features implemented and tested
- [ ] Responsive design verified on major screen sizes
- [ ] Dark mode works correctly
- [ ] Error handling for all API endpoints
- [ ] Loading states for all async operations
- [ ] Empty states for all list views
- [ ] 404 page implemented
- [ ] Error boundary implemented
- [ ] Favicon and app icons configured
- [ ] Meta tags and SEO for landing page
- [ ] Performance audit (Lighthouse score > 80)
- [ ] Accessibility audit (no critical a11y issues)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness verified

### Deploy
- [ ] Firebase project created (production)
- [ ] Firestore indexes deployed
- [ ] Security rules deployed
- [ ] Environment variables configured in hosting
- [ ] Custom domain configured (optional)
- [ ] SSL/HTTPS verified
- [ ] Error monitoring enabled (Sentry)
- [ ] Analytics enabled (Firebase Analytics)
- [ ] Backup strategy for Firestore (scheduled exports)

### Post-Launch
- [ ] Monitor error rates in Sentry
- [ ] Monitor Firebase usage and billing
- [ ] Collect user feedback
- [ ] Plan V2 features based on feedback
