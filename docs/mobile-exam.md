# Goal

- Ensure the [sentinel-mobile] exam has the similar flow to [sentinel-web]
  @app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt
  @app/sentinel-web/src/app/(protected)/student/exam/[id]/checkup
  @app/sentinel-web/src/app/(protected)/student/exam/[id]/instruction
  @app/sentinel-web/src/app/(protected)/student/exam/[id]/privacy
  @app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby
  @app/sentinel-web/src/app/(protected)/student/exam/[id]/result

- Apply it here
  @app/sentinel-mobile/app/(tabs)/exam/[id]

- It must follow the flow and the content of the [sentinel-web]
- Note:
  @app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt is similar to
  @app/sentinel-mobile/app/(tabs)/exam/[id]/session/[sessionId]/index.tsx

    I already want the design of the @app/sentinel-mobile/app/(tabs)/exam/[id]/session/[sessionId]/index.tsx but its up to you if we can improve to make it look like the @app/sentinel-web/src/app/(protected)/student/exam/[id]/attempt
