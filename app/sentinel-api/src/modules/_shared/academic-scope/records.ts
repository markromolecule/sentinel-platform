import { type DbClient } from '@sentinel/db';
import type { CourseScopeRecord, DepartmentScopeRecord, SectionScopeRecord } from './types';

export async function getDepartmentScopeRecord(
    dbClient: DbClient,
    departmentId: string,
): Promise<DepartmentScopeRecord | undefined> {
    return await dbClient
        .selectFrom('departments')
        .select(['department_id', 'institution_id'])
        .where('department_id', '=', departmentId)
        .executeTakeFirst();
}

export async function getCourseScopeRecord(
    dbClient: DbClient,
    courseId: string,
): Promise<CourseScopeRecord | undefined> {
    return await dbClient
        .selectFrom('courses')
        .select(['course_id', 'department_id', 'institution_id'])
        .where('course_id', '=', courseId)
        .executeTakeFirst();
}

export async function getSectionScopeRecord(
    dbClient: DbClient,
    sectionId: string,
): Promise<SectionScopeRecord | undefined> {
    return await dbClient
        .selectFrom('sections')
        .select(['section_id', 'department_id', 'course_id', 'institution_id'])
        .where('section_id', '=', sectionId)
        .executeTakeFirst();
}
