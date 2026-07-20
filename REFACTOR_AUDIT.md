# Phase 0 — Structural Refactor Audit

**Verdict: NOT refactored.** The repo still uses type-based folders (`pages/`, `components/`, `lib/`, `context/`), has no `features/` / `routes/` / `shared/` layout, and exceeds the complexity budget in multiple god files.

## Project context (filled)

| Field | Value |
| --- | --- |
| Stack | React 18, TypeScript, Vite, Tailwind, shadcn/ui, Framer Motion |
| Router | **react-router-dom v6** (not TanStack Router) |
| Query | `@tanstack/react-query` installed; only `QueryClientProvider` wired — **zero `useQuery`/`useMutation` usage** |
| State | React Context (`AppContext`) + `localStorage` draft |
| Backend | None — local-first SPA |
| Package manager | npm |
| Repo root | `/Users/dongm1/Documents/Code/cvtify` |
| Tests | Minimal (vitest example only) |
| Must not break | CV builder ↔ preview, category walkthrough ↔ dashboard, report/recommendations/dream-jobs, timeline, localStorage draft persistence |

**Decision (Phase 1):** Stay on `react-router-dom`. Introducing `@tanstack/react-router` would violate “no new dependencies without approval.” Thin route files will live under `src/routes/` as RR wrappers.

---

## 1. File inventory (over budget)

Complexity budget: components ≤200 LOC hard; `lib/` ≤250; routes ≤80. Counts exclude nothing (raw `wc -l`).

| Lines | File | Ceiling | Status |
| ---: | --- | ---: | --- |
| 1390 | `src/pages/CvBuilder.tsx` | 200 | **7× over** |
| 771 | `src/components/ActivityWalkthrough.tsx` | 200 | **3.8× over** |
| 444 | `src/components/TimelineView.tsx` | 200 | **2.2× over** |
| 366 | `src/lib/storage.ts` | 250 | over |
| 349 | `src/pages/CategorySelect.tsx` | 200 | over |
| 327 | `src/lib/cvAutofill.ts` | 250 | over |
| 313 | `src/pages/ReportCard.tsx` | 200 | over |
| 304 | `src/lib/data.ts` | 250 | over |
| 302 | `src/components/cv/AutoBuildHero.tsx` | 200 | over |
| 291 | `src/components/cv/QuickFillCard.tsx` | 200 | over |
| 266 | `src/components/fx/StoryTextarea.tsx` | 200 | over |
| 261 | `src/components/fx/MonthYearField.tsx` | 200 | over |
| 259 | `src/pages/CvPreview.tsx` | 200 | over |
| 251 | `src/components/cv/ActivityImportSheet.tsx` | 200 | over |
| 249 | `src/components/fx/ImmersiveField.tsx` | 200 | over |
| 211 | `src/pages/Index.tsx` | 200 | over (unused in router) |

Also near/over soft target: Dashboard (181), DreamJobs (168), CvOverview (164), Recommendations (156).

---

## 2. Code smell report

### God components
- **`CvBuilder.tsx`**: UI + draft mutations + section expand state + entry CRUD + skills editor + quick-fill orchestration + inline helpers (`formatDateRange`, `emailValid`) + 7 nested components (`SectionCard`…`TagInput`) in one file.
- **`ActivityWalkthrough.tsx`**: multi-step form state, date math, validation, and all step UIs in one file.
- **`CategorySelect.tsx`**: category picking + walkthrough host + timeline toggle + activity CRUD side effects.
- **`TimelineView.tsx`**: layout math + rendering + interaction in one file.
- **`ReportCard.tsx`**: report UI + hobby editing + exported `BottomNav` (shared nav leaked into a page).

### Inline API / fetch
- No network fetches. Persistence is `localStorage` via `loadDraft`/`saveDraft` in context effect. Query is dead weight today.

### Duplicated logic
- Month labels / date formatting appear in `CvBuilder`, `ActivityWalkthrough`, `MonthYearField`, `TimelineView`.
- Email validation regex in `CvBuilder` vs `cvAutofill` (`EMAIL_RE`).
- Skill category data split across `lib/data.ts` (activity categories) and `lib/storage.ts` (`SKILL_CATEGORIES`).

### Prop drilling
- Mild: walkthrough gets `category` + callbacks; CV section editors take many callbacks (EntryListSection has 10+ props) — options-object candidate.

### Business logic in handlers
- `CvBuilder` handlers (`handleAutoBuild`, `applyQuickFill`, skill add/remove) embed merge rules that belong in `lib/`.
- `AppContext.backfillOccurredAt` is pure logic living inside a React module.

### Magic strings
- Storage key `skillcompass_draft_v2`; section keys `"workExperience" | "education" | "certifications"`; route paths scattered as string literals in `navigate(...)`.

### `any` / weak typing
- `tsconfig` has `strict: false`, `noImplicitAny: false`. `migrateCvSkills(skills: unknown)` is OK; JSON parse cast to `DraftData` without zod.

### Function signature smells
- `EntryListSection` / several builders take far more than 3 positional params (props objects — acceptable if named options).
- Boolean-ish UI flags common (`isEditing`, `expanded`) — OK when named.

### Documentation
- Sparse: some files have useful comments (`cvAutofill`, `backfillOccurredAt`); most exports lack file/function headers per the standard.

### TanStack-specific
- **Router**: using RR, not TanStack Router; no loaders/`validateSearch`.
- **Query**: provider present, no `queryOptions`, no query keys, no shared staleTime config.
- **Form**: react-hook-form + zod in package.json; activity/CV flows use raw `useState`, not shared schemas.
- **Table / Start**: N/A.

---

## 3. Dependency map

```
App
 └─ QueryClientProvider (unused queries)
     └─ AppProvider  ←── localStorage draft (single global)
         └─ BrowserRouter
             ├─ CvBuilder / CvPreview  ← cv + activities
             ├─ CategorySelect / AddActivity / Timeline / Dashboard ← activities
             ├─ ReportCard / Recommendations / DreamJobs ← insights + hobbies/jobs
             └─ NotFound

Shared UI: components/ui/*, components/fx/*
Domain data: lib/data.ts, lib/storage.ts, lib/cvAutofill.ts, lib/explanations.ts
```

All feature pages read/write through `useAppState()`. No other global singletons.

---

## 4. Proposed target tree ↔ current files

```
src/
  routes/                         # thin RR route modules
  features/
    cv/
      api/                        # draft CV selectors/mutations wrappers (local)
      components/                 # builder sections, preview, autofill UI
      hooks/
      lib/                        # cvAutofill, formatters, validators
      types.ts / schema.ts
    activities/
      components/                 # walkthrough steps, timeline, category UI
      hooks/
      lib/                        # categories, activity types, date helpers
      types.ts
    insights/
      components/                 # report, recommendations, dream jobs, dashboard
      lib/                        # sample jobs/events, hobby options, scoring helpers
  shared/
    api-client/                   # localStorage draft client (single persistence boundary)
    components/ui/ + fx/
    hooks/
    lib/                          # cn(), shared date/month utils
    types/
  App.tsx / main.tsx
```

| Current | Destination(s) |
| --- | --- |
| `lib/utils.ts` | `shared/lib/cn.ts` (or `utils.ts`) |
| `lib/storage.ts` | `shared/api-client/draft-storage.ts` + `features/cv/types.ts` + skill catalog in `features/cv/lib/` |
| `lib/data.ts` | `features/activities/lib/categories.ts` + `features/insights/lib/sample-jobs.ts` |
| `lib/cvAutofill.ts` | `features/cv/lib/*` (split if >250) |
| `lib/explanations.ts` | `features/activities/lib/explanations.ts` |
| `context/AppContext.tsx` | `shared/app-state/` (provider + backfill in `lib/`) |
| `pages/CvBuilder.tsx` | `features/cv/components/*` + thin page + route |
| `pages/CvPreview.tsx` | `features/cv/components/CvPreview.tsx` |
| `components/cv/*` | `features/cv/components/` |
| `components/ActivityWalkthrough.tsx` | `features/activities/components/walkthrough/*` |
| `components/TimelineView.tsx` | `features/activities/components/timeline/*` |
| `pages/CategorySelect.tsx` etc. | feature pages + `routes/*.tsx` |
| `pages/ReportCard.tsx` (`BottomNav`) | `shared/components/BottomNav.tsx` + insights page |
| `components/ui/*`, `fx/*` | `shared/components/ui/*`, `shared/components/fx/*` |
| `hooks/*` | `shared/hooks/*` |
| `pages/Index.tsx` | keep or drop (currently unused in router) — leave reachable only if needed |

---

## 5. Risk list

| Risk | Why |
| --- | --- |
| localStorage shape / migration | `migrateCvSkills` + mock backfill — must preserve exact key and merge behavior |
| `backfillOccurredAt` determinism | Timeline layout depends on stable timestamps |
| Framer Motion layoutIds / AnimatePresence | Extracting components can break exit animations if keys change |
| `BottomNav` import path | Exported from ReportCard; other pages may import it |
| Path alias churn | Mass `@/` import updates; easy to miss a file |
| CvBuilder section state | Many booleans; split must not remount and reset expand/edit state |
| Dead QueryClient | Keep provider for future; don’t invent fake remote API |

---

## Phase 1 execution order

1. Shared scaffolding (ui/fx/hooks/utils) — validate import graph
2. Draft storage + app state extraction
3. **activities** feature (data + walkthrough + timeline + category pages)
4. **cv** feature (autofill + builder split + preview)
5. **insights** feature (dashboard, report, recommendations, dream jobs)
6. Thin `routes/` + App wiring; build + smoke checklist

Each module: extract-only, docs + complexity budget, behavior-neutral commit.
