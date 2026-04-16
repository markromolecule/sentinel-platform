# Monorepo Structure

The Sentinel project utilizes a monorepo setup managed by **pnpm workspaces** and **Turborepo** to handle multiple applications and shared packages efficiently.

## Workspace Layout

The root workspace contains two main directories: `app/` for the applications and `packages/` for shared internal libraries.

### Applications (`app/`)

This directory contains all the runnable applications within the ecosystem:

- **`sentinel-api`**: The backend RESTful and modular API built using **Hono**, integrated with **Kysely** for query building and **Prisma** for schema management and typings.
- **`sentinel-web`**: The main frontend React application built using **Next.js**, utilizing React components, query hooks, and global state (Zustand).
- **`sentinel-mobile`**: The cross-platform mobile application powered by **Expo** and **React Native**.

### Shared Packages (`packages/`)

This directory contains reusable code that spans across the applications to ensure consistency and prevent code duplication:

- **`shared`**: A unified library exporting types, interfaces, utility functions, validation schemas (Zod), and data access patterns needed by both the API and client applications. Under the hood, imports point to `@packages/shared`.

## Benefits

- **Shared Code**: Shared logic stays in `packages/shared`, preventing data structure discrepancies between the frontend and backend.
- **Task Orchestration**: Turborepo manages the build, dev, and lint pipelines (`turbo run dev`, `turbo run build`).
- **Unified Dependency Management**: `pnpm` optimizes node module resolution, caching, and versions across the monorepo workspaces.
