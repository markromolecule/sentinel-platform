# Superadmin Institutions Implementation To-Do Plan

Follow this plan for implementing the Superadmin Institutions page.

## Initial Setup & Planning
- [x] Research existing admin pages for UI uniformity.
- [x] Investigate database schema for `institutions` and `users`.
- [/] Create comprehensive to-do plan (this file).

## Data Preparation
- [ ] Define `MOCK_INSTITUTIONS` in `@sentinel/shared/mock-data`.
- [ ] Ensure superadmin user exists in the database.

## Frontend Implementation
- [ ] Create `app/(protected)/superadmin/institutions/page.tsx`.
- [ ] Implement `InstitutionTable` in `_components`.
- [ ] Implement `AddInstitutionDialog` in `_components`.
- [ ] Ensure uniform design with `PageHeader` and shared components.

## Backend/Database
- [ ] Add/Update Superadmin account in local database.
- [ ] Verify Superadmin access in `layout.tsx` (if needed).

## Verification
- [ ] Verify UI consistency.
- [ ] Validate mock data display.
- [ ] Test form interactions.
