import { describe, expect, it, vi } from 'vitest';
import { getExamsData } from './get-exams';
import {
    Kysely,
    DummyDriver,
    PostgresAdapter,
    PostgresIntrospector,
    PostgresQueryCompiler,
} from 'kysely';

function createMockDb(metadataRows: any[], dataRows: any[]) {
    const db = new Kysely<any>({
        dialect: {
            createAdapter: () => new PostgresAdapter(),
            createDriver: () => new DummyDriver(),
            createIntrospector: (db) => new PostgresIntrospector(db),
            createQueryCompiler: () => new PostgresQueryCompiler(),
        },
    });

    const executeSpy = vi.spyOn(db.getExecutor(), 'executeQuery');

    // First call (metadata column check)
    executeSpy.mockResolvedValueOnce({
        rows: metadataRows,
        insertId: undefined,
        numAffectedRows: undefined,
    } as any);

    // Second call (actual query)
    executeSpy.mockResolvedValueOnce({
        rows: dataRows,
        insertId: undefined,
        numAffectedRows: undefined,
    } as any);

    return { db, executeSpy };
}

describe('getExamsData', () => {
    it('should query exams without department filtering when departmentId is not provided', async () => {
        const { db, executeSpy } = createMockDb(
            [
                { column_name: 'section_id' },
                { column_name: 'section_name' },
                { column_name: 'room_id' },
            ],
            [],
        );

        await getExamsData({
            dbClient: db as any,
            institutionId: 'inst-123',
            filters: {},
        });

        expect(executeSpy).toHaveBeenCalledTimes(2);
        const compiledQuery = executeSpy.mock.calls[1][0];

        // Should select exam_category
        expect(compiledQuery.sql).toContain('"e"."exam_category"');
        // Should filter by institution_id
        expect(compiledQuery.sql).toContain('"e"."institution_id" = $1');
        // Should NOT contain department filtering subqueries
        expect(compiledQuery.sql).not.toContain('sections as sec');
        expect(compiledQuery.sql).not.toContain('subject_departments as sd');
    });

    it('should query exams with department filtering when departmentId is provided', async () => {
        const { db, executeSpy } = createMockDb(
            [
                { column_name: 'section_id' },
                { column_name: 'section_name' },
                { column_name: 'room_id' },
            ],
            [],
        );

        await getExamsData({
            dbClient: db as any,
            institutionId: 'inst-123',
            filters: {},
            departmentId: 'dept-456',
        });

        expect(executeSpy).toHaveBeenCalledTimes(2);
        const compiledQuery = executeSpy.mock.calls[1][0];

        // Should select exam_category
        expect(compiledQuery.sql).toContain('"e"."exam_category"');
        // Should contain department filtering subqueries
        expect(compiledQuery.sql).toContain('"sections" as "sec"');
        expect(compiledQuery.sql).toContain('"sections" as "sec_cg"');
        expect(compiledQuery.sql).toContain('"subject_departments" as "sd"');
        expect(compiledQuery.sql).toContain('"sec"."department_id" = $2');
    });
});
