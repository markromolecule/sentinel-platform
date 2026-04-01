type SemesterResponseRecord = {
    term_id: string;
    academic_year: string;
    semester: string;
    is_active: boolean | null;
    start_date: Date | string | null;
    end_date: Date | string | null;
    created_at: Date | string | null;
    updated_at?: Date | string | null;
    institution_id: string | null;
    institution_name?: string | null;
};

export function mapSemesterResponse(record: SemesterResponseRecord) {
    return {
        term_id: record.term_id,
        academic_year: record.academic_year,
        semester: record.semester,
        is_active: record.is_active,
        start_date: record.start_date,
        end_date: record.end_date,
        created_at: record.created_at,
        updated_at: record.updated_at ?? null,
        institution_name: record.institution_name ?? null,
        institution_id: record.institution_id,
    };
}
