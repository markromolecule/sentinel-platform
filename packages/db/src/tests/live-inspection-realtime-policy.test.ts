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
    });

    it('documents rollback dependency order', () => {
        expect(migrationSource).toMatch(/drop the\s+-- realtime policy\/trigger\/function/);
        expect(migrationSource).toContain('webhook table, lease table, then enums');
    });
});
