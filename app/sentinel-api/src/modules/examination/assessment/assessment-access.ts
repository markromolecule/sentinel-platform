import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { resolveTargetUserRole } from '../../identity/users/data/resolve-target-user-role';
import { EntitlementsRepository } from '../access/data/entitlements.repository';

const ASSESSMENT_ALLOWED_ROLES = ['admin', 'superadmin', 'instructor', 'support'] as const;
const ASSESSMENT_READ_ALLOWED_ROLES = [...ASSESSMENT_ALLOWED_ROLES, 'student'] as const;

export type AssessmentAllowedRole = (typeof ASSESSMENT_ALLOWED_ROLES)[number];
export type AssessmentReadAllowedRole = (typeof ASSESSMENT_READ_ALLOWED_ROLES)[number];

export function normalizeAssessmentRole(role?: string | null) {
    if (typeof role !== 'string') {
        return null;
    }

    const normalizedRole = role.trim().toLowerCase();

    return normalizedRole.length > 0 ? normalizedRole : null;
}

export function assertAssessmentAccess(role?: string | null) {
    if (!role || !ASSESSMENT_ALLOWED_ROLES.includes(role as AssessmentAllowedRole)) {
        throw new HTTPException(403, {
            message: 'Forbidden. Insufficient permissions.',
        });
    }
}

export function assertAssessmentReadAccess(role?: string | null) {
    if (!role || !ASSESSMENT_READ_ALLOWED_ROLES.includes(role as AssessmentReadAllowedRole)) {
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

    const studentProfile = await EntitlementsRepository.getStudentProfileByUserId(
        args.dbClient,
        args.userId,
    );

    return studentProfile ? 'student' : null;
}

export function resolveAssessmentInstitutionId(args: {
    role?: string | null;
    contextInstitutionId?: string | null;
    requestedInstitutionId?: string | null;
}) {
    const { role, contextInstitutionId, requestedInstitutionId } = args;

    if (role === 'superadmin' || role === 'support') {
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
        const { LogsService } = await import('../../general/logs/logs.service');
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
