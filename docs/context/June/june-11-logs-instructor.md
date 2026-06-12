# LLM Context: Incident Logs & Analytics — Sentinel Exam Platform

> **Usage**: Provide this file as context to any LLM assistant working on this feature. It is the single source of truth for types, file paths, API contracts, and conventions.

---

## 1. Project Snapshot

**Product**: Sentinel — an AI-proctored exam platform for educational institutions.
**Feature**: Dedicated `Incident Logs & Analytics` page inside the per-exam instructor workspace.
**Goal**: Give instructors a high-efficiency interface to search, filter, audit, and bulk-review telemetry violations captured during a student exam.

---

## 2. Tech Stack

| Layer        | Technology                                                         |
| ------------ | ------------------------------------------------------------------ |
| Framework    | Next.js 14 (App Router, TypeScript)                                |
| Styling      | Tailwind CSS v3                                                    |
| UI Library   | `@sentinel/ui` → maps to `packages/ui/src/components`              |
| Server State | TanStack Query v5 (`@tanstack/react-query`)                        |
| ORM          | Prisma 5 (`packages/db/prisma/schema.prisma`)                      |
| API Layer    | Next.js Route Handlers under `app/sentinel-api/`                   |
| Services     | `@sentinel/services` → `packages/services/src/`                    |
| Hooks        | `@sentinel/hooks` → `packages/hooks/src/`                          |
| Auth         | Session-based; active instructor accessed via `getServerSession()` |

---

## 3. Monorepo Structure (Relevant Paths Only)

```
apps/web/
  app/
    (protected)/
      (instructor)/
        exams/
          [id]/
            layout.tsx               ← NEW: exam-level sidebar layout
            lobby/page.tsx           (existing)
            monitoring/page.tsx      (existing)
            logs/
              page.tsx               ← NEW: Incident Logs page (Server Component)
              _components/
                IncidentFilters.tsx  ← NEW: filter bar (client)
                IncidentTable.tsx    ← NEW: virtualized table (client)
                IncidentDrawer.tsx   ← NEW: detail + review panel (client)
                BulkActions.tsx      ← NEW: bulk confirm/dismiss toolbar (client)
            builder/page.tsx         (existing)
            report/page.tsx          (existing)

  app/sentinel-api/
    exams/
      [id]/
        incidents/
          route.ts                   ← NEW: GET (list) handler
          review/
            route.ts                 ← NEW: PATCH (bulk review) handler

packages/
  db/prisma/schema.prisma            (existing — see Section 5)
  services/src/
    incidents.service.ts             ← NEW
  hooks/src/
    useExamIncidents.ts              ← NEW
    useUpdateIncidents.ts            ← NEW
  ui/src/components/                 (existing — see Section 7)
```

---

## 4. TypeScript Types

Define these in `packages/services/src/types/incidents.types.ts` and import across services, hooks, and components.

```ts
// ─── Enums (mirror Prisma schema) ──────────────────────────────────────────

export type IncidentType =
    | 'TAB_SWITCH'
    | 'FULL_SCREEN_EXIT'
    | 'NO_FACE_DETECTED'
    | 'GAZE_OFF_SCREEN'
    | 'AUDIO_ANOMALY'
    | 'CLIPBOARD_ATTEMPT'
    | 'MULTIPLE_FACES'
    | 'PHONE_DETECTED';

export type IncidentSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentStatus = 'PENDING' | 'CONFIRMED' | 'DISMISSED';

// ─── Core Domain Model ─────────────────────────────────────────────────────

export interface Incident {
    incidentId: string; // UUID
    attemptId: string; // FK → exam_attempts
    incidentType: IncidentType;
    severity: IncidentSeverity;
    details: string;
    timestamp: string; // ISO 8601
    evidenceUrl: string | null;
    status: IncidentStatus;
    reviewedBy: string | null; // instructor UUID
    reviewedAt: string | null; // ISO 8601
    reviewNotes: string | null;
    // Joined from exam_attempts + users
    student: {
        userId: string;
        firstName: string;
        lastName: string;
        studentNo: string;
        sectionId: string;
        sectionName: string;
    };
    // Derived: seconds elapsed since exam start
    elapsedSeconds: number;
}

// ─── API Query Params ──────────────────────────────────────────────────────

export interface GetIncidentsParams {
    examId: string;
    sectionId?: string;
    studentId?: string; // matches against userId OR studentNo
    severity?: IncidentSeverity;
    type?: IncidentType;
    status?: IncidentStatus;
    page?: number; // 1-indexed, default 1
    limit?: number; // default 30, max 100
}

export interface GetIncidentsResponse {
    data: Incident[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// ─── Mutation Payload ──────────────────────────────────────────────────────

export interface ReviewIncidentsPayload {
    incidentIds: string[]; // one or many UUIDs
    status: 'CONFIRMED' | 'DISMISSED';
    reviewNotes?: string; // optional, applied to all selected
}

export interface ReviewIncidentsResponse {
    updatedCount: number;
    updatedAt: string; // ISO 8601
}

// ─── UI State ──────────────────────────────────────────────────────────────

export interface IncidentFiltersState {
    search: string;
    sectionId: string | null;
    severity: IncidentSeverity | null;
    type: IncidentType | null;
    status: IncidentStatus | null;
}
```

---

## 5. Database Schema (Relevant Tables)

Excerpt from `packages/db/prisma/schema.prisma`. **Do not modify this schema** — query and mutate only via Prisma Client.

```prisma
model flagged_incidents {
  incident_id   String            @id @default(uuid())
  attempt_id    String
  incident_type incident_type     // enum — see below
  severity      incident_severity // enum — see below
  details       String
  timestamp     DateTime
  evidence_url  String?
  status        String            @default("PENDING")  // "PENDING" | "CONFIRMED" | "DISMISSED"
  reviewed_by   String?           // UUID of instructor
  reviewed_at   DateTime?
  review_notes  String?

  exam_attempt  exam_attempts @relation(fields: [attempt_id], references: [attempt_id])

  @@map("flagged_incidents")
}

model exam_attempts {
  attempt_id  String   @id @default(uuid())
  exam_id     String
  student_id  String
  started_at  DateTime
  // ...other fields

  exam              exams               @relation(fields: [exam_id], references: [exam_id])
  student           users               @relation(fields: [student_id], references: [user_id])
  flagged_incidents flagged_incidents[]

  @@map("exam_attempts")
}

enum incident_type {
  TAB_SWITCH
  FULL_SCREEN_EXIT
  NO_FACE_DETECTED
  GAZE_OFF_SCREEN
  AUDIO_ANOMALY
  CLIPBOARD_ATTEMPT
  MULTIPLE_FACES
  PHONE_DETECTED
}

enum incident_severity {
  HIGH
  MEDIUM
  LOW
}
```

**Key join chain for the GET query**:
`flagged_incidents → exam_attempts → users` (for student name/number)
`exam_attempts → sections_enrollment` (for sectionId/sectionName)

---

## 6. API Contracts

### `GET /sentinel-api/exams/[id]/incidents`

**File**: `app/sentinel-api/exams/[id]/incidents/route.ts`

```
Query params (all optional):
  sectionId  : string
  studentId  : string   (searches userId OR studentNo)
  severity   : HIGH | MEDIUM | LOW
  type       : IncidentType
  status     : PENDING | CONFIRMED | DISMISSED
  page       : number   (default 1)
  limit      : number   (default 30, max 100)

Success → 200 GetIncidentsResponse
Auth error → 401
Not found / not owner → 403
```

**Prisma query pattern**:

```ts
const incidents = await prisma.flagged_incidents.findMany({
    where: {
        exam_attempt: {
            exam_id: examId,
            ...(sectionId && { section_id: sectionId }),
            ...(studentId && {
                student: {
                    OR: [
                        { user_id: studentId },
                        { student_no: { contains: studentId, mode: 'insensitive' } },
                        { first_name: { contains: studentId, mode: 'insensitive' } },
                        { last_name: { contains: studentId, mode: 'insensitive' } },
                    ],
                },
            }),
        },
        ...(severity && { severity }),
        ...(type && { incident_type: type }),
        ...(status && { status }),
    },
    include: {
        exam_attempt: {
            include: {
                student: {
                    select: { user_id: true, first_name: true, last_name: true, student_no: true },
                },
            },
        },
    },
    orderBy: { timestamp: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
});
```

---

### `PATCH /sentinel-api/exams/[id]/incidents/review`

**File**: `app/sentinel-api/exams/[id]/incidents/review/route.ts`

```
Body: ReviewIncidentsPayload
  incidentIds : string[]
  status      : "CONFIRMED" | "DISMISSED"
  reviewNotes?: string

Success → 200 ReviewIncidentsResponse
Validation error → 400
Auth error → 401
```

**Prisma mutation pattern**:

```ts
const result = await prisma.flagged_incidents.updateMany({
    where: { incident_id: { in: incidentIds } },
    data: {
        status,
        review_notes: reviewNotes ?? null,
        reviewed_by: session.user.id,
        reviewed_at: new Date(),
    },
});
```

---

## 7. UI Components (`@sentinel/ui`)

Import path: `@sentinel/ui` (alias for `packages/ui/src/components`).

Use **only** these components. Do not install or import from `shadcn/ui` directly.

```ts
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@sentinel/ui/table';
import { Badge } from '@sentinel/ui/badge';
import { Button } from '@sentinel/ui/button';
import { ScrollArea } from '@sentinel/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@sentinel/ui/dialog';
import { Input } from '@sentinel/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@sentinel/ui/select';
import { Checkbox } from '@sentinel/ui/checkbox';
import { Textarea } from '@sentinel/ui/textarea';
import { Separator } from '@sentinel/ui/separator';
import { Skeleton } from '@sentinel/ui/skeleton';
import { Tooltip, TooltipTrigger, TooltipContent } from '@sentinel/ui/tooltip';
```

---

## 8. Severity Visual Rules

Apply these consistently across all components — badge, row highlight, drawer border.

```ts
export const SEVERITY_CONFIG = {
    HIGH: {
        badge: 'bg-destructive/10 text-destructive border border-destructive/30',
        row: 'border-l-2 border-l-destructive',
        icon: 'text-destructive',
        label: 'High',
    },
    MEDIUM: {
        badge: 'bg-amber-500/10 text-amber-700 border border-amber-500/30 dark:text-amber-400',
        row: 'border-l-2 border-l-amber-500',
        icon: 'text-amber-500',
        label: 'Medium',
    },
    LOW: {
        badge: 'bg-blue-500/10 text-blue-700 border border-blue-500/30 dark:text-blue-400',
        row: 'border-l-2 border-l-blue-400',
        icon: 'text-blue-500',
        label: 'Low',
    },
} satisfies Record<IncidentSeverity, { badge: string; row: string; icon: string; label: string }>;
```

---

## 9. TanStack Query Hooks

### `useExamIncidentsQuery`

**File**: `packages/hooks/src/useExamIncidents.ts`

```ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { getExamIncidents } from '@sentinel/services/incidents.service';
import type { GetIncidentsParams } from '@sentinel/services/types/incidents.types';

export const INCIDENTS_QUERY_KEY = (
    examId: string,
    filters: Omit<GetIncidentsParams, 'examId' | 'page'>,
) => ['incidents', examId, filters] as const;

export function useExamIncidentsQuery(params: GetIncidentsParams) {
    return useInfiniteQuery({
        queryKey: INCIDENTS_QUERY_KEY(params.examId, params),
        queryFn: ({ pageParam = 1 }) => getExamIncidents({ ...params, page: pageParam }),
        getNextPageParam: (last) =>
            last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
        staleTime: 30_000,
    });
}
```

### `useUpdateIncidentsMutation`

**File**: `packages/hooks/src/useUpdateIncidents.ts`

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewIncidents } from '@sentinel/services/incidents.service';
import { INCIDENTS_QUERY_KEY } from './useExamIncidents';

export function useUpdateIncidentsMutation(examId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: reviewIncidents,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['incidents', examId] });
        },
    });
}
```

---

## 10. Sidebar Navigation (Exam Layout)

**File**: `app/(protected)/(instructor)/exams/[id]/layout.tsx`

The sidebar renders these links in order. The active route should use `usePathname()` to apply active styling.

```ts
export const EXAM_NAV_ITEMS = [
    { label: 'Lobby', href: (id: string) => `/exams/${id}/lobby`, icon: 'UsersRound' },
    { label: 'Live Monitor', href: (id: string) => `/exams/${id}/monitoring`, icon: 'MonitorPlay' },
    { label: 'Incident Logs', href: (id: string) => `/exams/${id}/logs`, icon: 'ShieldAlert' },
    { label: 'Exam Builder', href: (id: string) => `/exams/${id}/builder`, icon: 'PenLine' },
    { label: 'Report', href: (id: string) => `/exams/${id}/report`, icon: 'BarChart2' },
] as const;
```

Icons are from `lucide-react`.

---

## 11. Component Responsibilities

| Component             | Type             | Responsibility                                                               |
| --------------------- | ---------------- | ---------------------------------------------------------------------------- |
| `logs/page.tsx`       | Server Component | Fetch exam metadata + initial incidents page; pass to client shell           |
| `IncidentFilters.tsx` | Client           | Controlled filter bar; emits `onFiltersChange(IncidentFiltersState)`         |
| `IncidentTable.tsx`   | Client           | Virtualized/infinite-scroll table; row selection; opens drawer               |
| `IncidentDrawer.tsx`  | Client           | Slide-over detail panel; single-incident review (confirm/dismiss + notes)    |
| `BulkActions.tsx`     | Client           | Floating toolbar visible when `selectedIds.length > 0`; bulk confirm/dismiss |

---

## 12. Implementation Checklist

Each task below is independently completable. Complete them in order to avoid dependency issues.

- [ ] **T1** — Create `packages/services/src/types/incidents.types.ts` with all types from Section 4.
- [ ] **T2** — Create `packages/services/src/incidents.service.ts` with `getExamIncidents()` and `reviewIncidents()` functions (HTTP calls to the API routes).
- [ ] **T3** — Create `packages/hooks/src/useExamIncidents.ts` (infinite query hook).
- [ ] **T4** — Create `packages/hooks/src/useUpdateIncidents.ts` (mutation hook).
- [ ] **T5** — Create `GET` route handler `app/sentinel-api/exams/[id]/incidents/route.ts` using the Prisma query pattern in Section 6.
- [ ] **T6** — Create `PATCH` route handler `app/sentinel-api/exams/[id]/incidents/review/route.ts` using the Prisma mutation pattern in Section 6.
- [ ] **T7** — Create `app/(protected)/(instructor)/exams/[id]/layout.tsx` with exam sidebar using `EXAM_NAV_ITEMS`.
- [ ] **T8** — Create `IncidentFilters.tsx` with search input + four Select dropdowns (section, severity, type, status).
- [ ] **T9** — Create `IncidentTable.tsx` with infinite scroll, row checkboxes, and severity-coded left border.
- [ ] **T10** — Create `IncidentDrawer.tsx` with evidence snapshot, metadata fields, status radio group, notes textarea, and submit button.
- [ ] **T11** — Create `BulkActions.tsx` as a fixed bottom bar with selected count and Confirm / Dismiss buttons.
- [ ] **T12** — Create `logs/page.tsx` as a Server Component that composes all client components with Suspense boundaries.

---

## 13. Constraints & Non-Negotiables

- **No direct `fetch()` calls in components** — always go through service functions from `@sentinel/services`.
- **No raw Prisma in route handlers** — import from `@sentinel/db` (`packages/db/src/index.ts` re-exports the Prisma Client).
- **Auth guard in every route handler** — call `getServerSession()` and return `401` if no session, `403` if instructor does not own the exam.
- **Pagination is server-side only** — never load all incidents into client memory. The `useExamIncidentsQuery` hook handles cursor/page management.
- **`evidence_url` is pre-signed S3** — render as `<img>` or link directly; do not proxy.
- **`status` in `flagged_incidents` is a plain `String` in Prisma** (not an enum at the DB level) — cast to `IncidentStatus` at the service layer after fetching.
- **Bulk review applies `reviewNotes` to every selected incident** — if the instructor leaves it blank, send `null`, not an empty string.
- **All timestamps stored in UTC** — display in the instructor's local timezone using `Intl.DateTimeFormat` at the component level.

---

## 14. Success Criteria (Acceptance Tests)

1. Navigating to `/exams/:id/logs` shows the sidebar with "Incident Logs" highlighted.
2. With 500+ seeded incidents, infinite scroll loads pages of 30 without UI lag.
3. Filtering by section + searching a student name returns only that student's incidents within 1 network round trip.
4. Confirming a single incident updates `status`, `reviewed_by`, `reviewed_at` in the database with the active instructor's ID and UTC timestamp.
5. Bulk-dismissing 20 selected incidents completes in a single PATCH request and refreshes the table automatically.
6. Dismissing an incident with a review note correctly persists `review_notes` in the database.
7. `HIGH` severity incidents render with a destructive red left border and badge; `MEDIUM` amber; `LOW` blue — in both light and dark mode.
