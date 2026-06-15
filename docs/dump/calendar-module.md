# Goal

- Create the [Calendar] module for backend [sentinel-api] and connect it to the frontend [sentinel-web], [sentinel-support] and [sentinel-core].

1. Ensure to have similar structure for the calendar module.
2. Ensure to have same structure and how I write the backend for services, controllers, dto's from other; this is to have a uniform and constant code structure and style.

Reference:
@app/sentinel-api/src/modules/general/calendar/calendar.dto.ts
@app/sentinel-api/src/modules/general/calendar/calendar.routes.ts

Ensure to break the @app/sentinel-api/src/modules/general/calendar/calendar.service.ts here @app/sentinel-api/src/modules/general/calendar/services in that way the @app/sentinel-api/src/modules/general/calendar/calendar.service.ts only contain the logic and not the business logic and data access layer.

- Ensure to update the permission for each role.
- Ensure to check if I need to update my prisma model or prisma schema.
- Ensure to run prisma migrate dev --name <name> --preview-feature to create a new migration.
- Ensure to run pnpm db:generate to generate the new prisma client.

3. Update the frontend for the calendar module. Ensure that it is:

- Responsive
- Good UI / UX
- Consistent margin and padding similar to other pages
- Uses the same theme and design system as the rest of the application
- Uses the same services and dto's as the backend
