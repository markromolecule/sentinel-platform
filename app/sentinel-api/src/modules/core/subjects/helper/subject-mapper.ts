export function mapSubjectRecord(subject: any) {
    return {
        ...subject,
        term_id: subject.term_id ?? null,
        is_opened: subject.is_opened ?? false,
        offering_start_date: subject.offering_start_date ?? null,
        offering_end_date: subject.offering_end_date ?? null,
        source_record_id: subject.sourceRecordId ?? subject.source_record_id ?? null,
        inheritance_status: subject.inheritanceStatus ?? subject.inheritance_status ?? 'LOCAL',
        origin_institution_id: subject.originInstitutionId ?? subject.institution_id ?? null,
        effective_institution_id: subject.effectiveInstitutionId ?? subject.institution_id ?? null,
        is_local: subject.isLocal ?? subject.inheritanceStatus === 'LOCAL',
        is_inherited: subject.isInherited ?? subject.inheritanceStatus === 'INHERITED',
        is_overridden: subject.isOverridden ?? subject.inheritanceStatus === 'OVERRIDDEN',
        is_hidden: subject.isHidden ?? subject.inheritanceStatus === 'HIDDEN',
        isLocal: subject.isLocal ?? subject.inheritanceStatus === 'LOCAL',
        isInherited: subject.isInherited ?? subject.inheritanceStatus === 'INHERITED',
        isOverridden: subject.isOverridden ?? subject.inheritanceStatus === 'OVERRIDDEN',
        isHidden: subject.isHidden ?? subject.inheritanceStatus === 'HIDDEN',
        created_by: subject.creator_first_name
            ? `${subject.creator_first_name} ${subject.creator_last_name}`
            : subject.created_by,
        updated_by: subject.updater_first_name
            ? `${subject.updater_first_name} ${subject.updater_last_name}`
            : subject.updated_by,
        creator_first_name: undefined,
        creator_last_name: undefined,
        updater_first_name: undefined,
        updater_last_name: undefined,
    };
}
