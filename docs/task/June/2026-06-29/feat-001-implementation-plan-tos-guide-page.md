# TOS Guide Page — Implementation Plan

**Summary:** Add a dedicated "TOS Guide" sub-page under the existing `/guide` area in `sentinel-web` that explains how the Table of Specifications works (calculation logic, Bloom's cognitive levels, topic weightage, and difficulty levels), then replicate the same page as a standalone page inside `sentinel-core` and register it in the core admin sidebar.

---

## Pre-Planning Checklist

- [x] Read and summarise the task input in one sentence
- [x] Scan relevant source files to understand existing patterns
- [x] Identify all files, services, and DB tables the task will touch
- [x] Determine if a Prisma migration is needed — **No** (guide page is purely UI/static content)

---

## 1-3-1 Analysis

### Option A — Inline static page (simple/fast)

Add a single `page.tsx` file under `/guide/tos` in `sentinel-web` and a matching one under `/guides/tos` in `sentinel-core` with all content written directly inside the component. Update the `layout.tsx` nav item list in sentinel-web and the capability map + nav config in sentinel-core.

**Tradeoff:** Fastest to ship; content is hard-coded and difficult to update later.

### Option B — Dedicated `_components` module per app (robust/scalable) ✅ **BEST**

Create a reusable `<TosGuideContent />` component in each app's `_components` folder that is imported by the route `page.tsx`. The component mirrors the accordion/card pattern used throughout the existing guide pages (`sentinel-web/guide/page.tsx`, `sentinel-core/guides/page.tsx`).

**Tradeoff:** Slightly more files but keeps page and content rendering concerns cleanly separated — fully consistent with how every other guide/content page is structured in the repo.

### Option C — Shared package component (`packages/ui` or `packages/shared`)

Extract the TOS guide content into a shared package component usable by both apps.

**Tradeoff:** Maximum reuse, but adds cross-package coupling for what is currently a display-only page; overkill for static content.

**Best Option: B** — matches existing patterns in both apps, keeps each app self-contained, and allows independent iteration per app without cross-package changes. No new dependencies required.

---

## Affected Files

| App             | File                                                                            | Action                            |
| --------------- | ------------------------------------------------------------------------------- | --------------------------------- |
| `sentinel-web`  | `app/(protected)/(instructor)/guide/layout.tsx`                                 | MODIFY — add "TOS Guide" nav item |
| `sentinel-web`  | `app/(protected)/(instructor)/guide/tos/page.tsx`                               | NEW                               |
| `sentinel-web`  | `app/(protected)/(instructor)/guide/tos/_components/tos-guide-content.tsx`      | NEW                               |
| `sentinel-web`  | `app/(protected)/(instructor)/guide/tos/_components/tos-guide-content.test.tsx` | NEW                               |
| `sentinel-core` | `app/(protected)/guides/tos/page.tsx`                                           | NEW                               |
| `sentinel-core` | `app/(protected)/guides/tos/_components/tos-guide-content.tsx`                  | NEW                               |
| `sentinel-core` | `app/(protected)/guides/tos/_components/tos-guide-content.test.tsx`             | NEW                               |
| `sentinel-core` | `lib/authorization/core-admin-capability-map.ts`                                | MODIFY — add `'guides'` page ID   |
| `sentinel-core` | `components/sidebar/common/core-admin-nav-config.ts`                            | MODIFY — add "Guides" nav entry   |

**Migration required:** No — this feature touches only UI/routing/static content.

---

## Phase 1: sentinel-web — TOS Guide Sub-Page

**Goal:** Create the TOS Guide content component and mount it at `/guide/tos`, then register it in the existing guide layout sidebar.

- [x] Create `app/sentinel-web/src/app/(protected)/(instructor)/guide/tos/_components/tos-guide-content.tsx`
    - Export a `TosGuideContent` component following the accordion/card pattern used in `guide/page.tsx`
    - Include the following sections using `AccordionItem` from `@sentinel/ui`:
        1. **What is a Table of Specifications?** — definition, purpose
        2. **How the System Assigns Cognitive Levels** — explanation of Bloom's Taxonomy levels (Remembering → Creating), mapped to the 6 `BloomLevel` enum values; render a colour-coded legend using `BLOOM_LEVELS`, `BLOOM_LEVEL_LABELS`, `BLOOM_LEVEL_COLORS` from `../../../bank/tos/_constants`
        3. **Topic Weightage** — how the percentage weight per topic is derived from `total / grandTotal`
        4. **Difficulty Levels** — how difficulty is tagged (`EASY`, `MEDIUM`, `HARD`) and what thresholds trigger each level
        5. **Reading the TOS Matrix** — how to interpret the colour-coded cells per Bloom level shown in `TosMatrixTable`
        6. **FAQ** — common questions (e.g. "Why is a question not appearing in the matrix?")
    - Use only existing `@sentinel/ui` components (`Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`, `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Badge`, `PageHeader`, `Separator`)
    - Add JSDoc comment on the exported function

- [x] Create `app/sentinel-web/src/app/(protected)/(instructor)/guide/tos/page.tsx`
    - `'use client'` directive
    - Default export `TosGuidePage` that renders `<TosGuideContent />`
    - Add JSDoc comment

- [x] Modify `app/sentinel-web/src/app/(protected)/(instructor)/guide/layout.tsx`
    - Extend `GuideSection` type to include `'tos'`
    - Add nav item `{ id: 'tos', label: 'TOS Guide', href: '/guide/tos' }` to `GUIDE_NAV_ITEMS`
    - Extend `activeSection` resolution: if `pathname.includes('/guide/tos')` → return `'tos'`

- [x] Write `app/sentinel-web/src/app/(protected)/(instructor)/guide/tos/_components/tos-guide-content.test.tsx`
    - Vitest + React Testing Library
    - Assert the component renders without crashing
    - Assert heading "Table of Specifications Guide" (or similar) is present
    - Assert all six Bloom level labels appear in the rendered output

**Migration required:** No

---

## Phase 2: sentinel-core — TOS Guide Page + Sidebar Registration

**Goal:** Replicate the TOS Guide as a standalone page in `sentinel-core` and register it in the admin sidebar under a "Guides" nav entry.

- [x] Create `app/sentinel-core/src/app/(protected)/guides/tos/_components/tos-guide-content.tsx`
    - Same structure and sections as the sentinel-web version
    - Import Bloom constants from `../../bank/tos/_constants`
    - Add JSDoc comment on the exported function

- [x] Create `app/sentinel-core/src/app/(protected)/guides/tos/page.tsx`
    - `'use client'` directive
    - Default export `TosGuidePage` that renders `<TosGuideContent />`
    - Add JSDoc comment

- [x] Modify `app/sentinel-core/src/lib/authorization/core-admin-capability-map.ts`
    - Add `'guides'` to the `CoreAdminPageId` union type
    - Add a `guides` entry in `CORE_ADMIN_PAGE_CAPABILITIES`:
        ```ts
        guides: {
            id: 'guides',
            title: 'Guides',
            primaryPath: '/guides',
            aliases: ['/guides/tos'],
            allowedRoles: ['admin', 'superadmin'],
            requiredViewPermissions: [],
            requiredActionPermissions: [],
        },
        ```

- [x] Modify `app/sentinel-core/src/components/sidebar/common/core-admin-nav-config.ts`
    - Import `BookMarked` from `lucide-react`
    - Add a new `'Resources'` nav section (or append to `'Analytics & Logs'`) with:
        ```ts
        { pageId: 'guides', title: 'Guides', url: '/guides', icon: BookMarked }
        ```

- [x] Write `app/sentinel-core/src/app/(protected)/guides/tos/_components/tos-guide-content.test.tsx`
    - Same assertions as the sentinel-web test (renders without crashing, heading present, Bloom labels visible)

**Migration required:** No

---

## Phase 3: Verification & Cleanup

**Goal:** Confirm both pages render correctly, navigation is active, and all tests pass.

- [x] Run `pnpm --dir app/sentinel-web test` — all tests green
- [x] Run `pnpm --dir app/sentinel-core test` — all tests green
- [x] Run `pnpm lint` — no lint errors
- [x] Manually verify:
    - `/guide/tos` is accessible in `sentinel-web` and the sidebar highlights "TOS Guide"
    - `/guides/tos` is accessible in `sentinel-core` and "Guides" appears in the admin sidebar
- [x] Confirm no console errors on page load

**Migration required:** No

---

## Done Criteria

- [x] Every task references a concrete file or function
- [x] Each phase has at least one test task
- [x] Migration decision is explicit (No — UI-only feature)
- [x] No vague tasks — each item maps to a specific file path or function name

---

## Additional Considerations

- No new `.env` variables needed
- No breaking API changes introduced
- Bloom level constants (`BLOOM_LEVELS`, `BLOOM_LEVEL_LABELS`, `BLOOM_LEVEL_COLORS`) are re-used from existing `_constants/index.ts` in each app's TOS directory — **do not duplicate them**
- The sentinel-core `/guides/page.tsx` already exists as a large admin guide; the new TOS guide lives at `/guides/tos` as a nested child route — no conflict
- Verify that `resolveActiveSection` in `sentinel-core/question-bank-nav.tsx` already handles `/question/bank/tos` (it does) — no changes needed there
