import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { updateInstitutionData } from '../data/update-institution';
import { getInstitutionByIdData } from '../data/get-institution-by-id';
import { type UpdateInstitutionBody } from '../institution.dto';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { formatInstitution, type InstitutionKind } from './institution-formatter.service';
import { assertHierarchyConstraints } from './institution-hierarchy-constraints.service';

/**
 * Saves a naming convention — injected to avoid a circular dependency with the
 * naming convention service (which itself validates institution existence).
 */
export type SaveNamingConventionFn = (
    dbClient: DbClient,
    institutionId: string,
    namingConventions: any,
    userId: string,
) => Promise<any>;

/**
 * Updates an existing institution's fields and optionally its naming conventions.
 * Fires an activity notification on success.
 *
 * @param dbClient - The active database client.
 * @param id - The institution UUID to update.
 * @param data - The update payload.
 * @param updatedBy - The user ID of the actor.
 * @param saveNamingConventionFn - Injected naming convention saver to avoid circular deps.
 * @returns Formatted updated institution record.
 */
export async function updateInstitution(
    dbClient: DbClient,
    id: string,
    data: UpdateInstitutionBody,
    updatedBy: string,
    saveNamingConventionFn: SaveNamingConventionFn,
) {
    try {
        const currentInstitution = await getInstitutionByIdData({ dbClient, id });

        if (!currentInstitution) {
            throw new HTTPException(404, { message: 'Institution not found' });
        }

        const resolvedKind: InstitutionKind =
            data.institutionKind ??
            (currentInstitution.institution_kind as InstitutionKind | undefined) ??
            (data.parentInstitutionId || currentInstitution.parent_institution_id
                ? 'CHILD'
                : 'STANDALONE');

        const resolvedParentInstitutionId =
            data.parentInstitutionId !== undefined
                ? data.parentInstitutionId
                : (currentInstitution.parent_institution_id ?? null);

        await assertHierarchyConstraints(
            dbClient,
            {
                institutionKind: resolvedKind,
                parentInstitutionId: resolvedParentInstitutionId,
            },
            id,
        );

        await updateInstitutionData({
            dbClient,
            id,
            values: {
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.code !== undefined ? { code: data.code } : {}),
                ...(data.parentInstitutionId !== undefined
                    ? { parent_institution_id: data.parentInstitutionId }
                    : {}),
                ...(data.institutionKind !== undefined
                    ? { institution_kind: data.institutionKind }
                    : {}),
                updated_by: updatedBy,
                updated_at: new Date().toISOString(),
            },
        });

        if (data.namingConventions) {
            await saveNamingConventionFn(dbClient, id, data.namingConventions, updatedBy);
        }

        const fullInstitution = await getInstitutionByIdData({ dbClient, id });

        if (!fullInstitution) {
            throw new HTTPException(404, { message: 'Institution not found after update' });
        }

        const institution = formatInstitution(fullInstitution);

        await ActivityNotificationService.notifySupportInstitutionOperationCompleted({
            dbClient,
            actorUserId: updatedBy,
            institutionId: institution.id,
            institutionRecordId: institution.id,
            institutionLabel: institution.name,
            operation: 'UPDATED',
        });

        return institution;
    } catch (error: any) {
        const code = error?.code ?? error?.cause?.code;
        const message = error?.message || '';

        if (
            code === 'P2002' ||
            code === '23505' ||
            (code === 'P2010' && message.includes('23505'))
        ) {
            throw new HTTPException(409, {
                message: 'Institution already exists with this name.',
            });
        }
        if (error.name === 'NotFoundError') {
            throw new HTTPException(404, { message: 'Institution not found' });
        }
        throw error;
    }
}
