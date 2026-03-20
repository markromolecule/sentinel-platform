# Admin Migration & Shared UI Implementation Plan

## Goal
Migrate admin features from `sentinel-web` to `sentinel-core` and centralize common UI components into a shared `packages/ui` package.

## 1-3-1 Rule: Options Analysis

### Option 1: Literal Move & Direct Shared Package
- Move `app/(protected)/admin` from `sentinel-web` to `sentinel-core`.
- Create `packages/ui` as a simple TypeScript/React package.
- Move only the components explicitly used by Admin pages to `packages/ui`.
- **Pros**: Minimal scope, fast execution.
- **Cons**: Fragmented UI components (some in `web/components`, some in `ui`).

### Option 2: Comprehensive UI Migration (Recommended)
- Move `app/(protected)/admin` from `sentinel-web` to `sentinel-core`.
- Create `packages/ui` and populate it with all standard UI primitives (Button, Input, Table, Dialog, etc.) from `sentinel-web/src/components/ui`.
- Update all references in `sentinel-web`, `sentinel-core`, and the migrated admin pages to use `@sentinel/ui`.
- **Pros**: Consistent design system across the monorepo, prevents future duplication.
- **Cons**: Larger initial refactoring effort for existing `sentinel-web` pages.

### Option 3: Incremental Refactoring with Component Aliasing
- Move `app/(protected)/admin` from `sentinel-web` to `sentinel-core`.
- Create `packages/ui` but keep components in `sentinel-web` for now, using a transitional `@sentinel/ui` that exports from `packages/ui`.
- Slowly move components as they are needed by new `sentinel-core` features.
- **Pros**: Lowest risk of breaking existing `sentinel-web` functionality.
- **Cons**: Duplication persists during the transition, complex dependency graph.

## Selection & Recommendation
**Option 2 (Comprehensive UI Migration)** is the best approach. 
**Why?** Since both apps already share many dependencies and design requirements (Radix UI, Tailwind, Lucide), having a single source of truth for UI primitives ensures consistency. Moving the entire `components/ui` directory to a shared package is cleaner than cherry-picking and avoids "import hell" where developers are unsure which package to use for a basic Button.

## Next Steps
1. Create and configure `packages/ui`.
2. Move UI primitives to `packages/ui`.
3. Update `sentinel-web` to use `@sentinel/ui`.
4. Migrate admin directory to `sentinel-core`.
5. Update admin imports to use `@sentinel/ui`.
