import { getDepartmentsData } from './data/get-departments';
import { createDepartmentData } from './data/create-department';
import { updateDepartmentData } from './data/update-department';
import { deleteDepartmentData } from './data/delete-department';
import { deleteDepartmentsData } from './data/delete-departments';
import { type DbClient } from '@sentinel/db';
import { type CreateDepartmentBody, type UpdateDepartmentBody } from './departments.dto';
import { HTTPException } from 'hono/http-exception';
import { loadEffectiveRows } from '../inheritance/effective-row-loader';
import {
    hideInheritedRecord,
    upsertInheritedOverride,
} from '../inheritance/inheritable-write-helper';

const DEPARTMENT_INHERITANCE_CONFIG = {
    table: 'departments',
    idColumn: 'department_id',
    copyColumns: ['department_name', 'department_code', 'created_by', 'updated_by'],
};

export class DepartmentService {
    private static async getInstitutionName(dbClient: DbClient, institutionId?: string | null) {
        if (!institutionId) {
            return null;
        }

        const institution = await dbClient
            .selectFrom('institutions')
            .select('name')
            .where('id', '=', institutionId)
            .executeTakeFirst();

        return institution?.name ?? null;
    }

    static async getDepartments(dbClient: DbClient, institutionId?: string, search?: string) {
        const rawDepartments = await loadEffectiveRows<any>({
            dbClient,
            institutionId,
            idKey: 'department_id',
            loadRows: (scopeInstitutionId) =>
                getDepartmentsData({ dbClient, institutionId: scopeInstitutionId, search }),
        });

        return rawDepartments.map((department: any) => ({
            institution_id: department.institution_id,
            institution_name: department.institution_name ?? null,
            department_id: department.department_id,
            department_name: department.department_name,
            department_code: department.department_code,
            source_record_id: department.sourceRecordId,
            inheritance_status: department.inheritanceStatus,
            origin_institution_id: department.originInstitutionId,
            effective_institution_id: department.effectiveInstitutionId,
            is_local: department.isLocal,
            is_inherited: department.isInherited,
            is_overridden: department.isOverridden,
            is_hidden: department.isHidden,
            isLocal: department.isLocal,
            isInherited: department.isInherited,
            isOverridden: department.isOverridden,
            isHidden: department.isHidden,
            created_at: department.created_at,
            created_by: department.creator_first_name
                ? `${department.creator_first_name} ${department.creator_last_name}`
                : department.created_by,
            updated_at: department.updated_at,
            updated_by: department.updater_first_name
                ? `${department.updater_first_name} ${department.updater_last_name}`
                : department.updated_by,
        }));
    }

    static async createDepartment(
        dbClient: DbClient,
        data: CreateDepartmentBody,
        createdBy: string,
        institutionId?: string,
    ) {
        const targetInstitutionId =
            institutionId && institutionId !== '' ? institutionId : data.institution_id;

        if (!targetInstitutionId || targetInstitutionId === '') {
            console.error(
                `Attempted to create department for user ${createdBy} without an institutionId`,
            );
            throw new HTTPException(403, {
                message:
                    'Your account is not associated with an institution. Please contact your administrator.',
            });
        }

        try {
            const rawDepartment = await createDepartmentData({
                dbClient,
                values: {
                    department_name: data.name,
                    department_code: data.code ?? null,
                    created_by: createdBy,
                    institution_id: targetInstitutionId,
                },
            });

            const institutionName = await this.getInstitutionName(
                dbClient,
                rawDepartment.institution_id,
            );

            return {
                institution_id: rawDepartment.institution_id,
                institution_name: institutionName,
                department_id: rawDepartment.department_id,
                department_name: rawDepartment.department_name,
                department_code: rawDepartment.department_code,
                created_at: rawDepartment.created_at,
                created_by: rawDepartment.created_by,
                updated_at: rawDepartment.updated_at,
                updated_by: rawDepartment.updated_by,
            };
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            const message = error?.message || '';

            if (
                code === 'P2002' ||
                code === '23505' ||
                (code === 'P2010' && message.includes('23505'))
            ) {
                throw new HTTPException(409, {
                    message:
                        'Department already exists with this name in the selected institution.',
                });
            }
            throw error;
        }
    }

    static async updateDepartment(
        dbClient: DbClient,
        id: string,
        data: UpdateDepartmentBody,
        updatedBy: string,
        institutionId?: string,
    ) {
        const currentScopeInstitutionId = institutionId;
        const targetInstitutionId =
            institutionId && institutionId !== '' ? institutionId : data.institution_id;

        if (!targetInstitutionId || targetInstitutionId === '') {
            console.error(
                `Attempted to update department ${id} for user ${updatedBy} without an institutionId`,
            );
            throw new HTTPException(403, {
                message:
                    'Your account is not associated with an institution. Please contact your administrator.',
            });
        }

        try {
            const overrideDepartment = await upsertInheritedOverride({
                dbClient,
                config: DEPARTMENT_INHERITANCE_CONFIG,
                id,
                institutionId:
                    currentScopeInstitutionId && currentScopeInstitutionId !== ''
                        ? currentScopeInstitutionId
                        : targetInstitutionId,
                actorId: updatedBy,
                values: {
                    ...(data.name !== undefined ? { department_name: data.name } : {}),
                    ...(data.code !== undefined ? { department_code: data.code } : {}),
                    updated_by: updatedBy,
                    updated_at: new Date(),
                },
            });

            if (overrideDepartment) {
                const institutionName = await this.getInstitutionName(
                    dbClient,
                    overrideDepartment.institution_id,
                );

                return {
                    institution_id: overrideDepartment.institution_id,
                    institution_name: institutionName,
                    department_id: overrideDepartment.department_id,
                    department_name: overrideDepartment.department_name,
                    department_code: overrideDepartment.department_code,
                    created_at: overrideDepartment.created_at,
                    created_by: overrideDepartment.created_by,
                    updated_at: overrideDepartment.updated_at,
                    updated_by: overrideDepartment.updated_by,
                };
            }

            const rawDepartment = await updateDepartmentData({
                dbClient,
                id,
                values: {
                    ...(data.name !== undefined ? { department_name: data.name } : {}),
                    ...(data.code !== undefined ? { department_code: data.code } : {}),
                    ...(targetInstitutionId !== undefined
                        ? { institution_id: targetInstitutionId }
                        : {}),
                    updated_by: updatedBy,
                    updated_at: new Date().toISOString(),
                },
                institutionId:
                    currentScopeInstitutionId && currentScopeInstitutionId !== ''
                        ? currentScopeInstitutionId
                        : targetInstitutionId,
            });

            const institutionName = await this.getInstitutionName(
                dbClient,
                rawDepartment.institution_id,
            );

            return {
                institution_id: rawDepartment.institution_id,
                institution_name: institutionName,
                department_id: rawDepartment.department_id,
                department_name: rawDepartment.department_name,
                department_code: rawDepartment.department_code,
                created_at: rawDepartment.created_at,
                created_by: rawDepartment.created_by,
                updated_at: rawDepartment.updated_at,
                updated_by: rawDepartment.updated_by,
            };
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            if (code === 'P2002' || code === '23505') {
                throw new HTTPException(409, { message: 'Department name already exists' });
            }
            if (error.name === 'NotFoundError') {
                throw new HTTPException(404, { message: 'Department not found' });
            }
            throw error;
        }
    }

    static async deleteDepartment(
        dbClient: DbClient,
        id: string,
        deletedBy: string,
        institutionId?: string,
    ) {
        if (institutionId === '') {
            console.error(
                `Attempted to delete department ${id} for user ${deletedBy} without an institutionId`,
            );
            throw new HTTPException(403, {
                message:
                    'Your account is not associated with an institution. Please contact your administrator.',
            });
        }

        try {
            const hiddenDepartment = await hideInheritedRecord({
                dbClient,
                config: DEPARTMENT_INHERITANCE_CONFIG,
                id,
                institutionId,
                actorId: deletedBy,
            });

            if (hiddenDepartment) {
                return hiddenDepartment;
            }

            return await deleteDepartmentData({ dbClient, id, institutionId });
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            const message = error?.message ?? '';
            if (
                code === 'P2003' ||
                code === '23503' ||
                (code === 'P2010' && message.includes('23503'))
            ) {
                throw new HTTPException(409, {
                    message: 'Cannot delete department because it is being used.',
                });
            }
            if (error.name === 'NotFoundError') {
                throw new HTTPException(404, { message: 'Department not found' });
            }
            throw error;
        }
    }

    static async deleteDepartments(dbClient: DbClient, ids: string[], institutionId?: string) {
        try {
            return await deleteDepartmentsData({ dbClient, ids, institutionId });
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
                        'Cannot delete one or more departments because they are currently in use.',
                });
            }
            throw error;
        }
    }
}
