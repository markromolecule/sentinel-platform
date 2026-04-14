export function mapSubjectRecord(subject: any) {
    return {
        ...subject,
        term_id: subject.term_id ?? null,
        is_opened: subject.is_opened ?? false,
        offering_start_date: subject.offering_start_date ?? null,
        offering_end_date: subject.offering_end_date ?? null,
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
