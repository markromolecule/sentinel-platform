import { describe, expect, it, vi } from 'vitest';
import {
    Kysely,
    DummyDriver,
    PostgresAdapter,
    PostgresIntrospector,
    PostgresQueryCompiler,
} from 'kysely';
import { getQuestionTypeCountsData } from './get-question-type-counts';

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

describe('getQuestionTypeCountsData', () => {
    it('queries and maps grouped type counts correctly', async () => {
        const { db, executeSpy } = createMockDb([
            { question_type: 'MULTIPLE_CHOICE', count: 10 },
            { question_type: 'TRUE_FALSE', count: 5 },
        ]);

        const result = await getQuestionTypeCountsData({
            dbClient: db as any,
            institutionId: 'inst-1',
            filters: { search: 'algebra' },
            userId: 'viewer-1',
        });

        expect(result.total).toBe(15);
        expect(result.items).toHaveLength(2);
        expect(result.items[0]).toEqual({ type: 'MULTIPLE_CHOICE', count: 10 });
        expect(result.items[1]).toEqual({ type: 'TRUE_FALSE', count: 5 });

        const compiledQuery = executeSpy.mock.calls[0][0];
        expect(compiledQuery.sql).toContain('group by "qbq"."question_type"');
        expect(compiledQuery.sql).toContain('count(*)');
        expect(compiledQuery.sql).toContain('ilike');
    });
});
