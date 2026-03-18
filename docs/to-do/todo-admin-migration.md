# Admin Migration To-Do

## Context
- Move `app/sentinel-web/src/app/(protected)/admin` to `app/sentinel-core/src/app/(protected)/admin`
- Extract required admin UI components into `packages/ui`
- Update imports in both apps to consume shared UI package

## 1-3-1
1. Objective
- Migrate admin routes to `sentinel-core` and centralize shared UI without duplicating component files.

2. Three viable options
1. Targeted extraction
- Move admin route directory to `sentinel-core`.
- Extract only admin-used UI components from `sentinel-web` to `packages/ui`.
- Rewrite affected imports in both apps to `@sentinel/ui/...`.
2. Compatibility-first staged migration
- Copy admin route first (leave original temporarily), create `@sentinel/ui`, switch imports, then delete original admin route.
- Lowest breakage risk, but temporarily duplicates route code.
3. Full UI centralization
- Move all `src/components/ui` files to `packages/ui` and rewrite all app imports.
- Most consistent architecture, but highest blast radius and verification effort.

3. Best option and recommendation
- Best: Option 1 (targeted extraction).
- Why: satisfies your goal directly, avoids temporary route duplication, and keeps change scope focused on admin + required shared UI only.

## Execution Checklist
- [ ] Inventory admin route UI imports and transitive UI dependencies
- [ ] Create `packages/ui` package scaffold (package, tsconfig, exports)
- [ ] Move required UI components from `sentinel-web` into `packages/ui/src`
- [ ] Update `sentinel-web` imports to `@sentinel/ui/...` for moved components
- [ ] Move admin route directory from `sentinel-web` to `sentinel-core`
- [ ] Update `sentinel-core` admin imports to `@sentinel/ui/...`
- [ ] Add `@sentinel/ui` dependency in both app package manifests
- [ ] Ensure workspace + build scripts recognize new `packages/ui`
- [ ] Run lint/type checks for `sentinel-web` and `sentinel-core`
- [ ] Document migrated components and final status

## Progress Log
- [x] Initial analysis complete
- [ ] Migration in progress
- [ ] Validation complete
