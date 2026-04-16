# 1-3-1 Rule Analysis: Instructor Role & Table

## The Problem

1. **Access Denied**: The frontend login hook (`use-login-form`) strictly expects the string `'instructor'` in `user_metadata.role`. The user updated the role to `6` (numeric), triggering an "Access Denied" error.
2. **Missing Entity**: Unlike students, instructors do not have a dedicated table for metadata (e.g., employee numbers, departments), leading to an asymmetric data model.

---

## Options Analysis

### Option 1: Minimal Frontend Fix

Update the login logic to accept both string `'instructor'` and numeric `6`.

- **Pros**: Fastest fix, zero database risk.
- **Cons**: Doesn't address the user's explicit question about creating an `instructor` table.

### Option 2: Full Entity Realignment (Recommended)

Create an `instructors` table in the database and add corresponding types in `packages/shared`. Update the login logic to handle the role transition.

- **Pros**: Provides a scalable foundation for instructor data, maintains consistency with the `students` table, and directly answers the user's request.
- **Cons**: Requires a Prisma migration.

### Option 3: Role Mapping via DB Trigger

Create a database trigger to sync the numeric `role_id` from `user_roles` to the `user_metadata` as a string.

- **Pros**: Centralizes role logic in the DB.
- **Cons**: Overly complex for the current requirement and doesn't solve the "instructor table" question.

---

## Recommendation

**Option 2: Full Entity Realignment**.
It aligns with the existing architecture and satisfies the user's proactive request for an `instructor` table.

---

## To-Do List

### Phase 1: Database & Shared Layer

- [x] Add `instructors` model to `packages/db/prisma/schema.prisma`.
- [x] Update `users` model in Prisma to include a relation to `instructors`.
- [x] Run `npx prisma migrate dev --name add_instructors_table`.
- [x] Add `Instructor` interface to `packages/shared/src/types/index.ts`.

### Phase 2: Auth Logic

- [x] Update `use-login-form/index.ts` to handle role transition (Confirmed: Metadata Updated).
- [x] Update `auth/callback/route.ts` (Confirmed: Metadata Updated).

### Phase 3: Verification

- [/] Verify login for `proctor@sentinel.com`.
- [/] Check if redirect to `/dashboard` works correctly.
