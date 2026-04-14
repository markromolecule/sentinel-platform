export function mapClassificationRecord(record: any) {
    return {
        ...record,
        created_by: record.creator_first_name
            ? `${record.creator_first_name} ${record.creator_last_name}`
            : record.created_by,
        updated_by: record.updater_first_name
            ? `${record.updater_first_name} ${record.updater_last_name}`
            : record.updated_by,
        subjects: Array.isArray(record.subjects) ? record.subjects : [],
        department_id: record.department_id,
        course_ids: Array.isArray(record.course_ids) ? record.course_ids : [],
        creator_first_name: undefined,
        creator_last_name: undefined,
        updater_first_name: undefined,
        updater_last_name: undefined,
    };
}
