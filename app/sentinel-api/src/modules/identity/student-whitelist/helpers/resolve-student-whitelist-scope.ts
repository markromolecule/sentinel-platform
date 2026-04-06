export function resolveStudentWhitelistInstitutionId({
    requesterRole,
    requesterInstitutionId,
    requestedInstitutionId,
}: {
    requesterRole?: string;
    requesterInstitutionId?: string;
    requestedInstitutionId?: string;
}) {
    return requesterRole === 'superadmin'
        ? requestedInstitutionId ?? requesterInstitutionId
        : requesterInstitutionId;
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
            requesterRole === 'admin' ? requesterDepartmentId ?? departmentId : departmentId,
        courseId: requesterRole === 'admin' ? requesterCourseId ?? courseId : courseId,
    };
}
