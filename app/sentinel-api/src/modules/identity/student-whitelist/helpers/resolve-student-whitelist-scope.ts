export function resolveStudentWhitelistInstitutionId({
    requesterRole,
    requesterInstitutionId,
    requestedInstitutionId,
}: {
    requesterRole?: string;
    requesterInstitutionId?: string;
    requestedInstitutionId?: string;
}) {
    // Support agents can access any institution's data
    if (requesterRole === 'support') {
        return requestedInstitutionId;
    }

    // Admins are restricted to their assigned institution
    // If no institution is assigned, they can't access any data
    if (requesterRole === 'admin' && !requesterInstitutionId) {
        return undefined;
    }

    // Superadmin can access any institution
    return requesterInstitutionId ?? requestedInstitutionId;
}

export function resolveStudentWhitelistQueryScope({
    requesterRole,
    requesterInstitutionId,
    requesterDepartmentId,
    requesterCourseId,
    queryInstitutionId,
    departmentId,
    courseId,
}: {
    requesterRole?: string;
    requesterInstitutionId?: string;
    requesterDepartmentId?: string | null;
    requesterCourseId?: string | null;
    queryInstitutionId?: string;
    departmentId?: string;
    courseId?: string;
}) {
    return {
        institutionId: resolveStudentWhitelistInstitutionId({
            requesterRole,
            requesterInstitutionId,
            requestedInstitutionId: queryInstitutionId,
        }),
        departmentId:
            requesterRole === 'admin' ? (requesterDepartmentId ?? departmentId) : departmentId,
        courseId: requesterRole === 'admin' ? (requesterCourseId ?? courseId) : courseId,
    };
}
