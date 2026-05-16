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
import { ActivityNotificationService } from '../../general/notification/services/activity-notification.service';

const COURSE_INHERITANCE_CONFIG = {
    table: 'courses',
    idColumn: 'course_id',
    copyColumns: ['code', 'title', 'department_id', 'description', 'created_by', 'updated_by'],
};

function buildCourseLabel(code: string | null | undefined, title: string | null | undefined) {
    if (code && title) {
        return `${code} - ${title}`;
    }

    return title || code || 'Course';
}

export class CourseService {
    private static async getCourseSummaryById(
        dbClient: DbClient,
        id: string,
        institutionId?: string,
    ) {
        let query = dbClient
            .selectFrom('courses')
            .select(['course_id', 'code', 'title', 'institution_id'])
            .where('course_id', '=', id);

        if (institutionId) {
            query = query.where((eb) =>
                eb.or([eb('institution_id', '=', institutionId), eb('institution_id', 'is', null)]),
            );
        }

        return await query.executeTakeFirst();
    }

    static async getCourses(
        dbClient: DbClient,
        institutionId?: string,
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

        const createdCourse = await createCourseData({
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

        if (data.created_by) {
            await ActivityNotificationService.notifyGenericInstitutionActivity({
                dbClient,
                actorUserId: data.created_by,
                institutionId: data.institutionId,
                operation: 'CREATED',
                targetType: 'COURSE',
                targetId: createdCourse.course_id,
                targetLabel: buildCourseLabel(createdCourse.code, createdCourse.title),
                title: 'Course created',
                message: `A course was created: "${buildCourseLabel(createdCourse.code, createdCourse.title)}".`,
                sourceModule: 'courses',
                sourceAction: 'create',
                metadata: {
                    courseId: createdCourse.course_id,
                    courseCode: createdCourse.code,
                },
            });
        }

        return createdCourse;
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

        const updatedCourse = await updateCourseData({
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

        if (data.updated_by && data.institutionId) {
            await ActivityNotificationService.notifyGenericInstitutionActivity({
                dbClient,
                actorUserId: data.updated_by,
                institutionId: data.institutionId,
                operation: 'UPDATED',
                targetType: 'COURSE',
                targetId: updatedCourse.course_id,
                targetLabel: buildCourseLabel(updatedCourse.code, updatedCourse.title),
                title: 'Course updated',
                message: `A course was updated: "${buildCourseLabel(updatedCourse.code, updatedCourse.title)}".`,
                sourceModule: 'courses',
                sourceAction: 'update',
                metadata: {
                    courseId: updatedCourse.course_id,
                    courseCode: updatedCourse.code,
                },
            });
        }

        return updatedCourse;
    }

    static async deleteCourse(
        dbClient: DbClient,
        id: string,
        institutionId?: string,
        actorUserId?: string,
    ) {
        try {
            const existingCourse = await this.getCourseSummaryById(dbClient, id, institutionId);
            const hiddenCourse = await hideInheritedRecord({
                dbClient,
                config: COURSE_INHERITANCE_CONFIG,
                id,
                institutionId,
            });

            if (hiddenCourse) {
                if (actorUserId && institutionId) {
                    await ActivityNotificationService.notifyGenericInstitutionActivity({
                        dbClient,
                        actorUserId,
                        institutionId,
                        operation: 'OVERRIDE_COMPLETED',
                        targetType: 'COURSE',
                        targetId: hiddenCourse.course_id,
                        targetLabel: buildCourseLabel(hiddenCourse.code, hiddenCourse.title),
                        title: 'Course override applied',
                        message: `A course override was applied to "${buildCourseLabel(hiddenCourse.code, hiddenCourse.title)}".`,
                        sourceModule: 'courses',
                        sourceAction: 'hide-inherited',
                        isAdminOverride: true,
                        metadata: {
                            courseId: hiddenCourse.course_id,
                        },
                    });
                }
                return hiddenCourse;
            }

            const deletedCourse = await deleteCourseData({
                dbClient,
                id,
                institutionId,
            });

            if (actorUserId && institutionId) {
                await ActivityNotificationService.notifyGenericInstitutionActivity({
                    dbClient,
                    actorUserId,
                    institutionId,
                    operation: 'DELETED',
                    targetType: 'COURSE',
                    targetId: deletedCourse.course_id,
                    targetLabel: buildCourseLabel(existingCourse?.code, existingCourse?.title),
                    title: 'Course deleted',
                    message: `A course was deleted: "${buildCourseLabel(existingCourse?.code, existingCourse?.title)}".`,
                    sourceModule: 'courses',
                    sourceAction: 'delete',
                    metadata: {
                        courseId: deletedCourse.course_id,
                    },
                });
            }

            return deletedCourse;
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

    static async deleteCourses(
        dbClient: DbClient,
        ids: string[],
        institutionId?: string,
        actorUserId?: string,
    ) {
        try {
            const deletedCourses = await deleteCoursesData({
                dbClient,
                ids,
                institutionId,
            });

            if (actorUserId && institutionId && deletedCourses.length > 0) {
                const label = `${deletedCourses.length} course${deletedCourses.length === 1 ? '' : 's'}`;
                await ActivityNotificationService.notifyGenericInstitutionActivity({
                    dbClient,
                    actorUserId,
                    institutionId,
                    operation: 'DELETED',
                    targetType: 'COURSE',
                    targetLabel: label,
                    title: 'Courses deleted',
                    message: `${label} were deleted.`,
                    sourceModule: 'courses',
                    sourceAction: 'bulk-delete',
                    metadata: {
                        courseIds: deletedCourses.map((course) => course.course_id),
                        count: deletedCourses.length,
                        bulk: true,
                    },
                });
            }

            return deletedCourses;
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
