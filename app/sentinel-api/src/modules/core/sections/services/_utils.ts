/**
 * Inheritance configuration used by upsertInheritedOverride and hideInheritedRecord
 * to know which table and columns to operate on for sections.
 */
export const SECTION_INHERITANCE_CONFIG = {
    table: 'sections',
    idColumn: 'section_id',
    copyColumns: [
        'section_name',
        'department_id',
        'course_id',
        'year_level',
        'created_by',
        'updated_by',
    ],
};
