import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { resolveTargetUserRole } from '../../identity/users/data/resolve-target-user-role';
import { EntitlementsRepository } from '../access/data/entitlements.repository';
import { hasActivePermission, requireActivePermission } from '../../../lib/permissions';
import { LogsService } from '../../general/logs/logs.service';

/** @deprecated For backward compatibility with static roles */
const DEPRECATED_ASSESSMENT_ALLOWED_ROLES = [
    'admin',
    'superadmin',
    'instructor',
    'support',
] as const;
/** @deprecated For backward compatibility with static roles */
const DEPRECATED_ASSESSMENT_READ_ALLOWED_ROLES = [
    ...DEPRECATED_ASSESSMENT_ALLOWED_ROLES,
    'student',
] as const;

/** @deprecated For backward compatibility with static roles */
export type AssessmentAllowedRole = string;
/** @deprecated For backward compatibility with static roles */
export type AssessmentReadAllowedRole = string;

export function normalizeAssessmentRole(role?: string | null) {
    if (typeof role !== 'string') {
        return null;
    }

    const normalizedRole = role.trim().toLowerCase();

    return normalizedRole.length > 0 ? normalizedRole : null;
}

/**
 * Throws HTTP 403 if the user does not have permission to manage assessments.
 * Supports passing either a Hono Context (for dynamic RBAC) or a role string (for backward compatibility).
 */
export function assertAssessmentAccess(roleOrContext?: any) {
    if (
        roleOrContext &&
        typeof roleOrContext === 'object' &&
        'get' in roleOrContext &&
        typeof roleOrContext.get === 'function'
    ) {
        requireActivePermission(
            roleOrContext,
            'assessments:manage',
            'Forbidden. Insufficient permissions.',
        );
        return;
    }

    const role = roleOrContext;
    if (!role || !DEPRECATED_ASSESSMENT_ALLOWED_ROLES.includes(role as any)) {
        throw new HTTPException(403, {
            message: 'Forbidden. Insufficient permissions.',
        });
    }
}

/**
 * Throws HTTP 403 if the user does not have permission to view assessments.
 * Supports passing either a Hono Context (for dynamic RBAC) or a role string (for backward compatibility).
 */
export function assertAssessmentReadAccess(roleOrContext?: any) {
    if (
        roleOrContext &&
        typeof roleOrContext === 'object' &&
        'get' in roleOrContext &&
        typeof roleOrContext.get === 'function'
    ) {
        const role = roleOrContext.get('role');
        if (role === 'student') {
            return;
        }
        requireActivePermission(
            roleOrContext,
            'assessments:view',
            'Forbidden. Insufficient permissions.',
        );
        return;
    }

    const role = roleOrContext;
    if (!role || !DEPRECATED_ASSESSMENT_READ_ALLOWED_ROLES.includes(role as any)) {
        throw new HTTPException(403, {
            message: 'Forbidden. Insufficient permissions.',
        });
    }
}

export async function resolveAssessmentActorRole(args: {
    dbClient: DbClient;
    userId?: string | null;
    claimedRole?: string | null;
}) {
    const normalizedClaimedRole = normalizeAssessmentRole(args.claimedRole);

    if (normalizedClaimedRole) {
        return normalizedClaimedRole;
    }

    if (!args.userId) {
        return null;
    }

    const resolvedRole = normalizeAssessmentRole(
        await resolveTargetUserRole(args.dbClient, args.userId),
    );

    if (resolvedRole) {
        return resolvedRole;
    }

    const instructorProfile = await EntitlementsRepository.getInstructorProfileByUserId(
        args.dbClient,
        args.userId,
    );

    if (instructorProfile) {
        return 'instructor';
    }

    const studentProfile = await EntitlementsRepository.getStudentProfileByUserId(
        args.dbClient,
        args.userId,
    );

    return studentProfile ? 'student' : null;
}

/**
 * Resolves the institution ID for assessment queries.
 * Supports passing `activePermissionKeys` (for dynamic RBAC) or `role` (for backward compatibility).
 */
export function resolveAssessmentInstitutionId(args: {
    role?: string | null;
    contextInstitutionId?: string | null;
    requestedInstitutionId?: string | null;
    activePermissionKeys?: Set<string>;
}) {
    const { role, contextInstitutionId, requestedInstitutionId, activePermissionKeys } = args;

    const hasCrossTenant = activePermissionKeys
        ? hasActivePermission(activePermissionKeys, 'institutions:cross-tenant-view')
        : role === 'superadmin' || role === 'support';

    if (hasCrossTenant) {
        return requestedInstitutionId || contextInstitutionId || undefined;
    }

    return contextInstitutionId || undefined;
}

export async function logAssessmentQuery(
    dbClient: DbClient,
    userId: string,
    examId: string,
    institutionId: string,
    role: string,
) {
    try {
        await LogsService.createLog(dbClient, {
            userId,
            action: 'exam.structure_viewed',
            resourceType: 'exam',
            resourceId: examId,
            activeInstitutionId: institutionId,
            details: { role },
        });
    } catch (logErr) {
        console.error('Failed to log exam.structure_viewed:', logErr);
    }
}
