import { Pool } from 'pg';
import { describe, expect, it, vi } from 'vitest';
import { type DbClient } from '@sentinel/db';
import { Kysely, PostgresDialect } from 'kysely';
import {
    assertExamRoomAvailability,
    buildExamRoomConflictQuery,
    EXAM_ROOM_SCHEDULE_CONFLICT_MESSAGE,
} from '../../modules/examination/exams/services/assert-exam-room-availability.service';

function createCompilerDb() {
    return new Kysely<any>({
        dialect: new PostgresDialect({
            pool: new Pool({
                connectionString: 'postgres://sentinel:sentinel@127.0.0.1:5432/sentinel',
            }),
        }),
    });
}

function createSelectBuilder(result: unknown) {
    return {
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(result),
    };
}

describe('exam room reservation', () => {
    it('uses only room, institution, and time-window overlap checks so drafts also reserve rooms', () => {
        const db = createCompilerDb();
        const compiled = buildExamRoomConflictQuery({
            dbClient: db as unknown as DbClient,
            institutionId: '11111111-1111-4111-8111-111111111111',
            roomId: '22222222-2222-4222-8222-222222222222',
            startDateTime: new Date('2026-05-08T02:00:00.000Z'),
            endDateTime: new Date('2026-05-08T04:00:00.000Z'),
        }).compile();

        expect(compiled.sql).toContain('"e"."room_id" = $1');
        expect(compiled.sql).toContain('"e"."institution_id" = $2');
        expect(compiled.sql).toContain('coalesce(');
        expect(compiled.sql).toContain("interval '1 minute'");
        expect(compiled.sql).not.toContain('published_at');
        expect(compiled.sql).not.toContain('status');

        void db.destroy();
    });

    it('uses strict overlap boundaries so a room is reusable exactly when the earlier exam ends', () => {
        const db = createCompilerDb();
        const compiled = buildExamRoomConflictQuery({
            dbClient: db as unknown as DbClient,
            institutionId: '11111111-1111-4111-8111-111111111111',
            roomId: '22222222-2222-4222-8222-222222222222',
            startDateTime: new Date('2026-05-08T02:00:00.000Z'),
            endDateTime: new Date('2026-05-08T03:00:00.000Z'),
        }).compile();

        expect(compiled.sql).toContain(') > $3');
        expect(compiled.sql).toContain('e.scheduled_date < $4');

        void db.destroy();
    });

    it('adds a self-exclusion clause when rechecking room availability during updates', () => {
        const db = createCompilerDb();
        const compiled = buildExamRoomConflictQuery({
            dbClient: db as unknown as DbClient,
            institutionId: '11111111-1111-4111-8111-111111111111',
            roomId: '22222222-2222-4222-8222-222222222222',
            startDateTime: new Date('2026-05-08T02:00:00.000Z'),
            endDateTime: new Date('2026-05-08T04:00:00.000Z'),
            excludeExamId: '33333333-3333-4333-8333-333333333333',
        }).compile();

        expect(compiled.sql).toContain('"e"."exam_id" != $5');

        void db.destroy();
    });

    it('throws a stable 409 payload when a conflicting exam exists', async () => {
        const selectBuilder = createSelectBuilder({
            exam_id: 'existing-exam',
        });
        const dbClient = {
            selectFrom: vi.fn().mockReturnValue(selectBuilder),
        } as unknown as DbClient;

        await expect(
            assertExamRoomAvailability({
                dbClient,
                institutionId: '11111111-1111-4111-8111-111111111111',
                roomId: '22222222-2222-4222-8222-222222222222',
                startDateTime: '2026-05-08T02:00:00.000Z',
                endDateTime: '2026-05-08T04:00:00.000Z',
            }),
        ).rejects.toMatchObject({
            status: 409,
            message: EXAM_ROOM_SCHEDULE_CONFLICT_MESSAGE,
        });
    });

    it('resolves cleanly when no conflicting room assignment exists', async () => {
        const selectBuilder = createSelectBuilder(undefined);
        const dbClient = {
            selectFrom: vi.fn().mockReturnValue(selectBuilder),
        } as unknown as DbClient;

        await expect(
            assertExamRoomAvailability({
                dbClient,
                institutionId: '11111111-1111-4111-8111-111111111111',
                roomId: '22222222-2222-4222-8222-222222222222',
                startDateTime: '2026-05-08T04:00:00.000Z',
                endDateTime: '2026-05-08T05:00:00.000Z',
                excludeExamId: '33333333-3333-4333-8333-333333333333',
            }),
        ).resolves.toBeUndefined();

        expect(selectBuilder.where).toHaveBeenCalledWith(
            'e.exam_id',
            '!=',
            '33333333-3333-4333-8333-333333333333',
        );
    });
});
