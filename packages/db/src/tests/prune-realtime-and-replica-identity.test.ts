import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const migrationSource = readFileSync(
    join(
        process.cwd(),
        'prisma/migrations/20260915120000_prune_realtime_publication_and_replica_identity/migration.sql',
    ),
    'utf8',
);

const rollbackSource = readFileSync(
    join(
        process.cwd(),
        'prisma/migrations/20260915120000_prune_realtime_publication_and_replica_identity/rollback.sql',
    ),
    'utf8',
);

const standaloneScriptSource = readFileSync(
    join(
        process.cwd(),
        'src/scripts/sql/2026-09-15-prune-realtime-and-replica-identity.sql',
    ),
    'utf8',
);

describe('prune realtime publication and replica identity migration', () => {
    it('reverts exam_lobby_admissions from REPLICA IDENTITY FULL to DEFAULT', () => {
        expect(migrationSource).toContain(
            'ALTER TABLE "public"."exam_lobby_admissions" REPLICA IDENTITY DEFAULT;',
        );
        expect(standaloneScriptSource).toContain(
            'ALTER TABLE "public"."exam_lobby_admissions" REPLICA IDENTITY DEFAULT;',
        );
    });

    it('idempotently drops exam_lobby_admissions from supabase_realtime publication', () => {
        expect(migrationSource).toContain(
            'ALTER PUBLICATION supabase_realtime DROP TABLE "public"."exam_lobby_admissions";',
        );
        expect(migrationSource).toContain("pubname = 'supabase_realtime'");
        expect(migrationSource).toContain("tablename = 'exam_lobby_admissions'");
    });

    it('reverts notifications, messages, and conversation_participants to REPLICA IDENTITY DEFAULT', () => {
        expect(migrationSource).toContain(
            'ALTER TABLE "public"."notifications" REPLICA IDENTITY DEFAULT;',
        );
        expect(migrationSource).toContain(
            'ALTER TABLE "public"."messages" REPLICA IDENTITY DEFAULT;',
        );
        expect(migrationSource).toContain(
            'ALTER TABLE "public"."conversation_participants" REPLICA IDENTITY DEFAULT;',
        );
    });

    it('defines accurate rollback script restoring REPLICA IDENTITY FULL and publication', () => {
        expect(rollbackSource).toContain(
            'ALTER TABLE "public"."exam_lobby_admissions" REPLICA IDENTITY FULL;',
        );
        expect(rollbackSource).toContain(
            'ALTER PUBLICATION supabase_realtime ADD TABLE "public"."exam_lobby_admissions";',
        );
        expect(rollbackSource).toContain(
            'ALTER TABLE "public"."notifications" REPLICA IDENTITY FULL;',
        );
        expect(rollbackSource).toContain(
            'ALTER TABLE "public"."messages" REPLICA IDENTITY FULL;',
        );
        expect(rollbackSource).toContain(
            'ALTER TABLE "public"."conversation_participants" REPLICA IDENTITY FULL;',
        );
    });
});
