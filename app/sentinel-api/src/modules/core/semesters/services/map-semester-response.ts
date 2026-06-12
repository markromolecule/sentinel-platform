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
    sourceRecordId?: string | null;
    inheritanceStatus?: string;
    originInstitutionId?: string | null;
    effectiveInstitutionId?: string | null;
    isLocal?: boolean;
    isInherited?: boolean;
    isOverridden?: boolean;
    isHidden?: boolean;
};

/**
 * Maps a database semester record to a structured API response.
 * Dynamically resolves `is_active` to `false` if the term's end_date has passed.
 *
 * @param record - The raw semester record from the database.
 * @returns The formatted semester response object.
 */
export function mapSemesterResponse(record: SemesterResponseRecord) {
    // A semester is inactive if its end_date has passed, even if it is marked as active in the database
    const isExpired = record.end_date ? new Date(record.end_date).getTime() < Date.now() : false;
    const is_active = record.is_active && isExpired ? false : record.is_active;

    return {
        term_id: record.term_id,
        academic_year: record.academic_year,
        semester: record.semester,
        is_active,
        start_date: record.start_date,
        end_date: record.end_date,
        created_at: record.created_at,
        updated_at: record.updated_at ?? null,
        institution_name: record.institution_name ?? null,
        institution_id: record.institution_id,
        source_record_id: record.sourceRecordId ?? null,
        inheritance_status: record.inheritanceStatus ?? 'LOCAL',
        origin_institution_id: record.originInstitutionId ?? record.institution_id,
        effective_institution_id: record.effectiveInstitutionId ?? record.institution_id,
        is_local: record.isLocal ?? true,
        is_inherited: record.isInherited ?? false,
        is_overridden: record.isOverridden ?? false,
        is_hidden: record.isHidden ?? false,
        isLocal: record.isLocal ?? true,
        isInherited: record.isInherited ?? false,
        isOverridden: record.isOverridden ?? false,
        isHidden: record.isHidden ?? false,
    };
}
