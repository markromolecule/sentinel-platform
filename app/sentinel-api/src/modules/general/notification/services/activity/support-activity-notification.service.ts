import { type DbClient } from '@sentinel/db';
import {
    getUserDisplayName,
    notifyInstitutionActivity,
} from './activity-notification-base.service';

export class SupportActivityNotificationService {
    static async notifySupportInstitutionOperationCompleted(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        institutionRecordId: string;
        institutionLabel: string;
        operation: 'CREATED' | 'UPDATED' | 'DELETED';
    }) {
        const actorName = await getUserDisplayName(args.dbClient, args.actorUserId);
        const operationLabel = args.operation.toLowerCase();

        await notifyInstitutionActivity({
            dbClient: args.dbClient,
            actorUserId: args.actorUserId,
            institutionId: args.institutionId,
            permissionKey: 'notifications:view',
            actionType: 'SUPPORT_OPERATION_COMPLETED',
            resourceType: 'SUPPORT_OPERATION',
            resourceId: args.institutionRecordId,
            resourceLabel: args.institutionLabel,
            roleNames: ['superadmin', 'admin'],
            metadata: {
                operation: args.operation,
                targetType: 'INSTITUTION',
                institutionId: args.institutionRecordId,
            },
            title: 'Support operation completed',
            message: `${actorName} ${operationLabel} institution "${args.institutionLabel}".`,
            sourceModule: 'institutions',
            sourceAction: args.operation.toLowerCase(),
            targetType: 'INSTITUTION',
            operation: args.operation,
        });
    }
}
