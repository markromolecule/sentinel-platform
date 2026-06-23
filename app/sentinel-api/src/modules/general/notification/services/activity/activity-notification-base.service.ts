import { type DbClient } from '@sentinel/db';
import type { NotificationActionType, NotificationResourceType } from '@sentinel/shared/schema';
import { sql } from 'kysely';
import { NotificationService } from '../../notification.service';
import { LogsService } from '../../../logs/logs.service';
import { hasActivePermission } from '../../../../../lib/permissions';
import { getUserActivePermissions } from '../../../../security/permission/data/get-user-active-permissions';

export type SupportedActorRole = string;
export type InstitutionLevel = 'PARENT_INSTITUTION' | 'BRANCH_INSTITUTION' | 'ADMIN_OVERRIDE';
export type GenericOperation =
    | 'CREATED'
    | 'UPDATED'
    | 'DELETED'
    | 'TRANSACTION_COMPLETED'
    | 'OVERRIDE_COMPLETED';

let cachedNotificationRoleRouting: Record<string, string[]> | null | undefined;

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
        .orderBy('r.is_system', 'desc')
        .orderBy('r.domain_scope', 'asc')
        .execute();

    return rows[0]?.roleName ?? null;
}

export async function getRecipientRolesForActorRole(
    dbClient: DbClient,
    actorRole: SupportedActorRole | null,
): Promise<string[]> {
    try {
        if (cachedNotificationRoleRouting === undefined) {
            const row = await dbClient
                .selectFrom('system_settings')
                .select('setting_value')
                .where('setting_key', '=', 'notification_role_routing')
                .executeTakeFirst();

            cachedNotificationRoleRouting = row?.setting_value
                ? (row.setting_value as Record<string, string[]>)
                : null;
        }

        if (cachedNotificationRoleRouting) {
            const routing = cachedNotificationRoleRouting;
            const key = actorRole || 'default';
            if (routing[key]) {
                return routing[key];
            }
            if (routing.default) {
                return routing.default;
            }
        }
    } catch (err) {
        console.warn(
            "Error loading 'notification_role_routing' setting. Falling back to default role routing logic:",
            err,
        );
    }

    // Default static fallback behavior
    if (actorRole === 'support') {
        return ['admin', 'superadmin'];
    }

    if (actorRole === 'admin' || actorRole === 'superadmin') {
        return ['support', 'superadmin', 'admin', 'instructor'];
    }

    return ['admin', 'superadmin'];
}

export function resetNotificationRoleRoutingCacheForTests() {
    cachedNotificationRoleRouting = undefined;
}

export function resolveInstitutionLevel(args: {
    actorRole: SupportedActorRole | null;
    isAdminOverride?: boolean;
    activePermissionKeys?: Set<string>;
}): InstitutionLevel {
    if (args.isAdminOverride) {
        return 'ADMIN_OVERRIDE';
    }

    const hasCrossTenant = args.activePermissionKeys
        ? hasActivePermission(args.activePermissionKeys, 'institutions:cross-tenant-view')
        : args.actorRole === 'support' || args.actorRole === 'superadmin';

    if (hasCrossTenant) {
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
    includeChildInstitutions?: boolean;
}) {
    const {
        dbClient,
        institutionId,
        permissionKey,
        excludeUserId,
        roleNames = [],
        includeChildInstitutions = false,
    } = args;

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

    if (includeChildInstitutions) {
        const childInstitutions = await dbClient
            .selectFrom('institutions')
            .select('id')
            .where('parent_institution_id', '=', institutionId)
            .execute();

        institutionIds.push(...childInstitutions.map((childInstitution) => childInstitution.id));
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
    includeChildInstitutions?: boolean;
    activePermissionKeys?: Set<string>;
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
        includeChildInstitutions,
    } = args;

    const actorRole = await getUserPrimaryRole(dbClient, actorUserId);
    const resolvedRoleNames =
        roleNames ?? (await getRecipientRolesForActorRole(dbClient, actorRole));
    const institutionLevel = resolveInstitutionLevel({
        actorRole,
        isAdminOverride,
        activePermissionKeys: args.activePermissionKeys,
    });

    const recipients = await getInstitutionUsersWithPermission({
        dbClient,
        institutionId,
        permissionKey,
        excludeUserId: actorUserId,
        roleNames: resolvedRoleNames,
        includeChildInstitutions,
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

    // Real-time Audit Logging integration
    try {
        const logAction =
            sourceModule && sourceAction
                ? `${sourceModule}.${sourceAction}`
                : actionType.toLowerCase().replace(/_/g, '.');

        await LogsService.createLog(dbClient, {
            userId: actorUserId,
            action: logAction,
            resourceType: sourceModule || resourceType.toLowerCase(),
            resourceId: resourceId ?? null,
            details: {
                message,
                title,
                ...(metadata ?? {}),
            },
            activeInstitutionId: institutionId,
        });
    } catch (logError) {
        console.error('Failed to capture real-time audit log in notification base:', logError);
    }
}
