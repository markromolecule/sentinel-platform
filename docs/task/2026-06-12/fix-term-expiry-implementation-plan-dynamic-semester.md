# Goal: Dynamic Semester/Term Expiry

To make semesters (terms) dynamic such that when a semester/term reaches its `end_date`, its active status (`is_active`) dynamically changes to `inactive`. The change should be adopted automatically by the frontends (`sentinel-support`, `sentinel-core`, `sentinel-web`).

---

## 1-3-1 Rule Options

### 3 Viable Options

#### Option 1: API Mapping Layer (On-the-Fly) Resolution

- **Approach:** Update `mapSemesterResponse` in `map-semester-response.ts` to dynamically calculate `is_active` based on whether `end_date` has passed.
- **Tradeoff:** Extremely lightweight and simple to write tests for, but does not persist the updated active status in the database.

#### Option 2: Daily Cron/Worker Database Updates

- **Approach:** Implement a background job via a `/semesters/check-expiry` endpoint triggered daily by a cron scheduler to update the records in the database.
- **Tradeoff:** Keeps the database fully consistent with the UI status, but adds complexity (requires scheduling infrastructure and creates up to a 24h delay in deactivation unless combined with runtime checks).

#### Option 3: Database Trigger / pg_cron Scheduler

- **Approach:** Define a database trigger or native PostgreSQL cron job to execute database updates immediately on term expiration.
- **Tradeoff:** Moves the logic completely to the database layer for immediate consistency, but is harder to write tests for, manage migrations, or inspect locally in local development workspaces.

### 1 Recommended Best Option

We choose **Option 1** as the primary solution because semesters/terms are not queried via database-level active status filters anywhere else in the API. They are queried by ID or listed, and the UI maps `isActive` directly. Option 1 solves the issue instantly with zero performance or infrastructure overhead, and frontend apps adopt it seamlessly.

---

## User Review Required

> [!NOTE]
> Since we resolve the status dynamically at the API mapper layer, no changes are needed in `sentinel-core`, `sentinel-support`, or `sentinel-web` frontend repositories.

---

## Proposed Changes

### Phase 1: Core API & Service Mapping Changes

**Goal:** Modify the API response mapper to compute dynamic inactivation and add unit tests.

- [x] Modify [map-semester-response.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/semesters/services/map-semester-response.ts) to evaluate term expiry dynamically.
- [x] Create unit tests at [map-semester-response.test.ts](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/app/sentinel-api/src/modules/core/semesters/services/map-semester-response.test.ts) to cover all expiry scenarios.
- [x] Run `pnpm test` and verify that all test suites pass.

**Migration required:** No

---

## Verification Plan

### Automated Tests

- Command: `pnpm --dir app/sentinel-api test map-semester-response.test.ts`

### Manual Verification

1. Navigate to `/semesters` in the core dashboard.
2. Edit a semester and set its `end_date` to a date in the past (e.g., yesterday). Save changes.
3. Verify the semester's status badge dynamically changes to **Inactive**.
4. Set the `end_date` back to a future date, and check that it reverts to **Active**.
