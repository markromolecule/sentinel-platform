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

function isGenericAuthenticatedRole(role?: string | null) {
    return role === 'authenticated' || role === 'anon' || role === 'anonymous';
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

    if (normalizedClaimedRole && !isGenericAuthenticatedRole(normalizedClaimedRole)) {
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

export function isStaffRole(role?: string | null): boolean {
    return role === 'instructor' || role === 'admin' || role === 'superadmin';
}

/**
 * Resolves the institution ID for assessment queries.
 * Supports passing `activePermissionKeys` (for dynamic RBAC) or `role` (for backward compatibility).
 */
export function resolveAssessmentInstitutionId(args: {
    role?: string | null;
    contextInstitutionId?: string | null;
    requestedInstitutionId?: string | null;
    activePermissionKeys?: Set<string> | string[];
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

/**
 * Resolves the role, institution ID, student user ID, department ID, and instructor user ID
 * for assessment read operations. Centralizes the logic to avoid duplicated ad-hoc role-based checks.
 *
 * @param args - Object containing inputs for resolving scope
 * @param args.dbClient - Database client connection
 * @param args.user - Current user object
 * @param args.claimedRole - Claimed role string, if any (e.g. from token user metadata)
 * @param args.contextInstitutionId - Institution ID resolved from routing context
 * @param args.requestedInstitutionId - Target institution ID requested by user
 * @param args.activePermissionKeys - Set of active permission keys from RBAC context
 */
export async function resolveAssessmentReadScope(args: {
    dbClient: DbClient;
    user?: any;
    claimedRole?: string | null;
    contextInstitutionId?: string | null;
    requestedInstitutionId?: string | null;
    activePermissionKeys?: Set<string> | string[];
}) {
    const {
        dbClient,
        user,
        claimedRole,
        contextInstitutionId,
        requestedInstitutionId,
        activePermissionKeys,
    } = args;

    const role = await resolveAssessmentActorRole({
        dbClient,
        userId: user?.id,
        claimedRole,
    });

    const institutionId = resolveAssessmentInstitutionId({
        role,
        contextInstitutionId,
        requestedInstitutionId,
        activePermissionKeys,
    });

    const studentProfile = user?.id
        ? await EntitlementsRepository.getStudentProfileByUserId(dbClient, user.id)
        : null;

    const studentUserId = studentProfile ? user.id : undefined;

    const departmentId =
        role === 'admin' ? (user?.user_profiles?.department_id ?? undefined) : undefined;

    const instructorUserId = isStaffRole(role) ? user?.id : undefined;

    return {
        role,
        institutionId,
        studentUserId,
        departmentId,
        instructorUserId,
    };
}

/**
 * Asserts that the actor has permission to read the specific exam record.
 * Specifically, checks if an instructor is trying to access a private exam they did not own,
 * are not assigned to, and is not shared with them.
 *
 * @param args - Inputs for the check
 * @param args.role - Normalized actor role
 * @param args.userId - Actor user ID
 * @param args.examRecord - The retrieved exam record (with is_public, created_by, assigned_instructor_ids)
 * @param args.isShared - Boolean indicating if the exam is shared with the actor
 */
export function assertExamReadScope(args: {
    role: string | null;
    userId?: string;
    examRecord: {
        is_public?: boolean | null;
        created_by?: string | null;
        assigned_instructor_ids?: string[] | null;
    };
    isShared: boolean;
}) {
    const { role, userId, examRecord, isShared } = args;

    if (
        role === 'instructor' &&
        examRecord.is_public === false &&
        userId !== examRecord.created_by &&
        !examRecord.assigned_instructor_ids?.includes(userId || '') &&
        !isShared
    ) {
        throw new HTTPException(404, {
            message: 'Exam not found.',
        });
    }
}
