import { type DbClient } from '@sentinel/db';
import { updateCourseData } from '../data/update-course';
import { upsertInheritedOverride } from '../../inheritance/inheritable-write-helper';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { buildCourseLabel, COURSE_INHERITANCE_CONFIG } from './_utils';

export type UpdateCourseServiceArgs = {
    dbClient: DbClient;
    id: string;
    data: {
        code?: string;
        title?: string;
        department_id?: string | null;
        description?: string | null;
        updated_by?: string | null;
        institutionId?: string;
    };
};

/**
 * Updates an existing course. Handles inherited-record overrides transparently:
 * if the record is inherited, an override row is upserted instead of mutating
 * the original.
 */
export async function updateCourseService({ dbClient, id, data }: UpdateCourseServiceArgs) {
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

export type UpdateCourseServiceResponse = Awaited<ReturnType<typeof updateCourseService>>;
