import { type DbClient } from '@sentinel/db';
import { getCourseByCodeData } from '../data/get-course-by-code';
import { createCourseData } from '../data/create-course';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { buildCourseLabel } from './_utils';

export type CreateCourseServiceArgs = {
    dbClient: DbClient;
    data: {
        code: string;
        title: string;
        institutionId: string;
        department_id?: string | null;
        description?: string | null;
        created_by?: string | null;
    };
};

/**
 * Creates a new course for the given institution.
 * Throws if a course with the same code already exists.
 */
export async function createCourseService({ dbClient, data }: CreateCourseServiceArgs) {
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

export type CreateCourseServiceResponse = Awaited<ReturnType<typeof createCourseService>>;
