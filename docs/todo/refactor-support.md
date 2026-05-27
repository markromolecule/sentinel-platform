# Goal

- Refactor the components of the pages on support

## Expectations

- You must break the code into modular pieces on the [_components]

1. Dialogs
2. Forms
3. Tables
4. Views

- Ensure that the codebase will be modular, scalable, readable, and maintainable.
- You should also ensure to create the [_hooks] folder and move the hooks inside there.

Here are the files:

- @app/sentinel-support/src/app/(protected)/(support)/courses/page.tsx
- @app/sentinel-support/src/app/(protected)/(support)/sections/page.tsx
- @app/sentinel-support/src/app/(protected)/(support)/subject-offerings/page.tsx - in addition you should update the file name from [subject-offerings] to [offered]
- @app/sentinel-support/src/app/(protected)/(support)/subjects/page.tsx - you should move the [subject-offerings] folder inside the [subjects] folder as page, similarly on the @app/sentinel-core/src/app/(protected)/subjects in which the @app/sentinel-core/src/app/(protected)/subjects/offered
