import { describe, expect, it, vi } from 'vitest';
import {
    Kysely,
    DummyDriver,
    PostgresAdapter,
    PostgresIntrospector,
    PostgresQueryCompiler,
} from 'kysely';
import { getTosMatrixData } from './get-tos-matrix';

function createMockDb(rows: any[]) {
    const db = new Kysely<any>({
        dialect: {
            createAdapter: () => new PostgresAdapter(),
            createDriver: () => new DummyDriver(),
            createIntrospector: (executor) => new PostgresIntrospector(executor),
            createQueryCompiler: () => new PostgresQueryCompiler(),
        },
    });

    const executeSpy = vi.spyOn(db.getExecutor(), 'executeQuery');
    executeSpy.mockResolvedValueOnce({
        rows,
        insertId: undefined,
        numAffectedRows: undefined,
    } as any);

    return { db, executeSpy };
}

describe('getTosMatrixData visibility filtering', () => {
    it('keeps visible questions in the matrix and counts self-created questions', async () => {
        const { db, executeSpy } = createMockDb([]);

        await getTosMatrixData({
            dbClient: db as any,
            institutionId: 'inst-1',
            userId: 'viewer-1',
        });

        const compiledQuery = executeSpy.mock.calls[0][0];

        expect(compiledQuery.sql).toContain('"qbq"."created_by" = $');
        expect(compiledQuery.sql).toContain('not exists');
        expect(compiledQuery.sql).toContain('"question_bank_collection_shares" as "qcs"');
        expect(compiledQuery.sql).toContain('"qbc"."is_public" = $');
    });

    it('filters the matrix by the viewer context before aggregating totals', async () => {
        const { db, executeSpy } = createMockDb([
            {
                topic: 'Algebra',
                cognitive_level: 'REMEMBERING',
                status: 'ACTIVE',
            },
        ]);

        const result = await getTosMatrixData({
            dbClient: db as any,
            institutionId: 'inst-1',
            userId: 'viewer-1',
        });

        expect(result.activeCount).toBe(1);
        expect(result.retiredCount).toBe(0);
        expect(result.grandTotal).toBe(1);
        expect(result.rows).toHaveLength(1);
        expect(executeSpy).toHaveBeenCalledTimes(1);
    });
});
