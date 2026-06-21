import { type DbClient } from '@sentinel/db';
import { type CreateBulkDepartmentsBody } from '../departments.dto';
import { createBulkDepartmentsData } from '../data/create-bulk-departments';
import { HTTPException } from 'hono/http-exception';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';

export type BulkCreateDepartmentsServiceArgs = {
    dbClient: DbClient;
    data: CreateBulkDepartmentsBody;
    createdBy: string;
    institutionId?: string;
};

/**
 * Creates multiple departments in a single transaction, enforcing institution scoping.
 */
export async function bulkCreateDepartmentsService({
    dbClient,
    data,
    createdBy,
    institutionId,
}: BulkCreateDepartmentsServiceArgs) {
    const targetInstitutionId = institutionId && institutionId !== '' ? institutionId : null;

    if (!targetInstitutionId) {
        throw new HTTPException(403, {
            message:
                'Your account is not associated with an institution. Please contact your administrator.',
        });
    }

    try {
        const rawDepartments = await createBulkDepartmentsData({
            dbClient,
            values: data.departments.map((d: any) => ({
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
