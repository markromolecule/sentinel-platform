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
import { ActivityNotificationService } from '../../general/notification/services/activity-notification.service';

const DEPARTMENT_INHERITANCE_CONFIG = {
    table: 'departments',
    idColumn: 'department_id',
    copyColumns: ['department_name', 'department_code', 'created_by', 'updated_by'],
};

function buildDepartmentLabel(name: string | null | undefined, code: string | null | undefined) {
    if (code && name) {
        return `${code} - ${name}`;
    }

    return name || code || 'Department';
}

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
            const department = {
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
            const departmentLabel = buildDepartmentLabel(
                rawDepartment.department_name,
                rawDepartment.department_code,
            );
            await ActivityNotificationService.notifyGenericInstitutionActivity({
                dbClient,
                actorUserId: createdBy,
                institutionId: targetInstitutionId,
                operation: 'CREATED',
                targetType: 'DEPARTMENT',
                targetId: rawDepartment.department_id,
                targetLabel: departmentLabel,
                title: 'Department created',
                message: `A department was created: "${departmentLabel}".`,
                sourceModule: 'departments',
                sourceAction: 'create',
                metadata: {
                    departmentId: rawDepartment.department_id,
                },
            });

            return department;
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

    /**
     * Creates multiple departments in a single transaction.
     * Enforces institution scoping for non-support roles and logs the activity.
     * 
     * @param dbClient - The database client instance
     * @param data - The bulk creation payload containing department details
     * @param createdBy - The user ID of the creator
     * @param institutionId - Optional institution ID to override the payload's value (enforced for non-support)
     * @returns A promise resolving to the created departments
     * @throws {HTTPException} 403 if institution is missing, 409 if conflict detected
     */
    static async bulkCreateDepartments(
        dbClient: DbClient,
        data: CreateBulkDepartmentsBody,
        createdBy: string,
        institutionId?: string,
    ) {
        const targetInstitutionId =
            institutionId && institutionId !== '' ? institutionId : null;

        if (!targetInstitutionId) {
            throw new HTTPException(403, {
                message:
                    'Your account is not associated with an institution. Please contact your administrator.',
            });
        }

        try {
            const { createBulkDepartmentsData } = await import(
                './data/create-bulk-departments'
            );

            const rawDepartments = await createBulkDepartmentsData({
                dbClient,
                values: data.departments.map((d) => ({
                    department_name: d.name,
                    department_code: d.code ?? null,
                    created_by: createdBy,
                    institution_id: targetInstitutionId,
                })),
            });

            const departments = rawDepartments.map((raw) => ({
                institution_id: raw.institution_id,
                institution_name: null, // Optimization: skip fetching names for bulk
                department_id: raw.department_id,
                department_name: raw.department_name,
                department_code: raw.department_code,
                created_at: raw.created_at,
                created_by: raw.created_by,
                updated_at: raw.updated_at,
                updated_by: raw.updated_by,
            }));

            if (departments.length > 0) {
                const label = `${departments.length} department${departments.length === 1 ? '' : 's'}`;
                await ActivityNotificationService.notifyGenericInstitutionActivity({
                    dbClient,
                    actorUserId: createdBy,
                    institutionId: targetInstitutionId,
                    operation: 'CREATED',
                    targetType: 'DEPARTMENT',
                    targetLabel: label,
                    title: 'Departments bulk created',
                    message: `${label} were created via bulk upload.`,
                    sourceModule: 'departments',
                    sourceAction: 'bulk-create',
                    metadata: {
                        departmentIds: departments.map((d) => d.department_id),
                        count: departments.length,
                        bulk: true,
                    },
                });
            }

            return departments;
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            const message = error?.message || '';

            if (
                code === 'P2002' ||
                code === '23505' ||
                (code === 'P2010' && message.includes('23505'))
            ) {
                throw new HTTPException(409, {
                    message: 'One or more departments already exist with the same name.',
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
            const department = {
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
            const departmentLabel = buildDepartmentLabel(
                rawDepartment.department_name,
                rawDepartment.department_code,
            );
            await ActivityNotificationService.notifyGenericInstitutionActivity({
                dbClient,
                actorUserId: updatedBy,
                institutionId:
                    currentScopeInstitutionId && currentScopeInstitutionId !== ''
                        ? currentScopeInstitutionId
                        : targetInstitutionId,
                operation: 'UPDATED',
                targetType: 'DEPARTMENT',
                targetId: rawDepartment.department_id,
                targetLabel: departmentLabel,
                title: 'Department updated',
                message: `A department was updated: "${departmentLabel}".`,
                sourceModule: 'departments',
                sourceAction: 'update',
                metadata: {
                    departmentId: rawDepartment.department_id,
                },
            });

            return department;
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
                if (institutionId) {
                    const departmentLabel = buildDepartmentLabel(
                        hiddenDepartment.department_name,
                        hiddenDepartment.department_code,
                    );
                    await ActivityNotificationService.notifyGenericInstitutionActivity({
                        dbClient,
                        actorUserId: deletedBy,
                        institutionId,
                        operation: 'OVERRIDE_COMPLETED',
                        targetType: 'DEPARTMENT',
                        targetId: hiddenDepartment.department_id,
                        targetLabel: departmentLabel,
                        title: 'Department override applied',
                        message: `A department override was applied to "${departmentLabel}".`,
                        sourceModule: 'departments',
                        sourceAction: 'hide-inherited',
                        isAdminOverride: true,
                        metadata: {
                            departmentId: hiddenDepartment.department_id,
                        },
                    });
                }
                return hiddenDepartment;
            }

            const deletedDepartment = await deleteDepartmentData({ dbClient, id, institutionId });

            if (institutionId) {
                const departmentLabel = buildDepartmentLabel(
                    deletedDepartment.department_name,
                    deletedDepartment.department_code,
                );
                await ActivityNotificationService.notifyGenericInstitutionActivity({
                    dbClient,
                    actorUserId: deletedBy,
                    institutionId,
                    operation: 'DELETED',
                    targetType: 'DEPARTMENT',
                    targetId: deletedDepartment.department_id,
                    targetLabel: departmentLabel,
                    title: 'Department deleted',
                    message: `A department was deleted: "${departmentLabel}".`,
                    sourceModule: 'departments',
                    sourceAction: 'delete',
                    metadata: {
                        departmentId: deletedDepartment.department_id,
                    },
                });
            }

            return deletedDepartment;
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

    static async deleteDepartments(
        dbClient: DbClient,
        ids: string[],
        institutionId?: string,
        actorUserId?: string,
    ) {
        try {
            const deletedDepartments = await deleteDepartmentsData({
                dbClient,
                ids,
                institutionId,
            });

            if (actorUserId && institutionId && deletedDepartments.length > 0) {
                const label = `${deletedDepartments.length} department${deletedDepartments.length === 1 ? '' : 's'}`;
                await ActivityNotificationService.notifyGenericInstitutionActivity({
                    dbClient,
                    actorUserId,
                    institutionId,
                    operation: 'DELETED',
                    targetType: 'DEPARTMENT',
                    targetLabel: label,
                    title: 'Departments deleted',
                    message: `${label} were deleted.`,
                    sourceModule: 'departments',
                    sourceAction: 'bulk-delete',
                    metadata: {
                        departmentIds: deletedDepartments.map(
                            (department) => department.department_id,
                        ),
                        count: deletedDepartments.length,
                        bulk: true,
                    },
                });
            }

            return deletedDepartments;
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
