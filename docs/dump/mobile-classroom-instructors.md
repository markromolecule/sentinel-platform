# To-Do: Mobile Classroom Multiple Instructors Support

## Phase 1: Shared Package Updates

- [x] Update `ClassroomSummary` and `ClassroomDetail` types in `packages/shared/src/types/classroom.ts` to include `instructors: string[]`.

## Phase 2: Backend API Enhancements

- [x] Update `RawClassroomRecord` type in `app/sentinel-api/src/modules/core/classroom/helper/classroom.types.ts`.
- [x] Add instructor aggregation subquery to `buildAccessibleClassroomsQuery` in `app/sentinel-api/src/modules/core/classroom/services/classroom-access-query.service.ts`.
- [x] Update `buildClassroomResponse` in `app/sentinel-api/src/modules/core/classroom/helper/classroom-mappers.ts` to map the `instructors` field.
- [x] Update Zod response schema in `app/sentinel-api/src/modules/core/classroom/classroom.dto.ts`.
- [x] **Tests**: Add/Update tests for `buildClassroomResponse` in `app/sentinel-api/src/modules/core/classroom/helper/classroom-mappers.test.ts`.

## Phase 3: Mobile UI Updates

- [x] Update `ClassroomCard` in `app/sentinel-mobile/components/classroom/classroom-card.tsx` to handle `instructors` array.
- [x] Update `ClassroomDetailScreen` in `app/sentinel-mobile/app/(tabs)/classroom/[id]/index.tsx` to display all instructors.
- [x] Fix search logic in `ClassroomScreen` (`app/sentinel-mobile/app/(tabs)/classroom/index.tsx`).

## Phase 4: Validation

- [x] Run `pnpm test` in `app/sentinel-api` to ensure no regressions.
- [ ] Verify API response via `curl` or Postman.
- [ ] Manual test on mobile app.
