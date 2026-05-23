# Goal

- To prepare the [messages] module on [sentinel-api]

1. Ensure to have a proper structure and similar syntax on other modules; this is to ensure uniform code structure across the backend
2. Prepare the dto and schema for the [messages]
3. Prepare the controller, service, and routes for the [messages] module. Ensure to use the following as a reference
    - @app/sentinel-api/src/modules/general/messages/messages.service.ts - this is the main entry of the services
    - @app/sentinel-api/src/modules/general/messages/services/ - this where you put the other services needed for the messages module
4. Prepare the [supabase] for the realtime chat
5. Prepare the websocket hook for the frontend in which you should put it on the shared packages
    - @packages/hooks/src - in this way we won't need to write it all over again on different app such as on the 1. @app/sentinel-core 2. @app/sentinel-support 3. @app/sentinel-web 4. @app/sentinel-mobile
      Since we will just be having a reusable hook for this.

6. Prepare the [mutation] and [queries]
    - @packages/services/src/api
    - @packages/hooks/src/query

# Focus

- Build the main backend module and the [supabase] realtime connection. In addition, preparing the mutation hooks and query that will be needed [for later] for the UI on other applications.
- Ensure to write the messages module structured as other module. Ensure to maximize the:
    - @app/sentinel-api/src/modules/general/messages/controllers
    - @app/sentinel-api/src/modules/general/messages/data
    - @app/sentinel-api/src/modules/general/messages/services
    - @app/sentinel-api/src/modules/general/messages/messages.dto.ts
    - @app/sentinel-api/src/modules/general/messages/messages.routes.ts
    - @app/sentinel-api/src/modules/general/messages/messages.service.ts
