import { describe, expect, it, vi } from 'vitest';
import { recalculateRoomStatus } from './recalculate-room-status';
import {
    Kysely,
    DummyDriver,
    PostgresAdapter,
    PostgresIntrospector,
    PostgresQueryCompiler,
} from 'kysely';

function createMockDb(activeExamRow: any | null) {
    const db = new Kysely<any>({
        dialect: {
            createAdapter: () => new PostgresAdapter(),
            createDriver: () => new DummyDriver(),
            createIntrospector: (db) => new PostgresIntrospector(db),
            createQueryCompiler: () => new PostgresQueryCompiler(),
        },
    });

    const executeSpy = vi.spyOn(db.getExecutor(), 'executeQuery');

    // First call (select active exam query)
    executeSpy.mockResolvedValueOnce({
        rows: activeExamRow ? [activeExamRow] : [],
        insertId: undefined,
        numAffectedRows: undefined,
    } as any);

    // Second call (update table query)
    executeSpy.mockResolvedValueOnce({
        rows: [],
        insertId: undefined,
        numAffectedRows: undefined,
    } as any);

    return { db, executeSpy };
}

describe('recalculateRoomStatus', () => {
    it('should set room status to ASSIGNED when active exam is found', async () => {
        const { db, executeSpy } = createMockDb({ exam_id: 'exam-1' });

        await recalculateRoomStatus(db as any, 'room-1');

        expect(executeSpy).toHaveBeenCalledTimes(2);

        const selectQuery = executeSpy.mock.calls[0][0];
        expect(selectQuery.sql).toContain('select "exam_id" from "exams"');
        expect(selectQuery.sql).toContain('"room_id" = $1');
        expect(selectQuery.sql).toContain('"status" not in ($2, $3, $4)');
        expect(selectQuery.parameters).toContain('room-1');

        const updateQuery = executeSpy.mock.calls[1][0];
        expect(updateQuery.sql).toContain('update "rooms" set "status" = $1');
        expect(updateQuery.sql).toContain('"room_id" = $3');
        expect(updateQuery.sql).toContain('"status" != $4');
        expect(updateQuery.parameters).toContain('ASSIGNED');
        expect(updateQuery.parameters).toContain('room-1');
        expect(updateQuery.parameters).toContain('MAINTENANCE');
    });

    it('should set room status to AVAILABLE when no active exam is found', async () => {
        const { db, executeSpy } = createMockDb(null);

        await recalculateRoomStatus(db as any, 'room-1');

        expect(executeSpy).toHaveBeenCalledTimes(2);

        const updateQuery = executeSpy.mock.calls[1][0];
        expect(updateQuery.sql).toContain('update "rooms" set "status" = $1');
        expect(updateQuery.parameters).toContain('AVAILABLE');
        expect(updateQuery.parameters).toContain('room-1');
    });

    it('should support array of roomIds and call update for each', async () => {
        const db = new Kysely<any>({
            dialect: {
                createAdapter: () => new PostgresAdapter(),
                createDriver: () => new DummyDriver(),
                createIntrospector: (db) => new PostgresIntrospector(db),
                createQueryCompiler: () => new PostgresQueryCompiler(),
            },
        });

        const executeSpy = vi.spyOn(db.getExecutor(), 'executeQuery');
        // Mock responses for room-1 and room-2 queries (2 select, 2 update = 4 queries total)
        executeSpy
            // room-1 select (no exam)
            .mockResolvedValueOnce({ rows: [] } as any)
            // room-1 update
            .mockResolvedValueOnce({ rows: [] } as any)
            // room-2 select (has exam)
            .mockResolvedValueOnce({ rows: [{ exam_id: 'exam-2' }] } as any)
            // room-2 update
            .mockResolvedValueOnce({ rows: [] } as any);

        await recalculateRoomStatus(db as any, ['room-1', 'room-2']);

        expect(executeSpy).toHaveBeenCalledTimes(4);
    });
});
