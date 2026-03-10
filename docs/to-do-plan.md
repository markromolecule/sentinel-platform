# 1-3-1 Database Centralization Plan

## 1 Problem
The database schema (`schema.prisma`), database types, and Prisma/Kysely clients are currently duplicated or isolated inside the `sentinel-api` application. This prevents `sentinel-web` and `sentinel-core` from natively importing and sharing the exact same unified database types, leading to reduced type safety, redundant schema definitions across the monorepo, and a fragile architecture where migrations are only maintained inside the backend app.

## 3 Solutions

### Solution A: Centralize in `@packages/db` (Recommended)
Move `schema.prisma`, generated types, and the `dbClient` (Prisma/Kysely initialization) into a new workspace package `@packages/db`. All apps (`sentinel-api`, `sentinel-core`, `sentinel-web`) add `@packages/db` as a dependency and import their database client and types from there.
- **Pros:** True single source of truth, types are guaranteed to be in sync across the monorepo, easy to manage migrations.
- **Cons:** Requires a structural refactoring of imports and build steps to ensure the package is built before apps consume it.

### Solution B: Keep Schema in API, Export Types
Keep `schema.prisma` and the `dbClient` inside `sentinel-api`, but configure `sentinel-api` to build and export only the generated types for the Next.js apps to consume.
- **Pros:** Less structural movement of files.
- **Cons:** Creates a tight coupling where frontends rely on the backend package directly. It mixes app runtime code with shared library code.

### Solution C: Maintain Separate Schemas per App
Allow each application (`sentinel-api`, `sentinel-web`, `sentinel-core`) to maintain its own copy of the database schema and generate its own types.
- **Pros:** Total decoupling of apps.
- **Cons:** Extremely high maintenance. Duplicated schemas inevitably drift out of sync, defeating the purpose of a monorepo and TypeScript end-to-end safety.

## 1 Recommendation
**Proceed with Solution A.** Centralizing everything in `@packages/db` is the industry standard for TypeScript monorepos (like Turborepo). It creates a clean boundary for the data access layer, allowing any app in the monorepo to safely interact with or infer types from the database without tightly coupling to the backend API app.

---

## To-Do List

- [ ] **Step 1: Initialize `@packages/db`**
  - Create `package.json` for `@sentinel/db`.
  - Add Prisma, Kysely, and TypeScript dependencies.
  - Setup `tsconfig.json` and a build script (`tsup` or `tsc`).

- [ ] **Step 2: Migrate Prisma Schema & Client**
  - Move `app/sentinel-api/prisma/schema.prisma` to `packages/db/prisma/schema.prisma`.
  - Move `app/sentinel-api/src/lib/db.ts` and `app/sentinel-api/src/lib/create-db-client.ts` to `packages/db/src/`.

- [ ] **Step 3: Migrate Supabase Types**
  - Locate `database.types.ts` (if exists) and move to `packages/db/src/supabase.ts`.

- [ ] **Step 4: Update `sentinel-api`**
  - Delete old Prisma configuration and db client instances.
  - Add `"@sentinel/db": "workspace:*"` to `sentinel-api/package.json`.
  - Run a global search-and-replace to update relative database imports to `@sentinel/db`.

- [ ] **Step 5: Update `sentinel-web` & `sentinel-core`**
  - Add `"@sentinel/db": "workspace:*"` to their respective `package.json`.
  - Ensure they import Supabase types directly from `@sentinel/db`.

- [ ] **Step 6: Ensure Build & tests pass**
  - Run `pnpm install` at the root.
  - Run `pnpm run build` via Turbo.
  - Run `pnpm run test` for vitest tests to verify the logic remains intact.
