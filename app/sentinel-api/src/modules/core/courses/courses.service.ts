import { getCoursesData } from './data/get-courses';
import { createCourseData } from './data/create-course';
import { getCourseByCodeData } from './data/get-course-by-code';
import { updateCourseData } from './data/update-course';
import { deleteCourseData } from './data/delete-course';
import { deleteCoursesData } from './data/delete-courses';
import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { loadEffectiveRows } from '../inheritance/effective-row-loader';
import {
    hideInheritedRecord,
    upsertInheritedOverride,
} from '../inheritance/inheritable-write-helper';

const COURSE_INHERITANCE_CONFIG = {
    table: 'courses',
    idColumn: 'course_id',
    copyColumns: ['code', 'title', 'department_id', 'description', 'created_by', 'updated_by'],
};

export class CourseService {
    static async getCourses(
        dbClient: DbClient,
        institutionId: string,
        search?: string,
        scope?: {
            departmentId?: string;
            courseId?: string;
        },
    ) {
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

        return rawCourses.map((course: any) => ({
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
        }));
    }

    static async createCourse(
        dbClient: DbClient,
        data: {
            code: string;
            title: string;
            institutionId: string;
            department_id?: string | null;
            description?: string | null;
            created_by?: string | null;
        },
    ) {
        const existingCourse = await getCourseByCodeData({
            dbClient,
            code: data.code,
            institutionId: data.institutionId,
        });

        if (existingCourse) {
            throw new Error(`Course with code ${data.code} already exists`);
        }

        return await createCourseData({
            dbClient,
            values: {
                code: data.code,
                title: data.title,
                department_id: data.department_id ?? null,
                description: data.description ?? null,
                created_by: data.created_by ?? null,
                institution_id: data.institutionId,
            },
        });
    }

    static async updateCourse(
        dbClient: DbClient,
        id: string,
        data: {
            code?: string;
            title?: string;
            department_id?: string | null;
            description?: string | null;
            updated_by?: string | null;
            institutionId?: string;
        },
    ) {
        const overrideCourse = await upsertInheritedOverride({
            dbClient,
            config: COURSE_INHERITANCE_CONFIG,
            id,
            institutionId: data.institutionId,
            actorId: data.updated_by,
            values: {
                ...(data.code !== undefined ? { code: data.code } : {}),
                ...(data.title !== undefined ? { title: data.title } : {}),
                ...(data.department_id !== undefined ? { department_id: data.department_id } : {}),
                ...(data.description !== undefined ? { description: data.description } : {}),
                updated_by: data.updated_by,
                updated_at: new Date(),
            },
        });

        if (overrideCourse) {
            return overrideCourse;
        }

        return await updateCourseData({
            dbClient,
            id,
            values: {
                code: data.code,
                title: data.title,
                department_id: data.department_id !== undefined ? data.department_id : null,
                description: data.description ?? null,
                updated_by: data.updated_by,
                updated_at: new Date().toISOString(),
            },
            institutionId: data.institutionId,
        });
    }

    static async deleteCourse(dbClient: DbClient, id: string, institutionId?: string) {
        try {
            const hiddenCourse = await hideInheritedRecord({
                dbClient,
                config: COURSE_INHERITANCE_CONFIG,
                id,
                institutionId,
            });

            if (hiddenCourse) {
                return hiddenCourse;
            }

            return await deleteCourseData({
                dbClient,
                id,
                institutionId,
            });
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            if (code === 'P2003' || code === '23503') {
                throw new HTTPException(409, {
                    message:
                        'Cannot delete course because it is currently linked to other records.',
                });
            }
            throw error;
        }
    }

    static async deleteCourses(dbClient: DbClient, ids: string[], institutionId?: string) {
        try {
            return await deleteCoursesData({
                dbClient,
                ids,
                institutionId,
            });
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            if (code === 'P2003' || code === '23503') {
                throw new HTTPException(409, {
                    message:
                        'Cannot delete one or more courses because they are currently linked to other records.',
                });
            }
            throw error;
        }
    }
}
