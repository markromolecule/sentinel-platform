# Goal

- To prepare now the analytics module

- Ensure the following
  @app/sentinel-api/src/modules/general/analytics
  @app/sentinel-api/src/modules/general/analytics/controllers
  @app/sentinel-api/src/modules/general/analytics/services
  @app/sentinel-api/src/modules/general/analytics/data
  @app/sentinel-api/src/modules/general/analytics/analytics.dto.ts
  @app/sentinel-api/src/modules/general/analytics/analytics.routes.ts
  @app/sentinel-api/src/modules/general/analytics/analytics.service.ts

Context:

- Services folder serves as a modular services extracted to the @@app/sentinel-api/src/modules/general/analytics/analytics.service.ts, in that way the @@app/sentinel-api/src/modules/general/analytics/analytics.service.ts is not crowded and serves as the main service of the module
- Ensure to follow the structure and syntax of the module to other modules, this is to ensure the uniform coding structure and how I write the codes.

- Prepare the mutation and the query for analytics module
  @packages/hooks/src/query/analytics
  @packages/services/src/api/analytics.ts

Note: - This is for using for later to connect to front. But right now, we need to build the backend module for the analytics page.
