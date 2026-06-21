import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { deleteCoursesData } from '../data/delete-courses';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';

export type DeleteCoursesServiceArgs = {
    dbClient: DbClient;
    ids: string[];
    institutionId?: string;
    actorUserId?: string;
};

/**
 * Bulk-deletes multiple courses by ID. Fires a single activity notification
 * summarising the count of deleted courses.
 * Throws HTTP 409 if any course is referenced by other records.
 */
export async function deleteCoursesService({
    dbClient,
    ids,
    institutionId,
    actorUserId,
}: DeleteCoursesServiceArgs) {
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

export type DeleteCoursesServiceResponse = Awaited<ReturnType<typeof deleteCoursesService>>;
