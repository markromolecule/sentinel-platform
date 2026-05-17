import { type DbClient } from '@sentinel/db';
import {
    type GenericOperation,
    mapGenericOperationToActionType,
    notifyInstitutionActivity,
} from './activity-notification-base.service';

export class GenericActivityNotificationService {
    static async notifyGenericInstitutionActivity(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        operation: GenericOperation;
        targetType: string;
        targetId?: string | null;
        targetLabel: string;
        title: string;
        message: string;
        sourceModule: string;
        sourceAction: string;
        metadata?: Record<string, unknown> | null;
        isAdminOverride?: boolean;
    }) {
        await notifyInstitutionActivity({
            dbClient: args.dbClient,
            actorUserId: args.actorUserId,
            institutionId: args.institutionId,
            permissionKey: 'notifications:view',
            actionType: mapGenericOperationToActionType(args.operation),
            resourceType: 'INSTITUTION_ACTIVITY',
            resourceId: args.targetId ?? null,
            resourceLabel: args.targetLabel,
            metadata: args.metadata ?? null,
            title: args.title,
            message: args.message,
            sourceModule: args.sourceModule,
            sourceAction: args.sourceAction,
            targetType: args.targetType,
            operation: args.operation,
            isAdminOverride: args.isAdminOverride,
        });
    }
}
