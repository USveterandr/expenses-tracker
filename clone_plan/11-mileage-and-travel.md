# 11 — Mileage & Travel Tracking

---

## 🎯 Overview

Expensify includes mileage tracking (GPS-based and manual) and travel booking integration. For our clone, we'll implement distance tracking with route visualization and a travel expense workflow.

---

## 🚗 Mileage Tracking

### Methods

| Method | Description |
|--------|-------------|
| **Manual Entry** | User enters start/end location and distance |
| **Route Plotting** | User clicks points on a map; distance auto-calculated |
| **GPS Tracking** | Real-time GPS recording during a trip (mobile) |

### 11.1 Track Distance Page
**Route:** `/expenses/new?type=mileage`

```
┌─────────────────────────────────────────────────────┐
│ ← New Expense              Track Distance           │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Input Method: [Manual ▾]                            │
│                                                     │
│ ─── Route Details ───                               │
│                                                     │
│ Start:  [📍 123 Main St, New York        ]          │
│ End:    [📍 456 Broadway, New York        ]          │
│ [+ Add Stop]                                        │
│                                                     │
│ ─── Map Preview ───                                 │
│ ┌───────────────────────────────────────────┐      │
│ │                                           │      │
│ │     🟢 ───────── 🔵 ───────── 🔴         │      │
│ │   Start        Stop 1         End         │      │
│ │                                           │      │
│ │   [Interactive map with route line]       │      │
│ │                                           │      │
│ └───────────────────────────────────────────┘      │
│                                                     │
│ Distance:  12.4 miles                               │
│ Rate:      $0.67/mile (IRS 2026 rate)              │
│ Amount:    $8.31                                    │
│                                                     │
│ Date:      [📅 Jan 15, 2026    ]                   │
│ Purpose:   [Client meeting      ]                   │
│ Category:  [🚗 Transportation ▾]                    │
│                                                     │
│         [Save Mileage Expense]                      │
└─────────────────────────────────────────────────────┘
```

### Map Integration
- Use **Google Maps JavaScript API** or **Mapbox GL JS** for:
  - Address autocomplete (start/end/stops)
  - Route visualization on map
  - Distance calculation (driving route)
  - Multiple stops support
  - Estimated travel time display

### Mileage Configuration (per Workspace)
```typescript
interface MileageConfig {
  rate: number;                    // Rate per mile/km
  unit: 'miles' | 'km';
  defaultRate: number;             // IRS standard rate
  customRates: {
    vehicleType: string;           // "car", "motorcycle", "bicycle"
    rate: number;
  }[];
  requirePurpose: boolean;         // Must describe trip purpose
  requireRoute: boolean;           // Must provide start/end addresses
}
```

---

## ✈️ Travel Expense Workflow

While full travel booking (like Expensify's built-in booking) is complex, we can implement a streamlined travel expense workflow:

### Travel Expense Grouping
- Users can tag expenses as "travel" with a trip name
- System auto-groups travel expenses by trip
- Trip summary shows: flights, hotels, meals, transport, total

### Trip Summary View
```
┌─────────────────────────────────────────────────────┐
│ ✈️ NYC Client Visit — Jan 14-17, 2026             │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ✈️ Flights           $378.00                       │
│    Delta JFK→LAX     $378.00                        │
│                                                     │
│ 🏨 Lodging           $534.00                       │
│    Hilton (3 nights) $534.00                        │
│                                                     │
│ 🍽 Meals             $189.50                       │
│    Client dinner     $145.00                        │
│    Starbucks          $4.85                         │
│    Lunch              $39.65                        │
│                                                     │
│ 🚗 Transportation    $68.50                        │
│    Uber (3 rides)    $68.50                         │
│                                                     │
│ 🚗 Mileage           $8.31                         │
│    Office → Airport  $8.31                          │
│                                                     │
│ ─────────────────────────────────                   │
│ Total:               $1,178.31                      │
│                                                     │
│ [Create Report from Trip]                           │
└─────────────────────────────────────────────────────┘
```

### Per Diem Support
- Workspace can configure per diem rates by location
- Auto-calculate daily allowances based on travel dates
- Flag expenses that exceed per diem rates

```typescript
interface PerDiemRate {
  location: string;           // City or country
  dailyMeals: number;         // $79 for NYC
  dailyLodging: number;       // $300 for NYC
  dailyIncidentals: number;   // $25
  effectiveDate: Date;
}
```

---

## ⏱ Time Tracking (V2 Feature)

### Basic time tracking for billable hours:

```
┌───────────────────────────────────┐
│ ⏱ Time Entry                     │
├───────────────────────────────────┤
│ Date:     [📅 Jan 15           ]│
│ Hours:    [  8.0               ]│
│ Rate:     [$125.00/hr          ]│
│ Amount:   $1,000.00             │
│ Client:   [Widget Inc ▾       ]│
│ Project:  [Web Redesign ▾     ]│
│ Notes:    [Frontend development]│
│                                 │
│ [Save Time Entry]               │
└───────────────────────────────────┘
```

---

## 📱 API Endpoints

```
# Mileage
POST   /api/expenses/mileage           # Create mileage expense
GET    /api/mileage/calculate           # Calculate distance between points
GET    /api/mileage/rate                # Get current mileage rate

# Trips
GET    /api/trips                       # List trips
POST   /api/trips                       # Create trip grouping
GET    /api/trips/:id                   # Get trip detail with expenses
PUT    /api/trips/:id                   # Update trip
POST   /api/trips/:id/create-report     # Auto-create report from trip

# Per Diem
GET    /api/perdiem/rates               # Get per diem rates by location
POST   /api/perdiem/calculate           # Calculate per diem for date range

# Time (V2)
POST   /api/time-entries                # Create time entry
GET    /api/time-entries                # List time entries
```
