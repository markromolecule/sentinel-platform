import { type DbClient } from '@sentinel/db';
import { type CreateDepartmentBody } from '../departments.dto';
import { createDepartmentData } from '../data/create-department';
import { HTTPException } from 'hono/http-exception';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { buildDepartmentLabel, getInstitutionName } from './_utils';

export type CreateDepartmentServiceArgs = {
    dbClient: DbClient;
    data: CreateDepartmentBody;
    createdBy: string;
    institutionId?: string;
};

/**
 * Creates a new department, scopes it to the user's institution,
 * logs activity notification, and throws a 409 exception on conflicts.
 */
export async function createDepartmentService({
    dbClient,
    data,
    createdBy,
    institutionId,
}: CreateDepartmentServiceArgs) {
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

        const institutionName = await getInstitutionName(dbClient, rawDepartment.institution_id);
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
                message: 'Department already exists with this name in the selected institution.',
            });
        }
        throw error;
    }
}
