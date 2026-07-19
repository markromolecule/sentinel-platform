-- Live inspection leases are provider-independent authorization state.
-- Rollback order: disable the feature, terminate active provider rooms, drop the
-- realtime policy/trigger/function, webhook table, lease table, then enums.

CREATE TYPE "public"."live_inspection_lease_state" AS ENUM (
    'REQUESTED',
    'PUBLISHER_CONNECTING',
    'PUBLISHER_READY',
    'LIVE',
    'STOPPING',
    'ENDED',
    'FAILED',
    'EXPIRED'
);

CREATE TYPE "public"."live_inspection_terminal_reason" AS ENUM (
    'VIEWER_STOPPED',
    'STUDENT_DISCONNECTED',
    'VIEWER_DISCONNECTED',
    'TIME_LIMIT_REACHED',
    'TOKEN_ERROR',
    'PROVIDER_ERROR',
    'EXAM_ENDED',
    'LEASE_EXPIRED'
);

CREATE TABLE "public"."live_inspection_leases" (
    "lease_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "exam_id" uuid NOT NULL,
    "attempt_id" uuid NOT NULL,
    "student_user_id" uuid NOT NULL,
    "viewer_user_id" uuid NOT NULL,
    "institution_id" uuid NOT NULL,
    "provider_room_name" varchar(128) NOT NULL,
    "state" "public"."live_inspection_lease_state" NOT NULL DEFAULT 'REQUESTED',
    "version" integer NOT NULL DEFAULT 1,
    "requested_at" timestamptz(6) NOT NULL DEFAULT now(),
    "publisher_connecting_at" timestamptz(6),
    "publisher_ready_at" timestamptz(6),
    "started_at" timestamptz(6),
    "stopping_at" timestamptz(6),
    "ended_at" timestamptz(6),
    "expires_at" timestamptz(6) NOT NULL,
    "end_reason" "public"."live_inspection_terminal_reason",
    "last_error_code" varchar(64),
    "created_at" timestamptz(6) NOT NULL DEFAULT now(),
    "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
    CONSTRAINT "live_inspection_leases_exam_fkey"
        FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("exam_id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "live_inspection_leases_attempt_fkey"
        FOREIGN KEY ("attempt_id") REFERENCES "public"."exam_attempts"("attempt_id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "live_inspection_leases_student_user_fkey"
        FOREIGN KEY ("student_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "live_inspection_leases_viewer_user_fkey"
        FOREIGN KEY ("viewer_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "live_inspection_leases_institution_fkey"
        FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "live_inspection_leases_version_positive_check" CHECK ("version" > 0),
    CONSTRAINT "live_inspection_leases_expires_after_requested_check" CHECK ("expires_at" > "requested_at"),
    CONSTRAINT "live_inspection_leases_terminal_fields_check" CHECK (
        (
            "state" IN ('ENDED', 'FAILED', 'EXPIRED')
            AND "ended_at" IS NOT NULL
            AND "end_reason" IS NOT NULL
        )
        OR (
            "state" NOT IN ('ENDED', 'FAILED', 'EXPIRED')
            AND "end_reason" IS NULL
        )
    ),
    CONSTRAINT "live_inspection_leases_error_code_length_check" CHECK (
        "last_error_code" IS NULL OR length("last_error_code") <= 64
    )
);

CREATE UNIQUE INDEX "live_inspection_leases_provider_room_name_key"
    ON "public"."live_inspection_leases" ("provider_room_name");

CREATE UNIQUE INDEX "live_inspection_leases_active_attempt_key"
    ON "public"."live_inspection_leases" ("attempt_id")
    WHERE "state" NOT IN ('ENDED', 'FAILED', 'EXPIRED');

CREATE UNIQUE INDEX "live_inspection_leases_active_viewer_key"
    ON "public"."live_inspection_leases" ("viewer_user_id")
    WHERE "state" NOT IN ('ENDED', 'FAILED', 'EXPIRED');

CREATE INDEX "live_inspection_leases_state_expires_idx"
    ON "public"."live_inspection_leases" ("state", "expires_at");

CREATE INDEX "live_inspection_leases_institution_idx"
    ON "public"."live_inspection_leases" ("institution_id");

CREATE INDEX "live_inspection_leases_room_idx"
    ON "public"."live_inspection_leases" ("provider_room_name");

CREATE TABLE "public"."livekit_webhook_events" (
    "provider_event_id" varchar(160) PRIMARY KEY,
    "lease_id" uuid,
    "event_type" varchar(80) NOT NULL,
    "received_at" timestamptz(6) NOT NULL DEFAULT now(),
    "processed_at" timestamptz(6),
    "processing_result" varchar(80),
    CONSTRAINT "livekit_webhook_events_lease_fkey"
        FOREIGN KEY ("lease_id") REFERENCES "public"."live_inspection_leases"("lease_id") ON DELETE SET NULL ON UPDATE NO ACTION,
    CONSTRAINT "livekit_webhook_events_event_type_length_check" CHECK (length("event_type") BETWEEN 1 AND 80),
    CONSTRAINT "livekit_webhook_events_result_length_check" CHECK (
        "processing_result" IS NULL OR length("processing_result") <= 80
    )
);

CREATE INDEX "livekit_webhook_events_lease_idx"
    ON "public"."livekit_webhook_events" ("lease_id");

CREATE INDEX "livekit_webhook_events_type_received_idx"
    ON "public"."livekit_webhook_events" ("event_type", "received_at");

CREATE OR REPLACE FUNCTION "public"."live_inspection_lease_changed"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    PERFORM realtime.send(
        jsonb_build_object(
            'leaseId', NEW.lease_id,
            'revision', NEW.version,
            'state', NEW.state
        ),
        'LIVE_INSPECTION_CHANGED',
        'exam-attempt:' || NEW.attempt_id::text || ':live-inspection',
        true
    );

    RETURN NEW;
END;
$$;

CREATE TRIGGER "live_inspection_lease_changed_trigger"
AFTER INSERT OR UPDATE OF state, version
ON "public"."live_inspection_leases"
FOR EACH ROW
EXECUTE FUNCTION "public"."live_inspection_lease_changed"();

ALTER TABLE "realtime"."messages" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "live_inspection_student_private_select"
ON "realtime"."messages"
FOR SELECT
TO authenticated
USING (
    "extension" = 'broadcast'
    AND realtime.topic() LIKE 'exam-attempt:%:live-inspection'
    AND split_part(realtime.topic(), ':', 1) = 'exam-attempt'
    AND split_part(realtime.topic(), ':', 3) = 'live-inspection'
    AND split_part(realtime.topic(), ':', 2) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    AND EXISTS (
        SELECT 1
        FROM "public"."exam_attempts" ea
        INNER JOIN "public"."students" st ON st.student_id = ea.student_id
        WHERE ea.attempt_id = split_part(realtime.topic(), ':', 2)::uuid
          AND st.user_id = auth.uid()
    )
);

-- No INSERT policy is intentionally created for authenticated browsers.

