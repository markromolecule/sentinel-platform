import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { getInstitutionByIdData } from '../data/get-institution-by-id';
import { formatInstitution, type InstitutionKind } from './institution-formatter.service';

/**
 * Asserts that the given institution hierarchy configuration is valid,
 * throwing HTTP 400/404 exceptions for any constraint violations.
 *
 * @param dbClient - The active database client.
 * @param data - The institution kind and parent ID to validate.
 * @param existingInstitutionId - The ID of an institution being updated, to prevent self-parenting.
 */
export async function assertHierarchyConstraints(
    dbClient: DbClient,
    data: {
        institutionKind?: InstitutionKind;
        parentInstitutionId?: string | null;
    },
    existingInstitutionId?: string,
) {
    const { institutionKind, parentInstitutionId } = data;

    if (institutionKind === 'PARENT' && parentInstitutionId) {
        throw new HTTPException(400, {
            message: 'A parent institution cannot be assigned under another institution.',
        });
    }

    if (parentInstitutionId) {
        if (existingInstitutionId && parentInstitutionId === existingInstitutionId) {
            throw new HTTPException(400, {
                message: 'An institution cannot be its own parent.',
            });
        }

        const parentInstitution = await getInstitutionByIdData({
            dbClient,
            id: parentInstitutionId,
        });

        if (!parentInstitution) {
            throw new HTTPException(404, { message: 'Parent institution not found' });
        }

        if (parentInstitution.institution_kind === 'CHILD') {
            throw new HTTPException(400, {
                message: 'Branches cannot own child institutions.',
            });
        }
    }

    if (institutionKind === 'CHILD' && !parentInstitutionId) {
        throw new HTTPException(400, {
            message: 'A branch must be linked to a parent institution.',
        });
    }
}

/**
 * Returns a raw institution DB record by its ID.
 * Throws HTTP 404 if not found.
 *
 * @param dbClient - The active database client.
 * @param id - The institution UUID.
 * @returns The raw institution DB record.
 */
export async function getInstitutionByIdRaw(dbClient: DbClient, id: string) {
    const institution = await getInstitutionByIdData({ dbClient, id });

    if (!institution) {
        throw new HTTPException(404, { message: 'Institution not found' });
    }

    return institution;
}

export { formatInstitution };
