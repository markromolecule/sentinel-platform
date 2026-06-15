# Goal

1. The CRUD of [Department] on [Superadmin] should be automatically assigned the institution on what branch the user is

2. Add a [Room] page on [sentinel-core]; you will just have to replicate the page from support to core page.

- We also need to update the schema for the [Room] to identify whether the [Room] is already assigned or available. Ensure to update also on the backend on how to handle if the [Room] is already assigned or available. You can check the instructor exam creation page for this. Additionally we need a column for that on the [Room] table for [support, superadmin, admin] side

Reference:
@app/sentinel-support/src/app/(protected)/(support)/rooms/page.tsx

then you need to replicate it here:
@app/sentinel-core/src/app/(protected)

Ensure that it follow on what only permission does the role has. Also, ensure that you will just replicate the full-ui of the page.

3. Fix the [sidebar] for the sentinel-core, the sidebar overlaps outside on the left side making it not neat and clean

The sidebar from the sentinel-support should be the basis of the sentinel-core sidebar

Reference:
@app/sentinel-support/src/components/sidebar/support/support-sidebar.tsx
