import { describe, expect, it, vi } from 'vitest';
import { getQuestionBankCollectionByIdData } from './get-question-bank-collection-by-id';

function createQuery(result: unknown = null) {
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
        executeTakeFirst: vi.fn(async () => result),
    };
    return query;
}

function makeExpressionBuilder() {
    const eb: any = (...args: unknown[]) => args;
    eb.or = (items: unknown[]) => items;
    eb.exists = (subquery: unknown) => subquery;
    eb.selectFrom = () => createQuery();
    return eb;
}

describe('getQuestionBankCollectionByIdData', () => {
    it('includes ownership and share visibility filters', async () => {
        const query = createQuery({
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
        });

        const dbClient = {
            selectFrom: vi.fn(() => query),
        } as any;

        const result = await getQuestionBankCollectionByIdData({
            dbClient,
            id: 'collection-1',
            institutionId: 'inst-1',
            userId: 'viewer-1',
        });

        expect(query.where).toHaveBeenCalled();
        expect(dbClient.selectFrom).toHaveBeenCalledWith('question_bank_collections as qbc');
        expect(result?.created_by).toBe('creator-1');
    });
});
