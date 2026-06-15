# Shared Subjects + Scoped Access Implementation

## Completed

- [x] Moved the `Subjects` pages to shared protected routes:
    - `/subjects`
    - `/subjects/offered`
    - `/subjects/requests`
- [x] Updated the superadmin sidebar to include the shared `Subjects` entry.
- [x] Restricted subject catalog mutations to `superadmin` only.
- [x] Added reusable API-side academic scope helpers for institution, department, and course enforcement.
- [x] Applied scope-aware filtering and mutation checks to:
    - courses
    - sections
    - subject offerings
    - subject catalog
    - user-management reads and scoped create/invite/update/delete flows
- [x] Locked admin/superadmin UI selectors so forms reflect the same assigned scope enforced by the API.
- [x] Made the shared subject catalog UI role-aware:
    - superadmin can add, bulk upload, edit, and delete
    - admin can browse and offer only

## Verification

- [x] `pnpm exec tsc -p app/sentinel-api/tsconfig.json --noEmit`
- [x] `pnpm --dir app/sentinel-core exec next typegen`
- [x] `pnpm --dir app/sentinel-core exec next build`

## Notes

- The plain `tsc` check for `sentinel-core` still reads stale `.next/dev/types` route validator files after the route move, but the regenerated Next route types and a successful production build confirm the shared subject routes are valid.
