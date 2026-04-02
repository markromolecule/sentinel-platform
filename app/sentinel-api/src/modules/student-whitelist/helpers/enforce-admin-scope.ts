export function enforceAdminScope({
    requesterRole,
    requesterDepartmentId,
    requesterCourseId,
    departmentId,
    courseId,
}: {
    requesterRole?: string;
    requesterDepartmentId?: string | null;
    requesterCourseId?: string | null;
    departmentId: string;
    courseId: string;
}) {
    if (requesterRole !== 'admin') {
        return;
    }

    if (requesterDepartmentId && requesterDepartmentId !== departmentId) {
        throw new Error('Forbidden: Cannot manage whitelist records outside your department');
    }

    if (requesterCourseId && requesterCourseId !== courseId) {
        throw new Error('Forbidden: Cannot manage whitelist records outside your course');
    }
}
