import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { deleteInstitutionsData } from '../data/delete-institutions';

/**
 * Bulk-deletes a list of institutions by their IDs.
 * Throws HTTP 409 if any of the institutions are referenced by other records.
 *
 * @param dbClient - The active database client.
 * @param ids - Array of institution UUIDs to delete.
 * @returns Result of the bulk delete operation.
 */
export async function deleteInstitutions(dbClient: DbClient, ids: string[]) {
    try {
        return await deleteInstitutionsData({ dbClient, ids });
    } catch (error: any) {
        const code = error?.code ?? error?.cause?.code;
        const message = error?.message ?? '';

        if (
            code === 'P2003' ||
            code === '23503' ||
            (code === 'P2010' && message.includes('23503'))
        ) {
            throw new HTTPException(409, {
                message:
                    'Cannot delete one or more institutions because they are currently in use.',
            });
        }
        throw error;
    }
}
