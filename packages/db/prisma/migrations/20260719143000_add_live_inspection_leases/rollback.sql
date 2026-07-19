-- Rollback for 20260719143000_add_live_inspection_leases.
--
-- Review gate before running:
-- 1. Set LIVE_INSPECTION_ENABLED=false in every runtime.
-- 2. Stop provider room/token creation endpoints.
-- 3. Terminate active LiveKit rooms externally so no browser keeps publishing.
-- 4. Confirm no later migration depends on the lease/webhook tables or enums.

DROP POLICY IF EXISTS "live_inspection_student_private_select"
ON "realtime"."messages";

DROP TRIGGER IF EXISTS "live_inspection_lease_changed_trigger"
ON "public"."live_inspection_leases";

DROP FUNCTION IF EXISTS "public"."live_inspection_lease_changed"();

DROP TABLE IF EXISTS "public"."livekit_webhook_events";

DROP TABLE IF EXISTS "public"."live_inspection_leases";

DROP TYPE IF EXISTS "public"."live_inspection_terminal_reason";

DROP TYPE IF EXISTS "public"."live_inspection_lease_state";
