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

function toClassificationArray(value: unknown) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            if (!item || typeof item !== 'object') {
                return null;
            }

            return {
                id: typeof item.id === 'string' ? item.id : '',
                name: typeof item.name === 'string' ? item.name : '',
                type: item.type === 'GENERAL' || item.type === 'CORE' ? item.type : 'CORE',
            };
        })
        .filter((item): item is { id: string; name: string; type: 'GENERAL' | 'CORE' } =>
            Boolean(item?.id && item.name),
        );
}

function toDepartmentArray(value: unknown) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            if (!item || typeof item !== 'object') {
                return null;
            }

            return {
                id: typeof item.id === 'string' ? item.id : '',
                code: typeof item.code === 'string' ? item.code : null,
                name: typeof item.name === 'string' ? item.name : '',
            };
        })
        .filter((item): item is { id: string; code: string | null; name: string } =>
            Boolean(item?.id && item.name),
        );
}

function toCourseArray(value: unknown) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            if (!item || typeof item !== 'object') {
                return null;
            }

            return {
                id: typeof item.id === 'string' ? item.id : '',
                code: typeof item.code === 'string' ? item.code : null,
                title: typeof item.title === 'string' ? item.title : '',
            };
        })
        .filter((item): item is { id: string; code: string | null; title: string } =>
            Boolean(item?.id && item.title),
        );
}

function toSectionArray(value: unknown) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            if (!item || typeof item !== 'object') {
                return null;
            }

            return {
                id: typeof item.id === 'string' ? item.id : '',
                name: typeof item.name === 'string' ? item.name : '',
                department_id: typeof item.department_id === 'string' ? item.department_id : null,
                course_id: typeof item.course_id === 'string' ? item.course_id : null,
                year_level:
                    typeof item.year_level === 'number' && Number.isInteger(item.year_level)
                        ? item.year_level
                        : null,
            };
        })
        .filter(
            (
                item,
            ): item is {
                id: string;
                name: string;
                department_id: string | null;
                course_id: string | null;
                year_level: number | null;
            } => Boolean(item?.id && item.name),
        );
}

function toInstructorArray(value: unknown) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => {
            if (!item || typeof item !== 'object') {
                return null;
            }

            return {
                id: typeof item.id === 'string' ? item.id : '',
                firstName: typeof item.firstName === 'string' ? item.firstName : null,
                lastName: typeof item.lastName === 'string' ? item.lastName : null,
                email: typeof item.email === 'string' ? item.email : null,
            };
        })
        .filter((item): item is { id: string; firstName: string | null; lastName: string | null; email: string | null } =>
            Boolean(item?.id),
        );
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
        departments: toDepartmentArray(rawSubjectOffering.departments),
        courses: toCourseArray(rawSubjectOffering.courses),
        sections: toSectionArray(rawSubjectOffering.sections),
        classifications: toClassificationArray(rawSubjectOffering.classifications),
        is_multi_department: toStringArray(rawSubjectOffering.department_ids).length > 1,
        created_at: rawSubjectOffering.created_at,
        updated_at: rawSubjectOffering.updated_at,
        created_by: rawSubjectOffering.created_by,
        updated_by: rawSubjectOffering.updated_by,
        source_record_id:
            rawSubjectOffering.sourceRecordId ?? rawSubjectOffering.source_record_id ?? null,
        inheritance_status:
            rawSubjectOffering.inheritanceStatus ??
            rawSubjectOffering.inheritance_status ??
            'LOCAL',
        origin_institution_id:
            rawSubjectOffering.originInstitutionId ?? rawSubjectOffering.institution_id ?? null,
        effective_institution_id:
            rawSubjectOffering.effectiveInstitutionId ?? rawSubjectOffering.institution_id ?? null,
        is_local: rawSubjectOffering.isLocal ?? rawSubjectOffering.inheritanceStatus === 'LOCAL',
        is_inherited:
            rawSubjectOffering.isInherited ?? rawSubjectOffering.inheritanceStatus === 'INHERITED',
        is_overridden:
            rawSubjectOffering.isOverridden ??
            rawSubjectOffering.inheritanceStatus === 'OVERRIDDEN',
        is_hidden: rawSubjectOffering.isHidden ?? rawSubjectOffering.inheritanceStatus === 'HIDDEN',
        institution_name: rawSubjectOffering.institution_name,
        institutionName: rawSubjectOffering.institution_name,
        instructors: toInstructorArray(rawSubjectOffering.instructors),
    };
}
