# Context: Dynamic Semester/Term Inactivation on Expiry

## Goal

To make semesters (terms) dynamic such that when a semester/term reaches its `end_date`, its active status (`is_active`) dynamically changes to `inactive`.

---

## 1. Codebase Analysis & Current State

### Database Schema

In [schema.prisma](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/db/prisma/schema.prisma#L1132-L1160), semesters are represented by the `terms` model:

- `term_id`: Primary key (UUID).
- `is_active`: Boolean flag indicating if the term is active (`true`/`false`).
- `start_date`: Optional start timestamp.
- `end_date`: Optional end timestamp.
- Partial index `one_active_term` exists to quickly locate the active term per institution:
    ```prisma
    @@index([institution_id], map: "one_active_term", where: raw("(is_active = true)"))
    ```

### API Layer

Semesters are managed under the `semesters` module in `sentinel-api` ([semesters.service.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/semesters/semesters.service.ts)):

- When a semester is created or updated to `is_active: true`, other semesters for that institution are deactivated via `deactivateInstitutionSemestersData` in [deactivate-institution-semesters.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/semesters/data/deactivate-institution-semesters.ts).
- API responses are mapped using `mapSemesterResponse` in [map-semester-response.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/semesters/services/map-semester-response.ts).

### Frontend Consumption

- **Shared Service Mapping:** In [semesters.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/packages/services/src/api/semesters.ts), the API response property `is_active` is mapped to camelCase `isActive` for the frontend.
- **`sentinel-core` & `sentinel-support`:** Both portals render the semester lists using the custom hook `useSemestersQuery` and display an **Active/Inactive** badge based on `row.isActive` in [columns.tsx](<file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-core/src/app/(protected)/(organization)/semesters/_components/tables/columns.tsx#L71-L78>).
- **Form Bindings:** The semester editing dialogs bind form fields directly to `semester.isActive`.

---

## 2. Adoption Strategy for Frontend Apps

Because the frontend portals (`sentinel-core`, `sentinel-support`, `sentinel-web`) derive the semester's active status directly from `is_active` (mapped to `isActive`), **any backend/API-level dynamic resolution of `is_active` will be adopted automatically by all frontend applications.** No changes will be required to the component or page layouts in the client workspaces.

---

## 3. Proposed Implementation Strategies

We propose three potential paths to achieve dynamic inactivation:

### Option A: Query-Time (On-the-Fly) Dynamic Evaluation (Recommended)

We dynamically compute the active status when semesters are queried and serialized.

- **Mechanism:** In [map-semester-response.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/semesters/services/map-semester-response.ts), we check if `end_date` is in the past:
    ```typescript
    const isExpired = record.end_date ? new Date(record.end_date) < new Date() : false;
    const is_active = record.is_active && !isExpired;
    ```
- **Pros:**
    - Zero-maintenance: No extra background workers, cron schedulers, or database triggers needed.
    - Immediate precision: Expiry takes effect the exact millisecond the `end_date` is passed.
- **Cons:**
    - Database row still retains `is_active = true` until manually modified or another semester is set as active.

### Option B: Scheduler/Cron-Based Database Inactivation

A background task runs periodically to update the database records.

- **Mechanism:** Create a protected cron endpoint `/semesters/check-expiry` in the API. It runs an update query:
    ```sql
    UPDATE terms SET is_active = false WHERE is_active = true AND end_date < NOW();
    ```
- **Pros:**
    - Keeps database state fully consistent with reality.
- **Cons:**
    - Relies on external scheduler infrastructure (e.g. Vercel Cron, pg_cron).
    - Delay in updates depending on cron frequency (e.g., daily runs mean up to 24 hours of stale "Active" status in database).

### Option C: Hybrid Approach

Combine **Option A** for instant API-level response accuracy and **Option B** for background database cleanup.

---

## 4. Verification Plan

### Automated Testing

- Update [map-semester-response.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/semesters/services/map-semester-response.ts) and add unit tests to verify:
    1. A semester with `is_active: true` and a future `end_date` returns `is_active: true`.
    2. A semester with `is_active: true` and a past `end_date` returns `is_active: false`.
    3. A semester with `is_active: true` and `end_date: null` returns `is_active: true`.
    4. An already inactive semester with any `end_date` returns `is_active: false`.

### Manual Testing

1. Navigate to `/semesters` in the core dashboard.
2. Edit a semester and set its `end_date` to a date in the past (e.g., yesterday). Save changes.
3. Verify the semester's status badge dynamically changes to **Inactive**.
4. Set the `end_date` back to a future date, and check that it reverts to **Active**.
