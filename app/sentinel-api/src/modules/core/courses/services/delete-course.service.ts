import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { deleteCourseData } from '../data/delete-course';
import { hideInheritedRecord } from '../../inheritance/inheritable-write-helper';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { buildCourseLabel, getCourseSummaryById, COURSE_INHERITANCE_CONFIG } from './_utils';

export type DeleteCourseServiceArgs = {
    dbClient: DbClient;
    id: string;
    institutionId?: string;
    actorUserId?: string;
};

/**
 * Deletes a single course by ID. If the course is inherited, it is hidden
 * (override applied) rather than physically deleted.
 * Throws HTTP 409 if the course is referenced by other records.
 */
export async function deleteCourseService({
    dbClient,
    id,
    institutionId,
    actorUserId,
}: DeleteCourseServiceArgs) {
    try {
        const existingCourse = await getCourseSummaryById(dbClient, id, institutionId);
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
                message: 'Cannot delete course because it is currently linked to other records.',
            });
        }
        throw error;
    }
}

export type DeleteCourseServiceResponse = Awaited<ReturnType<typeof deleteCourseService>>;
