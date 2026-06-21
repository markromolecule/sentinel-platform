import { type DbClient } from '@sentinel/db';
import { type UpdateDepartmentBody } from '../departments.dto';
import { updateDepartmentData } from '../data/update-department';
import { HTTPException } from 'hono/http-exception';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { upsertInheritedOverride } from '../../inheritance/inheritable-write-helper';
import {
    buildDepartmentLabel,
    getInstitutionName,
    DEPARTMENT_INHERITANCE_CONFIG,
} from './_utils';

export type UpdateDepartmentServiceArgs = {
    dbClient: DbClient;
    id: string;
    data: UpdateDepartmentBody;
    updatedBy: string;
    institutionId?: string;
};

/**
 * Updates a department's properties or creates an override if inherited.
 */
export async function updateDepartmentService({
    dbClient,
    id,
    data,
    updatedBy,
    institutionId,
}: UpdateDepartmentServiceArgs) {
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
            const institutionName = await getInstitutionName(
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

        const institutionName = await getInstitutionName(
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
