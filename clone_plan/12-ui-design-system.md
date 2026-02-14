# 12 — UI Design System

---

## 🎯 Overview

This document defines the complete design system for ExpenseFlow. Every component, color, spacing, and animation should follow these guidelines to achieve a cohesive, premium experience inspired by Expensify's clean design language with modern enhancements.

---

## 🎨 Color Palette

### Primary Colors (Inspired by Expensify's green with modern twist)

```css
:root {
  /* ═══ Primary — Emerald Green ═══ */
  --color-primary-50:  #ecfdf5;
  --color-primary-100: #d1fae5;
  --color-primary-200: #a7f3d0;
  --color-primary-300: #6ee7b7;
  --color-primary-400: #34d399;
  --color-primary-500: #10b981;    /* ← Main primary */
  --color-primary-600: #059669;
  --color-primary-700: #047857;
  --color-primary-800: #065f46;
  --color-primary-900: #064e3b;

  /* ═══ Secondary — Slate ═══ */
  --color-secondary-50:  #f8fafc;
  --color-secondary-100: #f1f5f9;
  --color-secondary-200: #e2e8f0;
  --color-secondary-300: #cbd5e1;
  --color-secondary-400: #94a3b8;
  --color-secondary-500: #64748b;
  --color-secondary-600: #475569;
  --color-secondary-700: #334155;
  --color-secondary-800: #1e293b;
  --color-secondary-900: #0f172a;

  /* ═══ Accent — Violet ═══ */
  --color-accent-400: #a78bfa;
  --color-accent-500: #8b5cf6;
  --color-accent-600: #7c3aed;

  /* ═══ Semantic Colors ═══ */
  --color-success-50:  #f0fdf4;
  --color-success-500: #22c55e;
  --color-success-600: #16a34a;

  --color-warning-50:  #fffbeb;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;

  --color-error-50:  #fef2f2;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;

  --color-info-50:  #eff6ff;
  --color-info-500: #3b82f6;
  --color-info-600: #2563eb;

  /* ═══ Dark Mode ═══ */
  --color-dark-bg:       #0a0a0f;
  --color-dark-surface:  #12121a;
  --color-dark-card:     #1a1a2e;
  --color-dark-border:   #2a2a3e;
  --color-dark-text:     #e2e8f0;
  --color-dark-muted:    #94a3b8;
}
```

### Gradients

```css
:root {
  --gradient-primary: linear-gradient(135deg, #10b981, #059669);
  --gradient-accent:  linear-gradient(135deg, #8b5cf6, #6366f1);
  --gradient-hero:    linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #064e3b 100%);
  --gradient-card:    linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
  --gradient-glow:    radial-gradient(circle at 50% 0%, rgba(16,185,129,0.15), transparent 70%);
}
```

---

## 📝 Typography

### Font Stack
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### Type Scale
```css
:root {
  /* Heading sizes */
  --text-display:  3rem;      /* 48px — Hero sections */
  --text-h1:       2.25rem;   /* 36px — Page titles */
  --text-h2:       1.875rem;  /* 30px — Section titles */
  --text-h3:       1.5rem;    /* 24px — Card titles */
  --text-h4:       1.25rem;   /* 20px — Subheadings */
  --text-h5:       1.125rem;  /* 18px — Labels */
  
  /* Body sizes */
  --text-lg:       1.125rem;  /* 18px */
  --text-base:     1rem;      /* 16px — Default body */
  --text-sm:       0.875rem;  /* 14px — Secondary text */
  --text-xs:       0.75rem;   /* 12px — Captions, badges */
  --text-xxs:      0.625rem;  /* 10px — Micro labels */
  
  /* Line heights */
  --leading-tight:    1.25;
  --leading-normal:   1.5;
  --leading-relaxed:  1.75;
  
  /* Font weights */
  --weight-light:     300;
  --weight-regular:   400;
  --weight-medium:    500;
  --weight-semibold:  600;
  --weight-bold:      700;
  --weight-extrabold: 800;
}
```

---

## 📐 Spacing & Layout

```css
:root {
  /* Spacing scale (4px base) */
  --space-0:   0;
  --space-1:   0.25rem;   /* 4px */
  --space-2:   0.5rem;    /* 8px */
  --space-3:   0.75rem;   /* 12px */
  --space-4:   1rem;      /* 16px */
  --space-5:   1.25rem;   /* 20px */
  --space-6:   1.5rem;    /* 24px */
  --space-8:   2rem;      /* 32px */
  --space-10:  2.5rem;    /* 40px */
  --space-12:  3rem;      /* 48px */
  --space-16:  4rem;      /* 64px */
  --space-20:  5rem;      /* 80px */
  --space-24:  6rem;      /* 96px */
  
  /* Border radius */
  --radius-sm:    0.375rem;  /* 6px */
  --radius-md:    0.5rem;    /* 8px */
  --radius-lg:    0.75rem;   /* 12px */
  --radius-xl:    1rem;      /* 16px */
  --radius-2xl:   1.5rem;    /* 24px */
  --radius-full:  9999px;    /* Pill */
  
  /* Shadows */
  --shadow-sm:    0 1px 2px rgba(0,0,0,0.05);
  --shadow-md:    0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
  --shadow-lg:    0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
  --shadow-xl:    0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
  --shadow-glow:  0 0 20px rgba(16,185,129,0.3);
  --shadow-inner: inset 0 2px 4px rgba(0,0,0,0.05);
  
  /* Layout */
  --sidebar-width: 280px;
  --sidebar-collapsed: 72px;
  --header-height: 64px;
  --max-content-width: 1280px;
  
  /* Z-index */
  --z-dropdown:  100;
  --z-sticky:    200;
  --z-overlay:   300;
  --z-modal:     400;
  --z-toast:     500;
}
```

---

## 🧩 Component Library

### Button Variants
```css
/* Primary Button */
.btn-primary {
  background: var(--gradient-primary);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(16,185,129,0.3);
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16,185,129,0.4);
}
.btn-primary:active {
  transform: translateY(0);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--color-secondary-700);
  border: 1px solid var(--color-secondary-200);
  /* ... same padding/radius */
}
.btn-secondary:hover {
  background: var(--color-secondary-50);
  border-color: var(--color-secondary-300);
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--color-primary-600);
  border: none;
}
.btn-ghost:hover {
  background: var(--color-primary-50);
}

/* Danger Button */
.btn-danger {
  background: var(--color-error-500);
  color: white;
}

/* Button Sizes */
.btn-sm { padding: var(--space-2) var(--space-4); font-size: var(--text-xs); }
.btn-md { padding: var(--space-3) var(--space-6); font-size: var(--text-sm); }
.btn-lg { padding: var(--space-4) var(--space-8); font-size: var(--text-base); }
```

### Card Component
```css
.card {
  background: white;
  border: 1px solid var(--color-secondary-100);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}
.card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-secondary-200);
}

/* Dark mode */
.dark .card {
  background: var(--color-dark-card);
  border-color: var(--color-dark-border);
}

/* Glassmorphism variant */
.card-glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Input Fields
```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-secondary-200);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  color: var(--color-secondary-900);
  background: white;
  transition: all 0.2s ease;
}
.input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(16,185,129,0.15);
}
.input::placeholder {
  color: var(--color-secondary-400);
}
.input-error {
  border-color: var(--color-error-500);
}
.input-error:focus {
  box-shadow: 0 0 0 3px rgba(239,68,68,0.15);
}
```

### Badge / Status Chips
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
}
.badge-success { background: var(--color-success-50); color: var(--color-success-600); }
.badge-warning { background: var(--color-warning-50); color: var(--color-warning-600); }
.badge-error   { background: var(--color-error-50); color: var(--color-error-600); }
.badge-info    { background: var(--color-info-50); color: var(--color-info-600); }
.badge-neutral { background: var(--color-secondary-100); color: var(--color-secondary-600); }
```

---

## 🎬 Animations

```css
/* ═══ Keyframe Animations ═══ */

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
  50% { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
}

@keyframes countUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes confetti {
  0% { transform: translateY(0) rotateZ(0deg); opacity: 1; }
  100% { transform: translateY(-200px) rotateZ(720deg); opacity: 0; }
}

/* ═══ Transition Utilities ═══ */

.transition-fast    { transition: all 0.15s ease; }
.transition-normal  { transition: all 0.2s ease; }
.transition-slow    { transition: all 0.3s ease; }
.transition-spring  { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }

/* ═══ Hover Effects ═══ */

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.hover-glow:hover {
  box-shadow: var(--shadow-glow);
}

.hover-scale:hover {
  transform: scale(1.02);
}
```

### Framer Motion Presets (for React components)
```typescript
// src/lib/animations.ts

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.2 }
};

export const slideInFromRight = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3 }
};

// Page transition
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: 'easeInOut' }
};
```

---

## 📱 Responsive Breakpoints

```css
:root {
  --breakpoint-sm:  640px;     /* Mobile landscape */
  --breakpoint-md:  768px;     /* Tablet portrait */
  --breakpoint-lg:  1024px;    /* Tablet landscape / small desktop */
  --breakpoint-xl:  1280px;    /* Desktop */
  --breakpoint-2xl: 1536px;    /* Large desktop */
}

/* Mobile first breakpoints */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

---

## 📐 Layout Patterns

### Sidebar + Main Content (Desktop)
```css
.app-layout {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  grid-template-rows: var(--header-height) 1fr;
  height: 100vh;
}

@media (max-width: 1023px) {
  .app-layout {
    grid-template-columns: 1fr;
  }
  /* Sidebar becomes bottom nav on mobile */
}
```

### Navigation Pattern
- **Desktop:** Left sidebar (280px) with icons + labels
- **Tablet:** Collapsed sidebar (72px) with icons only
- **Mobile:** Bottom tab bar (5 items: Home, Expenses, Scan, Reports, More)

### Sidebar Design
```
┌──────────────────────────┐
│ 🟢 ExpenseFlow           │
│                          │
│ ─── Workspace ───        │
│ [🏢 Acme Corp ▾]        │
│                          │
│ 🏠 Inbox          3     │
│ 💰 Expenses       12    │
│ 📋 Reports        2     │
│ 💬 Chat           5     │
│ 📊 Analytics            │
│ 🧾 Invoices             │
│ 📄 Bills                │
│ 🏢 Workspace            │
│                          │
│ ─── Quick Actions ───   │
│ [📸 Scan Receipt  ]     │
│ [✍️  New Expense  ]     │
│                          │
│ ──────────────────       │
│                          │
│ ⚙️ Settings              │
│ 👤 John Doe             │
│    john@acme.com        │
└──────────────────────────┘
```

---

## 🌙 Dark Mode

### Implementation Strategy
- Use `prefers-color-scheme` media query for system preference
- Manual toggle stored in user preferences
- CSS custom properties swap for all colors
- Add `.dark` class to `<html>` element

```css
html.dark {
  --color-bg: var(--color-dark-bg);
  --color-surface: var(--color-dark-surface);
  --color-card-bg: var(--color-dark-card);
  --color-border: var(--color-dark-border);
  --color-text-primary: var(--color-dark-text);
  --color-text-secondary: var(--color-dark-muted);
}
```

---

## ♿ Accessibility

### Requirements
- **WCAG 2.1 AA** minimum compliance
- All interactive elements have focus indicators (`:focus-visible`)
- Color contrast ratio ≥ 4.5:1 for text, ≥ 3:1 for large text
- All images have alt text
- Forms have proper labels and error announcements
- Keyboard navigation for all interactive elements
- Screen reader friendly (ARIA labels, roles, live regions)
- Reduced motion support: `@media (prefers-reduced-motion: reduce)`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 📦 Skeleton Loading States

Every data-dependent component should have a skeleton state:

```css
.skeleton {
  background: linear-gradient(
    90deg, 
    var(--color-secondary-100) 25%, 
    var(--color-secondary-200) 50%, 
    var(--color-secondary-100) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-md);
}

.skeleton-text { height: 1em; width: 80%; }
.skeleton-title { height: 1.5em; width: 60%; }
.skeleton-avatar { height: 40px; width: 40px; border-radius: 50%; }
.skeleton-card { height: 120px; width: 100%; }
```

---

## 🖼 Empty States

Every list/table should have a beautiful empty state with:
1. Relevant illustration (custom SVG or Lucide icon composition)
2. Clear title explaining what goes here
3. Brief description
4. Primary CTA button to create the first item

Example:
```
┌──────────────────────────────────────┐
│                                      │
│            📄                        │
│          No expenses yet             │
│                                      │
│  Start tracking your spending by     │
│  scanning a receipt or creating      │
│  your first expense manually.        │
│                                      │
│     [📸 Scan Receipt]                │
│     [✍️ Create Expense]              │
│                                      │
└──────────────────────────────────────┘
```
