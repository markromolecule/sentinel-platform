import { type DbClient } from '@sentinel/db';
import { getSectionsData } from '../data/get-sections';
import { loadEffectiveRows } from '../../inheritance/effective-row-loader';

export type GetSectionsServiceArgs = {
    dbClient: DbClient;
    institutionId?: string;
    search?: string;
    scope?: {
        departmentId?: string;
        courseId?: string;
    };
};

/**
 * Retrieves sections for an institution, applying inheritance resolution
 * so that inherited and overridden records are merged correctly.
 */
export async function getSectionsService({
    dbClient,
    institutionId,
    search,
    scope,
}: GetSectionsServiceArgs) {
    const rawSections = await loadEffectiveRows<any>({
        dbClient,
        institutionId,
        idKey: 'section_id',
        loadRows: (scopeInstitutionId) =>
            getSectionsData({
                dbClient,
                institutionId: scopeInstitutionId,
                search,
                departmentId: scope?.departmentId,
                courseId: scope?.courseId,
            }),
    });

    return rawSections.map((section: any) => ({
        institution_id: section.institution_id,
        section_id: section.section_id,
        section_name: section.section_name,
        department_id: section.department_id,
        course_id: section.course_id,
        year_level: section.year_level,
        source_record_id: section.sourceRecordId,
        inheritance_status: section.inheritanceStatus,
        origin_institution_id: section.originInstitutionId,
        effective_institution_id: section.effectiveInstitutionId,
        is_local: section.isLocal,
        is_inherited: section.isInherited,
        is_overridden: section.isOverridden,
        is_hidden: section.isHidden,
        isLocal: section.isLocal,
        isInherited: section.isInherited,
        isOverridden: section.isOverridden,
        isHidden: section.isHidden,
        created_at: section.created_at,
        created_by: section.creator_first_name
            ? `${section.creator_first_name} ${section.creator_last_name}`
            : section.created_by,
        updated_at: section.updated_at,
        updated_by: section.updater_first_name
            ? `${section.updater_first_name} ${section.updater_last_name}`
            : section.updated_by,
        institution_name: section.institution_name,
        institutionName: section.institution_name,
        course_title: section.course_title,
        courseTitle: section.course_title,
        course_code: section.course_code,
        courseCode: section.course_code,
        department_name: section.department_name,
        departmentName: section.department_name,
    }));
}

export type GetSectionsServiceResponse = Awaited<ReturnType<typeof getSectionsService>>;
