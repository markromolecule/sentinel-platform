# Instructor page

- for examination page of the instructor:

1. we must have a page for preview that will simulate what will the student will see / experience:

@app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/preview/[sessionId]

- /instruction: this will handle the instruction page for the student
- /privacy: this will handle the privacy policy page for the student
- /checkup: this will handle the initial hardware check for [camera] & [microphone]
- /lobby: this will be the page where the student will wait for the instructor to start the exam, this will show how many students are currently joined on the exam
- /attempt: this will be the page where the student will take the exam

---

@app/sentinel-web/src/features/exams/\_components/engine - serves as shared components for instructor and student

- mainly we will building the preview page in order to build the architecture or the flow of the students examination page
- after we build the preview, we can now proceed on replicating it to student page (since we have a shared components) but we will now start the implementation of the [mediapipe] (for testing purposes we can create a [sandbox] for now before fully implementing the [gaze_tracking] on the acutal pages in that way we can calibrate it) for students in that way we can simulate / test the examination if its working and returning the logs that needed
- @app/sentinel-api/src/modules/infrastructure/mediapipe

- after we test and ensure that it now has a relationship between the instructor and student during examination, we can implement now the [configuration] & [settings] for e.g. [enabling the gaze tracking]
@packages/shared/src/schema/exams/configuration-schema.ts
@packages/shared/src/schema/exams/assessment-schema.ts
@app/sentinel-api/src/modules/examination/configuration 

- this will test if the [logs] that we need are now being pass to instructor and its now reflecting on each end and we can further more implement a feature on what will happen if the student is violating any exam condition [e.g. [gaze tracking]]

afterwards, we can now proceed on building the live monitoring components in which we will be using [livekit], since its more just the [live feed] of the student during the examination

@app/sentinel-web/src/app/(protected)/(instructor)/exams/[id]/monitoring/[studentId]
@app/sentinel-web/src/features/exams/monitoring/\_components/live-feed-monitor.tsx
@app/sentinel-api/src/modules/infrastructure/livekit

the [livekit] will be implemented here and specifically on the [live-feed-monitor.tsx] component

in addition we should keep in mind that we will be using a specific domain for it [live.sentinelph.tech] in production and we will be hosting the [livekit] on [aws ec2] using [docker]
