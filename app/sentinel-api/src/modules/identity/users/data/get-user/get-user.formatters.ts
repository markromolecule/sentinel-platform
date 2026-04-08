import {
    DEFAULT_META_ROLE,
    type GetUserRecord,
} from './get-user.types';

function toNullableString(value: unknown) {
    return typeof value === 'string' ? value : null;
}

function getRoleFromMetadata(rawUserMetaData: unknown) {
    if (!rawUserMetaData) {
        return DEFAULT_META_ROLE;
    }

    try {
        const meta =
            typeof rawUserMetaData === 'string'
                ? JSON.parse(rawUserMetaData)
                : (rawUserMetaData as Record<string, unknown>);

        if (meta && typeof meta === 'object' && 'role' in meta) {
            return String(meta.role);
        }
    } catch {
        // Ignore parse errors and fall back to the default metadata role.
    }

    return DEFAULT_META_ROLE;
}

export function formatUserRecord(record: GetUserRecord) {
    const nowMs = Date.now();
    const isOnline = record.last_seen_at
        ? nowMs - new Date(record.last_seen_at).getTime() <= 5 * 60 * 1000
        : false;
    const metaRole = getRoleFromMetadata(record.raw_user_meta_data);
    const courseIds =
        (record.instructor_course_ids ?? []).length > 0
            ? (record.instructor_course_ids ?? [])
            : record.course_id
              ? [record.course_id]
              : [];
    const courseNames =
        (record.instructor_course_names ?? []).length > 0
            ? (record.instructor_course_names ?? [])
                  .map((courseName) => courseName?.trim())
                  .filter(Boolean)
            : record.primary_course_name
              ? [record.primary_course_name.trim()]
              : [];
    const departmentCode = toNullableString(record.department_code);

    return {
        user_id: record.user_id,
        firstName: record.first_name ?? '',
        lastName: record.last_name ?? '',
        email: record.email ?? '',
        role: record.role_name ?? metaRole,
        department: departmentCode,
        departmentCode: departmentCode,
        department_id: record.department_id ?? null,
        course: courseNames.join(', ') || null,
        course_id: record.course_id ?? courseIds[0] ?? null,
        course_ids: courseIds,
        courses: courseNames,
        studentNo: record.student_number ?? null,
        employeeNo: record.employee_number ?? null,
        institution: record.institution_name ?? null,
        institution_id: record.institution_id ?? null,
        status: isOnline ? 'active' : 'offline',
        created_at: record.created_at ?? new Date(),
        updated_at: record.updated_at ?? null,
        created_by: null,
        updated_by: null,
    };
}
