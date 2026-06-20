# Goal

- To implement a end-to-end [pagination] for the [sentinel-api]
    - Ensure to update all GET controllers / data / services to handle [pagination]
    - Ensure to update the mutation hooks, api
        @packages/services/src/api
        @packages/hooks/src/query
    - Ensure to refactor the frontend pagination to use the new [pagination] backend
    - This should be end-to-end by throughly checking the @app/sentinel-api/src/modules for all the possible and a must have GET controllers / data / services