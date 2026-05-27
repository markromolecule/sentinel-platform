# Issue & Goal

- Instead of using bridge to access the support pages such as

1. Institution - remove this from the sentinel-core
2. Departments
3. Semesters

- We should just replicate the pages from sentinel-support to sentinel-core. This way, we can avoid the bridge between sentinel-web and sentinel-support.
- This also makes the tables accessible within the administrator / sentinel-core roles
- Ensure that to avoid duplicate for each role. We should just ensure that they share the same components and business logic

Currently the pages are located at /(admin)
@app/sentinel-core/src/app/(protected)/(admin)/departments
@app/sentinel-core/src/app/(protected)/(admin)/semesters

We should move them outside the (admin) and create the similar page from:
@app/sentinel-support/src/app/(protected)/(support)/departments
@app/sentinel-support/src/app/(protected)/(support)/semesters

to
@app/sentinel-core/src/app/(protected)/departments
@app/sentinel-core/src/app/(protected)/semesters

We can also move the
@app/sentinel-core/src/app/(protected)/(admin)/sections - in that way the superadmin will have access to it.

@app/sentinel-core/src/features/administration

Also, we can remove the @app/sentinel-core/src/features/administration/setup - since we will just have to replicate the actual pages from the sentinel-support instead
