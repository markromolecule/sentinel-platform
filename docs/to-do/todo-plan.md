# To-Do Plan: Authorization & Department Fix

## 1. Research & Analysis
- [ ] List all CRUD routes for `Institutions`, `Departments`, and `Semesters`.
- [ ] Verify the `support` role key in the database and metadata.
- [ ] Test the department creation through `curl` to verify if 201 is truly returned during a 23505 failure.

## 2. Authorization Refactor (Role Enforcement)
- [ ] Create/Update `roleAuthMiddleware` or similar logic in controllers.
- [ ] Restrict `POST/PUT/DELETE` on `Institutions` to `support` only.
- [ ] Restrict `POST/PUT/DELETE` on `Departments` to `support` only.
- [ ] Restrict `POST/PUT/DELETE` on `Semesters` to `support` only.

## 3. Bug Fixes (Insertion & Errors)
- [ ] Update `DepartmentService.createDepartment` catch block to handle `P2010` (unique constraint via Kysely).
- [ ] Ensure `targetInstitutionId` is correctly used in `createDepartmentData`.
- [ ] Investigate why `GET /departments` might not be showing newly created records.

## 4. Cross-Module Consistency
- [ ] Apply the same `P2010` error handling and role enforcement to `Institutions` module.
- [ ] Apply the same to `Semesters` module.

## 5. Verification
- [ ] Run automated tests or manual `curl` commands to verify role blocks.
- [ ] Verify department creation and immediate listing.
