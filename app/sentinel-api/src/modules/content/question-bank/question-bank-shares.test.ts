import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenAPIHono } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import questionBankRoutes from './question-bank.route';
import { assertCollectionAccess } from '../question-collection/services/assert-question-collection-access';
import { executeTransaction } from '@sentinel/db';

let mockDbClient: any;
let mockTrx: any;

vi.mock('../../../middleware/auth', () => ({
    authMiddleware: async (_c: any, next: any) => {
        await next();
    },
}));

vi.mock('../question-collection/services/assert-question-collection-access', () => ({
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
        executeTakeFirstOrThrow: vi.fn(async () => (Array.isArray(result) ? result[0] : result)),
        deleteFrom: vi.fn(() => query),
        insertInto: vi.fn(() => query),
        values: vi.fn(() => query),
    };

    return query;
}

function createApp() {
    const app = new OpenAPIHono();

    app.use('*', async (c, next) => {
        c.set('dbClient', mockDbClient);
        c.set('user', { id: 'creator-1' } as any);
        c.set('institutionId', 'inst-1');
        c.set('supabaseUser', { user_metadata: { role: 'instructor' } } as any);
        await next();
    });

    app.route('/question-bank', questionBankRoutes);

    return app;
}

describe('question bank shares routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(assertCollectionAccess).mockResolvedValue(undefined as never);
    });

    it('serves shared users from /question-bank/collections/:id/shares', async () => {
        const sharedUsers = [
            {
                user_id: '11111111-1111-4111-8111-111111111111',
                first_name: 'Alice',
                last_name: 'Smith',
                email: 'alice@example.com',
            },
        ];

        mockDbClient = {
            selectFrom: vi.fn((table: string) => {
                if (table === 'question_bank_collection_shares as qcs') {
                    return createQuery(sharedUsers);
                }

                return createQuery([]);
            }),
        };

        const app = createApp();
        const res = await app.request(
            '/question-bank/collections/11111111-1111-4111-8111-111111111111/shares',
        );
        const payload = await res.json();

        expect(res.status).toBe(200);
        expect(assertCollectionAccess).toHaveBeenCalledWith({
            dbClient: mockDbClient,
            collectionId: '11111111-1111-4111-8111-111111111111',
            userId: 'creator-1',
            action: 'view',
        });
        expect(payload).toEqual({
            message: 'Shared users fetched successfully',
            data: sharedUsers,
        });
    });

    it('updates shares from /question-bank/collections/:id/shares', async () => {
        const filteredUsers = [{ user_id: 'user-1' }];
        const collectionRows = [
            {
                collection_id: '11111111-1111-4111-8111-111111111111',
                name: 'Physics Practice Set',
            },
        ];
        const sharedUsers = [
            {
                user_id: '11111111-1111-4111-8111-111111111111',
                first_name: 'Alice',
                last_name: 'Smith',
                email: 'alice@example.com',
            },
        ];
        const deleteQuery = createQuery([]);
        const insertQuery = createQuery([]);

        mockDbClient = {
            selectFrom: vi.fn((table: string) => {
                if (table === 'question_bank_collections') {
                    return createQuery(collectionRows);
                }

                if (table === 'user_profiles') {
                    const query = createQuery(filteredUsers);
                    query.select.mockReturnValue(query);
                    query.where.mockReturnValue(query);
                    return query;
                }

                if (table === 'question_bank_collection_shares as qcs') {
                    return createQuery(sharedUsers);
                }

                return createQuery([]);
            }),
            deleteFrom: vi.fn(() => deleteQuery),
            insertInto: vi.fn(() => insertQuery),
        };
        mockTrx = {
            deleteFrom: vi.fn(() => deleteQuery),
            insertInto: vi.fn(() => insertQuery),
        };

        deleteQuery.where.mockReturnValue(deleteQuery);
        deleteQuery.execute.mockResolvedValue([]);
        insertQuery.values.mockReturnValue(insertQuery);
        insertQuery.execute.mockResolvedValue([]);

        const app = createApp();
        const res = await app.request(
            '/question-bank/collections/11111111-1111-4111-8111-111111111111/shares',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userIds: [
                        '11111111-1111-4111-8111-111111111111',
                        '22222222-2222-4222-8222-222222222222',
                    ],
                }),
            },
        );
        const payload = await res.json();

        expect(res.status).toBe(200);
        expect(assertCollectionAccess).toHaveBeenCalledWith({
            dbClient: mockDbClient,
            collectionId: '11111111-1111-4111-8111-111111111111',
            userId: 'creator-1',
            action: 'share',
        });
        expect(executeTransaction).toHaveBeenCalled();
        expect(payload).toEqual({
            message: 'Collection shared successfully',
            data: sharedUsers,
        });
    });

    it('returns 403 when sharing is forbidden', async () => {
        vi.mocked(assertCollectionAccess).mockRejectedValueOnce(
            new HTTPException(403, { message: 'Forbidden' }),
        );

        mockDbClient = {
            selectFrom: vi.fn(() => createQuery([])),
        };

        const app = createApp();
        const res = await app.request(
            '/question-bank/collections/11111111-1111-4111-8111-111111111111/shares',
        );

        expect(res.status).toBe(403);
    });

    it('returns 404 when the collection does not exist', async () => {
        vi.mocked(assertCollectionAccess).mockRejectedValueOnce(
            new HTTPException(404, { message: 'Collection not found.' }),
        );

        mockDbClient = {
            selectFrom: vi.fn(() => createQuery([])),
        };

        const app = createApp();
        const res = await app.request(
            '/question-bank/collections/44444444-4444-4444-8444-444444444444/shares',
        );

        expect(res.status).toBe(404);
    });
});
