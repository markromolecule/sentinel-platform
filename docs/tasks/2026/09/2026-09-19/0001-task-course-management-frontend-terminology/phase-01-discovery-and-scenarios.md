---
title: "Phase 1 — Discovery, Scenarios, and Boundary Analysis"
type: phase
parent: "0001-task-course-management-frontend-terminology"
phase: "01"
status: completed
created: "2026-09-19"
tags: [task, phase, discovery]
---

# Phase 1 — Discovery, Scenarios, and Boundary Analysis

## Objective

Establish the baseline inventory of all frontend copy, components, dialogs, and tests across `sentinel-web`, `sentinel-core`, and `sentinel-support` that mention "Subject" within the Subject Management domain, and formalize the exact target strings.

## Dependencies & Prerequisites

- Completed and audited context specification: [course-management-frontend-terminology.md](file:///Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/context/September/18/course-management-frontend-terminology.md).

## Impacted Files & Components

- Context Spec: `docs/context/September/18/course-management-frontend-terminology.md`
- Master Task Plan: `docs/tasks/2026/09/2026-09-19/0001-task-course-management-frontend-terminology/README.md`

## Implementation Tasks

- [x] Task 1.1 — Validate that the `/courses` route in `sentinel-core` and `sentinel-support` remains isolated and dedicated to Degree Programs (labeled "Programs").
- [x] Task 1.2 — Map every user-facing string in `sentinel-web` under `src/app/(protected)/(instructor)/subjects/` and `src/components/sidebar/instructor/`.
- [x] Task 1.3 — Map every user-facing string in `sentinel-core` under `src/app/(protected)/subjects/` and `src/components/sidebar/common/core-admin-nav-config.ts`.
- [x] Task 1.4 — Map every user-facing string in `sentinel-support` under `src/app/(protected)/(support)/subjects/` and `src/components/sidebar/support/constants/index.ts`.
- [x] Task 1.5 — Identify all unit tests that assert on old strings (`Subject List`, `Offered Subjects`, `Subject Management`, etc.).

## Verification & Testing

- Verified that `/courses` routes in `sentinel-core` and `sentinel-support` are dedicated to Degree Programs ("Programs") and will remain untouched.
- Completed comprehensive string mapping across `sentinel-web`, `sentinel-core`, and `sentinel-support`.
- Identified and ran baseline unit tests:
  - `pnpm --filter sentinel-web test src/app/\(protected\)/\(instructor\)/subjects/_components/layout/subject-nav.test.tsx` (PASS: 3/3 passed)
  - `pnpm --filter sentinel-core test src/app/\(protected\)/subjects/_components/layout/subject-nav.test.tsx` (PASS: 5/5 passed)
  - `pnpm --filter sentinel-support test src/app/\(protected\)/\(support\)/subjects/_components/layout/subject-nav.test.tsx` (PASS: 5/5 passed)
- Also verified critical sidebar active check logic in `sentinel-web/src/components/sidebar/instructor/instructor-sidebar.tsx` line 72 (`item.title === 'Subjects'`).

## Risks & Rollback

- Risk: Accidental modification of `/courses` Degree Programs components.
- Mitigation: Keep all edits strictly inside `subjects` folders and specific sidebar constant files.
