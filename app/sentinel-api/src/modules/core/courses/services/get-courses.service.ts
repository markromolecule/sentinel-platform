import { type DbClient } from '@sentinel/db';
import { getCoursesData } from '../data/get-courses';
import { loadEffectiveRows } from '../../inheritance/effective-row-loader';
import { paginateItems } from '../../../../lib/pagination';

export type GetCoursesServiceArgs = {
    dbClient: DbClient;
    institutionId?: string;
    search?: string;
    scope?: {
        departmentId?: string;
        courseId?: string;
        page?: number;
        pageSize?: number;
    };
};

/**
 * Retrieves all effective courses visible to the given institution,
 * applying optional filters and pagination.
 */
export async function getCoursesService({
    dbClient,
    institutionId,
    search,
    scope,
}: GetCoursesServiceArgs) {
    const rawCourses = await loadEffectiveRows<any>({
        dbClient,
        institutionId,
        idKey: 'course_id',
        loadRows: (scopeInstitutionId) =>
            getCoursesData({
                dbClient,
                institutionId: scopeInstitutionId!,
                search,
                departmentId: scope?.departmentId,
                courseId: scope?.courseId,
            }),
    });

    const scopedCourses = scope?.courseId
        ? rawCourses.filter((course: any) => course.course_id === scope.courseId)
        : rawCourses;

    return paginateItems(
        scopedCourses.map((course: any) => ({
            institution_id: course.institution_id,
            institutionId: course.institution_id,
            course_id: course.course_id,
            courseId: course.course_id,
            code: course.code,
            title: course.title,
            department_id: course.department_id,
            departmentId: course.department_id,
            department_name: course.department_name,
            departmentName: course.department_name,
            department_code: course.department_code,
            departmentCode: course.department_code,
            institution_name: course.institution_name,
            institutionName: course.institution_name,
            description: course.description,
            source_record_id: course.source_record_id,
            sourceRecordId: course.source_record_id,
            inheritance_status: course.inheritance_status,
            inheritanceStatus: course.inheritance_status,
            origin_institution_id: course.origin_institution_id,
            originInstitutionId: course.origin_institution_id,
            effective_institution_id: course.effective_institution_id,
            effectiveInstitutionId: course.effective_institution_id,
            is_local: course.isLocal,
            is_inherited: course.isInherited,
            is_overridden: course.isOverridden,
            is_hidden: course.isHidden,
            isLocal: course.isLocal,
            isInherited: course.isInherited,
            isOverridden: course.isOverridden,
            isHidden: course.isHidden,
            created_at: course.created_at,
            createdAt: course.created_at,
            created_by: course.creator_first_name
                ? `${course.creator_first_name} ${course.creator_last_name}`
                : course.created_by,
            createdBy: course.creator_first_name
                ? `${course.creator_first_name} ${course.creator_last_name}`
                : course.created_by,
            updated_at: course.updated_at,
            updatedAt: course.updated_at,
            updated_by: course.updater_first_name
                ? `${course.updater_first_name} ${course.updater_last_name}`
                : course.updated_by,
            updatedBy: course.updater_first_name
                ? `${course.updater_first_name} ${course.updater_last_name}`
                : course.updated_by,
        })),
        scope?.page,
        scope?.pageSize,
    );
}

export type GetCoursesServiceResponse = Awaited<ReturnType<typeof getCoursesService>>;
