# 06 — AI-Powered Receipt Scanning

---

## 🎯 Overview

Receipt scanning is one of Expensify's signature features (SmartScan). Our implementation uses **Google Cloud Vision API** for OCR and **Gemini API** for intelligent data extraction. This creates a two-stage pipeline: raw text extraction → structured data parsing with AI.

---

## 🔄 Scanning Pipeline

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ 1. CAPTURE   │ ──→ │ 2. UPLOAD    │ ──→ │ 3. OCR       │ ──→ │ 4. AI PARSE  │
│              │     │              │     │              │     │              │
│ Camera/Upload│     │ Firebase     │     │ Google Cloud │     │ Gemini API   │
│ Drag & Drop  │     │ Storage      │     │ Vision API   │     │ Structured   │
│ Email fwd    │     │ Generate     │     │ Text detect  │     │ extraction   │
│              │     │ thumbnail    │     │ Multi-lang   │     │              │
└──────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                      │
                                                                      ▼
                                          ┌──────────────┐     ┌──────────────┐
                                          │ 6. REVIEW    │ ←── │ 5. CREATE    │
                                          │              │     │              │
                                          │ User verifies│     │ Auto-create  │
                                          │ AI suggestions│    │ expense with │
                                          │ Accept/Edit  │     │ pre-filled   │
                                          │              │     │ fields       │
                                          └──────────────┘     └──────────────┘
```

---

## 📸 Stage 1: Receipt Capture

### Capture Methods

**1. In-App Camera (Mobile)**
```
┌─────────────────────────────┐
│         📷 Camera View       │
│                             │
│  ┌───────────────────────┐ │
│  │                       │ │
│  │    Viewfinder with    │ │
│  │    receipt guide      │ │
│  │    overlay            │ │
│  │                       │ │
│  │    [ Align receipt ]  │ │
│  │    [ within frame  ]  │ │
│  │                       │ │
│  └───────────────────────┘ │
│                             │
│      🔴 Capture Button      │
│                             │
│  💡 Auto-detect edges       │
│  🔄 Flash toggle            │
│  📁 Choose from gallery     │
└─────────────────────────────┘
```

**2. Drag & Drop Upload (Desktop)**
```
┌─────────────────────────────────┐
│                                 │
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │    📎 Drop files here   │   │
│  │    or click to browse   │   │
│  │                         │   │
│  │    Supports: JPG, PNG,  │   │
│  │    PDF, HEIC            │   │
│  │    Max: 10MB per file   │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  Batch Upload: Drop multiple   │
│  receipts at once              │
│                                 │
└─────────────────────────────────┘
```

**3. Email Forwarding**
- Users forward receipt emails to `receipts@expenseflow.app`
- Cloud Function triggers on incoming email
- Extracts attachments (images/PDFs)
- Processes through same OCR pipeline
- Creates expense linked to user's default workspace

### Image Preprocessing
Before sending to OCR:
1. **Auto-rotate** — Correct image orientation using EXIF data
2. **Edge detection** — Crop to receipt boundaries
3. **Contrast enhancement** — Improve readability
4. **Resize** — Optimize file size (max 4MB for Vision API)
5. **Generate thumbnail** — 200x200 preview for UI

---

## 🔬 Stage 2: OCR (Google Cloud Vision API)

### Implementation

```typescript
// src/lib/ai/ocr.ts

import vision from '@google-cloud/vision';

const client = new vision.ImageAnnotatorClient();

export async function extractTextFromReceipt(imageUrl: string): Promise<OcrResult> {
  const [result] = await client.textDetection(imageUrl);
  const detections = result.textAnnotations;
  
  if (!detections || detections.length === 0) {
    return { success: false, rawText: '', confidence: 0 };
  }
  
  // First annotation contains the full text
  const fullText = detections[0].description || '';
  
  // Individual word detections with bounding boxes
  const words = detections.slice(1).map(det => ({
    text: det.description || '',
    boundingBox: det.boundingPoly?.vertices || [],
    confidence: det.confidence || 0
  }));
  
  return {
    success: true,
    rawText: fullText,
    words,
    confidence: result.fullTextAnnotation?.pages?.[0]?.confidence || 0.9
  };
}

interface OcrResult {
  success: boolean;
  rawText: string;
  words?: {
    text: string;
    boundingBox: { x: number; y: number }[];
    confidence: number;
  }[];
  confidence: number;
}
```

---

## 🤖 Stage 3: AI Data Extraction (Gemini API)

### Implementation

```typescript
// src/lib/ai/receipt-parser.ts

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function parseReceiptData(
  ocrText: string, 
  imageBase64?: string
): Promise<ParsedReceiptData> {
  
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: RECEIPT_SCHEMA
    }
  });
  
  const prompt = `
You are an expert receipt parser. Analyze this receipt text and extract structured data.

RECEIPT TEXT:
"""
${ocrText}
"""

Extract the following fields. If a field cannot be determined, use null.
Provide a confidence score (0.0-1.0) for each extracted field.

Return a JSON object with these fields:
- merchant: The store/restaurant/business name
- merchant_address: Full address of the merchant
- date: Date of purchase in YYYY-MM-DD format
- time: Time of purchase in HH:MM format (24hr)
- subtotal: Pre-tax subtotal amount as a number
- tax: Tax amount as a number
- tip: Tip amount as a number (if applicable)
- total: Total amount paid as a number
- currency: ISO 4217 currency code (e.g., "USD")
- payment_method: How it was paid (e.g., "Visa ending 1234", "Cash")
- category_suggestion: Suggested expense category
- items: Array of line items, each with {name, quantity, price}
- confidence: Object with confidence scores for each field (0.0-1.0)
`;
  
  const result = await model.generateContent(prompt);
  const response = result.response;
  const parsed = JSON.parse(response.text());
  
  return {
    merchant: parsed.merchant,
    merchantAddress: parsed.merchant_address,
    date: parsed.date,
    time: parsed.time,
    subtotal: parsed.subtotal,
    tax: parsed.tax,
    tip: parsed.tip,
    total: parsed.total,
    currency: parsed.currency || 'USD',
    paymentMethod: parsed.payment_method,
    categorySuggestion: parsed.category_suggestion,
    items: parsed.items || [],
    confidence: parsed.confidence || {},
    overallConfidence: calculateOverallConfidence(parsed.confidence)
  };
}

// With image input (multimodal — for when OCR alone isn't enough)
export async function parseReceiptImage(imageBase64: string): Promise<ParsedReceiptData> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64
      }
    },
    `Analyze this receipt image and extract all structured data. 
     Return JSON with: merchant, date (YYYY-MM-DD), time, subtotal, tax, tip, total, 
     currency, payment_method, category_suggestion, items (array of {name, quantity, price}),
     and confidence scores for each field.`
  ]);
  
  return JSON.parse(result.response.text());
}

function calculateOverallConfidence(fieldConfidences: Record<string, number>): number {
  const criticalFields = ['merchant', 'total', 'date'];
  const scores = criticalFields
    .map(f => fieldConfidences[f] || 0)
    .filter(s => s > 0);
  
  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

interface ParsedReceiptData {
  merchant: string | null;
  merchantAddress: string | null;
  date: string | null;
  time: string | null;
  subtotal: number | null;
  tax: number | null;
  tip: number | null;
  total: number | null;
  currency: string;
  paymentMethod: string | null;
  categorySuggestion: string | null;
  items: { name: string; quantity: number; price: number }[];
  confidence: Record<string, number>;
  overallConfidence: number;
}
```

### JSON Schema for Structured Output

```typescript
const RECEIPT_SCHEMA = {
  type: 'object',
  properties: {
    merchant: { type: 'string', nullable: true },
    merchant_address: { type: 'string', nullable: true },
    date: { type: 'string', nullable: true },
    time: { type: 'string', nullable: true },
    subtotal: { type: 'number', nullable: true },
    tax: { type: 'number', nullable: true },
    tip: { type: 'number', nullable: true },
    total: { type: 'number', nullable: true },
    currency: { type: 'string' },
    payment_method: { type: 'string', nullable: true },
    category_suggestion: { type: 'string', nullable: true },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          quantity: { type: 'number' },
          price: { type: 'number' }
        }
      }
    },
    confidence: {
      type: 'object',
      properties: {
        merchant: { type: 'number' },
        total: { type: 'number' },
        date: { type: 'number' },
        tax: { type: 'number' },
        category: { type: 'number' }
      }
    }
  }
};
```

---

## 📱 Scanner UI Components

### Scan Result Preview

```
┌─────────────────────────────────────────────────┐
│ ← Scan Result                                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────┐                                  │
│  │ 📷 Receipt │  🤖 AI Extracted Data           │
│  │  Preview   │                                 │
│  │  [Zoom]    │  Merchant: Starbucks    ✅ 98%  │
│  └───────────┘  Amount:   $4.85         ✅ 99%  │
│                  Date:     Jan 15, 2026  ✅ 95%  │
│                  Category: ☕ Dining     🤖 87%  │
│                  Tax:      $0.42        ✅ 92%  │
│                                                 │
│  ─── Line Items ───                             │
│  1x Grande Latte            $4.85               │
│                                                 │
│  ─── Suggested Category ───                     │
│  [☕ Meals & Dining] ← AI suggested             │
│  [Change Category ▾]                            │
│                                                 │
│  ⚡ Overall Confidence: 94%                     │
│  ℹ️ Fields with < 80% confidence are highlighted │
│                                                 │
│  [✏️ Edit Details]  [✅ Accept & Create Expense] │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Confidence Color Coding
| Confidence | Color | Indicator | Action |
|-----------|-------|-----------|--------|
| 90-100% | 🟢 Green | ✅ | Auto-accepted |
| 70-89% | 🟡 Yellow | ⚠️ | User review suggested |
| Below 70% | 🔴 Red | ❌ | Manual input required |

### Batch Scanning
- Users can upload multiple receipts at once
- Each receipt processes independently in parallel
- Progress bar shows N/M completed
- Results shown in a carousel/list for quick review
- "Accept All" button for batch approval

---

## 🔀 Scan API Endpoint

```typescript
// src/app/api/receipts/scan/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/firebase/auth';
import { uploadToStorage } from '@/lib/firebase/storage';
import { extractTextFromReceipt } from '@/lib/ai/ocr';
import { parseReceiptData, parseReceiptImage } from '@/lib/ai/receipt-parser';

export async function POST(req: NextRequest) {
  // 1. Authenticate
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // 2. Get uploaded file
  const formData = await req.formData();
  const file = formData.get('receipt') as File;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  
  // 3. Validate file
  const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
  }
  
  // 4. Upload to Firebase Storage
  const { url, thumbnailUrl, path } = await uploadToStorage(file, user.uid);
  
  // 5. OCR — Extract text
  const ocrResult = await extractTextFromReceipt(url);
  
  // 6. AI Parse — Extract structured data
  let parsedData;
  if (ocrResult.success && ocrResult.rawText.length > 20) {
    // Use OCR text + Gemini for parsing
    parsedData = await parseReceiptData(ocrResult.rawText);
  } else {
    // Fallback: Use Gemini Vision directly on the image
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    parsedData = await parseReceiptImage(base64);
  }
  
  // 7. Create receipt document in Firestore
  const receipt = await createReceipt({
    userId: user.uid,
    originalUrl: url,
    thumbnailUrl,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    ocrRawText: ocrResult.rawText,
    ocrExtractedData: parsedData,
    confidence: parsedData.overallConfidence,
    needsHumanReview: parsedData.overallConfidence < 0.8
  });
  
  // 8. Return scan result
  return NextResponse.json({
    success: true,
    receiptId: receipt.id,
    receiptUrl: url,
    thumbnailUrl,
    extractedData: parsedData,
    confidence: parsedData.overallConfidence,
    needsReview: parsedData.overallConfidence < 0.8
  });
}
```

---

## 🧠 AI Category Learning

Over time, the AI learns user-specific merchant-to-category mappings:

```typescript
// When a user manually changes the AI-suggested category,
// store the mapping for future suggestions

interface MerchantCategoryMapping {
  userId: string;
  workspaceId: string;
  merchantName: string;         // Normalized (lowercase, trimmed)
  categoryId: string;
  categoryName: string;
  useCount: number;             // How many times this mapping was used
  lastUsedAt: Timestamp;
}

// When categorizing, check user mappings first:
async function suggestCategory(
  merchant: string, 
  userId: string, 
  workspaceId: string
): Promise<string> {
  // 1. Check user's personal mappings
  const mapping = await getUserMerchantMapping(userId, merchant);
  if (mapping) return mapping.categoryId;
  
  // 2. Check workspace-wide mappings (most common)
  const wsMapping = await getWorkspaceMerchantMapping(workspaceId, merchant);
  if (wsMapping) return wsMapping.categoryId;
  
  // 3. Fall back to AI suggestion
  const aiSuggestion = await getAICategorySuggestion(merchant);
  return aiSuggestion;
}
```

---

## 📱 API Endpoints

```
POST   /api/receipts/scan             # Scan single receipt (upload + process)
POST   /api/receipts/scan/batch       # Scan multiple receipts
GET    /api/receipts/:id              # Get receipt details + OCR results
GET    /api/receipts/:id/text         # Get raw OCR text
PUT    /api/receipts/:id/verify       # Mark AI extraction as verified
DELETE /api/receipts/:id              # Delete receipt
```
