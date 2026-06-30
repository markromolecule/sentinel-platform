# Goal

- To create a feedback module from backend to frontend
    - Ensure to create also the mutation and api call for the frontend
        1. @packages/services/src/api
        2. @packages/hooks/src/query
    - Ensure to have a proper structure to the backend similar to other modules
        1. @app/sentinel-api/src/modules/general/feedbacks/controller
        2. @app/sentinel-api/src/modules/general/feedbacks/data
        3. @app/sentinel-api/src/modules/general/feedbacks/services - you will put here the modular services for e.g:
            - create-feedback.service.ts
            - get-feedback.service.ts
            - get-feedbacks.service.ts
        4. @app/sentinel-api/src/modules/general/feedbacks/feedback.dto.ts - you will put here the dto but ensure to create a schema on
            - @packages/shared/src/schema
        5. @app/sentinel-api/src/modules/general/feedbacks/feedback.routes.ts
        6. @app/sentinel-api/src/modules/general/feedbacks/feedback.service.ts - main entry points of the services on the abovementioned folder for the service

- Prepare the frontend for the
    - sentinel-web: student
    * After the score page on after the exam of the students the feedback form will show the feedback page that will ask for the
        - Rating - required
        - Experience - optional

        For e.g: Rate your experience
        Then, after the feeedback from the thank you page will show
    - sentinel-support
    * create a page that will receive the [feedbacks] of the students after the examination
        - ensure to add the new page on the sidebar
        - ensure to provide a better ux on displaying the feedbacks
        - ensure to add a pagination and its connected to the backend
