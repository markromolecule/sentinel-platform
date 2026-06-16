import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
    getQuestionCollectionSharesRouteHandler,
    shareQuestionCollectionRouteHandler,
} from './share-question-collection.controller';
import { assertCollectionAccess } from '../services/assert-question-collection-access';
import { executeTransaction } from '@sentinel/db';
import { QuestionBankCollectionNotificationService } from '../../../general/notification/services/question-bank-collection-notification.service';

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

vi.mock('../../../general/notification/services/question-bank-collection-notification.service', () => ({
    QuestionBankCollectionNotificationService: {
        notifyQuestionBankCollectionAssigned: vi.fn(),
    },
}));

function createQuery(result: unknown) {
    const query: any = {
        innerJoin: vi.fn(() => query),
        select: vi.fn(() => query),
        where: vi.fn(() => query),
        orderBy: vi.fn(() => query),
        execute: vi.fn(async () => result),
        executeTakeFirstOrThrow: vi.fn(async () => (Array.isArray(result) ? result[0] : result)),
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
                return { id: 'creator-1', name: 'Jordan Instructor' };
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
        vi.clearAllMocks();
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
        let qcsCallCount = 0;
        mockDbClient = {
            selectFrom: vi.fn((table: string) => {
                if (table === 'question_bank_collections') {
                    return createQuery([]);
                }

                if (table === 'question_bank_collection_shares as qcs') {
                    qcsCallCount += 1;
                    return createQuery(responseRows);
                }

                return createQuery([]);
            }),
        };

        const c = createContext({ params: { id: 'collection-1' } });
        const result = await getQuestionCollectionSharesRouteHandler(c, vi.fn());

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

    it('replaces the share list and notifies newly added users', async () => {
        const collectionQuery = createQuery([
            {
                collection_id: 'collection-1',
                name: 'Physics Practice Set',
            },
        ]);
        const existingSharesQuery = createQuery([{ user_id: 'user-1' }]);
        const deleteQuery = createQuery([]);
        const insertQuery = createQuery([]);
        const filteredUsers = [
            {
                user_id: 'user-1',
            },
            {
                user_id: 'user-2',
            },
        ];
        const sharedUsers = [
            {
                user_id: 'user-1',
                first_name: 'Alice',
                last_name: 'Smith',
                email: 'alice@example.com',
            },
            {
                user_id: 'user-2',
                first_name: 'Bob',
                last_name: 'Taylor',
                email: 'bob@example.com',
            },
        ];
        let qcsCallCount = 0;
        mockTrx = {
            deleteFrom: vi.fn(() => deleteQuery),
            insertInto: vi.fn(() => insertQuery),
        };

        mockDbClient = {
            selectFrom: vi.fn((table: string) => {
                if (table === 'question_bank_collections') {
                    return collectionQuery;
                }

                if (table === 'question_bank_collection_shares as qcs') {
                    qcsCallCount += 1;
                    if (qcsCallCount === 1) {
                        return existingSharesQuery;
                    }

                    return createQuery(sharedUsers);
                }

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

                return createQuery([]);
            }),
            insertInto: vi.fn(() => insertQuery),
            deleteFrom: vi.fn(() => deleteQuery),
        };

        deleteQuery.where.mockReturnValue(deleteQuery);
        deleteQuery.execute.mockResolvedValue([]);
        insertQuery.values.mockReturnValue(insertQuery);
        insertQuery.execute.mockResolvedValue([]);

        const c = createContext({
            params: { id: 'collection-1' },
            json: { userIds: ['user-1', 'user-2'] },
        });

        const result = await shareQuestionCollectionRouteHandler(c, vi.fn());

        expect(assertCollectionAccess).toHaveBeenCalledWith({
            dbClient: mockDbClient,
            collectionId: 'collection-1',
            userId: 'creator-1',
            action: 'share',
        });
        expect(executeTransaction).toHaveBeenCalled();
        expect(QuestionBankCollectionNotificationService.notifyQuestionBankCollectionAssigned).toHaveBeenCalledTimes(1);
        expect(
            QuestionBankCollectionNotificationService.notifyQuestionBankCollectionAssigned,
        ).toHaveBeenCalledWith({
            dbClient: mockDbClient,
            recipientUserId: 'user-2',
            actorUserId: 'creator-1',
            institutionId: 'inst-1',
            collectionId: 'collection-1',
            collectionLabel: 'Physics Practice Set',
            assignerName: 'Jordan Instructor',
        });
        expect(result).toEqual({
            message: 'Collection shared successfully',
            data: sharedUsers,
        });
    });

    it('does not notify when users are removed from the share list', async () => {
        const collectionQuery = createQuery([
            {
                collection_id: 'collection-1',
                name: 'Physics Practice Set',
            },
        ]);
        const existingSharesQuery = createQuery([
            { user_id: 'user-1' },
            { user_id: 'user-2' },
        ]);
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
        let qcsCallCount = 0;
        mockTrx = {
            deleteFrom: vi.fn(() => deleteQuery),
            insertInto: vi.fn(() => insertQuery),
        };

        mockDbClient = {
            selectFrom: vi.fn((table: string) => {
                if (table === 'question_bank_collections') {
                    return collectionQuery;
                }

                if (table === 'question_bank_collection_shares as qcs') {
                    qcsCallCount += 1;
                    if (qcsCallCount === 1) {
                        return existingSharesQuery;
                    }

                    return createQuery(sharedUsers);
                }

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

                return createQuery([]);
            }),
            insertInto: vi.fn(() => insertQuery),
            deleteFrom: vi.fn(() => deleteQuery),
        };

        deleteQuery.where.mockReturnValue(deleteQuery);
        deleteQuery.execute.mockResolvedValue([]);
        insertQuery.values.mockReturnValue(insertQuery);
        insertQuery.execute.mockResolvedValue([]);

        const c = createContext({
            params: { id: 'collection-1' },
            json: { userIds: ['user-1'] },
        });

        const result = await shareQuestionCollectionRouteHandler(c, vi.fn());

        expect(QuestionBankCollectionNotificationService.notifyQuestionBankCollectionAssigned).not.toHaveBeenCalled();
        expect(result).toEqual({
            message: 'Collection shared successfully',
            data: sharedUsers,
        });
    });

    it('does not notify when the share transaction fails', async () => {
        const collectionQuery = createQuery([
            {
                collection_id: 'collection-1',
                name: 'Physics Practice Set',
            },
        ]);
        const existingSharesQuery = createQuery([{ user_id: 'user-1' }]);

        mockDbClient = {
            selectFrom: vi.fn((table: string) => {
                if (table === 'question_bank_collections') {
                    return collectionQuery;
                }

                if (table === 'question_bank_collection_shares as qcs') {
                    return existingSharesQuery;
                }

                if (table === 'user_profiles') {
                    const query = createQuery([{ user_id: 'user-1' }]);
                    query.select.mockReturnValue(query);
                    query.where.mockReturnValue(query);
                    return query;
                }

                return createQuery([]);
            }),
        };
        mockTrx = mockDbClient;

        vi.mocked(executeTransaction).mockRejectedValueOnce(new Error('transaction failed'));

        const c = createContext({
            params: { id: 'collection-1' },
            json: { userIds: ['user-1', 'user-2'] },
        });

        await expect(shareQuestionCollectionRouteHandler(c, vi.fn())).rejects.toThrow(
            'transaction failed',
        );
        expect(QuestionBankCollectionNotificationService.notifyQuestionBankCollectionAssigned).not.toHaveBeenCalled();
    });
});
