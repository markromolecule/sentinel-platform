import {
    DEFAULT_META_ROLE,
    type GetUsersRecord,
} from './get-users.types';

function toNullableString(value: unknown) {
    return typeof value === 'string' ? value : null;
}

function formatYearLevel(yearLevel?: number | null) {
    if (!yearLevel) {
        return null;
    }

    switch (yearLevel) {
        case 1:
            return '1st Year';
        case 2:
            return '2nd Year';
        case 3:
            return '3rd Year';
        default:
            return `${yearLevel}th Year`;
    }
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
        // Ignore parse errors for metadata and fall back to the default role.
    }

    return DEFAULT_META_ROLE;
}

function formatUserRecord(record: GetUsersRecord) {
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
    const yearLevel = (record.year_levels ?? [])
        .map((level) => formatYearLevel(level))
        .filter(Boolean)
        .join(', ');
    const departmentCode = toNullableString(record.department_code);

    return {
        id: record.user_id,
        user_id: record.user_id,
        userId: record.user_id,
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
        institution: record.institution_name ?? record.institution_id ?? null,
        institution_id: record.institution_id ?? null,
        status: isOnline ? 'active' : 'offline',
        created_at: record.created_at ?? new Date(),
        updated_at: record.updated_at ?? null,
        created_by: null,
        updated_by: null,
        subject: record.subject_name ?? '—',
        section: record.section_name ?? '—',
        term: record.term_name ?? '—',
        yearLevel: yearLevel || '—',
    };
}

export function formatUserRecords(records: GetUsersRecord[]) {
    return records.map(formatUserRecord);
}
