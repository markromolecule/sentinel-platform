import { describe, expect, expectTypeOf, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Selectable } from 'kysely';
import {
    live_inspection_lease_state,
    live_inspection_terminal_reason,
    type DB,
    type live_inspection_leases,
    type livekit_webhook_events,
} from '../generated/types';

const repoRoot = process.cwd();
const schemaSource = readFileSync(join(repoRoot, 'prisma/schema.prisma'), 'utf8');
const migrationSource = readFileSync(
    join(repoRoot, 'prisma/migrations/20260719143000_add_live_inspection_leases/migration.sql'),
    'utf8',
);

describe('live inspection persistence schema', () => {
    it('exposes lease enums and generated table types', () => {
        expect(live_inspection_lease_state.REQUESTED).toBe('REQUESTED');
        expect(live_inspection_lease_state.LIVE).toBe('LIVE');
        expect(live_inspection_terminal_reason.LEASE_EXPIRED).toBe('LEASE_EXPIRED');

        expectTypeOf<DB['live_inspection_leases']>().toEqualTypeOf<live_inspection_leases>();
        expectTypeOf<DB['livekit_webhook_events']>().toEqualTypeOf<livekit_webhook_events>();
    });

    it('includes lease and webhook columns in generated DB types', () => {
        const lease: Selectable<live_inspection_leases> = {
            lease_id: '11111111-1111-4111-8111-111111111111',
            exam_id: '22222222-2222-4222-8222-222222222222',
            attempt_id: '33333333-3333-4333-8333-333333333333',
            student_user_id: '44444444-4444-4444-8444-444444444444',
            viewer_user_id: '55555555-5555-4555-8555-555555555555',
            institution_id: '66666666-6666-4666-8666-666666666666',
            provider_room_name: 'room-opaque',
            state: 'REQUESTED',
            version: 1,
            requested_at: new Date(),
            publisher_connecting_at: null,
            publisher_ready_at: null,
            started_at: null,
            stopping_at: null,
            ended_at: null,
            expires_at: new Date(),
            end_reason: null,
            last_error_code: null,
            created_at: new Date(),
            updated_at: new Date(),
        };

        const webhookEvent: Selectable<livekit_webhook_events> = {
            provider_event_id: 'evt-1',
            lease_id: lease.lease_id,
            event_type: 'participant_joined',
            received_at: new Date(),
            processed_at: null,
            processing_result: null,
        };

        expect(lease.state).toBe('REQUESTED');
        expect(webhookEvent.provider_event_id).toBe('evt-1');
    });

    it('declares Prisma relations and active partial indexes', () => {
        expect(schemaSource).toContain('model live_inspection_leases');
        expect(schemaSource).toContain('model livekit_webhook_events');
        expect(migrationSource).toContain('live_inspection_leases_active_attempt_key');
        expect(migrationSource).toContain('live_inspection_leases_active_viewer_key');
        expect(migrationSource).toContain("WHERE \"state\" NOT IN ('ENDED', 'FAILED', 'EXPIRED')");
        expect(migrationSource).toContain('live_inspection_leases_version_positive_check');
        expect(migrationSource).toContain('live_inspection_leases_expires_after_requested_check');
    });
});
