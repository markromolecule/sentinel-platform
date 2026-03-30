# Admin Invite Work Plan

## Objective
Implement a restricted admin dashboard for onboarding instructors. A Super Admin will invite new staff via email, which generates a secure Supabase link. Once the instructor claims the account and sets their password, they securely access the system with their assigned role.

## Options Considered (1-3-1 Rule)
The plan proposes **Option 1**: Hono API handles `inviteUserByEmail` and leverages existing `createUserData` for synchronous database inserts.

## To-Do List

### Phase 1: Backend Hono API
- [x] **DTO & Validation**: Add Zod schema validations for the new `POST /api/users/invite` payload (email, first name, last name, department, employee number).
- [x] **Service Layer**: Implement a new service method `inviteUser` that:
  1. Validates the requesting user has Super Admin or Admin role.
  2. Calls `supabase.auth.admin.inviteUserByEmail({ email, user_metadata: ... })`.
  3. Uses the returned `user.id` to call `createUserData` to populate `user_profiles`, `instructors`, and `user_roles` with an `instructor` role.
- [x] **Controller**: Map the `inviteUser` service to the `/invite` route.
- [x] **Data Layer**: Ensure transactions handle missing data gracefully or rollback if the invite fails.

### Phase 2: Supabase Configuration
- [ ] **Email Templates**: (Manual Step or Config Update) Configure the "Invite User" email template in the Supabase Dashboard to route to the Next.js update-password page (`{{ .ConfirmationURL }}`).
- [ ] **Site URL**: Ensure the `SITE_URL` and redirect URLs are correctly pointing to the secure `update-password` page.

### Phase 3: Frontend Admin Dashboard
- [x] **Invite UI Component**: Build a new form or modify the existing User Management dialog (`app/sentinel-core/src/app/(protected)/(admin)/users/_components/user-form-fields.tsx`) to support an "Invite Admin/Instructor" action instead of direct creation with password.
- [x] **React Query Mutation**: Implement the mutation calling `POST /api/users/invite` using standard `useMutation` hooks.
- [x] **Feedback**: Add success/error Toast notifications for when an invite is dispatched.

### Phase 4: Frontend Claim Account Flow
- [x] **Update Password Page**: Create or update the route that users land on from the email link (`/update-password`).
- [x] **Session Handling**: Ensure the page captures the `#access_token` hash fragment to establish the Supabase session before prompting for the new password.
- [x] **Auth API**: Wire up the form to call `supabase.auth.updateUser({ password: newPassword })`.
- [x] **Redirection**: On success, clear query params and redirect the authenticated instructor to their respective dashboard.

### Phase 5: Verification & Testing
- [ ] Test admin invite submission with valid and invalid data.
- [ ] Verify Supabase email delivery (using Inbucket/Logcap if local, or actual email if remote).
- [ ] Verify the temporary link correctly logs the user in and routes to password update.
- [ ] Verify that completing the password update allows access and instructor status is properly reflected.
