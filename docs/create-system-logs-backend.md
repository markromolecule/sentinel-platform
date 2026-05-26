# Implementation Plan Context: Backend Module — System Logs

## Overview

Build the **System Logs** backend module for `sentinel-api`. This module is responsible for capturing, storing, and exposing end-to-end activity logs across the entire system. It must follow the same architectural patterns, coding conventions, and folder structure used by the existing modules in the codebase.

---

## Module Location

```
@app/sentinel-api/src/modules/general/logs/
```

---

## Folder & File Structure

Strictly follow and maximize the use of the structure below, consistent with how other modules are organized:

| Path | Purpose |
|---|---|
| `controllers/` | Route handler controllers. Each controller should be scoped to a specific log concern (e.g., auth logs, activity logs) to keep them focused and maintainable. |
| `data/` | Data access layer — repository logic, raw queries, and database interaction for logs. |
| `services/` | Supporting services broken down by concern. This prevents the main `logs.service.ts` entry point from becoming bloated. Each sub-service should own a specific domain of log logic. |
| `logs.dto.ts` | Data Transfer Objects — request/response shapes, query filters, pagination, and validation decorators. |
| `logs.routes.ts` | Route definitions and mapping of routes to controllers. |
| `logs.service.ts` | Main service entry point. Acts as an orchestrator that delegates to the sub-services inside `services/`. Keep this file lean. |

---

## Core Requirements

### 1. Consistent Code Style
- Match the structure, naming conventions, patterns, and syntax of existing modules in the codebase.
- Reuse shared utilities, decorators, base classes, or interceptors already established in the project.

### 2. Comprehensive Log Coverage
The module must cover **all meaningful system events end-to-end**, including but not limited to:

- **Authentication & Session** — login, logout, failed login attempts, token refresh, session expiry
- **User Activity** — CRUD operations performed by users across all modules
- **Access & Permissions** — unauthorized access attempts, role/permission changes
- **Data Events** — record creation, updates, deletions, and bulk operations
- **System Events** — module-level errors, background jobs, scheduled tasks, integrations
- **Administrative Actions** — user management, configuration changes, system settings updates

> The log coverage should be reviewed against all existing modules in the system to ensure nothing is missed. Think **end-to-end**: from the moment a user authenticates to every action they take within the platform.

### 3. Scoping & Data Isolation
All log queries and records **must be scoped** to:
- The **parent institution** the user belongs to.
- The **specific branch** the user is currently logged in under.

This ensures users can only view logs relevant to their context and prevents cross-institution or cross-branch data leakage.

---

## Key Design Principles

- The `logs.service.ts` main file should only orchestrate — delegate heavy logic to sub-services inside `services/`.
- Controllers should be thin — only handle HTTP concerns and delegate to services.
- The `data/` layer should be the only layer that directly interacts with the database.
- DTOs must enforce validation and clearly define what filters are available (e.g., date range, log type, branch, user, action).