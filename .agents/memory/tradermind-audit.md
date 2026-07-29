---
name: TraderMind Web Audit Findings
description: Key fixes applied during the Production Release Audit and remaining caveats
---

## importReplace atomicity
`backupService.importReplace` was extended to wrap ALL 17 Dexie tables (core + extended) in a single `db.transaction('rw', tables, ...)`. Previously only 7 core tables were covered. Extended tables cast as `any[]` — not yet strongly typed against BackupData interface.

**Why:** If bulkAdd fails mid-way with partial-transaction, the DB would be left empty. Dexie transaction rollback prevents this.

**How to apply:** Any new DB table added to `database.ts` must also be added to the `tables` array in `importReplace` and to the `BackupData['data']` interface.

## seedService.ts Trade type
`Trade` type (from `database.ts`) has ~30 required fields. `Omit<Trade, 'id'|'createdAt'|'updatedAt'>` still requires all other fields including `sessionId`, `market`, `riskAmount`, `fees`, `emotions`, `review`, `reasonForExit`, `liveMonitoring`, `plannedEntry`, `plannedSL`, `plannedTP`, `plannedRR`, `plannedRisk`, `plannedPositionSize`, `setupType`, `timezone`, `entryReason`, `lesson`, `slMoved`, `tpMoved`, `partialClose`, `addedToPosition`, `reducedPosition`, `manualExit`, `managementReason`, `mtfAnalysis`, `adherenceNotes`. All set to null in seed data.

## PWA
`vite-plugin-pwa` added to `artifacts/tradermind/vite.config.ts`. `public/manifest.json` created with RTL/Persian metadata and dark splash color. Fonts: Vazirmatn + Inter both loaded in `index.html`.

## Audit score
72/100 → blockers fixed → ready for production.
