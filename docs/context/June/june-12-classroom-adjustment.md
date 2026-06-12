# Goal

1. Re-design the components that holds the classrom archive and active button
    - provide more visually clean and neat like an ios
    - make it more compact, since there are two tabs
    - ensure to use the reusable components @packages/ui
    
2. Implement a checkboxes on classroom page table
    - implement a bulk-delete for classrooms on the active tab and archived tab
    - ensure to prepare the backend for this bulk-delete such as 
        - controllers @app/sentinel-api/src/modules/core/classroom/controllers
        - services @app/sentinel-api/src/modules/core/classroom/services
    - ensure to create a query, api endpoints, mutation hooks preparations to frontend connection 
        - @packages/services/src/api
        - @packages/hooks/src/query/classrooms

* ensure to apply it on both sentinel-web and sentinel-core