# Goal 

- To refactor this [services] to make the code more easier to maintain, scale, read, implement, debug

    1. @app/sentinel-api/src/modules/core/subjects/subject.service.ts - main entry point
        - @app/sentinel-api/src/modules/core/subjects/services - this will be the folder that will handle the extracted services
    2. @app/sentinel-api/src/modules/core/subject-offerings/subject-offerings.service.ts - main entry point
        - @app/sentinel-api/src/modules/core/subject-offerings/services - this will be the folder that will handle the extracted services
    3. @app/sentinel-api/src/modules/core/subject-classification/subject-classification.service.ts - main entry point
        - @app/sentinel-api/src/modules/core/subject-classification/services - this will be the folder that will handle the extracted services