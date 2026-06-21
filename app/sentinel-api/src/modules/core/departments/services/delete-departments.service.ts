import { type DbClient } from '@sentinel/db';
import { deleteDepartmentsData } from '../data/delete-departments';
import { HTTPException } from 'hono/http-exception';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';

export type DeleteDepartmentsServiceArgs = {
    dbClient: DbClient;
    ids: string[];
    institutionId?: string;
    actorUserId?: string;
};

/**
 * Bulk deletes departments by IDs and logs the activity.
 */
export async function deleteDepartmentsService({
    dbClient,
    ids,
    institutionId,
    actorUserId,
}: DeleteDepartmentsServiceArgs) {
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
                    departmentIds: deletedDepartments.map((department) => department.department_id),
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
                message: 'Cannot delete one or more departments because they are currently in use.',
            });
        }
        throw error;
    }
}
