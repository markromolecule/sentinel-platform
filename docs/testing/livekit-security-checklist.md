# LiveKit Security and Privacy Checklist

Complete this checklist before allowlisting any non-synthetic institution.

## Credential and grant boundaries

- [ ] LiveKit API key/secret are server-only and absent from browser bundles.
- [ ] No `NEXT_PUBLIC_LIVEKIT_*` variables exist.
- [ ] Publisher token grants only room join, camera publish, no subscribe, no data publish.
- [ ] Viewer token grants only room join and subscribe, no publish, no data publish.
- [ ] Tokens expire at `LIVEKIT_TOKEN_TTL_SECONDS=60` or lower.
- [ ] Room metadata contains only the lease ID.
- [ ] Provider errors are mapped to bounded Sentinel error codes.

## Tenant and role boundaries

- [ ] Only `superadmin`, `admin`, and instructor contexts with `examinations:monitor_live_video` can request viewer leases.
- [ ] Support, public/share-only instructor contexts, unrelated admins, students, wrong session owners, wrong lease owners, and cross-tenant users fail closed.
- [ ] Private Realtime channel policy is SELECT-only for the owning student.
- [ ] Browser clients cannot insert or mutate `live_inspection_leases` or `livekit_webhook_events`.

## Media and privacy boundaries

- [ ] Audio publishing is blocked by grants and frontend track filters.
- [ ] Screen-share tracks are blocked by grants and frontend track filters.
- [ ] Egress, recording, screenshot, thumbnail, and media persistence packages/configuration are absent.
- [ ] Logs never contain raw token values, API secrets, SDP, ICE candidates, email, student number, raw media, images, thumbnails, or face landmarks.
- [ ] Viewer UI shows `LIVE` only after the expected camera track is actually playing.
- [ ] Student UI displays a persistent live-camera disclosure only while the lease is actually live.

## Operations and incident response

- [ ] Webhook signatures are verified before events are processed.
- [ ] Duplicate and out-of-order webhooks are idempotent.
- [ ] Missed stops, API restart, and reconciler overlap leave no non-terminal orphan leases.
- [ ] Forced global disable prevents new starts and allows exam answering/submission/MediaPipe to continue.
- [ ] Secret rotation rehearsal completed: old webhook signatures fail, new signatures pass, and active rooms are stopped.
- [ ] Stuck lease query and room cleanup steps are documented in `docs/testing/livekit-live-inspection-runbook.md`.
- [ ] Product/privacy approval is linked in `docs/task/2026-07-19/livekit-integration-execution-log.md`.

## Rollout guardrails

- [ ] Production starts with `LIVE_INSPECTION_ENABLED=false`.
- [ ] First enablement uses one synthetic/internal institution only.
- [ ] Initial caps remain global `20` and institution `10`.
- [ ] Rollback order is rehearsed: package 06 → 05 → 04 → 03, retaining package-02 tables unless permanently abandoned.
- [ ] The LiveKit dashboard shows zero Sentinel participants before and after each controlled exam test.
