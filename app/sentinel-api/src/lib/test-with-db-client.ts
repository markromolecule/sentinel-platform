import { type DbClient, prisma } from '@sentinel/db';
import { test } from 'vitest';

export const testWithDbClient = test.extend<{ dbClient: DbClient }>({
    dbClient: async ({}, use) => {
        await prisma
            .$transaction(async (tx) => {
                try {
                    await use(tx.$kysely);
                } finally {
                    throw new Error('ROLLBACK_FOR_TESTING');
                }
            })
            .catch((error: unknown) => {
                if (error instanceof Error && error.message === 'ROLLBACK_FOR_TESTING') {
                    return;
                }

                throw error;
            });
    },
});
