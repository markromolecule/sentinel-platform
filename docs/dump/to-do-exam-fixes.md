# Exam Issues To-Do

## Phase 1: Grading Page fixes

- [ ] Update `get-grading-exams-data.ts` to include `end_date_time` in query.
- [ ] Update `get-grading-exams.ts` status logic to check `end_date_time`.

## Phase 2: Monitoring Page fixes

- [ ] Fix `resolveProgress` in `map-monitoring-response.ts` to show 100% on completion.
- [ ] Add `data-lenis-prevent` to logs container in `student-monitoring-detail.tsx`.
- [ ] Investigate log description mismatches in `TELEMETRY_INCIDENT_LABELS`.

## Phase 3: Telemetry Optimization (Bloat Prevention)

- [ ] Modify `IncidentPersistenceService.appendEvent` to implement 2-min deduplication.
- [ ] Implement severity escalation based on event frequency.
- [ ] Update `IncidentPersistenceService.appendBatch` to also handle deduplication.
