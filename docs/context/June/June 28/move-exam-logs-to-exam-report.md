# Goal

- To move the [exam/logs] to [exam/reports]
    - We can remove now the page of the logs including the cards, etc.
    - We can just use the exam reports card then create a [logs] on the sidebar layout that will showcase the logs table etc which is the content of the logs. We just need the content of the [logs] which is the one that showcase the table of the incident logs @app/sentinel-web/src/app/(protected)/(instructor)/exams/logs/page.tsx not the page, we need the one that when we click the cards [review logs] the content that will be show is the one that we need
    - Apply cleanup to reduce redundancy and improve maintainability
