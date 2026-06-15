# User Search Implementation To-Do List

## Phase 1: Backend Updates (app/sentinel-api)

- [x] **DTO**: Update `getUsersSchema.request` to include optional `search` query parameter.
- [x] **Controller**: Extract `search` in `getUsersRouteHandler` and pass it down.
- [x] **Service**: Add `search` parameter to `UserService.getUsers` and `UserCrudService.getUsers`.
- [x] **Data Layer**: Implement `ilike` filtering in `getUsersData` for `firstName`, `lastName`, and `email`.

## Phase 2: Frontend Implementation (app/sentinel-core)

- [x] **API Client**: Update `getUsers` in `data/api/users.ts` to support `search` query param.
- [x] **Query Hook**: Update `useUsersQuery` to include `search` in `queryKey` and API call.
- [x] **State Management**: Add `search` and `debouncedSearch` states in `UserManagementPage`.
- [x] **Debounce Integration**: Use `useDebounce` hook from `packages/hooks`.
- [x] **UI Component**: Add search input to `UserTableToolbar`.
- [x] **Loading/Empty States**: Ensure consistent loading spinner and empty state behavior.

## Phase 3: Verification

- [x] Verify backend filtering via direct API calls.
- [x] Verify frontend debounced search UI interaction.
- [x] Verify loading and empty state rendering.
