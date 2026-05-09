# Phase 4 Notification Matrix

## Scope Matrix

| App | Role Surface | V1 Status | Notification Source | Relevant Event Families | Notes |
| --- | --- | --- | --- | --- | --- |
| `sentinel-web` | Instructor header dropdown | In scope | Real API (`/notifications`) | Exam assignment, classroom assignment, subject-request events, institution CRUD events when the user is an institution recipient | Existing live surface already renders backend-provided title/message, so new action enums do not require frontend label mapping. |
| `sentinel-web` | Student header and notifications page | Deferred | Mock data only | None in V1 | Student-facing activity notifications were not approved in Phase 0. Mock data remains with an explicit code comment so the surface is not partially migrated. |
| `sentinel-core` | Admin header dropdown | In scope | Real API (`/notifications`) | Subject-request approvals/rejections, section/subject/subject-classification CRUD, support-originated institution operations | New in Phase 4. Hidden entirely when the role lacks `notifications:view`. |
| `sentinel-core` | Superadmin header dropdown | In scope | Real API (`/notifications`) | Cross-institution institution activity and support-originated institution operations visible to the signed-in superadmin recipient | Shares the same dropdown component and query behavior as admin. |
| `sentinel-support` | Support header dropdown | Deferred | None in V1 | None in V1 | Phase 0 explicitly excluded inbound support notifications in V1, so no support UI is added in this phase. |

## Query Surface Audit

- `packages/services/src/api/notifications.ts` already supports the Phase 1–3 API needs.
- No new query params or mutation shapes were introduced by the backend phases.
- `getNotifications` and `markNotificationRead` remain the only frontend API calls needed for V1.

## Label Handling Audit

- The live notification UIs render server-authored `title` and `message` fields.
- No app in V1 depends on client-side mappings from `actionType` or `resource.type` to visible copy.
- Unknown action or resource enum values therefore degrade safely as long as the backend response remains structurally valid.
