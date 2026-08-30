# 🌿 Amrutam Ayurvedic Super App

A production-grade, offline-first React Native (Expo SDK 57) application designed with classical Ayurvedic principles, high-performance architecture, and a modern Unistyles design system.

---

## 📱 Modules & Features Overview

### 1. 🩺 Ayurvedic Consultations Module
- **Doctor Catalog & Virtualized Listing**: Search through 5,000+ verified Ayurvedic doctors with dynamic filtering by Specialization (Panchakarma, Kayachikitsa, Shalya Tantra, etc.), Experience, Rating, and Fees.
- **Instant Profile Hydration (`initialDoctor`)**: Passes card data directly into doctor details for instant frame-1 rendering without loading spinners.
- **Interactive Slot Booking**: Real-time slot picker categorized by Morning, Afternoon, and Evening windows.
- **Offline Booking Fallback**: When offline, enables preferred time window queueing with guaranteed delivery.
- **Clinical Double-Booking Protection**: Strict server and client-side conflict checking preventing duplicate appointments for patients at the same date and time.
- **Ayurvedic Consultation Receipts**: Digital receipts with doctor credentials, patient details, clinic address, and fee breakdown.

### 2. 🛍️ Ayurvedic Pharmacy & Store Module
- **Botanical Formulations Catalog**: Filter 20,000+ pure Ayurvedic products by Category (Herbal Formulations, Oils & Ghee, Tablets & Capsules, Asava & Arishta, Malts), Health Concerns, and Price.
- **Instant Product Hydration (`initialProduct`)**: Frame-1 instant detail view from catalog or wishlist with key botanical ingredients, benefits, and Ayush certification badges.
- **Zustand MMKV Persistent Cart & Wishlist**: High-speed native cart with dynamic Ayush discounts, item counter, and clear cart confirmation.
- **Offline Product Order Flow**: When offline, enqueues `PLACE_ORDER` mutations with persistent offline order receipts and automatic synchronization upon reconnection.

### 3. 📋 Electronic Health Records (EHR) Module
- **Virtualized Medical Timeline**: Chronologically group 10,000+ patient records (Prescriptions, Lab Reports, Consultations, Vaccinations, Allergies) with sticky month headers.
- **Cross-Module Auto-Injection**: Booking a doctor consultation or ordering Ayurvedic formulations automatically injects structured clinical records with vitals (Vata, Pitta, Kapha) into the patient's timeline.
- **Offline Client-Side PDF Generation**: Exports complete clinical records to branded PDF documents using `expo-print` and `expo-sharing`.

### 4. 📴 Robust Offline-First & Sync Engine
- **Persistent Mutation Queue (`MMKV`)**: All offline actions (Slot Bookings, Cancellations, Product Orders) are queued into native C++ storage with retry tracking.
- **Live Sync Manager**: Automatically detects network transitions and synchronizes all pending mutations with TanStack Query cache invalidation.
- **Real-Time Offline Status Banner**: Persistent banner indicating offline status and pending sync queue count.

### 5. 🎨 Design System & Theme Engine
- **100% Unistyles Token Architecture**: Complete eradication of hardcoded colors in favor of dynamic theme tokens (`theme.colors.*`).
- **Instant Native Theme Switching**: Synchronous, single-paint C++ theme toggles between Light, Dark, and System Adaptive modes with 0ms touch delay.
- **Zero-Flash Capsule & Tab Navigation**: `detachInactiveScreens={false}` and optimized TanStack Query caching for seamless transitions.
- **Multilingual Support (i18next)**: Full English and Hindi support with persistent language toggling.
- **Keyboard-Aware Booking Form**: Native keyboard avoiding behavior with Android `height` mode.

---

## 🏗️ Project Architecture

```
AmrutamSuperApp/
├── src/
│   ├── core/                   # Infrastructure & Core Services
│   │   ├── api/                # Axios client, endpoints & mock database
│   │   │   ├── generators/     # Seeded in-memory database (5k doctors, 20k products, 10k records)
│   │   │   ├── interceptors/   # Chaos mode, latency injection, 500 error engine
│   │   │   └── services/       # Mock router & background sync manager
│   │   ├── config/             # Dynamic Feature Flags & Remote Config
│   │   ├── localization/       # i18next multilingual engine (EN & HI)
│   │   ├── logger/             # Crash reporting & breadcrumb logger
│   │   ├── notifications/      # Local push notifications engine
│   │   ├── providers/          # TanStack Query & Unistyles context wrappers
│   │   └── storage/            # High-speed native C++ MMKV engine & mutation queue
│   ├── features/               # Domain-Driven Modules
│   │   ├── consultation/       # Doctor catalog, slot booking & receipts
│   │   ├── shop/               # Ayurvedic catalog, cart, checkout & wishlist
│   │   ├── health-records/     # Virtualized medical timeline & PDF generator
│   │   └── dev/                # Chaos engineering & developer panel
│   ├── navigation/             # Type-safe React Navigation 7 & Deep Linking
│   └── shared/                 # Reusable UI primitives (Buttons, Chips, Badges, Typography)
```

---

## ⚡ State Management Architecture

| State Category | Technology | Rationale |
| :--- | :--- | :--- |
| **Server / Async State** | **TanStack Query v5** | Built-in caching, query deduplication, background re-fetching, and MMKV query persistence. |
| **Client / App State** | **Zustand v5** | Minimal boilerplate, selector-level subscriptions, zero extra wrappers. |
| **Persistent Storage** | **MMKV (Native C++)** | 30x faster than AsyncStorage, synchronous reads/writes on the main thread. |

---

## 🧪 Testing & Verification

The codebase is 100% type-safe with unit tests covering core business workflows:

```bash
# Run unit test suite
yarn test

# Run TypeScript typecheck
yarn type-check

# Run ESLint validation
yarn lint
```

---

## 🛠️ Setup & Running Locally

### Prerequisites:
- Node.js >= 18.x
- Yarn >= 1.22.x
- Android Studio / Android Emulator or Xcode / iOS Simulator

### Quick Start:
```bash
# 1. Clone repository
git clone https://github.com/OmShankar123/AmrutamSuperApp.git
cd AmrutamSuperApp

# 2. Install dependencies
yarn install

# 3. Start development server
yarn start

# 4. Run on Android
yarn android

# 5. Run on iOS
yarn ios
```

---
*Built with ❤️ for the Amrutam Ayurvedic Super App Assignment.*
