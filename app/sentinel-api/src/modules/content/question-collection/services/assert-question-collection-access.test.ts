import { describe, expect, it, vi } from 'vitest';
import { HTTPException } from 'hono/http-exception';
import { assertCollectionAccess } from './assert-question-collection-access';

function createQuery(result: unknown) {
    const query: any = {
        select: vi.fn(() => query),
        where: vi.fn(() => query),
        executeTakeFirst: vi.fn(async () => result),
    };

    return query;
}

function createDbClient(collectionResult: unknown, shareResult: unknown) {
    const collectionQuery = createQuery(collectionResult);
    const shareQuery = createQuery(shareResult);

    return {
        selectFrom: vi.fn((table: string) => {
            if (table === 'question_bank_collections') {
                return collectionQuery;
            }

            if (table === 'question_bank_collection_shares') {
                return shareQuery;
            }

            throw new Error(`Unexpected table: ${table}`);
        }),
    } as any;
}

describe('assertCollectionAccess', () => {
    it('allows the creator to perform any action', async () => {
        const dbClient = createDbClient(
            { created_by: 'user-1', is_public: false },
            null,
        );

        await expect(
            assertCollectionAccess({
                dbClient,
                collectionId: 'collection-1',
                userId: 'user-1',
                action: 'delete',
            }),
        ).resolves.toBeUndefined();
    });

    it('rejects non-creators from deleting or sharing', async () => {
        const dbClient = createDbClient(
            { created_by: 'user-2', is_public: false },
            null,
        );

        await expect(
            assertCollectionAccess({
                dbClient,
                collectionId: 'collection-1',
                userId: 'user-1',
                action: 'delete',
            }),
        ).rejects.toBeInstanceOf(HTTPException);
    });

    it('allows shared users to view and edit private collections', async () => {
        const dbClient = createDbClient(
            { created_by: 'user-2', is_public: false },
            { user_id: 'user-1' },
        );

        await expect(
            assertCollectionAccess({
                dbClient,
                collectionId: 'collection-1',
                userId: 'user-1',
                action: 'edit',
            }),
        ).resolves.toBeUndefined();
    });

    it('allows public users to view but not edit collections', async () => {
        const dbClient = createDbClient(
            { created_by: 'user-2', is_public: true },
            null,
        );

        await expect(
            assertCollectionAccess({
                dbClient,
                collectionId: 'collection-1',
                userId: 'user-1',
                action: 'view',
            }),
        ).resolves.toBeUndefined();

        await expect(
            assertCollectionAccess({
                dbClient,
                collectionId: 'collection-1',
                userId: 'user-1',
                action: 'edit',
            }),
        ).rejects.toBeInstanceOf(HTTPException);
    });
});
