# Notification System — Expansion

## Issue

- Several modules are missing notification triggers entirely.
- The Support app (`sentinel-support`) is missing the notification bell button in its header.

## Goal

Expand the notification system so that every CRUD action and transaction across all apps
dispatches a notification. This establishes a unified, end-to-end notification module that
reflects real-time changes across the institution hierarchy.

## Scope — app directories

All of the following paths must be audited and fully covered:

1. `@app/sentinel-core/src/app/(protected)/(admin)`
2. `@app/sentinel-core/src/app/(protected)/(superadmin)`
3. `@app/sentinel-support/src/app/(protected)/(support)`
4. `@app/sentinel-web/src/app/(protected)/(instructor)`
5. `@app/sentinel-web/src/app/(protected)/student`

## Notification routing rules

All notifications are scoped to the acting user's institution.

| Actor              | Notifies            | Triggers                                      |
| ------------------ | ------------------- | --------------------------------------------- |
| Support            | Admin, Superadmin   | CREATE, UPDATE, DELETE, TRANSACTION           |
| Admin / Superadmin | Support, Instructor | CREATE, UPDATE, DELETE, OVERRIDE, TRANSACTION |

> All notifications must carry the institution context so recipients can identify whether the
> action originated from a parent institution, a branch/local institution, or an admin override.

## Institution hierarchy context

Each notification payload must be tagged with one of the following origin levels:

1. **Parent institution** — system-wide or top-level changes
2. **Branch / local institution** — changes scoped to a specific branch
3. **Admin override** — when an administrator explicitly overrides existing data or performs
   a privileged CRUD action

## Acceptance criteria

- [ ] All five app directories have notification triggers on every CRUD action and transaction.
- [ ] The Support app header includes a notification bell, consistent with other apps.
- [ ] Notification routing matches the role-based rules above.
- [ ] Every notification payload includes: actor role, action type, institution level, and timestamp.
- [ ] A shared `[notification]` module is used across all apps — no duplicated notification logic.
