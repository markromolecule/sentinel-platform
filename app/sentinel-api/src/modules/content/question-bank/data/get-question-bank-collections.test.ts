import { describe, expect, it, vi } from 'vitest';
import { getQuestionBankCollectionsData } from './get-question-bank-collections';

function makeExpressionBuilder() {
    const eb: any = (...args: unknown[]) => args;
    eb.or = (items: unknown[]) => items;
    eb.exists = (subquery: unknown) => subquery;
    eb.selectFrom = () => createCountQuery();
    return eb;
}

function createCountQuery(result: { count: string } = { count: '0' }) {
    const query: any = {
        select: vi.fn(() => query),
        whereRef: vi.fn(() => query),
        where: vi.fn((arg?: unknown) => {
            if (typeof arg === 'function') {
                arg(makeExpressionBuilder());
            }
            return query;
        }),
        executeTakeFirst: vi.fn(async () => result),
    };
    return query;
}

function createDataQuery(result: unknown[] = []) {
    const query: any = {
        leftJoin: vi.fn(() => query),
        select: vi.fn(() => query),
        whereRef: vi.fn(() => query),
        where: vi.fn((arg?: unknown) => {
            if (typeof arg === 'function') {
                arg(makeExpressionBuilder());
            }
            return query;
        }),
        groupBy: vi.fn(() => query),
        orderBy: vi.fn(() => query),
        limit: vi.fn(() => query),
        offset: vi.fn(() => query),
        execute: vi.fn(async () => result),
    };
    return query;
}

describe('getQuestionBankCollectionsData', () => {
    it('returns a paginated envelope with count and offset queries', async () => {
        const countQuery = createCountQuery({ count: '3' });
        const rows = [
            {
                collection_id: 'collection-1',
                institution_id: 'inst-1',
                name: 'Private set',
                description: null,
                tags: [],
                is_public: false,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: 'creator-1',
                updated_by: 'creator-1',
                creator_first_name: null,
                creator_last_name: null,
                updater_first_name: null,
                updater_last_name: null,
                question_count: 0,
            },
        ];
        const dataQuery = createDataQuery(rows);

        const dbClient = {
            selectFrom: vi.fn().mockReturnValueOnce(countQuery).mockReturnValueOnce(dataQuery),
        } as any;

        const result = await getQuestionBankCollectionsData({
            dbClient,
            institutionId: 'inst-1',
            userId: 'viewer-1',
            filters: { page: 2, pageSize: 2 } as any,
        });

        expect(dbClient.selectFrom).toHaveBeenNthCalledWith(1, 'question_bank_collections as qbc');
        expect(dbClient.selectFrom).toHaveBeenNthCalledWith(2, 'question_bank_collections as qbc');
        expect(countQuery.executeTakeFirst).toHaveBeenCalledTimes(1);
        expect(dataQuery.limit).toHaveBeenCalledWith(2);
        expect(dataQuery.offset).toHaveBeenCalledWith(2);
        expect(result).toEqual({
            items: rows,
            page: 2,
            pageSize: 2,
            total: 3,
            totalPages: 2,
            hasMore: false,
        });
    });

    it('falls back to default pagination values when filters omit them', async () => {
        const countQuery = createCountQuery({ count: '0' });
        const dataQuery = createDataQuery([]);
        const dbClient = {
            selectFrom: vi.fn().mockReturnValueOnce(countQuery).mockReturnValueOnce(dataQuery),
        } as any;

        const result = await getQuestionBankCollectionsData({
            dbClient,
            institutionId: 'inst-1',
            userId: 'viewer-1',
            filters: {} as any,
        });

        expect(dataQuery.limit).toHaveBeenCalledWith(20);
        expect(dataQuery.offset).toHaveBeenCalledWith(0);
        expect(result.page).toBe(1);
        expect(result.pageSize).toBe(20);
        expect(result.totalPages).toBe(0);
        expect(result.hasMore).toBe(false);
    });
});
