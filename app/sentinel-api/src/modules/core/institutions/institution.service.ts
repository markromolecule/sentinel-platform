import { getInstitutionsData } from './data/get-institutions';
import { createInstitutionData } from './data/create-institution';
import { updateInstitutionData } from './data/update-institution';
import { deleteInstitutionData } from './data/delete-institution';
import { deleteInstitutionsData } from './data/delete-institutions';
import { getInstitutionByIdData } from './data/get-institution-by-id';
import { getNamingConventionData } from './data/get-naming-convention';
import { saveNamingConventionData } from './data/save-naming-convention';
import { executeTransaction, type DbClient } from '@sentinel/db';
import {
    type CreateInstitutionBody,
    type SaveInstitutionNamingConventionBody,
    type UpdateInstitutionBody,
} from './institution.dto';
import { HTTPException } from 'hono/http-exception';
import { ActivityNotificationService } from '../../general/notification/services/activity-notification.service';

export type InstitutionKind = 'STANDALONE' | 'PARENT' | 'CHILD';

type NamingConventionRecord = {
    institution_naming_convention_id: string;
    institution_id: string;
    section_code_format: string | null;
    room_code_format: string | null;
    naming_rules: unknown;
};

export class InstitutionService {
    static async assertHierarchyConstraints(
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

    static formatNamingConvention(
        record: NamingConventionRecord,
        sourceInstitutionId: string,
        isInherited: boolean,
    ) {
        return {
            id: record.institution_naming_convention_id,
            institutionId: record.institution_id,
            roomCodeFormat: record.room_code_format,
            sectionCodeFormat: record.section_code_format,
            namingRules: record.naming_rules,
            sourceInstitutionId,
            isInherited,
        };
    }

    static mergeNamingRules(parentRules: unknown, childRules: unknown) {
        const parent = parentRules && typeof parentRules === 'object' ? parentRules : {};
        const child = childRules && typeof childRules === 'object' ? childRules : {};

        return {
            ...parent,
            ...child,
            room: {
                ...((parent as any).room ?? {}),
                ...((child as any).room ?? {}),
            },
            sectionRulesByCourseId: {
                ...((parent as any).sectionRulesByCourseId ?? {}),
                ...((child as any).sectionRulesByCourseId ?? {}),
            },
        };
    }

    static mergeNamingConventionRecords(
        childRecord: NamingConventionRecord,
        parentRecord?: NamingConventionRecord | null,
    ): NamingConventionRecord {
        if (!parentRecord) {
            return childRecord;
        }

        return {
            ...childRecord,
            room_code_format: childRecord.room_code_format ?? parentRecord.room_code_format,
            section_code_format:
                childRecord.section_code_format ?? parentRecord.section_code_format,
            naming_rules: this.mergeNamingRules(
                parentRecord.naming_rules,
                childRecord.naming_rules,
            ),
        };
    }

    static formatInstitution(inst: any) {
        return {
            id: inst.institution_id,
            name: inst.name,
            code: inst.code,
            parentInstitutionId: inst.parent_institution_id ?? null,
            institutionKind: inst.institution_kind ?? 'STANDALONE',
            createdAt: inst.created_at,
            createdBy: inst.creator_first_name
                ? `${inst.creator_first_name} ${inst.creator_last_name}`
                : inst.created_by,
            updatedAt: inst.updated_at,
            updatedBy: inst.updater_first_name
                ? `${inst.updater_first_name} ${inst.updater_last_name}`
                : inst.updated_by,
        };
    }

    static async getInstitutions(
        dbClient: DbClient,
        filters: {
            search?: string;
            parentInstitutionId?: string;
            institutionKind?: InstitutionKind;
        } = {},
    ) {
        const rawInstitutions = await getInstitutionsData({ dbClient, ...filters });
        return rawInstitutions.map((inst: any) => this.formatInstitution(inst));
    }

    static async getInstitutionById(dbClient: DbClient, id: string) {
        const institution = await getInstitutionByIdData({ dbClient, id });

        if (!institution) {
            throw new HTTPException(404, { message: 'Institution not found' });
        }

        return institution;
    }

    static async createInstitution(
        _dbClient: DbClient,
        data: CreateInstitutionBody,
        createdBy: string,
    ) {
        try {
            const createdInstitution = await executeTransaction(async (trx) => {
                const resolvedKind =
                    data.institutionKind ?? (data.parentInstitutionId ? 'CHILD' : 'STANDALONE');

                await this.assertHierarchyConstraints(trx, {
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
                    const savedNamingConvention = await this.saveNamingConvention(
                        trx,
                        rawInstitution.id,
                        data.namingConventions,
                        createdBy,
                    );
                    namingConventions = savedNamingConvention;
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
                    ...this.formatInstitution(fullInstitution),
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

    static async updateInstitution(
        dbClient: DbClient,
        id: string,
        data: UpdateInstitutionBody,
        updatedBy: string,
    ) {
        try {
            const currentInstitution = await getInstitutionByIdData({ dbClient, id });

            if (!currentInstitution) {
                throw new HTTPException(404, { message: 'Institution not found' });
            }

            const resolvedKind =
                data.institutionKind ??
                (currentInstitution.institution_kind as InstitutionKind | undefined) ??
                (data.parentInstitutionId || currentInstitution.parent_institution_id
                    ? 'CHILD'
                    : 'STANDALONE');
            const resolvedParentInstitutionId =
                data.parentInstitutionId !== undefined
                    ? data.parentInstitutionId
                    : (currentInstitution.parent_institution_id ?? null);

            await this.assertHierarchyConstraints(
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
                await this.saveNamingConvention(dbClient, id, data.namingConventions, updatedBy);
            }

            // Fetch full record with names
            const fullInstitution = await getInstitutionByIdData({
                dbClient,
                id,
            });

            if (!fullInstitution) {
                throw new HTTPException(404, { message: 'Institution not found after update' });
            }

            const institution = this.formatInstitution(fullInstitution);

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

    static async deleteInstitution(dbClient: DbClient, id: string, actorUserId?: string) {
        try {
            const deletedInstitution = await deleteInstitutionData({
                dbClient,
                id,
            });

            if (actorUserId) {
                await ActivityNotificationService.notifySupportInstitutionOperationCompleted({
                    dbClient,
                    actorUserId,
                    institutionId: deletedInstitution.id,
                    institutionRecordId: deletedInstitution.id,
                    institutionLabel: deletedInstitution.name,
                    operation: 'DELETED',
                });
            }

            return deletedInstitution;
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            const message = error?.message ?? '';
            if (
                code === 'P2003' ||
                code === '23503' ||
                (code === 'P2010' && message.includes('23503'))
            ) {
                throw new HTTPException(409, {
                    message: 'Cannot delete institution because it is being used.',
                });
            }
            if (error.name === 'NotFoundError') {
                throw new HTTPException(404, { message: 'Institution not found' });
            }
            throw error;
        }
    }

    static async deleteInstitutions(dbClient: DbClient, ids: string[]) {
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

    static async saveNamingConvention(
        dbClient: DbClient,
        institutionId: string,
        data: SaveInstitutionNamingConventionBody,
        userId?: string | null,
    ) {
        const institution = await getInstitutionByIdData({ dbClient, id: institutionId });

        if (!institution) {
            throw new HTTPException(404, { message: 'Institution not found' });
        }

        const record = await saveNamingConventionData({
            dbClient,
            values: {
                institution_id: institutionId,
                room_code_format: data.roomCodeFormat ?? null,
                section_code_format: data.sectionCodeFormat ?? null,
                naming_rules: data.namingRules,
                created_by: userId ?? null,
                updated_by: userId ?? null,
            },
        });

        return this.formatNamingConvention(
            record as unknown as NamingConventionRecord,
            institutionId,
            false,
        );
    }

    static async getEffectiveNamingConvention(dbClient: DbClient, institutionId: string) {
        const institution = await getInstitutionByIdData({ dbClient, id: institutionId });

        if (!institution) {
            throw new HTTPException(404, { message: 'Institution not found' });
        }

        const localRecord = await getNamingConventionData({ dbClient, institutionId });
        const parentInstitutionId = institution.parent_institution_id ?? null;
        const parentRecord = parentInstitutionId
            ? await getNamingConventionData({ dbClient, institutionId: parentInstitutionId })
            : null;

        if (localRecord) {
            const effectiveRecord = this.mergeNamingConventionRecords(localRecord, parentRecord);
            return this.formatNamingConvention(effectiveRecord, localRecord.institution_id, false);
        }

        if (parentRecord) {
            return this.formatNamingConvention(parentRecord, parentRecord.institution_id, true);
        }

        return null;
    }
}
