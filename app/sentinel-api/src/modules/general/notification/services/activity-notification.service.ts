import { type DbClient } from '@sentinel/db';
import type { NotificationActionType, NotificationResourceType } from '@sentinel/shared/schema';
import { sql } from 'kysely';
import { NotificationService } from '../notification.service';

function toUniqueIds(values: string[]) {
    return Array.from(new Set(values));
}

function formatCountLabel(count: number) {
    return `${count} section${count === 1 ? '' : 's'}`;
}

function buildSubjectLabel(subjectCode: string | null, subjectTitle: string | null) {
    if (subjectCode && subjectTitle) {
        return `${subjectCode} - ${subjectTitle}`;
    }

    return subjectTitle || subjectCode || 'Subject';
}

async function getUserDisplayName(dbClient: DbClient, userId: string) {
    const row = await dbClient
        .selectFrom('user_profiles as up')
        .select(
            sql<string | null>`nullif(trim(concat(up.first_name, ' ', up.last_name)), '')`.as(
                'name',
            ),
        )
        .where('up.user_id', '=', userId)
        .executeTakeFirst();

    return row?.name ?? 'A user';
}

async function getInstitutionUsersWithPermission(args: {
    dbClient: DbClient;
    institutionId: string;
    permissionKey: string;
    excludeUserId?: string;
    roleNames?: string[];
}) {
    const { dbClient, institutionId, permissionKey, excludeUserId, roleNames = [] } = args;

    let query = dbClient
        .selectFrom('user_profiles as up')
        .leftJoin('user_roles as ur_filter', 'ur_filter.user_id', 'up.user_id')
        .leftJoin('roles as role_filter', 'role_filter.role_id', 'ur_filter.role_id')
        .select([
            'up.user_id as userId',
            sql<string | null>`nullif(trim(concat(up.first_name, ' ', up.last_name)), '')`.as(
                'name',
            ),
        ])
        .where('up.institution_id', '=', institutionId)
        .where((eb) =>
            eb.or([
                eb.exists(
                    eb
                        .selectFrom('rbac_user_permission_overrides as upo_allow')
                        .innerJoin(
                            'rbac_permissions as p_allow',
                            'p_allow.permission_id',
                            'upo_allow.permission_id',
                        )
                        .select('upo_allow.user_id')
                        .whereRef('upo_allow.user_id', '=', 'up.user_id')
                        .where('p_allow.permission_key', '=', permissionKey)
                        .where('upo_allow.effect', '=', 'allow'),
                ),
                eb.and([
                    eb.exists(
                        eb
                            .selectFrom('user_roles as ur')
                            .innerJoin('rbac_role_permissions as rrp', 'rrp.role_id', 'ur.role_id')
                            .innerJoin(
                                'rbac_permissions as p',
                                'p.permission_id',
                                'rrp.permission_id',
                            )
                            .select('ur.user_id')
                            .whereRef('ur.user_id', '=', 'up.user_id')
                            .where('p.permission_key', '=', permissionKey),
                    ),
                    eb.not(
                        eb.exists(
                            eb
                                .selectFrom('rbac_user_permission_overrides as upo_deny')
                                .innerJoin(
                                    'rbac_permissions as p_deny',
                                    'p_deny.permission_id',
                                    'upo_deny.permission_id',
                                )
                                .select('upo_deny.user_id')
                                .whereRef('upo_deny.user_id', '=', 'up.user_id')
                                .where('p_deny.permission_key', '=', permissionKey)
                                .where('upo_deny.effect', '=', 'deny'),
                        ),
                    ),
                ]),
            ]),
        );

    if (excludeUserId) {
        query = query.where('up.user_id', '!=', excludeUserId);
    }

    if (roleNames.length > 0) {
        query = query.where('role_filter.role_name', 'in', roleNames);
    }

    return await query.groupBy(['up.user_id', 'up.first_name', 'up.last_name']).execute();
}

async function getSubjectEnrollmentNotificationGroups(args: {
    dbClient: DbClient;
    requestIds: string[];
}) {
    const { dbClient, requestIds } = args;

    return await dbClient
        .selectFrom('enrollment_requests as er')
        .innerJoin('class_groups as cg', 'cg.class_group_id', 'er.class_group_id')
        .innerJoin('subject_offerings as so', 'so.subject_offering_id', 'cg.subject_offering_id')
        .innerJoin('subjects as sub', 'sub.subject_id', 'so.subject_id')
        .leftJoin('user_profiles as requester', 'requester.user_id', 'er.user_id')
        .select([
            'er.user_id as requesterUserId',
            'cg.subject_offering_id as subjectOfferingId',
            'cg.institution_id as institutionId',
            'sub.subject_code as subjectCode',
            'sub.subject_title as subjectTitle',
            sql<
                string | null
            >`nullif(trim(concat(requester.first_name, ' ', requester.last_name)), '')`.as(
                'requesterName',
            ),
            sql<number>`cast(count(*) as integer)`.as('requestCount'),
            sql<string[]>`array_agg(er.request_id order by er.request_id)`.as('requestIds'),
        ])
        .where('er.request_id', 'in', requestIds)
        .groupBy([
            'er.user_id',
            'cg.subject_offering_id',
            'cg.institution_id',
            'sub.subject_code',
            'sub.subject_title',
            'requester.first_name',
            'requester.last_name',
        ])
        .execute();
}

type InstitutionActivityArgs = {
    dbClient: DbClient;
    actorUserId: string;
    institutionId: string;
    permissionKey: string;
    actionType: NotificationActionType;
    resourceType: NotificationResourceType;
    resourceId?: string | null;
    resourceLabel: string;
    metadata?: Record<string, unknown> | null;
    message: string;
    title: string;
    roleNames?: string[];
};

export class ActivityNotificationService {
    private static async notifyInstitutionActivity(args: InstitutionActivityArgs) {
        const {
            dbClient,
            actorUserId,
            institutionId,
            permissionKey,
            actionType,
            resourceType,
            resourceId,
            resourceLabel,
            metadata,
            message,
            title,
            roleNames,
        } = args;

        const recipients = await getInstitutionUsersWithPermission({
            dbClient,
            institutionId,
            permissionKey,
            excludeUserId: actorUserId,
            roleNames: roleNames ?? ['admin', 'superadmin'],
        });

        await Promise.all(
            recipients.map((recipient) =>
                NotificationService.createNotification({
                    dbClient,
                    recipientUserId: recipient.userId,
                    actorUserId,
                    institutionId,
                    title,
                    message,
                    actionType,
                    resourceType,
                    resourceId: resourceId ?? null,
                    resourceLabel,
                    metadata: metadata ?? null,
                }),
            ),
        );
    }

    static async notifySubjectEnrollmentRequestSubmitted(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        subjectOfferingId: string;
        subjectLabel: string;
        requestIds: string[];
        requestCount: number;
    }) {
        const {
            dbClient,
            actorUserId,
            institutionId,
            subjectOfferingId,
            subjectLabel,
            requestIds,
            requestCount,
        } = args;

        const uniqueRequestIds = toUniqueIds(requestIds);

        if (uniqueRequestIds.length === 0 || requestCount <= 0) {
            return;
        }

        const actorName = await getUserDisplayName(dbClient, actorUserId);
        const recipients = await getInstitutionUsersWithPermission({
            dbClient,
            institutionId,
            permissionKey: 'subject_requests:approve',
            excludeUserId: actorUserId,
        });

        await Promise.all(
            recipients.map((recipient) =>
                NotificationService.createNotification({
                    dbClient,
                    recipientUserId: recipient.userId,
                    actorUserId,
                    institutionId,
                    title: 'New subject enrollment request',
                    message: `${actorName} submitted a subject enrollment request for "${subjectLabel}" (${formatCountLabel(requestCount)}).`,
                    actionType: 'SUBJECT_ENROLLMENT_REQUEST_SUBMITTED',
                    resourceType: 'SUBJECT_ENROLLMENT_REQUEST',
                    resourceId: subjectOfferingId,
                    resourceLabel: subjectLabel,
                    metadata: {
                        requestIds: uniqueRequestIds,
                        requestCount,
                        subjectOfferingId,
                    },
                }),
            ),
        );
    }

    static async notifySubjectEnrollmentRequestApproved(args: {
        dbClient: DbClient;
        actorUserId: string;
        requestIds: string[];
    }) {
        const { dbClient, actorUserId, requestIds } = args;
        const uniqueRequestIds = toUniqueIds(requestIds);

        if (uniqueRequestIds.length === 0) {
            return;
        }

        const actorName = await getUserDisplayName(dbClient, actorUserId);
        const groups = await getSubjectEnrollmentNotificationGroups({
            dbClient,
            requestIds: uniqueRequestIds,
        });

        await Promise.all(
            groups.map((group) =>
                NotificationService.createNotification({
                    dbClient,
                    recipientUserId: group.requesterUserId,
                    actorUserId,
                    institutionId: group.institutionId,
                    title: 'Subject enrollment request approved',
                    message: `${actorName} approved your subject enrollment request for "${buildSubjectLabel(group.subjectCode, group.subjectTitle)}" (${formatCountLabel(group.requestCount)}).`,
                    actionType: 'SUBJECT_ENROLLMENT_REQUEST_APPROVED',
                    resourceType: 'SUBJECT_ENROLLMENT_REQUEST',
                    resourceId: group.subjectOfferingId,
                    resourceLabel: buildSubjectLabel(group.subjectCode, group.subjectTitle),
                    metadata: {
                        requestIds: group.requestIds,
                        requestCount: group.requestCount,
                        subjectOfferingId: group.subjectOfferingId,
                    },
                }),
            ),
        );
    }

    static async notifySubjectEnrollmentRequestRejected(args: {
        dbClient: DbClient;
        actorUserId: string;
        requestIds: string[];
    }) {
        const { dbClient, actorUserId, requestIds } = args;
        const uniqueRequestIds = toUniqueIds(requestIds);

        if (uniqueRequestIds.length === 0) {
            return;
        }

        const actorName = await getUserDisplayName(dbClient, actorUserId);
        const groups = await getSubjectEnrollmentNotificationGroups({
            dbClient,
            requestIds: uniqueRequestIds,
        });

        await Promise.all(
            groups.map((group) =>
                NotificationService.createNotification({
                    dbClient,
                    recipientUserId: group.requesterUserId,
                    actorUserId,
                    institutionId: group.institutionId,
                    title: 'Subject enrollment request rejected',
                    message: `${actorName} rejected your subject enrollment request for "${buildSubjectLabel(group.subjectCode, group.subjectTitle)}" (${formatCountLabel(group.requestCount)}).`,
                    actionType: 'SUBJECT_ENROLLMENT_REQUEST_REJECTED',
                    resourceType: 'SUBJECT_ENROLLMENT_REQUEST',
                    resourceId: group.subjectOfferingId,
                    resourceLabel: buildSubjectLabel(group.subjectCode, group.subjectTitle),
                    metadata: {
                        requestIds: group.requestIds,
                        requestCount: group.requestCount,
                        subjectOfferingId: group.subjectOfferingId,
                    },
                }),
            ),
        );
    }

    static async notifySectionCreated(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        sectionId: string;
        sectionLabel: string;
    }) {
        const actorName = await getUserDisplayName(args.dbClient, args.actorUserId);

        await ActivityNotificationService.notifyInstitutionActivity({
            dbClient: args.dbClient,
            actorUserId: args.actorUserId,
            institutionId: args.institutionId,
            permissionKey: 'sections:view',
            actionType: 'SECTION_CREATED',
            resourceType: 'SECTION',
            resourceId: args.sectionId,
            resourceLabel: args.sectionLabel,
            metadata: {
                sectionId: args.sectionId,
            },
            title: 'Section created',
            message: `${actorName} created section "${args.sectionLabel}".`,
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

        await ActivityNotificationService.notifyInstitutionActivity({
            dbClient: args.dbClient,
            actorUserId: args.actorUserId,
            institutionId: args.institutionId,
            permissionKey: 'sections:view',
            actionType: 'SECTION_CREATED',
            resourceType: 'SECTION',
            resourceLabel,
            metadata: {
                count: args.count,
                bulk: true,
            },
            title: 'Sections created',
            message: `${actorName} created ${resourceLabel}.`,
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

        await ActivityNotificationService.notifyInstitutionActivity({
            dbClient: args.dbClient,
            actorUserId: args.actorUserId,
            institutionId: args.institutionId,
            permissionKey: 'sections:view',
            actionType: 'SECTION_UPDATED',
            resourceType: 'SECTION',
            resourceId: args.sectionId,
            resourceLabel: args.sectionLabel,
            metadata: {
                sectionId: args.sectionId,
            },
            title: 'Section updated',
            message: `${actorName} updated section "${args.sectionLabel}".`,
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

        await ActivityNotificationService.notifyInstitutionActivity({
            dbClient: args.dbClient,
            actorUserId: args.actorUserId,
            institutionId: args.institutionId,
            permissionKey: 'sections:view',
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
        });
    }

    static async notifySubjectCreated(args: {
        dbClient: DbClient;
        actorUserId: string;
        institutionId: string;
        subjectId: string;
        subjectLabel: string;
    }) {
        const actorName = await getUserDisplayName(args.dbClient, args.actorUserId);

        await ActivityNotificationService.notifyInstitutionActivity({
            dbClient: args.dbClient,
            actorUserId: args.actorUserId,
            institutionId: args.institutionId,
            permissionKey: 'subjects:view',
            actionType: 'SUBJECT_CREATED',
            resourceType: 'SUBJECT',
            resourceId: args.subjectId,
            resourceLabel: args.subjectLabel,
            metadata: {
                subjectId: args.subjectId,
            },
            title: 'Subject created',
            message: `${actorName} created subject "${args.subjectLabel}".`,
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

        await ActivityNotificationService.notifyInstitutionActivity({
            dbClient: args.dbClient,
            actorUserId: args.actorUserId,
            institutionId: args.institutionId,
            permissionKey: 'subjects:view',
            actionType: 'SUBJECT_UPDATED',
            resourceType: 'SUBJECT',
            resourceId: args.subjectId,
            resourceLabel: args.subjectLabel,
            metadata: {
                subjectId: args.subjectId,
            },
            title: 'Subject updated',
            message: `${actorName} updated subject "${args.subjectLabel}".`,
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

        await ActivityNotificationService.notifyInstitutionActivity({
            dbClient: args.dbClient,
            actorUserId: args.actorUserId,
            institutionId: args.institutionId,
            permissionKey: 'subjects:view',
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

        await ActivityNotificationService.notifyInstitutionActivity({
            dbClient: args.dbClient,
            actorUserId: args.actorUserId,
            institutionId: args.institutionId,
            permissionKey: 'subjects:view',
            actionType: 'SUBJECT_CLASSIFICATION_CREATED',
            resourceType: 'SUBJECT_CLASSIFICATION',
            resourceId: args.classificationId,
            resourceLabel: args.classificationLabel,
            metadata: {
                subjectClassificationId: args.classificationId,
            },
            title: 'Subject classification created',
            message: `${actorName} created subject classification "${args.classificationLabel}".`,
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

        await ActivityNotificationService.notifyInstitutionActivity({
            dbClient: args.dbClient,
            actorUserId: args.actorUserId,
            institutionId: args.institutionId,
            permissionKey: 'subjects:view',
            actionType: 'SUBJECT_CLASSIFICATION_UPDATED',
            resourceType: 'SUBJECT_CLASSIFICATION',
            resourceId: args.classificationId,
            resourceLabel: args.classificationLabel,
            metadata: {
                subjectClassificationId: args.classificationId,
            },
            title: 'Subject classification updated',
            message: `${actorName} updated subject classification "${args.classificationLabel}".`,
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

        await ActivityNotificationService.notifyInstitutionActivity({
            dbClient: args.dbClient,
            actorUserId: args.actorUserId,
            institutionId: args.institutionId,
            permissionKey: 'subjects:view',
            actionType: 'SUBJECT_CLASSIFICATION_DELETED',
            resourceType: 'SUBJECT_CLASSIFICATION',
            resourceId: args.classificationId,
            resourceLabel: args.classificationLabel,
            metadata: {
                subjectClassificationId: args.classificationId,
            },
            title: 'Subject classification deleted',
            message: `${actorName} deleted subject classification "${args.classificationLabel}".`,
        });
    }

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

        await ActivityNotificationService.notifyInstitutionActivity({
            dbClient: args.dbClient,
            actorUserId: args.actorUserId,
            institutionId: args.institutionId,
            permissionKey: 'notifications:view',
            actionType: 'SUPPORT_OPERATION_COMPLETED',
            resourceType: 'SUPPORT_OPERATION',
            resourceId: args.institutionRecordId,
            resourceLabel: args.institutionLabel,
            roleNames: ['superadmin', 'admin', 'instructor'],
            metadata: {
                operation: args.operation,
                targetType: 'INSTITUTION',
                institutionId: args.institutionRecordId,
            },
            title: 'Support operation completed',
            message: `${actorName} ${operationLabel} institution "${args.institutionLabel}".`,
        });
    }
}
