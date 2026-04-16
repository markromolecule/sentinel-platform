# System Architecture Documentation

This document provides a comprehensive overview of the Sentinel system's architecture, from frontend hooks to backend data access, including database integration with Prisma and Kysely.

---

## High-Level Overview

The system follows a modular architecture where frontend and backend are synchronized through shared types and schemas.

```mermaid
graph TD
    subgraph Frontend [Sentinel Web]
        Hook[React Hook] --> Mutation[TanStack Query Mutation]
        Mutation --> APIClient[API Client]
    end

    subgraph Backend [Sentinel API]
        Route[Hono Route] --> Controller[Route Handler]
        Controller --> Service[Service Layer]
        Service --> DAL[Data Access Layer]
    end

    subgraph Database [PostgreSQL]
        DAL --> DB[(Kysely/Prisma)]
    end

    Shared[@sentinel/shared] -.-> Frontend
    Shared -.-> Backend
```

---

## Layer Breakdown

### 1. Shared Layer (`@sentinel/shared`)

- **Purpose**: Centralized source of truth for types, Zod schemas, and constants.
- **Sync**: Ensures that frontend form validation matches backend request validation.
- **Files**: `packages/shared/src/schema`, `packages/shared/src/types`. (Verify paths in packages directory)

### 2. Frontend Layer (Sentinel Web)

- **Hooks**: Custom hooks (e.g., `useAddDepartmentForm`) manage form state using `react-hook-form` and `zodResolver`.
- **Query/Mutations**: TanStack Query hooks (e.g., `useCreateDepartmentMutation`) handle server state, caching, and invalidation.
- **Data/API**: A thin abstraction over `fetch` (e.g., `data/api/departments.ts`) that handles URL construction and mapping backend snake_case to frontend camelCase.

### 3. Backend Layer (Sentinel API)

- **Routes**: Defined using `@hono/zod-openapi` for type-safe routing and automatic documentation.
- **Controllers**: Handle request validation, extract user context from middleware, and call services.
- **Services**: Contain business logic and orchestrate data access operations.
- **Data (DAL)**: Pure data access functions using Kysely for type-safe SQL queries.

### 4. Database Layer

- **Prisma**: Used for schema management, migrations, and generating the base TypeScript types for the database.
- **Kysely**: Used as the primary query builder for performance and complex joins while maintaining type safety through `prisma-extension-kysely`.

---

## CRUD Walkthrough: Departments Module

### Create Operation Flow

1.  **Frontend Component**: A user submits a form in `add-department-dialog.tsx`.
2.  **Form Hook**: `useAddDepartmentForm.ts` validates inputs against `departmentSchema` and calls `createDepartment.mutate(values)`.
3.  **Mutation**: `useCreateDepartmentMutation.ts` executes the `createDepartment` API function.
4.  **API Client**: `data/api/departments.ts` sends a POST request to `/departments`.
5.  **Backend Route**: `departments.routes.ts` receives the request and directs it to `createDepartmentRouteHandler`.
6.  **Controller**: `create-department.controller.ts` validates the body, gets the user ID, and calls `DepartmentService.createDepartment`.
7.  **Service**: `departments.service.ts` transforms input into database-friendly format and calls `createDepartmentData`.
8.  **Data Access**: `create-department.ts` uses the `dbClient` (Kysely) to insert the record:
    ```typescript
    await dbClient
        .insertInto('departments')
        .values(values)
        .returningAll()
        .executeTakeFirstOrThrow();
    ```
9.  **Synchronization**: On success, the frontend mutation invalidates `DEPARTMENT_QUERY_KEYS.all`, triggering a refresh of the department list.

---

## Key Technologies

- **Validation**: [Zod](https://zod.dev/) (Shared across layers)
- **UI State**: [React Hook Form](https://react-hook-form.com/)
- **Server State**: [TanStack Query](https://tanstack.com/query)
- **API Framework**: [Hono](https://hono.dev/)
- **DB Interface**: [Prisma](https://www.prisma.io/) + [Kysely](https://kysely.dev/)
