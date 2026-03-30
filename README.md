<p align="center">
  <img src="https://www.olx.com.lb/assets/images/olx-logo.png" height="60" alt="OLX Lebanon" />
</p>

<h1 align="center">OLX Lebanon — Mobile App</h1>

<p align="center">
  A React Native technical assessment for the Mobile Developer Engineer position at OLX Lebanon.
  <br />
  Implements the Home, Search Results, and Search Filters screens with live API integration.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.73-blue?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/i18n-EN_%7C_AR-green" />
  <img src="https://img.shields.io/badge/Platform-iOS_%7C_Android-lightgrey" />
</p>

---

## Screens

| Home | Search Results | Filters |
|------|---------------|---------|
| Banner, categories, featured ad sections | Infinite scroll, elite ads, sort | Dynamic fields from API, location, price, condition |

---

## Architecture
```
src/
├── api/           # Service layer — all API calls isolated here
├── components/    # Reusable UI components (AdCard, SearchBar, FilterChip, Skeleton…)
├── hooks/         # Data-fetching hooks wrapping React Query
├── i18n/          # English + Arabic translations
├── navigation/    # Stack + Bottom Tab navigator
├── screens/       # Feature screens (Home, SearchResults, Filters)
├── store/         # Zustand stores (filters, app-level state)
├── theme/         # Design tokens (colors, spacing, typography)
└── types/         # Shared TypeScript interfaces
```

**Key decisions:**

- **Zustand** for filter state — lightweight, zero-boilerplate, synchronous across screens
- **React Query** (`useInfiniteQuery`) for paginated ad fetching with built-in caching
- **i18next** with `I18nManager.forceRTL` for full Arabic RTL layout support
- **No external UI libraries** — all components are built from scratch using React Native primitives
- **Dynamic filters** — the Filters screen reads `categoryFields` from the OLX API and renders the appropriate inputs automatically per category, with no hardcoding

---

## Features

- [x] Home screen — promotional banner, category grid, featured ad sections per category
- [x] Search results — list view with infinite scroll, elite ad section, sort modal
- [x] Filters screen — location, category, price range, condition, dynamic fields (brand, color, km…)
- [x] Full Arabic + English support with RTL layout
- [x] Skeleton loaders during data fetch
- [x] Debounced text search
- [x] Live integration with `search.mena.sector.run` and `olx.com.lb/api`

---

## Tech Stack

| Concern | Library |
|---------|---------|
| Framework | React Native CLI |
| Language | TypeScript |
| Navigation | React Navigation v6 (Stack + Bottom Tabs) |
| Server state | TanStack React Query v5 |
| Client state | Zustand |
| Localisation | i18next + react-i18next |
| Styling | React Native StyleSheet (no external UI lib) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Ruby 3.x (for iOS CocoaPods)
- Xcode 14+ (iOS)
- Android Studio + SDK (Android)

### Install
```bash
git clone https://github.com/YOUR_USERNAME/olx-lebanon-app.git
cd olx-lebanon-app
npm install
```

### iOS
```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

### Android
```bash
npx react-native run-android
```

---

## API Reference

The app integrates three endpoints:

| Endpoint | Purpose |
|----------|---------|
| `GET olx.com.lb/api/categories` | Fetch all categories |
| `GET olx.com.lb/api/categoryFields` | Fetch dynamic filter fields per category |
| `POST search.mena.sector.run/_msearch` | Fetch ads and locations (Elasticsearch Multi Search) |

The Elasticsearch queries are built dynamically in `src/api/adsService.ts` based on active filters.

---

## Project Structure Decisions

**Why is `api/` separate from `hooks/`?**  
The service layer (`api/`) is pure data-fetching logic with no React dependency. Hooks (`hooks/`) wrap those services with React Query for caching and state. This separation makes the services independently testable.

**Why Zustand instead of Context?**  
Filter state is read and written from three different screens simultaneously. Zustand avoids prop drilling and re-render issues that Context causes at this scale, without the boilerplate of Redux.

---

## APK

> Download the latest debug APK: [Releases](https://github.com/leo-marida/olx-lebanon-app/releases)

---

## Author

Built by **Leonard Marida** as part of the OLX Lebanon technical assessment.