import { getCoursesData } from './data/get-courses';
import { createCourseData } from './data/create-course';
import { getCourseByCodeData } from './data/get-course-by-code';
import { updateCourseData } from './data/update-course';
import { deleteCourseData } from './data/delete-course';
import { type DbClient } from '@sentinel/db';

export class CourseService {
    static async getCourses(dbClient: DbClient, institutionId: string) {
        const rawCourses = await getCoursesData({ dbClient, institutionId });

        return rawCourses.map((course: any) => ({
            course_id: course.course_id,
            code: course.code,
            title: course.title,
            department_id: course.department_id,
            description: course.description,
            created_at: course.created_at,
            created_by: course.creator_first_name
                ? `${course.creator_first_name} ${course.creator_last_name}`
                : course.created_by,
            updated_at: course.updated_at,
            updated_by: course.updater_first_name
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
        },
    ) {
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
        });
    }

    static async deleteCourse(dbClient: DbClient, id: string) {
        return await deleteCourseData({
            dbClient,
            id,
        });
    }
}
