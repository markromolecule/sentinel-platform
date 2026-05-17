import { type DbClient } from '@sentinel/db';
import {
    getUserDisplayName,
    notifyInstitutionActivity,
} from './activity-notification-base.service';

export class SectionActivityNotificationService {
    static async notifySectionCreated(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        sectionId: string;
        sectionLabel: string;
    }) {
        const actorName = await getUserDisplayName(args.dbClient, args.actorUserId);

        await notifyInstitutionActivity({
            dbClient: args.dbClient,
            actorUserId: args.actorUserId,
            institutionId: args.institutionId,
            permissionKey: 'notifications:view',
            actionType: 'SECTION_CREATED',
            resourceType: 'SECTION',
            resourceId: args.sectionId,
            resourceLabel: args.sectionLabel,
            metadata: {
                sectionId: args.sectionId,
            },
            title: 'Section created',
            message: `${actorName} created section "${args.sectionLabel}".`,
            sourceModule: 'sections',
            sourceAction: 'create',
            targetType: 'SECTION',
            operation: 'CREATED',
        });
    }

    static async notifySectionsBulkCreated(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        count: number;
    }) {
        if (args.count <= 0) {
            return;
        }

        const actorName = await getUserDisplayName(args.dbClient, args.actorUserId);
        const resourceLabel = `${args.count} section${args.count === 1 ? '' : 's'}`;

        await notifyInstitutionActivity({
            dbClient: args.dbClient,
            actorUserId: args.actorUserId,
            institutionId: args.institutionId,
            permissionKey: 'notifications:view',
            actionType: 'SECTION_CREATED',
            resourceType: 'SECTION',
            resourceLabel,
            metadata: {
                count: args.count,
                bulk: true,
            },
            title: 'Sections created',
            message: `${actorName} created ${resourceLabel}.`,
            sourceModule: 'sections',
            sourceAction: 'bulk-create',
            targetType: 'SECTION',
            operation: 'CREATED',
        });
    }

    static async notifySectionUpdated(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        sectionId: string;
        sectionLabel: string;
    }) {
        const actorName = await getUserDisplayName(args.dbClient, args.actorUserId);

        await notifyInstitutionActivity({
            dbClient: args.dbClient,
            actorUserId: args.actorUserId,
            institutionId: args.institutionId,
            permissionKey: 'notifications:view',
            actionType: 'SECTION_UPDATED',
            resourceType: 'SECTION',
            resourceId: args.sectionId,
            resourceLabel: args.sectionLabel,
            metadata: {
                sectionId: args.sectionId,
            },
            title: 'Section updated',
            message: `${actorName} updated section "${args.sectionLabel}".`,
            sourceModule: 'sections',
            sourceAction: 'update',
            targetType: 'SECTION',
            operation: 'UPDATED',
        });
    }

    static async notifySectionDeleted(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        sectionId?: string | null;
        sectionLabel: string;
        bulk?: boolean;
        count?: number;
    }) {
        const actorName = await getUserDisplayName(args.dbClient, args.actorUserId);

        await notifyInstitutionActivity({
            dbClient: args.dbClient,
            actorUserId: args.actorUserId,
            institutionId: args.institutionId,
            permissionKey: 'notifications:view',
            actionType: 'SECTION_DELETED',
            resourceType: 'SECTION',
            resourceId: args.sectionId ?? null,
            resourceLabel: args.sectionLabel,
            metadata: {
                sectionId: args.sectionId ?? null,
                bulk: args.bulk ?? false,
                count: args.count ?? 1,
            },
            title: args.bulk ? 'Sections deleted' : 'Section deleted',
            message: args.bulk
                ? `${actorName} deleted ${args.sectionLabel}.`
                : `${actorName} deleted section "${args.sectionLabel}".`,
            sourceModule: 'sections',
            sourceAction: args.bulk ? 'bulk-delete' : 'delete',
            targetType: 'SECTION',
            operation: 'DELETED',
        });
    }
}
