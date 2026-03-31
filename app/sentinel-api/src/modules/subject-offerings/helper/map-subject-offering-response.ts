function toStringArray(value: unknown): string[] {
    return Array.isArray(value)
        ? value.filter((item): item is string => typeof item === 'string')
        : [];
}

function toNumberArray(value: unknown): number[] {
    return Array.isArray(value)
        ? value.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0)
        : [];
}

export function mapSubjectOfferingResponse(rawSubjectOffering: any) {
    return {
        subject_offering_id: rawSubjectOffering.subject_offering_id,
        subject_id: rawSubjectOffering.subject_id,
        subject_code: rawSubjectOffering.subject_code,
        subject_title: rawSubjectOffering.subject_title,
        term_id: rawSubjectOffering.term_id,
        term_academic_year: rawSubjectOffering.term_academic_year,
        term_semester: rawSubjectOffering.term_semester,
        term_start_date: rawSubjectOffering.term_start_date,
        term_end_date: rawSubjectOffering.term_end_date,
        status: rawSubjectOffering.status,
        department_ids: toStringArray(rawSubjectOffering.department_ids),
        course_ids: toStringArray(rawSubjectOffering.course_ids),
        section_ids: toStringArray(rawSubjectOffering.section_ids),
        year_levels: toNumberArray(rawSubjectOffering.year_levels),
        created_at: rawSubjectOffering.created_at,
        updated_at: rawSubjectOffering.updated_at,
        created_by: rawSubjectOffering.created_by,
        updated_by: rawSubjectOffering.updated_by,
    };
}
