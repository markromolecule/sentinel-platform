import { type DbClient } from '@sentinel/db';
import { deleteDepartmentData } from '../data/delete-department';
import { HTTPException } from 'hono/http-exception';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { hideInheritedRecord } from '../../inheritance/inheritable-write-helper';
import { buildDepartmentLabel, DEPARTMENT_INHERITANCE_CONFIG } from './_utils';

export type DeleteDepartmentServiceArgs = {
    dbClient: DbClient;
    id: string;
    deletedBy: string;
    institutionId?: string;
};

/**
 * Deletes a department record or hides it (marks as hidden) if inherited.
 */
export async function deleteDepartmentService({
    dbClient,
    id,
    deletedBy,
    institutionId,
}: DeleteDepartmentServiceArgs) {
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
