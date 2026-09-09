# GIGNET — Cooperative Workforce & Service Network
**Smart India Hackathon SIH26089**

GIGNET connects households and community customers with certified, skilled gig workers organized under Labour Cooperative Societies and Federations. Built with an explainable multi-criteria allocation engine, progressive geospatial search, and demand forecasting.

---

## 🏛️ System Architecture

- **Customer App** (`apps/customer-app`): React + Vite + Tailwind CSS + Leaflet (Runs on port `5173`)
- **Worker App** (`apps/worker-app`): React + Vite + Tailwind CSS + Leaflet (Runs on port `5174`)
- **Admin & Federation Operations** (`apps/admin-app`): React + Vite + Tailwind CSS + Leaflet + Recharts (Runs on port `5175`)
- **Core Authoritative Backend** (`backend`): Node.js + Express + Mongoose + Socket.IO (Runs on port `5000`)
- **Demand Forecasting Microservice** (`forecast-service`): Python FastAPI + scikit-learn Ridge regression (Runs on port `8000`)
- **Database**: MongoDB (Atlas M0 or zero-config in-memory fallback with 2dsphere indexing)

---

## ⚡ Key Architectural Features

### 1. Multi-Criteria Allocation Engine
- **Hard Gate**: Skill match, verified KYC (`VERIFIED`), active status, and the **Ravi/Kumar Dynamic Slack Rule**:
  $$\text{slack} = \text{minutesUntilConfirmed} - (\text{emergencyDuration} + \text{travelToEmergency} + \text{travelBackToConfirmed})$$
  Excludes candidate only if $\text{slack} < 10\text{ min}$ safety buffer.
- **Progressive Geo Search**:
  - Scheduled: `2km → 5km → 10km → 15km`
  - Emergency: `3km → 6km → 12km → 15km`
- **Scheduled Formula (Fairness & Low Workload Dominates)**:
  $$\text{compositeScore} = 0.6 \times \text{utilizationScore} + 0.2 \times \text{ratingScore} + 0.2 \times \text{distanceScore}$$
  $$\text{finalScore} = \text{compositeScore} + (\text{isSameCooperative} ? 0.08 : 0)$$
- **Emergency Formula (Speed & Proximity Dominates)**:
  $$\text{finalScore} = 0.7 \times \text{distanceScore} + 0.2 \times \text{ratingScore} + 0.1 \times \text{utilizationScore}$$
- **Offer System**: 45-second animated countdown timer with automatic cascading to the next candidate on decline or timeout.

### 2. Cooperative Financial Split
- **80% Direct Worker Payout**: Zero predatory commissions.
- **15% Cooperative Welfare & Emergency Fund**: Transparent health, insurance, and tool grants.
- **5% Platform Infrastructure**: Tech maintenance.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ (tested on Node v24)
- Python 3.10+ (tested on Python 3.14)

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Database
```bash
npm run seed
```
*Seeds Bangalore South & Indiranagar cooperatives, verified workers (Suresh - Balanced, Ramesh - Overloaded, Ravi - Schedule Conflict, Priya - Electrician), services, and initial 7-day forecast data.*

### 3. Start Backend & Microservices
```bash
# Terminal 1: Core Backend (Port 5000)
npm run dev:backend

# Terminal 2: Python Forecasting Microservice (Port 8000)
npm run forecast
```

### 4. Start Frontends
```bash
# Terminal 3: Customer App (Port 5173)
npm run dev:customer

# Terminal 4: Worker App (Port 5174)
npm run dev:worker

# Terminal 5: Admin App (Port 5175)
npm run dev:admin
```

---

## 💻 SIH 4-Laptop Evaluation Demo Walkthrough

1. **Laptop 1 (Customer App - Port 5173)**:
   - Select **Emergency Pipe Burst Repair** or **Scheduled Tap Installation**.
   - Click "Confirm & Find Verified Worker".
   - Watch the progressive radar search activate.

2. **Laptop 2 (Worker App - Port 5174)**:
   - Worker Suresh Kumar receives a **live 45-second countdown offer modal** with sound and visual alert.
   - Shows distance (2.1 km) and net take-home earnings (₹540).
   - Click **Accept Job** -> changes status to `CONFIRMED`.

3. **Laptop 1 & 2 (Live Tracking & Lifecycle Execution)**:
   - Worker clicks `[Start Trip]` -> simulated movement steps worker along coordinates towards customer.
   - Customer map shows real-time scooter marker moving with live ETA.
   - Worker clicks `[I Have Arrived]` -> `[Start Work]` -> `[Complete Work]`.
   - Customer receives itemized invoice (Worker ₹540, Coop Reserve ₹101, Platform ₹34).
   - Customer completes **Demo UPI Payment** and submits 5-star review.

4. **Laptop 3 (Admin Dashboard - Port 5175)**:
   - Open **Live Operations Map**: See real-time worker pins (green = balanced Suresh, red = overloaded Ramesh) and H3 hex clusters.
   - Click the booking to open the **Explainable Allocation Audit Drawer**:
     - See exact candidate score table: shows why Suresh Kumar won over Ramesh Patil for scheduled jobs due to 60% workload fairness weighting!
   - Open **Fairness & Workload**: View Gini coefficient (0.16) and earnings equality chart.
   - Open **Demand Forecasting**: Click "Recalculate via Python ML" -> observe 7-day demand gap -> click "Request 3 Workers from Indiranagar" to balance the deficit via Federation sharing!
