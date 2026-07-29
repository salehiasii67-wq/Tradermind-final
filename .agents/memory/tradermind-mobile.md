---
name: TraderMind Mobile Architecture
description: Key decisions for the TraderMind Mobile Expo artifact
---

## Data storage
Fully offline-first using `@react-native-async-storage/async-storage` (pre-installed, v2.2.0). Keys: `@tradermind:trades`, `@tradermind:journal`. No API calls in first build.

## Color palette
Derived from `artifacts/tradermind/src/index.css` dark theme HSL values:
- background: `#0d1017` (226 21% 7%)
- card: `#161b27` (222 28% 12%)
- border: `#1e2333` (222 20% 15%)
- primary: `#3b82f6` (217 91% 60%)
- success: `#22c55e` (142 71% 45%)
- warning: `#f59f0a` (38 92% 50%)
- destructive: `#ef4343` (0 84% 60%)

## RTL / Persian
Used explicit `textAlign: 'right'` throughout — did NOT use `I18nManager.forceRTL()` (requires app restart, causes issues in Expo Go).

## Navigation
4 tabs: index (خانه), trades (معاملات), journal (ژورنال), stats (آمار). Trade entry via modal `app/trade-form.tsx` (presentation: 'modal'). NativeTabs for iOS 26+ liquid glass, ClassicTabs fallback.

**Why:** Modal form keeps the tab bar clean; fits iOS/Android UX conventions for data entry.
