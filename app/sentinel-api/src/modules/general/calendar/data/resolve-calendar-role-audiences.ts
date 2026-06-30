/**
 * Resolves the calendar audiences visible to a given role.
 *
 * Support, admin, and superadmin are treated as admin-style viewers and
 * receive institution-wide plus administrator-targeted events.
 */
export function resolveCalendarRoleAudiences(role?: string) {
    if (!role) {
        return undefined;
    }

    if (role === 'student') {
        return ['ALL', 'STUDENTS'] as const;
    }

    if (role === 'instructor') {
        return ['ALL', 'INSTRUCTORS'] as const;
    }

    if (role === 'admin' || role === 'superadmin' || role === 'support') {
        return ['ALL', 'ADMINS'] as const;
    }

    return ['ALL'] as const;
}
