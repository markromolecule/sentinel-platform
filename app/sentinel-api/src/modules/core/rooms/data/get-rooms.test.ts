import { describe, expect, it, vi } from 'vitest';
import { getRoomsData } from './get-rooms';
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
    executeSpy.mockResolvedValue({
        rows: [],
        insertId: undefined,
        numAffectedRows: undefined,
    } as any);

    return { db, executeSpy };
}

describe('getRoomsData', () => {
    it('constructs dynamic status projection covering both exam header and section assignments', async () => {
        const { db, executeSpy } = createMockDb();

        await getRoomsData({
            dbClient: db as any,
            institutionId: 'inst-123',
            search: 'Science',
        });

        expect(executeSpy).toHaveBeenCalledTimes(1);
        const query = executeSpy.mock.calls[0][0];

        // Ensure dynamic CASE projection is present
        expect(query.sql).toContain('CASE');
        expect(query.sql).toContain('WHEN r.status = \'MAINTENANCE\' THEN \'MAINTENANCE\'');
        expect(query.sql).toContain('THEN \'ASSIGNED\'');
        expect(query.sql).toContain('ELSE \'AVAILABLE\'');

        // Ensure both exam header and section split room checks are present
        expect(query.sql).toContain('e.room_id = r.room_id');
        expect(query.sql).toContain('exam_section_assignments');
        expect(query.sql).toContain('esa.room_id = r.room_id');
        expect(query.sql).toContain('esa.exam_id = e.exam_id');

        // Ensure institution and search filters are compiled
        expect(query.sql).toContain('"r"."institution_id" = $');
        expect(query.parameters).toContain('inst-123');
        expect(query.parameters).toContain('%Science%');
    });
});
