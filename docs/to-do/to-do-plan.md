# Users Module & Frontend Integration To-Do Plan

## 1-3-1 Rule Analysis: Database Schema & Data Mapping for Users
**The Problem**: The frontend UI depends on `MOCK_ADMIN_USERS` which expects a flattened object with fields like `id`, `firstName`, `lastName`, `email`, `role`, `department`, `status`, `lastActive`, and `studentNo`. However, in the Prisma database, this data is heavily normalized and spread across `users` (auth schema), `user_profiles`, `students`, `departments`, and `roles`. 

**Option 1: Complete Normalized Approach (Join Queries / Recommended)**
Instead of migrating the database, update the `sentinel-api` `users` service to perform a joined query using Prisma. It extracts `first_name`, `last_name`, and `status` from `user_profiles`, email from `users`, `student_number` from `students`, and `department_name` from `departments`, mapping them to the expected frontend shape.

**Option 2: Flattened User Profile Approach (Database Migration)**
Create a database migration to add `department_id` and `student_number` directly into the `user_profiles` table. This simplifies the API queries but duplicates data that belongs to the `students` entity.

**Option 3: JSONB Metadata Approach**
Store `department` and `studentNo` inside the `raw_user_meta_data` JSONB column of the `users` table. This is flexible but sacrifices referential integrity and makes querying/typing harder.

**Recommendation (The "1" decision)**
I recommend **Option 1 (Complete Normalized Approach)**. 
*Why?*: The database schema is already well-designed and normalized. Migrating to flatten the schema would violate normalization rules and duplicate data (e.g., `student_number` is already in the `students` table). By handling the mapping in the `users.service.ts` data access layer, we keep the database clean and fulfill the frontend's needs perfectly. No database migrations are required for this option.

---

## Comprehensive To-Do Plan

### Phase 1: API Module Standardization (sentinel-api)
- [ ] **1. Controllers Setup**: Replicate the structure from `departments` into `users` module.
  - Create `create-user.controller.ts`, `get-users.controller.ts`, `get-user.controller.ts`, `update-user.controller.ts`, and `delete-user.controller.ts`.
  - Ensure uniform syntax (Hono OpenAPI routes + handlers matching the other modules).
- [ ] **2. Data/Service Layer Setup**: Create data access functions in `users/data/` capable of performing the Prisma joins discussed in Option 1.
- [ ] **3. DTOs and Routes**: Update `user.dto.ts` and `user.routes.ts` to export standard OpenAPI routes and correct types.

### Phase 2: React Query Mutations (sentinel-core)
- [ ] **1. Define API Client Hooks**: Create the mutation hooks in `@app/sentinel-core/src/hooks/query/users`.
  - Implement `useCreateUser`, `useUpdateUser`, and `useDeleteUser` using `@tanstack/react-query` similar to `useCreateDepartment`.
  - Ensure they correctly invalidate the `users` query keys upon success.

### Phase 3: Frontend UI Update (sentinel-core)
- [ ] **1. Update the Users Page**: Modify `@app/sentinel-core/src/app/(protected)/admin/users/page.tsx` to fetch real data via `useGetUsers` hook.
- [ ] **2. Implement Fallback Logic**: Add logic where if the API fails or returns no data, it falls back to `MOCK_USERS` to prevent frontend disruption.
- [ ] **3. Table Adjustments**: Ensure `<UserManagementTable />` handles the optionally mapped fields properly.

### Phase 4: Testing (1-3-1 & Data Access Layer)
- [ ] **1. Database Access Testing**: Following `.agents/rules/api/testing-data-access-layer.md`, implement `testWithDbClient` tests for the users data layer.
- [ ] **2. API Access Testing**: Implement MSW setup and network isolation tests if dealing with external dependent interactions.
- [ ] **3. Verification**: Ensure `pnpm test` passes for the new `users` module tests.

> **Note**: As per the to-do workflow, I have NOT started coding yet. Please review this plan and explicitly tell me to proceed with Phase 1.
