import { executeTransaction, type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { createInstitutionData } from '../data/create-institution';
import { getInstitutionByIdData } from '../data/get-institution-by-id';
import { type CreateInstitutionBody } from '../institution.dto';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { formatInstitution } from './institution-formatter.service';
import { assertHierarchyConstraints } from './institution-hierarchy-constraints.service';

/**
 * Saves a naming convention — injected to avoid a circular dependency with the
 * naming convention service (which itself validates institution existence).
 */
export type SaveNamingConventionFn = (
    trx: DbClient,
    institutionId: string,
    namingConventions: any,
    userId: string,
) => Promise<any>;

/**
 * Creates a new institution inside a transaction.
 * Optionally saves naming conventions within the same transaction.
 * Fires an activity notification after successful commit.
 *
 * @param _dbClient - The outer (non-transactional) client, used for post-commit notifications.
 * @param data - The institution creation payload.
 * @param createdBy - The user ID of the actor.
 * @param saveNamingConventionFn - Injected naming convention saver to avoid circular deps.
 * @returns Formatted institution record, including naming conventions if provided.
 */
export async function createInstitution(
    _dbClient: DbClient,
    data: CreateInstitutionBody,
    createdBy: string,
    saveNamingConventionFn: SaveNamingConventionFn,
) {
    try {
        const createdInstitution = await executeTransaction(async (trx) => {
            const resolvedKind =
                data.institutionKind ?? (data.parentInstitutionId ? 'CHILD' : 'STANDALONE');

            await assertHierarchyConstraints(trx, {
                institutionKind: resolvedKind,
                parentInstitutionId: data.parentInstitutionId ?? null,
            });

            const rawInstitution = await createInstitutionData({
                dbClient: trx,
                values: {
                    name: data.name,
                    code: data.code,
                    parent_institution_id: data.parentInstitutionId ?? null,
                    institution_kind: resolvedKind,
                    created_by: createdBy,
                },
            });

            let namingConventions = null;

            if (data.namingConventions) {
                namingConventions = await saveNamingConventionFn(
                    trx,
                    rawInstitution.id,
                    data.namingConventions,
                    createdBy,
                );
            }

            const fullInstitution = await getInstitutionByIdData({
                dbClient: trx,
                id: rawInstitution.id,
            });

            if (!fullInstitution) {
                throw new HTTPException(500, {
                    message: 'Failed to retrieve created institution',
                });
            }

            return {
                ...formatInstitution(fullInstitution),
                ...(namingConventions ? { namingConventions } : {}),
            };
        });

        if (createdBy) {
            await ActivityNotificationService.notifySupportInstitutionOperationCompleted({
                dbClient: _dbClient,
                actorUserId: createdBy,
                institutionId: createdInstitution.id,
                institutionRecordId: createdInstitution.id,
                institutionLabel: createdInstitution.name,
                operation: 'CREATED',
            });
        }

        return createdInstitution;
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
        throw error;
    }
}
