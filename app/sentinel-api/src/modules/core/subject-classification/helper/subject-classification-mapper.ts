export function mapClassificationRecord(record: any) {
    return {
        ...record,
        created_by: record.creator_first_name
            ? `${record.creator_first_name} ${record.creator_last_name}`
            : record.created_by,
        updated_by: record.updater_first_name
            ? `${record.updater_first_name} ${record.updater_last_name}`
            : record.updated_by,
        subjects: (() => {
            if (Array.isArray(record.subjects)) return record.subjects;
            if (typeof record.subjects === 'string') {
                try {
                    return JSON.parse(record.subjects);
                } catch {
                    return [];
                }
            }
            return [];
        })(),
        department_id: record.department_id,
        course_ids: (() => {
            if (Array.isArray(record.course_ids)) return record.course_ids;
            if (typeof record.course_ids === 'string') {
                try {
                    // Handle both standard JSON array string "["a", "b"]"
                    // and PG array string "{a,b}" if it somehow reaches here
                    const cleaned = record.course_ids.trim();
                    if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
                        return JSON.parse(cleaned);
                    }
                    if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
                        return cleaned.slice(1, -1).split(',').filter(Boolean);
                    }
                    return [];
                } catch {
                    return [];
                }
            }
            return [];
        })(),
        creator_first_name: undefined,
        creator_last_name: undefined,
        updater_first_name: undefined,
        updater_last_name: undefined,
    };
}
