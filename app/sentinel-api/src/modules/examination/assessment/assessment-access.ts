import { HTTPException } from 'hono/http-exception';

const ASSESSMENT_ALLOWED_ROLES = ['admin', 'superadmin', 'instructor', 'support'] as const;

export type AssessmentAllowedRole = (typeof ASSESSMENT_ALLOWED_ROLES)[number];

export function assertAssessmentAccess(role?: string | null) {
    if (!role || !ASSESSMENT_ALLOWED_ROLES.includes(role as AssessmentAllowedRole)) {
        throw new HTTPException(403, {
            message: 'Forbidden. Insufficient permissions.',
        });
    }
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
