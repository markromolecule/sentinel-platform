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
