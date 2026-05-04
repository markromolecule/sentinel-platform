# Goal

1. To fix the dialogs on the [sentinel-support]

- @app/sentinel-support/src/app/(protected)/(support)/courses; it should be similar to the dialog of @app/sentinel-core/src/app/(protected)/(superadmin)/courses. It also has an error when creating a courses:
  sentinel-api:dev: prisma:error
  sentinel-api:dev: Invalid `prisma.$queryRawUnsafe()` invocation:
  sentinel-api:dev:
  sentinel-api:dev:
  sentinel-api:dev: Raw query failed. Code: `22P02`. Message: `invalid input syntax for type uuid: ""`
  sentinel-api:dev: Create course error: PrismaClientKnownRequestError:
  sentinel-api:dev: Invalid `prisma.$queryRawUnsafe()` invocation:
  sentinel-api:dev:
  sentinel-api:dev:
  sentinel-api:dev: Raw query failed. Code: `22P02`. Message: `invalid input syntax for type uuid: ""`

- Manage section dialog @app/sentinel-support/src/app/(protected)/(support)/courses/\_components/dialogs/course-sections-dialog.tsx ; fix the ui - also,implement a way where the user can add a rows of section
