import { describe, expect, it, vi } from 'vitest';
import {
    Kysely,
    DummyDriver,
    PostgresAdapter,
    PostgresIntrospector,
    PostgresQueryCompiler,
} from 'kysely';
import { getQuestionsData } from './get-questions';

function createMockDb(metadataRows: any[], dataRows: any[]) {
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
        rows: metadataRows,
        insertId: undefined,
        numAffectedRows: undefined,
    } as any);
    executeSpy.mockResolvedValueOnce({
        rows: dataRows,
        insertId: undefined,
        numAffectedRows: undefined,
    } as any);

    return { db, executeSpy };
}

describe('getQuestionsData visibility filtering', () => {
    it('keeps uncollected questions visible to any user', async () => {
        const { db, executeSpy } = createMockDb([{ count: '0' }], []);

        await getQuestionsData({
            dbClient: db as any,
            institutionId: 'inst-1',
            filters: { page: 1, pageSize: 10 } as any,
            userId: 'viewer-1',
        });

        const compiledQuery = executeSpy.mock.calls[1][0];

        expect(compiledQuery.sql).toContain('not exists');
        expect(compiledQuery.sql).toContain('"question_bank_collection_questions" as "qbcq"');
        expect(compiledQuery.sql).toContain('"qbq"."question_bank_question_id"');
    });

    it('allows questions from public collections', async () => {
        const { db, executeSpy } = createMockDb([{ count: '0' }], []);

        await getQuestionsData({
            dbClient: db as any,
            institutionId: 'inst-1',
            filters: { page: 1, pageSize: 10 } as any,
            userId: 'viewer-1',
        });

        const compiledQuery = executeSpy.mock.calls[1][0];

        expect(compiledQuery.sql).toContain('"qbc"."is_public" = $');
    });

    it('keeps self-created questions visible to the viewer', async () => {
        const { db, executeSpy } = createMockDb([{ count: '0' }], []);

        await getQuestionsData({
            dbClient: db as any,
            institutionId: 'inst-1',
            filters: { page: 1, pageSize: 10 } as any,
            userId: 'creator-1',
        });

        const compiledQuery = executeSpy.mock.calls[1][0];

        expect(compiledQuery.sql).toContain('"qbc"."created_by" = $');
    });

    it('allows questions from private collections explicitly shared with the user', async () => {
        const { db, executeSpy } = createMockDb([{ count: '0' }], []);

        await getQuestionsData({
            dbClient: db as any,
            institutionId: 'inst-1',
            filters: { page: 1, pageSize: 10 } as any,
            userId: 'shared-user-1',
        });

        const compiledQuery = executeSpy.mock.calls[1][0];

        expect(compiledQuery.sql).toContain('"question_bank_collection_shares" as "qcs"');
        expect(compiledQuery.sql).toContain('"qcs"."user_id" = $');
    });

    it('treats private unshared collections as hidden unless the question creator matches', async () => {
        const { db, executeSpy } = createMockDb([{ count: '0' }], []);

        await getQuestionsData({
            dbClient: db as any,
            institutionId: 'inst-1',
            filters: { page: 1, pageSize: 10 } as any,
            userId: 'viewer-1',
        });

        const compiledQuery = executeSpy.mock.calls[1][0];

        expect(compiledQuery.sql).toContain('"qbq"."created_by" = $');
        expect(compiledQuery.sql).toContain('"qbc"."is_public" = $');
        expect(compiledQuery.sql).toContain('"qcs"."user_id" = $');
    });
});
