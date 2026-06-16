import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
    getQuestionCollectionSharesRouteHandler,
    shareQuestionCollectionRouteHandler,
} from './share-question-collection.controller';
import { assertCollectionAccess } from '../services/assert-question-collection-access';
import { executeTransaction } from '@sentinel/db';

let mockDbClient: any;
let mockTrx: any;

vi.mock('../services/assert-question-collection-access', () => ({
    assertCollectionAccess: vi.fn(),
}));

vi.mock('@sentinel/db', async () => {
    const actual = await vi.importActual<typeof import('@sentinel/db')>('@sentinel/db');
    return {
        ...actual,
        executeTransaction: vi.fn(async (callback: (trx: any) => Promise<unknown>) =>
            callback(mockTrx),
        ),
    };
});

function createQuery(result: unknown) {
    const query: any = {
        innerJoin: vi.fn(() => query),
        select: vi.fn(() => query),
        where: vi.fn(() => query),
        orderBy: vi.fn(() => query),
        execute: vi.fn(async () => result),
        deleteFrom: vi.fn(() => query),
        insertInto: vi.fn(() => query),
        values: vi.fn(() => query),
    };

    return query;
}

function createContext({
    params,
    json,
}: {
    params: Record<string, string>;
    json?: Record<string, unknown>;
}) {
    return {
        req: {
            valid: (type: string) => (type === 'param' ? params : json),
        },
        get: (key: string) => {
            if (key === 'dbClient') {
                return mockDbClient;
            }

            if (key === 'user') {
                return { id: 'creator-1' };
            }

            if (key === 'institutionId') {
                return 'inst-1';
            }

            return undefined;
        },
        json: vi.fn((payload: unknown) => payload),
    } as any;
}

describe('share question collection controller', () => {
    beforeEach(() => {
        vi.mocked(assertCollectionAccess).mockResolvedValue(undefined as never);
    });

    it('returns the shared users for a collection', async () => {
        const responseRows = [
            {
                user_id: 'user-1',
                first_name: 'Alice',
                last_name: 'Smith',
                email: 'alice@example.com',
            },
        ];
        mockDbClient = {
            selectFrom: vi.fn((table: string) => {
                if (table === 'question_bank_collection_shares as qcs') {
                    return createQuery(responseRows);
                }

                return createQuery([]);
            }),
        };
        mockTrx = mockDbClient;

        const c = createContext({ params: { id: 'collection-1' } });
        const result = await getQuestionCollectionSharesRouteHandler(c);

        expect(assertCollectionAccess).toHaveBeenCalledWith({
            dbClient: mockDbClient,
            collectionId: 'collection-1',
            userId: 'creator-1',
            action: 'view',
        });
        expect(result).toEqual({
            message: 'Shared users fetched successfully',
            data: responseRows,
        });
    });

    it('replaces the share list and filters users outside the institution', async () => {
        const deleteQuery = createQuery([]);
        const insertQuery = createQuery([]);
        const filteredUsers = [
            {
                user_id: 'user-1',
            },
        ];
        const sharedUsers = [
            {
                user_id: 'user-1',
                first_name: 'Alice',
                last_name: 'Smith',
                email: 'alice@example.com',
            },
        ];

        mockDbClient = {
            selectFrom: vi.fn((table: string) => {
                if (table === 'user_profiles') {
                    const query = createQuery(filteredUsers);
                    query.select.mockReturnValue(query);
                    query.where.mockReturnValue(query);
                    return query;
                }

                if (table === 'question_bank_collection_shares') {
                    const query = deleteQuery;
                    query.where.mockReturnValue(query);
                    query.execute.mockResolvedValueOnce([]);
                    return query;
                }

                if (table === 'question_bank_collection_shares as qcs') {
                    return createQuery(sharedUsers);
                }

                return createQuery([]);
            }),
            insertInto: vi.fn(() => insertQuery),
            deleteFrom: vi.fn(() => deleteQuery),
        };
        mockTrx = mockDbClient;

        deleteQuery.where.mockReturnValue(deleteQuery);
        deleteQuery.execute.mockResolvedValue([]);
        insertQuery.values.mockReturnValue(insertQuery);
        insertQuery.execute.mockResolvedValue([]);

        const c = createContext({
            params: { id: 'collection-1' },
            json: { userIds: ['user-1', 'user-2'] },
        });

        const result = await shareQuestionCollectionRouteHandler(c);

        expect(assertCollectionAccess).toHaveBeenCalledWith({
            dbClient: mockDbClient,
            collectionId: 'collection-1',
            userId: 'creator-1',
            action: 'share',
        });
        expect(executeTransaction).toHaveBeenCalled();
        expect(result).toEqual({
            message: 'Collection shared successfully',
            data: sharedUsers,
        });
    });
});
