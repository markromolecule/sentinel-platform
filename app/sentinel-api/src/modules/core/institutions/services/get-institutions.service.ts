import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { getInstitutionsData } from '../data/get-institutions';
import { getInstitutionByIdData } from '../data/get-institution-by-id';
import { formatInstitution, type InstitutionKind } from './institution-formatter.service';
import { paginateItems } from '../../../../lib/pagination';

/**
 * Retrieves all institutions matching the given filter criteria.
 *
 * @param dbClient - The active database client.
 * @param filters - Optional search, parent, and kind filters.
 * @returns Array of formatted institution records.
 */
export async function getInstitutions(
    dbClient: DbClient,
    filters: {
        search?: string;
        parentInstitutionId?: string;
        institutionKind?: InstitutionKind;
        allowedIds?: string[];
    } = {},
    page?: number,
    pageSize?: number,
) {
    const rawInstitutions = await getInstitutionsData({ dbClient, ...filters });
    const scopedInstitutions = filters.allowedIds
        ? rawInstitutions.filter((institution: any) => filters.allowedIds?.includes(institution.id))
        : rawInstitutions;
    return paginateItems(
        scopedInstitutions.map((inst: any) => formatInstitution(inst)),
        page,
        pageSize,
    );
}

/**
 * Retrieves a single institution by its ID.
 * Throws HTTP 404 if not found.
 *
 * @param dbClient - The active database client.
 * @param id - The institution UUID.
 * @returns Raw institution DB record.
 */
export async function getInstitutionById(dbClient: DbClient, id: string) {
    const institution = await getInstitutionByIdData({ dbClient, id });

    if (!institution) {
        throw new HTTPException(404, { message: 'Institution not found' });
    }

    return institution;
}
