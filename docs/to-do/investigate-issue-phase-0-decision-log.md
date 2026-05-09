# Investigate Issue Phase 0 Decision Log

## Status

Phase 0 decision log for [investigate-issue-implementation-plan.md](/Applications/XAMPP/xamppfiles/htdocs/sentinel/docs/to-do/investigate-issue-implementation-plan.md).

This locks the event taxonomy and routing assumptions required before backend implementation starts.

## Architecture Decision

- Use the existing `app/sentinel-api/src/modules/general/notification/` module as the persistence and API boundary.
- Add the orchestration layer inside that module as a workflow-oriented service, not as a new `broadcast` module.
- Recommended initial location:
  - `app/sentinel-api/src/modules/general/notification/services/activity-notification.service.ts`
- Rationale:
  - the repo already persists per-user in-app notifications
  - classroom and exam assignment already follow direct notification-service integration
  - current gaps are recipient resolution, taxonomy breadth, and fan-out consistency
  - a separate `broadcast` module would add abstraction before there is evidence of multi-channel delivery or queueing needs

## Subject-Request Decisions

- Instructor subject-request submission will notify users in the same institution who hold `subject_requests:approve`.
- Recipient resolution will be permission-driven, not hard-coded to only `admin` and `superadmin`.
- In the current role blueprints, that effectively targets `admin` and `superadmin`, while remaining compatible with future custom roles.
- Approval and rejection actions will emit one aggregate notification per batch action to the requesting instructor.
- Aggregate notifications are preferred because the current approval and rejection endpoints already accept `request_ids[]`, and per-request fan-out would create avoidable notification noise.

## Admin And Superadmin Activity Decisions

- Self-notifications are suppressed for CRUD activity events.
- V1 CRUD scope includes:
  - section create, update, delete
  - subject create, update, delete
  - subject-classification create, update, delete
  - bulk upload operations for subjects and subject classifications when they materially create or change records
- V1 CRUD scope excludes:
  - institution-level changes
  - low-value operational edits that would create excessive noise without clear user benefit
- Bulk operations will emit a single summary notification per action, not one row per affected record.

## Support Decisions

- Support-originated notifications are dual-scoped:
  - institution-scoped when the support action targets a specific institution
  - global only when the action is platform-wide and has no single institution target
- V1 support-originated notifications should be limited to operational actions that materially affect institution setup, governance, or platform access.
- Support users will not receive general inbound notifications from institution activity in V1.
- Support users may receive support-specific or platform-wide notifications later, but that is out of scope for this delivery slice.

## Finalized Enum Names For V1

### Notification Resource Types

- `SUBJECT_ENROLLMENT_REQUEST`
- `SECTION`
- `SUBJECT`
- `SUBJECT_CLASSIFICATION`
- `SUPPORT_OPERATION`

### Notification Action Types

- `SUBJECT_ENROLLMENT_REQUEST_SUBMITTED`
- `SUBJECT_ENROLLMENT_REQUEST_APPROVED`
- `SUBJECT_ENROLLMENT_REQUEST_REJECTED`
- `SECTION_CREATED`
- `SECTION_UPDATED`
- `SECTION_DELETED`
- `SUBJECT_CREATED`
- `SUBJECT_UPDATED`
- `SUBJECT_DELETED`
- `SUBJECT_CLASSIFICATION_CREATED`
- `SUBJECT_CLASSIFICATION_UPDATED`
- `SUBJECT_CLASSIFICATION_DELETED`
- `SUPPORT_OPERATION_COMPLETED`

## Recipient Resolution Matrix

| Event Type | Recipients | Scope Rule | Actor Excluded |
| --- | --- | --- | --- |
| Subject request submitted | Users with `subject_requests:approve` | Same institution as the request | Yes |
| Subject request approved | Requesting instructor | Same institution as the request | Yes |
| Subject request rejected | Requesting instructor | Same institution as the request | Yes |
| Section CRUD | Admin or superadmin users with relevant academic visibility | Same institution | Yes |
| Subject CRUD | Admin or superadmin users with relevant academic visibility | Same institution | Yes |
| Subject-classification CRUD | Admin or superadmin users with relevant academic visibility | Same institution | Yes |
| Bulk academic operation | Same as corresponding CRUD domain | Same institution | Yes |
| Support operation completed | Role-specific recipients based on the target operation | Institution-scoped or global depending on operation | Yes |

## Implementation Notes For Phase 1+

- Prefer permission-based recipient lookup over role-name checks when possible.
- Aggregate notifications should include metadata that preserves batch context:
  - request IDs
  - counts
  - institution ID
  - primary resource label when available
- Keep announcements separate from notifications. Announcements are authored content; notifications are reaction events.
