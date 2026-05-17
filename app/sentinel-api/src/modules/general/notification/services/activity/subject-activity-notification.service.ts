import { type DbClient } from '@sentinel/db';
import {
    getUserDisplayName,
    notifyInstitutionActivity,
} from './activity-notification-base.service';

export class SubjectActivityNotificationService {
    static async notifySubjectCreated(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        subjectId: string;
        subjectLabel: string;
    }) {
        const actorName = await getUserDisplayName(args.dbClient, args.actorUserId);

        await notifyInstitutionActivity({
            dbClient: args.dbClient,
            actorUserId: args.actorUserId,
            institutionId: args.institutionId,
            permissionKey: 'notifications:view',
            actionType: 'SUBJECT_CREATED',
            resourceType: 'SUBJECT',
            resourceId: args.subjectId,
            resourceLabel: args.subjectLabel,
            metadata: {
                subjectId: args.subjectId,
            },
            title: 'Subject created',
            message: `${actorName} created subject "${args.subjectLabel}".`,
            sourceModule: 'subjects',
            sourceAction: 'create',
            targetType: 'SUBJECT',
            operation: 'CREATED',
        });
    }

    static async notifySubjectUpdated(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        subjectId: string;
        subjectLabel: string;
    }) {
        const actorName = await getUserDisplayName(args.dbClient, args.actorUserId);

        await notifyInstitutionActivity({
            dbClient: args.dbClient,
            actorUserId: args.actorUserId,
            institutionId: args.institutionId,
            permissionKey: 'notifications:view',
            actionType: 'SUBJECT_UPDATED',
            resourceType: 'SUBJECT',
            resourceId: args.subjectId,
            resourceLabel: args.subjectLabel,
            metadata: {
                subjectId: args.subjectId,
            },
            title: 'Subject updated',
            message: `${actorName} updated subject "${args.subjectLabel}".`,
            sourceModule: 'subjects',
            sourceAction: 'update',
            targetType: 'SUBJECT',
            operation: 'UPDATED',
        });
    }

    static async notifySubjectDeleted(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        subjectId?: string | null;
        subjectLabel: string;
        bulk?: boolean;
        count?: number;
    }) {
        const actorName = await getUserDisplayName(args.dbClient, args.actorUserId);

        await notifyInstitutionActivity({
            dbClient: args.dbClient,
            actorUserId: args.actorUserId,
            institutionId: args.institutionId,
            permissionKey: 'notifications:view',
            actionType: 'SUBJECT_DELETED',
            resourceType: 'SUBJECT',
            resourceId: args.subjectId ?? null,
            resourceLabel: args.subjectLabel,
            metadata: {
                subjectId: args.subjectId ?? null,
                bulk: args.bulk ?? false,
                count: args.count ?? 1,
            },
            title: args.bulk ? 'Subjects deleted' : 'Subject deleted',
            message: args.bulk
                ? `${actorName} deleted ${args.subjectLabel}.`
                : `${actorName} deleted subject "${args.subjectLabel}".`,
            sourceModule: 'subjects',
            sourceAction: args.bulk ? 'bulk-delete' : 'delete',
            targetType: 'SUBJECT',
            operation: 'DELETED',
        });
    }

    static async notifySubjectClassificationCreated(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        classificationId: string;
        classificationLabel: string;
    }) {
        const actorName = await getUserDisplayName(args.dbClient, args.actorUserId);

        await notifyInstitutionActivity({
            dbClient: args.dbClient,
            actorUserId: args.actorUserId,
            institutionId: args.institutionId,
            permissionKey: 'notifications:view',
            actionType: 'SUBJECT_CLASSIFICATION_CREATED',
            resourceType: 'SUBJECT_CLASSIFICATION',
            resourceId: args.classificationId,
            resourceLabel: args.classificationLabel,
            metadata: {
                subjectClassificationId: args.classificationId,
            },
            title: 'Subject classification created',
            message: `${actorName} created subject classification "${args.classificationLabel}".`,
            sourceModule: 'subject-classifications',
            sourceAction: 'create',
            targetType: 'SUBJECT_CLASSIFICATION',
            operation: 'CREATED',
        });
    }

    static async notifySubjectClassificationUpdated(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        classificationId: string;
        classificationLabel: string;
    }) {
        const actorName = await getUserDisplayName(args.dbClient, args.actorUserId);

        await notifyInstitutionActivity({
            dbClient: args.dbClient,
            actorUserId: args.actorUserId,
            institutionId: args.institutionId,
            permissionKey: 'notifications:view',
            actionType: 'SUBJECT_CLASSIFICATION_UPDATED',
            resourceType: 'SUBJECT_CLASSIFICATION',
            resourceId: args.classificationId,
            resourceLabel: args.classificationLabel,
            metadata: {
                subjectClassificationId: args.classificationId,
            },
            title: 'Subject classification updated',
            message: `${actorName} updated subject classification "${args.classificationLabel}".`,
            sourceModule: 'subject-classifications',
            sourceAction: 'update',
            targetType: 'SUBJECT_CLASSIFICATION',
            operation: 'UPDATED',
        });
    }

    static async notifySubjectClassificationDeleted(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        classificationId: string;
        classificationLabel: string;
    }) {
        const actorName = await getUserDisplayName(args.dbClient, args.actorUserId);

        await notifyInstitutionActivity({
            dbClient: args.dbClient,
            actorUserId: args.actorUserId,
            institutionId: args.institutionId,
            permissionKey: 'notifications:view',
            actionType: 'SUBJECT_CLASSIFICATION_DELETED',
            resourceType: 'SUBJECT_CLASSIFICATION',
            resourceId: args.classificationId,
            resourceLabel: args.classificationLabel,
            metadata: {
                subjectClassificationId: args.classificationId,
            },
            title: 'Subject classification deleted',
            message: `${actorName} deleted subject classification "${args.classificationLabel}".`,
            sourceModule: 'subject-classifications',
            sourceAction: 'delete',
            targetType: 'SUBJECT_CLASSIFICATION',
            operation: 'DELETED',
        });
    }
}
