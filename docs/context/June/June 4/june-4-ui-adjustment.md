# Goal - UI Adjustment

1. admin sidebar for [users] page
    - remove the sub-item on the sidebar
    - copy the layout of the [identity & access] page on the superadmin wherein it uses a shell @app/sentinel-core/src/app/(protected)/(superadmin)/\_components/layout/identity-workspace-shell.tsx. ensure to have a similar layout on the superadmin page for the identity & access page.
    - update the name for the users page into identity & access page or can you just implement the
      @app/sentinel-core/src/app/(protected)/(superadmin)/administrators

    as a reusable page wherein you will combine the one on the admin which handles the instructors, students, whitelist this is to ensure to eliminate redundancy and make our application more organized and maintainable. since it only showcase similar characteristics but they are in different scope and role in that way we can expand more the scope of the superadmin
    - ensure to apply cleanup and we can now remove the path @app/sentinel-core/src/app/(protected)/(admin)/users and we will just use the one on the superadmin in which we will put it outside the superadmin folder since we need it to be accessible by both superadmin and admin.
