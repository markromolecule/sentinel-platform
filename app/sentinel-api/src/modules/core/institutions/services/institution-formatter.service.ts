/**
 * Shared types and formatter utilities for institution records.
 */

export type InstitutionKind = 'STANDALONE' | 'PARENT' | 'CHILD';

export type NamingConventionRecord = {
    institution_naming_convention_id: string;
    institution_id: string;
    section_code_format: string | null;
    room_code_format: string | null;
    naming_rules: unknown;
};

/**
 * Maps a raw database institution row to a clean camelCase response object.
 *
 * @param inst - Raw database institution row.
 * @returns Formatted institution object.
 */
export function formatInstitution(inst: any) {
    return {
        id: inst.institution_id,
        name: inst.name,
        code: inst.code,
        parentInstitutionId: inst.parent_institution_id ?? null,
        institutionKind: inst.institution_kind ?? 'STANDALONE',
        createdAt: inst.created_at,
        createdBy: inst.creator_first_name
            ? `${inst.creator_first_name} ${inst.creator_last_name}`
            : inst.created_by,
        updatedAt: inst.updated_at,
        updatedBy: inst.updater_first_name
            ? `${inst.updater_first_name} ${inst.updater_last_name}`
            : inst.updated_by,
    };
}

/**
 * Formats a naming convention database record into the API response shape.
 *
 * @param record - Raw naming convention DB record.
 * @param sourceInstitutionId - The institution from which this convention originates.
 * @param isInherited - Whether this convention was inherited from a parent institution.
 * @returns Formatted naming convention object.
 */
export function formatNamingConvention(
    record: NamingConventionRecord,
    sourceInstitutionId: string,
    isInherited: boolean,
) {
    return {
        id: record.institution_naming_convention_id,
        institutionId: record.institution_id,
        roomCodeFormat: record.room_code_format,
        sectionCodeFormat: record.section_code_format,
        namingRules: record.naming_rules,
        sourceInstitutionId,
        isInherited,
    };
}

/**
 * Deep-merges parent and child naming rules, with child values taking precedence.
 *
 * @param parentRules - Naming rules from the parent institution.
 * @param childRules - Naming rules from the child institution.
 * @returns Merged naming rules object.
 */
export function mergeNamingRules(parentRules: unknown, childRules: unknown) {
    const parent = parentRules && typeof parentRules === 'object' ? parentRules : {};
    const child = childRules && typeof childRules === 'object' ? childRules : {};

    return {
        ...parent,
        ...child,
        room: {
            ...((parent as any).room ?? {}),
            ...((child as any).room ?? {}),
        },
        sectionRulesByCourseId: {
            ...((parent as any).sectionRulesByCourseId ?? {}),
            ...((child as any).sectionRulesByCourseId ?? {}),
        },
    };
}

/**
 * Merges a child naming convention record with its parent's, falling back to parent values
 * for any null fields and deep-merging the naming rules.
 *
 * @param childRecord - The institution's own naming convention record.
 * @param parentRecord - The parent institution's naming convention record, if any.
 * @returns Merged naming convention record.
 */
export function mergeNamingConventionRecords(
    childRecord: NamingConventionRecord,
    parentRecord?: NamingConventionRecord | null,
): NamingConventionRecord {
    if (!parentRecord) {
        return childRecord;
    }

    return {
        ...childRecord,
        room_code_format: childRecord.room_code_format ?? parentRecord.room_code_format,
        section_code_format:
            childRecord.section_code_format ?? parentRecord.section_code_format,
        naming_rules: mergeNamingRules(parentRecord.naming_rules, childRecord.naming_rules),
    };
}
