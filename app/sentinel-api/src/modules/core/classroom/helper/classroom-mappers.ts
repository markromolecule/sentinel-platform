import { type RawClassroomRecord, type RawClassroomStudentRecord } from './classroom.types';

function formatYearLevelLabel(yearLevel: number | null) {
    if (!Number.isInteger(yearLevel) || !yearLevel) {
        return null;
    }

    return `Year ${yearLevel}`;
}

export function buildClassroomResponse(rawClassroom: RawClassroomRecord) {
    const subjectLabel = [rawClassroom.subject_code, rawClassroom.subject_title]
        .filter(Boolean)
        .join(' - ');
    const sectionLabel = rawClassroom.section_name ?? 'Unassigned section';
    const termLabel = [rawClassroom.term_academic_year, rawClassroom.term_semester]
        .filter(Boolean)
        .join(' • ');
    const departmentLabel =
        [rawClassroom.department_code, rawClassroom.department_name].filter(Boolean).join(' - ') ||
        null;
    const courseLabel =
        [rawClassroom.course_code, rawClassroom.course_title].filter(Boolean).join(' - ') || null;

    const instructors = Array.isArray(rawClassroom.instructors)
        ? rawClassroom.instructors
        : typeof rawClassroom.instructors === 'string'
          ? JSON.parse(rawClassroom.instructors)
          : [];

    return {
        ...rawClassroom,
        instructors,
        is_configured: Boolean(rawClassroom.class_name),
        student_count: Number(rawClassroom.student_count ?? 0),
        exam_count: Number(rawClassroom.exam_count ?? 0),
        scope_summary: {
            subject_label: subjectLabel || 'Unknown subject',
            section_label: sectionLabel,
            term_label: termLabel || 'No term assigned',
            department_label: departmentLabel,
            course_label: courseLabel,
            year_level_label: formatYearLevelLabel(rawClassroom.year_level),
        },
    };
}

export function buildClassroomStudentResponse(rawStudent: RawClassroomStudentRecord) {
    return {
        ...rawStudent,
        full_name:
            rawStudent.full_name ||
            [rawStudent.first_name, rawStudent.last_name].filter(Boolean).join(' ') ||
            rawStudent.student_number,
    };
}
