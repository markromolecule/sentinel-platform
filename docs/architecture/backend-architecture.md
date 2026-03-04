# Backend Architecture & Structure Overview

This document explains the architecture of the Sentinel backend (`app/sentinel-api`), detailing the purpose of each layer and how data flows from the route down to the database and back to the frontend. It also covers the role of the shared types package.

## 1. Core Structure & Data Flow

The backend is logically organized into Feature Modules (e.g., `src/modules/courses`). Each module represents a distinct domain and contains several layers with specific responsibilities:

```text
Request -> Routes -> Controllers -> Services (Optional) -> Data Access -> Database
                                                                           |
Response <- DTOs <- Controllers <- Services (Optional) <- Data Access <----+
```

### Components and Their Purpose

#### A. Routes (`[module].routes.ts`)
**What it is:** The entry point for a module's endpoints.
**Purpose:** Maps HTTP methods (GET, POST, PUT, DELETE) and URL paths (e.g., `/courses`) to their respective Controller route handlers. It also registers OpenAPI documentation for the routes.
**Why it's needed:** Keeps routing centralized and distinct from business logic, making it easy to see all available endpoints for a module at a glance without diving into implementation details.

#### B. Controllers (`controllers/`)
**What it is:** The HTTP interface layer.
**Purpose:** 
- Receives the incoming request (`c.req`).
- Extracts and validates parameters, query strings, and body payload (often relying on DTO schemas).
- Calls the appropriate Service or Data Access function to execute the required action.
- Formats and sends the HTTP response with the correct status code (e.g., `200 OK`, `201 Created`).
**Why it's needed:** It decouples HTTP transportation details from core business or database logic. If the underlying framework changes, only the Controllers and Routes would need major refactoring.

#### C. DTOs - Data Transfer Objects (`[module].dto.ts`)
**What it is:** The data contracts for your endpoints, typically defined using Zod schemas (`@hono/zod-openapi`).
**Purpose:** Defines the exact, strict shape of incoming request data (params, query, body) and outgoing response data. 
**Why it's needed:** Ensures that the backend only processes valid data (automatically rejecting requests missing required fields or having wrong types). It also powers automatic OpenAPI (Swagger) documentation generation and provides strictly typed objects inside the Controllers for TypeScript.

#### D. Services (`[module].service.ts`)
**What it is:** The business logic orchestration layer.
**Purpose:** Coordinates complex operations. If creating a course also requires verifying a user's permissions, checking department status, logging an audit trail, and formatting a complex response, the Service layer handles this orchestration.
**Why it's needed:** Keeps Controllers thin (only handling HTTP) and Data Access functions simple (only handling SQL/Database queries). It allows you to reuse complex business logic across different controllers (or even background cron jobs) without duplicating code. For very simple CRUD operations, the Service layer can be bypassed entirely (i.e., Controller -> Data Access).

#### E. Data Access (`data/`)
**What it is:** The database communication layer.
**Purpose:** Contains functions that execute SQL queries (via Database Clients like Kysely) or interact with external APIs. For example, `createCourseData`, `getCourseData`.
**Why it's needed:** Isolates all database interactions. Tests, Controllers, and Services don't need to know *how* to query the database, they just call a data function. It centralizes SQL queries, making schema updates, query optimization, and database migrations significantly easier to manage.

---

## 2. Shared Types and Their Role

The project utilizes a monorepo workspace setup with a dedicated `packages/shared` workspace that contains the types, schemas, and schemas used comprehensively across the application.

### How Shared Types Work
The `packages/shared` directory contains core domain definitions (like Zod schemas, TypeScript interfaces, enums, and constants) that are agnostic to any specific execution environment (meaning they aren't tied exclusively to the Node.js backend or the React frontend).

### How It Applies to the Backend
1. **End-to-End Type Safety:** Both the `sentinel-api` (backend) and the frontend apps import from `packages/shared`. This guarantees that the frontend form validation exactly matches the backend API validation.
2. **DTO Construction:** The backend imports these shared base schemas to construct its request/response DTOs. 
   ```typescript
   // Example Conceptual Flow: Backend DTO uses the Shared Schema validation
   import { courseSchema } from '@shared/schema/admin/courses/course-schema';
   
   export const createCourseSchema = {
     body: courseSchema, // Leverages the shared validation rules!
     response: courseSchemaOpenApi,
   };
   ```
3. **Single Source of Truth:** If a business rule changes (e.g., "Course titles must now be at least 10 characters"), you update the Zod schema in **one place** (`packages/shared/src/schema/...`). Automatically:
   - The frontend forms will legally enforce the new rule and show UI errors if it fails.
   - The backend DTOs will reject invalid incoming network requests based on that exact same rule.
   - You do not need to hunt down multiple files in both codebases to make sure the validations match.

### Summary of Benefits
- **Zero Duplication:** No need to write validation logic in React and then rewrite the exact same logic in the Hono API.
- **Frontend-Backend Sync:** If a specific field name is altered in a shared schema/type, both the frontend and backend will trigger a TypeScript compilation error if they aren't explicitly updated, preventing hidden runtime production crashes.
