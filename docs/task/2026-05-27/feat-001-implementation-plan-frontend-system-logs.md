# Frontend System Logs – Implementation Plan

## Summary

Wire up the system logs frontend (`sentinel-core`) to consume real data from the backend API.
The backend exposes three authenticated GET endpoints under `/logs` (auth, activity, system).
The page currently renders mock data. This plan replaces that with live TanStack Query hooks backed by a new `@sentinel/services` API module.

---

## Scope

| Layer                                    | Status          | Work Required                      |
| ---------------------------------------- | --------------- | ---------------------------------- |
| `app/sentinel-api` — logs routes         | ✅ Done         | No changes                         |
| `packages/services/src/api/logs.ts`      | ❌ Missing      | **Create**                         |
| `packages/services/src/api/index.ts`     | ⚠️ Needs export | **Add** `logs` export              |
| `packages/shared/src/constants/logs.ts`  | ❌ Missing      | **Create** query keys              |
| `packages/shared/src/constants/index.ts` | ⚠️ Needs export | **Add** `LOGS_QUERY_KEYS` export   |
| `packages/hooks/src/query/logs/`         | ❌ Empty dir    | **Create** 3 query hooks + index   |
| `packages/hooks/src/query/index.ts`      | ⚠️ Needs export | **Add** `logs` export              |
| `sentinel-core` — logs `page.tsx`        | ⚠️ Mock data    | **Replace** with query hooks       |
| `sentinel-core` — logs `_components/`    | ⚠️ Static       | **Update** to accept `LogRecord[]` |

---

## API Endpoints (Reference)

| Hook          | Endpoint             | Method | Query Params                                                                 |
| ------------- | -------------------- | ------ | ---------------------------------------------------------------------------- |
| Auth Logs     | `GET /logs/auth`     | GET    | `page, pageSize, startDate, endDate, action, resourceType, userId, branchId` |
| Activity Logs | `GET /logs/activity` | GET    | same                                                                         |
| System Logs   | `GET /logs/system`   | GET    | same                                                                         |

All endpoints return `{ message: string, data: LogPage }` where `LogPage` = `{ items, page, pageSize, total, totalPages, hasMore }`.

---

## Phase 1 — Service Layer (`packages/services`)

**Goal:** Create API client functions for all three log endpoints and export them from the package.

- [ ] Create `packages/services/src/api/logs.ts`
    - [ ] Define `LogQueryParams` type matching `logQuerySchema` from the backend DTO (`page`, `pageSize`, `startDate`, `endDate`, `action`, `resourceType`, `userId`, `branchId`)
    - [ ] Define `LogRecord` type matching `logRecordSchema` fields
    - [ ] Define `LogPage` type matching `logPageSchema` fields
    - [ ] Implement `buildLogsQueryString(params: LogQueryParams): string` — builds a `URLSearchParams` query string (skipping undefined/null/empty entries)
    - [ ] Implement `getAuthLogs(apiClient: ApiClientType, params?: LogQueryParams): Promise<LogPage>` — calls `GET /logs/auth`
    - [ ] Implement `getActivityLogs(apiClient: ApiClientType, params?: LogQueryParams): Promise<LogPage>` — calls `GET /logs/activity`
    - [ ] Implement `getSystemLogs(apiClient: ApiClientType, params?: LogQueryParams): Promise<LogPage>` — calls `GET /logs/system`
    - [ ] Add JSDoc to all exported types and functions
- [ ] Add `export * from './logs';` to `packages/services/src/api/index.ts`
- [ ] Write tests at `packages/services/src/api/logs.test.ts`
    - [ ] Test `buildLogsQueryString` with full params, partial params, and no params
    - [ ] Test each of the three fetch functions returns `data` from the mock API response

**Migration required:** No — data layer only

---

## Phase 2 — Query Keys & Hooks (`packages/shared` + `packages/hooks`)

**Goal:** Add TanStack Query keys constant and create three typed query hooks for consuming log endpoints.

### 2a — Shared Constants

- [ ] Create `packages/shared/src/constants/logs.ts`
    - [ ] Export `LOGS_QUERY_KEYS` constant following the same pattern as `ANALYTICS_QUERY_KEYS`:
        ```ts
        export const LOGS_QUERY_KEYS = {
            all: ['logs'] as const,
            auth: (params?: LogQueryParams) => [...LOGS_QUERY_KEYS.all, 'auth', params] as const,
            activity: (params?: LogQueryParams) =>
                [...LOGS_QUERY_KEYS.all, 'activity', params] as const,
            system: (params?: LogQueryParams) =>
                [...LOGS_QUERY_KEYS.all, 'system', params] as const,
        } as const;
        ```
- [ ] Add `export { LOGS_QUERY_KEYS } from './logs';` to `packages/shared/src/constants/index.ts`
- [ ] Write test at `packages/shared/src/constants/logs.test.ts`
    - [ ] Test that each key factory returns an array beginning with `'logs'`
    - [ ] Test that passing params includes them in the key

### 2b — React Query Hooks

- [ ] Create `packages/hooks/src/query/logs/use-auth-logs-query.ts`
    - [ ] Export `UseAuthLogsQueryArgs` type — `Omit<UseQueryOptions<LogPage, Error>, 'queryKey' | 'queryFn'> & { params?: LogQueryParams }`
    - [ ] Export `useAuthLogsQuery({ params, ...options }: UseAuthLogsQueryArgs = {})` using `LOGS_QUERY_KEYS.auth(params)` and `getAuthLogs`
    - [ ] Gate with `useAuthenticatedQueryEnabled`
    - [ ] Add JSDoc
- [ ] Create `packages/hooks/src/query/logs/use-activity-logs-query.ts`
    - [ ] Same shape as auth hook, backed by `getActivityLogs` and `LOGS_QUERY_KEYS.activity(params)`
- [ ] Create `packages/hooks/src/query/logs/use-system-logs-query.ts`
    - [ ] Same shape as auth hook, backed by `getSystemLogs` and `LOGS_QUERY_KEYS.system(params)`
- [ ] Create `packages/hooks/src/query/logs/index.ts`
    - [ ] Re-export all three hooks
- [ ] Add `export * from './logs';` to `packages/hooks/src/query/index.ts`
- [ ] Write tests at `packages/hooks/src/query/logs/use-auth-logs-query.test.ts`
    - [ ] Mock `@tanstack/react-query`, `@sentinel/services`, `../../api-provider`, `../_shared/use-authenticated-query-enabled`
    - [ ] Test correct query key is set when params are provided
    - [ ] Test `getAuthLogs` is called with the mock apiClient
    - [ ] Test `enabled` is `false` when `useAuthenticatedQueryEnabled` returns `false`
- [ ] Write tests at `packages/hooks/src/query/logs/use-activity-logs-query.test.ts` (same structure)
- [ ] Write tests at `packages/hooks/src/query/logs/use-system-logs-query.test.ts` (same structure)

**Migration required:** No

---

## Phase 3 — Frontend Page Integration (`app/sentinel-core`)

**Goal:** Replace mock data on the system logs page with live data from the three query hooks, using tabs to switch between Auth, Activity, and System log types.

- [ ] Update `app/sentinel-core/src/app/(protected)/logs/_components/columns.tsx`
    - [ ] Replace `AuditLog` type import with `LogRecord` from `@sentinel/services`
    - [ ] Update column accessor keys to match `LogRecord` fields: `createdAt` (was `timestamp`), combined actor cell from `userFirstName`/`userLastName`, `action`, `resourceType`, `resourceId`, `details`, `ipAddress`
    - [ ] Format `createdAt` using `DATETIME_FORMAT` from `@sentinel/shared/constants`

- [ ] Update `app/sentinel-core/src/app/(protected)/logs/_components/audit-log-table.tsx`
    - [ ] Change prop type from `AuditLog[]` to `LogRecord[]`
    - [ ] Add `isLoading?: boolean` prop and render skeleton/empty state when true
    - [ ] Update `searchKey` to `'action'`
    - [ ] Update facet action options to reflect real backend action values (e.g., `user.login`, `exam.start`, `exam.end`, `config.update`)

- [ ] Create `app/sentinel-core/src/app/(protected)/logs/_components/logs-tabs-view.tsx`
    - [ ] `'use client'` component with tabs: **Auth Logs**, **Activity Logs**, **System Logs**
    - [ ] `useState` for active tab and shared `LogQueryParams` (page, pageSize)
    - [ ] Call all three hooks; pass params only to the active tab's hook
    - [ ] Render `AuditLogTable` with `logs={activeData?.items ?? []}` and `isLoading` from the active hook
    - [ ] Render pagination controls using `data.page`, `data.totalPages`, `data.hasMore`

- [ ] Update `app/sentinel-core/src/app/(protected)/logs/_components/index.ts`
    - [ ] Export `LogsTabsView`

- [ ] Update `app/sentinel-core/src/app/(protected)/logs/page.tsx`
    - [ ] Remove `MOCK_AUDIT_LOGS` import
    - [ ] Replace `<AuditLogTable logs={MOCK_AUDIT_LOGS} />` with `<LogsTabsView />`

**Migration required:** No

---

## Verification Plan

### Automated Tests

```bash
pnpm --dir packages/services test
pnpm --dir packages/hooks test
pnpm --dir packages/shared test
pnpm --dir app/sentinel-core test
```

### Manual Verification

1. Start dev server: `pnpm dev`
2. Navigate to the `/logs` page in `sentinel-core`
3. Confirm three tabs render (Auth, Activity, System)
4. Check Network tab — requests to `/logs/auth`, `/logs/activity`, `/logs/system`
5. Confirm loading states appear while fetching
6. Confirm pagination controls navigate pages correctly
7. Confirm table columns map to `LogRecord` fields (timestamp, actor name, action, resource)

---

## Notes

- No new `.env` variables required — uses existing API client configuration
- No Prisma migration required — backend schema and endpoints are already complete
- Types (`LogRecord`, `LogPage`, `LogQueryParams`) live in `packages/services` — **do not duplicate** them in `packages/shared/types`
- Follow the hook pattern from `use-analytics-kpis-query.ts` exactly (same `useAuthenticatedQueryEnabled` guard, same `UseQueryOptions` omit pattern)
