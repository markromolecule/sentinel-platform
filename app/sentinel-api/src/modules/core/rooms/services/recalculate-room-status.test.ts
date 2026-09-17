import { describe, expect, it, vi } from 'vitest';
import { recalculateRoomStatus } from './recalculate-room-status';
import {
    Kysely,
    DummyDriver,
    PostgresAdapter,
    PostgresIntrospector,
    PostgresQueryCompiler,
} from 'kysely';

function createMockDb() {
    const db = new Kysely<any>({
        dialect: {
            createAdapter: () => new PostgresAdapter(),
            createDriver: () => new DummyDriver(),
            createIntrospector: (db) => new PostgresIntrospector(db),
            createQueryCompiler: () => new PostgresQueryCompiler(),
        },
    });

    const executeSpy = vi.spyOn(db.getExecutor(), 'executeQuery');
    return { db, executeSpy };
}

describe('recalculateRoomStatus', () => {
    it('should set room status to ASSIGNED in batch when direct active exam is found', async () => {
        const { db, executeSpy } = createMockDb();

        // 1. directExamRooms select
        executeSpy.mockResolvedValueOnce({
            rows: [{ room_id: 'room-1' }],
        } as any);

        // 2. sectionExamRooms select
        executeSpy.mockResolvedValueOnce({
            rows: [],
        } as any);

        // 3. update rooms set status = 'ASSIGNED'
        executeSpy.mockResolvedValueOnce({
            rows: [],
        } as any);

        await recalculateRoomStatus(db as any, 'room-1');

        expect(executeSpy).toHaveBeenCalledTimes(3);

        const directSelectQuery = executeSpy.mock.calls[0][0];
        expect(directSelectQuery.sql).toContain('select "room_id" from "exams"');
        expect(directSelectQuery.sql).toContain('"room_id" in ($1)');
        expect(directSelectQuery.parameters).toContain('room-1');

        const updateQuery = executeSpy.mock.calls[2][0];
        expect(updateQuery.sql).toContain('update "rooms" set "status" = $1');
        expect(updateQuery.sql).toContain('"room_id" in ($3)');
        expect(updateQuery.sql).toContain('"status" != $4');
        expect(updateQuery.parameters).toContain('ASSIGNED');
        expect(updateQuery.parameters).toContain('room-1');
        expect(updateQuery.parameters).toContain('MAINTENANCE');
    });

    it('should set room status to AVAILABLE in batch when no active exam is found', async () => {
        const { db, executeSpy } = createMockDb();

        // 1. directExamRooms select (empty)
        executeSpy.mockResolvedValueOnce({ rows: [] } as any);

        // 2. sectionExamRooms select (empty)
        executeSpy.mockResolvedValueOnce({ rows: [] } as any);

        // 3. update rooms set status = 'AVAILABLE'
        executeSpy.mockResolvedValueOnce({ rows: [] } as any);

        await recalculateRoomStatus(db as any, 'room-1');

        expect(executeSpy).toHaveBeenCalledTimes(3);

        const updateQuery = executeSpy.mock.calls[2][0];
        expect(updateQuery.sql).toContain('update "rooms" set "status" = $1');
        expect(updateQuery.parameters).toContain('AVAILABLE');
        expect(updateQuery.parameters).toContain('room-1');
    });

    it('should set room status to ASSIGNED when section split active exam is found', async () => {
        const { db, executeSpy } = createMockDb();

        // 1. directExamRooms select (empty)
        executeSpy.mockResolvedValueOnce({ rows: [] } as any);

        // 2. sectionExamRooms select (found room-1)
        executeSpy.mockResolvedValueOnce({ rows: [{ room_id: 'room-1' }] } as any);

        // 3. update rooms set status = 'ASSIGNED'
        executeSpy.mockResolvedValueOnce({ rows: [] } as any);

        await recalculateRoomStatus(db as any, 'room-1');

        expect(executeSpy).toHaveBeenCalledTimes(3);

        const sectionSelectQuery = executeSpy.mock.calls[1][0];
        expect(sectionSelectQuery.sql).toContain('exam_section_assignments');
        expect(sectionSelectQuery.sql).toContain('"esa"."room_id" in ($1)');

        const updateQuery = executeSpy.mock.calls[2][0];
        expect(updateQuery.sql).toContain('update "rooms" set "status" = $1');
        expect(updateQuery.parameters).toContain('ASSIGNED');
    });

    it('should execute batch updates for array of roomIds in constant query count', async () => {
        const { db, executeSpy } = createMockDb();

        // 1. directExamRooms select (room-1 active)
        executeSpy.mockResolvedValueOnce({ rows: [{ room_id: 'room-1' }] } as any);

        // 2. sectionExamRooms select (empty)
        executeSpy.mockResolvedValueOnce({ rows: [] } as any);

        // 3. update ASSIGNED for room-1
        executeSpy.mockResolvedValueOnce({ rows: [] } as any);

        // 4. update AVAILABLE for room-2
        executeSpy.mockResolvedValueOnce({ rows: [] } as any);

        await recalculateRoomStatus(db as any, ['room-1', 'room-2']);

        // 2 SELECTs + 2 UPDATEs = 4 queries total for 2 rooms (constant batch size instead of N loops)
        expect(executeSpy).toHaveBeenCalledTimes(4);

        const assignedUpdate = executeSpy.mock.calls[2][0];
        expect(assignedUpdate.parameters).toContain('ASSIGNED');
        expect(assignedUpdate.parameters).toContain('room-1');

        const availableUpdate = executeSpy.mock.calls[3][0];
        expect(availableUpdate.parameters).toContain('AVAILABLE');
        expect(availableUpdate.parameters).toContain('room-2');
    });
});
