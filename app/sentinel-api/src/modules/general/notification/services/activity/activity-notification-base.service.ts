import { type DbClient } from '@sentinel/db';
import type { NotificationActionType, NotificationResourceType } from '@sentinel/shared/schema';
import { sql } from 'kysely';
import { NotificationService } from '../../notification.service';

export type SupportedActorRole = 'support' | 'superadmin' | 'admin' | 'instructor' | 'student';
export type InstitutionLevel = 'PARENT_INSTITUTION' | 'BRANCH_INSTITUTION' | 'ADMIN_OVERRIDE';
export type GenericOperation =
    | 'CREATED'
    | 'UPDATED'
    | 'DELETED'
    | 'TRANSACTION_COMPLETED'
    | 'OVERRIDE_COMPLETED';

export function toUniqueIds(values: string[]) {
    return Array.from(new Set(values));
}

export function formatCountLabel(count: number) {
    return `${count} section${count === 1 ? '' : 's'}`;
}

export function buildSubjectLabel(subjectCode: string | null, subjectTitle: string | null) {
    if (subjectCode && subjectTitle) {
        return `${subjectCode} - ${subjectTitle}`;
    }

    return subjectTitle || subjectCode || 'Subject';
}

export async function getUserDisplayName(dbClient: DbClient, userId: string) {
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

export async function getUserPrimaryRole(
    dbClient: DbClient,
    userId: string,
): Promise<SupportedActorRole | null> {
    const rows = await dbClient
        .selectFrom('user_roles as ur')
        .innerJoin('roles as r', 'r.role_id', 'ur.role_id')
        .select('r.role_name as roleName')
        .where('ur.user_id', '=', userId)
        .execute();

    const priority: SupportedActorRole[] = [
        'support',
        'superadmin',
        'admin',
        'instructor',
        'student',
    ];

    for (const roleName of priority) {
        if (rows.some((row) => row.roleName === roleName)) {
            return roleName;
        }
    }

    return null;
}

export function getRecipientRolesForActorRole(actorRole: SupportedActorRole | null) {
    if (actorRole === 'support') {
        return ['admin', 'superadmin'];
    }

    if (actorRole === 'admin' || actorRole === 'superadmin') {
        return ['support', 'superadmin', 'admin', 'instructor'];
    }

    return ['admin', 'superadmin'];
}

export function resolveInstitutionLevel(args: {
    actorRole: SupportedActorRole | null;
    isAdminOverride?: boolean;
}): InstitutionLevel {
    if (args.isAdminOverride) {
        return 'ADMIN_OVERRIDE';
    }

    if (args.actorRole === 'support' || args.actorRole === 'superadmin') {
        return 'PARENT_INSTITUTION';
    }

    return 'BRANCH_INSTITUTION';
}

export function mapGenericOperationToActionType(
    operation: GenericOperation,
): NotificationActionType {
    switch (operation) {
        case 'CREATED':
            return 'INSTITUTION_ACTIVITY_CREATED';
        case 'UPDATED':
            return 'INSTITUTION_ACTIVITY_UPDATED';
        case 'DELETED':
            return 'INSTITUTION_ACTIVITY_DELETED';
        case 'TRANSACTION_COMPLETED':
            return 'INSTITUTION_ACTIVITY_TRANSACTION_COMPLETED';
        case 'OVERRIDE_COMPLETED':
            return 'INSTITUTION_ACTIVITY_OVERRIDE_COMPLETED';
    }
}

export async function getInstitutionUsersWithPermission(args: {
    dbClient: DbClient;
    institutionId: string;
    permissionKey: string;
    excludeUserId?: string;
    roleNames?: string[];
}) {
    const { dbClient, institutionId, permissionKey, excludeUserId, roleNames = [] } = args;

    // Resolve institution hierarchy: include parent institution if it exists
    // This allows parent institution users to receive notifications from their branches
    const institutionIds = [institutionId];
    const institution = await dbClient
        .selectFrom('institutions')
        .select('parent_institution_id')
        .where('id', '=', institutionId)
        .executeTakeFirst();

    if (institution?.parent_institution_id) {
        institutionIds.push(institution.parent_institution_id);
    }

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
        .where('up.institution_id', 'in', institutionIds)
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

export async function getSubjectEnrollmentNotificationGroups(args: {
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

export type InstitutionActivityArgs = {
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
    sourceModule?: string;
    sourceAction?: string;
    targetType?: string;
    operation?: string;
    isAdminOverride?: boolean;
};

export async function notifyInstitutionActivity(args: InstitutionActivityArgs) {
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
        sourceModule,
        sourceAction,
        targetType,
        operation,
        isAdminOverride,
    } = args;

    const actorRole = await getUserPrimaryRole(dbClient, actorUserId);
    const resolvedRoleNames = roleNames ?? getRecipientRolesForActorRole(actorRole);
    const institutionLevel = resolveInstitutionLevel({
        actorRole,
        isAdminOverride,
    });

    const recipients = await getInstitutionUsersWithPermission({
        dbClient,
        institutionId,
        permissionKey,
        excludeUserId: actorUserId,
        roleNames: resolvedRoleNames,
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
                metadata: {
                    ...(metadata ?? {}),
                    actorRole,
                    institutionLevel,
                    targetType: targetType ?? resourceType,
                    operation: operation ?? actionType,
                    isAdminOverride: Boolean(isAdminOverride),
                    sourceModule: sourceModule ?? null,
                    sourceAction: sourceAction ?? null,
                    occurredAt: new Date().toISOString(),
                },
            }),
        ),
    );
}
