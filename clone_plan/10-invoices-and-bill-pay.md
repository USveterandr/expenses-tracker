# 10 — Invoices & Bill Pay

---

## 🎯 Overview

Expensify goes beyond expense tracking with a full invoicing and bill pay system. This document covers creating/sending invoices, receiving/paying bills, and integrating these with the expense tracking workflow.

---

## 🧾 Invoicing

### 10.1 Invoice List Page
**Route:** `/invoices`

**Tabs:** Sent | Received | Drafts

```
┌─────────────────────────────────────────────────────┐
│ 🧾 Invoices                          [+ New Invoice]│
├──────────┬──────────┬──────────┬────────────────────┤
│  Sent    │ Received │  Drafts  │                    │
├──────────┴──────────┴──────────┴────────────────────┤
│                                                     │
│ #   Invoice    Client        Amount   Status   Due  │
│ ─── ────────── ───────────── ──────── ──────── ──── │
│ 1042 Web Dev   Widget Inc   $5,000   🟢 Paid  Jan10│
│ 1041 Consulting Acme Co     $2,500   🔴 Overdue Dec│
│ 1040 Design    StartupXYZ   $1,200   🟡 Sent  Jan25│
│ 1039 Strategy  BigCorp      $8,000   📨 Viewed Jan30│
│                                                     │
│ Summary: $16,700 total • $5,000 paid • $2,500 overd│
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 10.2 Create Invoice Page  
**Route:** `/invoices/new`

```
┌─────────────────────────────────────────────────────┐
│ ← Invoices                    Save Draft | Send     │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ─── From ───                                        │
│ Your Business Name    [Acme Corp LLC           ]    │
│ Email                 [billing@acmecorp.com    ]    │
│ Address               [123 Main St, NYC 10001  ]    │
│                                                     │
│ ─── Bill To ───                                     │
│ Client Name           [Widget Inc              ]    │
│ Client Email          [ap@widgetinc.com        ]    │
│ Client Address        [456 Oak Ave, LA 90001   ]    │
│                                                     │
│ ─── Invoice Details ───                             │
│ Invoice #    [AUTO-1043 ]   PO #  [________]       │
│ Issue Date   [📅 Jan 15 ]   Due   [📅 Feb 15 ]    │
│ Currency     [USD ▾     ]                           │
│                                                     │
│ ─── Line Items ───                                  │
│                                                     │
│ Description           Qty   Rate     Amount         │
│ ─────────────────────────────────────────────       │
│ Web Development       40    $125.00  $5,000.00     │
│ Design Consultation   8     $150.00  $1,200.00     │
│ [+ Add Line Item]                                   │
│                                                     │
│ ─── Totals ───                                      │
│                        Subtotal:    $6,200.00       │
│                        Tax (8%):      $496.00       │
│                        Discount:     -$200.00       │
│                        ────────────────────         │
│                        TOTAL:      $6,496.00        │
│                                                     │
│ ─── Notes & Terms ───                               │
│ Notes: [Thank you for your business!          ]     │
│ Terms: [Net 30. Late fees of 1.5% per month.  ]     │
│                                                     │
│     [Preview]   [Save Draft]   [📨 Send Invoice]   │
└─────────────────────────────────────────────────────┘
```

### Invoice Preview
- Professional template with company logo
- Clean layout suitable for printing
- Payment button/link embedded (for electronic invoices)
- Download as PDF option

### Invoice Status Flow
```
DRAFT → SENT → VIEWED → PAID
                   ↓
               OVERDUE (auto, after due date)
```

### Invoice Sending
1. System generates PDF of the invoice
2. Sends email to client with:
   - Invoice PDF attached
   - "View & Pay" button linking to payment page
   - Summary (invoice #, amount, due date)
3. Creates a dedicated chat thread for the invoice
4. Recipient can pay without creating an account

---

## 💸 Bill Pay

### 10.3 Bills List Page
**Route:** `/bills`

```
┌─────────────────────────────────────────────────────┐
│ 📄 Bills                            [+ Upload Bill] │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Tabs: [All] [Pending] [Approved] [Paid] [Overdue]  │
│                                                     │
│ Vendor         Amount    Due Date   Status   Action │
│ ─────────────  ────────  ────────── ──────── ────── │
│ AWS            $2,345    Feb 15     🟡 Pending [Pay]│
│ Google Cloud   $890      Feb 10     🔴 Overdue [Pay]│
│ Slack          $312      Mar 1      🟢 Approved[Pay]│
│ Adobe          $599      Feb 28     🟡 Pending [Rev]│
│                                                     │
│ Total Due: $4,146 • Overdue: $890                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 10.4 Bill Upload & Processing

**Upload Methods:**
1. **Manual upload** — Drag/drop or click to upload bill PDF/image
2. **Email forwarding** — Forward to `bills@expenseflow.app`
3. **Vendor sends directly** — Unique workspace billing email

**Processing Pipeline:**
```
Bill Image/PDF → OCR Scan → AI Extract Data → Create Bill Record
     ↓
Auto-categorize → Route for approval → Pay
```

### Bill Detail Page
**Route:** `/bills/[id]`

```
┌─────────────────────────────────────────────────────┐
│ ← Bills                                             │
├──────────────────┬──────────────────────────────────┤
│                  │                                  │
│ 📄 Bill Preview  │  Vendor: Amazon Web Services     │
│ (PDF/Image)      │  Bill #: INV-2026-0145           │
│                  │  Amount: $2,345.00               │
│ [Zoom] [Download]│  Issue Date: Jan 15, 2026        │
│                  │  Due Date: Feb 15, 2026           │
│                  │  Status: 🟡 Pending Approval     │
│                  │                                  │
│                  │  Category: Software              │
│                  │  Tags: Infrastructure            │
│                  │                                  │
│                  │  ─── Approval ───                │
│                  │  Approver: Sarah J. - ⏳ Pending │
│                  │                                  │
│                  │  ─── Payment ───                 │
│                  │  Method: [ACH ▾]                 │
│                  │  [Schedule Payment]              │
│                  │  [Pay Now]                       │
│                  │                                  │
├──────────────────┴──────────────────────────────────┤
│ 💬 Comments                                        │
│ [Discussion thread about this bill]                │
└─────────────────────────────────────────────────────┘
```

---

## 💳 Payment Processing

### Payment Methods
| Method | Description | Speed |
|--------|-------------|-------|
| **ACH** | Bank transfer | 2-3 business days |
| **Card** | Credit/debit card | Instant |
| **Manual** | Mark as paid externally | N/A |

### Payment Flow
```typescript
interface PaymentRequest {
  billId: string;
  method: 'ach' | 'card' | 'manual';
  amount: number;
  scheduledDate: Date | null;     // For scheduled payments
  paymentDetails: {
    bankAccountId?: string;       // For ACH
    cardId?: string;              // For card
    reference?: string;           // For manual
  };
}
```

> **Note:** For the MVP, payment processing can be simulated with status updates. Integration with Stripe or a payment processor would be added in V2.

---

## 📱 API Endpoints

```
# Invoices
GET    /api/invoices                    # List invoices
POST   /api/invoices                    # Create invoice
GET    /api/invoices/:id                # Get invoice detail
PUT    /api/invoices/:id                # Update invoice
DELETE /api/invoices/:id                # Delete invoice (draft only)
POST   /api/invoices/:id/send          # Send invoice to client
GET    /api/invoices/:id/pdf           # Download invoice as PDF
POST   /api/invoices/:id/mark-paid     # Mark invoice as paid
GET    /api/invoices/:id/payment-link  # Get payment link for client

# Bills
GET    /api/bills                       # List bills
POST   /api/bills                       # Create/upload bill
GET    /api/bills/:id                   # Get bill detail
PUT    /api/bills/:id                   # Update bill
DELETE /api/bills/:id                   # Delete bill
POST   /api/bills/:id/approve          # Approve bill for payment
POST   /api/bills/:id/pay              # Process payment
POST   /api/bills/:id/schedule         # Schedule future payment
POST   /api/bills/scan                 # Scan/upload bill with AI extraction
```
