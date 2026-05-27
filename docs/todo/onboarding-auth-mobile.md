# Goal

- Ensure that the authentication is working on mobile

1. Login
2. Register
3. Onboarding

- Currently the [oauth] for [login] is now working. Now, I want you to implement the same on the [register] and ensure it redirects to the onboarding
  @app/sentinel-mobile/app/(onboarding)
- Ensure that the [@app/sentinel-mobile/app/(onboarding)/setup.tsx] fetches the real data from the database.
  @packages/hooks/src/query/onboarding/use-onboarding-mutation.ts
  @packages/hooks/src/query/onboarding/use-onboarding-institutions-query.ts
  @packages/hooks/src/query/onboarding/use-onboarding-departments-query.ts
  @packages/hooks/src/query/onboarding/use-onboarding-courses-query.ts
- Ensure that the [onboarding] in [sentinel-mobile] also validates the [student_id]
  @app/sentinel-web/src/app/(protected)/onboarding/\_components/onboarding-form.tsx

    Since, it should check if the student is on the whitelist before approving the [register] and [onboarding] of the student. It should match the [whitelist] accounts, in which is currently implemented on the [sentinel-web]. I want the [sentinel-mobile] also do this.

- [ ] test the [register] and [onboarding] with [whitelist] on [mobile]

- Ensure that the exam flow is working and connected to the database. Ensure that the same behavior used on the:
  @app/sentinel-web/src/app/(protected)/student/exam/[id]
  @app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby - here we want it fetch the exam rules & configuration set on the exam for e.g if the instructor enable the admit on the exam the student can't enter the examination without the admit of the instructor
    - @app/sentinel-web/src/app/(protected)/student/exam/[id]/lobby/\_hooks
    - @app/sentinel-web/src/app/(protected)/student/exam/[id]/\_hooks
      @app/sentinel-web/src/app/(protected)/student/exam/[id]/instruction
      @app/sentinel-web/src/app/(protected)/student/exam/[id]/checkup - this configure the [mediapipe]
      @app/sentinel-web/src/app/(protected)/student/exam/[id]/result
      @app/sentinel-web/src/app/(protected)/student/exam/[id]/privacy

Apply it on our [sentinel-mobile]
@app/sentinel-mobile/app/exam/[id]
@app/sentinel-mobile/app/exam/[id]/session
@app/sentinel-mobile/app/exam/[id]/instruction
@app/sentinel-mobile/app/exam/[id]/checkup
@app/sentinel-mobile/app/exam/[id]/result
@app/sentinel-mobile/app/exam/[id]/privacy

Ensure that the [sentinel-mobile] has similar logic in [mediapipe] from the [sentinel-web]

Ensure that they used the same [mutation] and [hooks] but in native way of react-native expo

@packages/shared/src/mediapipe
