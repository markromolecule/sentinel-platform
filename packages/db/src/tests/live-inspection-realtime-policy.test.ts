import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const migrationSource = readFileSync(
    join(
        process.cwd(),
        'prisma/migrations/20260719143000_add_live_inspection_leases/migration.sql',
    ),
    'utf8',
);
const rollbackSource = readFileSync(
    join(process.cwd(), 'prisma/migrations/20260719143000_add_live_inspection_leases/rollback.sql'),
    'utf8',
);

describe('live inspection realtime policy', () => {
    it('sends a private bounded payload to the attempt topic', () => {
        const triggerBody = migrationSource.slice(
            migrationSource.indexOf('CREATE OR REPLACE FUNCTION'),
            migrationSource.indexOf('CREATE TRIGGER'),
        );

        expect(migrationSource).toContain('realtime.send');
        expect(triggerBody).toContain("'leaseId', NEW.lease_id");
        expect(triggerBody).toContain("'revision', NEW.version");
        expect(triggerBody).toContain("'state', NEW.state");
        expect(triggerBody).toContain(
            "'exam-attempt:' || NEW.attempt_id::text || ':live-inspection'",
        );
        expect(triggerBody).toContain('true');
        expect(triggerBody).not.toContain('provider_room_name');
    });

    it('allows only student-owned private broadcast reads and no browser inserts', () => {
        expect(migrationSource).toContain('FOR SELECT');
        expect(migrationSource).toContain('"extension" = \'broadcast\'');
        expect(migrationSource).toContain('st.user_id = auth.uid()');
        expect(migrationSource).toContain("split_part(realtime.topic(), ':', 1) = 'exam-attempt'");
        expect(migrationSource).toContain(
            "split_part(realtime.topic(), ':', 3) = 'live-inspection'",
        );
        expect(migrationSource).toContain("~* '^[0-9a-f]{8}-");
        expect(migrationSource).not.toContain('FOR INSERT');
        expect(migrationSource).not.toContain(
            'ALTER TABLE "realtime"."messages" ENABLE ROW LEVEL SECURITY',
        );
    });

    it('documents rollback dependency order', () => {
        expect(rollbackSource).toContain(
            'DROP POLICY IF EXISTS "live_inspection_student_private_select"',
        );
        expect(rollbackSource).toContain(
            'DROP TRIGGER IF EXISTS "live_inspection_lease_changed_trigger"',
        );
        expect(rollbackSource).toContain(
            'DROP FUNCTION IF EXISTS "public"."live_inspection_lease_changed"()',
        );
        expect(rollbackSource).toContain('DROP TABLE IF EXISTS "public"."livekit_webhook_events"');
        expect(rollbackSource).toContain('DROP TABLE IF EXISTS "public"."live_inspection_leases"');
        expect(rollbackSource.indexOf('DROP POLICY')).toBeLessThan(
            rollbackSource.indexOf('DROP TRIGGER'),
        );
        expect(rollbackSource.indexOf('DROP TRIGGER')).toBeLessThan(
            rollbackSource.indexOf('DROP FUNCTION'),
        );
        expect(
            rollbackSource.indexOf('DROP TABLE IF EXISTS "public"."livekit_webhook_events"'),
        ).toBeLessThan(
            rollbackSource.indexOf('DROP TABLE IF EXISTS "public"."live_inspection_leases"'),
        );
    });
});
